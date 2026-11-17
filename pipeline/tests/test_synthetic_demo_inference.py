"""Comprobar la inferencia offline de un artefacto sintético pequeño."""

import json
import math
import runpy
from pathlib import Path

import pytest

tool_path = Path(__file__).resolve().parents[1] / "tools/infer_synthetic_demo.py"
predict = runpy.run_path(str(tool_path))["predict"]


def test_predict_reproduces_logistic_transform_and_rejects_missing_features() -> None:
    """Aplicar log1p, zona, escalado y coeficientes en el orden declarado."""
    config = {
        "predictors": ["cases", "zona_canal_t"],
        "preparation": {
            "zone_mapping": {"EXITO": 0, "ALERTA": 1},
            "zone_columns": ["zona_canal_t__EXITO", "zona_canal_t__ALERTA"],
            "log1p_columns": ["cases"],
        },
    }
    payload = {
        "model": {
            "spec": {"config_json": json.dumps(config)},
            "coef": [[2.0, 3.0, -1.0]],
            "mean": [0.0, 0.0, 0.0],
            "std": [2.0, 1.0, 1.0],
            "intercept": [0.5],
        }
    }
    probability = predict(payload, {"cases": math.e - 1, "zona_canal_t": "ALERTA"})
    assert probability == pytest.approx(1 / (1 + math.exp(-0.5)))
    with pytest.raises(ValueError, match="variables"):
        predict(payload, {"cases": 1})
