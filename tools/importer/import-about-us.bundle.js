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

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/accordion.js
  function fieldCell(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function parse(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-accordion__item"));
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title");
      const panel = item.querySelector(".cmp-accordion__panel");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const bodySrc = panel && panel.querySelector(".cmp-text") || panel;
      const contentNodes = [];
      if (bodySrc) {
        [...bodySrc.childNodes].forEach((n) => contentNodes.push(n.cloneNode(true)));
      }
      if (!title && contentNodes.length === 0) return;
      const titleP = document2.createElement("p");
      titleP.textContent = title;
      cells.push([
        fieldCell(document2, "title", titleP),
        contentNodes.length ? fieldCell(document2, "content", contentNodes) : fieldCell(document2, "content", null)
      ]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion", cells });
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

  // tools/importer/transformers/merkle-dm-images.js
  var DM_TO_DAM = {
    "Merkle-Teaser-Full-Width-Blue-03": "/content/dam/universal-editor-merkle/merkle-teaser-full-width-blue-03.png",
    "Merkle Website Image 1.0 Final": "/content/dam/universal-editor-merkle/merkle-website-image-1-0-final.png",
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
    const pathOnly = String(urlStr).split("?")[0];
    try {
      const u = new URL(pathOnly, "https://x/");
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
      const srcset = img.getAttribute("srcset") || "";
      const candidates = [
        img.getAttribute("src") || "",
        img.getAttribute("data-src") || "",
        // first URL token of srcset
        (srcset.split(",")[0] || "").trim().split(/\s+/)[0] || ""
      ];
      let damPath = null;
      candidates.some((c) => {
        const name = scene7Name(c);
        if (name && DM_TO_DAM[name]) {
          damPath = DM_TO_DAM[name];
          return true;
        }
        return false;
      });
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

  // tools/importer/import-about-us.js
  var parsers = {
    accordion: parse
  };
  var PAGE_TEMPLATE = {
    name: "about-us",
    description: "Merkle About Us / History \u2014 title + intro, hero image, narrative text, timeline image, acquisitions accordion",
    urls: [
      "https://www.merkle.com/en/about-us/history.html"
    ],
    blocks: [
      {
        name: "accordion",
        instances: ["#container-2fad844c5c > div.aem-Grid > div.accordion.panelcontainer:nth-of-type(6)", ".accordion.panelcontainer"]
      }
    ],
    sections: [
      {
        id: "s1",
        name: "Hero",
        selector: ["#container-2fad844c5c > div.aem-Grid > div.teaser.cmp-teaser-layout-media.mer-full-bleed.cmp-teaser-dark:nth-of-type(1)"],
        style: "dark",
        blocks: [],
        defaultContent: ["title", "text", "image"]
      },
      {
        id: "s2",
        name: "History",
        selector: ["#container-2fad844c5c > div.aem-Grid > div.text.aem-GridColumn:nth-of-type(2)"],
        style: null,
        blocks: [],
        defaultContent: ["text"]
      },
      {
        id: "s3",
        name: "Through the years",
        selector: ["#container-2fad844c5c > div.aem-Grid > div.teaser.cmp-teaser-layout-medium.top-spacer-l:nth-of-type(3)"],
        style: null,
        blocks: [],
        defaultContent: ["title", "text", "image"]
      },
      {
        id: "s4",
        name: "Our growing family",
        selector: ["#container-2fad844c5c > div.aem-Grid > div.accordion.panelcontainer:nth-of-type(6)"],
        style: null,
        blocks: ["accordion"],
        defaultContent: []
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
      let matched = null;
      blockDef.instances.forEach((selector) => {
        if (matched) return;
        const elements = document2.querySelectorAll(selector);
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
  var import_about_us_default = {
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
      const DM_MAP = {
        "Merkle-Teaser-Full-Width-Blue-03": "/content/dam/universal-editor-merkle/merkle-teaser-full-width-blue-03.png",
        "Merkle Website Image 1.0 Final": "/content/dam/universal-editor-merkle/merkle-website-image-1-0-final.png"
      };
      const s7name = (u) => {
        const p = String(u).split("?")[0];
        const m = p.match(/\/is\/image\/[^/]+\/(.+)$/);
        return m ? decodeURIComponent(m[1]) : null;
      };
      main.querySelectorAll("img").forEach((img) => {
        const srcset = img.getAttribute("srcset") || "";
        const cands = [
          img.getAttribute("src") || "",
          img.getAttribute("data-src") || "",
          (srcset.split(",")[0] || "").trim().split(/\s+/)[0] || ""
        ];
        const scene7 = cands.find((c) => c.includes("/is/image/"));
        if (!scene7) return;
        const name = s7name(scene7);
        if (name && DM_MAP[name]) {
          img.setAttribute("src", DM_MAP[name]);
          img.removeAttribute("srcset");
          return;
        }
        const wrap = img.closest("picture") || img;
        (wrap.closest("p") || wrap).remove();
      });
      main.querySelectorAll('img[src*="/content/dam/universal-editor-merkle/"]').forEach((img) => {
        const src = img.getAttribute("src") || "";
        const idx = src.indexOf("/content/dam/universal-editor-merkle/");
        if (idx > 0) img.setAttribute("src", src.slice(idx));
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const mapped = rawPath === "/en/about-us/history" ? "/en/about-us" : rawPath;
      const path = WebImporter.FileUtils.sanitizePath(mapped === "" ? "/index" : mapped);
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
  return __toCommonJS(import_about_us_exports);
})();
