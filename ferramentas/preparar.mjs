// Instala o motor da fábrica dentro desta pasta (nada é instalado fora dela).
// node ferramentas/preparar.mjs
// Funciona igual no computador e na nuvem (Claude Code pelo celular). Na nuvem, rode a cada sessão nova.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {NA_NUVEM, RAIZ, TMP, atualizarCatalogo, navegador, ok, para} from './comum.mjs';

const maior = Number(process.versions.node.split('.')[0]);
if (maior < 18) para(`O Node.js desta máquina é antigo (${process.versions.node}). Instale a versão 20 ou mais nova e rode de novo.`);
fs.mkdirSync(TMP, {recursive: true});

// 1. as peças do motor
const temMotor = fs.existsSync(path.join(RAIZ, 'node_modules', 'remotion')) && fs.existsSync(path.join(RAIZ, 'node_modules', '@remotion', 'renderer'));
if (temMotor) ok('O motor já estava instalado.');
else {
  console.log(`Instalando o motor (de 1 a 4 minutos${NA_NUVEM ? '' : ', só na primeira vez'})...`);
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r = spawnSync(npm, ['install', '--no-audit', '--no-fund', '--loglevel=error'], {cwd: RAIZ, stdio: 'inherit', shell: process.platform === 'win32'});
  if (r.status !== 0) para('A instalação parou no meio. Confira a internet e rode de novo: ela continua de onde parou.');
  ok('Motor instalado.');
}

// 2. o navegador que desenha os quadros (uns 100 MB, uma vez só; na nuvem a máquina costuma já ter um)
if (navegador()) ok('O navegador do motor já vem nesta máquina.');
else {
  console.log('Conferindo o navegador do motor...');
  const cli = path.join(RAIZ, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const r = spawnSync(process.execPath, [cli, 'browser', 'ensure'], {cwd: RAIZ, stdio: 'inherit'});
  if (r.status !== 0) para('Não consegui baixar o navegador do motor. Confira a internet e rode de novo.');
  ok('Navegador pronto.');
}

// 3. as pastas de trabalho e a lista de projetos
for (const d of ['projects', 'finished-videos', 'public/projetos']) fs.mkdirSync(path.join(RAIZ, d), {recursive: true});
atualizarCatalogo();

// 4. o Blender é opcional: só o 3D completo usa
const sobre3D = `Free version: 3 styles (caderno, neon and voxel). All 28 styles, full 3D and updates are in the full version: https://scenefactory.netlify.app/`;
ok(`Fábrica pronta${NA_NUVEM ? ' (na nuvem)' : ''}. Já pode pedir um vídeo.`);
console.log(`  ${sobre3D}`);
