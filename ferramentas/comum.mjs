// Coisas que todas as ferramentas usam: caminhos, achar projeto, avisos em português.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PROJETOS = path.join(RAIZ, 'projects');
export const ESTILOS = path.join(RAIZ, 'estilos');
export const PUBLICO = path.join(RAIZ, 'public');
export const ENTREGUES = path.join(RAIZ, 'finished-videos');
export const TMP = path.join(RAIZ, '.tmp');

/** rodando na nuvem (Claude Code pelo celular ou pelo navegador)? */
export const NA_NUVEM = process.env.CLAUDE_CODE_REMOTE === 'true';

/** o navegador que desenha os quadros: o da máquina, se ela já tiver um (na nuvem costuma ter); senão o do motor */
export const navegador = () => (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH) ? process.env.CHROME_PATH : undefined);

export const ok = (msg) => console.log(`✓ ${msg}`);
export const aviso = (msg) => console.log(`! ${msg}`);
export const para = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

/** o motor está instalado? */
export const exigeMotor = () => {
  if (!fs.existsSync(path.join(RAIZ, 'node_modules', 'remotion'))) para('O motor ainda não foi instalado. Rode: node ferramentas/preparar.mjs');
};

/** lê os argumentos: posicionais e --opcao valor (ou --opcao sozinha = true) */
export const argumentos = (argv = process.argv.slice(2)) => {
  const pos = [];
  const op = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const prox = argv[i + 1];
      if (prox !== undefined && !prox.startsWith('--')) {
        op[k] = prox;
        i++;
      } else op[k] = true;
    } else pos.push(a);
  }
  return {pos, op};
};

/** acha a pasta de um projeto pelo nome curto ou pelo nome completo da pasta */
export const acharProjeto = (nome) => {
  if (!nome) para('Diga o nome do projeto. Ex.: node ferramentas/previa.mjs ciclo-da-agua');
  if (!fs.existsSync(PROJETOS)) para('Ainda não existe nenhum projeto.');
  const pastas = fs.readdirSync(PROJETOS).filter((p) => fs.statSync(path.join(PROJETOS, p)).isDirectory());
  const exato = pastas.find((p) => p === nome);
  if (exato) return exato;
  const achados = pastas.filter((p) => p.replace(/^\d{4}-\d{2}-\d{2}-/, '') === nome).sort();
  if (achados.length) return achados[achados.length - 1];
  const parecidos = pastas.filter((p) => p.includes(nome));
  if (parecidos.length === 1) return parecidos[0];
  if (parecidos.length > 1) para(`Mais de um projeto com esse nome: ${parecidos.join(', ')}. Use o nome completo da pasta.`);
  para(`Não achei o projeto "${nome}". Os que existem: ${pastas.join(', ') || 'nenhum'}.`);
};

/** id do vídeo no motor (o mesmo nome da pasta) */
export const idDe = (pasta) => pasta.replace(/[^a-zA-Z0-9-]/g, '-');

/** roda ffmpeg/ffprobe que vem junto com o motor */
export const ff = (prog, args) => {
  // chama o motor direto pelo node (sem shell), pra caminhos com espaço e acento funcionarem
  const cli = path.join(RAIZ, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
  const r = spawnSync(process.execPath, [cli, prog, ...args], {cwd: RAIZ, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  return {codigo: r.status, saida: r.stdout ?? '', erro: r.stderr ?? ''};
};

/** a seção "## Fala" do roteiro: uma frase por linha */
export const lerFala = (pasta) => {
  const arq = path.join(PROJETOS, pasta, 'roteiro.md');
  if (!fs.existsSync(arq)) para(`O projeto ${pasta} não tem roteiro.md.`);
  const txt = fs.readFileSync(arq, 'utf8');
  const m = txt.match(/##\s*(?:Fala|Script)\s*\n([\s\S]*?)(\n##\s|$)/);
  if (!m) para('O roteiro não tem a seção "## Fala".');
  const linhas = m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('<!--') && !l.startsWith('>'));
  if (!linhas.length) para('A seção "## Fala" do roteiro está vazia.');
  return linhas;
};

/** reescreve a lista de projetos que o motor conhece */
export const atualizarCatalogo = () => {
  const pastas = fs.existsSync(PROJETOS)
    ? fs.readdirSync(PROJETOS).filter((p) => fs.existsSync(path.join(PROJETOS, p, 'video.tsx')) && fs.existsSync(path.join(PROJETOS, p, 'tempo.json'))).sort()
    : [];
  const linhas = [
    '// Escrito por ferramentas/catalogo.mjs. Não edite à mão.',
    "import type {Formato, Roteiro} from './tempo';",
    "import type React from 'react';",
    ...pastas.map((p, i) => `import * as p${i} from '../projects/${p}/video';`),
    'type Projeto = {id: string; m: {roteiro: Roteiro; formato: Formato; Video: React.FC}};',
    `export const PROJETOS: Projeto[] = [${pastas.map((p, i) => `{id: '${idDe(p)}', m: p${i} as Projeto['m']}`).join(', ')}];`,
    '',
  ];
  fs.writeFileSync(path.join(RAIZ, 'motor', 'projetos.gerado.ts'), linhas.join('\n'));
  // e a lista de estilos (cada um vira uma vitrine no motor)
  const estilos = fs.readdirSync(ESTILOS).filter((d) => fs.existsSync(path.join(ESTILOS, d, 'index.tsx'))).sort();
  const le = [
    '// Escrito por ferramentas/catalogo.mjs. Não edite à mão.',
    "import type {Kit} from './kit';",
    ...estilos.map((d, i) => `import {kit as e${i}} from '../estilos/${d}';`),
    `export const ESTILOS: {id: string; kit: Kit}[] = [${estilos.map((d, i) => `{id: '${d}', kit: e${i}}`).join(', ')}];`,
    '',
  ];
  fs.writeFileSync(path.join(RAIZ, 'motor', 'estilos.gerado.ts'), le.join('\n'));
  return pastas;
};
