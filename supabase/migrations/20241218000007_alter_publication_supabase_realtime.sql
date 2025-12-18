begin;
-- remove the supabase_realtime publication
drop
  publication if exists supabase_realtime;
-- re-create the supabase_realtime publication with no tables
create publication supabase_realtime;
commit;

alter publication supabase_realtime add table sections;
alter publication supabase_realtime add table section_participants;
alter publication supabase_realtime add table games;

alter table sections replica identity full;
alter table section_participants replica identity full;
alter table games replica identity full;

select tablename, policyname, cmd 
from pg_policies 
where schemaname = 'public' 
  and tablename in ('sections', 'section_participants', 'games');
