// Registra cada projeto como um vídeo que o motor sabe gerar. A lista vem de projetos.gerado.ts
// (escrita pela ferramenta ferramentas/catalogo.mjs: não edite à mão).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import type {PropsFolha} from './folha';
import {Folha, medidasFolha} from './folha';
import {ESTILOS} from './estilos.gerado';
import {PROJETOS} from './projetos.gerado';
import {DURACAO_VITRINE, Vitrine} from './vitrine';
import {QPS, TAMANHOS} from './tempo';

const Raiz: React.FC = () => (
  <>
    {PROJETOS.map(({id, m}) => {
      const [w, h] = TAMANHOS[m.formato];
      return <Composition key={id} id={id} component={m.Video} durationInFrames={Math.max(1, Math.ceil(m.roteiro.total * QPS))} fps={QPS} width={w} height={h} />;
    })}
    {ESTILOS.map(({id, kit}) => (
      <Composition key={id} id={`vitrine-${id}`} component={() => <Vitrine k={kit} />} durationInFrames={DURACAO_VITRINE * QPS} fps={QPS} width={1920} height={1080} />
    ))}
    <Composition
      id="folha-de-fotos"
      component={Folha}
      durationInFrames={1}
      fps={QPS}
      width={100}
      height={100}
      defaultProps={{fotos: [], colunas: 1, largFoto: 100, altFoto: 100} as PropsFolha}
      calculateMetadata={({props}) => medidasFolha(props)}
    />
  </>
);

registerRoot(Raiz);
