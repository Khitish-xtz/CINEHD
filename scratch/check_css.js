import fs from 'fs';
const content = fs.readFileSync('d:/CINAHD-OTT/src/index.css', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('hero-banner')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
