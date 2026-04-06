# Solution + Grading Design (Blueprint Only)

## Goal
Generate each test together with a machine-readable answer key and a grading log model, so that uploading a completed student workbook returns a percentage score and detailed feedback.

## Proposed Artifacts per Generated Test
For each generated test `YYYYMMDD-HHMMSS-<profile>` create:

1. `... .md`  
Test statement shown to the student.

2. `... .pdf`  
Formatted statement.

3. `... .xlsx`  
Student template (input data prefilled if needed, output cells highlighted in yellow).

4. `... .solution.json`  
Canonical answer key and grading rubric.

5. `... .grading-log.json` (created after student submission)  
Detailed comparison between expected and submitted results.

## `.solution.json` Schema (Draft)
```json
{
  "test_id": "20260406-091051-prova1",
  "profile": "prova1",
  "theme": "iot failure frequency",
  "version": 1,
  "output_cells": [
    {
      "cell": "F1",
      "kind": "numeric",
      "label": "sample_mean",
      "expected_formula": "=AVERAGE(A2:A121)",
      "expected_value": 3.42,
      "tolerance_abs": 0.01,
      "weight": 6
    },
    {
      "cell": "F2",
      "kind": "text",
      "label": "mean_interpretation",
      "expected_keywords": ["average", "failures", "device"],
      "min_keywords_match": 2,
      "weight": 4
    }
  ],
  "range_outputs": [
    {
      "range": "H20:J25",
      "kind": "table",
      "validation": "shape+monotonicity+sum_constraints",
      "weight": 15
    }
  ],
  "chart_checks": [
    {
      "anchor": "E20",
      "expected_chart_type": "column",
      "expected_series_ranges": ["A2:A121", "B2:B121"],
      "weight": 10
    }
  ],
  "max_score": 100
}
```

## Grading Flow (Future)
1. User uploads solved `.xlsx`.
2. Backend loads matching `.solution.json`.
3. Evaluate each target:
   - numeric cells (value and optional formula checks),
   - text cells (keyword/semantic checks),
   - ranges/tables (shape + consistency checks),
   - charts (best-effort checks, see below).
4. Compute weighted score:
   - `score_percent = obtained_points / max_score * 100`.
5. Emit `... .grading-log.json` and return summary to UI.

## `.grading-log.json` Schema (Draft)
```json
{
  "test_id": "20260406-091051-prova1",
  "student_file": "student_submission.xlsx",
  "graded_at": "2026-04-06T10:00:00Z",
  "score_percent": 84.0,
  "obtained_points": 84,
  "max_score": 100,
  "items": [
    {
      "target": "F1",
      "kind": "numeric",
      "expected": 3.42,
      "actual": 3.40,
      "pass": true,
      "points_awarded": 6,
      "points_max": 6,
      "note": "Within tolerance ±0.01"
    },
    {
      "target": "F2",
      "kind": "text",
      "pass": false,
      "points_awarded": 1,
      "points_max": 4,
      "note": "Only 1 required keyword matched"
    }
  ]
}
```

## Chart Evaluation: Is It Feasible?
Short answer: **partially yes**, but reliability depends on method.

### Option A (Recommended practical baseline)
Validate chart indirectly through:
- correct source data ranges,
- required computed series existing in workbook,
- optional metadata entry (e.g., a hidden sheet with expected chart anchors/types).

Pros: robust and easy to maintain.  
Cons: does not guarantee exact visual style.

### Option B (OOXML chart parsing)
Read chart XML inside `.xlsx` (unzipped package) and validate:
- chart type,
- series formulas,
- axis ranges.

Pros: objective structural validation of charts.  
Cons: more complex parser, format edge cases.

### Option C (Image comparison)
Render chart images and compare visually.

Pros: closest to visual grading.  
Cons: brittle, expensive, high false positives. Not recommended as primary grading method.

## Recommended Roadmap
1. Implement numeric/text/range grading first (high value, low risk).
2. Add Option B chart checks for structure.
3. Keep visual chart checks optional and low weight.

