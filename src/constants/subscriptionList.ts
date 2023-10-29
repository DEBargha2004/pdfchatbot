import { Subscription } from '@/types/payment'

export const subscriptionsList: Subscription[] = [
  {
    id: 'basic',
    heading: 'Basic Plan',
    price: 4.99,
    frequency: 'month',
    currency_symbol: '₹',
    currency_shorthand: 'inr',
    features: [
      'Upload and analyze up to 10 PDF documents per month',
      'Basic question generation and answer extraction'
    ]
  },
  {
    id: 'pro',
    heading: 'Pro Plan',
    price: 9.99,
    frequency: 'month',
    currency_symbol: '₹',
    currency_shorthand: 'inr',
    features: [
      'All features from the Basic Plan',
      'Increased document upload limit (up to 50 PDFs per month)',
      'Advanced question generation and answer extraction capabilities'
    ]
  },
  {
    id: 'bussiness',
    heading: 'Bussiness Plan',
    price: 29.99,
    frequency: 'month',
    currency_symbol: '₹',
    currency_shorthand: 'inr',
    features: [
      'All features from the Pro Plan',
      'Unlimited PDF document uploads and analysis'
    ]
  }
]
