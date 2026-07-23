const SUPABASE_URL = "https://mcijsobzvsrjpvcpyxuy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xw-5aFmYgABBT4QIKTTFzw_AUJRLJKC";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
