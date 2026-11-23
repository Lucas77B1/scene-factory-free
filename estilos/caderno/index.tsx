// Estilo "Caderno": caneta esferográfica azul numa folha pautada, com marca-texto colorido e letra de mão.
// Tudo nasce do traço: as linhas se desenham sozinhas, como alguém anotando ao vivo.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as carregaCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as carregaPatrick} from '@remotion/google-fonts/PatrickHand';
import type {Ponto, Visual} from '../../motor';
import {caixa, curva, elipse, montarKit, onda, sorte, suave, trilha, usePalco} from '../../motor';

const {fontFamily: CAVEAT} = carregaCaveat('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});
const {fontFamily: PATRICK} = carregaPatrick('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

// ---------------------------------------------------------------- cores
export const COR = {
  papel: '#FBF8EF',
  pauta: '#BFD3EA',
  margem: '#E79A9A',
  caneta: '#1F3A93',
  tinta: '#1F3A93',
  grafite: '#3B3B44',
  amarelo: '#FFE45C',
  rosa: '#FF8FC0',
  verde: '#8EE38A',
  laranja: '#FFB45C',
  azulClaro: '#8FD3FF',
  vermelho: '#E5484D',
};

// ---------------------------------------------------------------- fundo e textura
const Fundo: React.FC = () => {
  const {larg, alt, un} = usePalco();
  const passo = 64 * un;
  const linhas = Math.ceil(alt / passo);
  return (
    <AbsoluteFill style={{background: COR.papel}}>
      <svg width={larg} height={alt} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: linhas}, (_, k) => (
          <line key={k} x1={0} x2={larg} y1={(k + 1.5) * passo} y2={(k + 1.5) * passo} stroke={COR.pauta} strokeWidth={2.2 * un} />
        ))}
        <line x1={larg * 0.07} x2={larg * 0.07} y1={0} y2={alt} stroke={COR.margem} strokeWidth={3 * un} />
      </svg>
    </AbsoluteFill>
  );
};

const Textura: React.FC = () => {
  const {larg, alt} = usePalco();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.35}}>
      <svg width={larg} height={alt}>
        <filter id="caderno-fibra">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.35 0" />
        </filter>
        <rect width={larg} height={alt} filter="url(#caderno-fibra)" />
      </svg>
    </AbsoluteFill>
  );
};

/** troca de cena: uma folha nova passa por cima, como virar a página */
const Passagem: React.FC<{p: number}> = ({p}) => {
  const {larg, alt} = usePalco();
  const x = (1 - p * 2) * larg * 1.15;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={larg} height={alt}>
        <rect x={x} y={-20} width={larg * 1.1} height={alt + 40} fill={COR.papel} />
        <rect x={x - 26} y={-20} width={26} height={alt + 40} fill="#000" opacity={0.08} />
      </svg>
    </AbsoluteFill>
  );
};

export const visual: Visual = {
  id: 'caderno',
  nome: 'Caderno',
  cores: COR,
  letra: {titulo: CAVEAT, texto: PATRICK},
  legenda: {cor: COR.grafite, destaque: COR.caneta, fundo: 'rgba(255,228,92,0.85)'},
  Fundo,
  Passagem,
  Textura,
};

// ---------------------------------------------------------------- as peças

/** um traço que se desenha sozinho: p vai de 0 (nada) a 1 (completo) */
export const Rabisco: React.FC<{d: string; p?: number; cor?: string; grossura?: number; tracejado?: boolean}> = ({d, p = 1, cor = COR.caneta, grossura = 7, tracejado = false}) => {
  const {un} = usePalco();
  if (p <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={cor}
      strokeWidth={grossura * un}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={tracejado ? undefined : '1 1'}
      strokeDashoffset={tracejado ? undefined : 1 - Math.min(1, p)}
      opacity={tracejado ? Math.min(1, p * 2) : 1}
    />
  );
};

/** forma pintada de marca-texto (cor que entra) com contorno de caneta que se desenha */
export const Desenho: React.FC<{d: string; p?: number; cor?: string; contorno?: string; grossura?: number}> = ({d, p = 1, cor, contorno = COR.caneta, grossura = 6}) => {
  if (p <= 0) return null;
  const pinta = curva(p, 0.45, 1);
  return (
    <g>
      {cor && <path d={d} fill={cor} opacity={0.85 * pinta} />}
      <Rabisco d={d} p={curva(p, 0, 0.75, suave.linear)} cor={contorno} grossura={grossura} />
    </g>
  );
};

/** faixa de marca-texto atrás de algo (sublinhado grosso) */
export const MarcaTexto: React.FC<{x: number; y: number; larg: number; alt?: number; p?: number; cor?: string}> = ({x, y, larg, alt = 50, p = 1, cor = COR.amarelo}) => {
  const {un} = usePalco();
  if (p <= 0) return null;
  const h = alt * un;
  return <path d={`M${x} ${y} L${x + larg * Math.min(1, p)} ${y - 4 * un}`} stroke={cor} strokeWidth={h} strokeLinecap="round" opacity={0.75} />;
};

/** seta curva que se desenha de A até B */
export const Seta: React.FC<{de: Ponto; ate: Ponto; p?: number; curva?: number; cor?: string}> = ({de, ate, p = 1, curva: cv = 0.25, cor = COR.caneta}) => {
  const {un} = usePalco();
  const [x0, y0] = de;
  const [x1, y1] = ate;
  const mx = (x0 + x1) / 2 - (y1 - y0) * cv;
  const my = (y0 + y1) / 2 + (x1 - x0) * cv;
  const ang = Math.atan2(y1 - my, x1 - mx);
  const k = 26 * un;
  const ponta = `M${x1 - Math.cos(ang - 0.5) * k} ${y1 - Math.sin(ang - 0.5) * k} L${x1} ${y1} L${x1 - Math.cos(ang + 0.5) * k} ${y1 - Math.sin(ang + 0.5) * k}`;
  return (
    <g>
      <Rabisco d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} p={curva(p, 0, 0.8, suave.linear)} cor={cor} />
      <Rabisco d={ponta} p={curva(p, 0.8, 1, suave.linear)} cor={cor} />
    </g>
  );
};

/** círculo de caneta em volta de algo, daqueles feitos à mão (dá mais de uma volta) */
export const Circulado: React.FC<{x: number; y: number; rx: number; ry?: number; p?: number; cor?: string}> = ({x, y, rx, ry, p = 1, cor = COR.vermelho}) => {
  const r2 = ry ?? rx * 0.6;
  const pts: Ponto[] = Array.from({length: 26}, (_, i) => {
    const a = -Math.PI * 0.6 + (i / 25) * Math.PI * 2.2;
    const k = 1 + i * 0.006;
    return [x + Math.cos(a) * rx * k, y + Math.sin(a) * r2 * k];
  });
  return <Rabisco d={trilha(pts)} p={p} cor={cor} grossura={6} />;
};

/** texto escrito à mão que vai aparecendo letra por letra */
export const Escrito: React.FC<{texto: string; x: number; y: number; p?: number; tam?: number; cor?: string; meio?: boolean}> = ({texto, x, y, p = 1, tam = 90, cor = COR.caneta, meio = true}) => {
  const {un} = usePalco();
  const n = Math.round(texto.length * Math.min(1, p));
  if (n <= 0) return null;
  return (
    <text x={x} y={y} textAnchor={meio ? 'middle' : 'start'} fontFamily={CAVEAT} fontWeight={700} fontSize={tam * un} fill={cor}>
      {texto.slice(0, n)}
    </text>
  );
};

// ---------------------------------------------------------------- a gente do caderno
export type Cara = 'feliz' | 'serio' | 'espanto' | 'triste' | 'bravo';

/**
 * Pessoinha de caderno: cabeça redonda grande, corpo de marca-texto, braços e pernas de risco.
 * `y` é o chão (os pés). `bracos` em graus a partir de "pra baixo" (170 = pra cima).
 */
export const Pessoinha: React.FC<{
  x: number;
  y: number;
  tam?: number;
  seg?: number;
  cor?: string;
  cara?: Cara;
  bracos?: [number, number];
  anda?: number;
  cabelo?: 'nenhum' | 'curto' | 'longo' | 'coque';
  p?: number;
  semente?: number;
}> = ({x, y, tam = 420, seg = 0, cor = COR.azulClaro, cara = 'feliz', bracos = [20, 20], anda = 0, cabelo = 'curto', p = 1, semente = 1}) => {
  const {un} = usePalco();
  const h = tam * un;
  const resp = onda(seg, 0.35, sorte(semente)) * h * 0.008;
  const cabR = h * 0.2;
  const cy = y - h * 0.72 + resp;
  const ombro = y - h * 0.48 + resp;
  const quadril = y - h * 0.24;
  const passo = anda ? onda(seg, 1.6 * anda) * h * 0.08 : 0;
  const braco = (ang: number, lado: number) => {
    const a = ((ang + (anda ? onda(seg, 1.6 * anda, lado * 0.5) * 20 : 0)) * Math.PI) / 180;
    const comp = h * 0.24;
    const mx = x + lado * h * 0.1 + Math.sin(a) * comp * lado;
    const my = ombro + Math.cos(a) * comp;
    return `M${x + lado * h * 0.1} ${ombro} L${mx} ${my}`;
  };
  const piscar = (seg + sorte(semente) * 3) % 3.4 < 0.12;
  const olhoY = cy - cabR * 0.05;
  const olho = (lado: number) =>
    cara === 'espanto' ? (
      <circle cx={x + lado * cabR * 0.36} cy={olhoY} r={cabR * 0.13} fill="#fff" stroke={COR.caneta} strokeWidth={4 * un} />
    ) : piscar || cara === 'feliz' ? (
      <path d={`M${x + lado * cabR * 0.36 - cabR * 0.12} ${olhoY + 2} q${cabR * 0.12} ${-cabR * 0.14} ${cabR * 0.24} 0`} fill="none" stroke={COR.caneta} strokeWidth={5 * un} strokeLinecap="round" />
    ) : (
      <circle cx={x + lado * cabR * 0.36} cy={olhoY} r={cabR * 0.08} fill={COR.caneta} />
    );
  const boca = {
    feliz: `M${x - cabR * 0.3} ${cy + cabR * 0.32} q${cabR * 0.3} ${cabR * 0.32} ${cabR * 0.6} 0`,
    serio: `M${x - cabR * 0.22} ${cy + cabR * 0.42} h${cabR * 0.44}`,
    espanto: '',
    triste: `M${x - cabR * 0.26} ${cy + cabR * 0.5} q${cabR * 0.26} ${-cabR * 0.24} ${cabR * 0.52} 0`,
    bravo: `M${x - cabR * 0.26} ${cy + cabR * 0.46} q${cabR * 0.26} ${-cabR * 0.12} ${cabR * 0.52} 0`,
  }[cara];
  const corpo = trilha(
    [
      [x - h * 0.13, ombro - h * 0.02],
      [x + h * 0.13, ombro - h * 0.02],
      [x + h * 0.17, quadril],
      [x - h * 0.17, quadril],
    ],
    true,
  );
  return (
    <g opacity={Math.min(1, p * 1.5)}>
      <Rabisco d={`M${x - h * 0.06} ${quadril} L${x - h * 0.08 + passo} ${y}`} p={curva(p, 0, 0.4)} grossura={8} />
      <Rabisco d={`M${x + h * 0.06} ${quadril} L${x + h * 0.08 - passo} ${y}`} p={curva(p, 0, 0.4)} grossura={8} />
      <Desenho d={corpo} p={curva(p, 0.1, 0.8)} cor={cor} />
      <Rabisco d={braco(bracos[0], -1)} p={curva(p, 0.3, 0.7)} grossura={8} />
      <Rabisco d={braco(bracos[1], 1)} p={curva(p, 0.3, 0.7)} grossura={8} />
      {cabelo === 'longo' && <Desenho d={elipse(x, cy + cabR * 0.25, cabR * 1.15, cabR * 1.1, 0.04, semente)} p={curva(p, 0.2, 0.9)} cor="#5A3E2B" />}
      <Desenho d={elipse(x, cy, cabR, cabR * 0.96, 0.03, semente)} p={curva(p, 0, 0.7)} cor="#FFE6CC" />
      {cabelo === 'curto' && <Desenho d={`M${x - cabR * 0.98} ${cy - cabR * 0.05} Q${x - cabR * 0.9} ${cy - cabR * 1.2} ${x} ${cy - cabR * 1.02} Q${x + cabR * 0.9} ${cy - cabR * 1.2} ${x + cabR * 0.98} ${cy - cabR * 0.05} Q${x + cabR * 0.4} ${cy - cabR * 0.6} ${x - cabR * 0.98} ${cy - cabR * 0.05} Z`} p={curva(p, 0.3, 0.9)} cor="#5A3E2B" />}
      {cabelo === 'coque' && <Desenho d={elipse(x, cy - cabR * 1.05, cabR * 0.38, cabR * 0.32, 0.05, semente)} p={curva(p, 0.3, 0.9)} cor="#5A3E2B" />}
      {p > 0.7 && (
        <g>
          {olho(-1)}
          {olho(1)}
          {cara === 'espanto' ? <ellipse cx={x} cy={cy + cabR * 0.45} rx={cabR * 0.13} ry={cabR * 0.18} fill={COR.caneta} /> : <path d={boca} fill="none" stroke={COR.caneta} strokeWidth={5 * un} strokeLinecap="round" />}
          {cara === 'bravo' && <path d={`M${x - cabR * 0.5} ${cy - cabR * 0.3} l${cabR * 0.3} ${cabR * 0.12} M${x + cabR * 0.5} ${cy - cabR * 0.3} l${-cabR * 0.3} ${cabR * 0.12}`} stroke={COR.caneta} strokeWidth={5 * un} strokeLinecap="round" />}
          <circle cx={x - cabR * 0.62} cy={cy + cabR * 0.25} r={cabR * 0.12} fill={COR.rosa} opacity={0.5} />
          <circle cx={x + cabR * 0.62} cy={cy + cabR * 0.25} r={cabR * 0.12} fill={COR.rosa} opacity={0.5} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- desenhos prontos (o molde pra desenhar coisa nova)

export const Sol: React.FC<{x: number; y: number; r?: number; p?: number; seg?: number}> = ({x, y, r = 110, p = 1, seg = 0}) => {
  const {un} = usePalco();
  const R = r * un;
  return (
    <g>
      <Desenho d={elipse(x, y, R, R, 0.04, 3)} p={curva(p, 0, 0.6)} cor={COR.amarelo} />
      {Array.from({length: 10}, (_, k) => {
        const a = (k / 10) * Math.PI * 2 + seg * 0.15;
        const r1 = R * 1.3;
        const r2 = R * (1.65 + 0.08 * onda(seg, 0.8, k / 10));
        return <Rabisco key={k} d={`M${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1} L${x + Math.cos(a) * r2} ${y + Math.sin(a) * r2}`} p={curva(p, 0.4 + k * 0.05, 0.6 + k * 0.05)} grossura={7} />;
      })}
    </g>
  );
};

export const Nuvem: React.FC<{x: number; y: number; tam?: number; p?: number; cor?: string; seg?: number}> = ({x, y, tam = 1, p = 1, cor = '#FFFFFF', seg = 0}) => {
  const {un} = usePalco();
  const k = tam * un;
  const dx = onda(seg, 0.08, x / 1000) * 14 * un;
  const d = `M${x - 160 * k + dx} ${y + 40 * k} Q${x - 210 * k + dx} ${y - 30 * k} ${x - 120 * k + dx} ${y - 40 * k} Q${x - 90 * k + dx} ${y - 120 * k} ${x + dx} ${y - 90 * k} Q${x + 90 * k + dx} ${y - 140 * k} ${x + 130 * k + dx} ${y - 40 * k} Q${x + 210 * k + dx} ${y - 30 * k} ${x + 170 * k + dx} ${y + 40 * k} Z`;
  return <Desenho d={d} p={p} cor={cor} />;
};

export const Gota: React.FC<{x: number; y: number; tam?: number; p?: number}> = ({x, y, tam = 60, p = 1}) => {
  const {un} = usePalco();
  const k = tam * un;
  return <Desenho d={`M${x} ${y - k} Q${x + k * 0.75} ${y} ${x} ${y + k * 0.55} Q${x - k * 0.75} ${y} ${x} ${y - k} Z`} p={p} cor={COR.azulClaro} grossura={5} />;
};

export const Chuva: React.FC<{x0: number; x1: number; y0: number; y1: number; seg: number; n?: number}> = ({x0, x1, y0, y1, seg, n = 18}) => (
  <g>
    {Array.from({length: n}, (_, k) => {
      const x = x0 + sorte(`cx${k}`) * (x1 - x0);
      const y = y0 + (((sorte(`cy${k}`) + seg * 0.9) % 1) * (y1 - y0));
      return <Gota key={k} x={x} y={y} tam={34} />;
    })}
  </g>
);

export const Arvore: React.FC<{x: number; y: number; tam?: number; p?: number; seg?: number}> = ({x, y, tam = 1, p = 1, seg = 0}) => {
  const {un} = usePalco();
  const k = tam * un;
  const v = onda(seg, 0.3, x / 500) * 6 * un;
  return (
    <g>
      <Desenho d={caixa(x - 26 * k, y - 230 * k, 52 * k, 230 * k, 10 * k)} p={curva(p, 0, 0.5)} cor="#C98A5A" />
      <Desenho d={elipse(x + v, y - 330 * k, 170 * k, 150 * k, 0.08, 7)} p={curva(p, 0.3, 1)} cor={COR.verde} />
    </g>
  );
};

export const Casa: React.FC<{x: number; y: number; tam?: number; p?: number; cor?: string}> = ({x, y, tam = 1, p = 1, cor = COR.laranja}) => {
  const {un} = usePalco();
  const k = tam * un;
  return (
    <g>
      <Desenho d={caixa(x - 150 * k, y - 220 * k, 300 * k, 220 * k)} p={curva(p, 0, 0.6)} cor={cor} />
      <Desenho d={trilha([[x - 190 * k, y - 210 * k], [x, y - 360 * k], [x + 190 * k, y - 210 * k]], true, true)} p={curva(p, 0.2, 0.8)} cor={COR.vermelho} />
      <Desenho d={caixa(x - 40 * k, y - 120 * k, 80 * k, 120 * k, 8 * k)} p={curva(p, 0.5, 1)} cor="#C98A5A" />
    </g>
  );
};

export const Estrela: React.FC<{x: number; y: number; r?: number; p?: number; cor?: string}> = ({x, y, r = 60, p = 1, cor = COR.amarelo}) => {
  const {un} = usePalco();
  const R = r * un;
  const pts: Ponto[] = Array.from({length: 10}, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? R * 0.45 : R;
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
  });
  return <Desenho d={trilha(pts, true, true)} p={p} cor={cor} />;
};

export const Coracao: React.FC<{x: number; y: number; tam?: number; p?: number; cor?: string}> = ({x, y, tam = 80, p = 1, cor = COR.rosa}) => {
  const {un} = usePalco();
  const k = tam * un;
  return <Desenho d={`M${x} ${y + k * 0.8} C${x - k * 1.4} ${y - k * 0.1} ${x - k * 0.6} ${y - k * 1.1} ${x} ${y - k * 0.4} C${x + k * 0.6} ${y - k * 1.1} ${x + k * 1.4} ${y - k * 0.1} ${x} ${y + k * 0.8} Z`} p={p} cor={cor} />;
};

/** o chão: uma linha de caneta que se desenha de ponta a ponta */
export const Chao: React.FC<{y: number; p?: number}> = ({y, p = 1}) => {
  const {larg, un} = usePalco();
  return <Rabisco d={trilha([[larg * 0.04, y], [larg * 0.35, y - 6 * un], [larg * 0.65, y + 4 * un], [larg * 0.96, y - 2 * un]])} p={p} grossura={6} />;
};

/** onda de mar desenhada */
export const Mar: React.FC<{y: number; seg: number; p?: number}> = ({y, seg, p = 1}) => {
  const {larg, alt, un} = usePalco();
  const pts: Ponto[] = Array.from({length: 13}, (_, i) => [(larg * i) / 12, y + onda(seg, 0.4, i * 0.3) * 16 * un]);
  return <Desenho d={trilha([[-20, alt + 20], ...pts, [larg + 20, alt + 20]], true)} p={p} cor={COR.azulClaro} />;
};

// ---------------------------------------------------------------- o kit comum (vitrine e peças padrão)
export const kit = montarKit({
  visual,
  cor: {
    tinta: COR.caneta,
    papel: COR.papel,
    ceu: COR.azulClaro,
    sol: COR.amarelo,
    nuvem: '#FFFFFF',
    folha: COR.verde,
    tronco: '#C98A5A',
    agua: COR.azulClaro,
    terra: '#EAD9B8',
    pele: '#FFE6CC',
    cabelo: '#5A3E2B',
    roupa: [COR.azulClaro, COR.rosa, COR.laranja, COR.verde],
    destaque: COR.vermelho,
  },
  Forma: ({d, p = 1, cor}) => <Desenho d={d} p={p} cor={cor} />,
  Traco: ({d, p = 1, cor, grossura = 7}) => <Rabisco d={d} p={p} cor={cor ?? COR.caneta} grossura={Math.min(grossura, 9)} />,
});
