# Technology Stack: Open Adventure

## Core Language
- **C99:** The project is written in idiomatic C99.

## Data and Configuration
- **YAML:** Used for defining game content (locations, objects, etc.) in `adventure.yaml`.

## Build and Tooling
- **Makefile:** The primary build system.
- **Python 3:** Used for the code generation step (`make_dungeon.py`).
- **Asciidoctor:** Required for building the documentation from `.adoc` files.
- **libedit:** Used for command-line editing features.

## Testing
- **Custom Regression Suite:** A comprehensive set of test logs and expected outputs located in the `tests/` directory.