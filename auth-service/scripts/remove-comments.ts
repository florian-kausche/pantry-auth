const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

const roots = [path.resolve(__dirname, '../src'), path.resolve(__dirname)];

function isTypescriptFile(filePath: string) {
  return filePath.endsWith('.ts');
}

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && isTypescriptFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function stripFile(filePath: string) {
  const original = fs.readFileSync(filePath, 'utf8');
  const stripped = strip(original);
  if (stripped !== original) {
    fs.writeFileSync(filePath, stripped, 'utf8');
    console.log(`Stripped comments: ${path.relative(process.cwd(), filePath)}`);
  }
}

for (const root of roots) {
  if (fs.existsSync(root)) {
    const files = walk(root);
    for (const file of files) {
      stripFile(file);
    }
  }
}