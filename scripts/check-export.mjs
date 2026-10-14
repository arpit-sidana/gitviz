import { readFile, access } from 'node:fs/promises';
const html=await readFile('out/index.html','utf8');
const assets=[...html.matchAll(/(?:src|href)="(\/gitviz\/_next\/[^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]);
if(!assets.length) throw new Error('No GitHub Pages base-path assets found');
for(const asset of assets) await access(`out/${asset.slice('/gitviz/'.length)}`);
if(/(?:src|href)="\/_next\//.test(html)) throw new Error('An asset omits the /gitviz base path');
for(const content of ['THREE DEMO PROJECTS','Sources &amp; limits','Cal.com / Cal.diy']) if(!html.includes(content)) throw new Error(`Missing exported content: ${content}`);
console.log(`Static export verified: ${assets.length} base-path assets and demo page content.`);
