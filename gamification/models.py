from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class MemberAchievement(models.Model):
    """Achievement badges for members."""
    
    CATEGORY_CHOICES = [
        ('CONTRIBUTION', 'Contribution'),
        ('SAVINGS', 'Savings'),
        ('ENGAGEMENT', 'Engagement'),
        ('LEADERSHIP', 'Leadership'),
        ('LEARNING', 'Learning'),
    ]
    
    TIER_CHOICES = [
        ('BRONZE', 'Bronze'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(_('achievement type'), max_length=100)
    category = models.CharField(_('category'), max_length=20, choices=CATEGORY_CHOICES)
    tier = models.CharField(_('tier'), max_length=20, choices=TIER_CHOICES)
    
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    icon = models.CharField(_('icon'), max_length=50, blank=True)
    
    points_earned = models.PositiveIntegerField(_('points earned'))
    
    earned_at = models.DateTimeField(_('earned at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('member achievement')
        verbose_name_plural = _('member achievements')
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"


class ContributionStreak(models.Model):
    """Track member contribution streaks."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contribution_streaks')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='member_streaks')
    
    current_streak = models.PositiveIntegerField(_('current streak'), default=0, help_text=_('Days/periods'))
    longest_streak = models.PositiveIntegerField(_('longest streak'), default=0)
    
    last_contribution_date = models.DateField(_('last contribution date'))
    streak_active = models.BooleanField(_('streak active'), default=True)
    
    total_points = models.PositiveIntegerField(_('total points'), default=0)
    
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('contribution streak')
        verbose_name_plural = _('contribution streaks')
        unique_together = ['user', 'group']
        ordering = ['-current_streak']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.current_streak} days"


class Leaderboard(models.Model):
    """Leaderboard rankings."""
    
    LEADERBOARD_TYPE_CHOICES = [
        ('CONTRIBUTIONS', 'Top Contributors'),
        ('SAVINGS', 'Top Savers'),
        ('STREAKS', 'Longest Streaks'),
        ('POINTS', 'Most Points'),
    ]
    
    PERIOD_CHOICES = [
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('ALL_TIME', 'All Time'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='leaderboards')
    leaderboard_type = models.CharField(_('leaderboard type'), max_length=20, choices=LEADERBOARD_TYPE_CHOICES)
    period = models.CharField(_('period'), max_length=20, choices=PERIOD_CHOICES)
    
    rankings = models.JSONField(_('rankings'), help_text=_('User rankings with scores'))
    
    period_start = models.DateField(_('period start'))
    period_end = models.DateField(_('period end'))
    
    generated_at = models.DateTimeField(_('generated at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('leaderboard')
        verbose_name_plural = _('leaderboards')
        unique_together = ['group', 'leaderboard_type', 'period', 'period_start']
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.leaderboard_type} - {self.period}"


class RewardPoints(models.Model):
    """Member reward points system."""
    
    TRANSACTION_TYPE_CHOICES = [
        ('EARNED', 'Earned'),
        ('REDEEMED', 'Redeemed'),
        ('EXPIRED', 'Expired'),
        ('BONUS', 'Bonus'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reward_points')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='reward_points')
    
    transaction_type = models.CharField(_('transaction type'), max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    points = models.IntegerField(_('points'))
    balance_after = models.PositiveIntegerField(_('balance after'))
    
    reason = models.CharField(_('reason'), max_length=200)
    reference_id = models.CharField(_('reference ID'), max_length=100, blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('reward points')
        verbose_name_plural = _('reward points')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.points} points - {self.transaction_type}"
