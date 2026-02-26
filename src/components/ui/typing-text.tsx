'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const words = ['música', 'creatividad', 'esencia', 'identidad', 'arte']

export function TypingText() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing')
  const wordRef = useRef(words[0])

  useEffect(() => {
    wordRef.current = words[wordIndex]
  }, [wordIndex])

  const tick = useCallback(() => {
    const word = wordRef.current
    if (phase === 'typing') {
      if (displayed.length < word.length) {
        setDisplayed(word.slice(0, displayed.length + 1))
      } else {
        setPhase('pause')
      }
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        setDisplayed(word.slice(0, displayed.length - 1))
      } else {
        setWordIndex((prev) => (prev + 1) % words.length)
        setPhase('typing')
      }
    }
  }, [phase, displayed])

  useEffect(() => {
    if (phase === 'pause') {
      const t = setTimeout(() => setPhase('deleting'), 2400)
      return () => clearTimeout(t)
    }
    const speed = phase === 'deleting' ? 60 : 110
    const t = setTimeout(tick, speed)
    return () => clearTimeout(t)
  }, [tick, phase])

  return (
    <p
      className="leading-relaxed"
      style={{
        fontSize: 'clamp(1.15rem, 2.5vw, 1.65rem)',
        color: '#999',
        fontWeight: 300,
      }}
    >
      Toda tu{' '}
      <span
        style={{
          color: '#0f0f0f',
          fontWeight: 500,
          borderRight: '2px solid #0f0f0f',
          paddingRight: '2px',
          animation: 'blink 1s step-end infinite',
        }}
      >
        {displayed}
      </span>{' '}
      en un solo sitio.
    </p>
  )
}
