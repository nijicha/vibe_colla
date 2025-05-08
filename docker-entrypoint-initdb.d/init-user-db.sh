#!/bin/bash
set -e

/opt/homebrew/opt/libpq/bin/psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER freehoot WITH PASSWORD '$POSTGRES_PASSWORD';
	CREATE DATABASE freehoot_development;
	GRANT ALL PRIVILEGES ON DATABASE freehoot_development TO freehoot;
EOSQL
