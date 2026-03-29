/**
 * Analytics Tracking for Aura Digital + Aura Recall Integration
 * Comprehensive tracking of cross-service navigation and user behavior
 */

(function() {
  'use strict';

  // Configuration
  const TRACKING_CONFIG = {
    googleAnalyticsId: 'GA_MEASUREMENT_ID', // Replace with your GA4 ID
    debugMode: process.env.NODE_ENV === 'development', // Disabled in production
    trackLocalStorage: true,
    trackSessionStorage: true,
    trackCookies: true
  };

  // Analytics Helper Functions
  const Analytics = {
    // Initialize Google Analytics
    initGA: function() {
      if (typeof gtag === 'undefined') {
        // Load Google Analytics if not already loaded
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_CONFIG.googleAnalyticsId}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', TRACKING_CONFIG.googleAnalyticsId, {
          debug_mode: TRACKING_CONFIG.debugMode
        });
      }
    },

    // Track custom events
    trackEvent: function(eventName, eventData) {
      if (TRACKING_CONFIG.debugMode) {
        console.log(`📊 Analytics Event: ${eventName}`, eventData);
      }

      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
      }

      // Also track to localStorage for debugging
      if (TRACKING_CONFIG.trackLocalStorage) {
        this.storeEvent(eventName, eventData);
      }
    },

    // Store events locally for debugging
    storeEvent: function(eventName, eventData) {
      try {
        const events = JSON.parse(localStorage.getItem('aura_noshow_events') || '[]');
        events.push({
          timestamp: new Date().toISOString(),
          event: eventName,
          data: eventData,
          url: window.location.href,
          userAgent: navigator.userAgent
        });
        localStorage.setItem('aura_noshow_events', JSON.stringify(events));
      } catch (e) {
        if (TRACKING_CONFIG.debugMode) {
          console.warn('Failed to store event:', e);
        }
      }
    },

    // Get stored events
    getStoredEvents: function() {
      try {
        return JSON.parse(localStorage.getItem('aura_noshow_events') || '[]');
      } catch (e) {
        return [];
      }
    },

    // Clear stored events
    clearStoredEvents: function() {
      localStorage.removeItem('aura_noshow_events');
    }
  };

  // User Journey Tracking
  const UserJourney = {
    // Track the user's journey across services
    trackServiceSwitch: function(fromService, toService, method = 'unknown') {
      Analytics.trackEvent('service_switch', {
        'from_service': fromService,
        'to_service': toService,
        'switch_method': method,
        'timestamp': new Date().toISOString(),
        'page_url': window.location.href,
        'referrer': document.referrer
      });

      // Store in session for cross-session tracking
      sessionStorage.setItem('last_service_switch', JSON.stringify({
        from: fromService,
        to: toService,
        timestamp: new Date().toISOString()
      }));
    },

    // Track service selector interactions
    trackServiceSelector: function(action, service = null) {
      Analytics.trackEvent('service_selector_interaction', {
        'action': action,
        'service': service,
        'timestamp': new Date().toISOString(),
        'page_url': window.location.href
      });
    },

    // Track popup interactions
    trackPopup: function(action, popupType = 'service_selector') {
      Analytics.trackEvent('popup_interaction', {
        'popup_type': popupType,
        'action': action, // 'shown', 'clicked', 'closed', 'dismissed'
        'timestamp': new Date().toISOString(),
        'page_url': window.location.href
      });
    },

    // Track combined package interest
    trackCombinedPackage: function(action, service = null) {
      Analytics.trackEvent('combined_package_interaction', {
        'action': action, // 'viewed', 'clicked', 'converted'
        'service': service,
        'timestamp': new Date().toISOString(),
        'page_url': window.location.href
      });
    }
  };

  // Performance Tracking
  const PerformanceTracker = {
    // Track page load times
    trackPageLoad: function() {
      window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        Analytics.trackEvent('page_load_time', {
          'load_time_ms': loadTime,
          'page_url': window.location.href,
          'timestamp': new Date().toISOString()
        });
      });
    },

    // Track toggle interaction timing
    trackToggleTiming: function(action, duration) {
      Analytics.trackEvent('toggle_timing', {
        'action': action,
        'duration_ms': duration,
        'page_url': window.location.href,
        'timestamp': new Date().toISOString()
      });
    },

    // Track service selector engagement time
    trackEngagementTime: function(elementId, startTime) {
      const duration = Date.now() - startTime;
      Analytics.trackEvent('engagement_time', {
        'element': elementId,
        'duration_ms': duration,
        'page_url': window.location.href,
        'timestamp': new Date().toISOString()
      });
    }
  };

  // Conversion Tracking
  const ConversionTracker = {
    // Track conversion funnel
    trackConversionFunnel: function(step, service = null) {
      Analytics.trackEvent('conversion_funnel', {
        'step': step, // 'awareness', 'interest', 'consideration', 'conversion'
        'service': service,
        'timestamp': new Date().toISOString(),
        'page_url': window.location.href
      });
    },

    // Track specific conversions
    trackConversion: function(conversionType, value = null, service = null) {
      Analytics.trackEvent('conversion', {
        'conversion_type': conversionType, // 'signup', 'trial_start', 'purchase', 'contact'
        'value': value,
        'service': service,
        'timestamp': new Date().toISOString(),
        'page_url': window.location.href
      });
    }
  };

  // A/B Testing Helper
  const ABTestHelper = {
    // Simple A/B test assignment
    getVariant: function(testName, variants = ['A', 'B']) {
      const storedVariant = localStorage.getItem(`ab_test_${testName}`);
      if (storedVariant && variants.includes(storedVariant)) {
        return storedVariant;
      }

      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(`ab_test_${testName}`, randomVariant);
      
      Analytics.trackEvent('ab_test_assignment', {
        'test_name': testName,
        'variant': randomVariant,
        'timestamp': new Date().toISOString()
      });

      return randomVariant;
    },

    // Track A/B test results
    trackABTestResult: function(testName, variant, result) {
      Analytics.trackEvent('ab_test_result', {
        'test_name': testName,
        'variant': variant,
        'result': result,
        'timestamp': new Date().toISOString()
      });
    }
  };

  // Real-time Dashboard Data
  const DashboardData = {
    // Get current session data
    getSessionData: function() {
      const sessionData = {
        sessionId: sessionStorage.getItem('session_id') || this.generateSessionId(),
        startTime: sessionStorage.getItem('session_start') || new Date().toISOString(),
        currentService: this.detectCurrentService(),
        serviceSwitches: this.getServiceSwitchCount(),
        popupShown: sessionStorage.getItem('popup_shown') === 'true',
        toggleUsed: sessionStorage.getItem('toggle_used') === 'true'
      };

      return sessionData;
    },

    generateSessionId: function() {
      const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('session_id', sessionId);
      sessionStorage.setItem('session_start', new Date().toISOString());
      return sessionId;
    },

    detectCurrentService: function() {
      const hostname = window.location.hostname;
      if (hostname.includes('auradigitalservices')) return 'aura';
      if (hostname.includes('noshowkiller')) return 'noshow';
      return 'unknown';
    },

    getServiceSwitchCount: function() {
      return parseInt(sessionStorage.getItem('service_switch_count') || '0');
    },

    incrementServiceSwitchCount: function() {
      const current = this.getServiceSwitchCount();
      sessionStorage.setItem('service_switch_count', (current + 1).toString());
    }
  };

  // Initialize Analytics
  function initAnalytics() {
    Analytics.initGA();
    PerformanceTracker.trackPageLoad();
    
    // Track initial page view
    Analytics.trackEvent('page_view', {
      'page_url': window.location.href,
      'service': DashboardData.detectCurrentService(),
      'timestamp': new Date().toISOString()
    });
  }

  // Expose tracking functions globally
  window.AuraNoShowAnalytics = {
    trackServiceSwitch: UserJourney.trackServiceSwitch,
    trackServiceSelector: UserJourney.trackServiceSelector,
    trackPopup: UserJourney.trackPopup,
    trackCombinedPackage: UserJourney.trackCombinedPackage,
    trackToggleTiming: PerformanceTracker.trackToggleTiming,
    trackEngagementTime: PerformanceTracker.trackEngagementTime,
    trackConversionFunnel: ConversionTracker.trackConversionFunnel,
    trackConversion: ConversionTracker.trackConversion,
    getABTestVariant: ABTestHelper.getVariant,
    trackABTestResult: ABTestHelper.trackABTestResult,
    getSessionData: DashboardData.getSessionData,
    getStoredEvents: Analytics.getStoredEvents,
    clearStoredEvents: Analytics.clearStoredEvents
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }

})();