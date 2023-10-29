'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import axios from 'axios'
import { ChevronDown, ChevronUp, Loader2, XCircle } from 'lucide-react'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Document, Page as DocPage } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'
import { cn } from '@/lib/utils'
import { ref as firebaseStorageRef, getDownloadURL } from 'firebase/storage'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { firestoreDB, storageDB } from '../../../../firebase.config'
import { GlobalAppState } from '@/context/GlobalAppState'
import { GlobalAppStateType } from '@/Provider/GlobalAppStateProvider'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore'
import { Input } from '@/components/ui/input'
import { Message } from '@/types/conversation'
import { cloneDeep } from 'lodash'
import { useUser } from '@clerk/nextjs'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

function Page ({ params }) {
  const chatId = params.chatId

  const { pdfInfo, setPdfInfo, conversations, setConversations } = useContext(
    GlobalAppState
  ) as GlobalAppStateType

  const [pages, setPages] = useState<number>(0)
  const [pageNum, setPageNum] = useState<number>(1)
  const { ref, width, height } = useResizeDetector()
  const [chatLoader, setChatLoader] = useState({
    loading: false,
    status: false
  })
  const [question, setQuestion] = useState('')
  const [responseWaiting, setResponseWaiting] = useState(false)
  let vectorizing = false

  const { user } = useUser()

  function handleChangePage (val: number) {
    let expectedPageNum = pageNum + val
    if (expectedPageNum <= pages && expectedPageNum > 0) {
      setPageNum(expectedPageNum)
    }
  }

  function handleDocumentLoadSuccess ({ numPages }: { numPages: number }) {
    setPages(numPages)
  }
  async function vaidateConversation () {
    if (vectorizing) return
    vectorizing = true
    const c_info = await getDoc(doc(firestoreDB, `conversations/${chatId}`))
    if (c_info.exists()) {
      setChatLoader({ loading: true })
      const pdf_id = c_info.get('pdf_id')
      const vector_status = c_info.get('vector_status')
      const url = await getDownloadURL(firebaseStorageRef(storageDB, pdf_id))

      setPdfInfo(prev => ({ ...prev, url, id: pdf_id }))

      if (vector_status === 'loading') {
        let response = await axios.post('/api/addToVectorDB', {
          hashId: pdf_id,
          conversation_id: chatId
        })

        setChatLoader({ loading: false, status: response.data.success })
      } else if (vector_status === 'success') {
        const messagesSnapshots = await getDocs(
          query(
            collection(firestoreDB, 'messages'),
            where('c_id', '==', chatId),
            where('u_id', '==', user?.id),
            orderBy('timestamp')
          )
        )

        setChatLoader({ loading: false, status: true })
        let docs = []

        messagesSnapshots.forEach(snapshot => {
          docs.push(snapshot.data())
        })

        setConversations(prev => {
          prev = cloneDeep(prev)
          let conversation = prev.find(
            conversation => conversation.c_id === chatId
          )
          conversation.messages = docs
          return prev
        })
      } else {
        setChatLoader({ loading: false, status: false })
      }

      vectorizing = false
    }
  }

  async function submitMessage () {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) return

    setQuestion('')

    const message: Message = {
      m_id: crypto.randomUUID(),
      c_id: chatId,
      role: 'human',
      timestamp: new Date(),
      value: trimmedQuestion,
      pdf_id: pdfInfo.id,
      u_id: user?.id
    }
    setConversations(prev => {
      prev = cloneDeep(prev)

      let conversation = prev.find(conversation => conversation.c_id === chatId)
      conversation?.messages?.push(message)

      return prev
    })

    // console.log(message)
    setResponseWaiting(true)

    let { data }: { data: Message } = await axios.post('/api/chat', message)

    setConversations(prev => {
      prev = cloneDeep(prev)

      let conversation = prev.find(conversation => conversation.c_id === chatId)
      conversation?.messages.push(data)

      console.log(data)

      return prev
    })

    setResponseWaiting(false)
  }

  useEffect(() => {
    if (!user?.id) return
    vaidateConversation()
  }, [user])

  return (
    <>
      {pdfInfo.url ? (
        <div className='flex'>
          <Button
            onClick={() => handleChangePage(-1)}
            variant={'outline'}
            className='px-2'
          >
            <ChevronDown />
          </Button>
          <div>
            {pageNum}/{pages}
          </div>
          <Button
            onClick={() => handleChangePage(1)}
            variant={'outline'}
            className='px-2'
          >
            <ChevronUp />
          </Button>
        </div>
      ) : null}

      <div className='flex justify-between gap-3 h-full'>
        <Card
          className={cn(
            'w-1/3 min-w-fit h-full flex flex-col justify-start items-center border-accent border rounded-lg'
          )}
          ref={ref}
        >
          <Document
            file={pdfInfo.url}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={<Loader2 className='animate-spin' />}
          >
            <DocPage
              pageNumber={pageNum}
              height={height || 1}
              // width={width || 1}
            />
          </Document>
        </Card>

        <Card className='h-full w-2/3 '>
          {/* {chatLoader ? <Loader2 className='animate-spin' /> : null} */}
          <div className='h-[90%] w-full overflow-y-auto'>
            {conversations
              .find(conversation => conversation.c_id === chatId)
              ?.messages?.map(message => {
                return (
                  <div key={message.m_id} className='my-3'>
                    {message.role} : {message.value}
                  </div>
                )
              })}
            {responseWaiting ? (
              <div className='flex items-baseline gap-2'>
                ai :
                <div className='p-3 px-6 rounded-xl bg-[#ffffff33]  w-fit'>
                  ...
                </div>
              </div>
            ) : null}
            {chatLoader.loading ? (
              <div className='flex h-full justify-center items-center'>
                <Loader2 className='animate-spin h-8' />
              </div>
            ) : chatLoader.status ? null : (
              <div className='flex h-full justify-center items-center'>
                <XCircle />
              </div>
            )}
          </div>
          <div className='h-[10%] w-full flex items-center'>
            <Input
              type='text'
              className=' h-full'
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <Button
              className='h-full'
              disabled={
                chatLoader.loading ||
                !chatLoader.status ||
                !Boolean(question.trim())
              }
              onClick={submitMessage}
            >
              Submit
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

export default Page
