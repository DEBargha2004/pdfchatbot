'use client'

import { ReactNode, useContext, useEffect } from 'react'
import { ThemeProvider } from './ThemeProvider'
import Navbar from './components/custom/Navbar'
import { useFirebase } from './hooks/useFirebase'
import { useAuth, useUser } from '@clerk/nextjs'
import { GlobalAppState } from './context/GlobalAppState'
import { GlobalAppStateType } from './Provider/GlobalAppStateProvider'
import { signInWithCustomToken } from 'firebase/auth'
import { auth, firestoreDB } from '../firebase.config'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { ConversationsHolder } from './types/conversation'

function App ({ children }: { children: ReactNode }) {
  const { setSubscriptionStatus, setConversations } = useContext(
    GlobalAppState
  ) as GlobalAppStateType
  const { includeUser } = useFirebase()
  const { isLoaded, user, isSignedIn } = useUser()
  const { getToken } = useAuth()

  async function authenticateFirebase () {
    const clerkAuthToken = await getToken({ template: 'integration_firebase' })

    await signInWithCustomToken(auth, clerkAuthToken as string)
  }

  useEffect(() => {
    if (user?.id) {
      includeUser({
        user_id: user?.id as string,
        user_email: user?.primaryEmailAddress?.emailAddress as string,
        user_name: user?.fullName as string
      })
        .then(result => {
          setSubscriptionStatus(prev => ({
            ...prev,
            status: result.status,
            plan_id: result.plan_id,
            loaded: true
          }))
        })
        .finally(() => {
          authenticateFirebase()
        })
    }
  }, [user])

  useEffect(() => {
    if (!user?.id) return

    getDocs(
      query(
        collection(firestoreDB, 'conversations'),
        where('u_id', '==', user?.id),
        orderBy('timestamp')
      )
    ).then(snapshots => {
      let docs: ConversationsHolder[] = []
      snapshots.docs.forEach(snapshot => {
        docs.push({
          c_id: snapshot.get('c_id'),
          pdf_id: snapshot.get('pdf_id'),
          messages: [],
          pdf_name: snapshot.get('pdf_name'),
          vector_status: snapshot.get('vector_status')
        })
      })

      setConversations(docs)
    })
  }, [user])
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='dark'
      enableSystem
      disableTransitionOnChange
    >
      <div className='w-full h-full'>
        <Navbar className='h-[10%]' />
        <section className='h-[90%] p-5'>{children}</section>
      </div>
    </ThemeProvider>
  )
}

export default App
