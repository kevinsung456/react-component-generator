# JSON Schemas

This document defines the JSON schemas used by skill-creator.

---

## evals.json

Defines the evals for a skill. Located at `evals/evals.json` within the skill directory.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's example prompt",
      "expected_output": "Description of expected result",
      "files": ["evals/files/sample1.pdf"],
      "expectations": [
        "The output includes X",
        "The skill used script Y"
      ]
    }
  ]
}
```

---

## grading.json

Output from the grader agent. Located at `<run-dir>/grading.json`.

```json
{
  "expectations": [
    {
      "text": "The output includes the name 'John Smith'",
      "passed": true,
      "evidence": "Found in transcript Step 3: 'Extracted names: John Smith, Sarah Johnson'"
    }
  ],
  "summary": {
    "passed": 2,
    "failed": 1,
    "total": 3,
    "pass_rate": 0.67
  },
  "claims": [],
  "eval_feedback": {
    "suggestions": [],
    "overall": "No suggestions, evals look solid"
  }
}
```

**Important:** The `expectations` array must use fields `text`, `passed`, and `evidence` — not `name`/`met`/`details`. The viewer depends on these exact field names.

---

## benchmark.json

Output from benchmarking. Located at `<workspace>/iteration-N/benchmark.json`.

```json
{
  "metadata": {
    "skill_name": "pdf",
    "timestamp": "2026-01-15T10:30:00Z",
    "evals_run": [1, 2, 3],
    "runs_per_configuration": 3
  },
  "runs": [
    {
      "eval_id": 1,
      "eval_name": "Ocean",
      "configuration": "with_skill",
      "run_number": 1,
      "result": {
        "pass_rate": 0.85,
        "passed": 6,
        "failed": 1,
        "total": 7,
        "time_seconds": 42.5,
        "tokens": 3800
      }
    }
  ],
  "run_summary": {
    "with_skill": {
      "pass_rate": {"mean": 0.85, "stddev": 0.05},
      "time_seconds": {"mean": 45.0, "stddev": 12.0},
      "tokens": {"mean": 3800, "stddev": 400}
    },
    "without_skill": {
      "pass_rate": {"mean": 0.35, "stddev": 0.08},
      "time_seconds": {"mean": 32.0, "stddev": 8.0},
      "tokens": {"mean": 2100, "stddev": 300}
    },
    "delta": {
      "pass_rate": "+0.50",
      "time_seconds": "+13.0",
      "tokens": "+1700"
    }
  },
  "notes": []
}
```

**Important:** The viewer reads `configuration` (must be exactly `"with_skill"` or `"without_skill"`), and `result.pass_rate` (nested under `result`, not top-level). Using wrong field names causes empty/zero values in the viewer.

---

## timing.json

Wall clock timing for a run. Located at `<run-dir>/timing.json`.

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

**How to capture:** When a subagent task completes, the task notification includes `total_tokens` and `duration_ms`. Save these immediately — they are not persisted anywhere else.
