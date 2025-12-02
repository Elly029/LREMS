# Analytics Reporting Specification

## Status Categories
- For Evaluation
- For Revision
- For ROR
- For Finalization
- For FRR and Signing Off
- Final Revised copy
- NOT FOUND
- RETURNED
- DQ/FOR RETURN
- In Progress
- RTP (Ready To Process)

## Inclusion Rules
- All dashboards, charts, and exports must include RTP alongside existing statuses.
- Filters must allow selecting RTP individually and in multi-select combinations.
- Historical data remains unchanged; new analytics include RTP only where present in source records.

## Visualization
- Color mapping for RTP: Lime `#A3E635`.
- Legends and stacked bars must display RTP with the specified color.

## Data Sources
- Backend `GET /api/books` returns `filters.availableStatuses` including RTP when present.
- Frontend analytics components consume `availableStatuses` or derive statuses from dataset.

## Exports
- Excel and PDF exports include status values verbatim; RTP appears when present in records.

## Backward Compatibility
- Existing statuses remain valid and unaffected.
- Analytics gracefully handle datasets without RTP.
