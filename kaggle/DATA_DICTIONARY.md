# Data Dictionary

Primary file: `izmir_public_services_combined.csv`.

| Column | Meaning |
|---|---|
| record_id | Deterministic normalized identifier for this snapshot |
| service_type | Machine-readable category |
| service_type_label | Human-readable category |
| name | Official source facility/service name |
| latitude / longitude | Coordinates used for mapping |
| district / neighborhood | Administrative fields when available |
| address | Official source address when available |
| phone | Official source phone when available |
| detail | Official descriptive text when available |
| observed_at | Explicit source observation time when supplied |
| retrieved_at | UTC snapshot retrieval timestamp |
| coverage_status | Mappable-row coverage result |
| source_transport | Retrieval path used for this normalized snapshot |
| source_dataset | Official dataset label |
| source_dataset_url | Official İzmir Open Data page |
| source_license | CC BY 4.0 |
| source_attribution | Publisher attribution |

## Limitations
- Point-in-time snapshot; not a claim of permanent service presence or absence.
- Missing source data does not imply zero service.
- Straight-line proximity is not travel time or routing.
- Duty-pharmacy records are time-sensitive.
- No user location or other personal user data is included.
