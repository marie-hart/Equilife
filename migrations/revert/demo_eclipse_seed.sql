BEGIN;

DELETE FROM events WHERE name = 'Balade en extérieur' OR description = 'Soin musculaire';
DELETE FROM ration_items WHERE type IN ('Granulés', 'Complément');
DELETE FROM rations WHERE name = 'Ration hiver';
DELETE FROM product_horses WHERE horse_id IN (SELECT id FROM horses WHERE name = 'Eclipse');
DELETE FROM products WHERE note = 'demo_seed';
DELETE FROM horses WHERE name = 'Eclipse';

COMMIT;