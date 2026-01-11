import { backgrounds, characters, getImageUrl } from '../../image';

export function initPrefetches() {
  Promise.allSettled(
    [...backgrounds, ...characters].map(
      id =>
        new Promise(resolve => {
          const url = getImageUrl(id);
          if (!url) {
            resolve(null);
            return;
          }
          const image = new Image();
          image.onload = resolve;
          image.onerror = resolve;
          image.src = url;
        }),
    ),
  );
  return { destroy: () => {} };
}
