// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

// Magnifying-glass search icon (fixed UI glyph, not authorable content).
const SEARCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4"/></svg>';

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content/nav.plain.html (localhost / aem up) then /nav.plain.html (DA/EDS prod).
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
}

/**
 * Close any open dropdowns.
 * @param {Element} nav The nav element
 */
function closeAll(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((d) => d.setAttribute('aria-expanded', 'false'));
}

/**
 * Toggle the mobile menu open/closed.
 * @param {Element} nav The nav element
 * @param {*} forceExpanded Optional param to force expand state when not null
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (expanded) closeAll(nav);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Label the three sections: brand, sections (primary nav), tools
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: ensure the logo links to home. The default-content Image has no
  // link field in Universal Editor, so if the brand image isn't already
  // wrapped in an anchor, wrap it in a home link here.
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
    } else {
      const logo = navBrand.querySelector('picture, img');
      if (logo) {
        const homeLink = document.createElement('a');
        homeLink.href = '/';
        homeLink.setAttribute('aria-label', 'Merkle home');
        logo.replaceWith(homeLink);
        homeLink.append(logo);
      }
    }
  }

  // Primary nav links: mark items with sub-lists as dropdowns
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope ul > li').forEach((li) => {
      if (li.querySelector('ul')) li.classList.add('nav-drop');
    });
  }

  // Tools: the language selector (a nav-drop), search, and Contact Us CTA.
  // The published nav fragment wraps each link in a <p> (markdown pipeline),
  // while local dev serves a bare <a>. Unwrap sole-child <p> wrappers first so
  // the link is a direct child of the <li> in both environments.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll(':scope ul > li > p').forEach((p) => {
      if (p.children.length === 1 && p.firstElementChild.tagName === 'A') {
        p.replaceWith(p.firstElementChild);
      }
    });
    navTools.querySelectorAll(':scope ul > li').forEach((li) => {
      const link = li.querySelector(':scope > a');
      if (li.querySelector('ul')) {
        li.classList.add('nav-drop', 'nav-lang');
        li.setAttribute('aria-expanded', 'false');
      } else if (link && /contact/i.test(link.getAttribute('href') || '')) {
        li.classList.add('nav-cta');
        link.classList.add('button', 'primary');
      } else if (link && /search/i.test(link.getAttribute('href') || '')) {
        li.classList.add('nav-search');
        link.setAttribute('aria-label', link.textContent.trim() || 'Search');
        link.innerHTML = SEARCH_ICON;
      }
    });
  }

  // Dropdown toggles (language selector + any nav-drop): click to open, click-out to close
  nav.querySelectorAll('.nav-drop').forEach((drop) => {
    const trigger = drop.querySelector(':scope > a');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = drop.getAttribute('aria-expanded') === 'true';
      closeAll(nav);
      drop.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAll(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAll(nav);
      if (!isDesktop.matches) toggleMenu(nav, false);
    }
  });

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Reset menu state across the desktop/mobile boundary on resize
  isDesktop.addEventListener('change', () => {
    closeAll(nav);
    document.body.style.overflowY = '';
    nav.setAttribute('aria-expanded', 'false');
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
