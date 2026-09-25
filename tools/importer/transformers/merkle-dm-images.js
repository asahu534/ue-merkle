/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Merkle Scene7/Dynamic Media images -> AEM DAM asset paths.
 *
 * The source serves images from Scene7 (https://assets.merkle.com/is/image/merkle/<Name>?...).
 * Those assets have been uploaded to the AEM DAM at
 * /content/dam/universal-editor-merkle/<file>, so instead of round-tripping the
 * external DM URL we rewrite each Scene7 <img> src to its DAM path. The block
 * parsers (which run after this beforeTransform hook) then capture a normal
 * <img> cell, and md2jcr stores it as a proper DAM asset reference — giving
 * authors the standard image picker.
 *
 * Mapping (Scene7 image name -> DAM path) is embedded below from
 * tools/importer/dm-to-dam-map.json.
 */

const DM_TO_DAM = {
  'Merkle-Teaser-Full-Width-Blue-03': '/content/dam/universal-editor-merkle/merkle-teaser-full-width-blue-03.png',
  'Merkle Website Image 1.0 Final': '/content/dam/universal-editor-merkle/merkle-website-image-1-0-final.png',
  'Merkle-Hero-Carousel-01B': '/content/dam/universal-editor-merkle/merkle-hero-carousel-01b.png',
  'LBR2026-Web-1920': '/content/dam/universal-editor-merkle/lbr2026-web-1920.png',
  'Six-Flags-Full-Width-1920': '/content/dam/universal-editor-merkle/six-flags-full-width-1920.png',
  'dreamforce-hero-banner-1080-2': '/content/dam/universal-editor-merkle/dreamforce-hero-banner-1080-2.jpg',
  'CX-Imperatives-1920': '/content/dam/universal-editor-merkle/cx-imperatives-1920.jpg',
  'Orchestrating the Content Ecosystem-Hero Image': '/content/dam/universal-editor-merkle/orchestrating-the-content-ecosystem-hero-image.jpg',
  'Merkle-GTM-Shape_GBA-Lotus_Black_1080': '/content/dam/universal-editor-merkle/merkle-gtm-shape-gba-lotus-black-1080.png',
  'Merkle-GTM_Shape_FRT-Chrys_Black_1080': '/content/dam/universal-editor-merkle/merkle-gtm-shape-frt-chrys-black-1080.png',
  'Merkle-GMT-Shape_CFE-Cherry-B_Black_1080': '/content/dam/universal-editor-merkle/merkle-gmt-shape-cfe-cherry-b-black-1080.png',
  'Merkle-GTM-Shape_BLE-Camellia_Black_1080': '/content/dam/universal-editor-merkle/merkle-gtm-shape-ble-camellia-black-1080.png',
  'Satair-CS-square-1080': '/content/dam/universal-editor-merkle/satair-cs-square-1080.jpg',
  'Volvo_CS_square_1080x1080': '/content/dam/universal-editor-merkle/volvo-cs-square-1080x1080.jpg',
  'FunLab-CS-square-1080': '/content/dam/universal-editor-merkle/funlab-cs-square-1080.jpg',
  'KFC-Restore-CS-square-1080': '/content/dam/universal-editor-merkle/kfc-restore-cs-square-1080.jpg',
  'Under-Armour-CS-square-1080': '/content/dam/universal-editor-merkle/under-armour-cs-square-1080.jpg',
  'Signify-CS-square-1080': '/content/dam/universal-editor-merkle/signify-cs-square-1080.jpg',
  'CTCA-CS-Masonry-IMGTeaserCard-Gallery-Square-1080': '/content/dam/universal-editor-merkle/ctca-cs-masonry-imgteasercard-gallery-square-1080.jpg',
  'Siemens-CS-Masonry-IMGTeaserCard-Gallery-Square-1080': '/content/dam/universal-editor-merkle/siemens-cs-masonry-imgteasercard-gallery-square-1080.jpg',
  'AdobeStock_1563501105-RG-A1-1920x1080-1': '/content/dam/universal-editor-merkle/adobestock-1563501105-rg-a1-1920x1080-1.jpg',
  'Amica-CS-Featured-Image-02': '/content/dam/universal-editor-merkle/amica-cs-featured-image-02.jpg',
  'CS - Party City 1080': '/content/dam/universal-editor-merkle/cs-party-city-1080.jpg',
  'Kellanova-CS-FullWidth-02': '/content/dam/universal-editor-merkle/kellanova-cs-fullwidth-02.jpg',
  'Lumen-CS-Featured-Image': '/content/dam/universal-editor-merkle/lumen-cs-featured-image.jpg',
  'Retails_AI_Window_Is_Open': '/content/dam/universal-editor-merkle/retails-ai-window-is-open.jpg',
  'Swisscard-CS-hero-banner-1920': '/content/dam/universal-editor-merkle/swisscard-cs-hero-banner-1920.jpg',
  'The Five Patterns That Make Enterprise AI Work_1080': '/content/dam/universal-editor-merkle/the-five-patterns-that-make-enterprise-ai-work-1080.jpg',
  'clarins-cs-featured-img-1080': '/content/dam/universal-editor-merkle/clarins-cs-featured-img-1080.jpg',
  'compare-the-market-cs-featured-img-1080': '/content/dam/universal-editor-merkle/compare-the-market-cs-featured-img-1080.jpg',
};

function scene7Name(urlStr) {
  // Drop the query string first — Scene7 srcs can carry template placeholders
  // like `wid={.width}` whose braces make `new URL()` throw. We only need the
  // path segment for the asset name.
  const pathOnly = String(urlStr).split('?')[0];
  try {
    const u = new URL(pathOnly, 'https://x/');
    if (!u.pathname.startsWith('/is/image/')) return null;
    const parts = u.pathname.split('/is/image/')[1].split('/');
    parts.shift(); // drop the company segment (merkle)
    return decodeURIComponent(parts.join('/'));
  } catch {
    return null;
  }
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  element.querySelectorAll('img').forEach((img) => {
    // Some images are lazy-loaded: the Scene7 URL lives in srcset (or data-src)
    // while src is a placeholder. Check all candidates so those still map to DAM.
    const srcset = img.getAttribute('srcset') || '';
    const candidates = [
      img.getAttribute('src') || '',
      img.getAttribute('data-src') || '',
      // first URL token of srcset
      (srcset.split(',')[0] || '').trim().split(/\s+/)[0] || '',
    ];
    let damPath = null;
    candidates.some((c) => {
      const name = scene7Name(c);
      if (name && DM_TO_DAM[name]) { damPath = DM_TO_DAM[name]; return true; }
      return false;
    });
    if (!damPath) return;
    img.setAttribute('src', damPath);
    img.removeAttribute('srcset');
  });
}
