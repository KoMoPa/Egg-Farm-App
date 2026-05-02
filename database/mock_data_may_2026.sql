-- Mock data for Brewtown farm - May 2026
-- Farmer: KW
-- User: baf7d543-8924-4588-8595-dbd6f4e7d7e0
-- Farm: 849e8e84-239e-433d-bbe3-1f4a6a2f6395
-- Barn: 03e42953-c5c8-455d-821e-f047a36f2c65

-- =====================================================
-- MONTHLY AUDIT
-- =====================================================
INSERT INTO monthly_audits (farm_id, month_year, form_07_completed, form_08_completed, form_09_completed, form_10_completed)
VALUES (
  '849e8e84-239e-433d-bbe3-1f4a6a2f6395',
  '2026-05-01',
  false,
  false,
  false,
  false
);

-- =====================================================
-- FORM 07 - PRODUCTION & COOLER RECORDS
-- =====================================================
INSERT INTO production_cooler_records (barn_id, audit_id)
SELECT 
  '03e42953-c5c8-455d-821e-f047a36f2c65'::uuid,
  id
FROM monthly_audits
WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01';

-- Floor eggs collected (days 1-31)
INSERT INTO production_floor_eggs (production_id, record_date, collection_1, collection_2)
SELECT 
  pcr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  floor(random() * 50 + 100)::integer,
  floor(random() * 50 + 100)::integer
FROM production_cooler_records pcr,
     generate_series(1, 31) as days(d)
WHERE pcr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND pcr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- Flock age (days 1-31) - incrementing from week 52
INSERT INTO production_flock_age (production_id, record_date, flock_age_weeks)
SELECT 
  pcr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  52 + floor((days.d - 1) / 7)::integer
FROM production_cooler_records pcr,
     generate_series(1, 31) as days(d)
WHERE pcr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND pcr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- Daily egg output (days 1-31)
INSERT INTO production_egg_output (production_id, record_date, egg_production_1, egg_production_2, egg_production_daily, egg_production_percent)
SELECT 
  pcr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  floor(random() * 1000 + 9500)::integer,
  floor(random() * 1000 + 9600)::integer,
  CASE days.d
    WHEN 1 THEN 19100 WHEN 2 THEN 19440 WHEN 3 THEN 19800 WHEN 4 THEN 19630
    WHEN 5 THEN 19800 WHEN 6 THEN 19440 WHEN 7 THEN 19000 WHEN 8 THEN 19800
    WHEN 9 THEN 19600 WHEN 10 THEN 19620 WHEN 11 THEN 19420 WHEN 12 THEN 19620
    WHEN 13 THEN 19800 WHEN 14 THEN 19600 WHEN 15 THEN 19600 WHEN 16 THEN 19800
    WHEN 17 THEN 19620 WHEN 18 THEN 19800 WHEN 19 THEN 19000 WHEN 20 THEN 19800
    WHEN 21 THEN 19800 WHEN 22 THEN 19800 WHEN 23 THEN 19800 WHEN 24 THEN 19860
    WHEN 25 THEN 19800 WHEN 26 THEN 19620 WHEN 27 THEN 19800 WHEN 28 THEN 19630
    WHEN 29 THEN 19640 WHEN 30 THEN 19800 WHEN 31 THEN 19600
  END,
  CASE days.d
    WHEN 1 THEN 96.5 WHEN 2 THEN 97.0 WHEN 3 THEN 98.0 WHEN 4 THEN 97.5
    WHEN 5 THEN 98.0 WHEN 6 THEN 97.0 WHEN 7 THEN 96.2 WHEN 8 THEN 98.0
    WHEN 9 THEN 97.6 WHEN 10 THEN 97.8 WHEN 11 THEN 97.2 WHEN 12 THEN 97.8
    WHEN 13 THEN 98.0 WHEN 14 THEN 97.6 WHEN 15 THEN 97.6 WHEN 16 THEN 98.0
    WHEN 17 THEN 97.8 WHEN 18 THEN 98.0 WHEN 19 THEN 96.2 WHEN 20 THEN 98.0
    WHEN 21 THEN 98.0 WHEN 22 THEN 98.0 WHEN 23 THEN 98.0 WHEN 24 THEN 98.2
    WHEN 25 THEN 98.0 WHEN 26 THEN 97.8 WHEN 27 THEN 98.0 WHEN 28 THEN 97.8
    WHEN 29 THEN 97.9 WHEN 30 THEN 98.0 WHEN 31 THEN 97.6
  END
FROM production_cooler_records pcr,
     generate_series(1, 31) as days(d)
WHERE pcr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND pcr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- Cooler temps (days 1-31)
INSERT INTO production_cooler_temps (production_id, record_date, cooler_temp_hi_celsius, cooler_temp_lo_celsius, cooler_rh_hi_percent, cooler_rh_lo_percent)
SELECT 
  pcr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  11,
  CASE WHEN days.d % 3 = 0 THEN 9 ELSE 10 END,
  CASE WHEN days.d % 2 = 0 THEN 66 ELSE 62 END,
  CASE WHEN days.d % 2 = 0 THEN 59 ELSE 56 END
FROM production_cooler_records pcr,
     generate_series(1, 31) as days(d)
WHERE pcr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND pcr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- Sanitation (day 12 only)
INSERT INTO production_sanitation (production_id, record_date, dirty_trays_count, egg_cooler_sanitation_code, pack_room_sanitation_code, equip_sanitation_code)
SELECT 
  pcr.id,
  '2026-05-12'::date,
  0,
  'S',
  'B',
  'W'
FROM production_cooler_records pcr
WHERE pcr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND pcr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- =====================================================
-- FORM 08 - WELFARE RECORDS
-- =====================================================
INSERT INTO welfare_records (barn_id, audit_id, monthly_comments)
SELECT 
  '03e42953-c5c8-455d-821e-f047a36f2c65'::uuid,
  id,
  'All OK'
FROM monthly_audits
WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01';

-- Daily welfare checks (days 1-31)
INSERT INTO welfare_daily_checks (welfare_id, record_date, barn_temp_hi, barn_temp_lo, floor_sanitation_code, walls_sanitation_code, manure_sanitation_code, bedding_notes, chemicals_notes)
SELECT 
  wr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  CASE WHEN days.d % 2 = 0 THEN 21 ELSE 20 END,
  20,
  CASE WHEN days.d % 5 = 0 THEN 'S' ELSE 'C' END,
  'C',
  'C',
  CASE WHEN days.d % 7 = 0 THEN 'Straw added' ELSE null END,
  CASE WHEN days.d IN (12, 19) THEN 'Disinfectant' ELSE null END
FROM welfare_records wr,
     generate_series(1, 31) as days(d)
WHERE wr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND wr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- Weekly welfare inspections (4 dates with all checks true)
INSERT INTO welfare_weekly_inspections (welfare_id, inspection_date, check_overall_appearance, check_general_sound, check_abnormal_behavior, check_disease_illness, check_injured_birds, check_respiratory, check_panting_huddling, check_lameness, check_feather_pecking, check_trapped_birds, check_dead_birds, check_feed_water_available, check_equipment_operating, check_amenities_condition, check_lay_facility, weekly_initials)
SELECT 
  wr.id,
  dates.d,
  true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
  'KW'
FROM welfare_records wr,
     (VALUES ('2026-05-04'::date), ('2026-05-12'::date), ('2026-05-19'::date), ('2026-05-26'::date)) dates(d)
WHERE wr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND wr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- =====================================================
-- FORM 09 - FEED/WATER RECORDS
-- =====================================================
INSERT INTO feed_water_records (barn_id, audit_id)
SELECT 
  '03e42953-c5c8-455d-821e-f047a36f2c65'::uuid,
  id
FROM monthly_audits
WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01';

-- Daily feed/water consumption (days 1-31)
INSERT INTO feed_water_daily (fw_id, record_date, feed_daily, feed_actual, water_daily, water_actual, auger_run_time_minutes)
SELECT 
  fwr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  CASE days.d
    WHEN 1 THEN 49 WHEN 2 THEN 50 WHEN 3 THEN 48 WHEN 4 THEN 51
    WHEN 5 THEN 49 WHEN 6 THEN 50 WHEN 7 THEN 52 WHEN 8 THEN 49
    WHEN 9 THEN 51 WHEN 10 THEN 50 WHEN 11 THEN 48 WHEN 12 THEN 50
    WHEN 13 THEN 49 WHEN 14 THEN 51 WHEN 15 THEN 50 WHEN 16 THEN 49
    WHEN 17 THEN 52 WHEN 18 THEN 50 WHEN 19 THEN 48 WHEN 20 THEN 51
    WHEN 21 THEN 49 WHEN 22 THEN 50 WHEN 23 THEN 50 WHEN 24 THEN 49
    WHEN 25 THEN 51 WHEN 26 THEN 50 WHEN 27 THEN 48 WHEN 28 THEN 49
    WHEN 29 THEN 50 WHEN 30 THEN 51 WHEN 31 THEN 50
  END,
  CASE days.d
    WHEN 1 THEN 49.2 WHEN 2 THEN 50.1 WHEN 3 THEN 48.3 WHEN 4 THEN 51.2
    WHEN 5 THEN 49.1 WHEN 6 THEN 50.2 WHEN 7 THEN 52.1 WHEN 8 THEN 49.3
    WHEN 9 THEN 51.0 WHEN 10 THEN 50.2 WHEN 11 THEN 48.1 WHEN 12 THEN 50.3
    WHEN 13 THEN 49.2 WHEN 14 THEN 51.1 WHEN 15 THEN 50.0 WHEN 16 THEN 49.3
    WHEN 17 THEN 52.0 WHEN 18 THEN 50.1 WHEN 19 THEN 48.2 WHEN 20 THEN 51.3
    WHEN 21 THEN 49.0 WHEN 22 THEN 50.2 WHEN 23 THEN 50.1 WHEN 24 THEN 49.2
    WHEN 25 THEN 51.2 WHEN 26 THEN 50.0 WHEN 27 THEN 48.3 WHEN 28 THEN 49.1
    WHEN 29 THEN 50.2 WHEN 30 THEN 51.1 WHEN 31 THEN 50.0
  END,
  CASE days.d
    WHEN 1 THEN 3200 WHEN 2 THEN 3100 WHEN 3 THEN 2950 WHEN 4 THEN 3300
    WHEN 5 THEN 3150 WHEN 6 THEN 3000 WHEN 7 THEN 3350 WHEN 8 THEN 3100
    WHEN 9 THEN 3250 WHEN 10 THEN 3050 WHEN 11 THEN 2900 WHEN 12 THEN 3200
    WHEN 13 THEN 3100 WHEN 14 THEN 3400 WHEN 15 THEN 3200 WHEN 16 THEN 3050
    WHEN 17 THEN 3300 WHEN 18 THEN 3150 WHEN 19 THEN 3000 WHEN 20 THEN 3350
    WHEN 21 THEN 3100 WHEN 22 THEN 3200 WHEN 23 THEN 3250 WHEN 24 THEN 3000
    WHEN 25 THEN 3150 WHEN 26 THEN 3100 WHEN 27 THEN 2950 WHEN 28 THEN 3300
    WHEN 29 THEN 3200 WHEN 30 THEN 3050 WHEN 31 THEN 3100
  END,
  CASE days.d
    WHEN 1 THEN 3210 WHEN 2 THEN 3120 WHEN 3 THEN 2960 WHEN 4 THEN 3310
    WHEN 5 THEN 3160 WHEN 6 THEN 3010 WHEN 7 THEN 3360 WHEN 8 THEN 3110
    WHEN 9 THEN 3260 WHEN 10 THEN 3060 WHEN 11 THEN 2910 WHEN 12 THEN 3210
    WHEN 13 THEN 3110 WHEN 14 THEN 3410 WHEN 15 THEN 3210 WHEN 16 THEN 3060
    WHEN 17 THEN 3310 WHEN 18 THEN 3160 WHEN 19 THEN 3010 WHEN 20 THEN 3360
    WHEN 21 THEN 3110 WHEN 22 THEN 3210 WHEN 23 THEN 3260 WHEN 24 THEN 3010
    WHEN 25 THEN 3160 WHEN 26 THEN 3110 WHEN 27 THEN 2960 WHEN 28 THEN 3310
    WHEN 29 THEN 3210 WHEN 30 THEN 3060 WHEN 31 THEN 3110
  END,
  CASE days.d
    WHEN 1 THEN 18 WHEN 2 THEN 17 WHEN 3 THEN 16 WHEN 4 THEN 19
    WHEN 5 THEN 17 WHEN 6 THEN 18 WHEN 7 THEN 20 WHEN 8 THEN 17
    WHEN 9 THEN 19 WHEN 10 THEN 16 WHEN 11 THEN 17 WHEN 12 THEN 18
    WHEN 13 THEN 17 WHEN 14 THEN 19 WHEN 15 THEN 18 WHEN 16 THEN 17
    WHEN 17 THEN 20 WHEN 18 THEN 18 WHEN 19 THEN 16 WHEN 20 THEN 19
    WHEN 21 THEN 17 WHEN 22 THEN 18 WHEN 23 THEN 18 WHEN 24 THEN 16
    WHEN 25 THEN 17 WHEN 26 THEN 18 WHEN 27 THEN 16 WHEN 28 THEN 19
    WHEN 29 THEN 18 WHEN 30 THEN 17 WHEN 31 THEN 18
  END
FROM feed_water_records fwr,
     generate_series(1, 31) as days(d)
WHERE fwr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND fwr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- Daily mortality records (separate table)
INSERT INTO feed_water_health (fw_id, record_date, mortality_daily)
SELECT 
  fwr.id,
  '2026-05-01'::date + (days.d - 1)::integer,
  CASE days.d
    WHEN 1 THEN 1 WHEN 2 THEN 0 WHEN 3 THEN 1 WHEN 4 THEN 0
    WHEN 5 THEN 1 WHEN 6 THEN 0 WHEN 7 THEN 2 WHEN 8 THEN 0
    WHEN 9 THEN 1 WHEN 10 THEN 0 WHEN 11 THEN 1 WHEN 12 THEN 0
    WHEN 13 THEN 0 WHEN 14 THEN 1 WHEN 15 THEN 0 WHEN 16 THEN 1
    WHEN 17 THEN 0 WHEN 18 THEN 1 WHEN 19 THEN 0 WHEN 20 THEN 2
    WHEN 21 THEN 0 WHEN 22 THEN 1 WHEN 23 THEN 0 WHEN 24 THEN 1
    WHEN 25 THEN 0 WHEN 26 THEN 1 WHEN 27 THEN 0 WHEN 28 THEN 1
    WHEN 29 THEN 0 WHEN 30 THEN 1 WHEN 31 THEN 0
  END
FROM feed_water_records fwr,
     generate_series(1, 31) as days(d)
WHERE fwr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND fwr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');

-- =====================================================
-- FORM 10 - PEST CONTROL RECORDS
-- =====================================================
INSERT INTO pest_control_records (barn_id, audit_id)
SELECT 
  '03e42953-c5c8-455d-821e-f047a36f2c65'::uuid,
  id
FROM monthly_audits
WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01';

-- Minimal pest observations (4 weekly checks)
INSERT INTO pest_daily_observations (pest_id, record_date, traps_checked, trap_findings_notes, birds_on_range)
SELECT 
  pcr.id,
  dates.d,
  2,
  'None observed',
  'No'
FROM pest_control_records pcr,
     (VALUES ('2026-05-07'::date), ('2026-05-14'::date), ('2026-05-21'::date), ('2026-05-28'::date)) dates(d)
WHERE pcr.barn_id = '03e42953-c5c8-455d-821e-f047a36f2c65'
  AND pcr.audit_id = (SELECT id FROM monthly_audits WHERE farm_id = '849e8e84-239e-433d-bbe3-1f4a6a2f6395' AND month_year = '2026-05-01');
