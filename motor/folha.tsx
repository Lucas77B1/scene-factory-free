// A folha de fotos da prévia: junta várias fotos numa grade com o segundo de cada uma.
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';

export type PropsFolha = {fotos: {src: string; seg: number}[]; colunas: number; largFoto: number; altFoto: number};

export const MARGEM = 10;
export const LEGENDA = 34;

export const medidasFolha = (p: PropsFolha) => {
  const linhas = Math.max(1, Math.ceil(p.fotos.length / p.colunas));
  return {
    width: Math.round(p.colunas * (p.largFoto + MARGEM) + MARGEM),
    height: Math.round(linhas * (p.altFoto + LEGENDA + MARGEM) + MARGEM),
  };
};

export const Folha: React.FC<PropsFolha> = ({fotos, colunas, largFoto, altFoto}) => (
  <AbsoluteFill style={{background: '#ffffff'}}>
    {fotos.map((f, k) => {
      const c = k % colunas;
      const l = Math.floor(k / colunas);
      return (
        <div key={k} style={{position: 'absolute', left: MARGEM + c * (largFoto + MARGEM), top: MARGEM + l * (altFoto + LEGENDA + MARGEM), width: largFoto}}>
          <Img src={f.src} style={{width: largFoto, height: altFoto, display: 'block', border: '1px solid #ccc'}} />
          <div style={{height: LEGENDA, lineHeight: `${LEGENDA}px`, textAlign: 'center', font: '700 22px Arial, sans-serif', color: '#222'}}>{f.seg.toFixed(1)} s</div>
        </div>
      );
    })}
  </AbsoluteFill>
);
