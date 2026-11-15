# Ejecutar EXP003 desde la raíz

Estado inicial de esta entrega: propuesta preparada, sin aprobación ni ejecución.
La [especificación](SPECIFICATION.md) fija alcance, límites e historia del reset.

1. Sincronizar y validar entorno y documentos:

   ```sh
   uv lock --check --project pipeline
   uv sync --locked --project pipeline
   uv run --locked --directory pipeline python -m sat_dengue_pipeline.experiment_management validate
   ```

2. En el mismo terminal que lanzará Kedro, comprobar que HF_TOKEN esté exportado:

   ```sh
   uv run --locked --directory pipeline python -c 'import os; print("HF_TOKEN configurado:", bool(os.environ.get("HF_TOKEN")))'
   ```

   Exigir `True`. `.env` por sí solo no lo exporta. Si falta, usar entrada oculta en Bash:

   ```bash
   read -r -s -p "Token HF de lectura: " HF_TOKEN
   export HF_TOKEN
   printf '\n'
   ```

   Nunca pegar el token en un chat o guardarlo en Git. El inicio de una corrida
   real rechaza la ausencia del token antes de reservar la identidad.

3. Si se necesita verificar el acceso y los cinco archivos por separado, el
   operador autorizado puede ejecutar:

   ```sh
   uv run --locked --directory pipeline python tools/acquire_private_raw.py --manifest conf/releases/approved-raw.json
   ```

   Exigir `VERIFIED`. El helper puede descargar fuentes y crea recibo de transporte,
   pero no entrena ni consume EXP003. Su caché y la del ejecutor son distintas;
   no se promete evitar otra copia. Conservar todos los recibos, también fallidos.

4. Antes de ejecutar, obtener revisión/aprobación humana de esta receta y
   registrar esa aprobación con el procedimiento del equipo:

   ```sh
   uv run --locked --directory pipeline python -m sat_dengue_pipeline.experiment_management transition EXP003 APPROVED
   ```

   No cambiar hashes ni receta después de aprobar. No registrar EXP003 de nuevo
   si ya aparece en el registro. `PROPOSED` no habilita entrenamiento.

5. Ejecutar una sola vez:

   ```sh
   uv run --locked --directory pipeline kedro run --pipelines experiment_run --params experiment_id=EXP003
   ```

   El bundle ocupa 2.614.987.120 bytes más cachés, temporales y derivados.
   T16 midió hasta 11,43 GiB RSS por proceso en un equipo de 32 GiB; comprobar
   memoria disponible y límites de WSL/contenedor. No es un mínimo garantizado.
   Soportes, identidad reconstruida y umbral todavía pueden bloquear una corrida.

6. Revisar `receipt.json`, `inventory.json` y `metrics.json` bajo
   `docs/evidence/experiments/EXP003/<execution_id>/`. Una ejecución correcta
   conserva el estado RUNNING hasta conclusiones humanas. No volver a lanzar
   el ID, borrar evidencia ni usar `--from-nodes` para reiniciarlo tras fallo.
   Diagnosticar mediante la skill de recuperación; un intento posterior requiere
   una nueva identidad salvo una excepción explícita del operador.

El registro no prueba permisos remotos ni garantía de finalización. Esta guía
no abre PR, no aprueba ciencia, no publica modelos y no actualiza el tablero.
