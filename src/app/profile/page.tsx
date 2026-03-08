'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { usePrefetchStore } from '@/stores/prefetch-store'

const ico: Record<string, string[]> = {
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  edit:   ['M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5Z'],
  check:  ['M20 6L9 17l-5-5'],
}

function Ic({ n, s = 16, c = 'currentColor' }: { n: string; s?: number; c?: string }) {
  const p = ico[n]
  if (!p) return null
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {p.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

export default function ProfilePage() {
  const ready = usePrefetchStore(s => s.ready)
  const storeProfile = usePrefetchStore(s => s.profile)
  const storeArtist = usePrefetchStore(s => s.artist)
  const storeAvatarUrl = usePrefetchStore(s => s.avatarUrl)
  const storeArtistAvatarUrl = usePrefetchStore(s => s.artistAvatarUrl)
  const storeEmail = usePrefetchStore(s => s.email)

  // Edit states
  const [editName, setEditName] = useState('')
  const [editArtistName, setEditArtistName] = useState('')
  const [editHandle, setEditHandle] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const supabase = createClient()
  const { setTitle } = useHeaderContext()

  useEffect(() => {
    setTitle('Perfil')
    return () => { setTitle('') }
  }, [])

  // Populate edit fields from store
  useEffect(() => {
    if (!ready) return
    setEditName(storeProfile?.display_name ?? '')
    if (storeArtist) {
      setEditArtistName(storeArtist.name ?? '')
      setEditHandle(storeArtist.handle ?? '')
      setEditBio(storeArtist.bio ?? '')
    }
  }, [ready, storeProfile, storeArtist])

  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let newAvatarPath = storeProfile?.avatar_path ?? null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop() ?? 'jpg'
      const path = `user/${user.id}/avatar-${Date.now()}.${ext}`
      await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      newAvatarPath = path
    }

    await supabase.from('profiles').update({
      display_name: editName.trim() || null,
      avatar_path: newAvatarPath,
    }).eq('user_id', user.id)

    usePrefetchStore.getState().setProfile({ display_name: editName.trim() || null, avatar_path: newAvatarPath })
    if (avatarFile && avatarPreview) usePrefetchStore.getState().setAvatarUrl(avatarPreview)

    if (storeArtist) {
      await supabase.from('artists').update({
        name: editArtistName.trim() || storeArtist.name,
        handle: editHandle.trim() || null,
        bio: editBio.trim() || null,
      }).eq('id', storeArtist.id)
      usePrefetchStore.getState().setArtist({ name: editArtistName.trim() || storeArtist.name, handle: editHandle.trim() || null, bio: editBio.trim() || null })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!ready) return (
    <div className="prof-loader-wrap">
      <div className="prof-loader" />
      <style>{profileStyles}</style>
    </div>
  )

  const displayAvatar = avatarPreview ?? storeAvatarUrl ?? storeArtistAvatarUrl
  const initial = (editName || storeProfile?.display_name || '?')[0].toUpperCase()

  return (
    <div className="prof-page">
      <style>{profileStyles}</style>

      {/* ── Avatar section ── */}
      <section className="prof-avatar-section">
        <div className="prof-avatar-wrap" onClick={() => avatarRef.current?.click()}>
          {displayAvatar ? (
            <img src={displayAvatar} alt="" className="prof-avatar" />
          ) : (
            <div className="prof-avatar-ph">{initial}</div>
          )}
          <div className="prof-avatar-overlay">
            <Ic n="edit" s={16} c="#fff" />
          </div>
        </div>
        <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
        <h2 className="prof-display-name">{editName || 'Tu nombre'}</h2>
        {storeEmail && <p className="prof-email">{storeEmail}</p>}
      </section>

      {/* ── Personal info ── */}
      <section className="prof-section">
        <p className="prof-section-label">Datos personales</p>
        <div className="prof-field">
          <label className="prof-field-label">Nombre</label>
          <input className="prof-field-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div className="prof-field">
          <label className="prof-field-label">Email</label>
          <div className="prof-field-static">{storeEmail ?? '—'}</div>
        </div>
      </section>

      {/* ── Artist info ── */}
      {storeArtist && (
        <section className="prof-section">
          <p className="prof-section-label">Artista</p>
          <div className="prof-field">
            <label className="prof-field-label">Nombre artístico</label>
            <input className="prof-field-input" value={editArtistName} onChange={e => setEditArtistName(e.target.value)} placeholder="Nombre del artista" />
          </div>
          <div className="prof-field">
            <label className="prof-field-label">Handle</label>
            <div className="prof-handle-input-wrap">
              <span className="prof-handle-at">@</span>
              <input className="prof-field-input prof-handle-input" value={editHandle} onChange={e => setEditHandle(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))} placeholder="handle" />
            </div>
          </div>
          <div className="prof-field">
            <label className="prof-field-label">Bio</label>
            <textarea className="prof-field-textarea" value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Escribe algo sobre ti o tu proyecto..." rows={3} />
          </div>
        </section>
      )}

      {/* ── Save button ── */}
      <section className="prof-section">
        <button className={`prof-save-btn${saved ? ' saved' : ''}`} onClick={handleSave} disabled={saving}>
          {saving ? (
            <span className="prof-spinner" />
          ) : saved ? (
            <><Ic n="check" s={14} c="#fff" /> Guardado</>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </section>

      {/* ── Logout ── */}
      <section className="prof-section prof-section-last">
        <button className="prof-logout" onClick={signOut}>
          <Ic n="logout" s={16} c="#e05050" />
          <span>Cerrar sesión</span>
        </button>
      </section>
    </div>
  )
}

const profileStyles = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

  .prof-loader-wrap { min-height: 100dvh; display: flex; align-items: center; justify-content: center; }
  .prof-loader { width: 18px; height: 18px; border: 1.5px solid #eee; border-top-color: #0f0f0f; border-radius: 50%; animation: spin .7s linear infinite; }

  .prof-page {
    min-height: 100dvh; font-family: 'Outfit', -apple-system, system-ui, sans-serif;
    background: transparent; padding: 56px 0 140px; overflow-x: hidden;
  }

  /* ── Avatar section ── */
  .prof-avatar-section {
    display: flex; flex-direction: column; align-items: center;
    padding: 32px 24px 20px;
    animation: fadeUp .5s cubic-bezier(0.16,1,0.3,1) both;
  }
  .prof-avatar-wrap {
    position: relative; width: 80px; height: 80px; border-radius: 50%;
    overflow: hidden; cursor: pointer; flex-shrink: 0; background: #f0f0f0;
    margin-bottom: 14px;
  }
  .prof-avatar { width: 100%; height: 100%; object-fit: cover; display: block; }
  .prof-avatar-ph {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 600; color: #999; background: #f0f0f0;
  }
  .prof-avatar-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .2s;
  }
  .prof-avatar-wrap:hover .prof-avatar-overlay { opacity: 1; }
  .prof-display-name {
    font-size: 20px; font-weight: 600; color: #0f0f0f; margin: 0;
    letter-spacing: -0.02em; line-height: 1.2; text-align: center;
  }
  .prof-email { font-size: 12px; color: #999; margin: 4px 0 0; }

  /* ── Sections ── */
  .prof-section {
    max-width: 560px; margin: 0 auto; padding: 0 24px 24px;
    animation: fadeUp .5s cubic-bezier(0.16,1,0.3,1) .06s both;
  }
  .prof-section-last { padding-top: 8px; }
  .prof-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
    color: #999; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.04);
  }

  /* ── Fields ── */
  .prof-field { margin-bottom: 16px; }
  .prof-field-label {
    display: block; font-size: 11px; font-weight: 500; color: #888; margin-bottom: 6px;
  }
  .prof-field-input {
    width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.06);
    background: rgba(255,255,255,0.6); backdrop-filter: blur(6px); font-size: 14px;
    font-family: inherit; outline: none; box-sizing: border-box; border-radius: 6px;
    transition: border-color .2s, box-shadow .2s; color: #0f0f0f;
  }
  .prof-field-input:focus { border-color: rgba(0,0,0,0.15); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
  .prof-field-textarea {
    width: 100%; padding: 10px 14px; border: 1px solid rgba(0,0,0,0.06);
    background: rgba(255,255,255,0.6); backdrop-filter: blur(6px); font-size: 14px;
    font-family: inherit; outline: none; box-sizing: border-box; border-radius: 6px;
    transition: border-color .2s; color: #0f0f0f; resize: vertical; min-height: 72px;
  }
  .prof-field-textarea:focus { border-color: rgba(0,0,0,0.15); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
  .prof-field-static {
    padding: 10px 14px; border: 1px solid rgba(0,0,0,0.03); background: rgba(0,0,0,0.02);
    border-radius: 6px; font-size: 14px; color: #777;
  }
  .prof-handle-input-wrap {
    display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.06);
    background: rgba(255,255,255,0.6); backdrop-filter: blur(6px); border-radius: 6px;
    overflow: hidden; transition: border-color .2s;
  }
  .prof-handle-input-wrap:focus-within { border-color: rgba(0,0,0,0.15); box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
  .prof-handle-at { padding: 10px 0 10px 14px; font-size: 14px; color: #aaa; pointer-events: none; }
  .prof-handle-input { border: none !important; background: none !important; padding-left: 4px !important; backdrop-filter: none !important; }
  .prof-handle-input:focus { box-shadow: none !important; }

  /* ── Save ── */
  .prof-save-btn {
    width: 100%; padding: 13px; background: #0f0f0f; color: #fff; border: none;
    cursor: pointer; font-size: 13px; font-weight: 500; font-family: inherit;
    border-radius: 6px; transition: all .2s; display: flex; align-items: center;
    justify-content: center; gap: 8px;
  }
  .prof-save-btn:hover { background: #2a2a2a; }
  .prof-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .prof-save-btn.saved { background: #22c55e; }
  .prof-spinner {
    width: 14px; height: 14px; border: 1.5px solid rgba(255,255,255,0.3); border-top-color: #fff;
    border-radius: 50%; display: inline-block; animation: spin .7s linear infinite;
  }

  /* ── Logout ── */
  .prof-logout {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 14px 0; background: none; border: none;
    border-top: 1px solid rgba(0,0,0,0.04);
    cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; color: #e05050;
    transition: opacity .15s;
  }
  .prof-logout:hover { opacity: 0.7; }
`
