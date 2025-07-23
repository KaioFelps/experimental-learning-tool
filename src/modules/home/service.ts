import { Injectable } from "@nestjs/common";
import type { LtiTokenData } from "../lti/lti-token";
import { removeDeprecatedRoles } from "../lti/roles";
import type { AccessToken } from "../lti/types";

@Injectable()
export class HomeService {
  public async getMembersList(ltiData: LtiTokenData, accessToken: AccessToken) {
    const response = await fetch(ltiData.lmsEndpoints.contextMembership, {
      headers: {
        authorization: `Bearer ${accessToken.token}`,
      },
    });

    const jsonResponse = await response.json();

    // biome-ignore lint/suspicious/noExplicitAny: Not gonna type the response atp
    const rawUsers = jsonResponse.members as any[];

    return rawUsers
      .filter((member) => member.status === "Active")
      .map((member) => ({
        name: member.name as string,
        id: member.user_id as string,
        roles: removeDeprecatedRoles(member.roles as string[]),
        email: member.email as string,
        username: member.ext_user_username as string,
      }));
  }
}
