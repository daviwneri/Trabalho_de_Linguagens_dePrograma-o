import * as fs from "fs";

type Tabuleiro = number[][];
const CAMPO_VAZIO = 0;

const MOVIMENTOS = [
  [-2, 1], [-2, -1], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [1, 2], [1, -2],
];

class EstadoTabuleiro {
    L: number;
    C: number;
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

        this.tabuleiro[l][c] = 1;
    }
}

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
            const l = parseInt(l_str, 10) - 1;
            const c = parseInt(c_str, 10) - 1;

            if (l < 0 || c < 0 || l >= L || c >= C) {
                console.log(`ERRO: Posição inicial inválida para ${L}x${C}. Pulando.`);
                continue;
            }

            const estado = new EstadoTabuleiro(L, C, l, c);

            console.log(`\n--- Processando Tabuleiro ${L}x${C} | Início: (${l+1},${c+1}) ---`);
            
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

function resolverPasseio(estado: EstadoTabuleiro, lAtual: number, cAtual: number, passo: number): boolean {
    const { L, C, tabuleiro, lInicial, cInicial, totalCasas } = estado;

    if (passo > totalCasas) {
        if (podeAlcancar(lAtual, cAtual, lInicial, cInicial, L, C)) {
            return false;
        }

        return true;
    }

    for (const [dl, dc] of MOVIMENTOS) {
        const lProximo = lAtual + dl;
        const cProximo = cAtual + dc;

        if (
            lProximo >= 0 && lProximo < L &&
            cProximo >= 0 && cProximo < C &&
            tabuleiro[lProximo][cProximo] === CAMPO_VAZIO
        ) {
            tabuleiro[lProximo][cProximo] = passo;
            if (resolverPasseio(estado, lProximo, cProximo, passo + 1)) {
                return true;
            }

            tabuleiro[lProximo][cProximo] = CAMPO_VAZIO;
        }
    }

    return false;
}


function podeAlcancar(l1: number, c1: number, l2: number, c2: number, L: number, C: number): boolean {
    for (const [dl, dc] of MOVIMENTOS) {
        const lProximo = l1 + dl;
        const cProximo = c1 + dc;
        
        if (lProximo === l2 && cProximo === c2) {
            return true;
        }
    }
    return false;
}

// ------------------------------------------------------------------------------------- 

processarArquivo("teste.txt");