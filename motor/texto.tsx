// Texto na tela: títulos e etiquetas que entram, ficam o tempo de ler e saem.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Visual} from './estilo';
import {usePalco, useSegundo} from './palco';
import {curva, presenca, suave} from './tempo';

/** a cor é escura? (pra escolher o contorno do texto) */
export const escura = (cor: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(cor.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 120;
};

/** tempo mínimo pra ler: 1 s + 1 s a cada 3 palavras */
export const tempoDeLer = (texto: string) => 1 + texto.trim().split(/\s+/).length / 3;

/** título grande, centralizado. `y` de 0 a 1. */
export const Letreiro: React.FC<{
  visual: Visual;
  texto: string | string[];
  de: number;
  ate?: number;
  y?: number;
  cor?: string;
  tam?: number;
  fundo?: string;
}> = ({visual, texto, de, ate, y = 0.14, cor, tam = 110, fundo}) => {
  const seg = useSegundo();
  const {alt, larg, un} = usePalco();
  const linhas = Array.isArray(texto) ? texto : [texto];
  const fim = ate ?? de + Math.max(tempoDeLer(linhas.join(' ')), 1.6);
  const v = presenca(seg, de, fim, 0.25, 0.3);
  if (v <= 0) return null;
  const pula = curva(seg, de, de + 0.45, suave.mola);
  const corTexto = cor ?? visual.legenda.destaque;
  const contorno = visual.legenda.contorno ?? (escura(corTexto) ? String(visual.cores.papel ?? '#FFFFFF') : 'rgba(0,0,0,0.85)');
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: larg * 0.06,
          right: larg * 0.06,
          top: alt * y,
          transform: `translateY(-50%) scale(${0.7 + 0.3 * pula})`,
          opacity: v,
          textAlign: 'center',
          fontFamily: visual.letra.titulo,
          fontWeight: 800,
          fontSize: tam * un,
          lineHeight: 1.02,
          color: corTexto,
          WebkitTextStroke: `${0.08 * tam * un}px ${contorno}`,
          paintOrder: 'stroke fill',
          textShadow: `0 ${0.06 * tam * un}px ${0.14 * tam * un}px rgba(0,0,0,0.4)`,
        }}
      >
        {linhas.map((l, k) => (
          <div key={k}>
            <span style={{background: fundo, padding: fundo ? `0 ${0.2 * tam * un}px` : 0, borderRadius: 0.12 * tam * un}}>{l}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** etiqueta: um rótulo curto numa caixinha, em qualquer ponto da tela (x e y de 0 a 1) */
export const Rotulo: React.FC<{
  visual: Visual;
  texto: string;
  de: number;
  ate?: number;
  x?: number;
  y?: number;
  tam?: number;
  cor?: string;
  fundo?: string;
}> = ({visual, texto, de, ate, x = 0.5, y = 0.2, tam = 56, cor, fundo}) => {
  const seg = useSegundo();
  const {alt, larg, un} = usePalco();
  const fim = ate ?? de + Math.max(tempoDeLer(texto), 1.5);
  const v = presenca(seg, de, fim, 0.2, 0.3);
  if (v <= 0) return null;
  const pula = curva(seg, de, de + 0.4, suave.mola);
  return (
    <div
      style={{
        position: 'absolute',
        left: larg * x,
        top: alt * y,
        transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * pula}) rotate(${(1 - pula) * -4}deg)`,
        opacity: v,
        whiteSpace: 'nowrap',
        fontFamily: visual.letra.titulo,
        fontWeight: 800,
        fontSize: tam * un,
        lineHeight: 1,
        color: cor ?? visual.cores.tinta ?? '#1b1b1b',
        background: fundo ?? visual.cores.papel ?? '#ffffff',
        padding: `${0.28 * tam * un}px ${0.45 * tam * un}px`,
        borderRadius: 0.22 * tam * un,
        border: `${0.07 * tam * un}px solid ${visual.cores.tinta ?? '#1b1b1b'}`,
        boxShadow: `${0.1 * tam * un}px ${0.12 * tam * un}px 0 ${visual.cores.tinta ?? '#1b1b1b'}`,
        pointerEvents: 'none',
      }}
    >
      {texto}
    </div>
  );
};
