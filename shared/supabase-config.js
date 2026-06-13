/* ========================================
   DESTINO ESPANHA — Supabase Configuration
   ======================================== */

const supabaseUrl = "https://ohfvsnfmbeipblqlpxif.supabase.co";
const supabaseAnonKey = "sb_publishable_6RFtDNuqdfs5qgRgGviJWA_-nMb4xy9";


// Initialize Supabase Client
if (window.supabase && typeof window.supabase.createClient === 'function') {
    const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    // Overwrite the global window.supabase with the initialized client
    window.supabase = client;
    window.auth = client.auth;
} else {
    console.error("❌ Supabase SDK library not loaded on window object.");
}

// Expose legacy global variables using 'var' for maximum browser compatibility
var supabase = window.supabase;
var auth = window.auth;

console.log("⚡ Supabase initialized — Destino Espanha");
