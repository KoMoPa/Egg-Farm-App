-- ==============================================
-- SCSC Compliance Tracker - Database Schema
-- Hierarchical structure for optimal data integrity,
-- offline-first local storage, analytics, and PDF exports
-- PostgreSQL / Supabase
--
-- Structure: User → Farm (1:1) → Barns (1:many) → Monthly Audits → Forms
-- ==============================================

-- =============================================
-- CORE TABLES
-- =============================================

-- Farm Management (one farm per user)
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Barn Management (one farm can have multiple barns)
CREATE TABLE barns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  barn_name VARCHAR(255) NOT NULL,
  barn_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farm_id, barn_number)
);

-- Monthly Audit Tracking
CREATE TABLE monthly_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Parent container for monthly production records
CREATE TABLE production_cooler_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  monthly_corrective_actions TEXT,
  monthly_comments TEXT,
  UNIQUE(barn_id, audit_id)
);

-- Floor eggs collection (recorded when they collect floor eggs)
CREATE TABLE production_floor_eggs (
  production_id UUID NOT NULL REFERENCES production_cooler_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  collection_1 INTEGER,
  collection_2 INTEGER,
  floor_eggs_total INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (production_id, record_date)
);

-- Nest/production eggs (at least daily; twice daily for systems where hens can sit on eggs)
CREATE TABLE production_egg_output (
  production_id UUID NOT NULL REFERENCES production_cooler_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  egg_production_1 INTEGER,
  egg_production_2 INTEGER,
  egg_production_daily INTEGER,
  egg_production_percent NUMERIC,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (production_id, record_date)
);

-- Cooler temperature and humidity (recorded when they check cooler)
CREATE TABLE production_cooler_temps (
  production_id UUID NOT NULL REFERENCES production_cooler_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  cooler_temp_hi_celsius NUMERIC,
  cooler_temp_lo_celsius NUMERIC,
  cooler_rh_hi_percent NUMERIC,
  cooler_rh_lo_percent NUMERIC,
  cooler_check_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (production_id, record_date)
);

-- Sanitation (as performed; codes: B=blow, W=wash, S=sweep; NULL if not done that day)
-- Dirty trays is a daily count (record 0 if none)
CREATE TABLE production_sanitation (
  production_id UUID NOT NULL REFERENCES production_cooler_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  dirty_trays_count INTEGER,
  egg_cooler_sanitation_code VARCHAR(10),
  pack_room_sanitation_code VARCHAR(10),
  equip_sanitation_code VARCHAR(10),
  corrective_actions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (production_id, record_date)
);

-- Flock age tracking (usually one entry per month)
CREATE TABLE production_flock_age (
  production_id UUID NOT NULL REFERENCES production_cooler_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  flock_age_weeks INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (production_id, record_date)
);

-- Thermometer calibration (at least twice per year)
-- Methods: A=compared with calibrated thermometer, B=boiling water (must read 100C), C=ice bath (must read 0C)
CREATE TABLE production_thermometer_calibration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES production_cooler_records(id) ON DELETE CASCADE,
  calibration_date DATE NOT NULL,
  method CHAR(1) NOT NULL CHECK (method IN ('A', 'B', 'C')),
  result_pass BOOLEAN NOT NULL,
  notes VARCHAR(500),
  initials VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FORM 08 - WELFARE RECORDS (Consolidated)
-- =============================================

-- Parent container for monthly welfare records
CREATE TABLE welfare_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  monthly_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(barn_id, audit_id)
);

-- Daily barn checks (temperatures, sanitation codes, hen inspections)
-- Sanitation codes: B=blow, C=cleanout, S=sweep, W=wash (NULL if not done that day)
-- If barn temp outside range, exterior_temp must be recorded
CREATE TABLE welfare_daily_checks (
  welfare_id UUID NOT NULL REFERENCES welfare_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  barn_temp_hi NUMERIC,
  barn_temp_lo NUMERIC,
  exterior_temp NUMERIC,
  floor_sanitation_code VARCHAR(10),
  walls_sanitation_code VARCHAR(10),
  manure_sanitation_code VARCHAR(10),
  bedding_notes VARCHAR(100),
  chemicals_notes VARCHAR(200),
  hen_inspection_am VARCHAR(20),
  hen_inspection_pm VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (welfare_id, record_date)
);

-- Weekly routine inspection checklist (check each of the 15 criteria per day)
CREATE TABLE welfare_weekly_inspections (
  welfare_id UUID NOT NULL REFERENCES welfare_records(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  check_overall_appearance BOOLEAN,
  check_general_sound BOOLEAN,
  check_abnormal_behavior BOOLEAN,
  check_disease_illness BOOLEAN,
  check_injured_birds BOOLEAN,
  check_respiratory BOOLEAN,
  check_panting_huddling BOOLEAN,
  check_lameness BOOLEAN,
  check_feather_pecking BOOLEAN,
  check_trapped_birds BOOLEAN,
  check_dead_birds BOOLEAN,
  check_feed_water_available BOOLEAN,
  check_equipment_operating BOOLEAN,
  check_amenities_condition BOOLEAN,
  check_lay_facility BOOLEAN,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (welfare_id, inspection_date)
);

-- Monthly checks: ammonia test (Oct-March), alarm check, generator check
-- One record per welfare_record (i.e. per barn per month)
CREATE TABLE welfare_monthly_checks (
  welfare_id UUID NOT NULL REFERENCES welfare_records(id) ON DELETE CASCADE,
  ammonia_ppm_range VARCHAR(5) CHECK (ammonia_ppm_range IN ('0-5', '5-10', '10-15', '15-20', '20+')),
  ammonia_distilled_water BOOLEAN,
  ammonia_initials VARCHAR(20),
  ammonia_notes VARCHAR(500),
  alarm_check_date DATE,
  alarm_check_initials VARCHAR(20),
  generator_check_date DATE,
  generator_check_initials VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (welfare_id)
);

-- =============================================
-- FORM 09 - FEED & WATER RECORDS
-- =============================================

-- Parent container for monthly feed & water records
CREATE TABLE feed_water_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(barn_id, audit_id)
);

-- Daily feed and water measurements (must use scales/meters/timers, not delivery slip estimates)
CREATE TABLE feed_water_daily (
  fw_id UUID NOT NULL REFERENCES feed_water_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  feed_daily NUMERIC,
  feed_actual NUMERIC,
  water_daily NUMERIC,
  water_actual NUMERIC,
  auger_run_time_minutes SMALLINT,
  flush_notes VARCHAR(200),
  meds_vit_notes VARCHAR(200),
  treatment_notes VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (fw_id, record_date)
);

-- Daily mortality and health records (must record a number, including 0)
-- Notify EFO if monthly mortality > 0.5% or if any single pileup > 50 birds
CREATE TABLE feed_water_health (
  fw_id UUID NOT NULL REFERENCES feed_water_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  mortality_daily INTEGER NOT NULL DEFAULT 0,
  pileup_count INTEGER,
  efo_notified BOOLEAN DEFAULT FALSE,
  mortality_reason TEXT,
  hospital_pen_monitoring TEXT,
  inventory INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (fw_id, record_date)
);

-- Monthly summary metadata
CREATE TABLE feed_water_monthly_metadata (
  fw_id UUID NOT NULL REFERENCES feed_water_records(id) ON DELETE CASCADE,
  starting_inventory INTEGER,
  feed_target VARCHAR(500),
  monthly_mortality_percent NUMERIC,
  water_residual_monthly VARCHAR(200),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(fw_id)
);

-- =============================================
-- FORM 10 - PEST CONTROL RECORDS
-- =============================================

-- Parent container for monthly pest control records
CREATE TABLE pest_control_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id UUID NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(barn_id, audit_id)
);

-- Weekly trap checks and bait station monitoring
-- mice_caught + traps_checked feed into monthly rodent index calculation
CREATE TABLE pest_daily_observations (
  pest_id UUID NOT NULL REFERENCES pest_control_records(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  mice_caught INTEGER DEFAULT 0,
  traps_checked INTEGER,
  trap_findings_notes TEXT,
  trap_location VARCHAR(500),
  bait_product VARCHAR(500),
  bait_location VARCHAR(500),
  bait_replenished BOOLEAN DEFAULT FALSE,
  birds_on_range TEXT,
  corrective_actions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pest_id, record_date)
);

-- Monthly exterior/interior inspections and rodent index
-- Rodent index formula: (mice_total ÷ traps_total ÷ days_monitored) × 12 × 7
-- Fly monitoring levels: 'Very Few', 'Moderate', 'Severe'
CREATE TABLE pest_monthly_audit (
  pest_id UUID NOT NULL REFERENCES pest_control_records(id) ON DELETE CASCADE,
  exterior_inspection_date DATE,
  exterior_inspection_observation TEXT,
  wild_birds_observation TEXT,
  fly_monitoring VARCHAR(20) CHECK (fly_monitoring IN ('Very Few', 'Moderate', 'Severe')),
  range_grass TEXT,
  range_ponding_water TEXT,
  range_rotation_harrow TEXT,
  range_wild_bird_deterrents TEXT,
  range_gravel_fences TEXT,
  range_other TEXT,
  interior_inspection_date DATE,
  interior_inspection_observation TEXT,
  mice_total INTEGER,
  traps_total INTEGER,
  days_monitored INTEGER,
  rodent_index NUMERIC,
  comments TEXT,
  signature VARCHAR(200),
  signature_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pest_id)
);

-- =============================================
-- CORRECTIVE ACTION LOG (ALL FORMS)
-- =============================================

-- Required for any deviation from standards across all forms
CREATE TABLE corrective_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES monthly_audits(id) ON DELETE SET NULL,
  form_number VARCHAR(2) CHECK (form_number IN ('07', '08', '09', '10')),
  deviation_date DATE NOT NULL,
  deviation_description TEXT NOT NULL,
  corrective_action_taken TEXT,
  resolved_date DATE,
  responsible_person VARCHAR(100),
  initials VARCHAR(20),
  verified_by VARCHAR(100),
  verified_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BARN FORM PREFERENCES
-- =============================================

-- Per-barn visibility settings for individual form fields
CREATE TABLE barn_form_preferences (
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  form_name VARCHAR NOT NULL,
  field_name VARCHAR NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (barn_id, form_name, field_name)
);

-- =============================================
-- ARCHIVED AUDIT REPORTS
-- =============================================

-- Stores references to generated PDF audit reports
CREATE TABLE archived_audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size INTEGER,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE barns ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_cooler_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_floor_eggs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_egg_output ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_cooler_temps ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_sanitation ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_flock_age ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_thermometer_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_daily_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_weekly_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_monthly_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_monthly_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_control_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_daily_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_monthly_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_action_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE barn_form_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_audit_reports ENABLE ROW LEVEL SECURITY;

-- Farms: Users can only access their own farms
CREATE POLICY "Users can only access their own farms" ON farms
  FOR ALL USING (user_id = auth.uid());

-- Barns: Users can only access barns from their farm
CREATE POLICY "Users can only access their farm's barns" ON barns
  FOR ALL USING (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );

-- Monthly audits: Users can only access audits for their farms
CREATE POLICY "Users can only access their farm audits" ON monthly_audits
  FOR ALL USING (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );

-- Production cooler records
CREATE POLICY "Users can only access their barn records" ON production_cooler_records
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- Production floor eggs
CREATE POLICY "Users can only access their barn records" ON production_floor_eggs
  FOR ALL USING (
    production_id IN (SELECT id FROM production_cooler_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Production egg output
CREATE POLICY "Users can only access their barn records" ON production_egg_output
  FOR ALL USING (
    production_id IN (SELECT id FROM production_cooler_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Production cooler temps
CREATE POLICY "Users can only access their barn records" ON production_cooler_temps
  FOR ALL USING (
    production_id IN (SELECT id FROM production_cooler_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Production sanitation
CREATE POLICY "Users can only access their barn records" ON production_sanitation
  FOR ALL USING (
    production_id IN (SELECT id FROM production_cooler_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Production flock age
CREATE POLICY "Users can only access their barn records" ON production_flock_age
  FOR ALL USING (
    production_id IN (SELECT id FROM production_cooler_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Welfare records
CREATE POLICY "Users can only access their barn records" ON welfare_records
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- Welfare daily checks
CREATE POLICY "Users can only access their barn records" ON welfare_daily_checks
  FOR ALL USING (
    welfare_id IN (SELECT id FROM welfare_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Welfare weekly inspections
CREATE POLICY "Users can only access their barn records" ON welfare_weekly_inspections
  FOR ALL USING (
    welfare_id IN (SELECT id FROM welfare_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Feed water records
CREATE POLICY "Users can only access their barn records" ON feed_water_records
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- Feed water daily
CREATE POLICY "Users can only access their barn records" ON feed_water_daily
  FOR ALL USING (
    fw_id IN (SELECT id FROM feed_water_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Feed water health
CREATE POLICY "Users can only access their barn records" ON feed_water_health
  FOR ALL USING (
    fw_id IN (SELECT id FROM feed_water_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Feed water monthly metadata
CREATE POLICY "Users can only access their barn records" ON feed_water_monthly_metadata
  FOR ALL USING (
    fw_id IN (SELECT id FROM feed_water_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Pest control records
CREATE POLICY "Users can only access their barn records" ON pest_control_records
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- Pest daily observations
CREATE POLICY "Users can only access their barn records" ON pest_daily_observations
  FOR ALL USING (
    pest_id IN (SELECT id FROM pest_control_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Pest monthly audit
CREATE POLICY "Users can only access their barn records" ON pest_monthly_audit
  FOR ALL USING (
    pest_id IN (SELECT id FROM pest_control_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Thermometer calibration
CREATE POLICY "Users can only access their barn records" ON production_thermometer_calibration
  FOR ALL USING (
    production_id IN (SELECT id FROM production_cooler_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Monthly checks (ammonia, alarm, generator)
CREATE POLICY "Users can only access their barn records" ON welfare_monthly_checks
  FOR ALL USING (
    welfare_id IN (SELECT id FROM welfare_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Corrective action log
CREATE POLICY "Users can only access their barn records" ON corrective_action_log
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- Barn form preferences
CREATE POLICY "Users can only access their barn records" ON barn_form_preferences
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- Archived audit reports
CREATE POLICY "Users can only access their farm records" ON archived_audit_reports
  FOR ALL USING (
    farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_barns_farm_id ON barns(farm_id);
CREATE INDEX idx_monthly_audits_farm_id ON monthly_audits(farm_id);
CREATE INDEX idx_monthly_audits_month_year ON monthly_audits(month_year);
CREATE INDEX idx_monthly_audits_farm_month ON monthly_audits(farm_id, month_year);
CREATE INDEX idx_production_cooler_barn_id ON production_cooler_records(barn_id);
CREATE INDEX idx_production_cooler_audit_id ON production_cooler_records(audit_id);
CREATE INDEX idx_welfare_records_barn_id ON welfare_records(barn_id);
CREATE INDEX idx_welfare_records_audit_id ON welfare_records(audit_id);
CREATE INDEX idx_feed_water_barn_id ON feed_water_records(barn_id);
CREATE INDEX idx_feed_water_audit_id ON feed_water_records(audit_id);
CREATE INDEX idx_pest_control_barn_id ON pest_control_records(barn_id);
CREATE INDEX idx_pest_control_audit_id ON pest_control_records(audit_id);
CREATE INDEX idx_archived_reports_farm_id ON archived_audit_reports(farm_id);
CREATE INDEX idx_archived_reports_audit_id ON archived_audit_reports(audit_id);
CREATE INDEX idx_barn_form_prefs_barn_id ON barn_form_preferences(barn_id);