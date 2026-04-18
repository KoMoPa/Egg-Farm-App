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

-- Parent container for monthly production records
CREATE TABLE production_cooler_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
-- FORM 08 - WELFARE RECORDS
-- =============================================

-- Parent container for monthly welfare records
CREATE TABLE welfare_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
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

-- Weekly routine inspection checklist (initial or check each of the 15 criteria)
-- Also used to record monthly alarm/generator tests
CREATE TABLE welfare_weekly_inspections (
  welfare_id UUID NOT NULL REFERENCES welfare_records(id) ON DELETE CASCADE,
  inspection_date DATE NOT NULL,
  alarm_check_date DATE,
  alarm_check_initials VARCHAR(20),
  generator_check_date DATE,
  generator_check_initials VARCHAR(20),
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
  weekly_initials VARCHAR(20),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (welfare_id, inspection_date)
);

-- Monthly ammonia tests (required October to March; no exemptions by housing type)
-- Range is circled on form: 0-5, 5-10, 10-15, 15-20, 20+
-- Test at bird height, average of at least 3 locations (front, middle, back)
CREATE TABLE welfare_ammonia_tests (
  welfare_id UUID NOT NULL REFERENCES welfare_records(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  ppm_range VARCHAR(5) CHECK (ppm_range IN ('0-5', '5-10', '10-15', '15-20', '20+')),
  distilled_water_used BOOLEAN,
  initials VARCHAR(20),
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (welfare_id, test_date)
);

-- =============================================
-- FORM 09 - FEED & WATER RECORDS
-- =============================================

-- Parent container for monthly feed & water records
CREATE TABLE feed_water_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barn_id UUID NOT NULL REFERENCES barns(id) ON DELETE CASCADE,
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
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
  auger_run_time_minutes INTEGER,
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
  audit_id BIGINT NOT NULL REFERENCES monthly_audits(id) ON DELETE CASCADE,
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
  audit_id BIGINT REFERENCES monthly_audits(id) ON DELETE SET NULL,
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
ALTER TABLE welfare_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_daily_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_weekly_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_water_monthly_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_control_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_daily_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pest_monthly_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_thermometer_calibration ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_ammonia_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_action_log ENABLE ROW LEVEL SECURITY;

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

-- Ammonia tests
CREATE POLICY "Users can only access their barn records" ON welfare_ammonia_tests
  FOR ALL USING (
    welfare_id IN (SELECT id FROM welfare_records WHERE barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())))
  );

-- Corrective action log
CREATE POLICY "Users can only access their barn records" ON corrective_action_log
  FOR ALL USING (
    barn_id IN (SELECT id FROM barns WHERE farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Core indexes
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_barns_farm_id ON barns(farm_id);
CREATE INDEX idx_monthly_audits_farm_id ON monthly_audits(farm_id);
CREATE INDEX idx_monthly_audits_farm_month ON monthly_audits(farm_id, month_year);

-- Production indexes
CREATE INDEX idx_production_cooler_records_barn_id ON production_cooler_records(barn_id);
CREATE INDEX idx_production_cooler_records_audit_id ON production_cooler_records(audit_id);
CREATE INDEX idx_production_floor_eggs_production_id_date ON production_floor_eggs(production_id, record_date);
CREATE INDEX idx_production_egg_output_production_id_date ON production_egg_output(production_id, record_date);
CREATE INDEX idx_production_cooler_temps_production_id_date ON production_cooler_temps(production_id, record_date);
CREATE INDEX idx_production_sanitation_production_id_date ON production_sanitation(production_id, record_date);
CREATE INDEX idx_production_flock_age_production_id_date ON production_flock_age(production_id, record_date);

-- Welfare indexes
CREATE INDEX idx_welfare_records_barn_id ON welfare_records(barn_id);
CREATE INDEX idx_welfare_records_audit_id ON welfare_records(audit_id);
CREATE INDEX idx_welfare_daily_checks_welfare_id_date ON welfare_daily_checks(welfare_id, record_date);
CREATE INDEX idx_welfare_weekly_inspections_welfare_id_date ON welfare_weekly_inspections(welfare_id, inspection_date);

-- Feed & Water indexes
CREATE INDEX idx_feed_water_records_barn_id ON feed_water_records(barn_id);
CREATE INDEX idx_feed_water_records_audit_id ON feed_water_records(audit_id);
CREATE INDEX idx_feed_water_daily_fw_id_date ON feed_water_daily(fw_id, record_date);
CREATE INDEX idx_feed_water_health_fw_id_date ON feed_water_health(fw_id, record_date);

-- Pest Control indexes
CREATE INDEX idx_pest_control_records_barn_id ON pest_control_records(barn_id);
CREATE INDEX idx_pest_control_records_audit_id ON pest_control_records(audit_id);
CREATE INDEX idx_pest_daily_observations_pest_id_date ON pest_daily_observations(pest_id, record_date);

-- Thermometer calibration indexes
CREATE INDEX idx_production_thermometer_cal_production_id ON production_thermometer_calibration(production_id);
CREATE INDEX idx_production_thermometer_cal_date ON production_thermometer_calibration(calibration_date);

-- Ammonia tests indexes
CREATE INDEX idx_welfare_ammonia_tests_welfare_id_date ON welfare_ammonia_tests(welfare_id, test_date);

-- Corrective action log indexes
CREATE INDEX idx_corrective_action_log_barn_id ON corrective_action_log(barn_id);
CREATE INDEX idx_corrective_action_log_audit_id ON corrective_action_log(audit_id);
CREATE INDEX idx_corrective_action_log_deviation_date ON corrective_action_log(deviation_date);

-- =============================================
-- VIEWS FOR PDF EXPORT AND ANALYTICS
-- =============================================

-- Form 07: Production & Cooler - Complete month snapshot
CREATE VIEW form_07_snapshot AS
SELECT 
  pcr.id as production_id,
  b.id as barn_id,
  b.barn_name,
  b.barn_number,
  pcr.audit_id,
  COALESCE(pfe.record_date, peo.record_date, pct.record_date, ps.record_date, pfa.record_date) as record_date,
  pfa.flock_age_weeks,
  pfe.collection_1 as floor_eggs_collection_1,
  pfe.collection_2 as floor_eggs_collection_2,
  pfe.floor_eggs_total,
  peo.egg_production_1,
  peo.egg_production_2,
  peo.egg_production_daily,
  peo.egg_production_percent,
  peo.notes as production_notes,
  pct.cooler_temp_hi_celsius,
  pct.cooler_temp_lo_celsius,
  pct.cooler_rh_hi_percent,
  pct.cooler_rh_lo_percent,
  pct.cooler_check_time,
  ps.dirty_trays_count,
  ps.egg_cooler_sanitation_code,
  ps.pack_room_sanitation_code,
  ps.equip_sanitation_code,
  ps.corrective_actions
FROM production_cooler_records pcr
LEFT JOIN barns b ON pcr.barn_id = b.id
FULL OUTER JOIN production_flock_age pfa ON pcr.id = pfa.production_id
FULL OUTER JOIN production_floor_eggs pfe ON pcr.id = pfe.production_id
FULL OUTER JOIN production_egg_output peo ON pcr.id = peo.production_id
FULL OUTER JOIN production_cooler_temps pct ON pcr.id = pct.production_id
FULL OUTER JOIN production_sanitation ps ON pcr.id = ps.production_id
ORDER BY b.id, record_date;

-- Form 08: Welfare - Complete month snapshot
CREATE VIEW form_08_snapshot AS
SELECT 
  wr.id as welfare_id,
  b.id as barn_id,
  b.barn_name,
  b.barn_number,
  wr.audit_id,
  wr.monthly_comments,
  COALESCE(wdc.record_date, wwi.inspection_date) as record_date,
  wdc.barn_temp_hi,
  wdc.barn_temp_lo,
  wdc.exterior_temp,
  wdc.floor_sanitation_code,
  wdc.walls_sanitation_code,
  wdc.manure_sanitation_code,
  wdc.bedding_notes,
  wdc.chemicals_notes,
  wdc.hen_inspection_am,
  wdc.hen_inspection_pm,
  wwi.alarm_check_date,
  wwi.alarm_check_initials,
  wwi.generator_check_date,
  wwi.generator_check_initials,
  wwi.check_overall_appearance,
  wwi.check_general_sound,
  wwi.check_abnormal_behavior,
  wwi.check_disease_illness,
  wwi.check_injured_birds,
  wwi.check_respiratory,
  wwi.check_panting_huddling,
  wwi.check_lameness,
  wwi.check_feather_pecking,
  wwi.check_trapped_birds,
  wwi.check_dead_birds,
  wwi.check_feed_water_available,
  wwi.check_equipment_operating,
  wwi.check_amenities_condition,
  wwi.check_lay_facility,
  wwi.weekly_initials,
  wwi.comments
FROM welfare_records wr
LEFT JOIN barns b ON wr.barn_id = b.id
FULL OUTER JOIN welfare_daily_checks wdc ON wr.id = wdc.welfare_id
FULL OUTER JOIN welfare_weekly_inspections wwi ON wr.id = wwi.welfare_id
ORDER BY b.id, record_date;

-- Form 09: Feed & Water - Complete month snapshot
CREATE VIEW form_09_snapshot AS
SELECT 
  fwr.id as fw_id,
  b.id as barn_id,
  b.barn_name,
  b.barn_number,
  fwr.audit_id,
  COALESCE(fwd.record_date, fwh.record_date) as record_date,
  fwd.feed_daily,
  fwd.feed_actual,
  fwd.water_daily,
  fwd.water_actual,
  fwd.auger_run_time_minutes,
  fwd.flush_notes,
  fwd.meds_vit_notes,
  fwd.treatment_notes,
  fwd.notes,
  fwh.mortality_daily,
  fwh.pileup_count,
  fwh.efo_notified,
  fwh.mortality_reason,
  fwh.hospital_pen_monitoring,
  fwh.inventory,
  fwm.starting_inventory,
  fwm.feed_target,
  fwm.monthly_mortality_percent,
  fwm.water_residual_monthly,
  fwm.comments
FROM feed_water_records fwr
LEFT JOIN barns b ON fwr.barn_id = b.id
FULL OUTER JOIN feed_water_daily fwd ON fwr.id = fwd.fw_id
FULL OUTER JOIN feed_water_health fwh ON fwr.id = fwh.fw_id
LEFT JOIN feed_water_monthly_metadata fwm ON fwr.id = fwm.fw_id
ORDER BY b.id, record_date;

-- Form 10: Pest Control - Complete month snapshot
CREATE VIEW form_10_snapshot AS
SELECT 
  pcr.id as pest_id,
  b.id as barn_id,
  b.barn_name,
  b.barn_number,
  pcr.audit_id,
  pdo.record_date,
  pdo.mice_caught,
  pdo.traps_checked,
  pdo.trap_findings_notes,
  pdo.trap_location,
  pdo.bait_product,
  pdo.bait_location,
  pdo.bait_replenished,
  pdo.birds_on_range,
  pdo.corrective_actions,
  pma.exterior_inspection_date,
  pma.exterior_inspection_observation,
  pma.wild_birds_observation,
  pma.fly_monitoring,
  pma.range_grass,
  pma.range_ponding_water,
  pma.range_rotation_harrow,
  pma.range_wild_bird_deterrents,
  pma.range_gravel_fences,
  pma.range_other,
  pma.interior_inspection_date,
  pma.interior_inspection_observation,
  pma.mice_total,
  pma.traps_total,
  pma.days_monitored,
  pma.rodent_index,
  pma.comments,
  pma.signature,
  pma.signature_date
FROM pest_control_records pcr
LEFT JOIN barns b ON pcr.barn_id = b.id
LEFT JOIN pest_daily_observations pdo ON pcr.id = pdo.pest_id
LEFT JOIN pest_monthly_audit pma ON pcr.id = pma.pest_id;

-- =============================================
-- PERMISSIONS FOR AUTHENTICATED USERS
-- =============================================
-- Grant all permissions to the authenticated role so users can access their data

GRANT ALL ON farms TO authenticated;
GRANT ALL ON barns TO authenticated;
GRANT ALL ON monthly_audits TO authenticated;
GRANT ALL ON production_cooler_records TO authenticated;
GRANT ALL ON production_floor_eggs TO authenticated;
GRANT ALL ON production_egg_output TO authenticated;
GRANT ALL ON production_cooler_temps TO authenticated;
GRANT ALL ON production_sanitation TO authenticated;
GRANT ALL ON production_flock_age TO authenticated;
GRANT ALL ON production_thermometer_calibration TO authenticated;
GRANT ALL ON welfare_records TO authenticated;
GRANT ALL ON welfare_daily_checks TO authenticated;
GRANT ALL ON welfare_weekly_inspections TO authenticated;
GRANT ALL ON welfare_ammonia_tests TO authenticated;
GRANT ALL ON feed_water_records TO authenticated;
GRANT ALL ON feed_water_daily TO authenticated;
GRANT ALL ON feed_water_health TO authenticated;
GRANT ALL ON feed_water_monthly_metadata TO authenticated;
GRANT ALL ON pest_control_records TO authenticated;
GRANT ALL ON pest_daily_observations TO authenticated;
GRANT ALL ON pest_monthly_audit TO authenticated;
GRANT ALL ON corrective_action_log TO authenticated;