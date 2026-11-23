// Estilo "Néon": tubos de luz colorida numa parede escura de tijolo, que acendem piscando.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as carregaTitulo} from '@remotion/google-fonts/TiltNeon';
import {loadFont as carregaTexto} from '@remotion/google-fonts/Rajdhani';
import type {PropsForma, PropsTraco, Visual} from '../../motor';
import {FiltroBrilho, Trocas, curva, montarKit, sorte, usePalco, useSegundo} from '../../motor';

const {fontFamily: TITULO} = carregaTitulo('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});
const {fontFamily: TEXTO} = carregaTexto('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});

export const COR = {
  parede: '#120E1F',
  tijolo: '#1C1630',
  rosa: '#FF4FD8',
  ciano: '#3DF5FF',
  amarelo: '#FFE14F',
  verde: '#5CFF8A',
  laranja: '#FF9A3D',
  violeta: '#A77BFF',
  branco: '#FFF6FF',
};

const Fundo: React.FC = () => {
  const {larg, alt, un} = usePalco();
  const h = 46 * un;
  const w = 120 * un;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #241B3D 0%, ${COR.parede} 70%)`}}>
      <svg width={larg} height={alt} style={{opacity: 0.55}}>
        {Array.from({length: Math.ceil(alt / h)}, (_, l) =>
          Array.from({length: Math.ceil(larg / w) + 1}, (_, c) => <rect key={`${l}-${c}`} x={c * w - (l % 2) * w * 0.5} y={l * h} width={w - 5 * un} height={h - 5 * un} rx={4 * un} fill={COR.tijolo} />),
        )}
      </svg>
    </AbsoluteFill>
  );
};

export const visual: Visual = {
  id: 'neon',
  nome: 'Néon',
  cores: {...COR, tinta: COR.branco, papel: COR.parede},
  letra: {titulo: TITULO, texto: TEXTO},
  legenda: {cor: '#B9AFD0', destaque: COR.branco, contorno: '#1A0F2E'},
  Fundo,
  Passagem: Trocas.apaga('#05030A'),
};

/** acende com uma piscada (sempre igual, pelo acaso fixo) */
const piscada = (p: number, semente: number) => {
  if (p >= 1) return 1;
  if (p <= 0) return 0;
  const k = Math.floor(p * 12);
  return sorte(`${semente}-${k}`) > 0.35 + p * 0.5 ? 0.15 : 0.4 + p * 0.6;
};

/** tubo de néon: só o contorno aceso, com brilho; um véu de cor bem fraco dentro */
const Forma: React.FC<PropsForma> = ({d, p = 1, cor = COR.ciano, semente = 1}) => {
  const {un} = usePalco();
  const seg = useSegundo();
  if (p <= 0) return null;
  const luz = piscada(p, semente) * (0.93 + 0.07 * Math.sin(seg * 9 + semente));
  return (
    <g opacity={luz}>
      <defs>
        <FiltroBrilho id="neon-b" raio={10 * un} />
      </defs>
      <path d={d} fill={cor} opacity={0.12} />
      <path d={d} fill="none" stroke={cor} strokeWidth={8 * un} strokeLinejoin="round" filter="url(#neon-b)" />
      <path d={d} fill="none" stroke={COR.branco} strokeWidth={2.5 * un} strokeLinejoin="round" opacity={0.85} />
    </g>
  );
};

const Traco: React.FC<PropsTraco> = ({d, p = 1, cor = COR.rosa, grossura = 8}) => {
  const {un} = usePalco();
  if (p <= 0) return null;
  const c = cor === COR.branco ? COR.violeta : cor;
  return (
    <g opacity={piscada(p, 7)}>
      <defs>
        <FiltroBrilho id="neon-b" raio={10 * un} />
      </defs>
      <path d={d} fill="none" stroke={c} strokeWidth={Math.min(grossura, 9) * un} strokeLinecap="round" filter="url(#neon-b)" />
      <path d={d} fill="none" stroke={COR.branco} strokeWidth={2.5 * un} strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

export const kit = montarKit({
  visual,
  cor: {
    tinta: COR.violeta,
    papel: COR.parede,
    ceu: COR.violeta,
    sol: COR.amarelo,
    nuvem: COR.ciano,
    folha: COR.verde,
    tronco: COR.laranja,
    agua: COR.ciano,
    terra: COR.violeta,
    pele: COR.laranja,
    cabelo: COR.rosa,
    roupa: [COR.ciano, COR.rosa, COR.amarelo, COR.verde],
    destaque: COR.rosa,
    rosto: COR.branco,
  },
  Forma,
  Traco,
  pessoa: {bochecha: false},
});
