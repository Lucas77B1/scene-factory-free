// Efeitos que os estilos reaproveitam: linha que se desenha, filtros de textura e trocas de cena prontas.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {usePalco} from './palco';
import {sorte} from './tempo';

/** linha que se desenha do começo ao fim (p de 0 a 1) */
export const LinhaViva: React.FC<{d: string; p?: number; cor: string; grossura: number; filtro?: string; opacidade?: number; ponta?: 'round' | 'square' | 'butt'}> = ({d, p = 1, cor, grossura, filtro, opacidade = 1, ponta = 'round'}) => {
  if (p <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={cor}
      strokeWidth={grossura}
      strokeLinecap={ponta}
      strokeLinejoin="round"
      strokeDasharray="1 1"
      strokeDashoffset={1 - Math.min(1, p)}
      filter={filtro ? `url(#${filtro})` : undefined}
      opacity={opacidade}
    />
  );
};

/** filtro de borda irregular (giz, pincel, papel rasgado). Coloque dentro de um <svg>. */
export const FiltroAspero: React.FC<{id: string; forca?: number; escala?: number; semente?: number}> = ({id, forca = 4, escala = 0.9, semente = 2}) => (
  <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency={escala} numOctaves={2} seed={semente} result="ruido" />
    <feDisplacementMap in="SourceGraphic" in2="ruido" scale={forca} xChannelSelector="R" yChannelSelector="G" />
  </filter>
);

/** filtro de brilho (néon, luz, holograma) */
export const FiltroBrilho: React.FC<{id: string; raio?: number}> = ({id, raio = 8}) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation={raio} result="b1" />
    <feGaussianBlur in="SourceGraphic" stdDeviation={raio / 3} result="b2" />
    <feMerge>
      <feMergeNode in="b1" />
      <feMergeNode in="b2" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);

/** sombra de papel colado (recorte, adesivo, feltro) */
export const FiltroSombra: React.FC<{id: string; dx?: number; dy?: number; desfoque?: number; opacidade?: number}> = ({id, dx = 6, dy = 8, desfoque = 4, opacidade = 0.35}) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx={dx} dy={dy} stdDeviation={desfoque} floodColor="#000" floodOpacity={opacidade} />
  </filter>
);

/** grão de papel/filme por cima da tela */
export const Grao: React.FC<{id: string; opacidade?: number; frequencia?: number; cor?: [number, number, number]; modo?: React.CSSProperties['mixBlendMode']}> = ({id, opacidade = 0.3, frequencia = 0.85, cor = [0.45, 0.4, 0.35], modo = 'multiply'}) => {
  const {larg, alt} = usePalco();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: modo, opacity: opacidade}}>
      <svg width={larg} height={alt}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={frequencia} numOctaves={2} seed={5} />
          <feColorMatrix values={`0 0 0 0 ${cor[0]}  0 0 0 0 ${cor[1]}  0 0 0 0 ${cor[2]}  0 0 0 0.5 0`} />
        </filter>
        <rect width={larg} height={alt} filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** trocas de cena prontas. Todas recebem p de 0 a 1 (0,5 = o corte). */
export const Trocas = {
  /** uma folha da cor `cor` passa da direita pra esquerda */
  folha: (cor: string) => {
    const C: React.FC<{p: number}> = ({p}) => {
      const {larg, alt} = usePalco();
      const x = (1 - p * 2) * larg * 1.15;
      return (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={larg} height={alt}>
            <rect x={x} y={-20} width={larg * 1.1} height={alt + 40} fill={cor} />
            <rect x={x - 24} y={-20} width={24} height={alt + 40} fill="#000" opacity={0.12} />
          </svg>
        </AbsoluteFill>
      );
    };
    return C;
  },
  /** um círculo da cor `cor` cresce do centro e encolhe */
  circulo: (cor: string) => {
    const C: React.FC<{p: number}> = ({p}) => {
      const {larg, alt} = usePalco();
      const r = Math.hypot(larg, alt) * 0.6 * (1 - Math.abs(p * 2 - 1));
      return (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={larg} height={alt}>
            <circle cx={larg / 2} cy={alt / 2} r={r} fill={cor} />
          </svg>
        </AbsoluteFill>
      );
    };
    return C;
  },
  /** a tela apaga e acende (pisca) */
  apaga: (cor: string) => {
    const C: React.FC<{p: number}> = ({p}) => {
      const v = 1 - Math.abs(p * 2 - 1);
      const pisca = p > 0.5 && p < 0.7 && Math.floor(p * 40) % 2 === 0 ? 0.6 : 1;
      return <AbsoluteFill style={{background: cor, opacity: Math.min(1, v * 1.6) * pisca, pointerEvents: 'none'}} />;
    };
    return C;
  },
  /** quadradinhos que cobrem e descobrem a tela */
  blocos: (cor: string, lado = 120) => {
    const C: React.FC<{p: number}> = ({p}) => {
      const {larg, alt} = usePalco();
      const cols = Math.ceil(larg / lado);
      const lins = Math.ceil(alt / lado);
      const v = 1 - Math.abs(p * 2 - 1);
      return (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={larg} height={alt}>
            {Array.from({length: cols * lins}, (_, k) => (sorte(`bl${k}`) < v * 1.15 ? <rect key={k} x={(k % cols) * lado} y={Math.floor(k / cols) * lado} width={lado + 1} height={lado + 1} fill={cor} /> : null))}
          </svg>
        </AbsoluteFill>
      );
    };
    return C;
  },
  /** uma faixa larga varre a tela (apagador, pincel) */
  varre: (cor: string, inclinacao = 0.25) => {
    const C: React.FC<{p: number}> = ({p}) => {
      const {larg, alt} = usePalco();
      const w = larg * 1.6;
      const x = -w + p * (larg + w * 1.25);
      return (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={larg} height={alt}>
            <polygon points={`${x},${-20} ${x + w},${-20} ${x + w - alt * inclinacao},${alt + 20} ${x - alt * inclinacao},${alt + 20}`} fill={cor} />
          </svg>
        </AbsoluteFill>
      );
    };
    return C;
  },
};
