// Veja: https://www.imsglobal.org/spec/lti/v1p3/#role-vocabularies

import { InstitutionRoles } from "./institution";
import { MembershipRoles } from "./membership";
import { SystemRoles } from "./system";

const deprecatedPredicate = "http://purl.imsglobal.org/vocab/lis/v2/person#";

type RoleKind = "membership" | "system" | "institution" | undefined;
type RoleKindWithoutUndefined = Exclude<RoleKind, undefined>;
type Roles = Record<RoleKindWithoutUndefined, string[]>;

export function removeDeprecatedRoles(roles: string[]): string[] {
  return roles.filter((role) => !role.startsWith(deprecatedPredicate));
}

export function parseLMSRoles(roleURLs: string[]): Roles {
  return roleURLs.map(withRoleCategory).reduce(
    (roles, [url, kind]) => {
      switch (kind) {
        case "institution":
          roles[kind].push(InstitutionRoles.fromIMSRole(url)!);
          break;
        case "membership":
          roles[kind].push(MembershipRoles.fromIMSRole(url)!);
          break;
        case "system":
          roles[kind].push(SystemRoles.fromIMSRole(url)!);
          break;
      }

      return roles;
    },
    { institution: [], membership: [], system: [] } as Roles,
  );
}

function withRoleCategory(r: string): [string, RoleKind] {
  if (r.startsWith(MembershipRoles.predicate)) return [r, "membership"];
  if (r.startsWith(InstitutionRoles.predicate)) return [r, "institution"];
  if (r.startsWith(SystemRoles.predicate)) return [r, "system"];
  return [r, undefined];
}

export default {
  SystemRoles,
  MembershipRoles,
  InstitutionRoles,
};
