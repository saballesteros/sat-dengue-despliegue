"""Aplicar el modelo sintético local a predictores municipales en JSON."""

import argparse
import hashlib
import json
import math
from pathlib import Path


def load_package(path: Path) -> dict:
    """Cargar y verificar el paquete sintético antes de usarlo."""
    envelope = json.loads(path.read_text(encoding="utf-8"))
    payload = envelope["payload"]
    encoded = json.dumps(
        payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False
    ).encode()
    if hashlib.sha256(encoded).hexdigest() != envelope["sha256"]:
        raise ValueError("El hash del paquete no coincide")
    if (
        payload["schema"] != "sat-dengue.monthly-demo/v1"
        or payload["metadata"]["kind"] != "synthetic"
        or payload["metadata"]["horizon"] != 2
        or payload["model"]["schema"] != "sat-dengue.logistic-inference/v1"
        or payload["model"]["classes"] != [0, 1]
    ):
        raise ValueError("El paquete no es el modelo sintético T+2 esperado")
    return payload


def predict(payload: dict, features: dict) -> float:
    """Calcular probabilidad positiva aplicando la preparación del modelo."""
    model = payload["model"]
    config = json.loads(model["spec"]["config_json"])
    predictors = config["predictors"]
    prep = config["preparation"]
    if set(features) != set(predictors):
        raise ValueError("Las variables deben coincidir exactamente con los predictores")
    matrix = []
    for name in predictors:
        value = features[name]
        if name == "zona_canal_t":
            if value not in prep["zone_mapping"]:
                raise ValueError("Zona de canal inválida")
            matrix.extend(
                float(value == col.removeprefix("zona_canal_t__"))
                for col in prep["zone_columns"]
            )
        else:
            if (
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not math.isfinite(value)
            ):
                raise ValueError(f"Valor numérico inválido: {name}")
            matrix.append(math.log1p(max(value, 0)) if name in prep["log1p_columns"] else value)
    coef, mean, std = model["coef"][0], model["mean"], model["std"]
    if not (len(matrix) == len(coef) == len(mean) == len(std)) or any(x <= 0 for x in std):
        raise ValueError("Dimensiones o escala del modelo inválidas")
    score = model["intercept"][0] + sum(
        c * (x - m) / s for x, c, m, s in zip(matrix, coef, mean, std, strict=True)
    )
    return 1 / (1 + math.exp(-score)) if score >= 0 else math.exp(score) / (1 + math.exp(score))


def main() -> None:
    """Leer predictores explícitos o crear un ejemplo artificial y predecir."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", type=Path, default=Path("data/demo/package.json"))
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--features", type=Path, help="JSON con predictores canónicos")
    source.add_argument(
        "--example", action="store_true", help="Usar valores artificiales de ejemplo"
    )
    args = parser.parse_args()
    payload = load_package(args.package)
    config = json.loads(payload["model"]["spec"]["config_json"])
    features = (
        {name: "SEGURIDAD" if name == "zona_canal_t" else 1 for name in config["predictors"]}
        if args.example
        else json.loads(args.features.read_text(encoding="utf-8"))
    )
    result = {"kind": "synthetic", "horizon": 2, "probability": predict(payload, features)}
    if args.example:
        result["features"] = features
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
