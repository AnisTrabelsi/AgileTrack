#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main() -> None:
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auth_service.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d'importer Django. Assurez‑vous qu'il est installé "
            "et disponible dans votre variable PYTHONPATH environnement, "
            "et que vous avez activé un environnement virtuel."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
