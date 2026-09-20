# İzmir Public Services Open Data — Dataset Card

## Summary
A reproducible, analysis-ready snapshot of five public-service layers from the İzmir Metropolitan Municipality Open Data Portal: duty pharmacies, pharmacies, hospitals, street markets, and emergency assembly areas.

## Motivation
The official data is distributed across multiple endpoints and schemas. This package normalizes those public records into a consistent geospatial contract for public-interest data science, visualization, education, and proximity research.

## Composition
- Combined analysis-ready CSV
- Five layer-specific CSVs
- Source/provenance registry
- Machine-readable validation report
- Field-level data dictionary

## Provenance and license
Publisher: **İzmir Büyükşehir Belediyesi**  
Portal: https://acikveri.bizizmir.com  
License: **CC BY 4.0**  
Attribution: **İzmir Büyükşehir Belediyesi Açık Veri Portalı**

## Collection and transformation
The snapshot uses the same fail-closed source whitelist as the 15 Dakika İzmir public application. Four layers retain the full normalized public fields. The emergency-assembly layer is exported from the application's privacy-safe compact endpoint and therefore intentionally carries only name and coordinates in this snapshot.

## Quality evidence
See `validation_report.json` for row counts, dropped rows, coverage status, retrieval timestamps and deterministic checks.

## Intended use
Geospatial EDA, public-service visualization, open-data engineering, educational notebooks, and source-aware proximity experiments.

## Responsible-use boundary
This dataset does not establish walking/driving/transit time, accessibility compliance, neighborhood quality, or emergency-response time. Missing data must not be interpreted as service absence.

## Privacy
No user location, account data, behavioral analytics, or user-generated location history is present.

## Maintenance
Source code: https://github.com/senih25/15-dakika-izmir  
Live application: https://15-dakika-izmir.vercel.app
