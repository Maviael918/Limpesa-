-- Policies de exemplo para testes (Supabase)
-- ATENÇÃO: este script permite leitura pública (SELECT) mas restringe
-- operações de escrita (INSERT/UPDATE/DELETE) a usuários autenticados.
-- Use em desenvolvimento. Para produção, prefira políticas baseadas em auth.uid()
-- e/ou endpoints server-side com a 'service_role' quando necessário.

-- Habilitar RLS e criar políticas para as tabelas usadas pelo app

-- Escolas
ALTER TABLE IF EXISTS schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_schools ON schools;
CREATE POLICY allow_public_select_schools ON schools FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_schools ON schools;
CREATE POLICY allow_auth_insert_schools ON schools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_schools ON schools;
CREATE POLICY allow_auth_update_schools ON schools FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_schools ON schools;
CREATE POLICY allow_auth_delete_schools ON schools FOR DELETE USING (auth.uid() IS NOT NULL);

-- Produtos
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_products ON products;
CREATE POLICY allow_public_select_products ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_products ON products;
CREATE POLICY allow_auth_insert_products ON products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_products ON products;
CREATE POLICY allow_auth_update_products ON products FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_products ON products;
CREATE POLICY allow_auth_delete_products ON products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Food products
ALTER TABLE IF EXISTS food_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_food_products ON food_products;
CREATE POLICY allow_public_select_food_products ON food_products FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_food_products ON food_products;
CREATE POLICY allow_auth_insert_food_products ON food_products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_food_products ON food_products;
CREATE POLICY allow_auth_update_food_products ON food_products FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_food_products ON food_products;
CREATE POLICY allow_auth_delete_food_products ON food_products FOR DELETE USING (auth.uid() IS NOT NULL);

-- Unidades
ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_units ON units;
CREATE POLICY allow_public_select_units ON units FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_units ON units;
CREATE POLICY allow_auth_insert_units ON units FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_units ON units;
CREATE POLICY allow_auth_update_units ON units FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_units ON units;
CREATE POLICY allow_auth_delete_units ON units FOR DELETE USING (auth.uid() IS NOT NULL);

-- Kits
ALTER TABLE IF EXISTS kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_kits ON kits;
CREATE POLICY allow_public_select_kits ON kits FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_kits ON kits;
CREATE POLICY allow_auth_insert_kits ON kits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_kits ON kits;
CREATE POLICY allow_auth_update_kits ON kits FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_kits ON kits;
CREATE POLICY allow_auth_delete_kits ON kits FOR DELETE USING (auth.uid() IS NOT NULL);

-- Stock
ALTER TABLE IF EXISTS stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_stock ON stock;
CREATE POLICY allow_public_select_stock ON stock FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_stock ON stock;
CREATE POLICY allow_auth_insert_stock ON stock FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_stock ON stock;
CREATE POLICY allow_auth_update_stock ON stock FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_stock ON stock;
CREATE POLICY allow_auth_delete_stock ON stock FOR DELETE USING (auth.uid() IS NOT NULL);


-- Orders
ALTER TABLE IF EXISTS order_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_orders ON order_history;
CREATE POLICY allow_public_select_orders ON order_history FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_orders ON order_history;
CREATE POLICY allow_auth_insert_orders ON order_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_orders ON order_history;
CREATE POLICY allow_auth_update_orders ON order_history FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_orders ON order_history;
CREATE POLICY allow_auth_delete_orders ON order_history FOR DELETE USING (auth.uid() IS NOT NULL);

-- Food Orders
ALTER TABLE IF EXISTS food_order_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS allow_public_select_food_orders ON food_order_history;
CREATE POLICY allow_public_select_food_orders ON food_order_history FOR SELECT USING (true);
DROP POLICY IF EXISTS allow_auth_insert_food_orders ON food_order_history;
CREATE POLICY allow_auth_insert_food_orders ON food_order_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_update_food_orders ON food_order_history;
CREATE POLICY allow_auth_update_food_orders ON food_order_history FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS allow_auth_delete_food_orders ON food_order_history;
CREATE POLICY allow_auth_delete_food_orders ON food_order_history FOR DELETE USING (auth.uid() IS NOT NULL);

-- Observação: após executar este script, apenas usuários autenticados poderão
-- realizar INSERT/UPDATE/DELETE. Se precisar que clientes (anon) escrevam,
-- considere implementar funções RPC seguras ou usar chaves de serviço no
-- servidor. Após testes, remova/ajuste políticas conforme o modelo de auth.
