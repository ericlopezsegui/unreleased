'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'

export type MiniInfo = { avatarUrl: string | null; name: string } | null

type HeaderCtx = {
  title: string
  setTitle: (t: string) => void
  backHref: string
  setBackHref: (h: string) => void
  rightActions: ReactNode
  setRightActions: (n: ReactNode) => void
  miniInfo: MiniInfo
  setMiniInfo: (i: MiniInfo) => void
}

const HeaderContext = createContext<HeaderCtx>({
  title: '', setTitle: () => {},
  backHref: '', setBackHref: () => {},
  rightActions: null, setRightActions: () => {},
  miniInfo: null, setMiniInfo: () => {},
})

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('')
  const [backHref, setBackHref] = useState('')
  const [rightActions, setRightActions] = useState<ReactNode>(null)
  const [miniInfo, setMiniInfo] = useState<MiniInfo>(null)

  return (
    <HeaderContext.Provider value={{ title, setTitle, backHref, setBackHref, rightActions, setRightActions, miniInfo, setMiniInfo }}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeaderContext = () => useContext(HeaderContext)
