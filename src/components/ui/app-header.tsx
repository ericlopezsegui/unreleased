'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useHeaderContext } from '@/lib/header-context'

const AUTH_PREFIXES = ['/login', '/setup', '/onboarding', '/auth', '/invite']
const TAB_PATHS = ['/home', '/tracks', '/albums', '/profile']

function BackArrow() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { title, backHref, rightActions, miniInfo } = useHeaderContext()

  if (AUTH_PREFIXES.some(p => pathname.startsWith(p))) return null

  const isTabPage = TAB_PATHS.includes(pathname)
  const isHome = pathname === '/home'

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', height: 56,
      background: 'rgba(250,250,250,0.72)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <style>{`
        @keyframes hdrIn   { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
        @keyframes miniIn  { from { opacity:0; transform:translateX(-6px) scale(0.94) } to { opacity:1; transform:none } }

        .hdr-page-title { font-size:18px; font-weight:600; color:#0f0f0f; letter-spacing:-0.025em; animation:hdrIn .22s ease both; line-height:1; }
        .hdr-back  { display:flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; color:#0f0f0f; font-size:13px; font-family:inherit; font-weight:400; padding:0; transition:color .15s; min-width:44px; min-height:44px; }
        .hdr-back:active { opacity:0.5; }
        .hdr-sub-title { font-size:15px; font-weight:600; letter-spacing:-0.02em; color:#0f0f0f; animation:hdrIn .22s ease both; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .hdr-mini  { display:flex; align-items:center; gap:10px; animation:miniIn .28s cubic-bezier(0.16,1,0.3,1) both; cursor:default; }
        .hdr-mini-av   { width:28px; height:28px; border-radius:50%; object-fit:cover; border:1.5px solid rgba(0,0,0,0.07); flex-shrink:0; display:block; }
        .hdr-mini-av-ph{ width:28px; height:28px; border-radius:50%; background:#efefef; flex-shrink:0; }
        .hdr-mini-name { font-size:14px; font-weight:600; color:#0f0f0f; letter-spacing:-0.015em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:170px; }

        /* Shared action-button styles — set via className by pages */
        .ghost-btn  { display:flex; align-items:center; justify-content:center; width:36px; height:36px; background:none; border:none; cursor:pointer; color:#999; border-radius:10px; transition:color .15s, background .15s; }
        .ghost-btn:hover { color:#0f0f0f; background:rgba(0,0,0,0.04); }
        .ghost-btn:active { transform:scale(0.92); }
        .hdr-new-btn { display:flex; align-items:center; gap:5px; background:#0f0f0f; border:none; cursor:pointer; color:#fff; font-size:12px; font-weight:500; font-family:inherit; padding:8px 16px; border-radius:20px; transition:all .15s; }
        .hdr-new-btn:hover { background:#2a2a2a; }
        .hdr-new-btn:active { transform:scale(0.96); }
        .hdr-sec-btn { display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.04); border:none; cursor:pointer; color:#666; font-size:12px; font-weight:500; font-family:inherit; padding:8px 16px; border-radius:20px; transition:all .15s; }
        .hdr-sec-btn:hover { background:rgba(0,0,0,0.07); color:#0f0f0f; }
        .hdr-sec-btn:active { transform:scale(0.96); }
      `}</style>

      {/* ── Left ── */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
        {isHome ? (
          miniInfo ? (
            <div className="hdr-mini" key="mini">
              {miniInfo.avatarUrl
                ? <img src={miniInfo.avatarUrl} alt="" className="hdr-mini-av" />
                : <div className="hdr-mini-av-ph" />}
              <span className="hdr-mini-name">{miniInfo.name}</span>
            </div>
          ) : (
            <span className="hdr-page-title" key="logo">unreleased</span>
          )
        ) : isTabPage ? (
          <span className="hdr-page-title" key={title}>{title || pathname.slice(1)}</span>
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

      {/* ── Centre — only for sub-pages ── */}
      {!isTabPage && !isHome && title && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', overflow: 'hidden', maxWidth: '50%' }}>
          <span className="hdr-sub-title" key={title}>{title}</span>
        </div>
      )}

      {/* ── Right ── */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        {rightActions}
      </div>
    </div>
  )
}
