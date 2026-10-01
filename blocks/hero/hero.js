// A row whose only content is a link to one of these is the Background Video field.
const VIDEO_RE = /\.(mp4|webm|mov)(\?|#|$)/i;

/**
 * Builds a muted, looping background video. The hero image doubles as poster
 * and fallback; with reduced motion the video stays paused on its poster.
 * @param {string} src video URL
 * @param {HTMLImageElement|null} posterImg hero image, if any
 * @returns {HTMLVideoElement}
 */
function buildVideo(src, posterImg) {
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.preload = 'metadata';
  if (posterImg) video.poster = posterImg.currentSrc || posterImg.src;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.autoplay = true;
  const source = document.createElement('source');
  source.src = src;
  source.type = `video/${src.split('?')[0].split('.').pop().toLowerCase() === 'webm' ? 'webm' : 'mp4'}`;
  video.append(source);
  return video;
}

/**
 * loads and decorates the hero block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-media';
  const content = document.createElement('div');
  content.className = 'hero-content';

  let picture = null;
  let videoUrl = '';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const text = cell.textContent.trim();
      const link = cell.querySelector('a[href]');
      const pic = cell.querySelector('picture');
      if (pic && !picture && text === '') {
        picture = pic;
        media.append(cell);
      } else if (link && VIDEO_RE.test(link.href) && text === link.textContent.trim()) {
        videoUrl = link.href;
        cell.remove();
      } else if (text || cell.querySelector('picture, img')) {
        content.append(cell);
      }
    });
  });

  if (videoUrl) {
    media.append(buildVideo(videoUrl, picture && picture.querySelector('img')));
    block.classList.add('has-video');
  }

  block.textContent = '';
  if (media.children.length) block.append(media);
  block.append(content);
}
