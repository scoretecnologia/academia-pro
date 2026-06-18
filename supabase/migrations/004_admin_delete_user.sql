create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_manager() then
    raise exception 'Acesso negado. Apenas gestores podem apagar usuarios.';
  end if;

  if auth.uid() = target_user_id then
    raise exception 'Voce nao pode apagar o proprio usuario.';
  end if;

  delete from public.sales
  where vendedor_id = target_user_id;

  delete from public.teacher_records
  where professor_id = target_user_id;

  delete from auth.users
  where id = target_user_id;
end;
$$;
