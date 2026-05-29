"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, X, Send, Sparkles } from "lucide-react"

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-primary/20">
            <CardHeader className="pb-3 bg-primary rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-base text-primary-foreground">Health Assistant</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Chat Messages */}
              <div className="h-[250px] overflow-y-auto mb-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg rounded-tl-none p-3 text-sm text-foreground">
                    {"Hello! I'm your AI health assistant. How can I help you today? You can ask me about:"}
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Your health risk assessment</li>
                      <li>• Diet and nutrition tips</li>
                      <li>• Exercise recommendations</li>
                      <li>• Understanding your results</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="icon" className="h-9 w-9 flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Open AI assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6" />
        )}
    
      </button>
    </>
  )
}
