export abstract class IMSRoleUtils {
  public static fromIMSRole<Role, RolesMap extends Record<string, string>>(
    imsRole: string,
    predicate: string,
    roles: RolesMap,
  ): Role | null {
    if (!imsRole.startsWith(predicate)) return null;

    const _role = imsRole.replace(predicate, "");
    const role = roles[_role] as Role | undefined;

    return role ?? null;
  }

  public static intoIMSRole(role: string, predicate: string): string {
    return `${predicate}${role}`;
  }
}

export abstract class IMSRole {
  public static fromIMSRole(_completeUrl: string): string | null {
    throw new Error("Must be implemented in subclass.");
  }

  public static intoIMSRole(_role: string): string {
    throw new Error("Must be implemented in subclass.");
  }
}
