-- Profiles are created by the auth bootstrap trigger and deleted via account-deletion workflows.
revoke insert, delete, update on public.profiles from authenticated;
grant update (
  display_name, gender, gender_identity, pronouns, sexual_orientation, looking_for,
  relationship_goal, bio, city, zone, occupation, company, school, height_cm,
  languages, zodiac_sign, exercise, smoking, alcohol, diet, pets, children,
  wants_children, sleep_habits, onboarding_complete, last_active_at
) on public.profiles to authenticated;

-- Preferences/visibility need upsert for onboarding and settings, but not direct row deletion.
revoke delete on public.preferences, public.profile_visibility from authenticated;
