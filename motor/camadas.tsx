// 3D leve: profundidade sem programa de 3D. Cada camada fica a uma distância e se mexe
// mais ou menos conforme a câmera anda, como num cenário de teatro visto de lado.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

/** a "câmera" das camadas: x e y de -1 a 1 (para onde ela anda) e o quanto ela avança (0 = parada) */
export type Olhar = {x?: number; y?: number; avanco?: number; giro?: number};

const CtxOlhar = React.createContext<Required<Olhar>>({x: 0, y: 0, avanco: 0, giro: 0});

export const Profundidade: React.FC<{olhar: Olhar; children: React.ReactNode}> = ({olhar, children}) => (
  <CtxOlhar.Provider value={{x: olhar.x ?? 0, y: olhar.y ?? 0, avanco: olhar.avanco ?? 0, giro: olhar.giro ?? 0}}>
    <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>
  </CtxOlhar.Provider>
);

/**
 * Uma camada a uma distância: 0 = colada na câmera (mexe muito), 1 = no fundo (quase não mexe).
 * Dentro dela vai SVG normal, do tamanho do vídeo.
 */
export const Camada: React.FC<{distancia: number; children: React.ReactNode; sombra?: boolean}> = ({distancia, children, sombra = true}) => {
  const {width, height} = useVideoConfig();
  const o = React.useContext(CtxOlhar);
  const perto = 1 - Math.max(0, Math.min(1, distancia));
  const esc = 1 + o.avanco * (0.15 + perto * 0.9);
  const dx = -o.x * width * 0.12 * (0.15 + perto);
  const dy = -o.y * height * 0.08 * (0.15 + perto);
  const giroY = o.giro * (0.3 + perto * 0.7);
  return (
    <AbsoluteFill
      style={{
        transform: `perspective(${width * 2}px) translate(${dx}px, ${dy}px) rotateY(${giroY}deg) scale(${esc})`,
        transformOrigin: '50% 60%',
        filter: sombra && perto > 0.4 ? `drop-shadow(0 ${14 * perto}px ${18 * perto}px rgba(0,0,0,${0.18 + perto * 0.2}))` : undefined,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {children}
      </svg>
    </AbsoluteFill>
  );
};
