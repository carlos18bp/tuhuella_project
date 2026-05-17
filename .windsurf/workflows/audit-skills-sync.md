---
description: Audit bidirectional sync repo ↔ proyectos ↔ $HOME (skills, settings, config). Reporta gaps; --apply-user-level sincroniza $HOME desde workflows/.user-level/.
---

# Audit Skills Sync — verificación bidireccional repo ↔ proyectos ↔ $HOME

Audita la sincronización del catálogo de skills/workflows entre:
- **Repo ops** (`<ops>/workflows/{.claude,.agents,.windsurf,.local-skills,.user-level}/`)
- **Proyectos del fleet** (`<proyecto>/.claude/skills/`, `<proyecto>/.agents/skills/`, `<proyecto>/.windsurf/workflows/`)
- **User-level** (`$HOME/.claude/skills/`, `$HOME/.claude/settings.json`, `$HOME/.codex/config.toml`)

Modo default: solo reporta. Argumentos opcionales aplican correcciones.

> **⚠️ How to invoke**:
> - `/audit-skills-sync` — solo audita y reporta (no modifica nada).
> - `/audit-skills-sync --apply-import` — importa al repo desde proyectos (cuando proyectos tienen skills nuevos no en repo).
> - `/audit-skills-sync --apply-distribute` — distribuye del repo a proyectos (cuando proyectos tienen skills viejos/faltantes).
> - `/audit-skills-sync --apply-user-level` — sincroniza `$HOME/.{claude,codex}/` desde `workflows/.user-level/` (skills, settings.json, config.toml).
> - `/audit-skills-sync --apply-all` — los 3 en orden seguro (import → distribute → user-level).

---

## Phase 1 — Inventario fresco

```bash
cd /home/ryzepeck/webapps/ops/vps
bash scripts/maintenance/inventory-skills.sh > /tmp/audit-inventory-$(date +%Y%m%d-%H%M%S).log 2>&1
INVENTORY_FILE=$(ls -t /tmp/skills-inventory-*.md | head -1)
echo "📋 Inventario fresco generado: $INVENTORY_FILE"
```

---

## Phase 2 — ¿Qué falta en el repo? (proyectos → ops)

```bash
cd /home/ryzepeck/webapps/ops/vps
bash scripts/maintenance/import-skills-from-projects.sh --check 2>&1 | tee /tmp/audit-import-check.log

# Extraer las acciones CREATE y OVERWRITE
echo ""
echo "=== Resumen sección A (importar al repo) ==="
grep -E "CREATE|OVERWRITE" /tmp/audit-import-check.log | head -30
```

---

## Phase 3 — ¿Qué falta en los proyectos? (ops → proyectos)

```bash
cd /home/ryzepeck/webapps/ops/vps
bash scripts/maintenance/sync-shared-skills.sh --check 2>&1 | tee /tmp/audit-sync-check.log

# Extraer skills faltantes/divergentes
echo ""
echo "=== Resumen sección B (distribuir a proyectos) ==="
grep -E "➕|🔄" /tmp/audit-sync-check.log | sort | uniq -c | sort -rn | head -30
```

---

## Phase 3b — User-level: ¿$HOME al día con `workflows/.user-level/`?

Audita la 4ª capa: skills + settings.json + config.toml en `$HOME/.{claude,codex}/` contra el snapshot central. Los **26 skills baseline user-level** + `vuln-audit/` + `settings.json` + `config.toml` deben coincidir cross-machine.

```bash
cd /home/ryzepeck/webapps/ops/vps
bash scripts/maintenance/sync-user-level.sh --check 2>&1 | tee /tmp/audit-userlevel-check.log

# Extraer pendientes
echo ""
echo "=== Resumen sección C (user-level) ==="
grep -E "➕|🔄|⚠️" /tmp/audit-userlevel-check.log | head -20
grep -E "Identicos:|Pendientes:" /tmp/audit-userlevel-check.log
```

Hashes esperados iguales en dev y ambos VPS para `settings.json`, `config.toml`, y todos los archivos en `~/.claude/skills/`. Las exclusiones (`auth.json`, `history.jsonl`, `cache/`, `sessions/`, `settings.local.json`, etc.) NO se auditan — son estado local por máquina.

---

## Phase 4 — Síntesis de hallazgos

Después de ejecutar Phases 1-3, presentar un reporte estructurado:

```
# Skills Sync Audit — <fecha>

## A. Skills en proyectos NO en catálogo del repo (importar)
[lista de skills con cobertura y proyecto fuente sugerido]
Acción sugerida: bash scripts/maintenance/import-skills-from-projects.sh --apply

## B. Skills en catálogo NO en proyectos (distribuir)
[lista agrupada por proyecto: qué skills le faltan]
Acción sugerida: bash scripts/maintenance/sync-shared-skills.sh --apply

## C. Skills divergentes (mismo nombre, distintos hashes)
[lista con repo-hash vs mayoritario-proyectos]
Acción sugerida: revisar diff y decidir

## D. Skills propios (informativo, no acción)
[lista de skills en examples/, qué proyecto los originó]

## E. User-level drift ($HOME vs workflows/.user-level/)
[archivos en $HOME desactualizados o faltantes vs el snapshot central]
Acción sugerida: bash scripts/maintenance/sync-user-level.sh --apply
```

---

## Phase 5 — Aplicar correcciones (solo si argumento)

```bash
case "$ARGUMENTS" in
    --apply-import)
        echo "▸ Importando skills al repo ops..."
        bash scripts/maintenance/import-skills-from-projects.sh
        ;;
    --apply-distribute)
        echo "▸ Distribuyendo skills a proyectos..."
        bash scripts/maintenance/sync-shared-skills.sh
        ;;
    --apply-user-level)
        echo "▸ Sincronizando user-level (\$HOME) desde workflows/.user-level/..."
        bash scripts/maintenance/sync-user-level.sh --apply
        ;;
    --apply-all)
        echo "▸ Phase 1: importar al repo..."
        bash scripts/maintenance/import-skills-from-projects.sh
        echo ""
        echo "▸ Phase 2: distribuir a proyectos..."
        bash scripts/maintenance/sync-shared-skills.sh
        echo ""
        echo "▸ Phase 3: sincronizar user-level (\$HOME)..."
        bash scripts/maintenance/sync-user-level.sh --apply
        ;;
    "")
        echo "ℹ️  Modo solo-audita (sin --apply-*). Re-invocar con un argumento para aplicar."
        ;;
    *)
        echo "❌ Argumento desconocido: $ARGUMENTS"
        echo "Argumentos válidos: --apply-import | --apply-distribute | --apply-user-level | --apply-all"
        exit 1
        ;;
esac
```

---

## Phase 6 — Verificación post-aplicación (si se aplicó algo)

Si se ejecutó cualquier `--apply-*`:

```bash
echo "▸ Re-corriendo audit para verificar idempotencia..."
bash scripts/maintenance/import-skills-from-projects.sh --check 2>&1 | grep -E "Resumen:|Final:" | head -2
bash scripts/maintenance/sync-shared-skills.sh --check 2>&1 | grep -E "Summary:|Resumen" | head -2
bash scripts/maintenance/sync-user-level.sh --check 2>&1 | grep -E "Identicos:|Pendientes:" | head -2
```

Esperado tras `--apply-all`:
- Import: `CREATE=0  OVERWRITE=0  OK_ALIGNED=N`
- Sync: `applied=0` o ningún `➕` / `🔄`
- User-level: `Pendientes: 0`

---

## Notas

- **Solo opera con skills genéricos**. Los `examples/` (skills propios de un solo proyecto) NO se distribuyen automáticamente.
- **Filtros disponibles** (vía variables de entorno antes de invocar):
  - `FILTER_PROJECT=mimittos_project` → solo audita un proyecto
  - `FILTER_SKILL=plan-task` → solo un skill
- **Sistemas auditados**: `.claude/skills/`, `.agents/skills/`, `.windsurf/workflows/` (3). NO se audita `.codex/skills/` porque es legacy — el estándar real para Codex es `.agents/`.
- **Backups**: cualquier sobrescritura crea `.bak.YYYYMMDD-HHMMSS` adyacente.
- **Convenciones de fronmatter**: Claude/Codex Agents usan estructura anidada `<name>/SKILL.md`; Windsurf usa archivo plano `<name>.md`. Los scripts respetan esto automáticamente.
