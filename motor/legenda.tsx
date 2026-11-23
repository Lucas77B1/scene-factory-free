// A legenda: mostra a frase em pedaços curtos e acende cada palavra na hora em que é dita.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Visual} from './estilo';
import {usePalco, useSegundo} from './palco';
import type {Palavra, Roteiro} from './tempo';
import {curva, suave} from './tempo';

/** quebra as palavras de uma frase em pedaços de até `max` palavras, cortando nas pausas (vírgula, ponto) */
const pedacos = (pal: Palavra[], max: number): Palavra[][] => {
  const out: Palavra[][] = [];
  let atual: Palavra[] = [];
  pal.forEach((p, i) => {
    atual.push(p);
    const pausa = /[,.;:!?"]$/.test(p.p) && atual.length >= 3;
    if (atual.length >= max || pausa || i === pal.length - 1) {
      out.push(atual);
      atual = [];
    }
  });
  return out;
};

const tira = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const Legenda: React.FC<{
  roteiro: Roteiro;
  visual: Visual;
  /** palavras com cor própria (sem acento e minúsculas também valem) */
  cores?: Record<string, string>;
  /** trechos sem legenda: [de, ate] em segundos */
  sem?: [number, number][];
  /** altura do centro da legenda, de 0 a 1 (padrão: 0.72 em pé, 0.84 deitado) */
  y?: number;
}> = ({roteiro, visual, cores = {}, sem = [], y}) => {
  const seg = useSegundo();
  const {larg, alt, un, deitado} = usePalco();
  if (sem.some(([a, b]) => seg >= a && seg < b)) return null;
  const f = roteiro.frases.find((x) => seg >= x.ini - 0.05 && seg < x.fim + 0.25);
  if (!f || !f.palavras.length) return null;
  const grupos = pedacos(f.palavras, deitado ? 7 : 4);
  const g = grupos.find((gr, i) => seg < (grupos[i + 1]?.[0].ini ?? Infinity)) ?? grupos[grupos.length - 1];
  const entra = curva(seg, g[0].ini - 0.08, g[0].ini + 0.12, suave.sai);
  const L = visual.legenda;
  const mapa: Record<string, string> = {};
  for (const [k, v] of Object.entries(cores)) mapa[tira(k)] = v;
  const tam = (deitado ? 58 : 76) * un;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: alt * (y ?? (deitado ? 0.84 : 0.72)),
          transform: `translateY(-50%) scale(${0.92 + entra * 0.08})`,
          opacity: entra,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: `${0.1 * tam}px ${0.26 * tam}px`,
          background: L.fundo,
          padding: L.fundo ? `${0.08 * tam}px ${0.3 * tam}px` : 0,
          borderRadius: 0.2 * tam,
          width: 'fit-content',
          maxWidth: '84%',
          margin: '0 auto',
          fontFamily: L.peso ? visual.letra.titulo : visual.letra.texto,
          fontWeight: L.peso ?? 700,
          fontSize: tam,
          lineHeight: 1.1,
          textTransform: L.caixaAlta ? 'uppercase' : 'none',
        }}
      >
        {g.map((p, i) => {
          const dita = seg >= p.ini;
          const cor = mapa[tira(p.p)] ?? (dita ? L.destaque : L.cor);
          const pulo = curva(seg, p.ini, p.ini + 0.15, suave.sai) - curva(seg, p.ini + 0.15, p.ini + 0.35);
          return (
            <span
              key={i}
              style={{
                color: cor,
                opacity: dita ? 1 : 0.62,
                transform: `translateY(${-pulo * 0.06 * tam}px)`,
                display: 'inline-block',
                WebkitTextStroke: L.contorno ? `${0.09 * tam}px ${L.contorno}` : undefined,
                paintOrder: 'stroke fill',
                textShadow: L.contorno ? `0 ${0.05 * tam}px ${0.12 * tam}px rgba(0,0,0,0.45)` : L.fundo ? 'none' : '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {p.p}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
