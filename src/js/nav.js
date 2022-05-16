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

  // Main script:
  const MIN_DESKTOP_WIDTH = 801;

  const sections = document.getElementsByClassName("section");
  const headings = document.getElementsByClassName("section-link");
  const nav = document.getElementById("nav");

  let shouldWatchScroll = true;
  let limit, offsets, pageMaxScroll, bottomLimit, pageWidth;
  updateSizeDependent();

  window.addEventListener("scroll", handleScroll, supportsPassive);
  window.addEventListener("resize", updateSizeDependent);

  nav.addEventListener("click", handleLinkClick);
  Array.from(headings).forEach((el) => {
    el.addEventListener("click", handleLinkClick);
  });

  function handleLinkClick(e) {
    if (!e.target.closest) return;

    const link = e.target.closest("a");
    if (!link) return;

    e.preventDefault();
    const sectionName = link.getAttribute("href").replace("#", "");
    scrollToSection(sectionName);
  }

  function handleScroll() {
    if (pageWidth < MIN_DESKTOP_WIDTH) return;

    const fixedClassName = "is-fixed";
    const sct = window.scrollY;
    if (sct >= limit && sct < bottomLimit) nav.classList.add(fixedClassName);
    else nav.classList.remove(fixedClassName);

    if (!shouldWatchScroll) return;
    const section = findCurrentSection();
    const id = section ? section.getAttribute("id") : null;

    if (!id) return;
    silentlyChangeHash(id);
    updateActiveLink(id);
  }

  function scrollToSection(sectionName) {
    const section = document.getElementById(sectionName);
    if (!section || !sectionName) return;

    updateActiveLink(sectionName);

    shouldWatchScroll = false;
    setTimeout(() => {
      shouldWatchScroll = true;
      if (sectionName) location.hash = sectionName;
    }, 500);

    window.scrollTo({
      top: getElementOffsetTop(section),
      behavior: "smooth",
    });
  }

  function findCurrentSection() {
    const sct = window.scrollY;
    return offsets.reduce(
      (section, offset, index) => (offset <= sct ? sections[index] : section),
      null
    );
  }

  function updateActiveLink(id) {
    const activeLinkClassName = "is-active";
    const activeLinkQuery = `.nav a.${activeLinkClassName}`;

    const active = document.querySelector(activeLinkQuery);
    const newActive = document.querySelector(`[href="#${id}"]`);
    if (active === newActive) return;

    active && active.classList.remove(activeLinkClassName);
    newActive && newActive.classList.add(activeLinkClassName);
  }

  function updateSectionsOffsets() {
    return Array.from(sections).map((node) => getElementOffsetTop(node));
  }

  function updateSizeDependent() {
    const limits = calcScrollLimits();
    limit = limits.limit;
    bottomLimit = limits.bottomLimit;

    offsets = updateSectionsOffsets();
    pageMaxScroll = updatePageMaxScroll();

    pageWidth = window.innerWidth;
  }

  function calcScrollLimits() {
    const topNode = document.getElementById("pain");
    const bottomNode = document.getElementById("afterwords");

    return {
      limit: getElementOffsetTop(topNode),
      bottomLimit: getElementOffsetTop(bottomNode) - window.innerHeight / 2,
    };
  }

  function getElementOffsetTop(node) {
    if (!node) return 0;
    const rect = node.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  }

  function updatePageMaxScroll() {
    return document.body.offsetHeight - window.innerHeight;
  }

  function silentlyChangeHash(newHash) {
    if (!supportsHistoryApi || newHash === getHash()) return;
    if (pageWidth < MIN_DESKTOP_WIDTH) return;
    return history.pushState(null, null, `#${newHash}`);
  }

  function getHash() {
    return location.hash.replace("#", "");
  }
})();
