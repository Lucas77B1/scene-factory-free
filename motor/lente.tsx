// A lente: a câmera que passeia, aproxima, gira e treme. Funciona por pontos no tempo.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {curva, mistura, suave} from './tempo';

/** um ponto da câmera: para onde ela olha (0..1 da tela), o quanto aproxima e o giro em graus */
export type Mira = {seg: number; x?: number; y?: number; zoom?: number; giro?: number};

const valorEm = (seg: number, miras: Mira[], campo: 'x' | 'y' | 'zoom' | 'giro', padrao: number) => {
  const lista = miras.filter((m) => m[campo] !== undefined);
  if (!lista.length) return padrao;
  if (seg <= lista[0].seg) return lista[0][campo]!;
  for (let i = 1; i < lista.length; i++) {
    if (seg <= lista[i].seg) return mistura(lista[i - 1][campo]!, lista[i][campo]!, curva(seg, lista[i - 1].seg, lista[i].seg, suave.ambos));
  }
  return lista[lista.length - 1][campo]!;
};

/**
 * Câmera. `miras` são pontos no tempo (em segundos do mesmo relógio de `seg`).
 * A câmera nunca mostra fora da cena: o centro é preso para o zoom não revelar a borda.
 */
export const Lente: React.FC<{seg: number; miras: Mira[]; tremor?: number; children: React.ReactNode}> = ({seg, miras, tremor = 0, children}) => {
  const {width, height} = useVideoConfig();
  const zoom = Math.max(1, valorEm(seg, miras, 'zoom', 1));
  const folga = (1 - 1 / zoom) / 2;
  const prende = (v: number) => 0.5 + Math.max(-folga, Math.min(folga, v - 0.5));
  const x = prende(valorEm(seg, miras, 'x', 0.5));
  const y = prende(valorEm(seg, miras, 'y', 0.5));
  const giro = valorEm(seg, miras, 'giro', 0);
  const tx = (0.5 - x) * width * zoom + tremor * Math.sin(seg * 47) * 9;
  const ty = (0.5 - y) * height * zoom + tremor * Math.cos(seg * 39) * 7;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) rotate(${giro}deg) scale(${zoom})`, transformOrigin: '50% 50%'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** atalho: câmera que vai de uma mira a outra durante um trecho */
export const passeio = (de: number, ate: number, a: Omit<Mira, 'seg'>, b: Omit<Mira, 'seg'>): Mira[] => [
  {seg: de, ...a},
  {seg: ate, ...b},
];
