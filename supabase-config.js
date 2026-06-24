// Supabase Configuration
const SUPABASE_URL = 'https://ijertpdemtmojjrwtpvg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZXJ0cGRlbXRtb2pqcnd0cHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODE2NzMsImV4cCI6MjA5Nzg1NzY3M30.xNDz_Hv7yxxjujZjUOo7Ocf2s9rmBtIDo3ewCzyL-VA';

// Initialize Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
window.supabaseClient = supabaseClient;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

console.log('✅ Supabase Connected Successfully!');