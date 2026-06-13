/* ========================================
   DESTINO ESPANHA — Supabase Configuration
   ======================================== */

const supabaseUrl = "https://gspnaxqokidaqynybbty.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcG5heHFva2lkYXF5bnliYnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTU2ODAsImV4cCI6MjA5Njg5MTY4MH0.4aF-tka-uMSQcSdNiWJDnmI4tYTkBKlan0yit1Tftno";

// Initialize Supabase Client
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
const auth = supabase.auth;

console.log("⚡ Supabase initialized — Destino Espanha");
