import { createClient } from '@supabase/supabase-js';

// Environment variables check hongay, missing hone par fallback values auto-use hongi
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://czvnlnzlpvfyrrrbkkfl.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dm5sbnpscHZmeXJycmJra2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDEwNzcsImV4cCI6MjEwNDExNzA3N30.1JD7VeZHZvVe2hPnjPJrR1ivMs_tEzFgw_iTa8N_Ba4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);