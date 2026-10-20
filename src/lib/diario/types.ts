export type TipoMidia = "foto" | "video";

export type Midia = {
  /** Nome do arquivo dentro de `$DIARIO_DATA_DIR/midias/`. */
  arquivo: string;
  tipo: TipoMidia;
};

export type Autor = "edson" | "ela";

export type Memoria = {
  id: string;
  /** AAAA-MM-DD */
  data: string;
  titulo: string | null;
  /** Parágrafos separados por linha em branco. */
  texto: string;
  /** A primeira é a capa. */
  midias: Midia[];
  autor: Autor;
  momento_especial: boolean;
  data_especial: boolean;
  criado_em: string;
  atualizado_em: string | null;
  /** Dados do formato antigo (retrospectiva). Nunca editar nem apagar. */
  _legado?: Record<string, unknown>;
};

export type DataEspecial = {
  id: string;
  nome: string | null;
  subtitulo: string | null;
  /** AAAA-MM-DD */
  data: string;
  recorrente: boolean;
};

export type Diario = {
  versao: number;
  gerado_em?: string;
  memorias: Memoria[];
  datas_especiais: DataEspecial[];
};

/** Versão enviada pro navegador (sem o bloco legado, que é pesado e interno). */
export type MemoriaPublica = Omit<Memoria, "_legado"> & {
  /** Enquadramento herdado da retrospectiva antiga (só leitura). */
  ajuste?: { posicao?: string; inteira?: boolean };
};

export type GrupoMes = {
  /** AAAA-MM */
  chave: string;
  mes: string;
  ano: number;
  memorias: MemoriaPublica[];
};

export type EntradaMemoria = {
  data: string;
  titulo: string | null;
  texto: string;
  midias: Midia[];
  autor: Autor;
  momento_especial: boolean;
  data_especial: boolean;
};
