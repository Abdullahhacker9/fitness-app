import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htittazytivdwfiqgzuz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aXR0YXp5dGl2ZHdmaXFnenV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTgyMjgsImV4cCI6MjEwNDE3NDIyOH0.qoRb95Any242eC3D6tr_rdi43lngLVyzgf1b4Vu1suY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)