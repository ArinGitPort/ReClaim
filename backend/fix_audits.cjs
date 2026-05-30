const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'src', 'controllers', 'itemController.ts'),
  path.join(__dirname, 'src', 'controllers', 'snapshotController.ts')
];

for (const filePath of filesToFix) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = /await logAudit\(\{[^;]*?action:\s*AuditAction\.ITEM_(CREATED|UPDATED)[^;]*?\}\);/g;
  
  const initialLength = content.length;
  content = content.replace(regex, '');
  
  if (content.length !== initialLength) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${path.basename(filePath)}`);
  }
}
