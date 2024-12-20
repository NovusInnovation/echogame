"use client"

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Route } from 'lucide-react'
import { Button } from '../components/ui/button'

export default function StartPage() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Route className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Echo</h1>
          <p className="text-xl text-gray-400">Where Your Decisions Shape the Future</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-lg">
            As the leader of a nation in crisis, you stand at the precipice of change. 
            Your country teeters on the brink, and every decision you make will echo through time, 
            shaping the destiny of your people and the world around you.
          </p>
          <p className="text-lg">
            Will you prioritize the environment, bolster the economy, strengthen your military, 
            or focus on social reforms? Be warned: each choice carries unforeseen consequences 
            that may return to challenge you in unexpected ways.
          </p>
          <p className="text-lg font-semibold">
            Swipe left or right to make your decisions, but remember: 
            in the game of power, there are no easy choices.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            asChild
            className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link href="/game">
              <motion.span
                initial={false}
                animate={isHovered ? { y: -5 } : { y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                Begin Your Reign
              </motion.span>
            </Link>
          </Button>
        </motion.div>
        <footer>
          <a target="_blank" rel="nonoopener noreferrer" href="https://echogame.xyz/privacy">
            Privacy Policy
          </a>
        </footer>
      </div>
    </div>
  )
}

