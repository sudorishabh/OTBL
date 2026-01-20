import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  decimal,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { constants } from "@pkg/utils";
const { ROLES, STATUS } = constants;

// Centralized enum constants for consistency
export const PROPOSAL_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const WORK_ORDER_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const ACTIVITY_TYPE = {
  INSITU: "insitu",
  EXSITU: "exsitu",
} as const;

// Activity item table names for site_activity_items tracking
export const ACTIVITY_ITEM_TABLES = {
  ZERO_DAY: "zero_days",
  ZERO_DAY_SAMPLE: "zero_day_samples",
  TPH: "tph",
  OIL_ZAPPER: "oil_zappers",
  CLEAN_UP_OIL_SPILL: "clean_up_oil_spill",
  LIFTING_OIL_SLUSH: "lifting_oil_slush",
  EXCAVATION_CONT_SOIL: "excavation_cont_soil",
  TRNSPRT_OIL_SLUSH: "trnsprt_oil_slush",
} as const;

export const ACTIVITY_PHASE = {
  WORK_ESTIMATE: "work_estimate",
  ORDER: "order",
  EXPENSE: "expense",
} as const;

// User table
export const userTable = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    contact_number: varchar("contact_number", { length: 15 }),
    role: varchar("role", {
      length: 50,
      enum: [
        ROLES.ADMIN,
        ROLES.MANAGER,
        ROLES.STAFF,
        ROLES.VIEWER,
        ROLES.OPERATOR,
      ],
    })
      .notNull()
      .default(ROLES.STAFF),
    created_by: int("created_by"),
    status: varchar("status", {
      length: 50,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    })
      .notNull()
      .default(STATUS.ACTIVE),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("name_idx").on(table.name),
    uniqueIndex("email_idx").on(table.email),
  ],
);

// Client table
export const clientTable = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  gst_number: varchar("gst_number", { length: 15 }).notNull(),
  contact_number: varchar("contact_number", {
    length: 15,
  }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: varchar("status", {
    length: 50,
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
  })
    .notNull()
    .default(STATUS.ACTIVE),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const proposalTable = mysqlTable(
  "proposals",
  {
    id: int("id").autoincrement().primaryKey(),
    client_id: int("client_id")
      .notNull()
      .references(() => clientTable.id, { onDelete: "cascade" }),
    office_id: int("office_id")
      .notNull()
      .references(() => officeTable.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    document_key: varchar("document_key", { length: 255 }).notNull(),
    description: text("description"),
    proposal_amount: decimal("proposal_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    proposal_submission_date: timestamp("proposal_submission_date").notNull(),

    status: varchar("status", {
      length: 50,
      enum: [PROPOSAL_STATUS.APPROVED, PROPOSAL_STATUS.REJECTED],
    })
      .notNull()
      .default(PROPOSAL_STATUS.REJECTED),
    created_by: int("created_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("proposal_client_idx").on(table.client_id),
    index("proposal_status_idx").on(table.status),
  ],
);

// export const technologyTable = mysqlTable("technologies", {
//   id: int("id").autoincrement().primaryKey(),
//   name: varchar("name", { length: 255 }).notNull(),
//   description: text("description"),
//   status: varchar("status", {
//     length: 50,
//     enum: [STATUS.ACTIVE, STATUS.INACTIVE],
//   })
//     .notNull()
//     .default(STATUS.ACTIVE),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// export const activityTypeTable = mysqlTable("activity_types", {
//   id: int("id").autoincrement().primaryKey(),
//   technology_id: int("technology_id")
//     .notNull()
//     .references(() => technologyTable.id, { onDelete: "cascade" }),
//   name: varchar("name", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

export const officeTable = mysqlTable(
  "offices",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    state: varchar("state", { length: 255 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    gst_number: varchar("gst_number", { length: 15 }).notNull(),
    pincode: varchar("pincode", { length: 10 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    status: varchar("status", {
      length: 50,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    })
      .notNull()
      .default(STATUS.ACTIVE),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("name_idx").on(table.name),
    index("city_idx").on(table.city),
    index("state_idx").on(table.state),
  ],
);

export const siteTable = mysqlTable(
  "sites",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    state: varchar("state", { length: 255 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    pincode: varchar("pincode", { length: 10 }).notNull(),
    office_id: int("office_id")
      .notNull()
      .references(() => officeTable.id, { onDelete: "cascade" })
      .notNull(),
    status: varchar("status", {
      length: 50,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    })
      .notNull()
      .default(STATUS.ACTIVE),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("site_name_idx").on(table.name),
    index("site_city_idx").on(table.city),
    index("site_state_idx").on(table.state),
    index("site_office_idx").on(table.office_id),
  ],
);

export const workOrderTable = mysqlTable(
  "work_orders",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 255 }).notNull().unique(),
    agreement_number: varchar("agreement_number", { length: 255 }).notNull(),
    rate_contract_number: varchar("rate_contract_number", {
      length: 255,
    }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    proposal_id: int("proposal_id")
      .notNull()
      .references(() => proposalTable.id, { onDelete: "cascade" }),
    client_id: int("client_id")
      .notNull()
      .references(() => clientTable.id, { onDelete: "cascade" }),
    office_id: int("office_id")
      .notNull()
      .references(() => officeTable.id, { onDelete: "cascade" }),
    start_date: timestamp("start_date").notNull(),
    end_date: timestamp("end_date").notNull(),
    handing_over_date: timestamp("handing_over_date").notNull(),
    agreement_url: text("agreement_url"),
    document_key: varchar("document_key", { length: 255 }).notNull(),
    metric_ton: decimal("metric_ton", {
      precision: 10,
      scale: 2,
    }),
    metric_ton_rate: decimal("metric_ton_rate", {
      precision: 10,
      scale: 2,
    }),
    process_type: varchar("process_type", {
      length: 50,
    }).notNull(),
    description: text("description"),
    grand_total_amount: decimal("grand_total_amount", {
      precision: 10,
      scale: 2,
    }),
    expense_amount: decimal("expense_amount", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    status: varchar("status", {
      length: 50,
      enum: [
        WORK_ORDER_STATUS.PENDING,
        WORK_ORDER_STATUS.COMPLETED,
        WORK_ORDER_STATUS.CANCELLED,
      ],
    })
      .notNull()
      .default(WORK_ORDER_STATUS.PENDING),
    cancellation_reason: text("cancellation_reason"),
    created_by: int("created_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("wo_client_idx").on(table.client_id),
    index("wo_office_idx").on(table.office_id),
    index("wo_status_idx").on(table.status),
    index("wo_dates_idx").on(table.start_date, table.end_date),
  ],
);

export const scheduleOfRatesTable = mysqlTable("schedule_of_rates", {
  id: int("id").autoincrement().primaryKey(),
  work_order_id: int("work_order_id")
    .notNull()
    .references(() => workOrderTable.id, { onDelete: "cascade" }),
  activity: varchar("activity", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 10 }).notNull(),
  estimated_quantity: decimal("estimated_quantity", {
    precision: 10,
    scale: 2,
  }).notNull(),
  rc_unit_rate: decimal("rc_unit_rate", {
    precision: 10,
    scale: 2,
  }).notNull(),
  gst_percentage: decimal("gst_percentage", {
    precision: 10,
    scale: 2,
  })
    .default("18")
    .notNull(),
  unit_rate_inclusive_gst: decimal("unit_rate_inclusive_gst", {
    precision: 10,
    scale: 2,
  }).notNull(),
  total_cost: decimal("total_cost", {
    precision: 10,
    scale: 2,
  }).notNull(),
  transportation_km: decimal("transportation_km", {
    precision: 10,
    scale: 2,
  }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),

  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const clientContactTable = mysqlTable("client_contacts", {
  id: int("id").autoincrement().primaryKey(),
  client_id: int("client_id")
    .notNull()
    .references(() => clientTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 255 }),
  contact_number: varchar("contact_number", {
    length: 15,
  }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  contact_type: varchar("contact_type", { length: 255 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const officeUserTable = mysqlTable(
  "office_users",
  {
    id: int("id").autoincrement().primaryKey(),
    user_id: int("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    office_id: int("office_id")
      .notNull()
      .references(() => officeTable.id, { onDelete: "cascade" }),
    assigned_by: int("assigned_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    role: varchar("role", {
      length: 50,
      enum: ["manager", "operator"],
    }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    // Unique constraint: a user can only be assigned once per office
    uniqueIndex("office_user_unique_idx").on(table.office_id, table.user_id),
    index("office_user_office_idx").on(table.office_id),
    index("office_user_user_idx").on(table.user_id),
  ],
);

export const workOrderSiteTable = mysqlTable(
  "work_order_sites",
  {
    id: int("id").autoincrement().primaryKey(),
    work_order_id: int("work_order_id")
      .notNull()
      .references(() => workOrderTable.id, { onDelete: "cascade" }),
    client_id: int("client_id")
      .notNull()
      .references(() => clientTable.id, { onDelete: "cascade" }),
    site_id: int("site_id")
      .notNull()
      .references(() => siteTable.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    end_date: timestamp("end_date").notNull(),
    process_type: varchar("process_type", {
      length: 50,
      enum: [ACTIVITY_TYPE.INSITU, ACTIVITY_TYPE.EXSITU],
    }),
    // metric_ton: decimal("metric_ton", {
    //   precision: 10,
    //   scale: 2,
    // }),
    // metric_ton_rate: decimal("metric_ton_rate", {
    //   precision: 10,
    //   scale: 2,
    // }),
    // budget_amount: decimal("budget_amount", {
    //   precision: 10,
    //   scale: 2,
    // }),
    // total_expense_amount: decimal("total_expense_amount", {
    //   precision: 10,
    //   scale: 2,
    // }),
    job_number: varchar("job_number", { length: 255 }).notNull(),
    area: varchar("area", { length: 255 }).notNull(),
    installation_type: varchar("installation", { length: 255 }).notNull(),
    joint_estimate_number: varchar("joint_estimate_number", {
      length: 255,
    }).notNull(),
    land_owner_name: varchar("land_owner_name", { length: 255 }).notNull(),
    remarks: varchar("remarks", { length: 255 }).notNull(),
    status: varchar("status", {
      length: 50,
      enum: [
        WORK_ORDER_STATUS.PENDING,
        WORK_ORDER_STATUS.COMPLETED,
        WORK_ORDER_STATUS.CANCELLED,
      ],
    })
      .notNull()
      .default(WORK_ORDER_STATUS.PENDING),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    // Composite index for work order and site lookups
    uniqueIndex("wo_site_unique_idx").on(table.work_order_id, table.site_id),
    index("wo_site_work_order_idx").on(table.work_order_id),
    index("wo_site_site_idx").on(table.site_id),
    index("wo_site_status_idx").on(table.status),
  ],
);

export const siteUserTable = mysqlTable("site_users", {
  id: int("id").autoincrement().primaryKey(),
  office_id: int("office_id")
    .notNull()
    .references(() => officeTable.id, { onDelete: "cascade" }),
  site_id: int("site_id")
    .notNull()
    .references(() => siteTable.id, { onDelete: "cascade" }),
  user_id: int("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// Activity Tables

// sites -> activities ->

// export const siteActivityTable = mysqlTable("site_activities", {
//   id: int("id").autoincrement().primaryKey(),
//   client_id: int("client_id")
//     .notNull()
//     .references(() => clientTable.id, { onDelete: "cascade" }),
//   work_order_id: int("work_order_id")
//     .notNull()
//     .references(() => workOrderTable.id, { onDelete: "cascade" }),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   job_number: varchar("job_number", { length: 255 }).notNull(),
//   area: varchar("area", { length: 255 }).notNull(),
//   installation: varchar("installation", { length: 255 }).notNull(),
//   joint_estimate_number: varchar("joint_estimate_number", {
//     length: 255,
//   }).notNull(),
//   land_owner_name: varchar("land_owner_name", { length: 255 }).notNull(),
//   start_date: timestamp("start_date").notNull(),
//   end_date: timestamp("end_date").notNull(),
//   remark: text("remark"),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

export const siteActivityTable = mysqlTable("site_activity_items", {
  id: int("id").autoincrement().primaryKey(),
  work_order_site_id: int("work_order_site_id")
    .notNull()
    .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
  activity: varchar("activity", { length: 255 }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// // Zero Day Activity - One time activity
// export const zeroDayTable = mysqlTable("zero_days", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   // Measurement fields
//   length_metric: decimal("length_metric", { precision: 10, scale: 2 }),
//   width_metric: decimal("width_metric", { precision: 10, scale: 2 }),
//   depth_metric: decimal("depth_metric", { precision: 10, scale: 2 }),
//   volume_informed: decimal("volume_informed", { precision: 10, scale: 2 }),
//   // Document
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// // Zero Day Sample - One time activity
// export const zeroDaySampleTable = mysqlTable("zero_day_samples", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   status: varchar("status", {
//     length: 50,
//     enum: ["pending", "completed", "cancelled"],
//   })
//     .notNull()
//     .default("pending"),
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   // Measurement fields
//   length: decimal("length", { precision: 10, scale: 2 }),
//   width: decimal("width", { precision: 10, scale: 2 }),
//   height: decimal("height", { precision: 10, scale: 2 }),
//   // A1 = L × W × H
//   volume_a1: decimal("volume_a1", { precision: 10, scale: 2 }),
//   // A2 = Density
//   density_a2: decimal("density_a2", { precision: 10, scale: 2 }),
//   // A = A1 × A2
//   result_a: decimal("result_a", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// // TPH Activity - Can be added multiple times
// export const tphTable = mysqlTable("tph", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   sample_collection_date: timestamp("sample_collection_date").notNull(),
//   sample_send_date: timestamp("sample_send_date").notNull(),
//   sample_report_received: varchar("sample_report_received", {
//     length: 50,
//     enum: ["yes", "no"],
//   }).default("no"),
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   tph_value: decimal("tph_value", { precision: 10, scale: 2 }),
//   lab_info: text("lab_info"),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// // Oil Zapper Activity - Can be added multiple times
// export const oilZapperTable = mysqlTable("oil_zappers", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   // Sent information
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   length: decimal("length", { precision: 10, scale: 2 }),
//   width: decimal("width", { precision: 10, scale: 2 }),
//   depth: decimal("depth", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// export const cleanUpOilSpillTable = mysqlTable("clean_up_oil_spill", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   // Sent information
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   // Area dimension fields
//   length: decimal("length", { precision: 10, scale: 2 }),
//   width: decimal("width", { precision: 10, scale: 2 }),
//   depth: decimal("depth", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// export const liftingOilSlushTable = mysqlTable("lifting_oil_slush", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   // Sent information
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   // Area dimension fields
//   length: decimal("length", { precision: 10, scale: 2 }),
//   width: decimal("width", { precision: 10, scale: 2 }),
//   depth: decimal("depth", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// export const excavationContSoilTable = mysqlTable("excavation_cont_soil", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   // Sent information
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   // Area dimension fields
//   length: decimal("length", { precision: 10, scale: 2 }),
//   width: decimal("width", { precision: 10, scale: 2 }),
//   depth: decimal("depth", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });

// export const trnsprtOilSlushTable = mysqlTable("trnsprt_oil_slush", {
//   id: int("id").autoincrement().primaryKey(),
//   site_activity_id: int("site_activity_id").references(
//     () => siteActivityTable.id,
//     { onDelete: "cascade" },
//   ),
//   work_order_site_id: int("work_order_site_id")
//     .notNull()
//     .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
//   activity_description: text("activity_description"),
//   // Sent information
//   type: varchar("type", {
//     enum: ["work_estimate", "order", "expense"],
//     length: 255,
//   }).notNull(),
//   amount: decimal("amount", { precision: 10, scale: 2 }),
//   // Area dimension fields
//   length: decimal("length", { precision: 10, scale: 2 }),
//   width: decimal("width", { precision: 10, scale: 2 }),
//   depth: decimal("depth", { precision: 10, scale: 2 }),
//   document_key: varchar("document_key", { length: 255 }).notNull(),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
// });
