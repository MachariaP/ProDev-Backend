# Database Seeding Guide

This guide explains how to seed your ProDev-Backend database with sample data.

## Overview

The seeding script (`seed_all_data.py`) populates the database with comprehensive sample data across all models in the system. This is useful for:

- Development and testing
- Demonstrations
- Performance testing
- UI/UX testing with realistic data

## What Gets Seeded

The script seeds the following data in order:

1. **Users and Accounts** (50 users with wallets)
   - African names and realistic profiles
   - KYC-verified users (75%)
   - Personal wallets with balances

2. **Groups and Memberships** (15 groups)
   - Various group types (Savings, Investment, Welfare, Mixed)
   - Group memberships (8-15 members per group)
   - Group officials (Chairperson, Treasurer, Secretary)
   - Group goals and messages

3. **Finance** 
   - Contributions (5-15 per member)
   - Loans (30-50% of members)
   - Loan repayments
   - Group expenses

4. **Investments**
   - Group investments (2-5 per group)
   - Investment transactions
   - Portfolio tracking

5. **Gamification**
   - Member achievements
   - Contribution streaks
   - Reward points

6. **M-Pesa Integration**
   - M-Pesa transaction records
   - Payment reconciliations

7. **Education Hub**
   - Educational content (Articles, Videos, Tutorials)
   - User progress tracking
   - Savings challenges

8. **Governance**
   - Group constitutions
   - Fines and penalties
   - Voting records

9. **Audit Trail**
   - Audit logs for financial transactions

## Usage

### Method 1: Direct Python Execution

```bash
cd /path/to/ProDev-Backend
python seed_all_data.py
```

### Method 2: Django Shell

```bash
python manage.py shell < seed_all_data.py
```

### Method 3: Using Existing Management Commands

For specific seeding needs, you can use the individual management commands:

```bash
# Seed users, groups, and basic financial data
python manage.py seed_data

# Seed investment data only
python manage.py seed_investments
```

## Important Notes

### ⚠️ Data Clearing

The script will ask if you want to clear existing data before seeding:
- **Type 'yes'**: Deletes all non-superuser data and starts fresh
- **Type 'no'**: Adds new data to existing database

### Default Credentials

All seeded users have the following credentials:
- **Password**: `password123`
- **Email**: `{firstname}.{lastname}{number}@example.com`

Example:
- Email: `amara.okonkwo1@example.com`
- Password: `password123`

### Data Characteristics

- **Realistic African Names**: Uses diverse names from across Africa
- **Kenyan Context**: Locations, phone numbers (+254), and local context
- **Financial Realism**: Appropriate amounts in KES (Kenyan Shillings)
- **Varied Statuses**: Mix of pending, active, completed states
- **Relationships**: Properly linked data across models

## Seeding Statistics

After completion, you'll see a summary like:

```
================================================================================
DATABASE SEEDING SUMMARY
================================================================================
Users: 50
Groups: 15
Memberships: ~150
Contributions: ~1500
Loans: ~75
Investments: ~45
M-Pesa Transactions: ~100
Educational Content: 6
Achievements: ~50
Audit Logs: ~50
================================================================================
```

## Customization

To customize the seeding:

1. Open `seed_all_data.py`
2. Modify the relevant section:
   - Change user count in `seed_users()` method
   - Add more group names in `seed_groups()` method
   - Adjust contribution amounts, loan amounts, etc.
3. Save and run the script

## Troubleshooting

### Database Errors

If you encounter database errors:

```bash
# Reset migrations (be careful!)
python manage.py migrate --fake-zero
python manage.py migrate
```

### Import Errors

Make sure all dependencies are installed:

```bash
pip install -r requirements.txt
```

### Permission Errors

Ensure the Django environment is properly configured:

```bash
export DJANGO_SETTINGS_MODULE=chamahub.settings
```

## Production Warning

⚠️ **NEVER run this script on a production database!**

This script is intended for development and testing only. It will:
- Delete existing user data if you confirm
- Create dummy/fake data
- Use weak passwords

## Support

For issues or questions about seeding:
1. Check this guide first
2. Review the script comments in `seed_all_data.py`
3. Contact the development team

## File Locations

- **Main seeding script**: `seed_all_data.py`
- **Users/Groups seeding**: `accounts/management/commands/seed_data.py`
- **Investment seeding**: `investments/management/commands/seed_investments.py`
