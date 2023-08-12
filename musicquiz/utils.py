import random
import typing as tp
from pathlib import Path


def get_configs_store() -> Path:
    CONFIGS_DIRECTORY_ROOT = Path("configs")

    return CONFIGS_DIRECTORY_ROOT.absolute()


def safe_sample(population: tp.Sequence, k: int) -> tp.Sequence:
    if k >= len(population):
        return population
    else:
        return random.sample(population, k=k)
