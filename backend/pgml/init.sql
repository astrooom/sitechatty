ALTER ROLE postgres SET search_path TO public,pgml;

CREATE EXTENSION IF NOT EXISTS pgml;