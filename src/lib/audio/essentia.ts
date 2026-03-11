'use client'

let essentiaInstance: any = null

export async function getEssentia() {
  if (essentiaInstance) return essentiaInstance

  const Essentia = (await import('essentia.js/dist/essentia.js-core.es.js')).default
  const EssentiaWASM = (await import('essentia.js/dist/essentia-wasm.web.js')).default

  const wasmModule = await EssentiaWASM({
    locateFile: (file: string) => {
      // Return the full public path for WASM files
      return `/essentia/${file}`
    },
  })

  essentiaInstance = new Essentia(wasmModule)

  return essentiaInstance
}