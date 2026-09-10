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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function fieldCell(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function parse(element, { document: document2 }) {
    const slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".cmp-teaser__image img, img.cmp-image__image, picture img, img");
      const pretitle = slide.querySelector(".cmp-teaser__pretitle");
      const title = slide.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = slide.querySelector(".cmp-teaser__description");
      const ctas = Array.from(slide.querySelectorAll(".cmp-teaser__action-link, a.cta-primary, a.cta-secondary"));
      if (!img && !title && !pretitle && !description && ctas.length === 0) return;
      const textNodes = [];
      if (pretitle) textNodes.push(pretitle);
      if (title) textNodes.push(title);
      if (description) textNodes.push(description);
      ctas.forEach((cta) => textNodes.push(cta));
      const imageContent = img ? img.closest("picture") || img : null;
      cells.push([
        imageContent ? fieldCell(document2, "image", imageContent) : "",
        textNodes.length ? fieldCell(document2, "text", textNodes) : ""
      ]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function fieldCell2(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function parse2(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll("li.cmp-list__item, .featuredcard")).filter((el, i, arr) => !arr.some((other) => other !== el && other.contains(el)));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".cmp-teaser__image img, img.cmp-image__image, picture img, img");
      const pretitle = card.querySelector(".cmp-teaser__pretitle");
      const title = card.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
      const description = card.querySelector(".cmp-teaser__description");
      let cta = card.querySelector(".mer-teaser__action-container a, a.cmp-teaser__action-link");
      if (!cta) {
        const wrapper = card.querySelector("a.mer-clickabkle-wrapper, a[href]");
        const linkText = card.querySelector(".mer-link-text, .mer-teaser__action-container span, .mer-teaser__action-container");
        if (wrapper && wrapper.getAttribute("href")) {
          cta = document2.createElement("a");
          cta.setAttribute("href", wrapper.getAttribute("href"));
          cta.textContent = (linkText ? linkText.textContent : wrapper.textContent).trim();
        }
      }
      if (!img && !title && !pretitle && !description && !cta) return;
      const textNodes = [];
      if (pretitle) textNodes.push(pretitle);
      if (title) textNodes.push(title);
      if (description) textNodes.push(description);
      if (cta) textNodes.push(cta);
      const imageContent = img ? img.closest("picture") || img : null;
      cells.push([
        imageContent ? fieldCell2(document2, "image", imageContent) : "",
        textNodes.length ? fieldCell2(document2, "text", textNodes) : ""
      ]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  var CARD_SELECTOR = ".container.responsivegrid.text-left";
  function fieldCell3(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function buildRow(document2, card) {
    const img = card.querySelector(".cmp-image img, img.cmp-image__image, img");
    const textEl = card.querySelector(".cmp-text, .text .cmp-text, .text");
    const imageContent = img ? img.closest("picture") || img : null;
    const textNodes = [];
    if (textEl) {
      Array.from(textEl.children).forEach((child) => textNodes.push(child));
      if (textNodes.length === 0 && textEl.textContent.trim()) textNodes.push(textEl);
    }
    return [
      imageContent ? fieldCell3(document2, "image", imageContent) : "",
      textNodes.length ? fieldCell3(document2, "text", textNodes) : ""
    ];
  }
  function parse3(element, { document: document2 }) {
    if (!element.parentElement) return;
    const siblings = Array.from(element.parentElement.children).filter((c) => c.matches && c.matches(CARD_SELECTOR));
    if (siblings[0] !== element) return;
    const cells = siblings.map((card) => buildRow(document2, card)).filter(Boolean);
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon", cells });
    element.replaceWith(block);
    siblings.slice(1).forEach((card) => card.remove());
  }

  // tools/importer/parsers/video-centered.js
  function fieldCell4(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function parse4(element, { document: document2 }) {
    const source = element.querySelector("video source[src], source.cmp-video-source, video[src]");
    const videoUrl = source ? source.getAttribute("src") || source.getAttribute("data-src") : null;
    const poster = element.querySelector(".cmp-video__player__controls img, img");
    const cells = [];
    if (videoUrl) {
      const link = document2.createElement("a");
      link.setAttribute("href", videoUrl);
      link.textContent = videoUrl;
      cells.push([fieldCell4(document2, "uri", link)]);
    } else {
      cells.push([""]);
    }
    if (poster) {
      cells.push([fieldCell4(document2, "placeholder_image", poster)]);
    }
    if (!videoUrl && !poster) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "video-centered", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-cases.js
  function fieldCell5(document2, fieldName, nodes) {
    const frag = document2.createDocumentFragment();
    frag.appendChild(document2.createComment(` field:${fieldName} `));
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
      if (n) frag.appendChild(n);
    });
    return frag;
  }
  function parse5(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll("li.cmp-list__item, .featuredcard")).filter((el, i, arr) => !arr.some((other) => other !== el && other.contains(el)));
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".cmp-teaser__image img, img.cmp-image__image, picture img, img");
      const pretitle = card.querySelector(".cmp-teaser__pretitle");
      const title = card.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
      const description = card.querySelector(".cmp-teaser__description");
      let cta = card.querySelector(".mer-teaser__action-container a, a.cmp-teaser__action-link");
      if (!cta) {
        const wrapper = card.querySelector("a.mer-clickabkle-wrapper, a[href]");
        const linkText = card.querySelector(".mer-link-text, .mer-teaser__action-container span, .mer-teaser__action-container");
        if (wrapper && wrapper.getAttribute("href")) {
          cta = document2.createElement("a");
          cta.setAttribute("href", wrapper.getAttribute("href"));
          cta.textContent = (linkText ? linkText.textContent : wrapper.textContent).trim();
        }
      }
      if (!img && !title && !pretitle && !description && !cta) return;
      const textNodes = [];
      if (pretitle) textNodes.push(pretitle);
      if (title) textNodes.push(title);
      if (description) textNodes.push(description);
      if (cta) textNodes.push(cta);
      const imageContent = img ? img.closest("picture") || img : null;
      cells.push([
        imageContent ? fieldCell5(document2, "image", imageContent) : "",
        textNodes.length ? fieldCell5(document2, "text", textNodes) : ""
      ]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-cases", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/merkle-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".grecaptcha-badge"
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
    }
  }

  // tools/importer/transformers/merkle-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
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

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "cards-feature": parse2,
    "cards-icon": parse3,
    "video-centered": parse4,
    "carousel-cases": parse5
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Merkle home page",
    urls: [
      "https://www.merkle.com/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".teasercarousel.carousel"]
      },
      {
        name: "cards-feature",
        instances: [".teasergallerylist.list.mer-featured-tgl"]
      },
      {
        name: "cards-icon",
        instances: [".container.responsivegrid.text-left"]
      },
      {
        name: "video-centered",
        instances: [".video.centered"]
      },
      {
        name: "carousel-cases",
        instances: [".listcards.teasergallerylist.list"]
      }
    ],
    sections: [
      {
        id: "rc2",
        name: "Hero",
        selector: [".container.responsivegrid.blue-black-background.full-bleed:nth-of-type(1)"],
        style: "dark",
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Latest and greatest",
        selector: [".container.responsivegrid.full-bleed > .cmp-container > .aem-Grid > .container.responsivegrid:nth-of-type(2)"],
        style: null,
        blocks: ["cards-feature"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Experience economy",
        selector: [".container.responsivegrid.blue-black-background.full-bleed:nth-of-type(3)"],
        style: "dark",
        blocks: ["cards-icon", "video-centered", "carousel-cases"],
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
