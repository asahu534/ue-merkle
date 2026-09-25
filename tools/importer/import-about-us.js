/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/merkle-cleanup.js';
import dmImagesTransformer from './transformers/merkle-dm-images.js';
import sectionsTransformer from './transformers/merkle-sections.js';

// PARSER REGISTRY
const parsers = {
  accordion: accordionParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: 'Merkle About Us / History — title + intro, hero image, narrative text, timeline image, acquisitions accordion',
  urls: [
    'https://www.merkle.com/en/about-us/history.html',
  ],
  blocks: [
    {
      name: 'accordion',
      instances: ['#container-2fad844c5c > div.aem-Grid > div.accordion.panelcontainer:nth-of-type(6)', '.accordion.panelcontainer'],
    },
  ],
  sections: [
    {
      id: 's1',
      name: 'Hero',
      selector: ['#container-2fad844c5c > div.aem-Grid > div.teaser.cmp-teaser-layout-media.mer-full-bleed.cmp-teaser-dark:nth-of-type(1)'],
      style: 'dark',
      blocks: [],
      defaultContent: ['title', 'text', 'image'],
    },
    {
      id: 's2',
      name: 'History',
      selector: ['#container-2fad844c5c > div.aem-Grid > div.text.aem-GridColumn:nth-of-type(2)'],
      style: null,
      blocks: [],
      defaultContent: ['text'],
    },
    {
      id: 's3',
      name: 'Through the years',
      selector: ['#container-2fad844c5c > div.aem-Grid > div.teaser.cmp-teaser-layout-medium.top-spacer-l:nth-of-type(3)'],
      style: null,
      blocks: [],
      defaultContent: ['title', 'text', 'image'],
    },
    {
      id: 's4',
      name: 'Our growing family',
      selector: ['#container-2fad844c5c > div.aem-Grid > div.accordion.panelcontainer:nth-of-type(6)'],
      style: null,
      blocks: ['accordion'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup and DM image conversion always run;
// section transformer runs when the template has 2+ sections.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    let matched = null;
    blockDef.instances.forEach((selector) => {
      if (matched) return;
      const elements = document.querySelectorAll(selector);
      if (elements.length) {
        matched = selector;
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null,
          });
        });
      }
    });
    if (!matched) console.warn(`Block "${blockDef.name}" selectors not found`);
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers.
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup + DM images + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 5b. Map any remaining Scene7 <img> to its DAM path. The DM transformer
    // runs on the raw DOM in beforeTransform, but lazy-loaded images (src set
    // via srcset/JS) can surface their Scene7 URL only after the built-in rules
    // (adjustImageUrls) resolve them — so re-check here on the final DOM.
    const DM_MAP = {
      'Merkle-Teaser-Full-Width-Blue-03': '/content/dam/universal-editor-merkle/merkle-teaser-full-width-blue-03.png',
      'Merkle Website Image 1.0 Final': '/content/dam/universal-editor-merkle/merkle-website-image-1-0-final.png',
    };
    const s7name = (u) => {
      const p = String(u).split('?')[0];
      const m = p.match(/\/is\/image\/[^/]+\/(.+)$/);
      return m ? decodeURIComponent(m[1]) : null;
    };
    main.querySelectorAll('img').forEach((img) => {
      // A Scene7 URL may live in src, srcset (lazy images), or data-src.
      const srcset = img.getAttribute('srcset') || '';
      const cands = [
        img.getAttribute('src') || '',
        img.getAttribute('data-src') || '',
        (srcset.split(',')[0] || '').trim().split(/\s+/)[0] || '',
      ];
      const scene7 = cands.find((c) => c.includes('/is/image/'));
      if (!scene7) return;
      const name = s7name(scene7);
      if (name && DM_MAP[name]) {
        img.setAttribute('src', DM_MAP[name]);
        img.removeAttribute('srcset');
        return;
      }
      // Unmapped lazy Scene7 image (e.g. the timeline): drop it rather than emit
      // a broken external reference. The "Merkle through the years" heading/text
      // remains; the author adds the timeline via an Image block in the editor.
      const wrap = img.closest('picture') || img;
      (wrap.closest('p') || wrap).remove();
    });

    // 5c. Re-relativize DAM asset URLs to root-relative /content/dam/... paths.
    main.querySelectorAll('img[src*="/content/dam/universal-editor-merkle/"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/content/dam/universal-editor-merkle/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

    // 6. Generate sanitized path.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    // Map the source /en/about-us/history to the target /en/about-us.
    const mapped = rawPath === '/en/about-us/history' ? '/en/about-us' : rawPath;
    const path = WebImporter.FileUtils.sanitizePath(mapped === '' ? '/index' : mapped);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
