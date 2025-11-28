import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
// <CHANGE> Import AuthProvider
import { AuthProvider } from "@/lib/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // <CHANGE> Update metadata for TalentBase
  title: "TalentBase - Conectando Talentos e Oportunidades",
  description: "Plataforma de busca e divulgação de vagas de emprego",
  icons: {
    icon: [
      {
        url: "/talent_base_icon.png",

      },
    ],
    apple: "/talent_base_icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        {/* <CHANGE> Wrap app with AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
