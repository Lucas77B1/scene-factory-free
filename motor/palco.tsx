// O palco: a folha de desenho (SVG) do tamanho do vídeo, e a medida "un" que vale em pé e deitado.
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {QPS} from './tempo';

export type Medidas = {
  /** largura e altura do vídeo, em pixels */
  larg: number;
  alt: number;
  /** centro */
  meioX: number;
  meioY: number;
  /** unidade: 1 un = 1 pixel numa tela de 1080 de lado menor. Use para tamanhos (traço, raio, letra). */
  un: number;
  deitado: boolean;
};

export const medir = (larg: number, alt: number): Medidas => ({
  larg,
  alt,
  meioX: larg / 2,
  meioY: alt / 2,
  un: Math.min(larg, alt) / 1080,
  deitado: larg > alt,
});

const Ctx = createContext<Medidas | null>(null);

/** as medidas do palco atual */
export const usePalco = (): Medidas => {
  const c = useContext(Ctx);
  const {width, height} = useVideoConfig();
  return c ?? medir(width, height);
};

/** o segundo atual do vídeo inteiro */
export const useSegundo = () => useCurrentFrame() / QPS;

/** a folha SVG do tamanho do vídeo. Tudo dentro dela usa pixels do vídeo. */
export const Palco: React.FC<{children: React.ReactNode; fundo?: string}> = ({children, fundo}) => {
  const {width, height} = useVideoConfig();
  const m = medir(width, height);
  return (
    <Ctx.Provider value={m}>
      <AbsoluteFill style={{background: fundo}}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {children}
        </svg>
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

/** pontos para um caminho SVG, liso (curvas) ou reto */
export type Ponto = [number, number];
export const trilha = (pts: Ponto[], fechado = false, reto = false) => {
  if (pts.length < 2) return '';
  if (reto) return `M${pts.map((p) => p.join(' ')).join(' L')}${fechado ? ' Z' : ''}`;
  const lista = fechado ? [...pts, pts[0], pts[1]] : pts;
  let d = `M${lista[0][0]} ${lista[0][1]}`;
  for (let i = 1; i < lista.length - (fechado ? 1 : 0); i++) {
    const [x0, y0] = lista[i - 1];
    const [x1, y1] = lista[i];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += i === 1 && !fechado ? ` L${mx} ${my}` : ` Q${x0} ${y0} ${mx} ${my}`;
  }
  if (!fechado) d += ` L${lista[lista.length - 1][0]} ${lista[lista.length - 1][1]}`;
  return d + (fechado ? ' Z' : '');
};

/** contorno de uma elipse com leve imperfeição de mão (sempre igual para a mesma semente) */
export const elipse = (cx: number, cy: number, rx: number, ry: number, tremido = 0, semente = 1): string => {
  const n = 14;
  const pts: Ponto[] = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + tremido * Math.sin(a * 3 + semente * 1.7) * 0.5 + tremido * Math.cos(a * 5 + semente) * 0.3;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  return trilha(pts, true);
};

/** retângulo (com cantos arredondados opcionais) */
export const caixa = (x: number, y: number, w: number, h: number, r = 0) =>
  r <= 0
    ? `M${x} ${y} H${x + w} V${y + h} H${x} Z`
    : `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
