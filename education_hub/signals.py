from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F
from .models import (
    EducationalContent, LearningPath, SavingsChallenge,
    ChallengeParticipant, Webinar, WebinarRegistration
)


@receiver(post_save, sender=EducationalContent)
def update_content_counts(sender, instance, **kwargs):
    """Update learning path counts when content changes."""
    if instance.is_published:
        # Update learning paths that include this content
        learning_paths = instance.learning_paths.all()
        for learning_path in learning_paths:
            learning_path.update_counts()


@receiver(post_save, sender=ChallengeParticipant)
@receiver(post_delete, sender=ChallengeParticipant)
def update_challenge_participants(sender, instance, **kwargs):
    """Update challenge participant count."""
    if hasattr(instance, 'challenge'):
        challenge = instance.challenge
        challenge.participants_count = challenge.participants.count()
        challenge.save()


@receiver(post_save, sender=WebinarRegistration)
@receiver(post_delete, sender=WebinarRegistration)
def update_webinar_registration_count(sender, instance, **kwargs):
    """Update webinar registration count."""
    if hasattr(instance, 'webinar'):
        webinar = instance.webinar
        webinar.registered_count = webinar.registrations.count()
        
        # Update attended count
        webinar.attended_count = webinar.registrations.filter(
            status='ATTENDED'
        ).count()
        webinar.save()
