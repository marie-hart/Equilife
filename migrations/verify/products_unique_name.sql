SELECT 1
FROM pg_indexes
WHERE tablename = 'products' AND indexname = 'products_name_unique';
