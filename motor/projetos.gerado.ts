// Escrito por ferramentas/catalogo.mjs. Não edite à mão.
import type {Formato, Roteiro} from './tempo';
import type React from 'react';
import * as p0 from '../projects/exemplo-ceu-azul/video';
type Projeto = {id: string; m: {roteiro: Roteiro; formato: Formato; Video: React.FC}};
export const PROJETOS: Projeto[] = [{id: 'exemplo-ceu-azul', m: p0 as Projeto['m']}];
