// ===== Painel administrativo: acesso por senha, agregação e gráficos =====
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, COLECAO } from "./firebase-config.js";

// Senha simples (briefing). Guardamos só o hash SHA-256, não a senha em texto.
// Senha inicial: cesf2026 — para trocar, gere o hash da nova senha e substitua abaixo.
const HASH_SENHA = "4a7642be7f9af49836659ca908f2300022f3763a15a94ec4719d54f58eb65db5";

const el = (id) => document.getElementById(id);
const CORES = ["#1b2a5c", "#f2b705", "#1f7a4d", "#c2410c", "#6b46c1", "#0e7490", "#be185d", "#64748b"];
let graficos = [];

async function sha256(texto) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ----- Login -----
el("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  if ((await sha256(el("senha").value)) === HASH_SENHA) {
    sessionStorage.setItem("dv_admin", "1");
    abrirPainel();
  } else {
    el("erro-login").hidden = false;
  }
});
el("btn-sair").addEventListener("click", () => { sessionStorage.removeItem("dv_admin"); location.reload(); });
if (sessionStorage.getItem("dv_admin") === "1") abrirPainel();

// ----- Dados -----
async function abrirPainel() {
  el("login").hidden = true;
  el("painel").hidden = false;
  try {
    const snap = await getDocs(collection(db, COLECAO));
    const respostas = snap.docs.map((d) => d.data());
    renderizar(respostas);
  } catch (err) {
    console.error(err);
    el("status").textContent = "Erro ao carregar os dados. Confira a configuração e as regras do Firestore.";
  }
}

// Conta ocorrências de um campo (texto ou lista) -> { valor: quantidade }
function contar(respostas, campo) {
  const total = {};
  respostas.forEach((r) => [].concat(r[campo] ?? []).forEach((v) => (total[v] = (total[v] || 0) + 1)));
  return total;
}

// Média usando somente valores do tipo Number
function media(respostas, campo) {
  const nums = respostas.map((r) => r[campo]).filter((v) => typeof v === "number");
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function renderizar(respostas) {
  el("status").textContent = respostas.length ? "" : "Ainda não há respostas registradas.";
  el("m-total").textContent = respostas.length;
  el("m-moradores").textContent = media(respostas, "moradores").toFixed(1).replace(".", ",");
  el("m-trabalhadores").textContent = media(respostas, "trabalhadores").toFixed(1).replace(".", ",");

  graficos.forEach((g) => g.destroy());
  graficos = [
    criar("g-faixa", "bar", contar(respostas, "faixaEtaria")),
    criar("g-bairro", "bar", contar(respostas, "bairro"), true),
    criar("g-rotina", "bar", contar(respostas, "rotina")),
    criar("g-renda", "doughnut", contar(respostas, "rendaFamiliar")),
    criar("g-voto", "doughnut", contar(respostas, "certezaVoto")),
    criar("g-pautas", "bar", contar(respostas, "pautas"), true)
  ];
}

function criar(id, tipo, dados, horizontal = false) {
  const rosca = tipo === "doughnut";
  return new Chart(el(id), {
    type: tipo,
    data: {
      labels: Object.keys(dados),
      datasets: [{ label: "Respostas", data: Object.values(dados),
        backgroundColor: rosca ? CORES : CORES[0], borderWidth: rosca ? 2 : 0 }]
    },
    options: {
      indexAxis: horizontal ? "y" : "x",
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: rosca, position: "bottom" } },
      scales: rosca ? {} : { [horizontal ? "x" : "y"]: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}
