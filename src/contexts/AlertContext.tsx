import React, { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { Snackbar, Alert, IconButton, Typography } from '@mui/material'
import { IoClose } from 'react-icons/io5'
import '../styles/GlobalAlert.css'

type AlertType = 'success' | 'error'

type AlertPayload = {
  type: AlertType
  title?: string
  message: string
  onClose?: () => void
}

type AlertContextValue = {
  showAlert: (payload: AlertPayload) => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

export const useAlert = (): AlertContextValue => {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within AlertProvider')
  return ctx
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<AlertType>('success')
  const [title, setTitle] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState('')
  const onCloseRef = useRef<(() => void) | null>(null)
  const timerRef = useRef<number | null>(null)

  const showAlert = (payload: AlertPayload) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    onCloseRef.current = payload.onClose ?? null
    setType(payload.type)
    setTitle(payload.title)
    setMessage(payload.message)
    setOpen(true)
    timerRef.current = window.setTimeout(() => {
      setOpen(false)
      if (onCloseRef.current) onCloseRef.current()
    }, 10000)
  }

  const handleClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setOpen(false)
    if (onCloseRef.current) onCloseRef.current()
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleClose}
      >
        <Alert
          icon={false}
          severity={type === 'success' ? 'success' : 'error'}
          variant="filled"
          className={`global-feedback-toast global-feedback-toast--${type}`}
          action={
            <IconButton
              size="small"
              className="global-feedback-close"
              aria-label="Cerrar mensaje"
              onClick={handleClose}
            >
              <IoClose />
            </IconButton>
          }
        >
          {title && (
            <Typography className="global-feedback-title">{title}</Typography>
          )}
          <Typography className="global-feedback-text">{message}</Typography>
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  )
}
