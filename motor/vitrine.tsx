// A vitrine de um estilo: a mesma cena curta desenhada em qualquer estilo.
// Serve pra conferir um estilo novo e pra fazer a imagem de cada estilo na biblioteca.
import React from 'react';
import {Camada, Profundidade} from './camadas';
import {Filme} from './filme';
import type {Kit} from './kit';
import type {PropsBloco} from './filme';
import {Palco, usePalco} from './palco';
import type {Roteiro} from './tempo';
import {curva, onda} from './tempo';
import {Letreiro} from './texto';

export const DURACAO_VITRINE = 9;

const roteiroDe = (nome: string): Roteiro => {
  const texto = `Assim fica um vídeo no estilo ${nome}.`;
  const ws = texto.split(' ');
  const ini = 1.2;
  const fim = 5.2;
  return {
    origem: 'leitura',
    total: DURACAO_VITRINE,
    frases: [{texto, ini, fim, palavras: ws.map((p, i) => ({p, ini: ini + (i * (fim - ini)) / ws.length, fim: ini + ((i + 1) * (fim - ini)) / ws.length}))}],
  };
};

type Parte = 'fundo' | 'meio' | 'frente';
const Cena: React.FC<{k: Kit; seg: number; so?: Parte}> = ({k, seg, so}) => {
  const {larg, alt} = usePalco();
  const chao = alt * 0.72;
  const ve = (pt: Parte) => !so || so === pt;
  return (
    <>
      {ve('fundo') && (
        <>
          <k.Sol x={larg * 0.8} y={alt * 0.2} r={95} p={curva(seg, -0.4, 1.2)} seg={seg} />
          <k.Nuvem x={larg * 0.25} y={alt * 0.24} tam={0.75} p={curva(seg, 0, 1.4)} seg={seg} />
          <k.Nuvem x={larg * 0.55} y={alt * 0.3} tam={0.5} p={curva(seg, 0.3, 1.6)} seg={seg} />
        </>
      )}
      {ve('meio') && (
        <>
          <k.Chao y={chao} p={curva(seg, -0.6, 0.6)} />
          <k.Arvore x={larg * 0.14} y={chao + 10} tam={0.95} p={curva(seg, 0.2, 1.8)} seg={seg} />
          <k.Casa x={larg * 0.8} y={chao + 10} tam={0.85} p={curva(seg, 0.5, 2.2)} />
        </>
      )}
      {ve('frente') && (
        <>
          <k.Pessoa x={larg * 0.44} y={chao + 20} tam={430} seg={seg} cara={seg > 4 ? 'espanto' : 'feliz'} bracos={[15, 120 + onda(seg, 1.2) * 35]} p={curva(seg, -0.4, 1.2)} semente={1} />
          <k.Pessoa x={larg * 0.57} y={chao + 20} tam={330} seg={seg + 1} cara="feliz" cabelo="longo" bracos={[15, 25]} p={curva(seg, 1, 2.4)} semente={2} />
          <k.Estrela x={larg * 0.64} y={alt * 0.4} r={46} p={curva(seg, 2.2, 3)} />
          <k.Coracao x={larg * 0.34} y={alt * 0.42} tam={44} p={curva(seg, 2.6, 3.4)} />
          <k.Seta de={[larg * 0.68, alt * 0.44]} ate={[larg * 0.62, alt * 0.52]} p={curva(seg, 3.2, 4)} />
        </>
      )}
    </>
  );
};

export const Vitrine: React.FC<{k: Kit}> = ({k}) => {
  const roteiro = roteiroDe(k.visual.nome);
  const Bloco: React.FC<PropsBloco> = ({seg}) =>
    k.tresD ? (
      <Profundidade olhar={{x: onda(seg, 0.08) * 0.6, avanco: curva(seg, 0, DURACAO_VITRINE) * 0.4, giro: onda(seg, 0.06) * 6}}>
        <Camada distancia={0.95} sombra={false}>
          <Cena k={k} seg={seg} so="fundo" />
        </Camada>
        <Camada distancia={0.5}>
          <Cena k={k} seg={seg} so="meio" />
        </Camada>
        <Camada distancia={0.15}>
          <Cena k={k} seg={seg} so="frente" />
        </Camada>
      </Profundidade>
    ) : (
      <Palco>
        <Cena k={k} seg={seg} />
      </Palco>
    );
  return (
    <Filme
      roteiro={roteiro}
      visual={k.visual}
      trechos={[{de: 0, ate: 0, Bloco}]}
      porCima={<Letreiro visual={k.visual} texto={k.visual.nome.toUpperCase()} de={0.4} ate={DURACAO_VITRINE} y={0.1} tam={130} />}
    />
  );
};
