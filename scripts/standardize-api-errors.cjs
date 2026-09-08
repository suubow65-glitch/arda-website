const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "app", "api", "admin");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith(".ts")) {
      let s = fs.readFileSync(full, "utf8");
      const original = s;

      // Ensure noStoreJson is imported if we are going to use it.
      if (s.includes("NextResponse.json") && !s.includes('from "@/lib/apiCache"')) {
        s = s.replace(
          /import\s+\{[^}]*\}\s+from\s+"next\/server";?/,
          (m) => m + '\nimport { noStoreJson } from "@/lib/apiCache";'
        );
      }

      // Cloud DB/Storage errors: change status 400 -> 500 and add success: false
      s = s.replace(
        /return noStoreJson\(\{ error: (\w+)\.message \}, \{ status: 400 \}\);/g,
        "return noStoreJson({ error: $1.message, success: false }, { status: 500 });"
      );
      s = s.replace(
        /return NextResponse\.json\(\{ error: (\w+)\.message \}, \{ status: 400 \}\);/g,
        "return noStoreJson({ error: $1.message, success: false }, { status: 500 });"
      );

      // Catch blocks: add success: false to 500 error responses
      s = s.replace(
        /return noStoreJson\(\{ error: message \}, \{ status: 500 \}\);/g,
        "return noStoreJson({ error: message, success: false }, { status: 500 });"
      );
      s = s.replace(
        /return NextResponse\.json\(\{ error: message \}, \{ status: 500 \}\);/g,
        "return noStoreJson({ error: message, success: false }, { status: 500 });"
      );

      // Replace any remaining bare NextResponse.json error returns with noStoreJson
      s = s.replace(
        /return NextResponse\.json\(\{ error: (\w+)\.message \}, \{ status: (\d+) \}\);/g,
        "return noStoreJson({ error: $1.message, success: false }, { status: $2 });"
      );

      // Ensure dynamic/revalidate exports exist at top of route files
      if (!s.includes('export const dynamic = "force-dynamic"')) {
        s = 'export const dynamic = "force-dynamic";\n' + s;
      }
      if (!s.includes('export const revalidate = 0')) {
        s = 'export const revalidate = 0;\n' + s;
      }

      if (s !== original) {
        fs.writeFileSync(full, s, "utf8");
        console.log("Updated", full);
      }
    }
  }
}

if (fs.existsSync(root)) walk(root);
