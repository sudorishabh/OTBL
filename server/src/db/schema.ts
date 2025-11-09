import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  decimal,
  text,
} from "drizzle-orm/mysql-core";

/* MASTER TABLES */

export const userTable = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  contact_number: varchar("contact_number", { length: 15 }),
  role: varchar("role", {
    length: 50,
    enum: ["admin", "manager", "staff", "viewer", "operator"],
  })
    .notNull()
    .default("staff"),
  created_by: int("created_by"),
  status: varchar("status", {
    length: 50,
    enum: ["active", "inactive"],
  })
    .notNull()
    .default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const siteTable = mysqlTable("sites", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  contact_person: varchar("contact_person", {
    length: 255,
  }).notNull(),
  contact_number: varchar("contact_number", {
    length: 15,
  }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: varchar("status", {
    length: 50,
    enum: ["active", "inactive"],
  })
    .notNull()
    .default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

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
    enum: ["active", "inactive"],
  })
    .notNull()
    .default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const officeTable = mysqlTable("offices", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  gst_number: varchar("gst_number", { length: 15 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  contact_person: varchar("contact_person", {
    length: 255,
  }).notNull(),
  contact_number: varchar("contact_number", {
    length: 15,
  }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: varchar("status", {
    length: 50,
    enum: ["active", "inactive"],
  })
    .notNull()
    .default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

/* DEPENDENT TABLES */

export const workOrderTable = mysqlTable("work_orders", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  client_id: int("client_id")
    .notNull()
    .references(() => clientTable.id, { onDelete: "cascade" }),
  office_id: int("office_id")
    .notNull()
    .references(() => officeTable.id, { onDelete: "cascade" }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  handing_over_date: timestamp("handing_over_date").notNull(),
  agreement_number: varchar("agreement_number", { length: 255 }).notNull(),
  agreement_url: text("agreement_url"),
  metric_ton: decimal("metric_ton", {
    precision: 10,
    scale: 2,
  }),
  metric_ton_rate: decimal("metric_ton_rate", {
    precision: 10,
    scale: 2,
  }),
  description: text("description"),
  budget_amount: decimal("budget_amount", {
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
    enum: ["pending", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  cancellation_reason: text("cancellation_reason"),
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

export const officeUserTable = mysqlTable("office_users", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  office_id: int("office_id")
    .notNull()
    .references(() => officeTable.id, { onDelete: "cascade" }),
  // who assigned this user to the office (should be an admin)
  assigned_by: int("assigned_by").references(() => userTable.id, {
    onDelete: "set null",
  }),
  // role of the user for this office (manager/operator)
  role: varchar("role", {
    length: 50,
    enum: ["manager", "operator"],
  }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const workOrderSiteTable = mysqlTable("work_order_sites", {
  id: int("id").autoincrement().primaryKey(),
  work_order_id: int("work_order_id")
    .notNull()
    .references(() => workOrderTable.id, { onDelete: "cascade" }),
  site_id: int("site_id")
    .notNull()
    .references(() => siteTable.id, { onDelete: "cascade" }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  activity_type: varchar("activity_type", {
    length: 50,
    enum: ["insitu", "exsitu"],
  }),
  metric_ton: decimal("metric_ton", {
    precision: 10,
    scale: 2,
  }),
  metric_ton_rate: decimal("metric_ton_rate", {
    precision: 10,
    scale: 2,
  }),
  budget_amount: decimal("budget_amount", {
    precision: 10,
    scale: 2,
  }),
  total_expense_amount: decimal("total_expense_amount", {
    precision: 10,
    scale: 2,
  }),
  status: varchar("status", {
    length: 50,
    enum: ["pending", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// Activity Tables

// Zero Day Activity - One time activity
export const zeroDayActivityTable = mysqlTable("zero_day_activities", {
  id: int("id").autoincrement().primaryKey(),
  work_order_site_id: int("work_order_site_id")
    .notNull()
    .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
  activity_description: text("activity_description"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  // Measurement fields
  length_metric: decimal("length_metric", { precision: 10, scale: 2 }),
  width_metric: decimal("width_metric", { precision: 10, scale: 2 }),
  depth_metric: decimal("depth_metric", { precision: 10, scale: 2 }),
  volume_informed: decimal("volume_informed", { precision: 10, scale: 2 }),
  // Document
  document_url: text("document_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// Zero Day Sample - One time activity
export const zeroDaySampleTable = mysqlTable("zero_day_samples", {
  id: int("id").autoincrement().primaryKey(),
  work_order_site_id: int("work_order_site_id")
    .notNull()
    .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
  activity_description: text("activity_description"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  status: varchar("status", {
    length: 50,
    enum: ["pending", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  // Measurement fields
  length: decimal("length", { precision: 10, scale: 2 }),
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  // A1 = L × W × H
  volume_a1: decimal("volume_a1", { precision: 10, scale: 2 }),
  // A2 = Density
  density_a2: decimal("density_a2", { precision: 10, scale: 2 }),
  // A = A1 × A2
  result_a: decimal("result_a", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// TPH Activity - Can be added multiple times
export const tphActivityTable = mysqlTable("tph_activities", {
  id: int("id").autoincrement().primaryKey(),
  work_order_site_id: int("work_order_site_id")
    .notNull()
    .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
  activity_description: text("activity_description"),
  sample_collection_date: timestamp("sample_collection_date").notNull(),
  sample_send_date: timestamp("sample_send_date").notNull(),
  sample_report_received: varchar("sample_report_received", {
    length: 50,
    enum: ["yes", "no"],
  }).default("no"),
  report_document_url: text("report_document_url"),
  tph_value: decimal("tph_value", { precision: 10, scale: 2 }),
  lab_info: text("lab_info"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// Oil Zapper Activity - Can be added multiple times
export const oilZapperActivityTable = mysqlTable("oil_zapper_activities", {
  id: int("id").autoincrement().primaryKey(),
  work_order_site_id: int("work_order_site_id")
    .notNull()
    .references(() => workOrderSiteTable.id, { onDelete: "cascade" }),
  activity_description: text("activity_description"),
  // Sent information
  sent_kg: decimal("sent_kg", { precision: 10, scale: 2 }),
  sent_date: timestamp("sent_date"),
  bill_document_url: text("bill_document_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// Oil Zapper Indents - Multiple indents per activity
export const oilZapperIndentTable = mysqlTable("oil_zapper_indents", {
  id: int("id").autoincrement().primaryKey(),
  oil_zapper_activity_id: int("oil_zapper_activity_id")
    .notNull()
    .references(() => oilZapperActivityTable.id, { onDelete: "cascade" }),
  description: text("description"),
  date: timestamp("date").notNull(),
  kg: decimal("kg", { precision: 10, scale: 2 }),
  proposed_amount: decimal("proposed_amount", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
