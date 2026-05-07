const fs = require("fs");
const refPath = process.argv[2];
const homePath = process.argv[3];
const ref = fs.readFileSync(refPath, "utf8");
const home = fs.readFileSync(homePath, "utf8");
function tags(html) {
  const a = [];
  html.replace(/<img\b[^>]*>/gi, (t) => {
    a.push(t);
    return t;
  });
  return a;
}
const R = tags(ref);
const H = tags(home);
console.log("ref", R.length, "home", H.length);
for (let i = 0; i < Math.min(12, R.length, H.length); i++) {
  console.log(i, "R", R[i].slice(0, 100));
}
console.log("---");
for (let i = 0; i < Math.min(12, H.length); i++) {
  console.log(i, "H", H[i].slice(0, 100));
}
