// Cria a pasta de um vídeo novo com o roteiro em branco.
// node ferramentas/criar.mjs <nome-curto> --estilo <id> [--formato vertical|horizontal|quadrado]
// Com --estilo bloquinho3d (3D completo, Blender) também cria o cena3d.py.
import fs from 'node:fs';
import path from 'node:path';
import {ESTILOS, NA_NUVEM, PROJETOS, argumentos, atualizarCatalogo, ok, para} from './comum.mjs';

const {pos, op} = argumentos();
const nome = (pos[0] ?? '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
if (!nome) para('Diga um nome curto. Ex.: node ferramentas/criar.mjs ciclo-da-agua --estilo caderno');
const estilo = op.estilo;
const ESTILO_3D = 'bloquinho3d';
const estilos = [...fs.readdirSync(ESTILOS).filter((d) => fs.existsSync(path.join(ESTILOS, d, 'index.tsx'))), ESTILO_3D];
if (!estilo || !estilos.includes(estilo)) para(`The free version's styles are: ${estilos.filter((e) => e !== ESTILO_3D).join(', ')}. The others are in the full version: https://fabricadecenas.netlify.app/en/`);
const e3d = estilo === ESTILO_3D;
if (e3d) para('Full 3D (Blender) is part of the full Scene Factory: https://fabricadecenas.netlify.app/en/');
if (e3d && NA_NUVEM) para('O 3D completo (Blender) só funciona no computador. Aqui na nuvem, escolha um estilo de 3D leve (balao, diorama, feltro ou voxel).');
const formato = op.formato ?? 'vertical';
if (!['vertical', 'horizontal', 'quadrado'].includes(formato)) para('O formato é vertical, horizontal ou quadrado.');

const hoje = new Date();
const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
let pasta = `${data}-${nome}`;
for (let k = 2; fs.existsSync(path.join(PROJETOS, pasta)); k++) pasta = `${data}-${nome}-${k}`;
const dir = path.join(PROJETOS, pasta);
fs.mkdirSync(dir, {recursive: true});

fs.writeFileSync(
  path.join(dir, 'roteiro.md'),
  `# ${nome}

- **Style:** ${estilo}
- **Format:** ${formato}

## Idea

<!-- what the viewer will understand or feel at the end, in one or two sentences -->

## Script

<!-- one sentence per line; the first one is the hook -->

## Scenes

| Block | Lines | What the screen shows |
|---|---|---|
`,
);

// tempo provisório (a ferramenta narrar reescreve)
fs.writeFileSync(
  path.join(dir, 'tempo.json'),
  JSON.stringify({origem: 'leitura', total: 3, frases: [{texto: '...', ini: 0, fim: 2.5, palavras: [{p: '...', ini: 0, fim: 2.5}]}]}, null, 1),
);

if (e3d) {
  // a cena do Blender: lê o tempo do projeto, monta, e grava o fundo3d.mp4 que o video.tsx toca
  fs.writeFileSync(
    path.join(dir, 'cena3d.py'),
    `# A cena 3D deste projeto. Rodar: node ferramentas/blender.mjs ${nome} [--quadro 4.5]
import sys
from pathlib import Path
RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / 'blender'))
import kit_bloquinho as K  # noqa: E402

dur, frases, formato = K.projeto(__file__)      # frases[k] = (início, fim, texto) da frase k, em segundos
sc = K.nova_cena(dur, formato, clima='dia')
K.chao(sc, 'grama')

# rascunho: troque pelas peças da história
caixa = K.bloco('caixa', (1, 1, 1), (0, 0, 0.5), K.COR['madeira'])
K.contorno([caixa])
K.aparecer(caixa, 0.0)
K.balancar(caixa, 0.5, dur, amp=0.15)

K.camera(sc, (0, -14, 5), alvo=(0, 0, 1.2))
K.fundo(sc, __file__)
`,
  );
  fs.writeFileSync(
    path.join(dir, 'video.tsx'),
    `import React from 'react';
import type {Formato, Roteiro} from '../../motor';
import {Filme3D} from '../../motor';
import tempo from './tempo.json';

// 3D completo: a cena é o cena3d.py (Blender). Aqui só entram a legenda, a voz e os sons por cima.
export const roteiro = tempo as Roteiro;
export const formato: Formato = '${formato}';

export const Video: React.FC = () => <Filme3D roteiro={roteiro} pasta="${pasta}" />;
`,
  );
} else {
  // vídeo mínimo que já funciona, pra ser trocado pelas cenas de verdade
  fs.writeFileSync(
    path.join(dir, 'video.tsx'),
  `import React from 'react';
import type {Formato, PropsBloco, Roteiro} from '../../motor';
import {Filme, Palco, blocos, curva, usePalco} from '../../motor';
import {visual} from '../../estilos/${estilo}';
import tempo from './tempo.json';

export const roteiro = tempo as Roteiro;
export const formato: Formato = '${formato}';

const Rascunho: React.FC<PropsBloco> = ({seg}) => {
  const {meioX, meioY, un} = usePalco();
  return (
    <Palco>
      <circle cx={meioX} cy={meioY} r={200 * un * curva(seg, 0, 0.8)} fill={Object.values(visual.cores)[0]} />
    </Palco>
  );
};

export const Video: React.FC = () => <Filme roteiro={roteiro} visual={visual} trechos={blocos([[0, roteiro.frases.length - 1, Rascunho]])} />;
`,
  );
}

atualizarCatalogo();
ok(`projects/${pasta}/ criado (estilo ${estilo}, ${formato}).`);
console.log(`  Próximo passo: escrever a Fala no roteiro.md e rodar  node ferramentas/narrar.mjs ${nome}`);
if (e3d) console.log(`  Depois: a cena no cena3d.py e  node ferramentas/blender.mjs ${nome} --quadro <segundo>  (guia em blender/GUIA.md)`);
