// Gera o vídeo final em MP4, em finished-videos/. Cada vez vira uma versão nova (-v1, -v2...): nada é apagado.
// node ferramentas/gerar.mjs <nome>
import fs from 'node:fs';
import path from 'node:path';
import {ENTREGUES, NA_NUVEM, acharProjeto, argumentos, atualizarCatalogo, exigeMotor, idDe, ok} from './comum.mjs';
import {escolher, montar, opcoesMotor} from './montar.mjs';

exigeMotor();
const {pos} = argumentos();
const pasta = acharProjeto(pos[0]);
atualizarCatalogo();
fs.mkdirSync(ENTREGUES, {recursive: true});
let v = 1;
while (fs.existsSync(path.join(ENTREGUES, `${pasta}-v${v}.mp4`))) v++;
const saida = path.join(ENTREGUES, `${pasta}-v${v}.mp4`);

const {renderMedia} = await import('@remotion/renderer');
console.log(NA_NUVEM ? 'Montando o vídeo (na nuvem não tem placa de vídeo: leva alguns minutos)...' : 'Montando o vídeo...');
const servidor = await montar();
const comp = await escolher(servidor, idDe(pasta));
let ultimo = -1;
await renderMedia({
  composition: comp,
  serveUrl: servidor,
  codec: 'h264',
  outputLocation: saida,
  imageFormat: 'jpeg',
  jpegQuality: 90,
  crf: 20,
  ...opcoesMotor(),
  onProgress: ({progress}) => {
    const p = Math.floor(progress * 10) * 10;
    if (p !== ultimo) {
      ultimo = p;
      console.log(`  ${p}%`);
    }
  },
});
const mb = fs.statSync(saida).size / 1024 / 1024;
ok(`finished-videos/${path.basename(saida)}  (${(comp.durationInFrames / comp.fps).toFixed(1)} s, ${mb.toFixed(1)} MB)`);
