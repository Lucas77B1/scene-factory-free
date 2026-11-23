// O filme: liga cada bloco de cena às frases que ele cobre, põe o fundo, a narração, a trilha e a legenda.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {Visual} from './estilo';
import {Legenda} from './legenda';
import {useSegundo} from './palco';
import type {Roteiro} from './tempo';
import {QPS, curva} from './tempo';

/** o que cada bloco de cena recebe */
export type PropsBloco = {
  /** segundos desde que o bloco começou */
  seg: number;
  /** segundo do vídeo inteiro (use com momento() e frase()) */
  segVideo: number;
  /** duração do bloco, em segundos */
  dur: number;
  roteiro: Roteiro;
};
export type Bloco = React.FC<PropsBloco>;

/** um bloco cobre as frases de `de` até `ate` (contando do 0) */
export type Trecho = {de: number; ate: number; Bloco: Bloco};

/** atalho: blocos([[0, 1, Abertura], [2, 4, Meio]]) */
export const blocos = (lista: [number, number, Bloco][]): Trecho[] => lista.map(([de, ate, B]) => ({de, ate, Bloco: B}));

/** efeito sonoro ou trilha: arquivo em public/, começando no segundo `em` */
export type Som = {arquivo: string; em: number; ate?: number; volume?: number; repete?: boolean};

const Sons: React.FC<{lista: Som[]; total: number}> = ({lista, total}) => (
  <>
    {lista.map((s, k) => {
      const ini = Math.max(0, Math.round(s.em * QPS));
      const fim = Math.round((s.ate ?? Math.min(total, s.em + 30)) * QPS);
      const dur = Math.max(1, fim - ini);
      const vol = s.volume ?? 0.5;
      return (
        <Sequence key={k} from={ini} durationInFrames={dur} layout="none">
          <Audio src={staticFile(s.arquivo)} loop={s.repete} volume={(f) => vol * Math.min(1, f / 8, (dur - f) / 8)} />
        </Sequence>
      );
    })}
  </>
);

export const Filme: React.FC<{
  roteiro: Roteiro;
  visual: Visual;
  trechos: Trecho[];
  /** palavras com cor própria na legenda */
  cores?: Record<string, string>;
  /** sem legenda nenhuma (quando o vídeo escreve as frases na tela) */
  semLegenda?: boolean;
  /** trechos sem legenda: [de, ate] em segundos */
  legendaPausada?: [number, number][];
  /** efeitos e trilha (arquivos que a pessoa mandou, em public/) */
  sons?: Som[];
  /** o que fica por cima de tudo, acima da legenda (contadores, títulos fixos) */
  porCima?: React.ReactNode;
}> = ({roteiro, visual, trechos, cores, semLegenda, legendaPausada, sons = [], porCima}) => {
  const segVideo = useSegundo();
  const F = roteiro.frases;
  const ini = (t: Trecho, k: number) => (k === 0 ? 0 : F[t.de]?.ini ?? 0);
  const fim = (k: number) => (k + 1 < trechos.length ? ini(trechos[k + 1], k + 1) : roteiro.total);
  const {Fundo, Passagem, Textura} = visual;
  return (
    <AbsoluteFill>
      <Fundo />
      {trechos.map((t, k) => {
        const a = ini(t, k);
        const b = fim(k);
        const de = Math.round(a * QPS);
        const dur = Math.max(1, Math.round(b * QPS) - de);
        const B = t.Bloco;
        return (
          <Sequence key={k} from={de} durationInFrames={dur}>
            <B seg={segVideo - a} segVideo={segVideo} dur={b - a} roteiro={roteiro} />
          </Sequence>
        );
      })}
      {Passagem &&
        trechos.slice(1).map((t, k) => {
          const corte = ini(t, k + 1);
          const p = curva(segVideo, corte - 0.3, corte + 0.3, (x) => x);
          return p > 0 && p < 1 ? <Passagem key={k} p={p} /> : null;
        })}
      {Textura && <Textura />}
      {!semLegenda && <Legenda roteiro={roteiro} visual={visual} cores={cores} sem={legendaPausada} />}
      {porCima}
      {roteiro.audio && <Audio src={staticFile(roteiro.audio)} />}
      <Sons lista={sons} total={roteiro.total} />
    </AbsoluteFill>
  );
};
