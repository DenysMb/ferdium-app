/**
 * Script that automatically creates links to issues and users inside README.md
 *
 * e.g. "#123" => "[#123](https://github.com/ferdium/ferdium-app/issues/123)"
 * and  "franz/#123" => "[franz#123](https://github.com/meetfranz/franz/issues/123)"
 * and "@abc" => "[@abc](https://github.com/abc)"
 */

import path from 'node:path';
import fs from 'fs-extra';

// eslint-disable-next-line no-console
console.log('Linking issues and PRs in README.md');

const readmepath = path.join(__dirname, '..', 'README.md');

// Read README.md
let readme = fs.readFileSync(readmepath, 'utf8');

let replacements = 0;

// Replace Franz issues
// Regex matches strings that don't begin with a "[", i.e. are not already linked
// followed by a "franz#" and digits to indicate
// a GitHub issue, and not ending with a "]"
readme = readme.replaceAll(/(?<!\[)franz#\d+(?![\d\]])/gi, match => {
  const issueNr = match.replace('franz#', '');
  replacements += 1;
  return `[franz#${issueNr}](https://github.com/meetfranz/franz/issues/${issueNr})`;
});

// Replace external issues
// Regex matches strings that don't begin with a "[", followed a repo name in the format "user/repo"
// followed by a "#" and digits to indicate a GitHub issue, and not ending with a "]"
readme = readme.replaceAll(/(?<!\[)\w+\/\w+#\d+(?![\d\]])/gi, match => {
  const issueNr = match.replaceAll(/\D/g, '');
  const repo = match.replaceAll(/#\d+/g, '');
  replacements += 1;
  return `[${repo}#${issueNr}](https://github.com/${repo}/issues/${issueNr})`;
});

// Replace Ferdium issues
// Regex matches strings that don't begin with a "[", i.e. are not already linked and
// don't begin with "franz", i.e. are not Franz issues, followed by a "#" and digits to indicate
// a GitHub issue, and not ending with a "]"
readme = readme.replaceAll(/(?<!\[|franz)#\d+(?![\d\]])/gi, match => {
  const issueNr = match.replace('#', '');
  replacements += 1;
  return `[#${issueNr}](https://github.com/ferdium/ferdium-app/issues/${issueNr})`;
});

// Link GitHub users
// Regex matches strings that don't begin with a "[", i.e. are not already linked
// followed by a "@" and at least one word character and not ending with a "]"
readme = readme.replaceAll(/(?<!\[)@\w+(?!])/gi, match => {
  const username = match.replace('@', '');
  replacements += 1;
  return `[@${username}](https://github.com/${username})`;
});

// Write to file
fs.writeFileSync(readmepath, readme);

// eslint-disable-next-line no-console
console.log(`Added ${replacements} strings`);
