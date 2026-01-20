-- Ajout des champs pour les soins et la récurrence en jours
ALTER TABLE events
  ADD COLUMN is_care BOOLEAN DEFAULT false,
  ADD COLUMN reminder_interval_days INTEGER;
