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
  let topLimit, offsets, bottomLimit, pageWidth;
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
    if (sct >= topLimit && sct < bottomLimit) nav.classList.add(fixedClassName);
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
      location.hash = sectionName;
    }, 500);

    window.scrollTo({
      top: getElementOffsetTop(section),
      behavior: "smooth",
    });
  }

  function findCurrentSection() {
    const currentPosition = window.scrollY;
    return offsets.reduce(
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

  function updateSectionOffsets() {
    return Array.from(sections).map((node) => getElementOffsetTop(node));
  }

  function updateSizeDependent() {
    const limits = calcScrollLimits();
    topLimit = limits.topLimit;
    bottomLimit = limits.bottomLimit;

    offsets = updateSectionOffsets();
    pageWidth = window.innerWidth;
  }

  function calcScrollLimits() {
    const topNode = document.getElementById("pain");
    const bottomNode = document.getElementById("afterwords");

    return {
      topLimit: getElementOffsetTop(topNode),
      bottomLimit: getElementOffsetTop(bottomNode) - window.innerHeight / 2,
    };
  }

  function getElementOffsetTop(node) {
    if (!node) return 0;
    const rect = node.getBoundingClientRect();
    return rect.top + window.pageYOffset;
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
