#!/usr/bin/env python
"""
Quick validation script to check if the seed script has correct imports and structure.
This doesn't actually seed the database, just validates the code.
"""

import sys
import ast
import importlib.util

def validate_seed_script():
    """Validate the seed script without executing it."""
    
    print("=" * 80)
    print("VALIDATING SEED SCRIPT")
    print("=" * 80)
    
    # Check if file exists
    try:
        with open('seed_all_data.py', 'r', encoding='utf-8') as f:
            content = f.read()
        print("✓ Seed script file found")
    except FileNotFoundError:
        print("✗ Seed script file not found!")
        return False
    
    # Check Python syntax
    try:
        ast.parse(content)
        print("✓ Python syntax is valid")
    except SyntaxError as e:
        print(f"✗ Syntax error: {e}")
        return False
    
    # Check for required classes
    if 'class DataSeeder' in content:
        print("✓ DataSeeder class found")
    else:
        print("✗ DataSeeder class not found!")
        return False
    
    # Check for required methods
    required_methods = [
        'seed_all',
        'seed_users',
        'seed_groups',
        'seed_finance',
        'seed_investments',
        'seed_gamification',
        'seed_mpesa',
        'seed_education',
        'seed_governance',
        'seed_audit_trail'
    ]
    
    missing_methods = []
    for method in required_methods:
        if f'def {method}(' in content:
            print(f"✓ Method '{method}' found")
        else:
            print(f"✗ Method '{method}' not found!")
            missing_methods.append(method)
    
    if missing_methods:
        return False
    
    # Check for model imports
    required_models = [
        'User',
        'ChamaGroup',
        'Contribution',
        'Loan',
        'Investment',
        'MemberAchievement',
        'MPesaTransaction',
        'EducationalContent',
        'GroupConstitution',
        'AuditLog'
    ]
    
    missing_models = []
    for model in required_models:
        if model in content:
            print(f"✓ Model '{model}' referenced")
        else:
            print(f"✗ Model '{model}' not found!")
            missing_models.append(model)
    
    if missing_models:
        return False
    
    print("\n" + "=" * 80)
    print("VALIDATION SUCCESSFUL! ✓")
    print("=" * 80)
    print("\nThe seed script is properly structured and ready to use.")
    print("\nTo run the script:")
    print("  python seed_all_data.py")
    print("\nOR:")
    print("  python manage.py shell < seed_all_data.py")
    print("=" * 80)
    
    return True

if __name__ == '__main__':
    success = validate_seed_script()
    sys.exit(0 if success else 1)
