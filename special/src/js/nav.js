/**
 * Todo:
 * - add throttle
 * - add section watcher
 */
(function(){
  // passive event polyfill
  let passiveArg = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {passiveArg = {passive: true}}
    })
    window.addEventListener("test", null, opts)
  } catch (e) {}


  // nodes and listeners
  const nav = document.getElementById('nav')
  let limit = calcScrollLimit(),
      shouldWatchScroll = true

  window.addEventListener('scroll', handleScroll, passiveArg)
  window.addEventListener('resize', handleWindowResize)
  nav.addEventListener('click', handleLinkClick)


  // hadlers
  function handleLinkClick(e) {
    const link = e.target.closest('a')
    if (!link) return
    
    e.preventDefault()
    const sectionName = link.getAttribute('href').replace('#', '')
    const section = document.getElementById(sectionName)
    scrollToSection(section)
  }

  function handleScroll(e) {
    if (window.scrollY >= limit) nav.classList.add('is-fixed')
    else nav.classList.remove('is-fixed')

    if (!shouldWatchScroll) return
    // watch for section change...
  }

  function handleWindowResize() {
    limit = calcScrollLimit()
  }


  // main logic
  function scrollToSection(section) {
    if (!section) return
    shouldWatchScroll = false

    window.scrollTo({ 
      top: getElementOffsetTop(section), 
      behavior: 'smooth' 
    })
    
    setTimeout(() => {
      shouldWatchScroll = true
      location.hash = sectionName
    }, 500)
  }


  // helpers
  function calcScrollLimit() {
    const node = document.getElementById('pain')
    return getElementOffsetTop(node)
  }

  function getElementOffsetTop(node) {
    const rect = node.getBoundingClientRect()
    return rect.top + window.pageYOffset
  }
}())