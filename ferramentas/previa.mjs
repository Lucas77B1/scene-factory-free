// Tira fotos do vídeo pra conferir antes de gerar.
//   folha com uma foto a cada N segundos:  node ferramentas/previa.mjs <nome> [--cada 2]
//   fotos em tamanho cheio de momentos:    node ferramentas/previa.mjs <nome> 12.5 20
//   vitrine de um estilo:                  node ferramentas/previa.mjs --estilo <id> [segundos...]
import fs from 'node:fs';
import path from 'node:path';
import {ESTILOS, PROJETOS, acharProjeto, argumentos, atualizarCatalogo, exigeMotor, idDe, ok, para} from './comum.mjs';
import {escolher, montar, opcoesMotor} from './montar.mjs';

exigeMotor();
const {pos, op} = argumentos();
const estilo = typeof op.estilo === 'string' ? op.estilo : null;
if (estilo && !fs.existsSync(path.join(ESTILOS, estilo, 'index.tsx'))) para(`Não existe o estilo "${estilo}".`);
const pasta = estilo ? null : acharProjeto(pos[0]);
atualizarCatalogo();
const total = estilo ? 9 : JSON.parse(fs.readFileSync(path.join(PROJETOS, pasta, 'tempo.json'), 'utf8')).total;
const dir = estilo ? path.join(ESTILOS, estilo, 'vitrine') : path.join(PROJETOS, pasta, 'previa');
const ondeTxt = estilo ? `estilos/${estilo}/vitrine` : `projects/${pasta}/previa`;
fs.mkdirSync(dir, {recursive: true});

const momentos = pos.slice(estilo ? 0 : 1).map(Number).filter((x) => Number.isFinite(x));
const cheio = momentos.length > 0;
const cada = Number(op.cada ?? (estilo ? 1.5 : total > 120 ? 4 : 2));
const lista = cheio ? momentos : Array.from({length: Math.max(1, Math.floor(total / cada) + 1)}, (_, k) => Math.min(total - 0.1, 0.3 + k * cada));

const {renderStill} = await import('@remotion/renderer');
const servidor = await montar();
const comp = await escolher(servidor, estilo ? `vitrine-${estilo}` : idDe(pasta));
const nomeDe = (s) => `quadro-${s.toFixed(1).replace('.', '_')}s.jpg`;

// limpa a folha anterior
for (const f of fs.readdirSync(dir)) if (f.startsWith('folha-') || (!cheio && f.startsWith('f-'))) fs.rmSync(path.join(dir, f));

for (const [k, s] of lista.entries()) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps));
  const arq = cheio ? path.join(dir, nomeDe(s)) : path.join(dir, `f-${String(k).padStart(3, '0')}.jpg`);
  await renderStill({composition: comp, serveUrl: servidor, frame, output: arq, imageFormat: 'jpeg', jpegQuality: 80, scale: cheio ? 1 : 0.25, ...opcoesMotor()});
}

if (cheio) {
  ok(`${lista.length} foto(s) em tamanho cheio em ${ondeTxt}/`);
  for (const s of lista) console.log(`  ${nomeDe(s)}`);
} else {
  // junta as fotos numa folha só, usando o próprio motor (as fotos vão como imagem embutida)
  const colunas = comp.width > comp.height ? 5 : 7;
  const largFoto = Math.round(comp.width * 0.25);
  const altFoto = Math.round(comp.height * 0.25);
  const fotos = lista.map((s, k) => {
    const arq = path.join(dir, `f-${String(k).padStart(3, '0')}.jpg`);
    return {src: `data:image/jpeg;base64,${fs.readFileSync(arq).toString('base64')}`, seg: s};
  });
  const props = {fotos, colunas, largFoto, altFoto};
  const folha = path.join(dir, 'folha-de-fotos.jpg');
  const {selectComposition} = await import('@remotion/renderer');
  try {
    const compFolha = await selectComposition({serveUrl: servidor, id: 'folha-de-fotos', inputProps: props, ...opcoesMotor()});
    await renderStill({composition: compFolha, serveUrl: servidor, frame: 0, output: folha, imageFormat: 'jpeg', jpegQuality: 85, inputProps: props, ...opcoesMotor()});
  } catch (e) {
    para(`Não consegui juntar as fotos numa folha (${String(e?.message ?? e).split('\n')[0]}). As fotos soltas estão em ${ondeTxt}/.`);
  }
  for (const f of fs.readdirSync(dir)) if (f.startsWith('f-')) fs.rmSync(path.join(dir, f));
  ok(`folha com ${lista.length} fotos (uma a cada ${cada} s): ${ondeTxt}/folha-de-fotos.jpg`);
}
