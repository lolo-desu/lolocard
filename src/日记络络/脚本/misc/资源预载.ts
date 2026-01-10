import assets from './资源预载.json';

export function initPrefetches() {
  Promise.allSettled(
    assets.map(
      asset =>
        new Promise(resolve => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = asset;
        }),
    ),
  );
  return { destroy: () => {} };
}
