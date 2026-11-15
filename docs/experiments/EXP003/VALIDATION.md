# Validación local de la preparación EXP003

Fecha: 2026-11-15. Rama: `feature/pipeline-e2e`, cambios locales sin publicar.
Alcance: propuesta, lectura compatible de certificado T16 y rechazo de token
 ausente antes de reservar una ejecución. No es evidencia de entrenamiento real.

| Comprobación | Resultado |
|---|---|
| `uv lock --check --project pipeline` | PASS |
| `uv sync --locked --project pipeline` | PASS |
| `uv run --directory pipeline ruff check .` | PASS |
| CLI `experiment_management validate` | VALID |
| Hashes de protocolo, receta, manifiesto y certificado | PASS |
| Comparación semántica contra T16 | Solo cambia peso 1→4 y su representación nativa |
| Lectura canónica certificada histórica | PASS; 182.886 claves |
| Ajuste en ocho filas artificiales con receta EXP003 | PASS; configuración nativa efectiva contiene peso 4 |
| Kedro `synthetic` | PASS |
| Pruebas enfocadas de experimentos/certificación | 69 passed |
| Primera ejecución de la suite completa | 850 passed, 1 failed; seis avisos OmegaConf existentes |
| Reejecución `pytest --lf` tras corregir el vestigio del reset | 1 passed |
| `check_experiment_preservation.py` | PASS; 49 archivos protegidos, 22 JSON y 16 recibos T16 intactos |
| Diff de trabajo y diff `origin/main...HEAD` | PASS, sin errores de whitespace |

El único fallo de la primera suite completa fue
`test_legacy_receipts_remain_readable_and_unchanged`: encontró el directorio
vacío `docs/evidence/experiments/EXP003/ffd87b0a05424c6187f50d8f76e700b2`
sin inventory.json. El reset había eliminado sus archivos y dejado el directorio.
Se verificó que estaba completamente vacío y se trasladó, sin borrarlo, a
`pipeline/data/recovery/EXP003-reset-2026-11-15/ffd87b0a05424c6187f50d8f76e700b2`.
La comprobación de historial y la validación del registro pasan ahora; no se
relajó ninguna comprobación de inventarios ni se fabricó evidencia histórica.
No se repitió la suite completa después del traslado: se ejecutaron las 69
pruebas enfocadas y el único caso fallido mediante `--lf`, todos verdes.

No se ejecutaron pruebas de API/tablero ni CI remota: no se modificó producto,
contratos de publicación ni artefactos publicados. No se inició experimento
científico, adquisición privada, revisión/aprobación científica o publicación.
El ajuste artificial no consume EXP003 ni representa su resultado científico.
El store local conserva la corrida previa FAILED descrita en SPECIFICATION.md.

Pendientes para una ejecución autorizada: aprobación humana de receta, token
exportado y acceso privado actual en el proceso del operador, recursos libres,
fuentes íntegras, reconstrucción exacta, soportes y umbral factible. El acceso
Hugging Face fue informado por el operador, no comprobado usando su credencial.
