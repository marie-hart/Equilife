-- Vérifie l'existence de la table documents
SELECT 1
FROM information_schema.tables
WHERE table_name = 'documents';

-- Vérifie la contrainte de tag
SELECT 1
FROM information_schema.table_constraints
WHERE table_name = 'documents' AND constraint_name = 'documents_tag_check';
