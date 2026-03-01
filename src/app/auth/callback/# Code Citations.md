# Code Citations

## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08
```


## License: MIT
https://github.com/TheOnlyBeardedBeast/lucide-icons-react/blob/0a39021bb8d72ac85b408c6b5437a8405df9171e/src/icons/Settings.js

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08
```


## License: MIT
https://github.com/andromedaprotocol/design-system/blob/b11d0c705373a91e4c8bdf32437449870abf9baa/packages/icons/src/Settings.tsx

```


Voy a rediseñar completamente la home con un enfoque donde todo fluye de forma integrada, sin cards ni separaciones visibles. La foto del artista se integra como un gradiente sutil en el fondo. Todo respira minimalismo extremo.

### src/app/home/page.tsx

````tsx
// filepath: c:\Users\lopez\Desktop\personal\unreleased\src\app\home\page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }

/* ── icons ─────────────────────────────────────────── */
const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08
```

