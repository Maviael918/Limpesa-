# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-10-11
### Added
- Suporte básico ao Supabase: `supabase.js` com helpers para sync, upsert e upload (logs adicionados).
- SQL para criar tabelas e índices: `supabase_tables.sql`, `supabase_add_unique_indexes.sql`.
- Políticas RLS de teste: `supabase_policies.sql` (apenas para desenvolvimento) e script para reverter `supabase_policies_revert.sql`.
- Integração automática no front-end: chamadas a Supabase quando criar escolas, produtos, unidades, estoque e pedidos (`script.js`).

### Changed
- Tradução dos comentários SQL para português (`supabase_tables.sql`).
- Correções de sintaxe em scripts SQL para compatibilidade com PostgreSQL.

### Notes
- Após testar, execute `supabase_policies_revert.sql` no painel do Supabase para remover as policies de teste.
