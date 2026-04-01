# Snapshot de cobertura (baseline)

Generado como parte del plan de alineación backend/frontend. **No sustituye** los reportes locales: vuelve a ejecutar los comandos tras cambios grandes.

## Comandos

**Backend** (desde `backend/`, con venv activo):

```bash
source venv/bin/activate
pytest --cov=base_feature_app --cov-report=json:coverage-python.json -q --tb=no
```

**Frontend**:

```bash
cd frontend && npm run test:coverage
```

## Backend — resumen global (última generación: `coverage-python.json`)

| Métrica | Valor |
|--------|--------|
| Líneas cubiertas | 7324 / 7541 |
| Cobertura aprox. | **97.1%** |

## Backend — priorización (peores archivos bajo `base_feature_app/`)

Orden: menor % de líneas cubiertas, luego más líneas sin cubrir.

| % cub. | Miss | Statements | Archivo |
|--------|------|------------|---------|
| 38.6 | 27 | 44 | `base_feature_app/tests/helpers.py` |
| 55.3 | 21 | 47 | `base_feature_app/utils/email_utils.py` |
| 72.7 | 3 | 11 | `base_feature_app/views/volunteer_position.py` |
| 75.0 | 3 | 12 | `base_feature_app/serializers/update_post_create_update.py` |
| 78.8 | 7 | 33 | `base_feature_app/models/strategic_ally.py` |
| 79.2 | 5 | 24 | `base_feature_app/services/notification_service.py` |
| 83.3 | 3 | 18 | `base_feature_app/serializers/contact.py` |
| 85.7 | 2 | 14 | `base_feature_app/services/email_service.py` |
| 87.7 | 15 | 122 | `base_feature_app/signals.py` |
| 88.0 | 18 | 150 | `base_feature_app/views/blog.py` |

Para regenerar la tabla:

```bash
cd backend && source venv/bin/activate && python3 << 'PY'
import json
from pathlib import Path
data = json.loads(Path("coverage-python.json").read_text())
rows = []
for path, info in data.get("files", {}).items():
    if "base_feature_app" not in path.replace("\\", "/"):
        continue
    s = info.get("summary", {})
    n, c = s.get("num_statements", 0), s.get("covered_lines", 0)
    miss = n - c
    pct = (100 * c / n) if n else 100.0
    rows.append((pct, miss, n, path))
rows.sort(key=lambda r: (r[0], -r[1], r[2]))
for r in rows[:25]:
    print(f"{r[0]:5.1f}%  miss={r[1]:4d}  stmts={r[2]:4d}  {r[3]}")
PY
```

## Frontend

Tras `npm run test:coverage`, revisar `frontend/coverage/` (lcov, resumen en consola y `scripts/coverage-summary.cjs`). Para una carpeta concreta:

```bash
cd frontend && npm test -- lib/stores/__tests__/blogStore.test.ts \
  --coverage --collectCoverageFrom='lib/stores/blogStore.ts' --coverageReporters=text
```
