/**
 * Restore reference-layout CDN img tags from live EN homepage HTML into local home.html.
 * Skips Voltis/GitHub/raw.githubusercontent assets; replaces src="#" / broken srcset.
 */
const fs = require("fs");
const refPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/_ref-home-en.html";
const homePath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/home.html";

const refHtml = fs.readFileSync(refPath, "utf8");
let homeHtml = fs.readFileSync(homePath, "utf8");

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
homeHtml = homeHtml.replace(/<img\b[^>]*>/gi, (tag) => {
  if (keepLocal(tag)) return tag;
  if (!isBroken(tag)) return tag;
  if (ri >= refImgs.length) {
    console.error("Ran out of reference images at ri=", ri);
    return tag;
  }
  return refImgs[ri++];
});

fs.writeFileSync(homePath, homeHtml, "utf8");
console.log("Used", ri, "of", refImgs.length, "reference images.");
