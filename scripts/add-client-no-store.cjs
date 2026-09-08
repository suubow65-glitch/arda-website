const fs = require("fs");
const path = require("path");

const roots = [
  path.join(__dirname, "..", "app", "admin"),
  path.join(__dirname, "..", "components"),
];

function fixFile(file) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Add no-store to fetch("...") calls without options
  content = content.replace(
    /fetch\((['"`])([^'"`]+)\1\)/g,
    'fetch($1$2$1, { cache: "no-store" })'
  );

  // Add no-store as the first option for fetch("...", { ... })
  content = content.replace(
    /fetch\((['"`])([^'"`]+)\1,\s*\{/g,
    'fetch($1$2$1, { cache: "no-store", '
  );

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated", file);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      fixFile(full);
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}
