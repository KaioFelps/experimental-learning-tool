// Veja: https://www.imsglobal.org/spec/lti/v1p3/#role-vocabularies

const SystemRoles = Object.freeze({
  // Core Sys
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator":
    "Administrator",
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#None": "None",

  // Non-core Sys
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#AccountAdmin":
    "AccountAdmin",
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#Creator": "Creator",
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin": "SysAdmin",
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#SysSupport":
    "SysSupport",
  "http://purl.imsglobal.org/vocab/lis/v2/system/person#User": "User",
});

const InstitutionRoles = Object.freeze({
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator":
    "Administrator",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty":
    "Faculty",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest": "Guest",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#None": "None",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Other": "Other",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Staff": "Staff",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student":
    "Student",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Alumni": "Alumni",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor":
    "Instructor",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Learner":
    "Learner",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Member": "Member",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Mentor": "Mentor",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Observer":
    "Observer",
  "http://purl.imsglobal.org/vocab/lis/v2/institution/person#ProspectiveStudent":
    "ProspectiveStudent",
});

const MembershipRoles = Object.freeze({
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator":
    "Administrator",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper":
    "ContentDeveloper",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor": "Instructor",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner": "Learner",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor": "Mentor",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Manager": "Manager",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Member": "Member",
  "http://purl.imsglobal.org/vocab/lis/v2/membership#Officer": "Officer",
});

type RoleKind = "membership" | "system" | "institution" | undefined;
type RoleKindWithoutUndefined = Exclude<RoleKind, undefined>;

type Roles = Record<RoleKindWithoutUndefined, string[]>;

const rolesPerKind: Record<
  RoleKindWithoutUndefined,
  Record<string, string>
> = Object.freeze({
  institution: InstitutionRoles,
  membership: MembershipRoles,
  system: SystemRoles,
});

export function getRolesFromClaims(roleUrls: string[]): Roles {
  return roleUrls.map(getCategoryFromUrl).reduce(
    (roles, [url, kind]) => {
      if (kind) roles[kind].push(rolesPerKind[kind][url]);
      return roles;
    },
    { institution: [], membership: [], system: [] } as Roles,
  );
}

function getCategoryFromUrl(roleUrl: string): [string, RoleKind] {
  if (roleUrl.includes("/membership")) return [roleUrl, "membership"];
  if (roleUrl.includes("/institution")) return [roleUrl, "institution"];
  if (roleUrl.includes("/system")) return [roleUrl, "system"];
  return [roleUrl, undefined];
}

export default {
  SystemRoles,
  InstitutionRoles,
  MembershipRoles,
  getRolesFromClaims,
};
