#!/bin/bash

# Check if a migration name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <migration_name>"
  exit 1
fi

MIGRATION_NAME=$1
APPLY_FLAG=$2

# Generate the migration
echo "Generating migration: $MIGRATION_NAME"
npx prisma migrate dev --create-only --name "$MIGRATION_NAME"

# Check if the migration was created successfully before proceeding
if [ $? -ne 0 ]; then
  echo "Prisma migrate command failed. Aborting."
  exit 1
fi

# Get the latest migration directory
LATEST_MIGRATION=$(ls -d prisma/migrations/*/ | tail -n 1)

if [ -z "$LATEST_MIGRATION" ]; then
    echo "Could not find the latest migration directory."
    exit 1
fi

echo "Latest migration directory: $LATEST_MIGRATION"

# Generate the down script
echo "Generating down migration script..."
# `migrate dev --create-only` applies previous migrations but NOT the new one,
# so the live database reflects the state *before* this migration. Diffing the
# new schema against the live datasource yields the rollback (down) script
# without needing a shadow database.
npx prisma migrate diff \
  --from-schema prisma/schema.prisma \
  --to-config-datasource \
  --script > "${LATEST_MIGRATION}down.sql"

if [ $? -eq 0 ]; then
  echo "Down migration script created successfully at ${LATEST_MIGRATION}down.sql"
else
  echo "Failed to create down migration script."
  exit 1
fi

if [ "$APPLY_FLAG" == "--apply" ]; then
  echo "Applying migration: $MIGRATION_NAME"
  npx prisma migrate dev

  if [ $? -ne 0 ]; then
    echo "Prisma migrate command failed. Aborting."
    exit 1
  fi
fi

echo "Migration process completed."
