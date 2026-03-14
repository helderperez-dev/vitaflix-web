ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS reference_amount DOUBLE PRECISION NOT NULL DEFAULT 100;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'products_reference_amount_positive'
          AND conrelid = 'public.products'::regclass
    ) THEN
        ALTER TABLE public.products
            ADD CONSTRAINT products_reference_amount_positive
            CHECK (reference_amount > 0);
    END IF;
END
$$;
