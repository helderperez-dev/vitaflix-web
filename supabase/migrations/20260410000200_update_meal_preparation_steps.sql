-- Migration: Update meal preparation steps to support optional duration
-- Description: This migration documents the new JSONB structure for 'preparation_mode' in the 'meals' table.
-- The mobile app now supports an interactive timeline with optional timers for each step.

/*
  NEW JSONB STRUCTURE FOR 'preparation_mode':
  The column is an array of objects. Each object can now optionally include 'duration_minutes'.

  Example:
  [
    {
      "text": {
        "en": "Boil the pasta in salted water.",
        "pt": "Coza a massa em água a ferver com sal."
      },
      "duration_minutes": 10
    },
    {
      "text": {
        "en": "Sear the shrimp in a pan with garlic.",
        "pt": "Sela o camarão numa frigideira com alho."
      },
      "duration_minutes": 3
    }
  ]

  LEGACY SUPPORT:
  The application still supports the previous structures:
  1. Array of strings/maps: [{"pt": "..."}, {"pt": "..."}]
  2. Single string/map: {"pt": "..."}
*/

-- Example SQL to update a meal with durations:
-- UPDATE public.meals
-- SET preparation_mode = jsonb_build_array(
--   jsonb_build_object(
--     'text', jsonb_build_object('pt', 'Coza a massa em água a ferver com sal.'),
--     'duration_minutes', 10
--   ),
--   jsonb_build_object(
--     'text', jsonb_build_object('pt', 'Sela o camarão numa frigideira com alho.'),
--     'duration_minutes', 3
--   )
-- )
-- WHERE id = 'YOUR_MEAL_ID';

-- Note: No DDL (Data Definition Language) changes are required because 'preparation_mode' 
-- is already a JSONB column. This file is for documentation and data migration purposes.
