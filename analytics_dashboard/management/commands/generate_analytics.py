# analytics_dashboard/management/commands/generate_analytics.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from groups.models import ChamaGroup
from analytics_dashboard.tasks import compute_dashboard_for_group


class Command(BaseCommand):
    help = 'Generate analytics data for one or all chama groups'

    def add_arguments(self, parser):
        parser.add_argument(
            '--group-id',
            type=int,
            help='Generate analytics for a specific group ID',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Generate analytics for all groups',
        )

    def handle(self, *args, **options):
        group_id = options.get('group_id')
        generate_all = options.get('all')

        if not group_id and not generate_all:
            self.stdout.write(
                self.style.ERROR(
                    'Please specify either --group-id or --all'
                )
            )
            return

        if generate_all:
            groups = ChamaGroup.objects.all()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Generating analytics for {groups.count()} groups...'
                )
            )
            for group in groups:
                try:
                    compute_dashboard_for_group(group.id)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Generated analytics for: {group.name} (ID: {group.id})'
                        )
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'✗ Failed for {group.name} (ID: {group.id}): {str(e)}'
                        )
                    )
        else:
            try:
                group = ChamaGroup.objects.get(id=group_id)
                compute_dashboard_for_group(group_id)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Successfully generated analytics for: {group.name} (ID: {group.id})'
                    )
                )
            except ChamaGroup.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(
                        f'Group with ID {group_id} does not exist'
                    )
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Failed to generate analytics: {str(e)}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS('\nDone! Analytics data has been generated.')
        )
