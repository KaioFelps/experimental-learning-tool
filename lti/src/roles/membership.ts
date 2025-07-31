import { IMSRole, IMSRoleUtils } from "./ims-role";

const roles = Object.freeze({
  Administrator: "Administrator",
  ContentDeveloper: "ContentDeveloper",
  Instructor: "Instructor",
  Learner: "Learner",
  Mentor: "Mentor",
  Manager: "Manager",
  Member: "Member",
  Officer: "Officer",
} as const);

export type MembershipRole = keyof typeof roles;

export abstract class MembershipRoles extends IMSRole {
  public static readonly predicate = "http://purl.imsglobal.org/vocab/lis/v2/membership#";

  public static readonly roles = roles;

  public static fromIMSRole(completeUrl: string): MembershipRole | null {
    return IMSRoleUtils.fromIMSRole(
      completeUrl,
      MembershipRoles.predicate,
      MembershipRoles.roles,
    ) as MembershipRole;
  }

  public static intoIMSRole(role: MembershipRole): string {
    return IMSRoleUtils.intoIMSRole(role, MembershipRoles.predicate);
  }
}
