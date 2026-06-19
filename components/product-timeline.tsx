"use client"

import { useState } from "react"
import { Truck, Factory, Flame, Droplet, Package, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineItem {
  stage: string
  date: string
  details: string
  type: "reception" | "processing" | "packaging"
}

interface ProductTimelineProps {
  timeline: TimelineItem[]
}

export function ProductTimeline({ timeline }: ProductTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "reception":
        return <Truck className="h-6 w-6" />
      case "processing":
        if (timeline[timeline.findIndex((item) => item.type === type)].stage.includes("ROASTING")) {
          return <Flame className="h-6 w-6" />
        } else if (timeline[timeline.findIndex((item) => item.type === type)].stage.includes("MIXING")) {
          return <Droplet className="h-6 w-6" />
        } else {
          return <Factory className="h-6 w-6" />
        }
      case "packaging":
        return <Package className="h-6 w-6" />
      default:
        return <Factory className="h-6 w-6" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "reception":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "processing":
        if (timeline[timeline.findIndex((item) => item.type === type)].stage.includes("ROASTING")) {
          return "bg-orange-100 text-orange-700 border-orange-200"
        } else if (timeline[timeline.findIndex((item) => item.type === type)].stage.includes("MIXING")) {
          return "bg-purple-100 text-purple-700 border-purple-200"
        } else {
          return "bg-green-100 text-green-700 border-green-200"
        }
      case "packaging":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-gray-200 transform -translate-x-1/2"></div>

      <div className="space-y-8">
        {timeline.map((item, index) => (
          <div key={index} className="relative">
            <div className="flex items-center mb-4">
              <div
                className={cn(
                  "absolute left-4 md:left-1/2 w-10 h-10 rounded-full flex items-center justify-center transform -translate-x-1/2",
                  getColor(item.type),
                )}
              >
                {getIcon(item.type)}
              </div>

              <div className={cn("ml-16 md:ml-0 md:w-1/2 md:pr-8 md:text-right", index % 2 === 1 ? "md:ml-auto" : "")}>
                <h3 className="text-lg font-bold">{item.stage}</h3>
                <time className="text-sm text-muted-foreground">{item.date}</time>
              </div>
            </div>

            <div
              className={cn(
                "ml-16 md:ml-0 md:w-1/2 p-4 rounded-lg border transition-all duration-200",
                getColor(item.type),
                index % 2 === 1 ? "md:ml-auto" : "md:mr-auto",
                expandedItems[index] ? "opacity-100" : "opacity-80 hover:opacity-100",
              )}
            >
              <div className="flex justify-between items-center">
                <p className={expandedItems[index] ? "" : "line-clamp-2"}>{item.details}</p>
                <button onClick={() => toggleItem(index)} className="ml-2 p-1 rounded-full hover:bg-white/20">
                  {expandedItems[index] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
