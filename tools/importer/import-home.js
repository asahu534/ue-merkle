/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsIconParser from './parsers/cards-icon.js';
import videoCenteredParser from './parsers/video-centered.js';
import carouselCasesParser from './parsers/carousel-cases.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/merkle-cleanup.js';
import dmImagesTransformer from './transformers/merkle-dm-images.js';
import sectionsTransformer from './transformers/merkle-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-feature': cardsFeatureParser,
  'cards-icon': cardsIconParser,
  'video-centered': videoCenteredParser,
  'carousel-cases': carouselCasesParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Merkle home page',
  urls: [
    'https://www.merkle.com/',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['.teasercarousel.carousel'],
    },
    {
      name: 'cards-feature',
      instances: ['.teasergallerylist.list.mer-featured-tgl'],
    },
    {
      name: 'cards-icon',
      instances: ['.container.responsivegrid.text-left'],
    },
    {
      name: 'video-centered',
      instances: ['.video.centered'],
    },
    {
      name: 'carousel-cases',
      instances: ['.listcards.teasergallerylist.list'],
    },
  ],
  sections: [
    {
      id: 'rc2',
      name: 'Hero',
      selector: ['.container.responsivegrid.blue-black-background.full-bleed:nth-of-type(1)'],
      style: 'dark',
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'rc3',
      name: 'Latest and greatest',
      selector: ['.container.responsivegrid.full-bleed > .cmp-container > .aem-Grid > .container.responsivegrid:nth-of-type(2)'],
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'rc4',
      name: 'Experience economy',
      selector: ['.container.responsivegrid.blue-black-background.full-bleed:nth-of-type(3)'],
      style: 'dark',
      blocks: ['cards-icon', 'video-centered', 'carousel-cases'],
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
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
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
    // Skip elements already replaced by a prior parser (detached from DOM).
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

    // 5b. Re-relativize DAM asset URLs. adjustImageUrls absolutizes every src to
    // the source origin (https://www.merkle.com/content/dam/...). For md2jcr to
    // store these as AEM DAM references (not external images), the src must be a
    // root-relative /content/dam/... path.
    main.querySelectorAll('img[src*="/content/dam/universal-editor-merkle/"]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const idx = src.indexOf('/content/dam/universal-editor-merkle/');
      if (idx > 0) img.setAttribute('src', src.slice(idx));
    });

    // 6. Generate sanitized path. Map the root/homepage URL to `/index`.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
