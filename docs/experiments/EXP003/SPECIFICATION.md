# EXP003 — Réplica técnica con peso positivo 4

Estado: PROPUESTA. Fecha de preparación: 2026-11-15.
Sin aprobación científica ni autorización operativa.

## Propósito e hipótesis

Preparar una réplica técnica exploratoria de T16-FACTORY-XGB-S53-v1 con
`scale_pos_weight: 4.0` en lugar de 1.0. La hipótesis es que dar mayor peso a
los positivos puede reducir inicios de exceso omitidos (falsos negativos),
con posible incremento de falsas alertas (falsos positivos). No se garantiza
una mejora después de calibración y selección del umbral.

Referencia: [receta T16](../../decisions/task16-experiment-specification.md),
[configuración base](../../../pipeline/conf/base/parameters_experiment.yml),
[evidencia T16](../../evidence/task16/factory-experiment/validation.json).
Configuración ejecutable: [EXP003.yml](../../../pipeline/conf/experiments/EXP003.yml).
Instrucciones locales: [RUN.md](RUN.md).

## Identidad después del reset del operador

El operador solicitó explícitamente reutilizar el nombre EXP003 después de
restablecer el checkout. El registro local restablecido solo contiene EXP001
y EXP002. Esto no significa que EXP003 nunca se haya intentado.

El intento previo `ffd87b0a05424c6187f50d8f76e700b2` falló durante adquisición,
antes de construir o entrenar; se informó ausencia de HF_TOKEN y posteriormente
un problema de acceso 404 al comprobar el repositorio privado. El operador
informa ahora que dispone de acceso. La nueva preparación no verifica acceso
remoto ni usa credenciales. La corrida MLflow previa
`daa4f79c562c4e5a85dc46b1e3418c69` permanece FAILED en el store local y no se
modifica, elimina ni presenta como una ejecución de esta receta restablecida.
Los recibos de aquella ejecución ya no están en el checkout restablecido;
no se reconstruyen ni inventan. La trazabilidad debe distinguir execution_id,
hashes de configuración/protocolo y firma; el nombre EXP003 solo no basta.
La reutilización solicitada es una excepción al procedimiento normal, que exige
un ID nuevo después de un intento reservado. No habilita reutilizaciones futuras.

El reset dejó únicamente el directorio vacío del intento previo bajo la frontera
de evidencia. Se verificó que no contenía ningún archivo y se trasladó, sin
borrarlo, a `pipeline/data/recovery/EXP003-reset-2026-11-15/ffd87b0a05424c6187f50d8f76e700b2`.
Esto conserva el vestigio local fuera del índice de ejecuciones activas; no
restaura recibos desaparecidos ni modifica la corrida FAILED de MLflow.


## Cambio único de aprendizaje

Se conservan 33 predictores, matriz de 36 columnas, codificación fija, ausencia
de imputación/escalado y variables G, XGBoost 3.0.5 CPU/hist/un hilo, 80 rondas,
semilla 53, todos los demás hiperparámetros y mínimos de soporte T16. No hay
HPO, early stopping, refit, selección de semilla ni remuestreo automático.
`class_balancing: false` mantiene ese último modo del adaptador, sin anular
el peso positivo explícito.

Solo cambian `candidate.parameters.scale_pos_weight` de 1.0 a 4.0 y su
representación nativa esperada de `"1"` a `"4"`. No se edita la receta cerrada
T16 ni se escogen decisiones después de leer evaluación.

## Datos y controles temporales

Se fija el release histórico `satd-raw-a1a7f237`, revisión
`a1a7f237a4baa6ffa848fabeef474f811f3b3f33`, mediante
[approved-raw.json](../../../pipeline/conf/releases/approved-raw.json) y SHA-256.
Perfil `approved`: 1.122 municipios, junio de 2011 a diciembre de 2024,
182.886 claves canónicas. No se sustituye por el perfil operacional de 2007.
La certificación de referencia es [N=3 histórico](../../evidence/task16/certify-real.json),
fijada por hash, junto con los recibos de fábrica fijados por el lector compatible.

Se mantiene población nacional, evento H5, elegibilidad observable en T, demora
de etiqueta y embargo de un mes, guardas de V3 y cuarentena de 2025 antes de
cualquier transformación. La presencia de fechas históricas no acredita
 disponibilidad en tiempo real. Los cinco roles por periodo objetivo son iguales
para T+1 y T+2 y sus soportes mínimos permanecen en YAML:

| Rol | Inicio | Fin |
|---|---|---|
| train | 2018-01 | 2020-12 |
| calibration_fit | 2021-05 | 2021-10 |
| calibration_selection | 2022-03 | 2022-08 |
| threshold_selection | 2023-01 | 2023-06 |
| evaluation | 2024-01 | 2024-11 |

## Calibración, evaluación y criterio descriptivo

Se mantiene la elección de representación original/sigmoide por Brier,
calibración con su rol exclusivo y umbral de sensibilidad máxima bajo
FAR `FP/(TP+FP) <= 0.8`, con grilla y desempates T16. Las etiquetas de evaluación
se leen después de congelar decisiones y predecir ambos horizontes.

Informar sensibilidad de inicio, FAR, volumen/fracción de alertas, AP, AUROC y
Brier, siempre por horizonte con soporte/denominadores. Conservar prevalencia
de train y persistencia como referencias. FN equivale a positivos evaluables
menos TP: no inventar conteos que la evidencia no permita derivar.

Un descenso de FN frente a T16 es descriptivo y exige exactamente las mismas
claves, positivos evaluables, etiquetas y datos. Informar cualquier incremento
de FP. No cambiar el umbral, el soporte o la receta para obtener mejor resultado.
Una ejecución con semilla 53 no acredita estabilidad entre semillas ni
significancia; no se estima incertidumbre nueva en esta réplica técnica.

El [contrato V3](../contrato.md) sigue propuesto. Esta receta no agrega su
canal condicionado, presupuesto común, A/B/C, cinco semillas ni incertidumbre.
Por tanto no responde confirmatoriamente la pregunta de grado, no demuestra
superioridad científica y no obtiene un veredicto bajo ese contrato. La
población nacional no sustituye el análisis específico de Meta/Tolima.
Cualquier ampliación científica requiere otra propuesta y revisión previa.

## Ejecución, evidencia y límites

Una aprobación nueva habilita un intento, con modelos independientes por
horizonte. El lector compatible solo acepta hashes exactos de evidencia T16;
no certifica nuevamente ni modifica recibos. Antes de preparar matrices se
exigen bytes, digest semántico y auditoría iguales a los de referencia.

Quedan por comprobar autenticación en el proceso real, privacidad/revisión
remotas, cinco archivos íntegros, recursos disponibles, reconstrucción exacta,
soportes de roles y factibilidad del umbral. Aprobar y ejecutar son decisiones
separadas de esta preparación. No se accede a secretos ni se descargan datos
en esta tarea.

La salida futura vive en `docs/evidence/experiments/EXP003/<execution_id>/`.
No hay conclusiones ni resultados de la preparación. El tablero no se actualiza
automáticamente: necesita exportación de panel/predicciones/comparación y
publicación autorizada por separado. Se conservan `NOT_SELECTED` y ausencia
de autorización operativa; no se reemplaza `datos/resultados/`.
