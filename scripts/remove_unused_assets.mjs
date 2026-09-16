import fs from 'fs';
import path from 'path';

const basePath = '/Users/chloejin/Desktop/portfolio-site';
const assetsDir = path.join(basePath, 'public/assets');
const srcDir = path.join(basePath, 'src');
const indexHtml = path.join(basePath, 'index.html');

const assetFiles = fs.readdirSync(assetsDir);
const filesToCheck = [];

function getFilesRecursively(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFilesRecursively(fullPath);
    } else {
      filesToCheck.push(fullPath);
    }
  }
}

getFilesRecursively(srcDir);
filesToCheck.push(indexHtml);

let allContent = '';
for (const file of filesToCheck) {
  allContent += fs.readFileSync(file, 'utf-8') + '\n';
}

const unusedFiles = [];
for (const asset of assetFiles) {
  if (!allContent.includes(asset)) {
    unusedFiles.push(asset);
    console.log(`Deleting unused asset: ${asset}`);
    fs.unlinkSync(path.join(assetsDir, asset));
  }
}

console.log(`Deleted ${unusedFiles.length} unused files.`);
