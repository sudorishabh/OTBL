import {
  mysqlTable,
  timestamp,
  varchar,
  int,
  decimal,
  text,
} from "drizzle-orm/mysql-core";

// export const userTable = mysqlTable("users", {
//   user_id: int("user_id").autoincrement().primaryKey(),
//   full_name: varchar("full_name", { length: 255 }).notNull(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   password: varchar("password", { length: 255 }).notNull(),
//   role: varchar("role", { length: 255 }).notNull().default("user"),
//   created_at: timestamp("created_at").notNull().defaultNow(),
//   updated_at: timestamp("updated_at").notNull().defaultNow(),
// });

export const officeTable = mysqlTable("offices", {
  office_id: int("office_id").autoincrement().primaryKey(),
  office_name: varchar("office_name", { length: 255 }).notNull(),
  office_address: varchar("office_address", { length: 255 }).notNull(),
  office_state: varchar("office_state", { length: 255 }).notNull(),
  office_city: varchar("office_city", { length: 255 }).notNull(),
  office_pincode: varchar("office_pincode", { length: 10 }).notNull(),
  office_contact_person: varchar("office_contact_person", {
    length: 255,
  }).notNull(),
  office_contact_number: varchar("office_contact_number", {
    length: 15,
  }).notNull(),
  office_email: varchar("office_email", { length: 320 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const workOrderTable = mysqlTable("work_orders", {
  work_order_id: int("work_order_id").autoincrement().primaryKey(),
  work_order_number: varchar("work_order_number", { length: 255 })
    .notNull()
    .unique(),
  work_order_date: timestamp("work_order_date").notNull(),
  work_order_status: varchar("work_order_status", { length: 50 })
    .notNull()
    .default("pending"),
  work_order_description: text("work_order_description").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const activityTable = mysqlTable("activities", {
  activity_id: int("activity_id").autoincrement().primaryKey(),
  activity_name: varchar("activity_name", { length: 255 }).notNull().unique(),
  activity_description: text("activity_description").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const workOrderActivityBudgetTable = mysqlTable(
  "work_order_activity_budgets",
  {
    work_order_budget_id: int("work_order_budget_id")
      .autoincrement()
      .primaryKey(),
    work_order_id: int("work_order_id")
      .notNull()
      .references(() => workOrderTable.work_order_id, { onDelete: "cascade" }),
    activity_id: int("activity_id")
      .notNull()
      .references(() => activityTable.activity_id, { onDelete: "cascade" }),
    work_order_budget_amount: decimal("work_order_budget_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    work_order_expense_amount: decimal("work_order_expense_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    work_order_budget_description: text(
      "work_order_budget_description"
    ).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  }
);

export const siteTable = mysqlTable("sites", {
  site_id: int("site_id").autoincrement().primaryKey(),
  site_name: varchar("site_name", { length: 255 }).notNull(),
  site_address: varchar("site_address", { length: 255 }).notNull(),
  site_state: varchar("site_state", { length: 255 }).notNull(),
  site_city: varchar("site_city", { length: 255 }).notNull(),
  site_pincode: varchar("site_pincode", { length: 10 }).notNull(),
  site_contact_person: varchar("site_contact_person", {
    length: 255,
  }).notNull(),
  site_contact_number: varchar("site_contact_number", {
    length: 15,
  }).notNull(),
  site_email: varchar("site_email", { length: 320 }).notNull().unique(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const siteActivityTable = mysqlTable("site_activities", {
  site_activity_id: int("site_activity_id").autoincrement().primaryKey(),
  site_id: int("site_id")
    .notNull()
    .references(() => siteTable.site_id, { onDelete: "cascade" }),
  activity_id: int("activity_id")
    .notNull()
    .references(() => activityTable.activity_id, { onDelete: "cascade" }),
  site_activity_status: varchar("site_activity_status", {
    length: 50,
  })
    .notNull()
    .default("pending"),
  site_activity_date: timestamp("site_activity_date").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const workOrderSiteTable = mysqlTable("work_order_sites", {
  work_order_site_id: int("work_order_site_id").autoincrement().primaryKey(),
  work_order_id: int("work_order_id")
    .notNull()
    .references(() => workOrderTable.work_order_id, { onDelete: "cascade" }),
  site_id: int("site_id")
    .notNull()
    .references(() => siteTable.site_id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const siteExpenseTable = mysqlTable("site_expenses", {
  site_expense_id: int("site_expense_id").autoincrement().primaryKey(),
  work_order_id: int("work_order_id")
    .notNull()
    .references(() => workOrderTable.work_order_id, { onDelete: "cascade" }),
  site_id: int("site_id")
    .notNull()
    .references(() => siteTable.site_id, { onDelete: "cascade" }),
  activity_id: int("activity_id")
    .notNull()
    .references(() => activityTable.activity_id, { onDelete: "cascade" }),
  expense_amount: decimal("expense_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  expense_description: text("expense_description").notNull(),
  expense_date: timestamp("expense_date").notNull(),
  expense_category: varchar("expense_category", { length: 100 }).notNull(),
  expense_receipt_number: varchar("expense_receipt_number", { length: 100 }),
  expense_status: varchar("expense_status", { length: 50 })
    .notNull()
    .default("pending"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
