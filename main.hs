import System.IO
import Control.Monad
import Data.List
import Data.Maybe

type Tabuleiro = [[Int]]
type Pos = (Int, Int)

campoVazio :: Int
campoVazio = 0

movimentos :: [Pos]
movimentos =
  [ (-2, 1), (-2, -1), (-1, 2), (-1, -2)
  , ( 2, 1), ( 2, -1), ( 1, 2), ( 1, -2)
  ]

data EstadoTabuleiro = EstadoTabuleiro
  { lins :: Int
  , cols :: Int
  , tab  :: Tabuleiro
  , linInicial :: Int
  , colInicial :: Int
  , totalCasas :: Int
  } deriving (Show)


novoEstado :: Int -> Int -> Int -> Int -> EstadoTabuleiro
novoEstado l c li ci =
  let t = replicate l (replicate c campoVazio)
      t' = atualizar t li ci 1
  in EstadoTabuleiro l c t' li ci (l * c)


atualizar :: Tabuleiro -> Int -> Int -> Int -> Tabuleiro
atualizar tab l c valor =
  take l tab ++
  [take c (tab !! l) ++ [valor] ++ drop (c+1) (tab !! l)] ++
  drop (l+1) tab


valida :: EstadoTabuleiro -> Int -> Int -> Bool
valida est l c = l >= 0 && c >= 0 && l < lins est && c < cols est


vazia :: EstadoTabuleiro -> Int -> Int -> Bool
vazia est l c = (tab est !! l) !! c == campoVazio


podeAlcancar :: Pos -> Pos -> Bool
podeAlcancar (l1, c1) (l2, c2) =
  any (\(dl, dc) -> l1 + dl == l2 && c1 + dc == c2) movimentos


resolverPasseio :: EstadoTabuleiro -> Pos -> Int -> Maybe Tabuleiro
resolverPasseio est (l, c) passo
  | passo == totalCasas est + 1 =
      if podeAlcancar (l, c) (linInicial est, colInicial est)
         then Nothing
         else Just (tab est)
  | otherwise =
      listToMaybe $ catMaybes
        [ let t' = atualizar (tab est) l2 c2 passo
              est' = est { tab = t' }
          in resolverPasseio est' (l2, c2) (passo + 1)
        | (dl, dc) <- movimentos
        , let l2 = l + dl
        , let c2 = c + dc
        , valida est l2 c2
        , vazia est l2 c2
        ]


processarArquivo :: FilePath -> IO ()
processarArquivo nome = do
  conteudo <- readFile nome
  let linhasArquivo = filter (not . null) $ lines conteudo
  resultados <- forM linhasArquivo $ \linha -> do
    let [lStr, cStr, liStr, ciStr] = words linha
        l = read lStr
        c = read cStr
        li = read liStr - 1
        ci = read ciStr - 1
    if li < 0 || ci < 0 || li >= l || ci >= c
      then do
        putStrLn $ "ERRO: posição inicial inválida para " ++ show l ++ "x" ++ show c
        return False
      else do
        let est = novoEstado l c li ci
        putStrLn $ "\n--- Processando Tabuleiro " ++ show l ++ "x" ++ show c
                 ++ " | Início: (" ++ show (li+1) ++ "," ++ show (ci+1) ++ ") ---"
        case resolverPasseio est (li, ci) 2 of
          Just t -> do
            putStrLn "RESULTADO: SIM, é possível encontrar um caminho aberto não fechável."
            imprimirTabuleiro t
            return True
          Nothing -> do
            putStrLn "RESULTADO: NÃO, não foi encontrado um caminho aberto que cubra todo o tabuleiro."
            return False

  let total = length (filter id resultados)
  putStrLn $ "\nTotal de tabuleiros com solução: " ++ show total
  

imprimirTabuleiro :: Tabuleiro -> IO ()
imprimirTabuleiro t =
  forM_ t $ \linha ->
    putStrLn $ intercalate "\t" (map show linha)


-- ---------------------------------------------------------------------------------------------------------------------

main :: IO ()
main = processarArquivo "teste.txt"