'use client'
import { useEffect } from 'react'

export default function PwaUpdatePrompt() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          alert('A new version is available. Please refresh the page.')
        }
      })
    }
  }, [])

  return null
}

