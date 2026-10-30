-- WorkforceAI tenant-safe foundation for Supabase / PostgreSQL.
create extension if not exists pgcrypto;

create type public.member_role as enum ('owner', 'admin', 'member', 'viewer');
create type public.task_status as enum ('queued', 'in_progress', 'in_review', 'done', 'blocked');
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'changes_requested');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_id_idx on public.organization_members(user_id);

-- Provision the first organization and owner membership atomically. The caller
-- cannot supply another user's ID; auth.uid() is the only source of identity.
create or replace function public.create_organization(org_name text, org_slug text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  new_organization_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  insert into public.organizations(name, slug)
  values (trim(org_name), lower(trim(org_slug)))
  returning id into new_organization_id;
  insert into public.organization_members(organization_id, user_id, role)
  values (new_organization_id, current_user_id, 'owner');
  return new_organization_id;
end;
$$;
revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  title text not null,
  description text not null default '',
  instructions text not null default '',
  skills text[] not null default '{}',
  manager_agent_id uuid,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id),
  foreign key (manager_agent_id, organization_id) references public.agents(id, organization_id) on delete restrict
);
create index agents_org_idx on public.agents(organization_id, enabled);

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  name text not null,
  objective text not null check (char_length(objective) between 8 and 1200),
  status text not null default 'queued' check (status in ('queued','running','in_review','completed','failed','cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workflows_org_created_idx on public.workflows(organization_id, created_at desc);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete set null,
  title text not null check (char_length(title) between 1 and 240),
  description text not null default '',
  status public.task_status not null default 'queued',
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  assigned_agent_id uuid,
  created_by uuid not null references auth.users(id),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (assigned_agent_id, organization_id) references public.agents(id, organization_id) on delete restrict
);
create index tasks_org_status_idx on public.tasks(organization_id, status, created_at desc);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workflow_id uuid references public.workflows(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  agent_id uuid,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (agent_id, organization_id) references public.agents(id, organization_id) on delete restrict
);
create index deliverables_org_created_idx on public.deliverables(organization_id, created_at desc);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete cascade,
  requested_by_agent_id uuid,
  action_type text not null check (action_type in ('publish_content','send_communication','modify_production','deploy_code','spend_money','change_customer_data','delete_data','other')),
  summary text not null,
  status public.approval_status not null default 'pending',
  reviewed_by uuid references auth.users(id),
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (requested_by_agent_id, organization_id) references public.agents(id, organization_id) on delete restrict
);
create index approvals_org_status_idx on public.approvals(organization_id, status, created_at desc);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_agent_id uuid,
  event_type text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (actor_agent_id, organization_id) references public.agents(id, organization_id) on delete restrict
);
create index audit_events_org_time_idx on public.audit_events(organization_id, created_at desc);

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles public.member_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_org and user_id = (select auth.uid()) and role = any(allowed_roles)
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.agents enable row level security;
alter table public.workflows enable row level security;
alter table public.tasks enable row level security;
alter table public.deliverables enable row level security;
alter table public.approvals enable row level security;
alter table public.audit_events enable row level security;

create policy "Members can view organizations" on public.organizations for select using (public.is_org_member(id));
create policy "Owners and admins can update organizations" on public.organizations for update using (public.has_org_role(id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(id, array['owner','admin']::public.member_role[]));
create policy "Members can view organization membership" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "Owners and admins can manage membership" on public.organization_members for all using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));

create policy "Members can read agents" on public.agents for select using (public.is_org_member(organization_id));
create policy "Admins can manage agents" on public.agents for all using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[])) with check (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));

create policy "Members can read workflows" on public.workflows for select using (public.is_org_member(organization_id));
create policy "Members can start workflows" on public.workflows for insert with check (public.is_org_member(organization_id) and created_by = (select auth.uid()));
create policy "Members can update workflows" on public.workflows for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "Members can read tasks" on public.tasks for select using (public.is_org_member(organization_id));
create policy "Members can create tasks" on public.tasks for insert with check (public.is_org_member(organization_id) and created_by = (select auth.uid()));
create policy "Members can update tasks" on public.tasks for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "Admins can delete tasks" on public.tasks for delete using (public.has_org_role(organization_id, array['owner','admin']::public.member_role[]));

create policy "Members can read deliverables" on public.deliverables for select using (public.is_org_member(organization_id));
create policy "Members can create deliverables" on public.deliverables for insert with check (public.is_org_member(organization_id));
create policy "Members can read approvals" on public.approvals for select using (public.is_org_member(organization_id));
create policy "Members can request approvals" on public.approvals for insert with check (public.is_org_member(organization_id));
create policy "Members can review approvals" on public.approvals for update using (public.is_org_member(organization_id) and status = 'pending') with check (public.is_org_member(organization_id) and reviewed_by = (select auth.uid()));
create policy "Members can read audit events" on public.audit_events for select using (public.is_org_member(organization_id));
create policy "Members can write audit events" on public.audit_events for insert with check (public.is_org_member(organization_id));

-- No client-side delete policies for audit history or deliverables.
