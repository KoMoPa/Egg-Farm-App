-- Farms table
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_name TEXT NOT NULL,
  barn_number TEXT,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Production & Cooler Records (Page 1 of Form 7)
CREATE TABLE production_cooler_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id),
  barn_number TEXT,
  month_year DATE,
  date INTEGER CHECK (date >= 1 AND date <= 31),
  
  flock_age_weeks INTEGER,
  
  floor_eggs_collection_1 INTEGER,
  floor_eggs_collection_2 INTEGER,
  floor_eggs_total INTEGER,
  
  egg_production_1 INTEGER,
  egg_production_2 INTEGER,
  egg_production_daily INTEGER,
  egg_production_percent DECIMAL(5,2),
  
  cooler_temp_hi_celsius DECIMAL(4,1),
  cooler_temp_lo_celsius DECIMAL(4,1),
  cooler_rh_hi_percent DECIMAL(4,1),
  cooler_rh_lo_percent DECIMAL(4,1),
  cooler_check_time TIME,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sanitation Records (Page 2 of Form 7)
CREATE TABLE sanitation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES farms(id),
  barn_number TEXT,
  month_year DATE,
  date INTEGER CHECK (date >= 1 AND date <= 31),
  
  dirty_trays_count INTEGER,
  egg_cooler_cleaned BOOLEAN DEFAULT false,
  pack_room_cleaned BOOLEAN DEFAULT false,
  tables_packing_equip_cleaned BOOLEAN DEFAULT false,
  corrective_actions TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_production_farm_month ON production_cooler_records(farm_id, month_year);
CREATE INDEX idx_sanitation_farm_month ON sanitation_records(farm_id, month_year);

-- TABLE 1: Daily Welfare Records (Page 1 data)
CREATE TABLE welfare_daily_records (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  farm_id UUID NOT NULL,
  barn_number TEXT NOT NULL,
  month_year TEXT NOT NULL,
  date INT NOT NULL,
  
  -- Barn Temperature
  barn_temp_hi DECIMAL(5,2),
  barn_temp_lo DECIMAL(5,2),
  exterior_temp DECIMAL(5,2),
  
  -- Sanitation Checks (checkboxes)
  floors_checked BOOLEAN DEFAULT FALSE,
  walls_fans_ceiling_checked BOOLEAN DEFAULT FALSE,
  manure_checked BOOLEAN DEFAULT FALSE,
  
  -- Materials
  bedding_used TEXT,
  chemicals_used TEXT,
  
  -- Ammonia Level
  ammonia_level TEXT
);

-- TABLE 2: Equipment Inspection Records (Page 2 data)
CREATE TABLE welfare_equipment_inspection (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  farm_id UUID NOT NULL,
  barn_number TEXT NOT NULL,
  month_year TEXT NOT NULL,
  date INT NOT NULL,
  
  -- Routine Hen/Equipment Inspection (1st/2nd with Initial/Daily)
  routine_hen_equip_1st_initial TEXT,
  routine_hen_equip_1st_daily TEXT,
  routine_hen_equip_2nd_initial TEXT,
  routine_hen_equip_2nd_daily TEXT,
  
  -- Inspection Criteria (all checkboxes)
  overall_appearance BOOLEAN DEFAULT FALSE,
  general_sound BOOLEAN DEFAULT FALSE,
  abnormal_behavior BOOLEAN DEFAULT FALSE,
  signs_of_disease BOOLEAN DEFAULT FALSE,
  injured_birds BOOLEAN DEFAULT FALSE,
  trapped_birds BOOLEAN DEFAULT FALSE,
  dead_birds BOOLEAN DEFAULT FALSE,
  feed_water_available BOOLEAN DEFAULT FALSE,
  equipment_operating BOOLEAN DEFAULT FALSE,
  amenities_condition BOOLEAN DEFAULT FALSE,
  lay_facility_environment BOOLEAN DEFAULT FALSE
);

-- TABLE 3: Form Metadata (Signature, checks, comments)
CREATE TABLE welfare_form_metadata (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  farm_id UUID NOT NULL,
  barn_number TEXT NOT NULL,
  month_year TEXT NOT NULL,
  
  -- Checks
  alarm_check_date TEXT,
  alarm_check_initials TEXT,
  generator_check_date TEXT,
  generator_check_initials TEXT,
  
  -- Comments
  comments_page_1 TEXT,
  comments_page_2 TEXT,
  
  -- Signature
  signature_date TEXT
);