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
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
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

export const ActivityTable = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const BudgetCategoryTable = mysqlTable("budget_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const SiteTable = mysqlTable("sites", {
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
  }).default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const OfficeTable = mysqlTable("offices", {
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
  }).default("active"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const WorkOrderTable = mysqlTable("work_orders", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  office_id: int("office_id")
    .notNull()
    .references(() => OfficeTable.id, { onDelete: "cascade" }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  handing_over_date: timestamp("handing_over_date").notNull(),
  agreement_number: varchar("agreement_number", { length: 255 }).notNull(),
  agreement_url: text("agreement_url"),
  metric_ton: decimal("metric_ton", {
    precision: 50,
    scale: 2,
  }),
  metric_ton_rate: decimal("metric_ton_rate", {
    precision: 50,
    scale: 2,
  }),
  description: text("description"),
  budget_amount: decimal("budget_amount", {
    precision: 50,
    scale: 2,
  }),
  expense_amount: decimal("expense_amount", {
    precision: 10,
    scale: 2,
  }),
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

/* DEPENDENT TABLES */

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

export const UserOfficesTable = mysqlTable("user_offices", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  office_id: int("office_id")
    .notNull()
    .references(() => OfficeTable.id, { onDelete: "cascade" }),
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

export const WorkOrderSiteTable = mysqlTable("work_order_sites", {
  id: int("id").autoincrement().primaryKey(),
  work_order_id: int("work_order_id")
    .notNull()
    .references(() => WorkOrderTable.id, { onDelete: "cascade" }),
  site_id: int("site_id")
    .notNull()
    .references(() => SiteTable.id, { onDelete: "cascade" }),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  handing_over_date: timestamp("handing_over_date").notNull(),
  budget_amount: decimal("budget_amount", {
    precision: 50,
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

export const SiteBudgetTable = mysqlTable("site_budgets", {
  id: int("id").autoincrement().primaryKey(),
  wo_site_id: int("wo_site_id")
    .notNull()
    .references(() => WorkOrderSiteTable.id, { onDelete: "cascade" }),
  budget_category_id: int("budget_category_id")
    .notNull()
    .references(() => BudgetCategoryTable.id, { onDelete: "cascade" }),
  budget_amount: decimal("budget_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  expense_amount: decimal("expense_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const SiteActivityTable = mysqlTable("site_activities", {
  id: int("id").autoincrement().primaryKey(),
  wo_site_id: int("wo_site_id")
    .notNull()
    .references(() => WorkOrderSiteTable.id, { onDelete: "cascade" }),
  activity_id: int("activity_id")
    .notNull()
    .references(() => ActivityTable.id, { onDelete: "cascade" }),
  status: varchar("status", {
    length: 50,
    enum: ["pending", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const SiteActivityExpenseTable = mysqlTable("site_activity_expenses", {
  id: int("id").autoincrement().primaryKey(),
  site_activity_id: int("site_activity_id")
    .notNull()
    .references(() => SiteActivityTable.id, { onDelete: "cascade" }),
  site_budget_id: int("site_budget_id")
    .notNull()
    .references(() => SiteBudgetTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  expense_amount: decimal("expense_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  description: text("description").notNull(),
  expense_date: timestamp("expense_date").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  receipt_number: varchar("receipt_number", { length: 100 }),
});
