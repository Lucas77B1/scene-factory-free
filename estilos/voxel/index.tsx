// Estilo "Voxel" (3D leve): mundo de cubinhos, como blocos de montar digitais. Cada forma vira blocos com volume
// (face de cima clara, lateral escura) e a câmera passeia entre camadas.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as carregaTitulo} from '@remotion/google-fonts/Bungee';
import {loadFont as carregaTexto} from '@remotion/google-fonts/Rajdhani';
import type {PropsForma, PropsTraco, Visual} from '../../motor';
import {Trocas, montarKit, usePalco} from '../../motor';

const {fontFamily: TITULO} = carregaTitulo('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});
const {fontFamily: TEXTO} = carregaTexto('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});

export const COR = {
  ceu1: '#8ED1FC',
  ceu2: '#D9F1FF',
  grama: '#5BC35B',
  terra: '#A0703F',
  pedra: '#9AA1AB',
  agua: '#3F8EF0',
  areia: '#E9D38A',
  vermelho: '#E04B4B',
  amarelo: '#FFD23F',
  roxo: '#8E6CEF',
  tinta: '#262A33',
};

const LADO = 18;

const Fundo: React.FC = () => <AbsoluteFill style={{background: `linear-gradient(180deg, ${COR.ceu1} 0%, ${COR.ceu2} 100%)`}} />;

export const visual: Visual = {
  id: 'voxel',
  nome: 'Voxel',
  cores: {...COR, papel: '#FFFFFF'},
  letra: {titulo: TITULO, texto: TEXTO},
  legenda: {cor: '#5A6070', destaque: COR.tinta, fundo: 'rgba(255,255,255,0.92)'},
  Fundo,
  Passagem: Trocas.blocos('#262A33', 108),
};

const Blocos: React.FC<{id: string; lado: number}> = ({id, lado}) => {
  const {larg, alt} = usePalco();
  return (
    <filter id={id} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x={-lado * 4} y={-lado * 4} width={larg + lado * 8} height={alt + lado * 8}>
      <feFlood x={0} y={0} width={2} height={2} floodColor="#000" />
      <feComposite x={0} y={0} width={lado} height={lado} />
      <feTile result="grade" />
      <feComposite in="SourceGraphic" in2="grade" operator="in" />
      <feMorphology operator="dilate" radius={lado / 2 - 1} />
    </filter>
  );
};

/** escurece uma cor (pra lateral do bloco) */
const tom = (cor: string, f: number) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(cor);
  if (!m) return cor;
  const n = parseInt(m[1], 16);
  const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

/** forma em blocos com volume: cópia escura deslocada (lateral) e a face da frente; os blocos caem no lugar */
const Forma: React.FC<PropsForma> = ({d, p = 1, cor = COR.pedra}) => {
  if (p <= 0) return null;
  const v = Math.min(1, Math.ceil(p * 5) / 5);
  const queda = (1 - v) * -LADO * 6;
  return (
    <g transform={`translate(0 ${queda})`} opacity={0.4 + v * 0.6}>
      <defs>
        <Blocos id="vox-q" lado={LADO} />
      </defs>
      <g filter="url(#vox-q)">
        <path d={d} fill={tom(cor, 0.62)} transform={`translate(${LADO * 0.9} ${LADO * 0.9})`} />
      </g>
      <g filter="url(#vox-q)">
        <path d={d} fill={cor} />
      </g>
      <g filter="url(#vox-q)" opacity={0.35}>
        <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={LADO * 0.8} transform={`translate(${-LADO * 0.5} ${-LADO * 0.5})`} />
      </g>
    </g>
  );
};

const Traco: React.FC<PropsTraco> = ({d, p = 1, cor = COR.tinta, grossura = 8}) => {
  if (p <= 0) return null;
  const v = Math.min(1, Math.ceil(p * 5) / 5);
  return (
    <g>
      <defs>
        <Blocos id="vox-q" lado={LADO} />
      </defs>
      <g filter="url(#vox-q)">
        <path d={d} pathLength={1} fill="none" stroke={cor} strokeWidth={Math.max(LADO, grossura * 1.6)} strokeDasharray="1 1" strokeDashoffset={1 - v} />
      </g>
    </g>
  );
};

export const kit = montarKit({
  visual,
  cor: {
    tinta: COR.tinta,
    papel: '#FFFFFF',
    ceu: COR.ceu1,
    sol: COR.amarelo,
    nuvem: '#FFFFFF',
    folha: COR.grama,
    tronco: COR.terra,
    agua: COR.agua,
    terra: COR.grama,
    pele: '#F2C29A',
    cabelo: COR.terra,
    roupa: [COR.vermelho, COR.agua, COR.roxo, COR.amarelo],
    destaque: COR.vermelho,
  },
  Forma,
  Traco,
  pessoa: {corpo: 'retangulo', cabeca: 0.23, bochecha: false, olhoGrande: true},
  tresD: true,
});
