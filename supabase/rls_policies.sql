-- ============================================================
-- RLS Policies para DosDos
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── users ───────────────────────────────────────────────────
alter table users enable row level security;

create policy "usuarios pueden ver cualquier perfil"
  on users for select
  using (true);

create policy "usuarios solo modifican su propio perfil"
  on users for update
  using (auth.uid() = id);

create policy "usuarios insertan su propio perfil"
  on users for insert
  with check (auth.uid() = id);

-- ─── photos ──────────────────────────────────────────────────
alter table photos enable row level security;

create policy "fotos son visibles para todos"
  on photos for select
  using (true);

create policy "usuarios insertan sus propias fotos"
  on photos for insert
  with check (auth.uid()::text = "userId");

create policy "usuarios eliminan sus propias fotos"
  on photos for delete
  using (auth.uid()::text = "userId");

-- ─── duos ────────────────────────────────────────────────────
alter table duos enable row level security;

create policy "duos son visibles para todos"
  on duos for select
  using (true);

create policy "miembros del dúo pueden actualizar su dúo"
  on duos for update
  using (
    exists (
      select 1 from duo_members
      where duo_members."duoId" = duos.id
        and duo_members."userId" = auth.uid()::text
    )
  );

create policy "cualquier usuario autenticado puede crear un dúo"
  on duos for insert
  with check (auth.role() = 'authenticated');

-- ─── duo_members ─────────────────────────────────────────────
alter table duo_members enable row level security;

create policy "membresías son visibles para todos"
  on duo_members for select
  using (true);

create policy "usuarios insertan su propia membresía"
  on duo_members for insert
  with check (auth.uid()::text = "userId");

create policy "usuarios eliminan su propia membresía"
  on duo_members for delete
  using (auth.uid()::text = "userId");

-- ─── duo_invitations ─────────────────────────────────────────
alter table duo_invitations enable row level security;

create policy "usuarios ven invitaciones donde participan"
  on duo_invitations for select
  using (
    auth.uid()::text = "inviterId"
    or auth.uid()::text = "inviteeId"
  );

create policy "usuarios crean invitaciones como inviter"
  on duo_invitations for insert
  with check (auth.uid()::text = "inviterId");

create policy "invitee puede actualizar el estado"
  on duo_invitations for update
  using (auth.uid()::text = "inviteeId");

-- ─── swipes ──────────────────────────────────────────────────
alter table swipes enable row level security;

create policy "usuarios ven sus propios swipes"
  on swipes for select
  using (auth.uid()::text = "swiperUserId");

create policy "usuarios insertan sus propios swipes"
  on swipes for insert
  with check (auth.uid()::text = "swiperUserId");

-- ─── matches ─────────────────────────────────────────────────
alter table matches enable row level security;

create policy "miembros de un dúo ven sus matches"
  on matches for select
  using (
    exists (
      select 1 from duo_members
      where duo_members."userId" = auth.uid()::text
        and (duo_members."duoId" = matches."duoAId" or duo_members."duoId" = matches."duoBId")
    )
  );

create policy "solo el sistema crea matches"
  on matches for insert
  with check (auth.role() = 'authenticated');

-- ─── chats ───────────────────────────────────────────────────
alter table chats enable row level security;

create policy "miembros del match ven el chat"
  on chats for select
  using (
    exists (
      select 1
      from matches
      join duo_members dm on dm."duoId" = matches."duoAId" or dm."duoId" = matches."duoBId"
      where matches.id = chats."matchId"
        and dm."userId" = auth.uid()::text
    )
  );

create policy "solo el sistema crea chats"
  on chats for insert
  with check (auth.role() = 'authenticated');

-- ─── messages ────────────────────────────────────────────────
alter table messages enable row level security;

create policy "miembros del chat ven los mensajes"
  on messages for select
  using (
    exists (
      select 1
      from chats
      join matches on matches.id = chats."matchId"
      join duo_members dm on dm."duoId" = matches."duoAId" or dm."duoId" = matches."duoBId"
      where chats.id = messages."chatId"
        and dm."userId" = auth.uid()::text
    )
  );

create policy "miembros del chat envían mensajes"
  on messages for insert
  with check (
    auth.uid()::text = "senderId"
    and exists (
      select 1
      from chats
      join matches on matches.id = chats."matchId"
      join duo_members dm on dm."duoId" = matches."duoAId" or dm."duoId" = matches."duoBId"
      where chats.id = messages."chatId"
        and dm."userId" = auth.uid()::text
    )
  );
