const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_URL = 'https://preview-steel-beta.vercel.app/';
const previewPath = path.join(__dirname, '..', 'preview', 'index.html');
const target = new URL(process.env.FLEXI_PREVIEW_URL || process.argv[2] || DEFAULT_URL);
target.searchParams.set('qa_revision', Date.now().toString());

const digest = content => crypto.createHash('sha256').update(content).digest('hex');

(async () => {
  const local = fs.readFileSync(previewPath);
  const response = await fetch(target, {
    cache: 'no-store',
    headers: { 'cache-control': 'no-cache', pragma: 'no-cache' }
  });
  if (!response.ok) throw new Error(`A prévia pública respondeu HTTP ${response.status}.`);

  const remote = Buffer.from(await response.arrayBuffer());
  const text = remote.toString('utf8');
  const requiredMarkers = [
    '<title>Ownerinc · Flexi · Gestão de trocas · Alpha V1</title>',
    'Alpha V1 · dados fictícios',
    'value="2027-01-08"',
    "['year','Ano'],['month','Mês']"
  ];
  const missing = requiredMarkers.filter(marker => !text.includes(marker));
  if (missing.length) throw new Error(`A prévia pública não contém os marcadores esperados: ${missing.join(', ')}`);

  const forbiddenMarkers = ['2027-04-16', 'phosphor:{', 'iconFamilies=', '.week-agenda', '.explore-trigger'];
  const residues = forbiddenMarkers.filter(marker => text.includes(marker));
  if (residues.length) throw new Error(`A prévia pública ainda contém resíduos removidos: ${residues.join(', ')}`);

  const localHash = digest(local), remoteHash = digest(remote);
  if (!local.equals(remote)) {
    throw new Error(`A prévia pública difere de preview/index.html (local ${localHash}; remoto ${remoteHash}).`);
  }

  console.log(`PASS: prévia pública idêntica ao artefato local (sha256 ${localHash}).`);
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
