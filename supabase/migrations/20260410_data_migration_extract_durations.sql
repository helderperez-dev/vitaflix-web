-- Migration: Extract durations from preparation_mode text and set duration_seconds
-- Description: This script parses 'preparation_mode' in the 'meals' table, identifies time patterns like "8 a 10 min", 
-- and adds a structured 'duration_seconds' field to the JSONB array.
-- This supports the interactive cooking timeline in the mobile application.

DO $$
DECLARE
    meal_record RECORD;
    step_record JSONB;
    new_preparation_mode JSONB;
    extracted_seconds NUMERIC;
    step_text TEXT;
    lang_key TEXT;
    match_result TEXT[];
BEGIN
    FOR meal_record IN SELECT id, preparation_mode FROM meals WHERE preparation_mode IS NOT NULL AND jsonb_array_length(preparation_mode) > 0 LOOP
        new_preparation_mode := '[]'::jsonb;
        
        FOR step_record IN SELECT * FROM jsonb_array_elements(meal_record.preparation_mode) LOOP
            extracted_seconds := NULL;
            
            -- 1. If duration_seconds is missing but duration_minutes exists, convert it
            IF NOT (step_record ? 'duration_seconds') AND (step_record ? 'duration_minutes') THEN
                extracted_seconds := (step_record->>'duration_minutes')::numeric * 60;
                step_record := step_record - 'duration_minutes' || jsonb_build_object('duration_seconds', extracted_seconds);
            END IF;

            -- 2. If duration_seconds is still missing, try to extract from text
            IF NOT (step_record ? 'duration_seconds') OR (step_record->>'duration_seconds' IS NULL) THEN
                -- Check if text is a map (localized) or a string (legacy)
                IF jsonb_typeof(step_record->'text') = 'object' THEN
                    FOR lang_key, step_text IN SELECT * FROM jsonb_each_text(step_record->'text') LOOP
                        -- Match range (e.g., "8 a 10 min", "8-10 minutes", "1 to 2 hours")
                        match_result := regexp_match(step_text, '(\d+(?:[.,]\d+)?)\s*(?:a|-|–|to)\s*(\d+(?:[.,]\d+)?)\s*(min|minutos?|minutes?|seg|segundos?|seconds?|h|horas?|hours?)', 'i');
                        IF match_result IS NOT NULL THEN
                            extracted_seconds := match_result[2]::numeric;
                            CASE 
                                WHEN match_result[3] ~* '^h' THEN extracted_seconds := extracted_seconds * 3600;
                                WHEN match_result[3] ~* '^min' THEN extracted_seconds := extracted_seconds * 60;
                                ELSE extracted_seconds := extracted_seconds; -- seconds
                            END CASE;
                            EXIT; -- Found a match, stop checking other languages for this step
                        END IF;
                        
                        -- Match single number (e.g., "5 min", "10 seconds", "1 hour")
                        match_result := regexp_match(step_text, '(\d+(?:[.,]\d+)?)\s*(min|minutos?|minutes?|seg|segundos?|seconds?|h|horas?|hours?)', 'i');
                        IF match_result IS NOT NULL THEN
                            extracted_seconds := match_result[1]::numeric;
                            CASE 
                                WHEN match_result[2] ~* '^h' THEN extracted_seconds := extracted_seconds * 3600;
                                WHEN match_result[2] ~* '^min' THEN extracted_seconds := extracted_seconds * 60;
                                ELSE extracted_seconds := extracted_seconds; -- seconds
                            END CASE;
                            EXIT;
                        END IF;
                    END LOOP;
                ELSIF jsonb_typeof(step_record->'text') = 'string' THEN
                    step_text := step_record->>'text';
                    -- Match range
                    match_result := regexp_match(step_text, '(\d+(?:[.,]\d+)?)\s*(?:a|-|–|to)\s*(\d+(?:[.,]\d+)?)\s*(min|minutos?|minutes?|seg|segundos?|seconds?|h|horas?|hours?)', 'i');
                    IF match_result IS NOT NULL THEN
                        extracted_seconds := match_result[2]::numeric;
                        CASE 
                            WHEN match_result[3] ~* '^h' THEN extracted_seconds := extracted_seconds * 3600;
                            WHEN match_result[3] ~* '^min' THEN extracted_seconds := extracted_seconds * 60;
                            ELSE extracted_seconds := extracted_seconds;
                        END CASE;
                    ELSE
                        -- Match single number
                        match_result := regexp_match(step_text, '(\d+(?:[.,]\d+)?)\s*(min|minutos?|minutes?|seg|segundos?|seconds?|h|horas?|hours?)', 'i');
                        IF match_result IS NOT NULL THEN
                            extracted_seconds := match_result[1]::numeric;
                            CASE 
                                WHEN match_result[2] ~* '^h' THEN extracted_seconds := extracted_seconds * 3600;
                                WHEN match_result[2] ~* '^min' THEN extracted_seconds := extracted_seconds * 60;
                                ELSE extracted_seconds := extracted_seconds;
                            END CASE;
                        END IF;
                    END IF;
                END IF;
                
                -- Update step if extraction was successful
                IF extracted_seconds IS NOT NULL THEN
                    step_record := step_record || jsonb_build_object('duration_seconds', extracted_seconds);
                END IF;
            END IF;
            
            new_preparation_mode := new_preparation_mode || step_record;
        END LOOP;
        
        -- Apply the updated JSONB array back to the table
        UPDATE meals SET preparation_mode = new_preparation_mode WHERE id = meal_record.id;
    END LOOP;
END $$;
