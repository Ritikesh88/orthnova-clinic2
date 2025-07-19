import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.com/dashboard/project/flfbklsoqamandfuuadq ';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZmJrbHNvcWFtYW5kZnV1YWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjEwOTksImV4cCI6MjA2ODQ5NzA5OX0.vbcl8sIHxnExNlKGI1c_p2_TEO5aaocXGPMh12Mo6x8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);