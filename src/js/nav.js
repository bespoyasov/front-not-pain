(function () {
  // Detect passive event support:
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, "passive", {
      get() {
        supportsPassive = { passive: true };
      },
    });
    window.addEventListener("test", null, opts);
  } catch (e) {}

  // Detect history API support for hash changes:
  const supportsHistoryApi =
    typeof history !== "undefined" && !!history.pushState;

  // Library-like utilities:
  function throttle(callee, timeout = 250) {
    let timer = null;

    return function perform(...args) {
      if (timer) return;

      timer = setTimeout(() => {
        callee(...args);
        clearTimeout(timer);
        timer = null;
      }, timeout);
    };
  }

  function getElementOffsetTop(node) {
    if (!node) return 0;
    const rect = node.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  }

  function currentHash() {
    return location.hash.replace("#", "");
  }

  // Main script:
  const sections = document.getElementsByClassName("section");
  const headings = document.getElementsByClassName("section-link");
  const nav = document.getElementById("nav");

  let shouldWatchScroll = true;
  let sectionOffsets;
  updateSectionOffsets();

  window.addEventListener("scroll", handleScroll, supportsPassive);
  window.addEventListener("resize", throttle(updateSectionOffsets));

  nav.addEventListener("click", handleLinkClick);
  Array.from(headings).forEach((el) => {
    el.addEventListener("click", handleLinkClick);
  });

  function isNarrowScreen() {
    const minDesktopWidth = 801;
    return window.innerWidth < minDesktopWidth;
  }

  function updateSectionOffsets() {
    sectionOffsets = [...sections].map(getElementOffsetTop);
  }

  function handleLinkClick(e) {
    if (!e.target.closest) return;

    const link = e.target.closest("a");
    if (!link) return;

    e.preventDefault();
    const sectionName = link.getAttribute("href").replace("#", "");
    scrollToSection(sectionName);
  }

  function scrollToSection(sectionName) {
    const section = document.getElementById(sectionName);
    if (!section || !sectionName) return;

    updateActiveLink(sectionName);

    shouldWatchScroll = false;
    setTimeout(() => {
      shouldWatchScroll = true;
      location.hash = sectionName;
    }, 500);

    window.scrollTo({
      top: getElementOffsetTop(section),
      behavior: "smooth",
    });
  }

  function handleScroll() {
    if (!shouldWatchScroll || isNarrowScreen()) return;

    const section = findCurrentSection();
    const id = section ? section.getAttribute("id") : null;

    if (!id) return;
    silentlyChangeHash(id);
    updateActiveLink(id);
  }

  function findCurrentSection() {
    const currentPosition = window.scrollY;
    return sectionOffsets.reduce(
      (section, offset, index) =>
        offset <= currentPosition ? sections[index] : section,
      null
    );
  }

  function updateActiveLink(id) {
    const activeLinkClassName = "is-active";
    const activeLinkQuery = `.nav a.${activeLinkClassName}`;

    const currentActive = document.querySelector(activeLinkQuery);
    const nextActive = document.querySelector(`[href="#${id}"]`);
    if (currentActive === nextActive) return;

    currentActive && currentActive.classList.remove(activeLinkClassName);
    nextActive && nextActive.classList.add(activeLinkClassName);
  }

  function silentlyChangeHash(newHash) {
    if (!supportsHistoryApi || isNarrowScreen()) return;
    if (newHash === currentHash()) return;
    history.pushState(null, null, `#${newHash}`);
  }
})();
