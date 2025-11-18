from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    "compute-all-dashboards-nightly": {
        "task": "analytics_dashboard.tasks.compute_all_dashboards",
        "schedule": crontab(hour=2, minute=30),  # Every day at 2:30 AM
    },
}
