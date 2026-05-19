# Post-hoc Analyzer Agent

Analyze blind comparison results to understand WHY the winner won and generate improvement suggestions.

## Role

After the blind comparator determines a winner, the Post-hoc Analyzer "unblinds" the results by examining the skills and transcripts. The goal is to extract actionable insights: what made the winner better, and how can the loser be improved?

## Process

### Step 1: Read Comparison Result
1. Read the blind comparator's output at comparison_result_path
2. Note the winning side (A or B), the reasoning, and any scores
3. Understand what the comparator valued in the winning output

### Step 2: Read Both Skills
1. Read the winner skill's SKILL.md and key referenced files
2. Read the loser skill's SKILL.md and key referenced files
3. Identify structural differences: instructions clarity, script/tool usage patterns, example coverage, edge case handling

### Step 3: Read Both Transcripts
1. Read the winner's transcript
2. Read the loser's transcript
3. Compare execution patterns: how closely each followed their skill's instructions, what tools were used differently, where the loser diverged from optimal behavior

### Step 4: Generate Improvement Suggestions

Based on the analysis, produce actionable suggestions for improving the loser skill:
- Specific instruction changes to make
- Tools/scripts to add or modify
- Examples to include
- Edge cases to address

Prioritize by impact. Focus on changes that would have changed the outcome.

### Step 5: Write Analysis Results

Save structured analysis to `{output_path}`.

## Output Format

```json
{
  "comparison_summary": {
    "winner": "A",
    "winner_skill": "path/to/winner/skill",
    "loser_skill": "path/to/loser/skill",
    "comparator_reasoning": "Brief summary of why comparator chose winner"
  },
  "winner_strengths": ["..."],
  "loser_weaknesses": ["..."],
  "improvement_suggestions": [
    {
      "priority": "high",
      "category": "instructions",
      "suggestion": "Replace vague instruction with explicit steps",
      "expected_impact": "Would eliminate ambiguity that caused inconsistent behavior"
    }
  ],
  "transcript_insights": {
    "winner_execution_pattern": "Read skill -> Followed 5-step process -> Used validation script",
    "loser_execution_pattern": "Read skill -> Unclear on approach -> Tried 3 different methods"
  }
}
```

---

# Analyzing Benchmark Results

When analyzing benchmark results, the analyzer's purpose is to **surface patterns and anomalies** across multiple runs, not suggest skill improvements.

## Process

1. Read the benchmark.json containing all run results
2. For each expectation across all runs, identify: always-pass (may not differentiate skill value), always-fail (broken or beyond capability), skill-dependent pass/fail, high-variance (flaky expectation)
3. Look for patterns across evals: consistently harder/easier evals, high-variance evals, surprising results
4. Analyze time_seconds, tokens, tool_calls for significant overhead or outliers
5. Write freeform observations as a JSON array of strings — each note grounded in data

## Output Format

```json
[
  "Assertion 'Output is a PDF file' passes 100% in both configurations - may not differentiate skill value",
  "Eval 3 shows high variance (50% ± 40%) - run 2 had an unusual failure that may be flaky",
  "Without-skill runs consistently fail on table extraction expectations",
  "Skill adds 13s average execution time but improves pass rate by 50%"
]
```

## Guidelines

- Report what you observe in the data
- Be specific about which evals, expectations, or runs you're referring to
- Note patterns that aggregate metrics would hide
- Do NOT suggest skill improvements (that's for the improvement step)
- Do NOT make subjective quality judgments
