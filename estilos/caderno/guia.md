# Notebook

**Tipo:** 2D
**Cara:** caneta azul em folha pautada, marca-texto colorido e letra de mão; tudo nasce do traço
**Bom pra:** explicação, dica, ciência do dia a dia, "por que isso acontece"

## Como é

- **Fundo:** folha de caderno creme, com pauta azul-clara e a margem vermelha à esquerda. Nunca troque por fundo liso.
- **Traço:** caneta esferográfica azul (`COR.caneta`), grossura 6 a 8, ponta redonda. Todo contorno se desenha
  sozinho (`Rabisco` e `Desenho` com `p` indo de 0 a 1).
- **Cor:** só dentro das formas, como marca-texto: amarelo, rosa, verde, laranja e azul-claro, um pouco
  transparentes. A cor entra depois do contorno.
- **Letra:** títulos em letra de mão grossa (Caveat), legenda em letra de mão de fôrma (Patrick Hand) sobre faixa de
  marca-texto amarelo.
- **Troca de cena:** uma folha nova passa por cima, como virar a página.
- **Movimento:** as coisas não "aparecem": são desenhadas. Depois de prontas, respiram (`onda`) ou andam.

## As peças

| Peça | Pra quê |
|---|---|
| `Rabisco` | um traço de caneta que se desenha (`d` = caminho SVG, `p` = 0 a 1) |
| `Desenho` | forma com contorno que se desenha e cor de marca-texto que entra depois |
| `MarcaTexto` | faixa de marca-texto (destacar uma palavra ou um número escrito) |
| `Seta` | seta curva que se desenha de um ponto a outro |
| `Circulado` | círculo de caneta vermelha em volta de algo importante |
| `Escrito` | palavra escrita à mão, letra por letra |
| `Pessoinha` | gente do caderno: `cara` (feliz, serio, espanto, triste, bravo), `bracos`, `anda`, `cabelo`, `cor` |
| `Sol`, `Nuvem`, `Gota`, `Chuva`, `Arvore`, `Casa`, `Estrela`, `Coracao`, `Mar`, `Chao` | desenhos prontos |

## Pra desenhar coisa nova

Faça como o `Sol` e a `Casa`: monte com `Desenho` (formas simples: `elipse`, `caixa`, `trilha`) e `Rabisco`
(linhas soltas), cada parte com seu pedaço do `p` (`curva(p, 0, 0.5)`, `curva(p, 0.3, 1)`), pra o desenho nascer
em ordem: primeiro o contorno grande, depois os detalhes. Poucas formas, bem reconhecíveis.

## Evite

- Preenchimento sólido e opaco, degradê, sombra realista: aqui tudo é caneta e marca-texto.
- Preto puro: a "tinta" é o azul da caneta.
- Texto pequeno: na tela, até 5 palavras, com tamanho 80 ou mais.
- Muitas cores na mesma cena: no máximo três marca-textos de cada vez.
