'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export const useToast = () => useContext(ToastContext)

let toastFn: (message: string, type?: ToastType) => void = () => {}
export const toast = (message: string, type: ToastType = 'info') => toastFn(message, type)

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  useEffect(() => { toastFn = addToast }, [addToast])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-or shrink-0" />,
  }

  const bg = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-or-pale border-or/30',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right-full ${bg[t.type]}`}>
          {icons[t.type]}
          <p className="text-sm font-medium text-foreground flex-1">{t.message}</p>
          <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      ))}
    </div>
  )
}
