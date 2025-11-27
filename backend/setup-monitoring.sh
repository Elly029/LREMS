#!/bin/bash

# Setup script for Evaluation Monitoring feature
# This script creates the necessary database collections and indexes

echo "=========================================="
echo "Evaluation Monitoring Setup"
echo "=========================================="
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "❌ Error: MongoDB is not running or not accessible"
    echo "Please start MongoDB and try again"
    exit 1
fi

echo "✓ MongoDB is running"
echo ""

# Run the migration
echo "Running database migration..."
npx ts-node src/database/migrations/create-monitoring-collection.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Start the backend server: npm run dev"
    echo "2. The monitoring API will be available at /api/monitoring"
    echo "3. Check DATABASE_ALIGNMENT.md for API documentation"
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi
