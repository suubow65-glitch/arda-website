const fs = require("fs");
const path = require("path");

const roots = [path.join(__dirname, "..", "app", "admin"), path.join(__dirname, "..", "components")];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      const original = fs.readFileSync(full, "utf8");
      const updated = original.replace(/cache:\s*"no-store",\s*cache:\s*"no-store"/g, 'cache: "no-store"');
      if (updated !== original) {
        fs.writeFileSync(full, updated, "utf8");
        console.log("Fixed", full);
      }
    }
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) walk(root);
}
