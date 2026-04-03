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
  const isRefreshing = React.useRef(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    let regRef: ServiceWorkerRegistration | null = null

    const handleControllerChange = () => {
      if (isRefreshing.current) return
      isRefreshing.current = true
      window.location.reload()
    }

    const handleUpdateFound = () => {
      const newWorker = regRef?.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setUpdateAvailable(true)
        }
      })
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    const setupServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        regRef = reg
        setRegistration(reg)

        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true)
        }

        reg.addEventListener('updatefound', handleUpdateFound)
        void reg.update()
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error)
      }
    }

    void setupServiceWorker()

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      regRef?.removeEventListener('updatefound', handleUpdateFound)
    }
  }, [])

  const update = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      return
    }

    void registration?.update()
  }

  return { updateAvailable, update }
}
