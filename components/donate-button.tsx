"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HandHeart } from "lucide-react"
import { DonationModal } from "@/components/donation-modal"

interface DonateButtonProps {
  farmerId: string
  farmerName: string
}

export function DonateButton({
  farmerId,
  farmerName,
  genericLabel = false,
}: DonateButtonProps & { genericLabel?: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
        <HandHeart className="h-4 w-4" />
        {genericLabel ? "Donate to your farmers" : `Donate to ${farmerName.split(" ")[0]}`}
      </Button>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farmerId={farmerId}
        farmerName={farmerName}
      />
    </>
  )
}
