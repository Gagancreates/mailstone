"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight,ArrowDown, Check, Mail, Clock, Twitter, Github, Heart, Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  return (
    <main className="min-h-screen font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">mailstone</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </button>
              <Link href="/start-journey" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                Get Started
              </Link>

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center space-x-4">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("features")}
                className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 py-2"
              >
                Features
              </button>
              <Link href="/start-journey" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 py-2" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[10%] w-72 h-72 bg-blue-400/10 dark:bg-blue-400/5 rounded-full filter blur-3xl"></div>
          <div className="absolute right-[15%] bottom-[20%] w-80 h-80 bg-purple-400/10 dark:bg-purple-400/5 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto w-full relative">
          <motion.div className="text-center" initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300"
              variants={fadeIn}
            >
              Emails directly to Your Inbox from Visionaries to Keep You On Track
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto"
              variants={fadeIn}
            >
              Personalized emails from Elon Musk, Steve Jobs, and other visionaries delivered straight to your
              inbox.
            </motion.p>

            <motion.div variants={fadeIn}>
              <Link href="/start-journey">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Set Your Goal Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-16 sm:mt-20 grid md:grid-cols-3 gap-6 sm:gap-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />,
                  title: "Set a goal & deadline",
                  description: "Define what you want to achieve and when you want to achieve it.",
                },
                {
                  icon: <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />,
                  title: "We send CEO-style reminders",
                  description: "Receive motivational emails inspired by leaders like Elon Musk and Steve Jobs.",
                },
                {
                  icon: <Check className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />,
                  title: "You get results—consistently",
                  description: "Stay on track and accomplish your goals with regular motivation.",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all border border-slate-500 dark:border-slate-600"
                  variants={fadeIn}
                >
                  <div className="flex justify-center mb-4 sm:mb-0">{step.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3 text-center">{step.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 text-center">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <ArrowDown className="h-8 w-8 text-slate-400" />
        </motion.div>
      </section>

      {/* Features Section */}
<section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
  <div className="max-w-5xl mx-auto">
    <motion.div
      className="text-center mb-12 sm:mb-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Features</h2>
      <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
        Designed to make goal achievement simple and effective
      </p>
    </motion.div>

    <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
      {[
        {
          title: "No account required",
          description: "Just enter your email and goal. No passwords to remember or accounts to manage.",
        },
        {
          title: "CEO-style motivation",
          description: "Emails crafted in the style of successful leaders to inspire action and results.",
        },
        {
          title: "Flexible frequency",
          description: "Choose daily, weekly, or custom intervals that work best for your schedule.",
        },
        {
          title: "Future Self Persona",
          description: "Opt to receive emails written as if from your successful future self, guiding and motivating you.",
        }
      ].map((feature, index) => (
        <motion.div 
          key={index} 
          className="flex gap-4 items-start" 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="mt-1 bg-blue-600 dark:bg-blue-500 rounded-full p-1 sm:p-1.5 shadow-md">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-1 sm:mb-2">{feature.title}</h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

{/* Footer */}
<footer className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
  <div className="max-w-5xl mx-auto flex flex-col items-center">
    <div className="flex items-center mb-4">
      <p className="text-lg">Built with</p>
      <Heart className="h-5 w-5 mx-2 text-red-500" />
      <p className="text-lg">by Gagan</p>
    </div>

    <div className="flex space-x-4">
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
        <Twitter className="h-6 w-6 text-slate-300 hover:text-white transition-colors" />
      </a>
      <a href="https://github.com/Gagancreates" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <Github className="h-6 w-6 text-slate-300 hover:text-white transition-colors" />
      </a>
    </div>
  </div>
</footer>
    </main>
  )
}