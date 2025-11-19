-- Add business hours setting to restaurant_settings
-- Migration: 027_add_business_hours_setting
-- Created: 2025-01-XX
-- Description: Adds business_hours setting with current opening hours

INSERT INTO restaurant_settings (setting_key, setting_value) 
VALUES (
  'business_hours',
  '{
    "monday": [{"open": "11:00", "close": "00:00"}],
    "tuesday": [{"open": "11:00", "close": "00:00"}],
    "wednesday": [{"open": "11:00", "close": "00:00"}],
    "thursday": [{"open": "11:00", "close": "00:00"}],
    "friday": [{"open": "11:00", "close": "01:00"}],
    "saturday": [{"open": "17:00", "close": "01:00"}],
    "sunday": null
  }'::jsonb
)
ON CONFLICT (setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();













