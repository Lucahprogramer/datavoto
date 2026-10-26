// ===== Formulário público: validação e gravação no Firestore =====
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, COLECAO } from "./firebase-config.js";

const form = document.getElementById("form-pesquisa");
const msg = document.getElementById("mensagem");
const btn = document.getElementById("btn-enviar");
const sucesso = document.getElementById("sucesso");

const marcados = (nome) => [...form.querySelectorAll(`input[name="${nome}"]:checked`)].map((i) => i.value);

function mostrarErro(texto, campo) {
  msg.textContent = texto;
  msg.hidden = false;
  campo?.classList.add("invalido");
  campo?.focus();
}

// Lê o formulário e converte os campos numéricos (chegam como String) com Number()
function lerFormulario() {
  return {
    faixaEtaria: form.faixaEtaria.value,
    bairro: form.bairro.value,
    rotina: marcados("rotina"),
    rendaFamiliar: form.rendaFamiliar.value,
    moradores: Number(form.moradores.value),
    trabalhadores: Number(form.trabalhadores.value),
    certezaVoto: form.certezaVoto.value,
    pautas: marcados("pautas"),
    criadoEm: serverTimestamp() // marcação temporal gerada pelo servidor
  };
}

function validar(d) {
  form.querySelectorAll(".invalido").forEach((e) => e.classList.remove("invalido"));
  if (!d.faixaEtaria) return ["Escolha sua faixa etária.", form.faixaEtaria];
  if (!d.bairro) return ["Escolha seu bairro.", form.bairro];
  if (!d.rotina.length) return ["Marque pelo menos uma opção de rotina.", form.querySelector('[name="rotina"]')];
  if (!d.rendaFamiliar) return ["Escolha a renda familiar.", form.rendaFamiliar];
  if (!form.moradores.value || !Number.isInteger(d.moradores) || d.moradores < 1)
    return ["Informe quantas pessoas moram na casa (mínimo 1).", form.moradores];
  if (!form.trabalhadores.value || !Number.isInteger(d.trabalhadores) || d.trabalhadores < 0)
    return ["Informe quantas pessoas trabalham (pode ser 0).", form.trabalhadores];
  if (d.trabalhadores > d.moradores) return ["Trabalhadores não pode ser maior que moradores.", form.trabalhadores];
  if (!d.certezaVoto) return ["Escolha o quanto você tem certeza do seu voto.", form.querySelector('[name="certezaVoto"]')];
  if (!d.pautas.length) return ["Marque pelo menos uma pauta.", form.querySelector('[name="pautas"]')];
  if (d.pautas.length > 3) return ["Marque no máximo 3 pautas.", form.querySelector('[name="pautas"]')];
  return null;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.hidden = true;
  const dados = lerFormulario();
  const erro = validar(dados);
  if (erro) return mostrarErro(...erro);

  btn.disabled = true;
  btn.textContent = "Enviando…";
  try {
    await addDoc(collection(db, COLECAO), dados);
    form.hidden = true;
    sucesso.hidden = false;
    sucesso.focus();
  } catch (err) {
    console.error("Erro ao gravar no Firestore:", err);
    mostrarErro("Não foi possível enviar agora. Verifique a conexão e tente de novo.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar resposta";
  }
});

document.getElementById("btn-nova").addEventListener("click", () => {
  form.reset();
  sucesso.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0 });
});
