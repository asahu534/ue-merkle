/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import searchParser from './parsers/search.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/merkle-cleanup.js';

// PARSER REGISTRY
const parsers = {
  search: searchParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'search',
  description: 'Merkle site search — a single Search block (config-driven, client-side query-index search).',
  urls: [
    'https://www.merkle.com/en/search.html',
  ],
  blocks: [
    {
      name: 'search',
      instances: ['.sitesearch', '.cmp-sitesearch', 'main .search'],
    },
  ],
  // Single section, no style — no section-break transformer needed.
  sections: [
    {
      id: 's1',
      name: 'Search',
      selector: ['.sitesearch'],
      style: null,
      blocks: ['search'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup always runs. No DM images (search page has
// none) and only one section, so the sections transformer is not needed.
const transformers = [
  cleanupTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

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

    // 4. afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 4b. This page is fully represented by the single config-driven Search
    // block: its filter sidebar, results, and pagination are all produced
    // client-side from /query-index.json. The source page's server-rendered
    // filter/results scaffolding lives outside `.sitesearch` and would otherwise
    // survive as clutter, so keep ONLY the generated Search block(s) and drop the
    // rest of the body.
    const searchBlocks = [...main.querySelectorAll('[data-search-block]')];
    if (searchBlocks.length) {
      main.textContent = '';
      searchBlocks.forEach((b) => {
        b.removeAttribute('data-search-block');
        main.appendChild(b);
      });
    }

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. Map the source /en/search to a top-level
    // /search so the search page sits parallel to the home/index page.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const mapped = rawPath === '/en/search' ? '/search' : rawPath;
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
