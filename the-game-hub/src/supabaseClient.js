/* Aqui  se define el cliente de Supabase para interactuar con la base de datos
y realizar operaciones como autenticación, consultas y actualizaciones. */

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SB_URL,
  import.meta.env.VITE_SB_ANON_KEY
);

