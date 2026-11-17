# Inferencia con el paquete sintético local

El archivo local ignorado `pipeline/data/demo/package.json` contiene un modelo
logístico artificial ya entrenado para T+2. Es una demostración; sus
probabilidades no sustentan alertas ni decisiones sanitarias. No existe T+1 en
este paquete. La herramienta valida el hash interno y aplica la preparación y
los coeficientes guardados, sin entrenar ni descargar datos.

En el dashboard, abra **Carga de demostración**, seleccione el CSV o Excel y el
paquete `pipeline/data/demo/package.json`, y pulse **Calcular ranking T+2**.
También puede cargar la muestra artificial desde el botón. El archivo y el
paquete se leen en el navegador; el paquete solo admite el periodo declarado
en sus metadatos. El Excel puede incluir `COD_DPTO_R` y `COD_MUN_R`; también se
admite `municipality_code`. Las columnas `INI_SIN` y `confirmados` son
obligatorias. Los meses cargados sustituyen la historia sintética correspondiente
y asumen cero casos graves; los resultados sin historia suficiente quedan sin
predicción. La probabilidad no es una alerta.

Desde la raíz, para probar con predictores artificiales:

```sh
uv run --directory pipeline python tools/infer_synthetic_demo.py --example
```

La respuesta contiene `probability` y los predictores usados. Para usar otros
valores, copie el objeto `features` en un archivo JSON local y ejecútelo así:

```sh
uv run --directory pipeline python tools/infer_synthetic_demo.py --features /ruta/predictores.json
```

El JSON debe incluir exactamente los predictores mostrados en el ejemplo;
`zona_canal_t` acepta `EXITO`, `SEGURIDAD`, `ALERTA` o `EXCESO`. Los predictores
deben estar calculados antes de ejecutar la herramienta: esta no genera lags,
canal ni variables a partir de datos crudos. La salida es una probabilidad bruta,
sin umbral o decisión de alerta. El paquete no está versionado en Git; para
usarlo en otro entorno debe trasladarse mediante un canal apropiado.
