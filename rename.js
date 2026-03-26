const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('src'), 'README.md', 'package.json'];
files.forEach(f => {
  if (!f.match(/\.(ts|tsx|js|md|json)$/)) return;
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content
    .replace(/Viber AI/g, 'Obsidian')
    .replace(/Viber/g, 'Obsidian')
    .replace(/viber-ai/g, 'obsidian')
    .replace(/viber-/g, 'obsidian-')
    .replace(/viber\.ai/g, 'obsidian.ai')
    .replace(/viber/g, 'obsidian');

  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log(`Updated ${f}`);
  }
});
