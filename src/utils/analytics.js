/**
 * Google Analytics Utility
 * Provides methods for tracking events, button clicks, navigation, and custom interactions
 */

const GA_TRACKING_ID = 'G-YBS7BM1ECZ'

/**
 * Route name to page title mapping
 */
const ROUTE_PAGE_TITLES = {
  'CMP': 'CMP',
}

/**
 * Route name to screen class mapping (for GA4)
 */
const ROUTE_SCREEN_CLASSES = {
  'CMP': 'CMP',
}

/**
 * Get page title from route name or path
 * @param {string} routeName - Route name
 * @param {string} routePath - Route path
 * @returns {string} - Formatted page title
 */
function getPageTitle(routeName, routePath) {
  if (routeName && ROUTE_PAGE_TITLES[routeName]) {
    return `Solve Ninja - ${ROUTE_PAGE_TITLES[routeName]}`
  }
  
  // Fallback: format path
  const pathName = routePath === '/' ? 'Home' : routePath.replace('/', '').replace(/^./, str => str.toUpperCase())
  return `Solve Ninja - ${pathName}`
}

/**
 * Get screen class from route name or path
 * @param {string} routeName - Route name
 * @param {string} routePath - Route path
 * @returns {string} - Screen class name
 */
function getScreenClass(routeName, routePath) {
  if (routeName && ROUTE_SCREEN_CLASSES[routeName]) {
    return ROUTE_SCREEN_CLASSES[routeName]
  }
  
  // Fallback: format path
  return routePath === '/' ? 'Home' : routePath.replace('/', '').replace(/^./, str => str.toUpperCase())
}

/**
 * Check if we're on the production domain (solveninja.org)
 * @returns {boolean} - True if on production domain
 */
function isProductionDomain() {
  if (typeof window === 'undefined') {
    return false
  }
  
  const hostname = window.location.hostname
  
  // Only track on production domain (solveninja.org)
  // Exclude dev instances (dev.solveninja.org, localhost, etc.)
  return hostname === 'solveninja.org' || hostname === 'www.solveninja.org'
}

/**
 * Check if Google Analytics (gtag) is available and we're on production
 * @returns {boolean} - True if gtag is available and on production domain
 */
function isGtagAvailable() {
  // Only enable tracking on production domain
  if (!isProductionDomain()) {
    return false
  }
  
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Track a custom event in Google Analytics
 * @param {string} eventName - The name of the event (e.g., 'button_click', 'form_submit')
 * @param {Object} eventParams - Additional parameters for the event
 * @param {string} eventParams.event_category - Category of the event
 * @param {string} eventParams.event_label - Label for the event
 * @param {string|number} eventParams.value - Optional value associated with the event
 * @param {string} eventParams.action - Action taken (e.g., 'click', 'submit')
 * @param {string} eventParams.location - Location where event occurred (e.g., 'header', 'footer', 'home_page')
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!isGtagAvailable()) {
    // console.warn('Google Analytics (gtag) is not available')
    return
  }

  try {
    window.gtag('event', eventName, {
      ...eventParams,
      // Ensure common parameters are included
      event_category: eventParams.event_category || 'general',
      event_label: eventParams.event_label || eventName,
    })
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

/**
 * Track a button click event
 * @param {string} buttonName - Name/identifier of the button
 * @param {Object} options - Additional options
 * @param {string} options.location - Location where button is located (e.g., 'header', 'hero', 'footer')
 * @param {string} options.action - Action description (e.g., 'login', 'signup', 'cta_click')
 * @param {string} options.page - Current page/route
 */
export function trackButtonClick(buttonName, options = {}) {
  trackEvent('button_click', {
    event_category: 'engagement',
    event_label: buttonName,
    action: options.action || 'click',
    location: options.location || 'unknown',
    page: options.page || window.location.pathname,
    button_name: buttonName,
  })
}

/**
 * Track navigation/link clicks
 * @param {string} linkText - Text or identifier of the link
 * @param {string} destination - Destination URL or route
 * @param {Object} options - Additional options
 * @param {string} options.location - Location where link is located
 * @param {string} options.link_type - Type of link (e.g., 'internal', 'external', 'navigation')
 */
export function trackNavigation(linkText, destination, options = {}) {
  trackEvent('navigation_click', {
    event_category: 'navigation',
    event_label: linkText,
    action: 'navigate',
    location: options.location || 'unknown',
    link_type: options.link_type || 'internal',
    destination: destination,
    page: options.page || window.location.pathname,
  })
}

/**
 * Track page view (useful for programmatic navigation)
 * @param {string} pagePath - Path of the page
 * @param {string|Object} routeInfo - Route name (string) or route object with name and path
 * @param {string} routeInfo.name - Route name (if object)
 * @param {string} routeInfo.path - Route path (if object)
 */
export function trackPageView(pagePath, routeInfo = null) {

  if (!isGtagAvailable()) {
    return
  }

  try {
    // Extract route name and path from routeInfo
    let routeName = null
    if (typeof routeInfo === 'string') {
      routeName = routeInfo
    } else if (routeInfo && typeof routeInfo === 'object') {
      routeName = routeInfo.name
      pagePath = routeInfo.path || pagePath
    }

    // Generate proper page title and screen class
    const pageTitle = getPageTitle(routeName, pagePath)
    const screenClass = getScreenClass(routeName, pagePath)

    // Update document.title so Google Analytics picks it up
    if (typeof document !== 'undefined') {
      document.title = pageTitle
    }

    const config = {
      page_path: pagePath,
      page_title: pageTitle,
      screen_class: screenClass,
    }
    
    window.gtag('config', GA_TRACKING_ID, config)
  } catch (error) {
    console.error('Error tracking page view:', error)
  }
}

/**
 * Track form submissions
 * @param {string} formName - Name/identifier of the form
 * @param {Object} options - Additional options
 * @param {string} options.location - Location where form is located
 * @param {boolean} options.success - Whether form submission was successful
 */
export function trackFormSubmit(formName, options = {}) {
  trackEvent('form_submit', {
    event_category: 'engagement',
    event_label: formName,
    action: 'submit',
    location: options.location || 'unknown',
    success: options.success || false,
    form_name: formName,
  })
}

/**
 * Track social media link clicks
 * @param {string} platform - Social media platform (e.g., 'facebook', 'twitter', 'instagram')
 * @param {string} url - URL of the social media link
 */
export function trackSocialClick(platform, url) {
  trackEvent('social_click', {
    event_category: 'social',
    event_label: platform,
    action: 'click',
    platform: platform,
    url: url,
  })
}

/**
 * Track CTA (Call-to-Action) button clicks
 * @param {string} ctaName - Name/identifier of the CTA
 * @param {Object} options - Additional options
 * @param {string} options.variant - CTA variant (e.g., 'default', 'mentor', 'journey')
 * @param {string} options.location - Location where CTA is located
 * @param {string} options.page - Current page/route
 */
export function trackCTA(ctaName, options = {}) {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: ctaName,
    action: 'cta_click',
    location: options.location || 'unknown',
    variant: options.variant || 'default',
    page: options.page || window.location.pathname,
    cta_name: ctaName,
  })
}

/**
 * Track user authentication events
 * @param {string} action - Authentication action (e.g., 'login', 'logout', 'signup')
 * @param {Object} options - Additional options
 * @param {boolean} options.success - Whether the action was successful
 */
export function trackAuth(action, options = {}) {
  trackEvent('auth', {
    event_category: 'authentication',
    event_label: action,
    action: action,
    success: options.success || false,
  })
}

/**
 * Track external link clicks
 * @param {string} linkText - Text or identifier of the link
 * @param {string} url - External URL
 * @param {Object} options - Additional options
 * @param {string} options.location - Location where link is located
 */
export function trackExternalLink(linkText, url, options = {}) {
  trackEvent('external_link_click', {
    event_category: 'outbound',
    event_label: linkText,
    action: 'click',
    location: options.location || 'unknown',
    url: url,
  })
}

/**
 * Track search events (if applicable)
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional options
 * @param {number} options.resultCount - Number of results (optional)
 */
export function trackSearch(searchTerm, options = {}) {
  trackEvent('search', {
    event_category: 'engagement',
    event_label: searchTerm,
    action: 'search',
    search_term: searchTerm,
    result_count: options.resultCount || 0,
  })
}

/**
 * Track video play events (if applicable)
 * @param {string} videoName - Name/identifier of the video
 * @param {Object} options - Additional options
 * @param {string} options.location - Location where video is located
 */
export function trackVideoPlay(videoName, options = {}) {
  trackEvent('video_play', {
    event_category: 'media',
    event_label: videoName,
    action: 'play',
    location: options.location || 'unknown',
    video_name: videoName,
  })
}

/**
 * Export default object with all tracking methods for convenience
 */
export default {
  trackEvent,
  trackButtonClick,
  trackNavigation,
  trackPageView,
  trackFormSubmit,
  trackSocialClick,
  trackCTA,
  trackAuth,
  trackExternalLink,
  trackSearch,
  trackVideoPlay,
  isGtagAvailable,
}

