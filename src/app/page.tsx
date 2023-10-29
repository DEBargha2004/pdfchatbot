'use client'

import { GlobalAppStateType } from '@/Provider/GlobalAppStateProvider'
import ChatOverview from '@/components/custom/ChatOverview'
import { Button } from '@/components/ui/button'
import { GlobalAppState } from '@/context/GlobalAppState'
import axios from 'axios'
import { uploadBytes, ref as firebaseStorageRef } from 'firebase/storage'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import SparkMD5 from 'spark-md5'
import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { firestoreDB, storageDB } from '../../firebase.config'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { ConversationsHolder } from '@/types/conversation'

async function generateFileHash (file: File) {
  const buffer = await file.arrayBuffer()
  const hex = SparkMD5.ArrayBuffer.hash(buffer)
  return hex
}

export default function Home () {
  const {
    subscriptionStatus,
    setPdfInfo,
    pdfInfo,
    conversations,
    setConversations
  } = useContext(GlobalAppState) as GlobalAppStateType

  // const [chatId] = useState<string>(crypto.randomUUID())
  const { user } = useUser()
  const router = useRouter()

  async function handlePDFChange (e: ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0]
    if (!file) return

    setPdfInfo({ name: file?.name, loading: true })

    const hashId = await generateFileHash(file)
    console.log(hashId)

    const storageRef = firebaseStorageRef(storageDB, hashId)
    //@ts-ignore
    await uploadBytes(storageRef, file)

    try {
      const response = await axios.post('/api/createConversation', {
        hashId,
        name: file?.name
      })
      const { data } = response
      if (data.status === 'success') {
        setConversations(prev => [
          ...prev,
          {
            c_id: data.c_id,
            messages: [],
            pdf_id: hashId,
            pdf_name: file?.name,
            vector_status: 'loading'
          }
        ])
        router.push(`chat/${data.c_id}`)
        setPdfInfo(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <main className=''>
      {subscriptionStatus.loaded ? (
        subscriptionStatus.status === 'active' ? (
          <section className='flex gap-5 flex-wrap'>
            <div className='w-fit'>
              <input
                type='file'
                hidden
                id='chat_overview'
                onChange={handlePDFChange}
              />
              <label htmlFor='chat_overview' className='w-fit'>
                <ChatOverview loading={pdfInfo.loading} />
              </label>
            </div>
            {conversations.map(conversation => {
              return (
                <div key={conversation.c_id} className='w-fit'>
                  <Link
                    key={conversation.c_id}
                    href={`chat/${conversation.c_id}`}
                  >
                    <ChatOverview
                      key={conversation.c_id}
                      name={conversation.pdf_name}
                      c_id={conversation.c_id}
                    />
                  </Link>
                </div>
              )
            })}
          </section>
        ) : (
          <Link href={'/pricing'}>
            <Button>Subscribe</Button>
          </Link>
        )
      ) : (
        <Loader2 className=' animate-spin' />
      )}
    </main>
  )
}
