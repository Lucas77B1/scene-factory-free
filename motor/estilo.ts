// O que todo estilo entrega para o motor.
import type React from 'react';

export type Visual = {
  /** identificador curto, sem acento (ex.: "caderno") */
  id: string;
  nome: string;
  /** cores do estilo, por nome. As peças e os vídeos usam daqui, nunca cor solta. */
  cores: Record<string, string>;
  /** famílias de letra já carregadas */
  letra: {titulo: string; texto: string};
  /** como a legenda aparece neste estilo */
  legenda: {
    cor: string;
    destaque: string;
    contorno?: string;
    fundo?: string;
    peso?: number;
    caixaAlta?: boolean;
  };
  /** o fundo que fica por trás de tudo */
  Fundo: React.FC;
  /** passagem entre um bloco e outro: recebe p (0..1, 0.5 = o corte) */
  Passagem?: React.FC<{p: number}>;
  /** textura por cima de tudo (papel, grão, linhas). Opcional. */
  Textura?: React.FC;
};
