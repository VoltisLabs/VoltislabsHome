/**
 * Restore reference-layout CDN img tags from live EN /expertise/ into expertise.html.
 */
const fs = require("fs");
const refPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/_ref-expertise-en.html";
const targetPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/expertise.html";

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

const refImgs = extractImgs(refHtml);

function keepLocal(tag) {
  return (
    tag.includes("assets/voltis.svg") ||
    tag.includes("raw.githubusercontent.com") ||
    tag.includes("github.githubassets.com")
  );
}

function isBroken(tag) {
  return (
    tag.includes('src="#"') ||
    tag.includes('srcset="#"') ||
    /srcset="[^"]*#\s*\d/.test(tag)
  );
}

let ri = 0;
html = html.replace(/<img\b[^>]*>/gi, (tag) => {
  if (keepLocal(tag)) return tag;
  if (!isBroken(tag)) return tag;
  if (ri >= refImgs.length) {
    console.error("Ran out of reference images at ri=", ri);
    return tag;
  }
  return refImgs[ri++];
});

fs.writeFileSync(targetPath, html, "utf8");
console.log("Used", ri, "of", refImgs.length, "reference images.");
