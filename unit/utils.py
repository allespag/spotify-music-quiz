from pathlib import Path

DATA_STORE = Path("unit/data")


def get_data(filename: str) -> Path:
    return DATA_STORE / filename
