/**
 * Restore reference-layout CDN img + overlay video tags from live EN portfolio-chronological into index.html.
 */
const fs = require("fs");
const refPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/_ref-portfolio-chrono-en.html";
const targetPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/index.html";

const refHtml = fs.readFileSync(refPath, "utf8");
let html = fs.readFileSync(targetPath, "utf8");

function extractImgs(html) {
  const imgs = [];
  html.replace(/<img\b[^>]*>/gi, (t) => {
    imgs.push(t);
    return t;
  });
  return imgs;
}

function extractVideos(html) {
  const videos = [];
  html.replace(/<video\b[\s\S]*?<\/video>/gi, (t) => {
    videos.push(t);
    return t;
  });
  return videos;
}

const refImgs = extractImgs(refHtml);
const refVideos = extractVideos(refHtml);

function keepLocal(tag) {
  return (
    tag.includes("assets/voltis.svg") ||
    tag.includes("raw.githubusercontent.com") ||
    tag.includes("github.githubassets.com")
  );
}

function isBrokenImg(tag) {
  return (
    tag.includes('src="#"') ||
    tag.includes('srcset="#"') ||
    /srcset="[^"]*#\s*\d/.test(tag)
  );
}

let ri = 0;
html = html.replace(/<img\b[^>]*>/gi, (tag) => {
  if (keepLocal(tag)) return tag;
  if (!isBrokenImg(tag)) return tag;
  if (ri >= refImgs.length) {
    console.error("Ran out of reference images at ri=", ri);
    return tag;
  }
  return refImgs[ri++];
});

let rv = 0;
html = html.replace(/<video\b[\s\S]*?<\/video>/gi, (block) => {
  if (!block.includes('src="#"')) return block;
  if (rv >= refVideos.length) {
    console.error("Ran out of reference videos at rv=", rv);
    return block;
  }
  return refVideos[rv++];
});

fs.writeFileSync(targetPath, html, "utf8");
console.log(
  "Images: used",
  ri,
  "of",
  refImgs.length,
  "; videos: used",
  rv,
  "of",
  refVideos.length
);
