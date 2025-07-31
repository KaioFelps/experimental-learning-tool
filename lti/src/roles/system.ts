import { IMSRole, IMSRoleUtils } from "./ims-role";

const roles = Object.freeze({
  Administrator: "Administrator",
  None: "None",
  AccountAdmin: "AccountAdmin",
  Creator: "Creator",
  SysAdmin: "SysAdmin",
  SysSupport: "SysSupport",
  User: "User",
} as const);

export type SystemRole = keyof typeof roles;

export abstract class SystemRoles extends IMSRole {
  public static readonly predicate = "http://purl.imsglobal.org/vocab/lis/v2/system/person#";

  public static readonly roles = roles;

  public static fromIMSRole(imsRole: string): SystemRole | null {
    return IMSRoleUtils.fromIMSRole(
      imsRole,
      SystemRoles.predicate,
      SystemRoles.roles,
    ) as SystemRole;
  }

  public static intoIMSRole(role: SystemRole): string {
    return IMSRoleUtils.intoIMSRole(role, SystemRoles.predicate);
  }
}
