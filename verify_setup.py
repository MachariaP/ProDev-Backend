#!/usr/bin/env python3.12
"""Setup verification script for ProDev-Backend"""
import sys

def check_python_package(package_name):
    """Check if a Python package is installed"""
    try:
        __import__(package_name)
        print(f"✅ {package_name}: Installed")
        return True
    except ImportError:
        print(f"❌ {package_name}: Not installed")
        return False

def main():
    print("🔍 Verifying ProDev-Backend Setup...\n")
    
    all_ok = True
    
    # Check Python packages
    print("🐍 Python Packages:")
    all_ok &= check_python_package("django")
    all_ok &= check_python_package("rest_framework")
    all_ok &= check_python_package("celery")
    all_ok &= check_python_package("redis")
    all_ok &= check_python_package("psycopg2")
    
    print("\n" + "="*50)
    if all_ok:
        print("✅ All checks passed! You're ready to proceed.")
    else:
        print("❌ Some checks failed. Please review and fix.")
        sys.exit(1)

if __name__ == "__main__":
    main()
