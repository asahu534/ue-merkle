/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-search.js
  var import_search_exports = {};
  __export(import_search_exports, {
    default: () => import_search_default
  });

  // tools/importer/parsers/search.js
  var DEFAULT_PLACEHOLDER = "What can we help you search for?";
  var DEFAULT_PAGE_SIZE = "6";
  function parse(element, { document }) {
    const input = element.querySelector('input[type="search"], .cmp-sitesearch__input');
    const placeholder = input && input.getAttribute("placeholder") || DEFAULT_PLACEHOLDER;
    const topicEls = element.querySelectorAll(".cmp-sitesearch__suggestion-item, .cmp-sitesearch__trending-item");
    const topics = [...topicEls.length ? topicEls : element.querySelectorAll("li")].map((el) => el.textContent.trim()).filter(Boolean);
    const trending = [...new Set(topics)].join(", ");
    const cell = (text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    };
    const block = WebImporter.Blocks.createBlock(document, {
      name: "Search",
      cells: [
        [cell("")],
        // Heading
        [cell(placeholder)],
        // Placeholder
        [cell(trending)],
        // Trending Topics
        [cell(DEFAULT_PAGE_SIZE)]
        // Results Per Page
      ]
    });
    block.setAttribute("data-search-block", "1");
    element.replaceWith(block);
  }

  // tools/importer/transformers/merkle-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".grecaptcha-badge",
        // <noscript> holds analytics/tracking pixels (Bing UET, Meta Pixel) as
        // raw text; strip the wrappers before the importer can re-parse them into
        // <img> content on the listing pages.
        "noscript",
        // .masonry is the source's interactive "Find something specific" filter +
        // query-driven results widget. It is not imported as a block — the
        // authorable blog-list block (query-index driven) replaces it in-editor —
        // so drop it, leaving only the section's intro teaser text.
        ".masonry"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        ".mer-header-space",
        "h1.visually-hidden",
        "iframe"
      ]);
      element.querySelectorAll('img[src*="bat.bing.com"], img[src*="facebook.com/tr"]').forEach((img) => {
        const wrap = img.closest("p") || img;
        wrap.remove();
      });
    }
  }

  // tools/importer/import-search.js
  var parsers = {
    search: parse
  };
  var PAGE_TEMPLATE = {
    name: "search",
    description: "Merkle site search \u2014 a single Search block (config-driven, client-side query-index search).",
    urls: [
      "https://www.merkle.com/en/search.html"
    ],
    blocks: [
      {
        name: "search",
        instances: [".sitesearch", ".cmp-sitesearch", "main .search"]
      }
    ],
    // Single section, no style — no section-break transformer needed.
    sections: [
      {
        id: "s1",
        name: "Search",
        selector: [".sitesearch"],
        style: null,
        blocks: ["search"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
              section: blockDef.section || null
            });
          });
        }
      });
      if (!matched) console.warn(`Block "${blockDef.name}" selectors not found`);
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_search_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const searchBlocks = [...main.querySelectorAll("[data-search-block]")];
      if (searchBlocks.length) {
        main.textContent = "";
        searchBlocks.forEach((b) => {
          b.removeAttribute("data-search-block");
          main.appendChild(b);
        });
      }
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const mapped = rawPath === "/en/search" ? "/search" : rawPath;
      const path = WebImporter.FileUtils.sanitizePath(mapped === "" ? "/index" : mapped);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_search_exports);
})();
