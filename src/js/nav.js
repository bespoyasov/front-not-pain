/**
 * TODO: 
 * - add active link change in nav
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
  const sections = document.getElementsByClassName('section')
  const nav = document.getElementById('nav')
  
  let shouldWatchScroll = true
  let limit, offsets, pageMaxScroll
  updateHeightDependent()

  window.addEventListener('scroll', handleScroll, passiveArg)
  window.addEventListener('resize', updateHeightDependent)
  nav.addEventListener('click', handleLinkClick)


  // hadlers
  function handleLinkClick(e) {
    const link = e.target.closest('a')
    if (!link) return
    
    e.preventDefault()
    const sectionName = link.getAttribute('href').replace('#', '')
    scrollToSection(sectionName)
  }

  function handleScroll() {
    if (window.scrollY >= limit) nav.classList.add('is-fixed')
    else nav.classList.remove('is-fixed')

    if (!shouldWatchScroll) return
    const section = findCurrentSection()
    const id = section ? section.getAttribute('id') : null
    if (id) silentlyChangeHash(id)
  }


  // main logic
  function scrollToSection(sectionName) {
    const section = document.getElementById(sectionName)
    if (!section || !sectionName) return

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

  function findCurrentSection() {
    const sct = window.scrollY
    return offsets.reduce((section, offset, index) =>
      offset <= sct ? sections[index] : section, null)
  }


  // helpers
  function calcScrollLimit() {
    const node = document.getElementById('pain')
    return getElementOffsetTop(node)
  }

  function getElementOffsetTop(node) {
    if (!node) return 0
    const rect = node.getBoundingClientRect()
    return rect.top + window.pageYOffset
  }

  function updateSectionOffsets() {
    return Array.from(sections).map(node => 
      getElementOffsetTop(node))
  }

  function updatepageMaxScroll() {
    return document.body.offsetHeight - window.innerHeight
  }

  function silentlyChangeHash(newHash) {
    const sct = window.scrollY
    location.hash = newHash
    
    // let overscroll in mac os
    if (sct > 0 && sct < pageMaxScroll) {
      window.scrollTo(0, sct)
    }
  }

  function updateHeightDependent() {
    limit = calcScrollLimit()
    offsets = updateSectionOffsets()
    pageMaxScroll = updatepageMaxScroll()
  }

}())