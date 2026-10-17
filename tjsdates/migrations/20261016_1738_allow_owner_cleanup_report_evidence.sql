-- Allow the uploader to remove report evidence objects if DB registration fails
-- or before the evidence is finalized. Read access remains separately restricted.
drop policy if exists report_evidence_owner_delete on storage.objects;
create policy report_evidence_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id='report-evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
