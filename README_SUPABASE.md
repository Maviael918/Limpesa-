Supabase integration (local setup)

1. Create a Supabase project at https://app.supabase.com
2. In the SQL Editor, run the SQL file `supabase_tables.sql` to create the tables used by this app.
3. Update `js/supabase-config.js` with your Supabase project URL and anon key (anon/public key available at Settings → API → Project API keys).
4. Open `index.html` in the browser. A aplicação carregará automaticamente os dados existentes do Supabase na primeira carga e enviará cada alteração feita na interface (escolas, produtos, unidades, estoque, kits e pedidos) sem ações manuais adicionais.

Notes & Security
- Do not commit `supabase-config.js` with real keys to version control.
- Após configurar as credenciais, basta abrir a aplicação: nenhum comando manual é necessário para sincronizar.
- For production consider using a server-side component to sign requests or use Row Level Security (RLS) with authenticated users.
