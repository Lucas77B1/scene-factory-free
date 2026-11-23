// O relógio da fábrica: tudo é medido em segundos, nunca em quadros.

export const QPS = 30; // quadros por segundo do vídeo final

export type Palavra = {p: string; ini: number; fim: number};
export type Frase = {texto: string; ini: number; fim: number; palavras: Palavra[]};
/** o tempo de cada frase e de cada palavra, escrito pela ferramenta narrar */
export type Roteiro = {
  /** de onde veio o tempo: leitura (sem voz) ou arquivo (voz gravada) */
  origem: 'leitura' | 'arquivo';
  /** duração total do vídeo, em segundos */
  total: number;
  /** áudio da narração, relativo à pasta public/ */
  audio?: string;
  frases: Frase[];
};

export type Formato = 'vertical' | 'horizontal' | 'quadrado';
export const TAMANHOS: Record<Formato, [number, number]> = {
  vertical: [1080, 1920],
  horizontal: [1920, 1080],
  quadrado: [1080, 1080],
};

const limita = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** suavizações: recebem 0..1 e devolvem 0..1 */
export const suave = {
  linear: (x: number) => x,
  entra: (x: number) => x * x * x,
  sai: (x: number) => 1 - Math.pow(1 - x, 3),
  ambos: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  /** passa um pouco do ponto e volta, como mola */
  mola: (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return 1 - Math.cos(x * Math.PI * 2.5) * Math.exp(-5 * x);
  },
};

/** vai de 0 a 1 entre os segundos `de` e `ate` (a base de toda animação) */
export const curva = (seg: number, de: number, ate: number, s: (x: number) => number = suave.ambos) =>
  ate <= de ? (seg >= ate ? 1 : 0) : s(limita((seg - de) / (ate - de)));

/** entra, fica e sai: 0 → 1 → 0, com rampas de `entrada` e `saida` segundos */
export const presenca = (seg: number, de: number, ate: number, entrada = 0.3, saida = 0.3) =>
  Math.min(curva(seg, de, de + entrada), 1 - curva(seg, ate - saida, ate));

/** mistura dois números */
export const mistura = (a: number, b: number, p: number) => a + (b - a) * p;

/** oscilação suave em torno de 0 (respiração, vento, balanço) */
export const onda = (seg: number, porSegundo = 0.5, fase = 0) => Math.sin((seg * porSegundo + fase) * Math.PI * 2);

/** número "aleatório" que é sempre o mesmo para a mesma semente (nunca use Math.random) */
export const sorte = (semente: string | number) => {
  let h = 2166136261;
  const s = String(semente);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
};

/** valor por pontos no tempo: marcos = [[segundo, valor], ...] */
export const marcos = (seg: number, pontos: [number, number][], s: (x: number) => number = suave.ambos) => {
  if (!pontos.length) return 0;
  if (seg <= pontos[0][0]) return pontos[0][1];
  for (let i = 1; i < pontos.length; i++) {
    const [t0, v0] = pontos[i - 1];
    const [t1, v1] = pontos[i];
    if (seg <= t1) return mistura(v0, v1, curva(seg, t0, t1, s));
  }
  return pontos[pontos.length - 1][1];
};

const limpa = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** o segundo em que uma palavra é dita (na frase `frase`, contando do 0). Sem achar, devolve o início da frase. */
export const momento = (r: Roteiro, palavra: string, frase: number, qual = 1) => {
  const f = r.frases[frase];
  if (!f) return 0;
  const alvo = limpa(palavra);
  let n = 0;
  for (const p of f.palavras) if (limpa(p.p) === alvo && ++n === qual) return p.ini;
  return f.ini;
};

/** início, fim e um ponto no meio de uma frase */
export const frase = (r: Roteiro, i: number) => {
  const f = r.frases[Math.max(0, Math.min(r.frases.length - 1, i))];
  return {ini: f.ini, fim: f.fim, em: (p: number) => mistura(f.ini, f.fim, p)};
};
