import { Pinecone } from '@pinecone-database/pinecone'

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENV
})

const pineconeIndex = pinecone.index('pdf-chatbot')

export { pineconeIndex }
