// src/lib/debug/client-log.ts
type LogLevel = 'log' | 'warn' | 'error'

export async function clientLog(
  level: LogLevel,
  scope: string,
  message: string,
  data?: unknown
) {
  try {
    await fetch('/api/client-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        scope,
        message,
        data,
      }),
      keepalive: true,
    })
  } catch {
    // silencio: no queremos romper la app por el logger
  }
}

export const clog = {
  log: (scope: string, message: string, data?: unknown) =>
    clientLog('log', scope, message, data),
  warn: (scope: string, message: string, data?: unknown) =>
    clientLog('warn', scope, message, data),
  error: (scope: string, message: string, data?: unknown) =>
    clientLog('error', scope, message, data),
}