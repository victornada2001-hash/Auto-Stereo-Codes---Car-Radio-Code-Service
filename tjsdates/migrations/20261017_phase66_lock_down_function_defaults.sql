-- Phase 66: make future public functions closed by default.
-- Existing function privileges are intentionally left unchanged.
-- New functions created by postgres must explicitly GRANT EXECUTE to browser roles.

alter default privileges for role postgres in schema public
  revoke execute on functions from public;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
