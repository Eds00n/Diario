export type Entry = {
  id: string;
  data: string;
  /** Fim do intervalo (mesmo mês/ano) exibido no cabeçalho da entrada. */
  data_fim?: string;
  /** Força o texto principal como citação (itálico, tamanho médio), nunca título grande. */
  citacao_apenas?: boolean;
  /** Título curto editorial (opcional). Se omitido, `texto` longo vira citação. */
  titulo?: string;
  texto: string;
  /** Parágrafo logo abaixo do texto principal (antes das fotos). */
  texto_complemento?: string;
  /** Texto abaixo das fotos (layout de duas fotos empilhadas). */
  texto_abaixo?: string;
  /** Segundo parágrafo abaixo, alinhado à direita (duas fotos). */
  texto_abaixo_direita?: string;
  fotos: string[];
  /** Galeria abaixo do banner full-bleed (só com foto_importante_banner). */
  fotos_abaixo?: string[];
  is_data_especial: boolean;
  /** Layout destaque: foto centralizada, texto fixo ao lado (esquerda). */
  foto_importante?: boolean;
  /** Faixa full-bleed com foto de fundo; se false, layout central em 3 colunas. */
  foto_importante_banner?: boolean;
  /** Foto na coluna direita (texto à esquerda) no layout padrão da timeline. */
  foto_direita?: boolean;
  /** Foto aparece no hero Polaroid; não repete na coluna da entrada. */
  polaroid_hero?: boolean;
  /** Inclui a foto no varal do hero (HeroClothesline) — não afeta o layout
   * da própria entrada nem os outros destaques (foto_importante/polaroid_hero),
   * é só a lista curada de fotos que aparecem passeando na cordinha. */
  varal_hero?: boolean;
  /** Mídia do Polaroid do hero quando diferente da foto da entrada. */
  polaroid_foto?: string;
  /** Foto começa borrada até o usuário tocar em “Avançar”. */
  foto_revelar_blur?: boolean;
  /** Enquadramento CSS object-position (ex.: "50% 38%"). */
  foto_object_position?: string;
  /** Zoom leve com object-cover (ex.: 1.1 recorta bordas). */
  foto_object_scale?: number;
  /** Mostra a foto inteira (object-contain), sem recortar — pra fotos com proporção incomum (ex.: print de texto). */
  foto_sem_corte?: boolean;
  /** 3+ fotos empilhadas verticalmente (todas visíveis), em vez do baralho padrão. */
  fotos_pilha_vertical?: boolean;
  /** Fundo imersivo (public/images) ao rolar até esta entrada. */
  fundo_imersivo?: string;
  /** Continua o fundo imersivo da entrada anterior (mesma zona de scroll). */
  fundo_imersivo_grupo?: boolean;
  /** Layout especial: fotos em polaroid deslizando em carrossel automático, data centralizada acima. */
  carrossel_polaroid?: boolean;
  created_at: string;
};

export type SpecialDate = {
  id: string;
  nome?: string;
  /** Linha principal (ex.: “Juntos…”). */
  subtitulo?: string;
  data: string;
  recorrente: boolean;
  created_at: string;
};
