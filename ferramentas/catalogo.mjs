// Atualiza a lista de projetos que o motor conhece e o catálogo de estilos.
// node ferramentas/catalogo.mjs
import fs from 'node:fs';
import path from 'node:path';
import {ESTILOS, atualizarCatalogo, ok} from './comum.mjs';

const pastas = atualizarCatalogo();
ok(`${pastas.length} projeto(s) no motor.`);

// catálogo de estilos: lê as três primeiras linhas marcadas do guia.md de cada estilo
const linhas = ['# Style catalog', '', 'Written by ferramentas/catalogo.mjs. Each style has a guia.md (in Portuguese) with its look and what to avoid.', '', '| id | Name | Type | Look (pt) | Good for (pt) |', '|---|---|---|---|---|'];
let n = 0;
for (const id of fs.readdirSync(ESTILOS).sort()) {
  const guia = path.join(ESTILOS, id, 'guia.md');
  if (!fs.existsSync(guia)) continue;
  const g = fs.readFileSync(guia, 'utf8');
  const campo = (k) => (g.match(new RegExp(`\\*\\*${k}:\\*\\*\\s*(.+)`)) ?? [, ''])[1].trim();
  const nome = (g.match(/^#\s+(.+)/m) ?? [, id])[1].trim();
  linhas.push(`| ${id} | ${nome} | ${campo('Tipo')} | ${campo('Cara')} | ${campo('Bom pra')} |`);
  n++;
}
linhas.push('', '## In the full version', '', 'These styles are part of the full Scene Factory (https://fabricadecenas.netlify.app/en/): Stickers, Watercolor, Azulejo Tiles, Balloon, Block 3D, Charcoal, Constellation, Cordel Woodcut, Travel Journal, Diorama, Felt, Comic Book, Crayon, Hologram, Infographic, Old Newspaper, Storybook Pencil, Chalkboard, Minimal, Ink Brush, Pixel, Pop Art, Retro Poster, Paper Cutout, Synthwave.');
fs.writeFileSync(path.join(ESTILOS, 'CATALOGO.md'), linhas.join('\n') + '\n');
ok(`${n} estilo(s) no catálogo.`);
