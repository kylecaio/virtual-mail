# BIG Oakland Virtual Mail - Database Schema

## Overview

This document defines the database schema for the Virtual Mail application. The schema is designed with:
- **Multi-tenancy security** - Customers can only access their own data
- - **Admin-configurable pricing** - Mail center staff can adjust all rates
  - - **Complete audit trail** - All transactions and changes are logged
    - - **Flexible billing** - Supports plans, à la carte services, and shipping margins
     
      - ---

      ## Entity Relationship Diagram (Simplified)

      ```
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │   users     │       │  customers  │       │ mail_items  │
      │─────────────│       │─────────────│       │─────────────│
      │ id          │──┐    │ id          │──┐    │ id          │
      │ email       │  │    │ user_id     │◄─┘    │ customer_id │◄─┐
      │ role        │  └───►│ pmb_number  │       │ status      │  │
      │ password    │       │ plan_id     │◄──┐   │ received_at │  │
      └─────────────┘       └─────────────┘   │   └─────────────┘  │
                                              │                     │
      ┌─────────────┐       ┌─────────────┐   │   ┌─────────────┐  │
      │   plans     │       │  requests   │   │   │transactions │  │
      │─────────────│       │─────────────│   │   │─────────────│  │
      │ id          │───────┤ id          │   │   │ id          │  │
      │ name        │       │ mail_item_id│◄──┼───│ customer_id │◄─┤
      │ price       │       │ customer_id │◄──┼───│ request_id  │  │
      │ items_limit │       │ type        │   │   │ amount      │  │
      └─────────────┘       └─────────────┘   │   └─────────────┘  │
                                              │                     │
      ┌─────────────┐       ┌─────────────┐   │                     │
      │pricing_rules│       │shipping_    │   │                     │
      │─────────────│       │margins      │   │                     │
      │ id          │       │─────────────│   │                     │
      │ service_type│       │ carrier     │   │                     │
      │ amount      │       │ margin_pct  │   │                     │
      │ is_active   │       │ handling_fee│   │                     │
      └─────────────┘       └─────────────┘   │                     │
                                              └─────────────────────┘
      ```

      ---

      # CORE TABLES

      ## 1. users
      Staff and customer accounts with authentication.

      ```sql
      CREATE TABLE users (
          id              SERIAL PRIMARY KEY,
          email           VARCHAR(255) UNIQUE NOT NULL,
          password_hash   VARCHAR(255) NOT NULL,
          role            VARCHAR(20) NOT NULL DEFAULT 'customer',
                          -- 'admin', 'staff', 'customer'
          first_name      VARCHAR(100),
          last_name       VARCHAR(100),
          phone           VARCHAR(20),
          is_active       BOOLEAN DEFAULT TRUE,
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login_at   TIMESTAMP
      );

      -- Index for fast email lookups during login
      CREATE INDEX idx_users_email ON users(email);
      ```

      ---

      ## 2. customers
      Customer accounts with mailbox details. Links to users table.

      ```sql
      CREATE TABLE customers (
          id              SERIAL PRIMARY KEY,
          user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,

          -- Mailbox Info
          pmb_number      VARCHAR(10) UNIQUE NOT NULL,  -- e.g., "1073"
          business_name   VARCHAR(255),

          -- Plan & Billing
          plan_id         INTEGER REFERENCES plans(id),
          plan_started_at DATE,
          plan_expires_at DATE,
          billing_cycle   VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'

          -- Account Status
          status          VARCHAR(20) DEFAULT 'pending',
                          -- 'pending', 'active', 'suspended', 'closed'

          -- Compliance
          usps_1583_status VARCHAR(20) DEFAULT 'pending',
                          -- 'pending', 'approved', 'expired'
          usps_1583_approved_at DATE,

          -- Balance (for prepaid credits or outstanding charges)
          account_balance DECIMAL(10,2) DEFAULT 0.00,

          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CRITICAL: Index for customer isolation queries
      CREATE INDEX idx_customers_user_id ON customers(user_id);
      CREATE INDEX idx_customers_pmb ON customers(pmb_number);
      CREATE INDEX idx_customers_status ON customers(status);
      ```

      ---

      ## 3. customer_recipients
      Additional names authorized to receive mail at a customer's mailbox.

      ```sql
      CREATE TABLE customer_recipients (
          id              SERIAL PRIMARY KEY,
          customer_id     INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          name            VARCHAR(255) NOT NULL,
          is_primary      BOOLEAN DEFAULT FALSE,
          is_active       BOOLEAN DEFAULT TRUE,
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_recipients_customer ON customer_recipients(customer_id);
      ```

      ---

      # MAIL MANAGEMENT TABLES

      ## 4. mail_items
      Every piece of mail received.

      ```sql
      CREATE TABLE mail_items (
          id              SERIAL PRIMARY KEY,
          customer_id     INTEGER REFERENCES customers(id) ON DELETE CASCADE,

          -- Mail Details
          mail_type       VARCHAR(20) NOT NULL,
                          -- 'letter', 'large_envelope', 'magazine', 'package'
          sender_name     VARCHAR(255),
          tracking_number VARCHAR(100),
          weight_oz       DECIMAL(8,2),
          dimensions      VARCHAR(50),    -- "12x9x4"

          -- Images
          envelope_front_url  VARCHAR(500),
          envelope_back_url   VARCHAR(500),

          -- Status Tracking
          status          VARCHAR(20) DEFAULT 'received',
                          -- 'received', 'inbox', 'scanned', 'shipped',
                          -- 'picked_up', 'discarded', 'shredded', 'stored'

          -- Timestamps for billing
          received_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed_at    TIMESTAMP,      -- When action was completed
          storage_started_at TIMESTAMP,   -- When free storage ended (30 days after received)

          -- Flags
          is_read         BOOLEAN DEFAULT FALSE,
          is_favorite     BOOLEAN DEFAULT FALSE,

          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CRITICAL: Customer isolation index
      CREATE INDEX idx_mail_customer ON mail_items(customer_id);
      CREATE INDEX idx_mail_status ON mail_items(status);
      CREATE INDEX idx_mail_received ON mail_items(received_at);
      -- For storage billing queries
      CREATE INDEX idx_mail_storage ON mail_items(storage_started_at)
          WHERE status = 'stored';
      ```

      ---

      ## 5. mail_scans
      Scanned document pages for mail items.

      ```sql
      CREATE TABLE mail_scans (
          id              SERIAL PRIMARY KEY,
          mail_item_id    INTEGER REFERENCES mail_items(id) ON DELETE CASCADE,
          page_number     INTEGER NOT NULL,
          image_url       VARCHAR(500) NOT NULL,
          pdf_url         VARCHAR(500),
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_scans_mail ON mail_scans(mail_item_id);
      ```

      ---

      ## 6. requests
      Customer requests for mail actions.

      ```sql
      CREATE TABLE requests (
          id              SERIAL PRIMARY KEY,
          customer_id     INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          mail_item_id    INTEGER REFERENCES mail_items(id),

          -- Request Type
          request_type    VARCHAR(20) NOT NULL,
                          -- 'scan', 'ship', 'pickup', 'shred', 'discard', 'consolidate'

          -- Status
          status          VARCHAR(20) DEFAULT 'pending',
                          -- 'pending', 'processing', 'completed', 'cancelled'

          -- Shipping Details (if applicable)
          shipping_carrier    VARCHAR(50),
          shipping_service    VARCHAR(50),
          shipping_address_id INTEGER REFERENCES customer_addresses(id),
          shipping_cost       DECIMAL(10,2),
          tracking_number     VARCHAR(100),

          -- Pickup Details (if applicable)
          pickup_scheduled_at TIMESTAMP,
          pickup_completed_at TIMESTAMP,

          -- Notes
          customer_notes  TEXT,
          staff_notes     TEXT,

          -- Timestamps
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed_at    TIMESTAMP,
          processed_by    INTEGER REFERENCES users(id)
      );

      -- CRITICAL: Customer isolation index
      CREATE INDEX idx_requests_customer ON requests(customer_id);
      CREATE INDEX idx_requests_status ON requests(status);
      CREATE INDEX idx_requests_type ON requests(request_type);
      ```

      ---

      # PRICING & BILLING TABLES (Admin Configurable)

      ## 7. plans
      Subscription plans - ADMIN EDITABLE.

      ```sql
      CREATE TABLE plans (
          id              SERIAL PRIMARY KEY,
          name            VARCHAR(50) NOT NULL,       -- 'Starter', 'Standard', 'Premium'

          -- Pricing
          monthly_price   DECIMAL(10,2) NOT NULL,
          annual_price    DECIMAL(10,2),              -- Discounted annual rate

          -- Included Allowances
          mail_items_per_month    INTEGER NOT NULL,   -- e.g., 30, 60, 120
          scans_per_month         INTEGER DEFAULT 0,  -- Included scans
          recipients_allowed      INTEGER DEFAULT 2,

          -- Features
          free_storage_days       INTEGER DEFAULT 30,

          -- Display
          is_active       BOOLEAN DEFAULT TRUE,
          display_order   INTEGER DEFAULT 0,

          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_by      INTEGER REFERENCES users(id)
      );
      ```

      ---

      ## 8. pricing_rules
      À la carte service pricing - ADMIN EDITABLE.

      ```sql
      CREATE TABLE pricing_rules (
          id              SERIAL PRIMARY KEY,

          -- Service Identification
          service_type    VARCHAR(50) NOT NULL,
                          -- 'scan', 'shred', 'storage_daily', 'storage_monthly',
                          -- 'local_pickup', 'extra_mail_item', 'extra_recipient',
                          -- 'consolidation_letter', 'consolidation_package'

          -- Pricing Structure
          charge_type     VARCHAR(20) NOT NULL,
                          -- 'flat_fee', 'per_page', 'per_day', 'per_month',
                          -- 'per_pound', 'percentage'

          base_amount     DECIMAL(10,2) NOT NULL,     -- Base price

          -- Tiered Pricing (optional)
          included_units  INTEGER DEFAULT 0,          -- e.g., 10 pages included
          overage_amount  DECIMAL(10,2),              -- Price per additional unit

          -- Thresholds
          min_charge      DECIMAL(10,2),
          max_charge      DECIMAL(10,2),

          -- Status
          is_active       BOOLEAN DEFAULT TRUE,

          -- Audit
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_by      INTEGER REFERENCES users(id)
      );

      -- Example Data:
      -- service_type: 'scan', charge_type: 'flat_fee', base_amount: 2.50,
      --               included_units: 10, overage_amount: 0.25
      -- service_type: 'storage_daily', charge_type: 'per_day', base_amount: 0.05
      -- service_type: 'local_pickup', charge_type: 'flat_fee', base_amount: 5.00
      ```

      ---

      ## 9. shipping_margins
      Shipping carrier margins and handling fees - ADMIN EDITABLE.

      ```sql
      CREATE TABLE shipping_margins (
          id              SERIAL PRIMARY KEY,

          -- Carrier & Service
          carrier         VARCHAR(50) NOT NULL,       -- 'USPS', 'FedEx', 'UPS', 'DHL'
          service_type    VARCHAR(50) NOT NULL,       -- 'priority', 'ground', 'express', 'international'

          -- Margin (Multiplier: 1.25 = 25% markup)
          margin_multiplier DECIMAL(5,3) DEFAULT 1.00,

          -- Flat Handling Fee (added on top)
          handling_fee    DECIMAL(10,2) DEFAULT 0.00,

          -- Status
          is_active       BOOLEAN DEFAULT TRUE,

          -- Audit
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_by      INTEGER REFERENCES users(id)
      );

      -- Example: FedEx Ground with 35% margin + $1 handling
      -- carrier: 'FedEx', service_type: 'ground',
      -- margin_multiplier: 1.35, handling_fee: 1.00
      ```

      ---

      ## 10. transactions
      All billable events - IMMUTABLE AUDIT LOG.

      ```sql
      CREATE TABLE transactions (
          id              SERIAL PRIMARY KEY,
          customer_id     INTEGER REFERENCES customers(id),

          -- What was charged
          transaction_type VARCHAR(50) NOT NULL,
                          -- 'plan_subscription', 'scan', 'shred', 'storage',
                          -- 'shipping', 'local_pickup', 'extra_mail', etc.

          -- Related Records
          request_id      INTEGER REFERENCES requests(id),
          mail_item_id    INTEGER REFERENCES mail_items(id),

          -- Amounts
          quantity        INTEGER DEFAULT 1,
          unit_price      DECIMAL(10,2) NOT NULL,
          subtotal        DECIMAL(10,2) NOT NULL,

          -- For shipping: breakdown
          shipping_cost_actual    DECIMAL(10,2),      -- What we paid
          shipping_margin_amount  DECIMAL(10,2),      -- Our markup
          shipping_handling_fee   DECIMAL(10,2),      -- Flat handling fee

          -- Final Amount
          total_amount    DECIMAL(10,2) NOT NULL,

          -- Description for invoice
          description     TEXT,

          -- Payment Status
          status          VARCHAR(20) DEFAULT 'pending',
                          -- 'pending', 'paid', 'refunded', 'waived'

          -- Timestamps (IMMUTABLE - no updates allowed)
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- CRITICAL: Customer isolation and reporting indexes
      CREATE INDEX idx_trans_customer ON transactions(customer_id);
      CREATE INDEX idx_trans_date ON transactions(created_at);
      CREATE INDEX idx_trans_type ON transactions(transaction_type);
      CREATE INDEX idx_trans_status ON transactions(status);
      ```

      ---

      ## 11. pricing_history
      Audit log of all pricing changes - IMMUTABLE.

      ```sql
      CREATE TABLE pricing_history (
          id              SERIAL PRIMARY KEY,

          -- What changed
          table_name      VARCHAR(50) NOT NULL,       -- 'plans', 'pricing_rules', 'shipping_margins'
          record_id       INTEGER NOT NULL,
          field_name      VARCHAR(50) NOT NULL,

          -- Values
          old_value       TEXT,
          new_value       TEXT,

          -- Who changed it
          changed_by      INTEGER REFERENCES users(id),
          changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          -- Reason (optional)
          change_reason   TEXT
      );

      CREATE INDEX idx_pricing_history_table ON pricing_history(table_name, record_id);
      CREATE INDEX idx_pricing_history_date ON pricing_history(changed_at);
      ```

      ---

      # SUPPORTING TABLES

      ## 12. customer_addresses
      Shipping addresses for mail forwarding.

      ```sql
      CREATE TABLE customer_addresses (
          id              SERIAL PRIMARY KEY,
          customer_id     INTEGER REFERENCES customers(id) ON DELETE CASCADE,

          label           VARCHAR(50),                -- 'Home', 'Office', etc.
          street_1        VARCHAR(255) NOT NULL,
          street_2        VARCHAR(255),
          city            VARCHAR(100) NOT NULL,
          state           VARCHAR(50) NOT NULL,
          postal_code     VARCHAR(20) NOT NULL,
          country         VARCHAR(50) DEFAULT 'USA',

          is_default      BOOLEAN DEFAULT FALSE,
          is_active       BOOLEAN DEFAULT TRUE,

          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_addresses_customer ON customer_addresses(customer_id);
      ```

      ---

      ## 13. notifications
      Email/SMS notifications sent to customers.

      ```sql
      CREATE TABLE notifications (
          id              SERIAL PRIMARY KEY,
          customer_id     INTEGER REFERENCES customers(id),

          type            VARCHAR(50) NOT NULL,
                          -- 'mail_received', 'scan_complete', 'shipped',
                          -- 'pickup_ready', 'storage_warning', 'payment_due'

          channel         VARCHAR(20) NOT NULL,       -- 'email', 'sms', 'push'
          subject         VARCHAR(255),
          message         TEXT,

          sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          delivered_at    TIMESTAMP,
          read_at         TIMESTAMP
      );

      CREATE INDEX idx_notifications_customer ON notifications(customer_id);
      ```

      ---

      # SECURITY: ROW-LEVEL ACCESS CONTROL

      ## Customer Data Isolation Policy

      Every query for customer-facing data MUST include the customer_id filter:

      ```sql
      -- Example: Get customer's mail items (in application code)
      -- The customer_id comes from the authenticated session, NOT from user input

      SELECT * FROM mail_items
      WHERE customer_id = :authenticated_customer_id
        AND status != 'discarded';

      -- NEVER allow customer to specify their own customer_id in requests!
      -- WRONG: WHERE customer_id = :user_provided_id  ← Security vulnerability
      -- RIGHT: WHERE customer_id = :session_customer_id  ← From auth token
      ```

      ## Staff vs Customer Access

      ```sql
      -- Staff can see all customers' data (with audit logging)
      -- Customers can ONLY see their own data

      -- Application middleware should enforce:
      IF user.role == 'customer':
          ADD FILTER: customer_id = user.customer_id
      ELSE IF user.role IN ('admin', 'staff'):
          -- No filter, but log access
          LOG_ACCESS(user_id, resource, customer_id)
      ```

      ---

      # BILLING CALCULATION EXAMPLES

      ## Calculate Scan Charge

      ```sql
      -- Get current scan pricing
      SELECT * FROM pricing_rules WHERE service_type = 'scan' AND is_active = TRUE;
      -- Returns: base_amount: 2.50, included_units: 10, overage_amount: 0.25

      -- Calculate charge for 15-page scan:
      -- Base fee: $2.50 (covers first 10 pages)
      -- Overage: 5 pages × $0.25 = $1.25
      -- Total: $3.75
      ```

      ## Calculate Shipping Charge

      ```sql
      -- Get margin for FedEx Ground
      SELECT * FROM shipping_margins
      WHERE carrier = 'FedEx' AND service_type = 'ground' AND is_active = TRUE;
      -- Returns: margin_multiplier: 1.35, handling_fee: 1.00

      -- Actual FedEx cost from API: $12.50
      -- Customer charge: ($12.50 × 1.35) + $1.00 = $16.875 + $1.00 = $17.88
      -- Our profit: $17.88 - $12.50 = $5.38
      ```

      ## Calculate Storage Fees (Daily Cron Job)

      ```sql
      -- Find items past free storage period
      SELECT mi.id, mi.customer_id, mi.received_at,
             CURRENT_DATE - (mi.received_at::date + p.free_storage_days) as days_overdue
      FROM mail_items mi
      JOIN customers c ON mi.customer_id = c.id
      JOIN plans p ON c.plan_id = p.id
      WHERE mi.status = 'stored'
        AND mi.received_at < CURRENT_DATE - INTERVAL '1 day' * p.free_storage_days;

      -- For each overdue item, create transaction:
      -- Get daily rate from pricing_rules where service_type = 'storage_daily'
      -- Charge: days_overdue × daily_rate
      ```

      ---

      # ADMIN PRICING MANAGEMENT UI

      The Mail Center admin should have access to edit:

      ## 1. Plans Management
      - Add/edit/deactivate plans
      - - Set monthly and annual pricing
        - - Configure included allowances
         
          - ## 2. Service Pricing
          - - Edit scan/shred rates
            - - Edit storage rates
              - - Edit local pickup fee
                - - Edit overage charges
                 
                  - ## 3. Shipping Margins
                  - - Set margin percentage per carrier/service
                    - - Set handling fee per carrier/service
                      - - Enable/disable carriers
                       
                        - ## 4. View Pricing History
                        - - See all changes with timestamps
                          - - Filter by date range
                            - - Export for auditing
                             
                              - ---

                              # INDEXES SUMMARY (Performance Critical)

                              ```sql
                              -- Customer isolation (MOST IMPORTANT)
                              CREATE INDEX idx_mail_customer ON mail_items(customer_id);
                              CREATE INDEX idx_requests_customer ON requests(customer_id);
                              CREATE INDEX idx_trans_customer ON transactions(customer_id);

                              -- Status filtering
                              CREATE INDEX idx_mail_status ON mail_items(status);
                              CREATE INDEX idx_requests_status ON requests(status);

                              -- Date-based queries
                              CREATE INDEX idx_mail_received ON mail_items(received_at);
                              CREATE INDEX idx_trans_date ON transactions(created_at);

                              -- Billing queries
                              CREATE INDEX idx_mail_storage ON mail_items(storage_started_at) WHERE status = 'stored';
                              ```

                              ---

                              # NEXT STEPS

                              1. **Review and adjust** - Confirm this schema meets your needs
                              2. 2. **Create migrations** - Set up database migration scripts
                                 3. 3. **Seed initial data** - Add default plans, pricing rules, shipping margins
                                    4. 4. **Build admin UI** - Pricing management screens for staff
                                       5. 5. **Implement billing logic** - Background jobs for storage fees, invoice generation
