-- Script para reverter as políticas de teste criadas em `supabase_policies.sql`
-- Use este script no SQL Editor do Supabase para remover as policies permissivas e desabilitar RLS nas tabelas.
-- Executar este script restaura o comportamento padrão (sem as policies que permitiam escrita com a anon key).

-- Escolas
DROP POLICY IF EXISTS allow_anon_select_schools ON schools;
DROP POLICY IF EXISTS allow_anon_insert_schools ON schools;
DROP POLICY IF EXISTS allow_anon_update_schools ON schools;
DROP POLICY IF EXISTS allow_anon_delete_schools ON schools;
ALTER TABLE IF EXISTS schools DISABLE ROW LEVEL SECURITY;

-- Produtos
DROP POLICY IF EXISTS allow_anon_select_products ON products;
DROP POLICY IF EXISTS allow_anon_insert_products ON products;
DROP POLICY IF EXISTS allow_anon_update_products ON products;
DROP POLICY IF EXISTS allow_anon_delete_products ON products;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;

-- Unidades
DROP POLICY IF EXISTS allow_anon_select_units ON units;
DROP POLICY IF EXISTS allow_anon_insert_units ON units;
DROP POLICY IF EXISTS allow_anon_update_units ON units;
DROP POLICY IF EXISTS allow_anon_delete_units ON units;
ALTER TABLE IF EXISTS units DISABLE ROW LEVEL SECURITY;

-- Kits
DROP POLICY IF EXISTS allow_anon_select_kits ON kits;
DROP POLICY IF EXISTS allow_anon_insert_kits ON kits;
DROP POLICY IF EXISTS allow_anon_update_kits ON kits;
DROP POLICY IF EXISTS allow_anon_delete_kits ON kits;
ALTER TABLE IF EXISTS kits DISABLE ROW LEVEL SECURITY;

-- Stock
DROP POLICY IF EXISTS allow_anon_select_stock ON stock;
DROP POLICY IF EXISTS allow_anon_insert_stock ON stock;
DROP POLICY IF EXISTS allow_anon_update_stock ON stock;
DROP POLICY IF EXISTS allow_anon_delete_stock ON stock;
ALTER TABLE IF EXISTS stock DISABLE ROW LEVEL SECURITY;

-- Orders
DROP POLICY IF EXISTS allow_anon_select_orders ON orders;
DROP POLICY IF EXISTS allow_anon_insert_orders ON orders;
DROP POLICY IF EXISTS allow_anon_update_orders ON orders;
DROP POLICY IF EXISTS allow_anon_delete_orders ON orders;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;

-- Nota: se você quiser apenas remover as policies mas manter RLS habilitado, remova as linhas de DISABLE ROW LEVEL SECURITY.
