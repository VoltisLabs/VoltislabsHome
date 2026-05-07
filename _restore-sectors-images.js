const fs = require("fs");
const refPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/_ref-sectors-en.html";
const destPath =
  "C:/Users/toziz/.cursor/projects/C-Users-toziz-AppData-Local-Temp-c89c31b7-d619-4c02-8e71-e1c09a273f2b/sectors.html";

const refHtml = fs.readFileSync(refPath, "utf8");
let html = fs.readFileSync(destPath, "utf8");

function extractImgs(src) {
  const imgs = [];
  src.replace(/<img\b[^>]*>/gi, (t) => {
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

fs.writeFileSync(destPath, html, "utf8");
console.log("Used", ri, "of", refImgs.length, "reference images.");
