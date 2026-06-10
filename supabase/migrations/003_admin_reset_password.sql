create or replace function public.admin_reset_user_password(target_user_id uuid, new_password text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Verifica se quem está chamando é gestor
  if not public.is_manager() then
    raise exception 'Acesso negado. Apenas gestores podem redefinir senhas.';
  end if;

  -- Atualiza a senha do usuário na tabela auth.users
  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf'))
  where id = target_user_id;
end;
$$;
