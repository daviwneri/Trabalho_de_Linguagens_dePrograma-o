import * as fs from "fs";

type Tabuleiro = number[][];
const CAMPO_VAZIO = 0;

// Os 8 movimentos do cavalo (dr, dc)
const MOVIMENTOS = [
  [-2, 1], [-2, -1], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [1, 2], [1, -2],
];

// Classe para manter as variáveis de estado de forma organizada
class EstadoTabuleiro {
    L: number; // Linhas
    C: number; // Colunas
    tabuleiro: Tabuleiro;
    lInicial: number;
    cInicial: number;
    totalCasas: number;

    constructor(L: number, C: number, l: number, c: number) {
        this.L = L;
        this.C = C;
        this.lInicial = l;
        this.cInicial = c;
        this.totalCasas = L * C;
        this.tabuleiro = Array.from({ length: L }, () => Array(C).fill(CAMPO_VAZIO));

        // A posição inicial é marcada com o primeiro passo
        this.tabuleiro[l][c] = 1;
    }
}

/**
 * Função principal para ler o arquivo e processar todos os tabuleiros.
 */
function processarArquivo(nomeArquivo: string) {
    try {
        const input = fs.readFileSync(nomeArquivo, "utf-8").trim();
        const arquivoLinhas = input.split("\n");
        let contadorSolucoes = 0;

        for (const linha of arquivoLinhas) {
            if (!linha.trim()) continue;

            const [L_str, C_str, l_str, c_str] = linha.trim().split(/\s+/);
            const L = parseInt(L_str, 10);
            const C = parseInt(C_str, 10);
            // Ajuste para base 0 (o usuário geralmente fornece 1-based)
            const l = parseInt(l_str, 10) - 1;
            const c = parseInt(c_str, 10) - 1;

            if (l < 0 || c < 0 || l >= L || c >= C) {
                console.log(`ERRO: Posição inicial inválida para ${L}x${C}. Pulando.`);
                continue;
            }

            const estado = new EstadoTabuleiro(L, C, l, c);

            console.log(`\n--- Processando Tabuleiro ${L}x${C} | Início: (${l+1},${c+1}) ---`);
            
            // Inicia o backtracking do passo 2 (o passo 1 já está marcado)
            const encontrouSolucao = resolverPasseio(estado, l, c, 2); 

            if (encontrouSolucao) {
                contadorSolucoes++;
                console.log("RESULTADO: SIM, é possível encontrar um caminho aberto não fechável.");
                console.table(estado.tabuleiro);
                
            } else {
                console.log("RESULTADO: NÃO, não foi encontrado um caminho aberto que cubra todo o tabuleiro.");
            }
        }
        console.log(`\nTotal de tabuleiros com solução: ${contadorSolucoes}`);
    } catch (error) {
        console.error("Erro ao ler ou processar o arquivo:", error);
    }
}

/**
 * Função de Backtracking recursiva para encontrar o passeio do cavalo.
 * @returns true se encontrar um passeio válido.
 */
function resolverPasseio(estado: EstadoTabuleiro, lAtual: number, cAtual: number, passo: number): boolean {
    const { L, C, tabuleiro, lInicial, cInicial, totalCasas } = estado;

    // 1. CONDIÇÃO DE SUCESSO COMPLETO
    if (passo > totalCasas) {
        // O passeio está completo. Agora checamos a RESTRIÇÃO FINAL:
        // A posição final (rAtual, cAtual) NÃO deve ser capaz de voltar para a inicial (rInicial, cInicial).
        if (podeAlcancar(lAtual, cAtual, lInicial, cInicial, L, C)) {
            // A última casa alcança a primeira (é um passeio FECHADO). 
            // Retornamos 'false' para forçar o backtracking e buscar outro caminho.
            return false;
        }

        // Restrição atendida: é um passeio aberto e não-fechável. SUCESSO!
        return true;
    }

    // Tenta os 8 movimentos possíveis
    for (const [dl, dc] of MOVIMENTOS) {
        const lProximo = lAtual + dl;
        const cProximo = cAtual + dc;

        // Verifica se o movimento é válido (dentro do tabuleiro e não visitado)
        if (
            lProximo >= 0 && lProximo < L &&
            cProximo >= 0 && cProximo < C &&
            tabuleiro[lProximo][cProximo] === CAMPO_VAZIO
        ) {
            // 2. TENTATIVA: MARCA o movimento com o número do passo
            tabuleiro[lProximo][cProximo] = passo;
            // 3. RECURSÃO: Tenta completar o passeio a partir da nova posição
            if (resolverPasseio(estado, lProximo, cProximo, passo + 1)) {
                return true; // Solução encontrada!
            }

            // 4. BACKTRACKING: Se a chamada recursiva falhou, DESFAZ o movimento
            tabuleiro[lProximo][cProximo] = CAMPO_VAZIO;
        }
    }

    // Se todos os 8 movimentos falharem, retorna false para o nível anterior (beco sem saída)
    return false;
}

/**
 * Verifica se uma posição (r1, c1) pode alcançar outra (r2, c2) em um movimento de cavalo.
 */
function podeAlcancar(l1: number, c1: number, l2: number, c2: number, L: number, C: number): boolean {
    for (const [dl, dc] of MOVIMENTOS) {
        const lProximo = l1 + dl;
        const cProximo = c1 + dc;
        
        // Só precisamos verificar se um dos 8 movimentos leva de (r1, c1) para (r2, c2)
        if (lProximo === l2 && cProximo === c2) {
            return true;
        }
    }
    return false;
}

// Executar o processamento
processarArquivo("teste.txt");