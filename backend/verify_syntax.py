#!/usr/bin/env python3
"""
Syntax verification for Phase 0 implementation
Validates Python syntax without importing dependencies
"""

import py_compile
import sys
from pathlib import Path


def verify_file(filepath: str) -> bool:
    """Verify Python file syntax"""
    try:
        py_compile.compile(filepath, doraise=True)
        print(f"  ✓ {filepath}")
        return True
    except py_compile.PyCompileError as e:
        print(f"  ✗ {filepath}: {e}")
        return False


def main():
    """Verify all Phase 0 files"""
    print("=" * 60)
    print("Phase 0 Syntax Verification")
    print("=" * 60)
    print()

    files_to_check = [
        "app/schemas/conversations.py",
        "app/schemas/principles.py",
        "app/services/principles/__init__.py",
        "app/services/principles/parser.py",
        "app/services/principles/extractor.py",
        "app/api/v1/endpoints/conversations.py",
        "app/api/v1/endpoints/principles.py",
    ]

    print("Verifying Python syntax...")
    all_passed = True
    for filepath in files_to_check:
        if not verify_file(filepath):
            all_passed = False

    print()
    print("=" * 60)

    if all_passed:
        print("ALL FILES PASSED SYNTAX VALIDATION ✓")
        print("=" * 60)
        print()
        print("Implementation Summary:")
        print("  • 2 schema files (conversations, principles)")
        print("  • 2 service files (parser, extractor)")
        print("  • 2 API endpoint files (conversations, principles)")
        print()
        print("Next Steps:")
        print("  1. Install dependencies: pip install -r requirements.txt")
        print("  2. Set up environment: cp .env.example .env")
        print("  3. Configure Supabase and Anthropic API keys")
        print("  4. Create database tables (see PHASE0_IMPLEMENTATION.md)")
        print("  5. Run: uvicorn app.main:app --reload")
        print()
        return 0
    else:
        print("SYNTAX ERRORS FOUND ✗")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
