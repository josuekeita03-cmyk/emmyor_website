import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/auth/auth-provider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="scroll-smooth" dir="ltr">
      <body className={inter.className}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.app'
};
