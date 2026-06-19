"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HandHeart } from "lucide-react"

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  farmerId: string
  farmerName: string
}

export function DonationModal({ isOpen, onClose, farmerId, farmerName }: DonationModalProps) {
  const [amount, setAmount] = useState<string>("100")
  const [customAmount, setCustomAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real app, you would submit to a payment gateway here
    console.log({
      farmerId,
      amount: amount === "custom" ? customAmount : amount,
      message,
    })

    setIsSubmitting(false)
    onClose()

    // Show success message
    alert(`Thank you for your donation of ${amount === "custom" ? customAmount : amount} DH to ${farmerName}!`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-green-600" />
            Support {farmerName}
          </DialogTitle>
          <DialogDescription>
            Lahcen's family farm in Souss Massa uses organic methods to grow argan and almonds. Your donation will help
            upgrade their irrigation system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Donation Amount (DH)</Label>
            <RadioGroup value={amount} onValueChange={setAmount} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="50" id="amount-50" />
                <Label htmlFor="amount-50">50 DH</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="100" id="amount-100" />
                <Label htmlFor="amount-100">100 DH</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="200" id="amount-200" />
                <Label htmlFor="amount-200">200 DH</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="amount-custom" />
                <Label htmlFor="amount-custom">Custom Amount</Label>
                {amount === "custom" && (
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="ml-2 w-24"
                  />
                )}
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the farmer"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400">
              Your contribution will empower {farmerName.split(" ")[0]}'s community! 100% of your donation goes directly
              to the farmer.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || (amount === "custom" && !customAmount)}
            >
              {isSubmitting ? "Processing..." : "Support This Farmer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
