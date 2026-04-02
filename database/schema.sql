-- ==============================================
-- SCSC Compliance Tracker - Database Schema
-- Egg Farm Compliance Audit Forms (07-10)
-- PostgreSQL / Supabase
-- ==============================================

-- =============================================
-- CORE TABLES
-- =============================================

-- Farm Management
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name VARCHAR(255) NOT NULL,
  barn_number VARCHAR(100),
  owner_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, farm_name)
);

-- Monthly Audit Tracking
CREATE TABLE monthly_audits (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  form_07_completed BOOLEAN DEFAULT FALSE,
  form_07_completed_date TIMESTAMP,
  form_08_completed BOOLEAN DEFAULT FALSE,
  form_08_completed_date TIMESTAMP,
  form_09_completed BOOLEAN DEFAULT FALSE,
  form_09_completed_date TIMESTAMP,
  form_10_completed BOOLEAN DEFAULT FALSE,
  form_10_completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farm_id, month_year)
);

-- =============================================
-- FORM 07 - PRODUCTION & COOLER RECORDS
-- =============================================

CREATE TABLE production_cooler_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  barn_number VARCHAR(100),
  record_date DATE,
  flock_age_weeks INTEGER,
  floor_eggs_collection_1 INTEGER,
  floor_eggs_collection_2 INTEGER,
  floor_eggs_total INTEGER,
  egg_production_1 INTEGER,
  egg_production_2 INTEGER,
  egg_production_daily INTEGER,
  egg_production_percent NUMERIC,
  cooler_temp_hi_celsius NUMERIC,
  cooler_temp_lo_celsius NUMERIC,
  cooler_rh_hi_percent NUMERIC,
  cooler_rh_lo_percent NUMERIC,
  cooler_check_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sanitation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  barn_number VARCHAR(100),
  record_date DATE,
  dirty_trays_count INTEGER,
  egg_cooler_cleaned BOOLEAN,
  pack_room_cleaned BOOLEAN,
  tables_packing_equip_cleaned BOOLEAN,
  corrective_actions VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FORM 08 - WELFARE RECORDS
-- =============================================

CREATE TABLE welfare_daily_records (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  day_of_month INTEGER,
  record_date DATE,
  barn_number VARCHAR(100),
  barn_temp_hi NUMERIC,
  barn_temp_lo NUMERIC,
  exterior_temp NUMERIC,
  floors_checked BOOLEAN,
  walls_fans_ceiling_checked BOOLEAN,
  manure_checked BOOLEAN,
  bedding_used BOOLEAN,
  chemicals_used BOOLEAN,
  ammonia_level VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE welfare_equipment_inspection (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  record_date DATE,
  routine_hen_equip_1st_initial VARCHAR(3),
  routine_hen_equip_1st_daily VARCHAR(3),
  routine_hen_equip_2nd_initial VARCHAR(3),
  routine_hen_equip_2nd_daily VARCHAR(3),
  water_lines_checked BOOLEAN,
  feed_lines_checked BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE welfare_form_metadata (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  alarm_check_date DATE,
  alarm_check_initials VARCHAR(10),
  generator_check_date DATE,
  generator_check_initials VARCHAR(10),
  comments_page_1 VARCHAR(500),
  comments_page_2 VARCHAR(500),
  signature_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id)
);

-- =============================================
-- FORM 09 - FEED & WATER RECORDS
-- =============================================

CREATE TABLE feed_water_records (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  day_of_month INTEGER,
  record_date DATE,
  feed_daily NUMERIC,
  feed_actual NUMERIC,
  water_daily NUMERIC,
  water_actual NUMERIC,
  flush BOOLEAN,
  meds_vit BOOLEAN,
  treatment BOOLEAN,
  mortality_daily INTEGER,
  mortality_reason VARCHAR(500),
  hospital_pen_monitoring VARCHAR(500),
  inventory INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id, day_of_month)
);

CREATE TABLE feed_water_form_metadata (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  record_date DATE,
  feed_target VARCHAR(500),
  monthly_mortality_percent VARCHAR(500),
  comments VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id)
);

-- =============================================
-- FORM 10 - PEST CONTROL RECORDS
-- =============================================

CREATE TABLE pest_control_records (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
  record_date DATE,
  live_traps_findings VARCHAR(500),
  live_traps_location VARCHAR(500),
  bait_product VARCHAR(500),
  bait_location VARCHAR(500),
  birds_on_range VARCHAR(500),
  corrective_actions VARCHAR(500),
  frequency_weekly VARCHAR(500),
  frequency_monthly VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id, day_of_month)
);

CREATE TABLE pest_control_audit_sections (
  id BIGSERIAL PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  record_date DATE,
  exterior_inspection_date DATE,
  exterior_inspection_observation VARCHAR(500),
  wild_birds_observation VARCHAR(500),
  fly_monitoring VARCHAR(500),
  range_grass VARCHAR(500),
  range_ponding_water VARCHAR(500),
  range_rotation_harrow VARCHAR(500),
  range_wild_bird_deterrents VARCHAR(500),
  range_gravel_fences VARCHAR(500),
  range_other VARCHAR(500),
  interior_inspection_date DATE,
  interior_inspection_observation VARCHAR(500),
  rodent_index VARCHAR(500),
  comments VARCHAR(500),
  signature VARCHAR(500),
  signature_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(audit_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_cooler_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanitation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_equipment_inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_form_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_form_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_control_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_control_audit_sections ENABLE ROW LEVEL SECURITY;

-- Farms: Users can only access their own farms
CREATE POLICY "Users can only access their own farms" ON farms
  FOR ALL USING (user_id = auth.uid());

-- Monthly audits: Users can only access audits for their farms
CREATE POLICY "Users can only access their farm audits" ON monthly_audits
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = monthly_audits.farm_id) = auth.uid()
  );

-- Production cooler records
CREATE POLICY "Users can only access their farm records" ON production_cooler_records
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = production_cooler_records.farm_id) = auth.uid()
  );

-- Sanitation records
CREATE POLICY "Users can only access their farm records" ON sanitation_records
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = sanitation_records.farm_id) = auth.uid()
  );

-- Welfare daily records
CREATE POLICY "Users can only access their farm records" ON welfare_daily_records
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = welfare_daily_records.farm_id) = auth.uid()
  );

-- Welfare equipment inspection
CREATE POLICY "Users can only access their farm records" ON welfare_equipment_inspection
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = welfare_equipment_inspection.farm_id) = auth.uid()
  );

-- Welfare form metadata
CREATE POLICY "Users can only access their farm records" ON welfare_form_metadata
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = welfare_form_metadata.farm_id) = auth.uid()
  );

-- Feed water records
CREATE POLICY "Users can only access their farm records" ON feed_water_records
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = feed_water_records.farm_id) = auth.uid()
  );

-- Feed water form metadata
CREATE POLICY "Users can only access their farm records" ON feed_water_form_metadata
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = feed_water_form_metadata.farm_id) = auth.uid()
  );

-- Pest control records
CREATE POLICY "Users can only access their farm records" ON pest_control_records
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = pest_control_records.farm_id) = auth.uid()
  );

-- Pest control audit sections
CREATE POLICY "Users can only access their farm records" ON pest_control_audit_sections
  FOR ALL USING (
    (SELECT user_id FROM farms WHERE id = pest_control_audit_sections.farm_id) = auth.uid()
  );

-- =============================================
-- INDEXES for Performance
-- =============================================

CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_monthly_audits_farm_id ON monthly_audits(farm_id);
CREATE INDEX idx_monthly_audits_month_year ON monthly_audits(month_year);
CREATE INDEX idx_production_cooler_farm_id ON production_cooler_records(farm_id);
CREATE INDEX idx_production_cooler_audit_id ON production_cooler_records(audit_id);
CREATE INDEX idx_sanitation_farm_id ON sanitation_records(farm_id);
CREATE INDEX idx_welfare_daily_farm_id ON welfare_daily_records(farm_id);
CREATE INDEX idx_welfare_daily_audit_id ON welfare_daily_records(audit_id);
CREATE INDEX idx_feed_water_farm_id ON feed_water_records(farm_id);
CREATE INDEX idx_feed_water_audit_id ON feed_water_records(audit_id);
CREATE INDEX idx_pest_control_farm_id ON pest_control_records(farm_id);
CREATE INDEX idx_pest_control_audit_id ON pest_control_records(audit_id);
