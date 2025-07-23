import { Injectable } from "@nestjs/common";
import { removeDeprecatedRoles } from "./roles";

@Injectable()
export class LMSRepository {
  public async getContextCourseMembersList(
    contextMembershipEndpoint: string,
    accessToken: string,
  ) {
    const response = await fetch(contextMembershipEndpoint, {
      headers: {
        authorization: `Bearer ${accessToken}`,
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

  public async getContextCourseGrades(accessToken: string) {
    const response = await fetch(
      "http://localhost/mod/lti/services.php/2/lineitems",
      {
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          accept: "application/vnd.ims.lis.v2.lineitemcontainer+json",
        },
      },
    );

    console.log(await response.json());
  }
}
