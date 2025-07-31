export const Scopes = Object.freeze({
  lineitemReadonly: "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly",
  resultReadonly: "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
  score: "https://purl.imsglobal.org/spec/lti-ags/scope/score",
  contextMembershipReadonly:
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly",
});

export type Scope = (typeof Scopes)[keyof typeof Scopes];
