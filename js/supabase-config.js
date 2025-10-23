// supabase-config.js
const SUPABASE_URL = 'https://cqtxsyzuvlucxfbyxyhp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdHhzeXp1dmx1Y3hmYnl4eWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODk1MjQsImV4cCI6MjA2Mzg2NTUyNH0.zCC23y3KGvkjAqGFCopteAk5QV4JXkLeSonIjmFK1AM';

// Inicializar o cliente Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized:', !!supabaseClient);

// Exportar para uso global
window.supabaseClient = supabaseClient;