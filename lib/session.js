import { supabase } from './supabase';

export async function getActiveSessionId() {
  const { data } = await supabase
    .from('app_settings')
    .select('active_session_id')
    .eq('id', 1)
    .single();
  return data?.active_session_id || null;
}
