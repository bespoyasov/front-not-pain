(function(){
  function setDarkTheme() {
    const rootStyle = document.querySelector(':root').style
    rootStyle.setProperty('--background-color', 'var(--white-dark)');
    rootStyle.setProperty('--text-color', 'var(--black-dark)');
    rootStyle.setProperty('--link-color', 'var(--blue-dark)');
    rootStyle.setProperty('--link-border-color', 'var(--blue-transparent-dark)');
    rootStyle.setProperty('--link-border-color-visited', 'var(--purple-transparent-dark)');
    rootStyle.setProperty('--link-border-color-hover', 'var(--red-transparent-dark)');
    rootStyle.setProperty('--link-color-visited', 'var(--purple-dark)');
    rootStyle.setProperty('--active-nav', 'var(--red-dark)');
    rootStyle.setProperty('--figcaption', 'var(--grey-5-dark)');
    rootStyle.setProperty('--blockquote-background', 'var(--light-brown-dark)');
    rootStyle.setProperty('--blockquote-before-background', 'var(--grey-1-dark)');
    rootStyle.setProperty('--mark-color', 'var(--black-dark)');
    rootStyle.setProperty('--footer-links-color', 'var(--grey-5-dark)');
    rootStyle.setProperty('--footer-links-color-hover', 'var(--black-dark)');
    rootStyle.setProperty('--footer-links-border-color', 'var(--grey-2-dark)');
    rootStyle.setProperty('--footer-links-border-color-hover', 'var(--grey-3-dark)');
  }
  function setLightTheme() {
    const rootStyle = document.querySelector(':root').style
    rootStyle.setProperty('--background-color', 'var(--white)');
    rootStyle.setProperty('--text-color', 'var(--black)');
    rootStyle.setProperty('--link-color', 'var(--blue)');
    rootStyle.setProperty('--link-border-color', 'var(--blue-transparent)');
    rootStyle.setProperty('--link-border-color-visited', 'var(--purple-transparent)');
    rootStyle.setProperty('--link-border-color-hover', 'var(--red-transparent)');
    rootStyle.setProperty('--link-color-visited', 'var(--purple)');
    rootStyle.setProperty('--active-nav', 'var(--red)');
    rootStyle.setProperty('--figcaption', 'var(--grey-5)');
    rootStyle.setProperty('--blockquote-background', 'var(--light-brown)');
    rootStyle.setProperty('--blockquote-before-background', 'var(--grey-1)');
    rootStyle.setProperty('--mark-color', 'var(--black)');
    rootStyle.setProperty('--footer-links-color', 'var(--grey-5)');
    rootStyle.setProperty('--footer-links-color-hover', 'var(--black)');
    rootStyle.setProperty('--footer-links-border-color', 'var(--grey-2)');
    rootStyle.setProperty('--footer-links-border-color-hover', 'var(--grey-3)');
  }

  document.getElementById('night').addEventListener('change', ({target}) => {
    target.checked ? setDarkTheme() : setLightTheme()
    // document.querySelector(':root').style.setProperty('--background-color', '#282a36');
    // document.querySelector(':root').style.setProperty('--text-color', '#f8f8f2');
  })

  // passive event polyfill
  let passiveArg = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {passiveArg = {passive: true}}
    })
    window.addEventListener('test', null, opts)
  } catch (e) {}


  // detect history API for change location.hash
  const hasHistoryApi = typeof history !== 'undefined' && !!history.pushState


  // nodes and listeners
  const SECTIONS_CLSNM = 'section'
  const FIXED_CLSNM = 'is-fixed'
  const ACTIVE_LINK_CLSNM = 'is-active'
  const ACTIVE_LINK_QUERY = `.nav a.${ACTIVE_LINK_CLSNM}`
  const SECTION_HEADINGS = 'section-link'
  const LIMIT_SECTION_ID = 'pain'
  const NAV_ID = 'nav'
  const BOTTOM_LIMIT_SECTION_ID = 'afterwords'
  const MIN_PAGE_WIDTH = 801

  const sections = document.getElementsByClassName(SECTIONS_CLSNM)
  const headings = document.getElementsByClassName(SECTION_HEADINGS)
  const nav = document.getElementById('nav')

  let shouldWatchScroll = true
  let limit, offsets, pageMaxScroll, bottomLimit, pageWidth
  updateSizeDependent()

  window.addEventListener('scroll', handleScroll, passiveArg)
  window.addEventListener('resize', updateSizeDependent)

  nav.addEventListener('click', handleLinkClick)
  Array.from(headings).forEach(el => {
    el.addEventListener('click', handleLinkClick)
  })


  // hadlers
  function handleLinkClick(e) {
    if (!e.target.closest) return

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

    updateActiveLink(sectionName)

    shouldWatchScroll = false
    setTimeout(() => {
      shouldWatchScroll = true
      if (sectionName) location.hash = sectionName
    }, 500)

    window.scrollTo({
      top: getElementOffsetTop(section),
      behavior: 'smooth'
    })
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
    if (!hasHistoryApi || newHash === getHash()) return
    if (pageWidth < MIN_PAGE_WIDTH) return
    return history.pushState(null, null, `#${newHash}`)
  }

  function getHash() {
    return location.hash.replace('#','')
  }

}())