# Data Maintenance Scripts

This document describes the data maintenance scripts available for the LR-EMS backend to ensure data consistency and integrity.

## Available Scripts

### 1. Cleanup Orphaned Remarks
Removes remarks that reference non-existent book codes.

```bash
npm run cleanup:orphaned
```

### 2. Maintain Data Consistency
Performs comprehensive data consistency checks and cleanup.

```bash
npm run maintain:data
```

## What the Scripts Do

### Cleanup Orphaned Remarks
- Identifies remarks that reference book codes that don't exist
- Safely removes these orphaned remarks
- Reports the number of remarks deleted

### Maintain Data Consistency
- Checks for orphaned remarks and removes them
- Reports statistics on books without remarks
- Checks for duplicate book codes
- Validates all remark references
- Provides a summary of data consistency status

## When to Run These Scripts

1. **After data imports** - Run after importing data from external sources
2. **Periodically** - Schedule weekly or monthly runs to maintain data integrity
3. **After troubleshooting** - Run when investigating data consistency issues
4. **Before backups** - Run before creating database backups to ensure clean data

## Script Output

The scripts provide detailed output showing:
- Connection status
- Data statistics
- Actions performed
- Results summary
- Any issues found

## Error Handling

All scripts include proper error handling and will:
- Log connection errors
- Report processing errors
- Continue execution where possible
- Provide clear error messages for troubleshooting

## Manual Execution

If npm scripts don't work, you can run the scripts directly:

```bash
npx ts-node cleanup_orphaned_remarks.ts
npx ts-node maintain_data_consistency.ts
```