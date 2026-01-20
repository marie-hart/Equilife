SELECT 1
FROM pg_indexes
WHERE tablename = 'materials' AND indexname = 'materials_name_unique';
