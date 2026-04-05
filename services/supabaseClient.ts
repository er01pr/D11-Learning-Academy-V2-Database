import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gbiztwryxdunomyveahs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaXp0d3J5eGR1bm9teXZlYWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODE3MzgsImV4cCI6MjA4MDc1NzczOH0.1y1WuVFYCju5L10BW2aKiKMTllrQOlEwcmbPlvi8JUg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);