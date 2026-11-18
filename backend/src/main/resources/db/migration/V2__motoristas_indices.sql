-- V2 — restrições de integridade do módulo Motorista.
-- Compatível com PostgreSQL e com H2 em modo PostgreSQL (o perfil "test" roda esta migration).
-- Não altera a V1: apenas adiciona constraints que a V1 não tinha.
--
-- "Só dígitos" sem depender de regex específico de banco: REPLACE() e LENGTH() funcionam
-- igual nos dois (SIMILAR TO existe no PostgreSQL, mas não no H2; ~ e regexp_like são o contrário).

-- CPF/CNH: a coluna é VARCHAR(11), então o tamanho máximo já é garantido; falta impedir
-- menos de 11 caracteres e caracteres que não sejam dígitos (o front remove a máscara).
ALTER TABLE motoristas
    ADD CONSTRAINT ck_motoristas_cpf_digitos CHECK (
        length(cpf) = 11
        AND length(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(cpf,
            '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '')) = 0
    );

ALTER TABLE motoristas
    ADD CONSTRAINT ck_motoristas_cnh_digitos CHECK (
        length(cnh) = 11
        AND length(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(cnh,
            '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '')) = 0
    );

-- Telefone: DDD + número, ou seja, 10 (fixo) ou 11 (celular) dígitos, sem máscara.
ALTER TABLE motoristas
    ADD CONSTRAINT ck_motoristas_telefone_digitos CHECK (
        length(telefone) BETWEEN 10 AND 11
        AND length(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(telefone,
            '0', ''), '1', ''), '2', ''), '3', ''), '4', ''), '5', ''), '6', ''), '7', ''), '8', ''), '9', '')) = 0
    );

-- Categoria da CNH: só A..E. A PK (motorista_id, categoria) já evita repetição.
ALTER TABLE motorista_categorias
    ADD CONSTRAINT ck_motorista_categorias_valor CHECK (categoria IN ('A', 'B', 'C', 'D', 'E'));

-- Sobre índices: nenhum novo se justifica agora.
--   * cpf e cnh já têm índice único (uq_motoristas_cpf / uq_motoristas_cnh);
--   * status já tem idx_motoristas_status (V1) e a FK de ocorrencias já tem idx_ocorrencias_motorista;
--   * a busca q usa LIKE '%termo%', que não aproveita índice btree em lower(nome).
--     Um índice realmente útil para essa busca seria GIN + pg_trgm, que não existe no H2; fica de fora.
