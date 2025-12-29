-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Independent Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP,
    "is_active" BOOLEAN DEFAULT TRUE,
    "is_verified" BOOLEAN DEFAULT FALSE,
    "avatar_url" TEXT
);

CREATE TABLE IF NOT EXISTS "Organization" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "postal_code" VARCHAR(50),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "CommodityNamespace" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT
);

-- 2. Dependent Level 1
CREATE TABLE IF NOT EXISTS "UserRole" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id"),
    "organization_id" UUID REFERENCES "Organization"("id"),
    "role" VARCHAR(50) CHECK (role IN ('admin', 'manager', 'accountant', 'viewer')),
    "permissions" JSONB,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id"),
    "token" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP,
    "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "UserPreference" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id"),
    "locale" VARCHAR(20),
    "timezone" VARCHAR(50),
    "date_format" VARCHAR(20),
    "number_format" VARCHAR(20),
    "currency" VARCHAR(3),
    "ui_settings" JSONB,
    "notification_settings" JSONB
);

CREATE TABLE IF NOT EXISTS "Book" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "organization_id" UUID REFERENCES "Organization"("id"),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "root_account_id" UUID, -- Circular dependency, add FK constraint later
    "default_currency_id" UUID, -- FK to Commodity, add later or create Commodity first? Book creates Commodity usually.
    "fiscal_year_start" DATE,
    "fiscal_year_months" INT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT TRUE,
    "settings" JSONB
);

CREATE TABLE IF NOT EXISTS "Commodity" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "namespace" VARCHAR(50) CHECK (namespace IN ('ISO4217', 'NASDAQ', 'NYSE', 'CURRENCY', 'FUND')),
    "mnemonic" VARCHAR(20) NOT NULL,
    "fullname" VARCHAR(255),
    "cusip" VARCHAR(50),
    "fraction" INT,
    "get_quotes" BOOLEAN DEFAULT FALSE,
    "quote_source" VARCHAR(100),
    "quote_tz" VARCHAR(50),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Book with default_currency_id FK
ALTER TABLE "Book" ADD CONSTRAINT fk_book_default_currency FOREIGN KEY ("default_currency_id") REFERENCES "Commodity"("id");

CREATE TABLE IF NOT EXISTS "Account" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "parent_id" UUID REFERENCES "Account"("id"),
    "code" VARCHAR(50),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'BANK', 'CASH', 'CREDIT', 'STOCK', 'MUTUAL', 'CURRENCY', 'RECEIVABLE', 'PAYABLE', 'ROOT', 'TRADING')),
    "commodity_id" UUID REFERENCES "Commodity"("id"),
    "placeholder" BOOLEAN DEFAULT FALSE,
    "hidden" BOOLEAN DEFAULT FALSE,
    "tax_related" BOOLEAN DEFAULT FALSE,
    "notes" TEXT,
    "sort_order" INT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB
);

-- Update Book with root_account_id FK
ALTER TABLE "Book" ADD CONSTRAINT fk_book_root_account FOREIGN KEY ("root_account_id") REFERENCES "Account"("id");

CREATE TABLE IF NOT EXISTS "BookSettings" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "use_trading_accounts" BOOLEAN,
    "use_split_action_field" BOOLEAN,
    "auto_readonly_days" VARCHAR(50),
    "enable_euro_support" BOOLEAN,
    "accounting_period" JSONB
);

CREATE TABLE IF NOT EXISTS "TaxTable" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "name" VARCHAR(255),
    "is_default" BOOLEAN DEFAULT FALSE,
    "active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TaxTableEntry" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tax_table_id" UUID REFERENCES "TaxTable"("id"),
    "account_id" UUID REFERENCES "Account"("id"),
    "amount_num" DECIMAL,
    "amount_denom" DECIMAL,
    "type" VARCHAR(20) CHECK (type IN ('PERCENT', 'VALUE')),
    "sort_order" INT
);

CREATE TABLE IF NOT EXISTS "PriceEntry" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "commodity_id" UUID REFERENCES "Commodity"("id"),
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(100),
    "type" VARCHAR(50),
    "value_num" DECIMAL,
    "value_denom" DECIMAL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Entities
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "customer_id" VARCHAR(100) UNIQUE,
    "name" VARCHAR(255),
    "contact" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(50),
    "country" VARCHAR(100),
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "tax_table_id" UUID REFERENCES "TaxTable"("id"),
    "active" BOOLEAN DEFAULT TRUE,
    "notes" TEXT,
    "credit_limit" DECIMAL,
    "discount_num" DECIMAL,
    "discount_denom" DECIMAL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Vendor" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "vendor_id" VARCHAR(100) UNIQUE,
    "name" VARCHAR(255),
    "contact" VARCHAR(255),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(50),
    "country" VARCHAR(100),
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "tax_table_id" UUID REFERENCES "TaxTable"("id"),
    "active" BOOLEAN DEFAULT TRUE,
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Employee" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "employee_id" VARCHAR(100) UNIQUE,
    "username" VARCHAR(100),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "ccard_account_id" UUID REFERENCES "Account"("id"),
    "rate_num" DECIMAL,
    "rate_denom" DECIMAL,
    "active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Job" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "job_id" VARCHAR(100) UNIQUE,
    "name" VARCHAR(255),
    "reference" VARCHAR(255),
    "customer_id" UUID REFERENCES "Customer"("id"),
    "active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core Transaction Structure
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "number" VARCHAR(50),
    "date_posted" DATE,
    "date_entered" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "is_closing" BOOLEAN DEFAULT FALSE,
    "is_template" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB
);

CREATE TABLE IF NOT EXISTS "Split" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "transaction_id" UUID REFERENCES "Transaction"("id"),
    "account_id" UUID REFERENCES "Account"("id"),
    "memo" TEXT,
    "action" VARCHAR(50),
    "reconcile_state" VARCHAR(1) CHECK (reconcile_state IN ('n', 'c', 'y', 'f', 'v')),
    "reconcile_date" DATE,
    "amount_num" DECIMAL,
    "amount_denom" DECIMAL,
    "value_num" DECIMAL,
    "value_denom" DECIMAL,
    "lot_id" INT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices and Bills
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "invoice_id" VARCHAR(100) UNIQUE,
    "customer_id" UUID REFERENCES "Customer"("id"),
    "job_id" UUID REFERENCES "Job"("id"),
    "date_opened" DATE,
    "date_posted" DATE,
    "date_due" DATE,
    "billing_id" VARCHAR(100),
    "notes" TEXT,
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "active" BOOLEAN DEFAULT TRUE,
    "posted_txn_id" UUID REFERENCES "Transaction"("id"),
    "posted_account_id" UUID REFERENCES "Account"("id"),
    "to_charge_amount" DECIMAL,
    "status" VARCHAR(20) CHECK (status IN ('DRAFT', 'POSTED', 'PAID')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "InvoiceEntry" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "invoice_id" UUID REFERENCES "Invoice"("id"),
    "date" DATE,
    "description" TEXT,
    "action" VARCHAR(50),
    "quantity_num" DECIMAL,
    "quantity_denom" DECIMAL,
    "income_account_id" UUID REFERENCES "Account"("id"),
    "price_num" DECIMAL,
    "price_denom" DECIMAL,
    "discount_num" DECIMAL,
    "discount_denom" DECIMAL,
    "discount_type" VARCHAR(20) CHECK (discount_type IN ('PERCENT', 'VALUE')),
    "discount_how" VARCHAR(20) CHECK (discount_how IN ('PRETAX', 'SAMETIME', 'POSTTAX')),
    "taxable" BOOLEAN DEFAULT FALSE,
    "tax_table_id" UUID REFERENCES "TaxTable"("id"),
    "billable" BOOLEAN DEFAULT FALSE,
    "sort_order" INT
);

CREATE TABLE IF NOT EXISTS "Bill" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "bill_id" VARCHAR(100) UNIQUE,
    "vendor_id" UUID REFERENCES "Vendor"("id"),
    "date_opened" DATE,
    "date_posted" DATE,
    "date_due" DATE,
    "notes" TEXT,
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "active" BOOLEAN DEFAULT TRUE,
    "posted_txn_id" UUID REFERENCES "Transaction"("id"),
    "posted_account_id" UUID REFERENCES "Account"("id"),
    "status" VARCHAR(20) CHECK (status IN ('DRAFT', 'POSTED', 'PAID')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BillEntry" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bill_id" UUID REFERENCES "Bill"("id"),
    "date" DATE,
    "description" TEXT,
    "action" VARCHAR(50),
    "quantity_num" DECIMAL,
    "quantity_denom" DECIMAL,
    "expense_account_id" UUID REFERENCES "Account"("id"),
    "price_num" DECIMAL,
    "price_denom" DECIMAL,
    "billable" BOOLEAN,
    "tax_table_id" UUID REFERENCES "TaxTable"("id"),
    "taxable" BOOLEAN,
    "sort_order" INT
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "expense_id" VARCHAR(100) UNIQUE,
    "employee_id" UUID REFERENCES "Employee"("id"),
    "date_opened" DATE,
    "date_posted" DATE,
    "notes" TEXT,
    "currency_id" UUID REFERENCES "Commodity"("id"),
    "active" BOOLEAN DEFAULT TRUE,
    "posted_txn_id" UUID REFERENCES "Transaction"("id"),
    "posted_account_id" UUID REFERENCES "Account"("id"),
    "status" VARCHAR(20) CHECK (status IN ('DRAFT', 'POSTED', 'PAID')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ExpenseEntry" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "expense_id" UUID REFERENCES "Expense"("id"),
    "date" DATE,
    "description" TEXT,
    "quantity_num" DECIMAL,
    "quantity_denom" DECIMAL,
    "expense_account_id" UUID REFERENCES "Account"("id"),
    "price_num" DECIMAL,
    "price_denom" DECIMAL,
    "billable" BOOLEAN,
    "sort_order" INT
);

-- Scheduled Transactions
CREATE TABLE IF NOT EXISTS "ScheduledTransaction" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "name" VARCHAR(255),
    "enabled" BOOLEAN DEFAULT TRUE,
    "start_date" DATE,
    "end_date" DATE,
    "last_occurrence" DATE,
    "num_occurrences" INT,
    "remaining_occurrences" INT,
    "auto_create" BOOLEAN DEFAULT FALSE,
    "auto_notify" BOOLEAN DEFAULT FALSE,
    "advance_create_days" INT,
    "advance_remind_days" INT,
    "instance_count" VARCHAR(50),
    "recurrence_schedule" JSONB,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ScheduledSplit" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "scheduled_transaction_id" UUID REFERENCES "ScheduledTransaction"("id"),
    "account_id" UUID REFERENCES "Account"("id"),
    "memo" TEXT,
    "action" VARCHAR(50),
    "reconcile_state" VARCHAR(1),
    "amount_formula" TEXT,
    "metadata" JSONB
);

CREATE TABLE IF NOT EXISTS "TransactionOccurrence" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "scheduled_transaction_id" UUID REFERENCES "ScheduledTransaction"("id"),
    "occurrence_date" DATE,
    "transaction_id" UUID REFERENCES "Transaction"("id"),
    "status" VARCHAR(20) CHECK (status IN ('PENDING', 'CREATED', 'SKIPPED')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "name" VARCHAR(255),
    "description" TEXT,
    "num_periods" INT,
    "period_type" VARCHAR(20) CHECK (period_type IN ('MONTH', 'QUARTER', 'YEAR')),
    "start_date" DATE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BudgetPeriod" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "budget_id" UUID REFERENCES "Budget"("id"),
    "period_number" INT,
    "start_date" DATE,
    "end_date" DATE
);

CREATE TABLE IF NOT EXISTS "BudgetAmount" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "budget_period_id" UUID REFERENCES "BudgetPeriod"("id"),
    "account_id" UUID REFERENCES "Account"("id"),
    "amount_num" DECIMAL,
    "amount_denom" DECIMAL,
    "note" TEXT
);

-- Imports
CREATE TABLE IF NOT EXISTS "ImportProfile" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "name" VARCHAR(255),
    "format" VARCHAR(20) CHECK (format IN ('CSV', 'OFX', 'QIF', 'MT940')),
    "mapping_rules" JSONB,
    "default_account_id" JSONB,
    "skip_duplicates" BOOLEAN,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BankAccount" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "account_id" UUID REFERENCES "Account"("id"),
    "bank_name" VARCHAR(255),
    "account_number" VARCHAR(100),
    "routing_number" VARCHAR(100),
    "account_type" VARCHAR(50),
    "connection_settings" JSONB,
    "last_sync" TIMESTAMP,
    "active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "ImportedTransaction" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bank_account_id" UUID REFERENCES "BankAccount"("id"),
    "date" DATE,
    "description" TEXT,
    "amount" DECIMAL,
    "reference_number" VARCHAR(100),
    "status" VARCHAR(20) CHECK (status IN ('NEW', 'MATCHED', 'IMPORTED', 'IGNORED')),
    "matched_transaction_id" UUID REFERENCES "Transaction"("id"),
    "raw_data" JSONB,
    "imported_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reconciliation
CREATE TABLE IF NOT EXISTS "ReconciliationPeriod" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "account_id" UUID REFERENCES "Account"("id"),
    "start_date" DATE,
    "end_date" DATE,
    "starting_balance" DECIMAL,
    "ending_balance" DECIMAL,
    "status" VARCHAR(20) CHECK (status IN ('OPEN', 'CLOSED')),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Reconciliation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "split_id" UUID REFERENCES "Split"("id"),
    "reconciliation_period_id" UUID REFERENCES "ReconciliationPeriod"("id"),
    "reconcile_date" DATE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports
CREATE TABLE IF NOT EXISTS "ReportTemplate" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id"),
    "name" VARCHAR(255),
    "description" TEXT,
    "type" VARCHAR(50) CHECK (type IN ('BALANCE_SHEET', 'INCOME_STATEMENT', 'CASH_FLOW', 'TRIAL_BALANCE', 'CUSTOM')),
    "template_definition" JSONB,
    "is_public" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Report" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "book_id" UUID REFERENCES "Book"("id"),
    "report_template_id" UUID REFERENCES "ReportTemplate"("id"),
    "name" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "parameters" JSONB,
    "result_data" JSONB,
    "format" VARCHAR(20) CHECK (format IN ('HTML', 'PDF', 'CSV', 'JSON')),
    "generated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "generated_by" UUID REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "ReportParameter" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "report_id" UUID REFERENCES "Report"("id"),
    "parameter_name" VARCHAR(100),
    "parameter_value" TEXT
);

-- Attachments, Notes, Notifications
CREATE TABLE IF NOT EXISTS "Attachment" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "entity_id" UUID, -- Polymorphic
    "entity_type" VARCHAR(50) CHECK (entity_type IN ('transaction', 'account', 'invoice', 'bill')),
    "filename" VARCHAR(255),
    "file_path" TEXT,
    "mime_type" VARCHAR(100),
    "file_size" INT,
    "description" TEXT,
    "uploaded_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" UUID REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "AccountNote" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "account_id" UUID REFERENCES "Account"("id"),
    "note" TEXT,
    "created_by" UUID REFERENCES "User"("id"),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TransactionAttachment" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "transaction_id" UUID REFERENCES "Transaction"("id"),
    "attachment_id" UUID REFERENCES "Attachment"("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id"),
    "title" VARCHAR(255),
    "message" TEXT,
    "type" VARCHAR(20) CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'REMINDER')),
    "is_read" BOOLEAN DEFAULT FALSE,
    "metadata" JSONB,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Reminder" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "scheduled_transaction_id" UUID REFERENCES "ScheduledTransaction"("id"),
    "user_id" UUID REFERENCES "User"("id"),
    "reminder_date" DATE,
    "is_sent" BOOLEAN DEFAULT FALSE,
    "sent_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "User"("id"),
    "book_id" UUID REFERENCES "Book"("id"),
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "action" VARCHAR(20) CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
