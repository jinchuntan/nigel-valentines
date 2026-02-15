import { mkdir, rm, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const files = ["index.html", "styles.css", "script.js", "favicon.svg"];

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await Promise.all(
    files.map((file) => copyFile(resolve(root, file), resolve(dist, file)))
  );

  console.log("Build complete. Output directory: dist");
}

build().catch((error) => {
  console.error("Build failed.");
  console.error(error);
  process.exitCode = 1;
});
