import { getSubscriptionData } from '@/functions/getSubscriptionData'
import { Message } from '@/types/conversation'
import { SubscriptionInfo } from '@/types/payment'
import { getAuth } from '@clerk/nextjs/server'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { firestoreDB } from '../../../../firebase.config'
import { BufferMemory } from 'langchain/memory'
import { FirestoreChatMessageHistory } from 'langchain/stores/message/firestore'
import admin from 'firebase-admin'
import { RunnableSequence } from 'langchain/schema/runnable'
import { formatDocumentsAsString } from 'langchain/util/document'
import { BaseMessage } from 'langchain/schema'
import { LLMChain } from 'langchain/chains'
import { HfInference } from '@huggingface/inference'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PromptTemplate } from 'langchain/prompts'
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf'
import { pineconeIndex } from '@/pinecone'
import { HuggingFaceInference } from 'langchain/llms/hf'

const em2 = 'BAAI/bge-small-en-v1.5'

const hfe = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: em2
})

export async function POST (request: NextRequest) {
  const { userId } = getAuth(request)
  if (!userId) return NextResponse.json({ success: false })

  const subscriptionData: SubscriptionInfo = await getSubscriptionData({
    userId
  })
  //   console.log(request)

  if (subscriptionData.status !== 'active')
    return NextResponse.json({ success: false })

  const message: Message = await request.json()

  console.log(message, userId, subscriptionData)

  await setDoc(doc(firestoreDB, `messages/${message.m_id}`), {
    ...message,
    timestamp: serverTimestamp()
  })

  const Pstore = new PineconeStore(hfe, {
    pineconeIndex: pineconeIndex,
    namespace: message.pdf_id
  })

  const retriever = Pstore.asRetriever()

  const memory = new BufferMemory({
    memoryKey: 'chatHistory',
    inputKey: 'question', // The key for the input to the chain
    outputKey: 'text', // The key for the final conversational output of the chain
    returnMessages: true // If using with a chat model (e.g. gpt-3.5 or gpt-4)
  })

  const serializeChatHistory = (chatHistory: Array<BaseMessage>): string =>
    chatHistory
      .map(chatMessage => {
        if (chatMessage._getType() === 'human') {
          return `Human: ${chatMessage.content}`
        } else if (chatMessage._getType() === 'ai') {
          return `Assistant: ${chatMessage.content}`
        } else {
          return `${chatMessage.content}`
        }
      })
      .join('\n')

  /**
   * Create two prompt templates, one for answering questions, and one for
   * generating questions.
   */
  const questionPrompt = PromptTemplate.fromTemplate(
    `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.While answering only provide the answer that is asked for and donot mention any question and their respective answers.
  ----------
  CONTEXT: {context}
  ----------
  CHAT HISTORY: {chatHistory}
  ----------
  QUESTION: {question}
  ----------
  Helpful Answer:`
  )
  const questionGeneratorTemplate = PromptTemplate.fromTemplate(
    `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
  ----------
  CHAT HISTORY: {chatHistory}
  ----------
  FOLLOWUP QUESTION: {question}
  ----------
  Standalone question:`
  )

  // Initialize fast and slow LLMs, along with chains for each

  const hfModel = new HuggingFaceInference({
    apiKey: process.env.HF_API_KEY,
    model: 'mistralai/Mistral-7B-v0.1',
    maxTokens: 300
  })

  const fasterChain = new LLMChain({
    llm: hfModel,
    prompt: questionGeneratorTemplate
  })

  const slowerChain = new LLMChain({
    llm: hfModel,
    prompt: questionPrompt
  })

  const performQuestionAnswering = async (input: {
    question: string
    chatHistory: Array<BaseMessage> | null
    context: Array<Document>
  }): Promise<{ result: string; sourceDocuments: Array<Document> }> => {
    let newQuestion = input.question
    // Serialize context and chat history into strings
    //@ts-ignore
    const serializedDocs = formatDocumentsAsString(input.context)
    const chatHistoryString = input.chatHistory
      ? serializeChatHistory(input.chatHistory)
      : null

    if (chatHistoryString) {
      // Call the faster chain to generate a new question
      const { text } = await fasterChain.invoke({
        chatHistory: chatHistoryString,
        context: serializedDocs,
        question: input.question
      })

      newQuestion = text
    }

    const response = await slowerChain.invoke({
      chatHistory: chatHistoryString ?? '',
      context: serializedDocs,
      question: newQuestion
    })

    console.log(response.text)

    // Save the chat history to memory
    await memory.saveContext(
      {
        question: input.question
      },
      {
        text: response.text
      }
    )

    return {
      result: response.text,
      sourceDocuments: input.context
    }
  }

  const chain = RunnableSequence.from([
    {
      // Pipe the question through unchanged
      question: (input: { question: string }) => input.question,
      // Fetch the chat history, and return the history or null if not present
      chatHistory: async () => {
        const savedMemory = await memory.loadMemoryVariables({})
        const hasHistory = savedMemory.chatHistory.length > 0
        return hasHistory ? savedMemory.chatHistory : null
      },
      // Fetch relevant context based on the question
      context: async (input: { question: string }) =>
        retriever.getRelevantDocuments(input.question)
    },
    performQuestionAnswering
  ])

  const { result, sourceDocuments } = await chain.invoke({
    question: message.value
  })

  const response: Message = {
    pdf_id: message.pdf_id,
    c_id: message.c_id,
    m_id: crypto.randomUUID(),
    u_id: userId,
    role: 'ai',
    timestamp: new Date(),
    value: result,
    source: sourceDocuments.map(sourceDocument => ({
      pageContent: sourceDocument.pageContent,
      metadata: sourceDocument.metadata
    }))
  }

  console.log(response)

  await setDoc(doc(firestoreDB, `messages/${response.m_id}`), {
    ...response,
    timestamp: serverTimestamp()
  })
  const stream = await chain.stream({
    question: message.value
  })

  let streamedResult = ''

  for await (const chunk of stream) {
    streamedResult += chunk
    console.log(chunk)
  }

  return NextResponse.json({ ...response })
}
