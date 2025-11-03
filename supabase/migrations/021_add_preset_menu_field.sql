-- Migration: Add preset_menu field to booking_requests
-- Created: 2025-01-27
-- Description: Adds preset_menu field to track which predefined menu was selected

ALTER TABLE booking_requests 
ADD COLUMN IF NOT EXISTS preset_menu TEXT CHECK (preset_menu IN ('menu_1', 'menu_2', 'menu_3') OR preset_menu IS NULL);

COMMENT ON COLUMN booking_requests.preset_menu IS 'Menu predefinito selezionato dall admin: menu_1, menu_2, o menu_3';



