-- BIG Oakland Virtual Mail - Seed Data
-- Default plans, pricing rules, and shipping margins
-- Generated: December 2024

-- ================================================
-- SUBSCRIPTION PLANS
-- ================================================
-- Competitive rates based on market research (PostScanMail & iPostal1)

INSERT INTO plans (name, description, monthly_price, included_items, overage_rate, billing_cycle, is_active) VALUES
('Starter', 'Perfect for individuals with light mail volume', 10.00, 30, 0.35, 'monthly', TRUE),
('Standard', 'Great for small businesses and remote workers', 20.00, 60, 0.30, 'monthly', TRUE),
('Premium', 'Ideal for businesses with high mail volume', 30.00, 120, 0.25, 'monthly', TRUE),
('Enterprise', 'Custom solutions for large organizations', 50.00, 250, 0.20, 'monthly', TRUE);

-- ================================================
-- PRICING RULES - SCANNING
-- ================================================
-- Base: $2.50 for first 10 pages, $0.30 per additional page

INSERT INTO pricing_rules (service_type, rule_name, base_price, per_unit_price, unit_description, min_quantity, max_quantity, is_active) VALUES
('scan', 'Standard Scan - First 10 Pages', 2.50, 0.00, 'flat rate', 1, 10, TRUE),
('scan', 'Standard Scan - Additional Pages', 0.00, 0.30, 'per page', 11, NULL, TRUE),
('scan', 'Express Scan - Priority Processing', 5.00, 0.30, 'per page (same day)', 1, NULL, TRUE);

-- ================================================
-- PRICING RULES - SHREDDING
-- ================================================
-- Base: $1.00 for first 10 pages, $0.15 per additional page

INSERT INTO pricing_rules (service_type, rule_name, base_price, per_unit_price, unit_description, min_quantity, max_quantity, is_active) VALUES
('shred', 'Standard Shred - First 10 Pages', 1.00, 0.00, 'flat rate', 1, 10, TRUE),
('shred', 'Standard Shred - Additional Pages', 0.00, 0.15, 'per page', 11, NULL, TRUE);

-- ================================================
-- PRICING RULES - STORAGE
-- ================================================
-- Free for 30 days, then $0.10 per item per day

INSERT INTO pricing_rules (service_type, rule_name, base_price, per_unit_price, unit_description, min_quantity, max_quantity, is_active) VALUES
('storage', 'Free Storage Period', 0.00, 0.00, 'free for 30 days', 1, 30, TRUE),
('storage', 'Extended Storage - Per Item Per Day', 0.00, 0.10, 'per item per day', 31, NULL, TRUE),
('storage', 'Monthly Storage Cap', 3.00, 0.00, 'max per item per month', 1, NULL, TRUE);

-- ================================================
-- PRICING RULES - LOCAL PICKUP
-- ================================================

INSERT INTO pricing_rules (service_type, rule_name, base_price, per_unit_price, unit_description, min_quantity, max_quantity, is_active) VALUES
('pickup', 'In-Store Pickup - Standard', 2.00, 0.00, 'per pickup', 1, NULL, TRUE),
('pickup', 'In-Store Pickup - Premium Members', 0.00, 0.00, 'free for Premium/Enterprise', 1, NULL, TRUE);

-- ================================================
-- PRICING RULES - MAIL FORWARDING
-- ================================================
-- Handling fee + postage with margin

INSERT INTO pricing_rules (service_type, rule_name, base_price, per_unit_price, unit_description, min_quantity, max_quantity, is_active) VALUES
('forward', 'Forwarding Handling Fee', 3.00, 0.00, 'flat handling fee', 1, NULL, TRUE),
('forward', 'Consolidation Service', 5.00, 0.00, 'combine multiple items', 1, NULL, TRUE);

-- ================================================
-- SHIPPING MARGINS
-- ================================================
-- Margin applied to carrier postage rates

INSERT INTO shipping_margins (carrier, service, margin_multiplier, handling_fee, is_active) VALUES
-- USPS
('USPS', 'First Class Mail', 1.00, 0.50, TRUE),
('USPS', 'Priority Mail', 1.20, 1.00, TRUE),
('USPS', 'Priority Mail Express', 1.20, 2.00, TRUE),
('USPS', 'Ground Advantage', 1.15, 0.75, TRUE),
('USPS', 'Media Mail', 1.10, 0.50, TRUE),

-- FedEx
('FedEx', 'Ground', 1.25, 1.50, TRUE),
('FedEx', 'Home Delivery', 1.25, 1.50, TRUE),
('FedEx', 'Express Saver', 1.30, 2.00, TRUE),
('FedEx', '2Day', 1.30, 2.50, TRUE),
('FedEx', 'Priority Overnight', 1.35, 3.00, TRUE),

-- UPS
('UPS', 'Ground', 1.25, 1.50, TRUE),
('UPS', '3 Day Select', 1.30, 2.00, TRUE),
('UPS', '2nd Day Air', 1.30, 2.50, TRUE),
('UPS', 'Next Day Air', 1.35, 3.00, TRUE),
('UPS', 'Next Day Air Saver', 1.30, 2.50, TRUE),

-- DHL
('DHL', 'Express Worldwide', 1.35, 3.50, TRUE),
('DHL', 'Express', 1.30, 3.00, TRUE);

-- ================================================
-- DEFAULT ADMIN USER
-- ================================================
-- Create initial mail center admin account

INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at) VALUES
('admin@bigoakland.com', 'PLACEHOLDER_HASH_CHANGE_ON_FIRST_LOGIN', 'BIG Oakland', 'Admin', 'admin', TRUE, NOW());

-- ================================================
-- SYSTEM SETTINGS
-- ================================================

CREATE TABLE IF NOT EXISTS system_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      description VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by INT REFERENCES users(id)
  );

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('business_name', 'BIG Oakland', 'Business display name'),
('business_address', '123 Broadway, Oakland, CA 94607', 'Physical mail center address'),
('business_phone', '(510) 555-0100', 'Contact phone number'),
('business_email', 'mail@bigoakland.com', 'Contact email'),
('timezone', 'America/Los_Angeles', 'Business timezone'),
('storage_free_days', '30', 'Days of free storage before charges apply'),
('tax_rate', '0.0925', 'Sales tax rate (9.25% for Oakland)'),
('currency', 'USD', 'Default currency'),
('mail_notification_email', 'TRUE', 'Send email notifications for new mail'),
('mail_notification_sms', 'FALSE', 'Send SMS notifications for new mail'),
('auto_shred_days', '90', 'Days before mail marked for auto-shred (0 = disabled)'),
('pickup_hours', 'Mon-Fri 9AM-6PM, Sat 10AM-4PM', 'In-store pickup hours');

-- ================================================
-- NOTES FOR DEPLOYMENT
-- ================================================
-- 1. Replace 'PLACEHOLDER_HASH_CHANGE_ON_FIRST_LOGIN' with actual bcrypt hash
-- 2. Adjust pricing as needed before going live
-- 3. Run this after DATABASE_SCHEMA.md tables are created
-- 4. All pricing is admin-editable through the Mail Center Portal
