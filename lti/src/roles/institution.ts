import { IMSRole, IMSRoleUtils } from "./ims-role";

const roles = Object.freeze({
  Administrator: "Administrator",
  Faculty: "Faculty",
  Guest: "Guest",
  None: "None",
  Other: "Other",
  Staff: "Staff",
  Student: "Student",
  Alumni: "Alumni",
  Instructor: "Instructor",
  Learner: "Learner",
  Member: "Member",
  Mentor: "Mentor",
  Observer: "Observer",
  ProspectiveStudent: "ProspectiveStudent",
} as const);

export type InstitutionRole = keyof typeof roles;

export abstract class InstitutionRoles extends IMSRole {
  public static readonly predicate =
    "http://purl.imsglobal.org/vocab/lis/v2/institution/person#";

  public static readonly roles = roles;

  public static fromIMSRole(completeUrl: string): InstitutionRole | null {
    return IMSRoleUtils.fromIMSRole(
      completeUrl,
      InstitutionRoles.predicate,
      InstitutionRoles.roles,
    ) as InstitutionRole;
  }

  public static intoIMSRole(role: InstitutionRole): string {
    return IMSRoleUtils.intoIMSRole(role, InstitutionRoles.predicate);
  }
}
