# ET_GenAi

Minimal production pipeline for stock signal analysis and decision output.

## Architecture

- M1: data loading via `load_parsed_data(date)`
- M2: signal computation via `compute_signals(parsed_data)`
- M3: decision generation via `generate_decision(signals)`

## Run

Use parsed input from `data/parsed/YYYY-MM-DD.json`.

```bash
python main.py
```

Optional explicit date:

```bash
python main.py 2026-03-27
```

## Output Contract

`main.py` prints JSON with these API fields:

- `decision`
- `confidence`
- `why_now`
- `risks`
- `signals`

## Notes

- No Metaflow dependency.
- Path handling uses OS-safe path joins.
