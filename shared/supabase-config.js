/* ========================================
   DESTINO ESPANHA — Supabase Configuration
   ======================================== */

const supabaseUrl = "https://gspnaxqokidaqynybbty.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcG5heHFva2lkYXF5bnliYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTU2ODAsImV4cCI6MjA5Njg5MTY4MH0.4aF-tka-uMSQcSdNiWJDnmI4tYTkBKlan0yit1Tftno";

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
