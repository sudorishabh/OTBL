import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  userTable,
  clientTable,
  proposalTable,
  technologyTable,
  activityTypeTable,
  officeTable,
  siteTable,
  workOrderTable,
  clientContactTable,
  officeUserTable,
  workOrderSiteTable,
  siteUserTable,
  siteActivityTable,
  siteActivityItemsTable,
  zeroDayTable,
  zeroDaySampleTable,
  tphTable,
  oilZapperTable,
  cleanUpOilSpillTable,
  liftingOilSlushTable,
  excavationContSoilTable,
  trnsprtOilSlushTable,
  PROPOSAL_STATUS,
  WORK_ORDER_STATUS,
  ACTIVITY_TYPE,
  ACTIVITY_ITEM_TABLES,
  ACTIVITY_PHASE,
} from "./schema";

// ============================================================
// USER TYPES
// ============================================================
export type User = InferSelectModel<typeof userTable>;
export type NewUser = InferInsertModel<typeof userTable>;

// ============================================================
// CLIENT TYPES
// ============================================================
export type Client = InferSelectModel<typeof clientTable>;
export type NewClient = InferInsertModel<typeof clientTable>;

export type ClientContact = InferSelectModel<typeof clientContactTable>;
export type NewClientContact = InferInsertModel<typeof clientContactTable>;

// ============================================================
// PROPOSAL TYPES
// ============================================================
export type Proposal = InferSelectModel<typeof proposalTable>;
export type NewProposal = InferInsertModel<typeof proposalTable>;

// Type helpers for proposal status
export type ProposalStatus =
  (typeof PROPOSAL_STATUS)[keyof typeof PROPOSAL_STATUS];

// ============================================================
// TECHNOLOGY TYPES
// ============================================================
export type Technology = InferSelectModel<typeof technologyTable>;
export type NewTechnology = InferInsertModel<typeof technologyTable>;

export type ActivityType = InferSelectModel<typeof activityTypeTable>;
export type NewActivityType = InferInsertModel<typeof activityTypeTable>;

// ============================================================
// OFFICE TYPES
// ============================================================
export type Office = InferSelectModel<typeof officeTable>;
export type NewOffice = InferInsertModel<typeof officeTable>;

export type OfficeUser = InferSelectModel<typeof officeUserTable>;
export type NewOfficeUser = InferInsertModel<typeof officeUserTable>;

// ============================================================
// SITE TYPES
// ============================================================
export type Site = InferSelectModel<typeof siteTable>;
export type NewSite = InferInsertModel<typeof siteTable>;

// ============================================================
// WORK ORDER TYPES
// ============================================================
export type WorkOrder = InferSelectModel<typeof workOrderTable>;
export type NewWorkOrder = InferInsertModel<typeof workOrderTable>;

export type WorkOrderSite = InferSelectModel<typeof workOrderSiteTable>;
export type NewWorkOrderSite = InferInsertModel<typeof workOrderSiteTable>;

export type SiteUser = InferSelectModel<typeof siteUserTable>;
export type NewSiteUser = InferInsertModel<typeof siteUserTable>;

// Type helpers for work order status
export type WorkOrderStatus =
  (typeof WORK_ORDER_STATUS)[keyof typeof WORK_ORDER_STATUS];

// Type helpers for activity type
export type ActivityTypeEnum =
  (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

// ============================================================
// SITE ACTIVITY TYPES
// ============================================================
export type SiteActivity = InferSelectModel<typeof siteActivityTable>;
export type NewSiteActivity = InferInsertModel<typeof siteActivityTable>;

export type SiteActivityItem = InferSelectModel<typeof siteActivityItemsTable>;
export type NewSiteActivityItem = InferInsertModel<
  typeof siteActivityItemsTable
>;

// Type helpers for activity item tables
export type ActivityItemTableName =
  (typeof ACTIVITY_ITEM_TABLES)[keyof typeof ACTIVITY_ITEM_TABLES];

// Type helpers for activity phase
export type ActivityPhase =
  (typeof ACTIVITY_PHASE)[keyof typeof ACTIVITY_PHASE];

// ============================================================
// ACTIVITY ITEM TYPES
// ============================================================

// Zero Day
export type ZeroDay = InferSelectModel<typeof zeroDayTable>;
export type NewZeroDay = InferInsertModel<typeof zeroDayTable>;

// Zero Day Sample
export type ZeroDaySample = InferSelectModel<typeof zeroDaySampleTable>;
export type NewZeroDaySample = InferInsertModel<typeof zeroDaySampleTable>;

// TPH
export type Tph = InferSelectModel<typeof tphTable>;
export type NewTph = InferInsertModel<typeof tphTable>;

// Oil Zapper
export type OilZapper = InferSelectModel<typeof oilZapperTable>;
export type NewOilZapper = InferInsertModel<typeof oilZapperTable>;

// Clean Up Oil Spill
export type CleanUpOilSpill = InferSelectModel<typeof cleanUpOilSpillTable>;
export type NewCleanUpOilSpill = InferInsertModel<typeof cleanUpOilSpillTable>;

// Lifting Oil Slush
export type LiftingOilSlush = InferSelectModel<typeof liftingOilSlushTable>;
export type NewLiftingOilSlush = InferInsertModel<typeof liftingOilSlushTable>;

// Excavation Contaminated Soil
export type ExcavationContSoil = InferSelectModel<
  typeof excavationContSoilTable
>;
export type NewExcavationContSoil = InferInsertModel<
  typeof excavationContSoilTable
>;

// Transport Oil Slush
export type TrnsprtOilSlush = InferSelectModel<typeof trnsprtOilSlushTable>;
export type NewTrnsprtOilSlush = InferInsertModel<typeof trnsprtOilSlushTable>;

// ============================================================
// UNION TYPES FOR ACTIVITY ITEMS
// ============================================================

// Union type for all activity item types
export type ActivityItem =
  | ZeroDay
  | ZeroDaySample
  | Tph
  | OilZapper
  | CleanUpOilSpill
  | LiftingOilSlush
  | ExcavationContSoil
  | TrnsprtOilSlush;

// Union type for all new activity item types
export type NewActivityItem =
  | NewZeroDay
  | NewZeroDaySample
  | NewTph
  | NewOilZapper
  | NewCleanUpOilSpill
  | NewLiftingOilSlush
  | NewExcavationContSoil
  | NewTrnsprtOilSlush;
