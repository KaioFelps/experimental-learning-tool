import { Injectable } from "@nestjs/common";
import { LTILaunchTokenData } from "$/tokens/launch";
import { LMSRepository } from "../lti/lms-repository";
import type { AccessToken } from "../lti/types";

@Injectable()
export class HomeService {
  public constructor(private lmsRepository: LMSRepository) {}

  public async getMembersList(ltiData: LTILaunchTokenData, accessToken: AccessToken) {
    return await this.lmsRepository.getContextCourseMembersList(
      ltiData.lmsEndpoints.contextMembership,
      accessToken.token,
    );
  }

  public async getGrades(accessToken: AccessToken) {
    await this.lmsRepository.getContextCourseGrades(accessToken.token);
  }
}
