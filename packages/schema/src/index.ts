// Auth
import * as authSchemas from "./auth/auth.schema";
import * as authTypes from "./auth/auth.type";

// Client
import * as clientSchemas from "./client/client.schema";
import * as clientTypes from "./client/client.type";

// Office
import * as officeSchemas from "./office/office.schema";
import * as officeTypes from "./office/office.type";

// Proposal
import * as proposalSchemas from "./proposal/proposal.schema";
import * as proposalTypes from "./proposal/proposal.type";

// SharePoint
import * as sharepointSchemas from "./sharepoint/sharepoint.schema";

// Site
import * as siteSchemas from "./site/site.schema";
import * as siteTypes from "./site/site.type";

// User
import * as userSchemas from "./user/user.schema";
import * as userTypes from "./user/user.type";

// Work Order
import * as workOrderSchemas from "./work-order/work-order.schema";
import * as workOrderTypes from "./work-order/work-order.type";

// Site Activity
import * as siteActivitySchemas from "./site-activity/site-activity.schema";
import * as siteActivityTypes from "./site-activity/site-activity.type";

// Validators
import * as validators from "./validators";

// Categorized exports
export {
  authSchemas,
  authTypes,
  clientSchemas,
  clientTypes,
  officeSchemas,
  officeTypes,
  proposalSchemas,
  proposalTypes,
  sharepointSchemas,
  siteSchemas,
  siteTypes,
  userSchemas,
  userTypes,
  workOrderSchemas,
  workOrderTypes,
  siteActivitySchemas,
  siteActivityTypes,
  validators,
};

// Also export everything flat for convenience
// export * from "./auth/auth.schema";
// export * from "./auth/auth.type";
// export * from "./client/client.schema";
// // export * from "./client/client.type";
// export * from "./office/office.schema";
// export * from "./office/office.type";
// export * from "./proposal/proposal.schema";
// export * from "./proposal/proposal.type";
// export * from "./sharepoint/sharepoint.schema";
// export * from "./site/site.schema";
// export * from "./site/site.type";
// export * from "./user/user.schema";
// export * from "./user/user.type";
// export * from "./work-order/work-order.schema";
// export * from "./validators";
