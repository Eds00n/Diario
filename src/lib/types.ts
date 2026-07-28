export type Entry = {
  id: string;
  data: string;
  /** Fim do intervalo (mesmo mês/ano) exibido no cabeçalho da entrada. */
  data_fim?: string;
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
  /** Fundo imersivo (public/images) ao rolar até esta entrada. */
  fundo_imersivo?: string;
  /** Continua o fundo imersivo da entrada anterior (mesma zona de scroll). */
  fundo_imersivo_grupo?: boolean;
  created_at: string;
};

export type SpecialDate = {
  id: string;
  nome: string;
  data: string;
  recorrente: boolean;
  created_at: string;
};
