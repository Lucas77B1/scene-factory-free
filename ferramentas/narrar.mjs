// Escreve o tempo.json: quando cada frase e cada palavra acontece.
//   sem voz:        node ferramentas/narrar.mjs <nome>
//   com voz gravada: node ferramentas/narrar.mjs <nome> --audio <arquivo de áudio>
// Com voz, o tempo sai das pausas da gravação (uma pausa curta entre as frases ajuda muito).
import fs from 'node:fs';
import path from 'node:path';
import {PROJETOS, PUBLICO, acharProjeto, argumentos, aviso, exigeMotor, ff, lerFala, ok, para} from './comum.mjs';

const {pos, op} = argumentos();
const pasta = acharProjeto(pos[0]);
const frases = lerFala(pasta);
const saida = path.join(PROJETOS, pasta, 'tempo.json');
const peso = (w) => w.replace(/[^\p{L}\p{N}]/gu, '').length;

/** espalha as palavras de uma frase entre ini e fim, proporcional ao tamanho de cada uma */
const palavrasEntre = (texto, ini, fim) => {
  const ws = texto.split(/\s+/).filter(Boolean);
  const pw = ws.map((w) => peso(w) + 1.5);
  const tot = pw.reduce((a, b) => a + b, 0);
  let acc = 0;
  return ws.map((w, i) => {
    const a = ini + (acc / tot) * (fim - ini);
    acc += pw[i];
    return {p: w, ini: +a.toFixed(3), fim: +(ini + (acc / tot) * (fim - ini)).toFixed(3)};
  });
};

if (!op.audio) {
  // tempo de leitura: o ritmo de quem lê a legenda com calma
  let t = 0.4;
  const lista = frases.map((texto) => {
    const ws = texto.split(/\s+/).filter(Boolean);
    const dur = Math.max(1.6, ws.reduce((a, w) => a + 0.16 + peso(w) * 0.052, 0));
    const f = {texto, ini: +t.toFixed(3), fim: +(t + dur).toFixed(3), palavras: palavrasEntre(texto, t, t + dur)};
    t += dur + 0.45;
    return f;
  });
  const total = +(t + 1.2).toFixed(3);
  fs.writeFileSync(saida, JSON.stringify({origem: 'leitura', total, frases: lista}, null, 1));
  ok(`tempo de leitura escrito: ${lista.length} frases, ${total.toFixed(1)} s.`);
  process.exit(0);
}

// ---------------------------------------------------------------- com voz gravada
exigeMotor();
const origem = path.resolve(op.audio);
if (!fs.existsSync(origem)) para(`Não achei o áudio: ${op.audio}`);
const destDir = path.join(PUBLICO, 'projects', pasta);
fs.mkdirSync(destDir, {recursive: true});
const ext = path.extname(origem).toLowerCase() || '.mp3';
const precisaConverter = !['.mp3', '.wav', '.m4a', '.aac'].includes(ext);
const destino = path.join(destDir, precisaConverter ? 'voz.mp3' : `voz${ext}`);
if (precisaConverter) {
  const r = ff('ffmpeg', ['-y', '-v', 'error', '-i', origem, '-ac', '1', '-ar', '44100', destino]);
  if (r.codigo !== 0) para('Não consegui ler esse áudio. Tente mandar em mp3, m4a ou wav.');
} else fs.copyFileSync(origem, destino);

const pr = ff('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', destino]);
const dur = Number(pr.saida.trim());
if (!dur) para('Não consegui medir a duração do áudio.');

const det = ff('ffmpeg', ['-v', 'info', '-i', destino, '-af', 'silencedetect=noise=-38dB:d=0.15', '-f', 'null', '-']);
const log = det.erro + det.saida;
const silencios = [];
const re = /silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g;
for (let m; (m = re.exec(log)); ) silencios.push({a: Number(m[1]), b: Number(m[2])});

const n = frases.length;
const ini0 = silencios.length && silencios[0].a < 0.05 ? silencios[0].b : 0;
const fim0 = silencios.length && silencios[silencios.length - 1].b > dur - 0.1 ? silencios[silencios.length - 1].a : dur;
const cand = silencios.filter((s) => s.a > ini0 + 0.4 && s.b < fim0 - 0.4).map((s) => ({...s, len: s.b - s.a}));

let limites;
if (n === 1) limites = [ini0, fim0];
else if (cand.length < n - 1) {
  aviso('A gravação tem poucas pausas: o tempo das frases foi dividido pelo tamanho do texto. Confira a lista abaixo.');
  const pw = frases.map((f) => peso(f) + 4);
  const tot = pw.reduce((a, b) => a + b, 0);
  let acc = 0;
  limites = [];
  frases.forEach((_, k) => {
    limites.push(ini0 + (acc / tot) * (fim0 - ini0));
    acc += pw[k];
    limites.push(ini0 + (acc / tot) * (fim0 - ini0) - 0.1);
  });
} else {
  // escolhe, entre as pausas, as n-1 que melhor separam as frases (programação dinâmica)
  const pw = frases.map((f) => peso(f) + 4);
  const tot = pw.reduce((a, b) => a + b, 0);
  const ritmo = tot / Math.max(1, fim0 - ini0 - (n - 1) * 0.5);
  const esperado = (k) => pw[k] / ritmo;
  const m = cand.length;
  const comeco = (j) => (j < 0 ? ini0 : cand[j].b);
  const final = (j) => (j >= m ? fim0 : cand[j].a);
  const custo = (k, jp, j) => {
    const d = final(j) - comeco(jp);
    if (d <= 0.2) return 1e9;
    const l = Math.log(d / esperado(k));
    return l * l * 8 - (j < m ? Math.min(cand[j].len, 1) * 1.5 : 0);
  };
  let dp = Array.from({length: m}, (_, j) => custo(0, -1, j));
  const pais = [new Array(m).fill(-1)];
  for (let k = 1; k < n - 1; k++) {
    const nd = new Array(m).fill(1e18);
    const pk = new Array(m).fill(-1);
    for (let j = k; j < m; j++)
      for (let jp = Math.max(0, j - 14); jp < j; jp++) {
        if (dp[jp] >= 1e17) continue;
        const v = dp[jp] + custo(k, jp, j);
        if (v < nd[j]) {
          nd[j] = v;
          pk[j] = jp;
        }
      }
    dp = nd;
    pais.push(pk);
  }
  let j = -1;
  let melhor = 1e18;
  for (let q = 0; q < m; q++) {
    const v = dp[q] + custo(n - 1, q, m);
    if (v < melhor) {
      melhor = v;
      j = q;
    }
  }
  const esc = new Array(n - 1);
  for (let k = n - 2; k >= 0; k--) {
    esc[k] = j;
    j = pais[k][j];
  }
  limites = [ini0, ...esc.flatMap((q) => [cand[q].a, cand[q].b]), fim0];
}

const lista = frases.map((texto, k) => {
  const a = limites[2 * k];
  const b = limites[2 * k + 1];
  return {texto, ini: +a.toFixed(3), fim: +b.toFixed(3), palavras: palavrasEntre(texto, a, b)};
});
const audio = path.relative(PUBLICO, destino).split(path.sep).join('/');
const total = +(dur + 1.2).toFixed(3);
fs.writeFileSync(saida, JSON.stringify({origem: 'arquivo', total, audio, frases: lista}, null, 1));
ok(`tempo tirado da voz: ${lista.length} frases, ${total.toFixed(1)} s.`);
for (const [k, f] of lista.entries()) console.log(`  ${String(k).padStart(2)}  ${f.ini.toFixed(1).padStart(6)} a ${f.fim.toFixed(1).padStart(6)}  ${f.texto.slice(0, 60)}`);
console.log('  Confira: se alguma frase ficou com tempo absurdo, peça uma gravação com pausas mais marcadas.');
