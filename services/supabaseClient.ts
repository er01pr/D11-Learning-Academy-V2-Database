import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbiztwryxdunomyveahs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaXp0d3J5eGR1bm9teXZlYWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxODE3MzgsImV4cCI6MjA4MDc1NzczOH0.1y1WuVFYCju5L10BW2aKiKMTllrQOlEwcmbPlvi8JUg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);