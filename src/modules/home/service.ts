import { Injectable } from "@nestjs/common";
import { LMSRepository } from "../lti/lms-repository";
import type { LtiTokenData } from "../lti/lti-token";
import type { AccessToken } from "../lti/types";

@Injectable()
export class HomeService {
  public constructor(private lmsRepository: LMSRepository) {}

  public async getMembersList(ltiData: LtiTokenData, accessToken: AccessToken) {
    return await this.lmsRepository.getContextCourseMembersList(
      ltiData.lmsEndpoints.contextMembership,
      accessToken.token,
    );
  }

  public async getGrades(accessToken: AccessToken) {
    await this.lmsRepository.getContextCourseGrades(accessToken.token);
  }
}
