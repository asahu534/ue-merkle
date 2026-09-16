/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Merkle site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html — no guessed selectors.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / consent / third-party widgets that would interfere with block parsing.
    // Verified in cleaned.html:
    //   #onetrust-consent-sdk       (line 1148) — OneTrust cookie consent banner + preference center
    //   .grecaptcha-badge           (line 1135) — reCAPTCHA badge/logo overlay
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.grecaptcha-badge',
      // <noscript> holds analytics/tracking pixels (Bing UET, Meta Pixel) as
      // raw text; strip the wrappers before the importer can re-parse them into
      // <img> content on the listing pages.
      'noscript',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome + tracking. Verified in cleaned.html:
    //   header                          (line 9)    — global header experience fragment (logos, nav, search, language nav)
    //   footer                          (line 1008) — global footer experience fragment (legal list, social, copyright)
    //   .mer-header-space               (line 2)    — spacer div reserving fixed-header height
    //   h1.visually-hidden              (line 1129) — hidden SEO-only heading outside main content
    //   iframe                          (lines 1137, 1145, 1197+) — reCAPTCHA + DoubleClick/TTD tracking pixels
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '.mer-header-space',
      'h1.visually-hidden',
      'iframe',
    ]);

    // Analytics/tracking pixels rendered as <img> inside <noscript> (Bing UET,
    // Meta/Facebook Pixel). They surface as content images after parsing on the
    // listing pages — strip by tracking-host src so they never reach the block.
    element.querySelectorAll('img[src*="bat.bing.com"], img[src*="facebook.com/tr"]').forEach((img) => {
      const wrap = img.closest('p') || img;
      wrap.remove();
    });
  }
}
