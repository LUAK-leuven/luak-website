alter table "public"."Payments" alter column "membership_id" set not null;

alter table "public"."Users" alter column "email" set not null;


-- Fix previous migration

grant delete on table "public"."BoardMembers" to "anon";

grant insert on table "public"."BoardMembers" to "anon";

grant references on table "public"."BoardMembers" to "anon";

grant select on table "public"."BoardMembers" to "anon";

grant trigger on table "public"."BoardMembers" to "anon";

grant truncate on table "public"."BoardMembers" to "anon";

grant update on table "public"."BoardMembers" to "anon";

grant delete on table "public"."BoardMembers" to "authenticated";

grant insert on table "public"."BoardMembers" to "authenticated";

grant references on table "public"."BoardMembers" to "authenticated";

grant select on table "public"."BoardMembers" to "authenticated";

grant trigger on table "public"."BoardMembers" to "authenticated";

grant truncate on table "public"."BoardMembers" to "authenticated";

grant update on table "public"."BoardMembers" to "authenticated";

grant delete on table "public"."BoardMembers" to "service_role";

grant insert on table "public"."BoardMembers" to "service_role";

grant references on table "public"."BoardMembers" to "service_role";

grant select on table "public"."BoardMembers" to "service_role";

grant trigger on table "public"."BoardMembers" to "service_role";

grant truncate on table "public"."BoardMembers" to "service_role";

grant update on table "public"."BoardMembers" to "service_role";

grant delete on table "public"."Memberships" to "anon";

grant insert on table "public"."Memberships" to "anon";

grant references on table "public"."Memberships" to "anon";

grant select on table "public"."Memberships" to "anon";

grant trigger on table "public"."Memberships" to "anon";

grant truncate on table "public"."Memberships" to "anon";

grant update on table "public"."Memberships" to "anon";

grant delete on table "public"."Memberships" to "authenticated";

grant insert on table "public"."Memberships" to "authenticated";

grant references on table "public"."Memberships" to "authenticated";

grant select on table "public"."Memberships" to "authenticated";

grant trigger on table "public"."Memberships" to "authenticated";

grant truncate on table "public"."Memberships" to "authenticated";

grant update on table "public"."Memberships" to "authenticated";

grant delete on table "public"."Memberships" to "service_role";

grant insert on table "public"."Memberships" to "service_role";

grant references on table "public"."Memberships" to "service_role";

grant select on table "public"."Memberships" to "service_role";

grant trigger on table "public"."Memberships" to "service_role";

grant truncate on table "public"."Memberships" to "service_role";

grant update on table "public"."Memberships" to "service_role";

grant delete on table "public"."Payments" to "anon";

grant insert on table "public"."Payments" to "anon";

grant references on table "public"."Payments" to "anon";

grant select on table "public"."Payments" to "anon";

grant trigger on table "public"."Payments" to "anon";

grant truncate on table "public"."Payments" to "anon";

grant update on table "public"."Payments" to "anon";

grant delete on table "public"."Payments" to "authenticated";

grant insert on table "public"."Payments" to "authenticated";

grant references on table "public"."Payments" to "authenticated";

grant select on table "public"."Payments" to "authenticated";

grant trigger on table "public"."Payments" to "authenticated";

grant truncate on table "public"."Payments" to "authenticated";

grant update on table "public"."Payments" to "authenticated";

grant delete on table "public"."Payments" to "service_role";

grant insert on table "public"."Payments" to "service_role";

grant references on table "public"."Payments" to "service_role";

grant select on table "public"."Payments" to "service_role";

grant trigger on table "public"."Payments" to "service_role";

grant truncate on table "public"."Payments" to "service_role";

grant update on table "public"."Payments" to "service_role";

grant delete on table "public"."Users" to "anon";

grant insert on table "public"."Users" to "anon";

grant references on table "public"."Users" to "anon";

grant select on table "public"."Users" to "anon";

grant trigger on table "public"."Users" to "anon";

grant truncate on table "public"."Users" to "anon";

grant update on table "public"."Users" to "anon";

grant delete on table "public"."Users" to "authenticated";

grant insert on table "public"."Users" to "authenticated";

grant references on table "public"."Users" to "authenticated";

grant select on table "public"."Users" to "authenticated";

grant trigger on table "public"."Users" to "authenticated";

grant truncate on table "public"."Users" to "authenticated";

grant update on table "public"."Users" to "authenticated";

grant delete on table "public"."Users" to "service_role";

grant insert on table "public"."Users" to "service_role";

grant references on table "public"."Users" to "service_role";

grant select on table "public"."Users" to "service_role";

grant trigger on table "public"."Users" to "service_role";

grant truncate on table "public"."Users" to "service_role";

grant update on table "public"."Users" to "service_role";
