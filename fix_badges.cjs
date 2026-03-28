const fs = require('fs');

let path = 'src/features/admin/MatchLinkingModal.tsx';
let data = fs.readFileSync(path, 'utf8');
data = data.replace(/<StatusBadge weight=\{item\.matchScore\} \/>/g, '<MatchScoreBadge weight={item.matchScore} />');
data = data.replace(/function StatusBadge\(\{ weight \}/g, 'function MatchScoreBadge({ weight }');
fs.writeFileSync(path, data, 'utf8');

function updatePage(file, cmpName) {
  let d = fs.readFileSync(file, 'utf8');
  if (cmpName) {
    let re1 = new RegExp('<' + cmpName + ' ', 'g');
    d = d.replace(re1, '<StatusBadge ');
    let re2 = new RegExp('function ' + cmpName + '\\((.|\\n)*?\\}\\n\\s*\\}', 'm');
    d = d.replace(re2, '');
  } else {
    d = d.replace(/function StatusBadge\((.|\n)*?\}\n\s*\}/m, '');
  }
  if (!d.includes('import { StatusBadge }')) {
    d = 'import { StatusBadge } from "@/components/ui/StatusBadge"\n' + d;
  }
  fs.writeFileSync(file, d, 'utf8');
}

updatePage('src/pages/admin/AdminInventoryPage.tsx', false);
updatePage('src/pages/admin/AdminMissingItemsPage.tsx', false);
updatePage('src/pages/user/UserMyClaimsPage.tsx', 'ClaimStatusBadge');
updatePage('src/pages/user/UserMyReportsPage.tsx', 'ReportStatusBadge');

console.log('StatusBadge refactoring done!');
