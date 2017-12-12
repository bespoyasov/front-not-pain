/**
 * Todo:
 * - add throttle
 * - add section watcher
 */
(function(){
  // passive event polyfill
  let supportsPassive = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() { supportsPassive = true }
    })
    window.addEventListener("test", null, opts)
  } catch (e) {}


  // basic
  const nav = document.getElementById('nav')
  let limit = calcScrollLimit(),
      shouldWatchScroll = true

  window.addEventListener('scroll', handleScroll, !supportsPassive ? false : { 
    passive: true 
  })

  window.addEventListener('resize', handleWindowResize)
  nav.addEventListener('click', handleLinkClick)


  function handleScroll (e) {
    if (window.scrollY >= limit) nav.classList.add('is-fixed')
    else nav.classList.remove('is-fixed')

    if (!shouldWatchScroll) return
    // watch for section change
  }

  function handleWindowResize() {
    limit = calcScrollLimit()
  }

  function handleLinkClick(e) {
    const link = e.target.closest('a')
    if (!link) return
    
    e.preventDefault()
    const sectionName = link.getAttribute('href').replace('#', '')
    const section = document.getElementById(sectionName)
    if (!section) return

    // for link to change immediatelly and not to flash on scroll
    shouldWatchScroll = false

    const offset = getElementOffsetTop(section)
    window.scrollTo({ top: offset, behavior: 'smooth' })
    
    setTimeout(() => {
      shouldWatchScroll = true
      location.hash = sectionName
    }, 500)
  }


  function calcScrollLimit() {
    const node = document.getElementById('pain')
    return getElementOffsetTop(node)
  }

  function getElementOffsetTop(node) {
    const rect = node.getBoundingClientRect()
    return rect.top + window.pageYOffset
  }
}())