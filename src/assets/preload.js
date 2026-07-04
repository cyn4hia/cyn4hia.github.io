import images from "./images";

/**
 * Eagerly fetch AND decode every site image as soon as the bundle loads,
 * so pages render with art fully painted instead of streaming in.
 * `imagesReady` resolves when everything is decoded (errors are tolerated).
 */
const loaders = Object.values(images).map((src) => {
  const img = new Image();
  img.src = src;
  // decode() guarantees the bitmap is rasterized, not just downloaded
  return img
    .decode()
    .catch(() => new Promise((res) => {
      img.onload = res;
      img.onerror = res;
    }));
});

export const imagesReady = Promise.allSettled(loaders);
