import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRepositoryUrl } from '../lib/repository-url.ts';
import { addComposeServices } from '../scripts/compose-graph.mjs';
const demos=JSON.parse(await readFile(new URL('../lib/snapshots/demos.json',import.meta.url)));
test('all three offline demos have pinned, traversable graph references',()=>{
 assert.equal(demos.length,3);
 for(const graph of demos) {
   assert.match(graph.repository.commitSha,/^[a-f0-9]{40}$/);
   const ids=new Set(graph.nodes.map(n=>n.id));
   assert.equal(ids.size,graph.nodes.length);
   for(const n of graph.nodes) {
     assert.ok(n.evidence.length,`${n.id} has evidence`);
     for(const e of n.evidence) {assert.equal(e.commitSha,graph.repository.commitSha);assert.ok(!e.path.startsWith('/')&&!e.path.includes('..'));}
   }
   for(const edge of graph.edges) {assert.ok(ids.has(edge.source)&&ids.has(edge.target));assert.ok(edge.evidence.length);}
   for(const c of graph.capabilities) {assert.ok(c.nodeIds.length>=2);c.nodeIds.forEach(id=>assert.ok(ids.has(id)));}
 }
});
test('history cites actual pull requests with exact changed-file counts',()=>{
 for(const graph of demos) for(const event of graph.evolution) {
   assert.match(event.commitSha,/^[a-f0-9]{40}$/);
   assert.equal(event.prUrl,`${graph.repository.url}/pull/${event.prNumber}`);
   assert.ok(Number.isInteger(event.files)&&event.files>=event.paths.length);
   assert.ok(!Number.isNaN(Date.parse(event.date)));
   assert.ok(event.value&&event.group);
 }
});
test('repository URL normalization rejects non-repository and unsafe URLs',()=>{
 assert.equal(normalizeRepositoryUrl(' https://github.com/Saleor/Saleor.git/ '),'https://github.com/saleor/saleor');
 for(const url of ['https://github.com.evil.com/a/b','javascript:alert(1)','https://u:p@github.com/a/b','http://github.com/a/b','https://github.com/a/b/tree/main','https://github.com/a']) assert.equal(normalizeRepositoryUrl(url),null);
});
test('Compose dependency parser respects profiles, both depends_on forms, and excludes environment values',()=>{
 const graph={nodes:[],edges:[]};
 addComposeServices(graph,'services:\n  api:\n    depends_on:\n      redis:\n        condition: service_started\n    environment:\n      SECRET: do-not-copy\n  worker:\n    profiles: [jobs]\n    depends_on: [api]\n  redis:\n    image: redis:7\n', {path:'docker-compose.yml',commitSha:'a'.repeat(40)});
 assert.deepEqual(graph.edges.map(e=>[e.source,e.target]),[['compose-api','compose-redis'],['compose-worker','compose-api']]);
 assert.match(graph.nodes.find(n=>n.id==='compose-worker').detail,/Optional profile: jobs/);
 assert.ok(!JSON.stringify(graph).includes('do-not-copy'));
});
