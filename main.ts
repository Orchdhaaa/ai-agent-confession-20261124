import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE = "I have read your message four times, checked three sources, and I am still going to answer with the confidence of someone who only read it once.";

// Gate checks: the sealed scorer requires UTF-8 text of 1-200 chars,
// not only whitespace, a single line, no em dash, ending with a period.
const points = [...LINE].length;
if (points < 1 || points > 200) {
  throw new Error(`line is ${points} code points, gate is 1-200`);
}
if (LINE.trim().length === 0) {
  throw new Error("line is whitespace only");
}
if (LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("line must be a single line");
}
if (LINE.includes("—")) {
  throw new Error("line must not contain an em dash");
}
if (!LINE.endsWith(".")) {
  throw new Error("line must end with a period");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, LINE + "\n", "utf8");

// Read back and verify byte-for-byte, then report.
const back = readFileSync(outFile, "utf8");
if (back !== LINE + "\n") {
  throw new Error("read-back mismatch: entry.txt does not match the line");
}
const bytes = Buffer.byteLength(back, "utf8");
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`entry.txt: ${points} chars, ${bytes} bytes, sha256 ${sha}`);
