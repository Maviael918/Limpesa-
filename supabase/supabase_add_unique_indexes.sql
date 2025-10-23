-- Adiciona constraints/índices únicos necessários para permitir upsert por 'name'
-- Execute este arquivo no editor SQL do Supabase (Query editor) para aplicar as alterações.

-- Garante que o nome da escola seja único (necessário para upsert on_conflict=name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'schools_name_unique'
  ) THEN
    ALTER TABLE IF EXISTS schools
      ADD CONSTRAINT schools_name_unique UNIQUE (name);
  END IF;
END$$;

-- Garante que o nome do produto seja único
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_name_unique'
  ) THEN
    ALTER TABLE IF EXISTS products
      ADD CONSTRAINT products_name_unique UNIQUE (name);
  END IF;
END$$;

-- Garante que o nome da unidade seja único
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'units_name_unique'
  ) THEN
    ALTER TABLE IF EXISTS units
      ADD CONSTRAINT units_name_unique UNIQUE (name);
  END IF;
END$$;

-- Nota: a tabela 'stock' já usa 'product' como primary key no schema fornecido.
-- Após executar este script, os comandos upsert(..., { onConflict: 'name' }) deverão funcionar.
