import * as React from 'react'

export function usePWAInstall() {
  const [canInstall, setCanInstall] = React.useState(false)
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Check if user has already dismissed it recently
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      if (!dismissed) {
        setCanInstall(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setCanInstall(false)
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    setCanInstall(false)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }

  return { canInstall, install, dismiss }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}

export function useServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [registration, setRegistration] = React.useState<ServiceWorkerRegistration | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg)
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const update = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return { updateAvailable, update }
}
