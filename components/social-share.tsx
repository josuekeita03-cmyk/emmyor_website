"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Linkedin, Share2 } from "lucide-react"

interface SocialShareProps {
  productId: string
  productName: string
  farmerName: string
}

export function SocialShare({ productId, productName, farmerName }: SocialShareProps) {
  const shareUrl = `https://track.emmyor.com/qr/${productId}`
  const shareText = `I just discovered the story behind my ${productName}, produced by ${farmerName} in Morocco! Check it out:`

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Share2 className="h-5 w-5" />
        Share This Product Story
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Help spread the word about sustainable farming and transparent supply chains.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
          onClick={shareOnFacebook}
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-600 border-sky-200"
          onClick={shareOnTwitter}
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
        >
          <Instagram className="h-4 w-4" />
          Instagram
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          onClick={shareOnLinkedIn}
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </Button>

        <Button variant="outline" className="col-span-2 flex items-center gap-2" onClick={copyToClipboard}>
          <Share2 className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
    </div>
  )
}
