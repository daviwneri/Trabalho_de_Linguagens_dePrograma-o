import * as fs from 'fs';

const input = fs.readFileSync('teste.txt', 'utf-8').trim();

const arquivoLinhas = input.split('\n')

const tabuleiros: number[][][] = [];

for (const linha of arquivoLinhas) {
  if (!linha.trim()) continue;

  const [linhasStr, colunasStr, posicaoLinhaStr, posicaoColunaStr] = linha.trim().split(/\s+/);
  const linhas = parseInt(linhasStr, 10);
  const colunas = parseInt(colunasStr, 10);

  const posicaoLinha = parseInt(posicaoLinhaStr, 10)
  const posicaoColuna = parseInt(posicaoColunaStr, 10)

  const matriz = Array.from({ length: linhas }, () =>
    Array (colunas).fill(0)
  );

  tabuleiros.push(matriz);
}

console.log(`Foram criados ${tabuleiros.length} tabuleiros:\n`);

tabuleiros.forEach((t, i) => {
  console.log(`Tabuleiro ${i + 1} (${t.length}x${t[0].length}):`);
  console.table(t);
});