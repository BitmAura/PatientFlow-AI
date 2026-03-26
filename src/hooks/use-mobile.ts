import * as React from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export function useSwipeGesture(
  ref: React.RefObject<HTMLElement>, 
  handlers: { 
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
  }
) {
  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX
      handleGesture()
    }

    const handleGesture = () => {
      if (touchEndX < touchStartX - 50) {
        handlers.onSwipeLeft?.()
      }
      if (touchEndX > touchStartX + 50) {
        handlers.onSwipeRight?.()
      }
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, handlers])
}

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  
  React.useEffect(() => {
    let startY = 0
    let currentY = 0
    
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (startY > 0) {
        currentY = e.touches[0].clientY
        // Visual indicator logic could go here
      }
    }

    const handleTouchEnd = async () => {
      if (startY > 0 && currentY - startY > 100) {
        setIsRefreshing(true)
        await onRefresh()
        setIsRefreshing(false)
      }
      startY = 0
      currentY = 0
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh])

  return { isRefreshing }
}
