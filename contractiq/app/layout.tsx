import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContractIQ — Understand any NDA or MSA in minutes',
  description:
    'AI-assisted NDA and MSA review for SMBs and freelancers. Extract key terms with page-level attribution and confidence scores, then chat with your contract — grounded strictly in the document.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
