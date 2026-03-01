'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useHeaderContext } from '@/lib/header-context'

const AUTH_PREFIXES = ['/login', '/setup', '/onboarding', '/auth', '/invite']

function BackArrow() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { title, backHref, rightActions, miniInfo } = useHeaderContext()

  if (AUTH_PREFIXES.some(p => pathname.startsWith(p))) return null

  const isHome = pathname === '/home'

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', height: 52,
      background: 'rgba(250,250,250,0.72)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '1px solid rgba(0,0,0,0.04)',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <style>{`
        @keyframes hdrIn   { from { opacity:0; transform:translateY(5px)   } to { opacity:1; transform:none } }
        @keyframes miniIn  { from { opacity:0; transform:translateX(-6px) scale(0.94) } to { opacity:1; transform:none } }
        @keyframes logoOut { from { opacity:1 } to { opacity:0 } }

        .hdr-logo  { font-size:11px; font-weight:400; letter-spacing:0.32em; text-transform:uppercase; color:#0f0f0f; animation:hdrIn .2s ease both; }
        .hdr-back  { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; color:#b0b0b0; font-size:12px; font-family:inherit; font-weight:400; padding:0; transition:color .2s; min-width:44px; min-height:44px; }
        .hdr-back:hover { color:#0f0f0f; }
        .hdr-title { font-size:10px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#c0c0c0; animation:hdrIn .22s ease both; }
        .hdr-mini  { display:flex; align-items:center; gap:10px; animation:miniIn .28s cubic-bezier(0.16,1,0.3,1) both; cursor:default; }
        .hdr-mini-av   { width:28px; height:28px; border-radius:50%; object-fit:cover; border:1.5px solid rgba(0,0,0,0.07); flex-shrink:0; display:block; }
        .hdr-mini-av-ph{ width:28px; height:28px; border-radius:50%; background:#efefef; flex-shrink:0; }
        .hdr-mini-name { font-size:13px; font-weight:500; color:#0f0f0f; letter-spacing:-0.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }

        /* Shared action-button styles — set via className by pages */
        .ghost-btn  { display:flex; align-items:center; justify-content:center; width:36px; height:36px; background:none; border:none; cursor:pointer; color:#c0c0c0; border-radius:8px; transition:color .2s, background .2s; }
        .ghost-btn:hover { color:#0f0f0f; background:rgba(0,0,0,0.03); }
        .hdr-new-btn { display:flex; align-items:center; gap:5px; background:#0f0f0f; border:none; cursor:pointer; color:#fff; font-size:11px; font-weight:500; font-family:inherit; padding:7px 14px; border-radius:4px; transition:all .2s; }
        .hdr-new-btn:hover { background:#2a2a2a; transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.1); }
        .hdr-sec-btn { display:flex; align-items:center; gap:5px; background:none; border:1px solid rgba(0,0,0,0.08); cursor:pointer; color:#888; font-size:11px; font-weight:500; font-family:inherit; padding:7px 14px; border-radius:4px; transition:all .2s; }
        .hdr-sec-btn:hover { border-color:rgba(0,0,0,0.15); color:#0f0f0f; background:rgba(255,255,255,0.5); }
      `}</style>

      {/* ── Left ── */}
      <div style={{ flex: '0 0 auto', minWidth: 80, display: 'flex', alignItems: 'center' }}>
        {isHome ? (
          miniInfo ? (
            <div className="hdr-mini" key="mini">
              {miniInfo.avatarUrl
                ? <img src={miniInfo.avatarUrl} alt="" className="hdr-mini-av" />
                : <div className="hdr-mini-av-ph" />}
              <span className="hdr-mini-name">{miniInfo.name}</span>
            </div>
          ) : (
            <span className="hdr-logo" key="logo">unreleased</span>
          )
        ) : (
          <button
            className="hdr-back"
            onClick={() => backHref ? router.push(backHref) : router.back()}
            aria-label="Volver"
          >
            <BackArrow />
          </button>
        )}
      </div>

      {/* ── Centre ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        {!isHome && title && (
          <span className="hdr-title" key={title}>{title}</span>
        )}
      </div>

      {/* ── Right ── */}
      <div style={{ flex: '0 0 auto', minWidth: 80, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        {rightActions}
      </div>
    </div>
  )
}
