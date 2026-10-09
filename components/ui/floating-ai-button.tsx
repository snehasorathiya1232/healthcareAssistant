"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, X, Send, Sparkles, User, Loader2 } from "lucide-react"

interface ChatMessage {
  id: string
  sender: "bot" | "user"
  text: string
  time: string
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Hello! I'm HealthPredict AI, your personal healthcare assistant. How can I help you today? You can ask me about blood pressure, diabetes, heart health, BMI, or healthy diet tips.",
    time: "Just now",
  },
]

const quickPrompts = [
  "How to lower blood pressure?",
  "Normal blood sugar levels?",
  "Tips for healthy heart",
  "What is a healthy BMI?",
]

function getAIHealthResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes("blood pressure") || q.includes("bp") || q.includes("hypertension")) {
    return "Normal blood pressure is typically below 120/80 mmHg. To keep blood pressure healthy: 1) Reduce dietary sodium (< 2,300 mg/day), 2) Exercise moderately for 30 minutes daily, 3) Increase potassium-rich foods (bananas, spinach), 4) Manage stress and get 7–8 hours of quality sleep. If systolic is consistently ≥ 140, consult a doctor."
  }

  if (q.includes("sugar") || q.includes("glucose") || q.includes("diabetes")) {
    return "Normal fasting blood sugar is between 70 to 99 mg/dL. 100–125 mg/dL indicates prediabetes, and ≥ 126 mg/dL may suggest diabetes. To manage sugar levels: focus on high-fiber foods, avoid refined sugars and sugary drinks, stay physically active, and monitor levels routinely."
  }

  if (q.includes("heart") || q.includes("cardiac") || q.includes("cholesterol")) {
    return "For a healthy cardiovascular system: 1) Maintain LDL cholesterol below 100 mg/dL, 2) Exercise regularly (aerobic walking or swimming), 3) Eat heart-healthy fats (nuts, seeds, olive oil, fish), 4) Strictly avoid smoking and limit alcohol. Immediate severe chest pain or shortness of breath requires emergency care."
  }

  if (q.includes("bmi") || q.includes("weight") || q.includes("obese")) {
    return "BMI (Body Mass Index) assesses weight relative to height: Underweight is < 18.5, Normal weight is 18.5–24.9, Overweight is 25–29.9, and Obese is ≥ 30. Maintaining a BMI between 18.5 and 24.9 significantly lowers risks of diabetes, hypertension, and joint problems."
  }

  if (q.includes("diet") || q.includes("food") || q.includes("eat") || q.includes("nutrition")) {
    return "A balanced protective diet consists of: 50% vegetables and fruits, 25% whole grains (brown rice, oats, whole wheat), and 25% lean proteins (lentils, paneer, fish, beans). Drink at least 2–3 liters of water daily and minimize ultra-processed foods."
  }

  if (q.includes("exercise") || q.includes("workout") || q.includes("walk")) {
    return "The WHO recommends at least 150 minutes of moderate-intensity physical activity (like brisk walking, cycling, or swimming) per week, plus strength exercises twice weekly. Even a 20-minute daily walk makes a huge difference in insulin sensitivity and mood!"
  }

  if (q.includes("headache") || q.includes("pain") || q.includes("chest") || q.includes("emergency")) {
    return "If you are experiencing severe sudden chest pain, breathing difficulty, dizziness, or loss of consciousness, please seek immediate emergency medical care. Antigravity Health Assistant provides educational insights and does not substitute for emergency medical care."
  }

  return "Thank you for asking! Maintaining health comes down to consistency: balanced nutrition rich in fresh plants and lean protein, 150 minutes of weekly movement, restful sleep, and regular preventative screenings. You can also run our full Health Assessment on the predict page to get tailored disease predictions!"
}

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text) return

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text,
      time: now,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage("")
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = getAIHealthResponse(text)
      const botMsg: ChatMessage = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Card className="border-primary/20 overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Header */}
            <CardHeader className="py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-white">
                    HealthPredict AI
                  </CardTitle>
                  <p className="text-[11px] text-teal-100 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Online Healthcare Assistant
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="p-3 flex-1 overflow-y-auto space-y-3 bg-muted/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card text-foreground border border-border rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1.5 text-right ${
                        msg.sender === "user" ? "text-primary-foreground/75" : "text-muted-foreground"
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>

                  {msg.sender === "user" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 items-center text-xs text-muted-foreground pl-9">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  HealthPredict is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-card border-t border-border flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground border border-border/60"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-card border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Ask health or medical question..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => handleSend()}
                disabled={!inputMessage.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Open AI health assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </>
  )
}
