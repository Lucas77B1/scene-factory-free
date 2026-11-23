// O molde comum de todos os estilos. Cada estilo diz COMO desenhar uma forma e um traço (o jeito dele),
// e daqui saem a pessoa e os desenhos prontos (sol, nuvem, árvore, casa...) já na cara daquele estilo.
import React from 'react';
import type {Visual} from './estilo';
import type {Ponto} from './palco';
import {caixa, elipse, trilha, usePalco} from './palco';
import {curva, onda, sorte} from './tempo';

/** as cores com nome que todo estilo precisa ter */
export type Paleta = {
  tinta: string;
  papel: string;
  ceu: string;
  sol: string;
  nuvem: string;
  folha: string;
  tronco: string;
  agua: string;
  terra: string;
  pele: string;
  cabelo: string;
  roupa: string[];
  destaque: string;
  /** cor dos olhos e da boca (padrão: tinta) */
  rosto?: string;
  [extra: string]: string | string[] | undefined;
};

/** forma fechada pintada (p = 0..1: o quanto já apareceu, do jeito do estilo) */
export type PropsForma = {d: string; p?: number; cor?: string; semente?: number; contorno?: boolean};
/** linha solta (p = 0..1) */
export type PropsTraco = {d: string; p?: number; cor?: string; grossura?: number};

export type Cara = 'feliz' | 'serio' | 'espanto' | 'triste' | 'bravo';
export type PropsPessoa = {
  x: number;
  /** o chão (os pés) */
  y: number;
  tam?: number;
  seg?: number;
  cara?: Cara;
  /** graus a partir de "pra baixo": 0 = braço caído, 170 = pra cima */
  bracos?: [number, number];
  /** cor da roupa (padrão: a primeira roupa da paleta) */
  roupa?: string;
  pele?: string;
  cabelo?: 'nenhum' | 'curto' | 'longo' | 'coque' | 'cacheado';
  corCabelo?: string;
  barba?: boolean;
  anda?: number;
  costas?: boolean;
  p?: number;
  semente?: number;
};

export type Molde = {
  visual: Visual;
  cor: Paleta;
  Forma: React.FC<PropsForma>;
  Traco: React.FC<PropsTraco>;
  /** proporções da pessoa neste estilo */
  pessoa?: {cabeca?: number; corpo?: 'tunica' | 'triangulo' | 'retangulo'; bochecha?: boolean; olhoGrande?: boolean};
  /** estilo de 3D leve: a vitrine e os vídeos usam camadas com profundidade */
  tresD?: boolean;
};

const rad = (g: number) => (g * Math.PI) / 180;

/** monta o kit completo de um estilo a partir do jeito dele de desenhar */
export const montarKit = (m: Molde) => {
  const {Forma, Traco, cor} = m;
  const prop = {cabeca: 0.2, corpo: 'tunica' as const, bochecha: true, olhoGrande: false, ...m.pessoa};

  const Pessoa: React.FC<PropsPessoa> = ({x, y, tam = 420, seg = 0, cara = 'feliz', bracos = [15, 15], roupa, pele, cabelo = 'curto', corCabelo, barba = false, anda = 0, costas = false, p = 1, semente = 1}) => {
    const {un} = usePalco();
    if (p <= 0) return null;
    const h = tam * un;
    const resp = onda(seg, 0.3, sorte(semente)) * h * 0.007;
    const R = h * prop.cabeca;
    const cy = y - h + R * 1.05 + resp;
    const ombro = cy + R * 1.05;
    const quadril = y - h * 0.22;
    const passo = anda ? onda(seg, 1.5 * anda) * h * 0.07 : 0;
    const corRoupa = roupa ?? cor.roupa[semente % cor.roupa.length];
    const corPele = pele ?? cor.pele;
    const corCab = corCabelo ?? cor.cabelo;
    const g = h * 0.045;
    const corpo =
      prop.corpo === 'retangulo'
        ? caixa(x - h * 0.15, ombro, h * 0.3, quadril - ombro + h * 0.06, h * 0.05)
        : prop.corpo === 'triangulo'
          ? trilha([[x - h * 0.08, ombro], [x + h * 0.08, ombro], [x + h * 0.2, quadril + h * 0.08], [x - h * 0.2, quadril + h * 0.08]], true, true)
          : trilha([[x - h * 0.12, ombro], [x + h * 0.12, ombro], [x + h * 0.19, quadril + h * 0.1], [x - h * 0.19, quadril + h * 0.1]], true);
    const braco = (ang: number, lado: number) => {
      const a = rad(ang + (anda ? onda(seg, 1.5 * anda, lado * 0.5) * 18 : 0));
      const sx = x + lado * h * 0.11;
      const sy = ombro + h * 0.03;
      const comp = h * 0.27;
      return {d: `M${sx} ${sy} L${sx + Math.sin(a) * comp * lado} ${sy + Math.cos(a) * comp}`, mao: [sx + Math.sin(a) * comp * lado, sy + Math.cos(a) * comp] as Ponto};
    };
    const bE = braco(bracos[0], -1);
    const bD = braco(bracos[1], 1);
    const piscar = (seg + sorte(semente) * 3) % 3.6 < 0.12;
    const oy = cy - R * 0.02;
    const ro = R * (prop.olhoGrande ? 0.13 : 0.085);
    const rosto = (cor.rosto as string | undefined) ?? cor.tinta;
    const olho = (l: number) =>
      cara === 'espanto' ? (
        <circle key={l} cx={x + l * R * 0.36} cy={oy} r={ro * 1.5} fill={cor.papel} stroke={rosto} strokeWidth={R * 0.05} />
      ) : piscar || cara === 'feliz' ? (
        <path key={l} d={`M${x + l * R * 0.36 - R * 0.12} ${oy + R * 0.02} q${R * 0.12} ${-R * 0.14} ${R * 0.24} 0`} fill="none" stroke={rosto} strokeWidth={R * 0.06} strokeLinecap="round" />
      ) : (
        <circle key={l} cx={x + l * R * 0.36} cy={oy} r={ro} fill={rosto} />
      );
    const boca: Record<Cara, string> = {
      feliz: `M${x - R * 0.28} ${cy + R * 0.3} q${R * 0.28} ${R * 0.3} ${R * 0.56} 0`,
      serio: `M${x - R * 0.2} ${cy + R * 0.42} h${R * 0.4}`,
      espanto: '',
      triste: `M${x - R * 0.24} ${cy + R * 0.5} q${R * 0.24} ${-R * 0.22} ${R * 0.48} 0`,
      bravo: `M${x - R * 0.24} ${cy + R * 0.46} q${R * 0.24} ${-R * 0.1} ${R * 0.48} 0`,
    };
    const parte = (a: number, b: number) => curva(p, a, b);
    return (
      <g>
        <Traco d={`M${x - h * 0.06} ${quadril} L${x - h * 0.07 + passo} ${y}`} p={parte(0, 0.4)} grossura={g / un} cor={cor.tinta} />
        <Traco d={`M${x + h * 0.06} ${quadril} L${x + h * 0.07 - passo} ${y}`} p={parte(0, 0.4)} grossura={g / un} cor={cor.tinta} />
        {cabelo === 'longo' && <Forma d={elipse(x, cy + R * 0.3, R * 1.12, R * 1.15, 0.03, semente)} p={parte(0.1, 0.6)} cor={corCab} semente={semente + 1} />}
        <Forma d={corpo} p={parte(0.1, 0.6)} cor={corRoupa} semente={semente} />
        <Traco d={bE.d} p={parte(0.3, 0.7)} grossura={g / un} cor={cor.tinta} />
        <Traco d={bD.d} p={parte(0.3, 0.7)} grossura={g / un} cor={cor.tinta} />
        <Forma d={elipse(bE.mao[0], bE.mao[1], h * 0.035, h * 0.035, 0, 1)} p={parte(0.5, 0.8)} cor={corPele} semente={semente + 2} />
        <Forma d={elipse(bD.mao[0], bD.mao[1], h * 0.035, h * 0.035, 0, 2)} p={parte(0.5, 0.8)} cor={corPele} semente={semente + 3} />
        <Forma d={elipse(x, cy, R, R * 0.97, 0.02, semente)} p={parte(0, 0.6)} cor={costas ? corCab : corPele} semente={semente + 4} />
        {!costas && cabelo === 'curto' && <Forma d={`M${x - R * 0.98} ${cy - R * 0.05} Q${x - R * 0.92} ${cy - R * 1.2} ${x} ${cy - R * 1.04} Q${x + R * 0.92} ${cy - R * 1.2} ${x + R * 0.98} ${cy - R * 0.05} Q${x + R * 0.4} ${cy - R * 0.62} ${x - R * 0.98} ${cy - R * 0.05} Z`} p={parte(0.3, 0.8)} cor={corCab} semente={semente + 5} />}
        {!costas && cabelo === 'cacheado' && Array.from({length: 7}, (_, k) => {
          const a = Math.PI * (1.05 + (k / 6) * 0.9);
          return <Forma key={k} d={elipse(x + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9, R * 0.3, R * 0.3, 0.05, k)} p={parte(0.3, 0.8)} cor={corCab} semente={semente + 6 + k} />;
        })}
        {!costas && cabelo === 'coque' && <Forma d={elipse(x, cy - R * 1.08, R * 0.36, R * 0.3, 0.04, semente)} p={parte(0.3, 0.8)} cor={corCab} semente={semente + 7} />}
        {!costas && barba && <Forma d={`M${x - R * 0.82} ${cy + R * 0.1} Q${x - R * 0.7} ${cy + R * 1.25} ${x} ${cy + R * 1.2} Q${x + R * 0.7} ${cy + R * 1.25} ${x + R * 0.82} ${cy + R * 0.1} Q${x} ${cy + R * 0.7} ${x - R * 0.82} ${cy + R * 0.1} Z`} p={parte(0.4, 0.8)} cor={corCab} semente={semente + 8} />}
        {!costas && p > 0.65 && (
          <g>
            {olho(-1)}
            {olho(1)}
            {cara === 'espanto' ? <ellipse cx={x} cy={cy + R * 0.48} rx={R * 0.12} ry={R * 0.17} fill={rosto} /> : <path d={boca[cara]} fill="none" stroke={rosto} strokeWidth={R * 0.06} strokeLinecap="round" />}
            {cara === 'bravo' && <path d={`M${x - R * 0.5} ${cy - R * 0.3} l${R * 0.3} ${R * 0.12} M${x + R * 0.5} ${cy - R * 0.3} l${-R * 0.3} ${R * 0.12}`} stroke={rosto} strokeWidth={R * 0.06} strokeLinecap="round" />}
            {prop.bochecha && !barba && [-1, 1].map((l) => <circle key={l} cx={x + l * R * 0.62} cy={cy + R * 0.26} r={R * 0.12} fill={cor.destaque} opacity={0.35} />)}
          </g>
        )}
      </g>
    );
  };

  const Sol: React.FC<{x: number; y: number; r?: number; p?: number; seg?: number}> = ({x, y, r = 110, p = 1, seg = 0}) => {
    const {un} = usePalco();
    const R = r * un;
    return (
      <g>
        <Forma d={elipse(x, y, R, R, 0.02, 3)} p={curva(p, 0, 0.6)} cor={cor.sol} />
        {Array.from({length: 10}, (_, k) => {
          const a = (k / 10) * Math.PI * 2 + seg * 0.12;
          const r1 = R * 1.28;
          const r2 = R * (1.6 + 0.08 * onda(seg, 0.8, k / 10));
          return <Traco key={k} d={`M${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1} L${x + Math.cos(a) * r2} ${y + Math.sin(a) * r2}`} p={curva(p, 0.4 + k * 0.05, 0.6 + k * 0.05)} cor={cor.sol} grossura={10} />;
        })}
      </g>
    );
  };

  const Nuvem: React.FC<{x: number; y: number; tam?: number; p?: number; seg?: number}> = ({x, y, tam = 1, p = 1, seg = 0}) => {
    const {un} = usePalco();
    const k = tam * un;
    const dx = onda(seg, 0.06, x / 1000) * 16 * un;
    const d = `M${x - 160 * k + dx} ${y + 40 * k} Q${x - 210 * k + dx} ${y - 30 * k} ${x - 120 * k + dx} ${y - 40 * k} Q${x - 90 * k + dx} ${y - 120 * k} ${x + dx} ${y - 90 * k} Q${x + 90 * k + dx} ${y - 140 * k} ${x + 130 * k + dx} ${y - 40 * k} Q${x + 210 * k + dx} ${y - 30 * k} ${x + 170 * k + dx} ${y + 40 * k} Z`;
    return <Forma d={d} p={p} cor={cor.nuvem} semente={Math.round(x)} />;
  };

  const Arvore: React.FC<{x: number; y: number; tam?: number; p?: number; seg?: number}> = ({x, y, tam = 1, p = 1, seg = 0}) => {
    const {un} = usePalco();
    const k = tam * un;
    const v = onda(seg, 0.25, x / 500) * 6 * un;
    return (
      <g>
        <Forma d={caixa(x - 26 * k, y - 230 * k, 52 * k, 230 * k, 8 * k)} p={curva(p, 0, 0.5)} cor={cor.tronco} semente={11} />
        <Forma d={elipse(x + v, y - 330 * k, 170 * k, 150 * k, 0.08, 7)} p={curva(p, 0.3, 1)} cor={cor.folha} semente={12} />
      </g>
    );
  };

  const Casa: React.FC<{x: number; y: number; tam?: number; p?: number; corParede?: string}> = ({x, y, tam = 1, p = 1, corParede}) => {
    const {un} = usePalco();
    const k = tam * un;
    return (
      <g>
        <Forma d={caixa(x - 150 * k, y - 220 * k, 300 * k, 220 * k)} p={curva(p, 0, 0.6)} cor={corParede ?? (cor.roupa[2] ?? cor.destaque)} semente={21} />
        <Forma d={trilha([[x - 190 * k, y - 210 * k], [x, y - 360 * k], [x + 190 * k, y - 210 * k]], true, true)} p={curva(p, 0.2, 0.8)} cor={cor.destaque} semente={22} />
        <Forma d={caixa(x - 40 * k, y - 120 * k, 80 * k, 120 * k, 6 * k)} p={curva(p, 0.5, 1)} cor={cor.tronco} semente={23} />
      </g>
    );
  };

  const Estrela: React.FC<{x: number; y: number; r?: number; p?: number; corEstrela?: string}> = ({x, y, r = 60, p = 1, corEstrela}) => {
    const {un} = usePalco();
    const R = r * un;
    const pts: Ponto[] = Array.from({length: 10}, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? R * 0.45 : R;
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
    });
    return <Forma d={trilha(pts, true, true)} p={p} cor={corEstrela ?? cor.sol} semente={31} />;
  };

  const Coracao: React.FC<{x: number; y: number; tam?: number; p?: number}> = ({x, y, tam = 80, p = 1}) => {
    const {un} = usePalco();
    const k = tam * un;
    return <Forma d={`M${x} ${y + k * 0.8} C${x - k * 1.4} ${y - k * 0.1} ${x - k * 0.6} ${y - k * 1.1} ${x} ${y - k * 0.4} C${x + k * 0.6} ${y - k * 1.1} ${x + k * 1.4} ${y - k * 0.1} ${x} ${y + k * 0.8} Z`} p={p} cor={cor.destaque} semente={41} />;
  };

  const Mar: React.FC<{y: number; seg: number; p?: number}> = ({y, seg, p = 1}) => {
    const {larg, alt, un} = usePalco();
    const pts: Ponto[] = Array.from({length: 13}, (_, i) => [(larg * i) / 12, y + onda(seg, 0.35, i * 0.3) * 16 * un]);
    return <Forma d={trilha([[-30, alt + 30], ...pts, [larg + 30, alt + 30]], true)} p={p} cor={cor.agua} semente={51} />;
  };

  const Chao: React.FC<{y: number; p?: number}> = ({y, p = 1}) => {
    const {larg, alt, un} = usePalco();
    return <Forma d={trilha([[-400, y + 10 * un], [larg * 0.3, y - 8 * un], [larg * 0.7, y + 6 * un], [larg + 400, y - 4 * un], [larg + 400, alt + 400], [-400, alt + 400]], true)} p={p} cor={cor.terra} semente={61} />;
  };

  const Seta: React.FC<{de: Ponto; ate: Ponto; p?: number; cv?: number; corSeta?: string}> = ({de, ate, p = 1, cv = 0.2, corSeta}) => {
    const {un} = usePalco();
    const [x0, y0] = de;
    const [x1, y1] = ate;
    const mx = (x0 + x1) / 2 - (y1 - y0) * cv;
    const my = (y0 + y1) / 2 + (x1 - x0) * cv;
    const ang = Math.atan2(y1 - my, x1 - mx);
    const k = 28 * un;
    const c = corSeta ?? cor.tinta;
    return (
      <g>
        <Traco d={`M${x0} ${y0} Q${mx} ${my} ${x1} ${y1}`} p={curva(p, 0, 0.8)} cor={c} grossura={9} />
        <Traco d={`M${x1 - Math.cos(ang - 0.5) * k} ${y1 - Math.sin(ang - 0.5) * k} L${x1} ${y1} L${x1 - Math.cos(ang + 0.5) * k} ${y1 - Math.sin(ang + 0.5) * k}`} p={curva(p, 0.8, 1)} cor={c} grossura={9} />
      </g>
    );
  };

  /** palavra escrita na cena, na letra do estilo, aparecendo letra por letra */
  const Escrito: React.FC<{texto: string; x: number; y: number; p?: number; tam?: number; corTexto?: string; meio?: boolean}> = ({texto, x, y, p = 1, tam = 90, corTexto, meio = true}) => {
    const {un} = usePalco();
    const n = Math.round(texto.length * Math.min(1, p));
    if (n <= 0) return null;
    return (
      <text x={x} y={y} textAnchor={meio ? 'middle' : 'start'} fontFamily={m.visual.letra.titulo} fontWeight={800} fontSize={tam * un} fill={corTexto ?? cor.tinta}>
        {texto.slice(0, n)}
      </text>
    );
  };

  return {visual: m.visual, tresD: !!m.tresD, cor, Forma, Traco, Pessoa, Sol, Nuvem, Arvore, Casa, Estrela, Coracao, Mar, Chao, Seta, Escrito};
};

export type Kit = ReturnType<typeof montarKit>;
