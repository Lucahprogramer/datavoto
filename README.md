# DataVotoCesf

Pesquisa eleitoral e socioeconômica anônima — Colégio Sagrada Família (Campo Largo/PR).
Stack: HTML5, CSS3, JavaScript ES Modules, Firebase Firestore, Chart.js, GitHub Pages.

## Estrutura
| Arquivo | Responsável | Função |
|---|---|---|
| `index.html`, `style.css` | Front-end & UX Lead | Formulário público e layout responsivo |
| `firebase-config.js`, `script.js`, `firestore.rules` | Firebase & Data Lead | Conexão, validação e gravação |
| `admin.html`, `admin.js` | Backend & Analytics Lead | Painel com senha, métricas e gráficos |

## Como configurar
1. No [Firebase Console](https://console.firebase.google.com), crie um projeto e um app Web.
2. Ative o **Firestore Database** e copie o `firebaseConfig` para `firebase-config.js`.
3. Cole o conteúdo de `firestore.rules` na aba **Regras** do Firestore e publique.
4. Teste localmente com um servidor (módulos ES não funcionam abrindo o arquivo direto): `python -m http.server 8000`.
5. Crie o repositório `datavoto-cesf-grupo-[nome]`, faça commits distribuídos entre os 3 integrantes e ative **Settings > Pages**.

## Modelo de dados (coleção `datavoto_cesf_respostas`)
`faixaEtaria` (string) · `bairro` (string) · `rotina` (array) · `rendaFamiliar` (string) ·
`moradores` (**Number**) · `trabalhadores` (**Number**) · `certezaVoto` (string) · `pautas` (array) ·
`criadoEm` (**serverTimestamp**)

## Painel
Senha inicial: `cesf2026` (troque em `admin.js` gerando o novo hash SHA-256).
Limitação: a senha roda no navegador, então protege contra curiosos, não contra quem lê o código.
Para segurança real, use Firebase Authentication e regras de leitura restritas.
