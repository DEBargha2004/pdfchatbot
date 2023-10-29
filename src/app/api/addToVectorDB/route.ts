import { ref, getDownloadURL } from 'firebase/storage'
import { NextRequest, NextResponse } from 'next/server'
import { firestoreDB, storageDB } from '../../../../firebase.config'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { HuggingFaceInferenceEmbeddings } from 'langchain/embeddings/hf'
import { getAuth } from '@clerk/nextjs/server'
import { getSubscriptionData } from '@/functions/getSubscriptionData'
import { SubscriptionInfo } from '@/types/payment'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { pineconeIndex } from '@/pinecone'
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore'
import { ConversationInfo } from '@/types/conversation'
import { HfInference } from '@huggingface/inference'

const em1 = 'sentence-transformers/all-MiniLM-L6-v2'
const em2 = 'BAAI/bge-small-en-v1.5'

const hf = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: em2
})

export async function POST (request: NextRequest) {
  const { userId } = getAuth(request)
  if (!userId) return NextResponse.json({ success: false })

  const subscriptionData: SubscriptionInfo = await getSubscriptionData({
    userId
  })

  if (subscriptionData.status !== 'active')
    return NextResponse.json({ success: false })

  const { hashId, conversation_id } = await request.json()

  console.log(hashId)

  console.log('file fetching started')

  const storageRef = ref(storageDB, hashId)

  let url = await getDownloadURL(storageRef)

  const response = await fetch(url)
  const blob = await response.blob()

  console.log('file fetching ended')

  try {
    const loader = new PDFLoader(blob)
    const pageLevelDocs = await loader.load()
    const pageAmnt = pageLevelDocs.length

    if (pageAmnt > 20) {
      await updateDoc(doc(firestoreDB, `conversations/${conversation_id}`), {
        vector_status: 'failure'
      })
      return NextResponse.json({ success: false, message: 'file to long' })
    }

    console.log('storing in vectorstore started')
    await PineconeStore.fromDocuments(pageLevelDocs, hf, {
      pineconeIndex,
      namespace: hashId
    })

    await updateDoc(doc(firestoreDB, `conversations/${conversation_id}`), {
      vector_status: 'success'
    })
  } catch (error) {
    await updateDoc(doc(firestoreDB, `conversations/${conversation_id}`), {
      vector_status: 'failure'
    })

    return NextResponse.json({ succes: false })
  }

  console.log('storing in vectorstore ended')

  return NextResponse.json({ success: true })
}
