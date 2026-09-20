# Kaggle Usability 10/10 Gate

Target dataset: `senihbayankulu/izmir-public-services-open-data`

## Completeness
- [x] Title
- [x] Subtitle
- [x] Long-form description
- [x] Tags/keywords declared in dataset metadata
- [ ] Cover image selected in Kaggle UI (use repository `social-card.png` or a 1900×400 derivative)

## Credibility
- [x] Source/provenance documented
- [x] Official publisher + dataset URLs documented
- [x] CC BY 4.0 attribution documented
- [x] Validation report included
- [ ] Public starter Notebook pushed to Kaggle
- [ ] Expected update frequency set in Kaggle UI

## Compatibility
- [x] CC-BY-4.0 license declared in `dataset-metadata.json`
- [x] CSV as primary tabular format
- [x] File descriptions declared for primary resources
- [x] Data dictionary included
- [ ] Verify Kaggle has ingested file descriptions
- [ ] Add/verify column descriptions on the primary combined CSV in Kaggle UI

## Quality gates already passing
- 4,840 rows in the current snapshot
- 4,840 unique IDs
- invalid coordinates = 0
- missing names = 0
- one license value: CC BY 4.0
- five service categories present

## Publication order
1. Create public dataset from `kaggle/`.
2. Verify title/subtitle/license/tags/description.
3. Set cover image.
4. Set expected update frequency.
5. Add/verify file descriptions.
6. Add/verify column descriptions for `izmir_public_services_combined.csv`.
7. Push and run `kaggle-notebook/` as a public Notebook.
8. Re-check Usability score; patch only the missing rubric field(s).
9. Do not create an AI-written Kaggle Discussion post. Obtain an original author-written core note first, then only proofread/translate it.
