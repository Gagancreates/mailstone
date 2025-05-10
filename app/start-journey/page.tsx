"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useTheme } from "next-themes"

export default function StartJourneyPage(){ 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    goal: "",
    deadline: "",
    frequency: "daily",
    tone: "elon",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'deadline') {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = value.split('-')
      const formattedDate = `${day}/${month}/${year}`
      setFormData((prev) => ({ ...prev, [name]: formattedDate }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFrequencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, frequency: value }))
  }

  const handleToneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tone: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.name || !formData.email || !formData.goal || !formData.deadline) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields.",
      })
      setIsSubmitting(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address.",
      })
      setIsSubmitting(false)
      return
    }

    // Validate deadline format (DD/MM/YYYY)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
    if (!dateRegex.test(formData.deadline)) {
      toast.error("Invalid date format", {
        description: "Please use DD/MM/YYYY format for the deadline.",
      })
      setIsSubmitting(false)
      return
    }

    // Validate that the deadline is in the future
    const [day, month, year] = formData.deadline.split('/').map(Number)
    const deadlineDate = new Date(year, month - 1, day) // month is 0-indexed in JS
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate date comparison

    if (deadlineDate <= today) {
      toast.error("Invalid deadline", {
        description: "Please select a future date for your deadline.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Submitting form data:", formData);
      
      const response = await fetch("/api/submit-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      
      // Try to read the response text first to debug
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      // Then try to parse it as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed response data:", data);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit goal');
      }

      toast.success("Goal submitted!", {
        description: "You'll start receiving motivational emails soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        goal: "",
        deadline: "",
        frequency: "daily",
        tone: "elon",
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Please try again later."
      console.error("Submission error:", error)
      toast.error("Something went wrong", {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen font-sans bg-white dark:bg-slate-900 py-10 sm:py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
        <Link href="/" className="inline-flex items-center text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors group">
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm sm:text-base font-medium">Back to Home</span>
        </Link>
      </div>
      <div className="max-w-3xl w-full mt-12 sm:mt-0">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn} // Using simple fadeIn for initial animation
        >
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Start Your Journey</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Set your goal and get motivated like never before
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700"
          initial="hidden"
          animate="visible"
          variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { ...fadeIn.visible.transition, delay: 0.2 } } }} // Delaying this part slightly
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-900 dark:text-white text-base">
                  Your Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Arjun "
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  aria-label="Your name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-900 dark:text-white text-base">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  aria-label="Your email address"
                />
              </div>

              <div>
                <Label htmlFor="goal" className="text-slate-900 dark:text-white text-base">
                  Your Goal
                </Label>
                <Textarea
                  id="goal"
                  name="goal"
                  placeholder="I want to..."
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  className="mt-1 min-h-[100px]"
                  aria-label="Your goal"
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-slate-900 dark:text-white text-base">
                  Deadline
                </Label>
                {mounted ? (
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline ? new Date(formData.deadline.split('/').reverse().join('-')).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    aria-label="Your deadline"
                  />
                ) : (
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value=""
                    onChange={handleChange}
                    required
                    className="mt-1"
                    aria-label="Your deadline"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="tone" className="text-slate-900 dark:text-white text-base mb-1 block">
                  Who should your emails come from?
                </Label>
                <Select value={formData.tone} onValueChange={handleToneChange}>
                  <SelectTrigger className="w-full" id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elon">Elon Musk</SelectItem>
                    <SelectItem value="jobs">Steve Jobs</SelectItem>
                    <SelectItem value="sam">Sam Altman</SelectItem>
                    <SelectItem value="naval">Naval Ravikant</SelectItem>
                    <SelectItem value="future">Your Future Self</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-900 dark:text-white text-base mb-2 block">Email Frequency</Label>
                <RadioGroup
                  value={formData.frequency}
                  onValueChange={handleFrequencyChange}
                  className="flex flex-col space-y-2"
                >
                  {[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "biweekly", label: "Twice a week" },
                    { value: "monthly", label: "Monthly" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Start Your Goal Journey"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}