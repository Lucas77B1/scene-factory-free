// Vídeo de exemplo da Fábrica de Cenas: "Por que o céu é azul", em pé, estilo Caderno.
// Leia este arquivo antes de fazer um vídeo: ele mostra a montagem inteira.
import React from 'react';
import type {Formato, PropsBloco, Roteiro} from '../../motor';
import {Filme, Lente, Letreiro, Palco, blocos, curva, elipse, frase, momento, onda, sorte, suave, trilha, usePalco} from '../../motor';
import {COR, Chao, Circulado, Desenho, Escrito, Nuvem, Pessoinha, Rabisco, Seta, Sol, visual} from '../../estilos/caderno';
import tempo from './tempo.json';

export const roteiro = tempo as Roteiro;
export const formato: Formato = 'vertical';

const R = roteiro;
const F = (i: number) => frase(R, i);
const M = (palavra: string, i: number) => momento(R, palavra, i);
const ARCO = ['#E5484D', '#FFB45C', '#FFE45C', '#8EE38A', '#8FD3FF', '#4B6BFF', '#B07CFF'];

/** pedaço de céu pintado de marca-texto que cresce de baixo pra cima */
const Ceu: React.FC<{p: number; cor: string; y1: number}> = ({p, cor, y1}) => {
  const {larg} = usePalco();
  if (p <= 0) return null;
  return <rect x={larg * 0.04} y={y1 * (1 - p)} width={larg * 0.92} height={y1 * p} fill={cor} opacity={0.55} />;
};

// ---------------------------------------------------------------- 0: a pergunta
const Pergunta: React.FC<PropsBloco> = ({seg, segVideo}) => {
  const {larg, alt} = usePalco();
  const chao = alt * 0.58;
  return (
    <Lente seg={seg} miras={[{seg: 0, y: 0.45, zoom: 1.12}, {seg: 4, y: 0.4, zoom: 1}]}>
      <Palco>
        <Ceu p={curva(seg, -0.8, 1.6)} cor={COR.azulClaro} y1={alt * 0.5} />
        <Sol x={larg * 0.76} y={alt * 0.14} p={curva(seg, -0.6, 1)} seg={seg} />
        <Nuvem x={larg * 0.28} y={alt * 0.2} tam={0.8} p={curva(seg, -0.2, 1.2)} seg={seg} />
        <Chao y={chao} p={curva(seg, -0.6, 0.6)} />
        <Pessoinha x={larg * 0.42} y={chao} tam={520} seg={seg} cara={segVideo > M('blue', 0) ? 'espanto' : 'feliz'} bracos={[20, 150]} p={curva(seg, -0.7, 0.8)} />
        <Escrito texto="?" x={larg * 0.66} y={alt * 0.4} tam={260} p={curva(segVideo, M('blue', 0) - 0.2, M('blue', 0) + 0.2)} cor={COR.vermelho} />
      </Palco>
    </Lente>
  );
};

// ---------------------------------------------------------------- 1: luz branca = todas as cores
const Cores: React.FC<PropsBloco> = ({seg, segVideo}) => {
  const {larg, alt, un} = usePalco();
  const abre = curva(segVideo, M('all', 1) - 0.3, M('all', 1) + 0.8);
  const x0 = larg * 0.22;
  const y0 = alt * 0.22;
  const xm = larg * 0.5;
  const ym = alt * 0.36;
  return (
    <Palco>
      <Sol x={x0} y={y0} r={120} seg={seg} p={curva(seg, 0, 0.8)} />
      <Rabisco d={`M${x0 + 140 * un} ${y0 + 60 * un} L${xm} ${ym}`} p={curva(seg, 0.6, 1.4, suave.linear)} cor="#B9B9C6" grossura={26} />
      {ARCO.map((c, k) => {
        const ang = -0.35 + k * 0.12;
        const comp = larg * 0.42;
        return <Rabisco key={k} d={`M${xm} ${ym} L${xm + Math.cos(ang + 0.6) * comp} ${ym + Math.sin(ang + 0.6) * comp}`} p={abre * (0.9 + 0.1 * onda(seg, 0.5, k / 7))} cor={c} grossura={16} />;
      })}
      <Desenho d={trilha([[xm - 50 * un, ym + 60 * un], [xm, ym - 60 * un], [xm + 50 * un, ym + 60 * un]], true, true)} p={curva(seg, 0.9, 1.6)} cor="#FFFFFF" />
    </Palco>
  );
};

// ---------------------------------------------------------------- 2-3: o choque com o ar
const Choque: React.FC<PropsBloco> = ({seg, segVideo}) => {
  const {larg, alt, un} = usePalco();
  const espalha = curva(segVideo, M('scatters', 3) - 0.3, M('scatters', 3) + 1.2);
  const bolinhas = Array.from({length: 22}, (_, k) => ({
    x: larg * (0.12 + sorte(`bx${k}`) * 0.76),
    y: alt * (0.12 + sorte(`by${k}`) * 0.44),
  }));
  return (
    <Lente seg={seg} miras={[{seg: 0, zoom: 1}, {seg: F(3).ini - F(2).ini, zoom: 1.15, x: 0.5, y: 0.34}]}>
      <Palco>
        <Rabisco d={`M${-20} ${alt * 0.3} L${larg * 0.5} ${alt * 0.34}`} p={curva(seg, 0, 1, suave.linear)} cor="#B9B9C6" grossura={22} />
        {bolinhas.map((b, k) => (
          <Desenho key={k} d={elipse(b.x + onda(seg, 0.7, k / 9) * 6 * un, b.y, 20 * un, 20 * un, 0.1, k)} p={curva(segVideo, M('molecules', 2) - 0.3 + k * 0.04, M('molecules', 2) + 0.4 + k * 0.04)} cor={COR.rosa} grossura={4} />
        ))}
        {Array.from({length: 10}, (_, k) => {
          const a = (k / 10) * Math.PI * 2;
          const r = larg * 0.3;
          return <Seta key={k} de={[larg * 0.5, alt * 0.34]} ate={[larg * 0.5 + Math.cos(a) * r, alt * 0.34 + Math.sin(a) * r * 0.8]} p={espalha} cor="#4B6BFF" curva={0.08} />;
        })}
        <Circulado x={larg * 0.5} y={alt * 0.34} rx={90 * un} p={curva(segVideo, F(3).ini, F(3).ini + 0.6)} />
      </Palco>
    </Lente>
  );
};

// ---------------------------------------------------------------- 4: chega azul de todo lado
const Olhar: React.FC<PropsBloco> = ({seg}) => {
  const {larg, alt} = usePalco();
  const chao = alt * 0.58;
  const olho: [number, number] = [larg * 0.5, chao - 520 * (larg / 1080) * 0.72];
  return (
    <Palco>
      <Ceu p={curva(seg, 0, 1.2)} cor="#4B6BFF" y1={alt * 0.5} />
      <Chao y={chao} />
      <Pessoinha x={larg * 0.5} y={chao} tam={520} seg={seg} cara="feliz" bracos={[25, 25]} />
      {Array.from({length: 7}, (_, k) => {
        const a = Math.PI + (k / 6) * Math.PI;
        const r = larg * 0.42;
        return <Seta key={k} de={[olho[0] + Math.cos(a) * r, olho[1] + Math.sin(a) * r * 0.9]} ate={[olho[0] + Math.cos(a) * 150, olho[1] + Math.sin(a) * 140]} p={curva(seg, 0.3 + k * 0.12, 1 + k * 0.12)} cor="#1F3A93" curva={0.1} />;
      })}
    </Palco>
  );
};

// ---------------------------------------------------------------- 5-6: o fim da tarde
const Tarde: React.FC<PropsBloco> = ({seg, segVideo}) => {
  const {larg, alt, un} = usePalco();
  const perde = curva(segVideo, M('lost', 6) - 0.2, M('lost', 6) + 1);
  const sobra = curva(segVideo, M('left', 6) - 0.2, M('left', 6) + 0.8);
  const terraY = alt * 0.62;
  return (
    <Palco>
      <Ceu p={curva(seg, 0, 1.5)} cor={sobra > 0 ? '#FFB45C' : '#BFD3EA'} y1={alt * 0.6} />
      <Desenho d={`M${-40} ${terraY + 120 * un} Q${larg * 0.5} ${terraY - 120 * un} ${larg + 40} ${terraY + 120 * un} L${larg + 40} ${alt + 40} L${-40} ${alt + 40} Z`} p={curva(seg, 0, 1)} cor={COR.verde} />
      <Sol x={larg * 0.1} y={terraY - 10 * un} r={90} seg={seg} p={curva(seg, 0.3, 1.2)} />
      <Rabisco d={`M${larg * 0.18} ${terraY - 30 * un} Q${larg * 0.5} ${terraY - 140 * un} ${larg * 0.78} ${terraY - 60 * un}`} p={curva(seg, 0.8, 2.6, suave.linear)} cor={sobra > 0 ? '#E5484D' : '#B9B9C6'} grossura={20} />
      <Pessoinha x={larg * 0.82} y={terraY + 30 * un} tam={300} seg={seg} cara={sobra > 0 ? 'feliz' : 'serio'} bracos={[20, 130]} />
      {Array.from({length: 6}, (_, k) => {
        const x = larg * (0.26 + k * 0.08);
        const y = terraY - 120 * un;
        return <Seta key={k} de={[x, y]} ate={[x + 30 * un, y - alt * 0.18]} p={perde} cor="#4B6BFF" curva={0.15} />;
      })}
      <Escrito texto="so much air" x={larg * 0.5} y={terraY + 120 * un} tam={90} p={curva(segVideo, M('much', 5), M('much', 5) + 0.6)} />
    </Palco>
  );
};

// ---------------------------------------------------------------- 7: o fecho
const Fecho: React.FC<PropsBloco> = ({seg}) => {
  const {larg, alt} = usePalco();
  const abre = curva(seg, 0, 1.2);
  return (
    <Lente seg={seg} miras={[{seg: 0, zoom: 1.15, y: 0.32}, {seg: 4, zoom: 1, y: 0.4}]}>
      <Palco>
        <rect x={larg * 0.04} y={alt * 0.08} width={larg * 0.46 * abre} height={alt * 0.5} fill="#4B6BFF" opacity={0.5} />
        <rect x={larg * 0.96 - larg * 0.46 * abre} y={alt * 0.08} width={larg * 0.46 * abre} height={alt * 0.5} fill="#FFB45C" opacity={0.6} />
        <Rabisco d={`M${larg * 0.5} ${alt * 0.06} L${larg * 0.5} ${alt * 0.6}`} p={abre} grossura={6} />
        <Sol x={larg * 0.5} y={alt * 0.33} r={130} seg={seg} p={curva(seg, 0.4, 1.4)} />
        <Nuvem x={larg * 0.22} y={alt * 0.16} tam={0.6} seg={seg} p={curva(seg, 0.8, 1.6)} />
      </Palco>
    </Lente>
  );
};

export const Video: React.FC = () => (
  <Filme
    roteiro={R}
    visual={visual}
    trechos={blocos([
      [0, 0, Pergunta],
      [1, 1, Cores],
      [2, 3, Choque],
      [4, 4, Olhar],
      [5, 6, Tarde],
      [7, 7, Fecho],
    ])}
    cores={{azul: '#2F52E0', 'azul,': '#2F52E0', 'azul.': '#2F52E0', laranja: '#E07A12', vermelho: '#D02A2A', 'vermelho.': '#D02A2A', cores: '#B0389A'}}
    porCima={
      <>
        <Letreiro visual={visual} texto="ALL THE COLORS" de={M('all', 1) - 0.2} ate={F(1).fim + 0.3} y={0.56} tam={110} />
        <Letreiro visual={visual} texto="THE SAME SUN" de={F(7).ini + 0.3} ate={R.total} y={0.56} tam={120} />
      </>
    }
  />
);
