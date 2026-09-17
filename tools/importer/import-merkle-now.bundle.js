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

  // tools/importer/import-merkle-now.js
  var import_merkle_now_exports = {};
  __export(import_merkle_now_exports, {
    default: () => import_merkle_now_default
  });

  // tools/importer/parsers/column-control.js
  function columnContent(card, document2) {
    const img = card.querySelector(".cmp-teaser__image img, img.cmp-image__image, picture img, img");
    const pretitle = card.querySelector(".cmp-teaser__pretitle");
    const title = card.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    let cta = card.querySelector(".mer-teaser__action-container a, a.cmp-teaser__action-link");
    if (!cta) {
      const wrapper = card.querySelector("a.mer-clickabkle-wrapper, a[href]");
      const linkText = card.querySelector(".mer-link-text, .mer-teaser__action-container span, .mer-teaser__action-container");
      if (wrapper && wrapper.getAttribute("href")) {
        cta = document2.createElement("a");
        cta.setAttribute("href", wrapper.getAttribute("href"));
        cta.textContent = (linkText ? linkText.textContent : wrapper.textContent).trim() || "Read more";
      }
    }
    const frag = document2.createDocumentFragment();
    const imageContent = img ? img.closest("picture") || img : null;
    if (imageContent) frag.appendChild(imageContent);
    if (pretitle) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      frag.appendChild(p);
    }
    if (title) {
      const h = document2.createElement("h3");
      h.textContent = title.textContent.trim();
      frag.appendChild(h);
    }
    if (cta) frag.appendChild(cta);
    return frag;
  }
  function parse(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll("li.cmp-list__item, .featuredcard")).filter((el, i, arr) => !arr.some((other) => other !== el && other.contains(el)));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const perRow = 3;
    const blocks = [];
    for (let i = 0; i < cards.length; i += perRow) {
      const rowCards = cards.slice(i, i + perRow);
      const columns = rowCards.map((card) => columnContent(card, document2));
      const rowIndex = i / perRow;
      const layout = rowIndex % 2 === 0 ? "layout-40-30-30" : "layout-25-25-50";
      const block = WebImporter.Blocks.createBlock(document2, {
        name: "column-control",
        variants: [layout],
        cells: [columns]
      });
      blocks.push(block);
    }
    element.replaceWith(...blocks);
  }

  // tools/importer/parsers/content-filter.js
  function fieldCell(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  function parse2(element, { document: document2, url }) {
    const items = Array.from(element.querySelectorAll("li.masonry-result-item"));
    const cells = [];
    const isWork = /\/work(\.html|\/|$)/i.test(url || "");
    items.forEach((item) => {
      const subtitle = item.querySelector(".masonry-result-item-subtitle");
      const title = item.querySelector(".masonry-result-item-title, h1, h2, h3, h4");
      const linkEl = item.querySelector(".masonry-result-item-link") || item.querySelector(".masonry-result-item-title-link, a[href]");
      const img = item.querySelector("picture img, img");
      if (!title && !subtitle && !linkEl) return;
      const label = subtitle ? toTitleCase(subtitle.textContent.trim()) : "";
      const textNodes = [];
      if (subtitle) {
        const p = document2.createElement("p");
        p.textContent = label;
        textNodes.push(p);
      }
      if (title) {
        const h = document2.createElement("h3");
        h.textContent = title.textContent.trim();
        textNodes.push(h);
      }
      if (linkEl && linkEl.getAttribute("href")) {
        const a = document2.createElement("a");
        a.setAttribute("href", linkEl.getAttribute("href"));
        a.textContent = "Read more";
        textNodes.push(a);
      }
      const contentType = isWork ? "Case Study" : label;
      const tags = document2.createElement("p");
      tags.textContent = contentType ? `Content Type: ${contentType}` : "";
      const imageContent = img ? img.closest("picture") || img : null;
      cells.push([
        imageContent ? fieldCell(document2, "image", imageContent) : fieldCell(document2, "image", null),
        textNodes.length ? fieldCell(document2, "text", textNodes) : fieldCell(document2, "text", null),
        fieldCell(document2, "tags", tags)
      ]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "content-filter", cells });
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
        "noscript"
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

  // tools/importer/transformers/merkle-dm-images.js
  var DM_TO_DAM = {
    "Merkle-Hero-Carousel-01B": "/content/dam/universal-editor-merkle/merkle-hero-carousel-01b.png",
    "LBR2026-Web-1920": "/content/dam/universal-editor-merkle/lbr2026-web-1920.png",
    "Six-Flags-Full-Width-1920": "/content/dam/universal-editor-merkle/six-flags-full-width-1920.png",
    "dreamforce-hero-banner-1080-2": "/content/dam/universal-editor-merkle/dreamforce-hero-banner-1080-2.jpg",
    "CX-Imperatives-1920": "/content/dam/universal-editor-merkle/cx-imperatives-1920.jpg",
    "Orchestrating the Content Ecosystem-Hero Image": "/content/dam/universal-editor-merkle/orchestrating-the-content-ecosystem-hero-image.jpg",
    "Merkle-GTM-Shape_GBA-Lotus_Black_1080": "/content/dam/universal-editor-merkle/merkle-gtm-shape-gba-lotus-black-1080.png",
    "Merkle-GTM_Shape_FRT-Chrys_Black_1080": "/content/dam/universal-editor-merkle/merkle-gtm-shape-frt-chrys-black-1080.png",
    "Merkle-GMT-Shape_CFE-Cherry-B_Black_1080": "/content/dam/universal-editor-merkle/merkle-gmt-shape-cfe-cherry-b-black-1080.png",
    "Merkle-GTM-Shape_BLE-Camellia_Black_1080": "/content/dam/universal-editor-merkle/merkle-gtm-shape-ble-camellia-black-1080.png",
    "Satair-CS-square-1080": "/content/dam/universal-editor-merkle/satair-cs-square-1080.jpg",
    "Volvo_CS_square_1080x1080": "/content/dam/universal-editor-merkle/volvo-cs-square-1080x1080.jpg",
    "FunLab-CS-square-1080": "/content/dam/universal-editor-merkle/funlab-cs-square-1080.jpg",
    "KFC-Restore-CS-square-1080": "/content/dam/universal-editor-merkle/kfc-restore-cs-square-1080.jpg",
    "Under-Armour-CS-square-1080": "/content/dam/universal-editor-merkle/under-armour-cs-square-1080.jpg",
    "Signify-CS-square-1080": "/content/dam/universal-editor-merkle/signify-cs-square-1080.jpg",
    "CTCA-CS-Masonry-IMGTeaserCard-Gallery-Square-1080": "/content/dam/universal-editor-merkle/ctca-cs-masonry-imgteasercard-gallery-square-1080.jpg",
    "Siemens-CS-Masonry-IMGTeaserCard-Gallery-Square-1080": "/content/dam/universal-editor-merkle/siemens-cs-masonry-imgteasercard-gallery-square-1080.jpg",
    "AdobeStock_1563501105-RG-A1-1920x1080-1": "/content/dam/universal-editor-merkle/adobestock-1563501105-rg-a1-1920x1080-1.jpg",
    "Amica-CS-Featured-Image-02": "/content/dam/universal-editor-merkle/amica-cs-featured-image-02.jpg",
    "CS - Party City 1080": "/content/dam/universal-editor-merkle/cs-party-city-1080.jpg",
    "Kellanova-CS-FullWidth-02": "/content/dam/universal-editor-merkle/kellanova-cs-fullwidth-02.jpg",
    "Lumen-CS-Featured-Image": "/content/dam/universal-editor-merkle/lumen-cs-featured-image.jpg",
    "Retails_AI_Window_Is_Open": "/content/dam/universal-editor-merkle/retails-ai-window-is-open.jpg",
    "Swisscard-CS-hero-banner-1920": "/content/dam/universal-editor-merkle/swisscard-cs-hero-banner-1920.jpg",
    "The Five Patterns That Make Enterprise AI Work_1080": "/content/dam/universal-editor-merkle/the-five-patterns-that-make-enterprise-ai-work-1080.jpg",
    "clarins-cs-featured-img-1080": "/content/dam/universal-editor-merkle/clarins-cs-featured-img-1080.jpg",
    "compare-the-market-cs-featured-img-1080": "/content/dam/universal-editor-merkle/compare-the-market-cs-featured-img-1080.jpg"
  };
  function scene7Name(urlStr) {
    try {
      const u = new URL(urlStr, "https://x/");
      if (!u.pathname.startsWith("/is/image/")) return null;
      const parts = u.pathname.split("/is/image/")[1].split("/");
      parts.shift();
      return decodeURIComponent(parts.join("/"));
    } catch (e) {
      return null;
    }
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      const name = scene7Name(src);
      if (!name) return;
      const damPath = DM_TO_DAM[name];
      if (!damPath) return;
      img.setAttribute("src", damPath);
      img.removeAttribute("srcset");
    });
  }

  // tools/importer/transformers/merkle-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-merkle-now.js
  var parsers = {
    "column-control": parse,
    "content-filter": parse2
  };
  var PAGE_TEMPLATE = {
    name: "merkle-now",
    description: "Merkle Now content hub \u2014 text hero, featured content carousel, faceted content archive",
    urls: [
      "https://www.merkle.com/en/merkle-now.html"
    ],
    blocks: [
      {
        name: "column-control",
        instances: [".teasergallerylist.list.mer-featured-tgl"]
      },
      {
        name: "content-filter",
        instances: [".masonry"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "Hero",
        selector: ["#container-7f3660d720 > div.aem-Grid > div.teaser.cmp-teaser-layout-large.content-center:nth-of-type(1)"],
        style: null,
        blocks: [],
        defaultContent: ["title", "text"]
      },
      {
        id: "rc2",
        name: "Featured content",
        selector: ["#container-7f3660d720 > div.aem-Grid > div.teasergallerylist.list.mer-featured-tgl:nth-of-type(2)"],
        style: null,
        blocks: ["column-control"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Find something specific",
        selector: ["#container-7f3660d720 > div.aem-Grid > div.teaser.cmp-teaser-layout-large.content-center:nth-of-type(3)"],
        style: null,
        blocks: ["content-filter"],
        defaultContent: ["title", "text"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform3] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_merkle_now_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.querySelectorAll('img[src*="/content/dam/universal-editor-merkle/"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const idx = src.indexOf("/content/dam/universal-editor-merkle/");
        if (idx > 0) img.setAttribute("src", src.slice(idx));
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_merkle_now_exports);
})();
