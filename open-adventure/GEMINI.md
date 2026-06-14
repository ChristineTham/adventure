# Open Adventure Project Overview

Open Adventure is a modern forward-port of the classic Crowther/Woods Colossal Cave Adventure 2.5. It aims to preserve the original gameplay while modernising the implementation for readability and future portability.

## Tech Stack
- **Language:** C99
- **Data Format:** YAML (for game content)
- **Build System:** Makefile
- **Tools:** Python 3 (for code generation), Asciidoctor (for documentation), libedit (for line editing)

## Core Architecture
The project uses a data-driven design where the game world is defined in `adventure.yaml`.
- **`adventure.yaml`**: Contains all locations, objects, motions, actions, and messages.
- **`make_dungeon.py`**: Compiles `adventure.yaml` into `dungeon.c` and `dungeon.h` during the build process.
- **`advent.h`**: Main header defining the `game` state structure and global macros.
- **`main.c`**: Entry point and main game loop.
- **`actions.c`**: Implementation of player verbs (e.g., attack, throw, fill).
- **`init.c`**: Game state initialization.
- **`saveresume.c`**: Logic for saving and restoring game progress.

## Building and Running
- **Build:** `make`
- **Run:** `./advent`
- **Test:** `make check` (Runs a comprehensive regression test suite in the `tests/` directory)
- **Clean:** `make clean`
- **Coverage:** `make coverage` (Requires `gcov` and `lcov`)

## Development Conventions
- **Preserve Gameplay:** By policy, do not change original gameplay logic unless fixing a verified bug.
- **Oldstyle Mode:** Any user-visible changes from version 2.5 (that aren't bugfixes) must be revertible using the `-o` or `--oldstyle` command-line option.
- **Modern C:** The code has been refactored from FORTRAN-style C to idiomatic C99, eliminating most `goto`s and globals.
- **Portability:** Prefer integer-based array indexing over pointer arithmetic to facilitate potential future translation to languages like Python or Go.
- **One-Based Indexing:** Much of the code still uses 1-based indexing for arrays (a legacy of its FORTRAN roots).
- **Testing:** The project maintains a high standard for test coverage (effectively 100%). Always run `make check` after modifications.
- **Documentation:** Use Asciidoctor (`.adoc` files) for all project documentation.

## Key Files
- `advent.h`: Global state and constants.
- `adventure.yaml`: The definitive source for game data.
- `actions.c`: Where most command logic lives.
- `tests/`: Regression test logs (`.log`) and expected outputs (`.chk`).
- `notes.adoc`: Detailed maintainer's notes on project history and philosophy.
