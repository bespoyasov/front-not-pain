(function(){
  // passive event polyfill
  let passiveArg = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {passiveArg = {passive: true}}
    })
    window.addEventListener('test', null, opts)
  } catch (e) {}


  // nodes and listeners
  const SECTIONS_CLSNM = 'section'
  const FIXED_CLSNM = 'is-fixed'
  const ACTIVE_LINK_CLSNM = 'is-active'
  const ACTIVE_LINK_QUERY = `.nav a.${ACTIVE_LINK_CLSNM}`
  const LIMIT_SECTION_ID = 'pain'
  const NAV_ID = 'nav'
  const BOTTOM_LIMIT_SECTION_ID = 'afterwords'
  const MIN_PAGE_WIDTH = 801

  const sections = document.getElementsByClassName(SECTIONS_CLSNM)
  const nav = document.getElementById('nav')
  
  let shouldWatchScroll = true
  let limit, offsets, pageMaxScroll, bottomLimit, pageWidth
  updateSizeDependent()

  window.addEventListener('scroll', handleScroll, passiveArg)
  window.addEventListener('resize', updateSizeDependent)
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
    if (pageWidth < MIN_PAGE_WIDTH) return

    const sct = window.scrollY
    if (sct >= limit && sct < bottomLimit) nav.classList.add(FIXED_CLSNM)
    else nav.classList.remove(FIXED_CLSNM)

    if (!shouldWatchScroll) return
    const section = findCurrentSection()
    const id = section ? section.getAttribute('id') : null
    
    if (!id) return
    silentlyChangeHash(id)
    updateActiveLink(id)
  }


  // main logic
  function scrollToSection(sectionName) {
    const section = document.getElementById(sectionName)
    if (!section || !sectionName) return

    shouldWatchScroll = false
    updateActiveLink(sectionName)
    
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

  function updateActiveLink(id) {
    const active = document.querySelector(ACTIVE_LINK_QUERY)
    const newActive = document.querySelector(`[href="#${id}"]`)
    if (active === newActive) return

    active && active.classList.remove(ACTIVE_LINK_CLSNM)
    newActive && newActive.classList.add(ACTIVE_LINK_CLSNM)

    // const linkTop = newActive ? newActive.offsetTop || 0 : 0
    // const menu = document.getElementById(NAV_ID)
    // menu.scrollTo({ top: linkTop - 10, behavior: 'smooth' })
  }

  function updateSectionsOffsets() {
    return Array.from(sections).map(node => 
      getElementOffsetTop(node))
  }

  function updateSizeDependent() {
    const limits = calcScrollLimits()
    limit = limits.limit 
    bottomLimit = limits.bottomLimit

    offsets = updateSectionsOffsets()
    pageMaxScroll = updatePageMaxScroll()

    pageWidth = window.innerWidth
  }


  // helpers
  function calcScrollLimits() {
    const topNode = document.getElementById(LIMIT_SECTION_ID)
    const bottomNode = document.getElementById(BOTTOM_LIMIT_SECTION_ID)
    return {
      limit: getElementOffsetTop(topNode),
      bottomLimit: getElementOffsetTop(bottomNode) - (window.innerHeight / 2),
    }
  }

  function getElementOffsetTop(node) {
    if (!node) return 0
    const rect = node.getBoundingClientRect()
    return rect.top + window.pageYOffset
  }

  function updatePageMaxScroll() {
    return document.body.offsetHeight - window.innerHeight
  }

  function silentlyChangeHash(newHash) {
    if (pageWidth < MIN_PAGE_WIDTH) return
    
    // to change hash without page jump
    const sct = window.scrollY
    location.hash = newHash

    // and let overscroll at boundaries in mac os
    if (sct > 0 && sct < pageMaxScroll) {
      window.scrollTo(0, sct)
    }
  }

}())