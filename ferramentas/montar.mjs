// Monta (empacota) o motor com os projetos, para as ferramentas de prévia e de gerar.
import path from 'node:path';
import {RAIZ, aviso, navegador, para} from './comum.mjs';

/** o que toda chamada do motor recebe: o navegador certo e paciência (na nuvem a máquina é mais lenta) */
export const opcoesMotor = () => ({browserExecutable: navegador() ?? null, timeoutInMilliseconds: 120000, logLevel: 'error'});

export const montar = async () => {
  const {bundle} = await import('@remotion/bundler');
  try {
    return await bundle({entryPoint: path.join(RAIZ, 'motor', 'raiz.tsx'), publicDir: path.join(RAIZ, 'public'), onProgress: () => {}});
  } catch (e) {
    aviso(String(e?.message ?? e).split('\n').slice(0, 6).join('\n'));
    para('O código do vídeo não montou. Rode  npx tsc --noEmit -p .  e corrija o erro que ele apontar.');
  }
};

export const escolher = async (servidor, id) => {
  const {selectComposition} = await import('@remotion/renderer');
  try {
    return await selectComposition({serveUrl: servidor, id, ...opcoesMotor()});
  } catch (e) {
    aviso(String(e?.message ?? e).split('\n').slice(0, 6).join('\n'));
    para(`O motor não achou o vídeo "${id}". Rode  node ferramentas/catalogo.mjs  e tente de novo.`);
  }
};
