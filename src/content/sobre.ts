// =============================================================================
// Textos da página "Sobre" (/sobre). EDITE AQUI, sem mexer no layout.
// =============================================================================
// Textos INICIAIS baseados apenas nas informações do briefing da ONG
// (Manaus/AM; resgate de cães e gatos em situação de vulnerabilidade;
// feirinhas de adoção em praças; apoio a protetores independentes). Não contêm
// datas, nomes, números nem endereços. Revise com a diretoria os itens
// marcados com "⚠️ A CONFIRMAR".
//
// FALLBACK: a página usa estes textos só para os trechos ainda não cadastrados
// no painel (/admin/instituicao → tabela institution_content). O que for salvo
// lá substitui o trecho correspondente daqui.
//
// Contato: a página mostra apenas canais já configurados no projeto (WhatsApp
// de INSTITUTION_WHATSAPP e contatos cadastrados no painel).
// =============================================================================

export const aboutContent = {
  intro: {
    title: "Sobre a ONG Protetora 4 Patas",
    // ⚠️ A CONFIRMAR: ajuste o tom, se necessário.
    text:
      "Somos uma ONG de proteção animal em Manaus (AM). Resgatamos cães e gatos em situação de vulnerabilidade, promovemos feirinhas de adoção em praças e apoiamos protetores independentes, para que cada animal encontre um lar responsável e cheio de amor.",
  },

  history: {
    title: "Nossa história",
    // ⚠️ A CONFIRMAR: cadastre a história real no painel (como, quando e por
    // quem a ONG surgiu). Enquanto não houver, a página mostra `pendingMessage`.
    paragraphs: [] as string[],
    pendingMessage:
      "Em breve vamos contar aqui como a ONG Protetora 4 Patas começou e quem faz parte dessa caminhada.",
  },

  // ⚠️ A CONFIRMAR: missão, visão e valores oficiais da instituição.
  mission: {
    title: "Missão",
    text:
      "Resgatar, cuidar e encontrar um lar responsável para cada animal, promovendo o bem-estar animal, a adoção responsável e a conscientização.",
  },
  vision: {
    title: "Visão",
    text:
      "Uma Manaus em que todo animal seja tratado com respeito e em que a adoção responsável seja a primeira escolha.",
  },
  values: {
    title: "Valores",
    items: [
      { name: "Bem-estar animal", text: "As necessidades de cada animal vêm em primeiro lugar." },
      { name: "Adoção responsável", text: "Cada adoção é um compromisso para a vida toda do animal." },
      { name: "Conscientização", text: "Informação sobre posse responsável, vacinação e castração." },
      { name: "Transparência", text: "Clareza sobre como as doações e os recursos são usados." },
    ],
  },

  work: {
    title: "Nossa atuação em Manaus",
    intro: "Nosso trabalho envolve frentes que caminham juntas:",
    // ⚠️ A CONFIRMAR: detalhes de cada frente.
    items: [
      {
        name: "Resgate",
        text: "Resgatamos cães e gatos em situação de vulnerabilidade e oferecemos um lugar seguro enquanto se recuperam.",
      },
      {
        name: "Cuidados",
        text: "Alimentação, vacinação, castração e muito carinho para que cada animal fique pronto para um novo lar.",
      },
      {
        name: "Feirinhas de adoção",
        text: "Levamos os animais a feirinhas de adoção em praças de Manaus, para que a comunidade os conheça de perto.",
      },
      {
        name: "Apoio aos protetores independentes",
        text: "Apoiamos protetores independentes que também cuidam de animais abandonados e comunitários.",
      },
    ],
  },

  // Contatos oficiais informados pela ONG. Usados quando o campo correspondente
  // estiver vazio no painel (/admin/instituicao).
  contacts: {
    instagramUrl: "https://www.instagram.com/protetora_4patas/",
  },
} as const;
