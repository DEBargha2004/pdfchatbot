import { FieldValue } from 'firebase/firestore'

export type ConversationInfo = {
  u_id: string
  c_id: string
  pdf_id: string
  pdf_name?: string
  s_id: string
  timestamp: FieldValue
  vector_status: 'loading' | 'failure' | 'success'
}

export type ConversationsHolder = {
  c_id: string
  pdf_id: string
  pdf_name: string
  vector_status: 'loading' | 'success' | 'failure' | null
  messages: Message[]
}

export type Message = {
  m_id?: string
  role?: 'ai' | 'human'
  value?: string
  c_id?: string
  u_id?: string
  pdf_id: string
  timestamp?:
    | {
        seconds: Number
      }
    | FieldValue
    | Date
  source?: []
}
