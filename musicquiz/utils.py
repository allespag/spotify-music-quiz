from pathlib import Path


def get_configs_store() -> Path:
    CONFIGS_DIRECTORY_ROOT = Path("configs")

    return CONFIGS_DIRECTORY_ROOT.absolute()
