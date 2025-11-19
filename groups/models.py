from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class ChamaGroup(models.Model):
    """Model for Chama groups with KYB information."""
    
    GROUP_TYPES = [
        ('SAVINGS', 'Savings Group'),
        ('INVESTMENT', 'Investment Group'),
        ('WELFARE', 'Welfare Group'),
        ('MIXED', 'Mixed Purpose'),
    ]
    
    name = models.CharField(_('group name'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    group_type = models.CharField(_('group type'), max_length=20, choices=GROUP_TYPES, default='SAVINGS')
    objectives = models.TextField(_('objectives'), help_text=_('Group goals and objectives'))
    
    # KYB Documents
    registration_certificate = models.FileField(
        _('registration certificate'),
        upload_to='groups/kyb/certificates/',
        blank=True,
        null=True
    )
    kra_pin = models.CharField(_('KRA PIN'), max_length=20, blank=True)
    kra_document = models.FileField(
        _('KRA document'),
        upload_to='groups/kyb/kra/',
        blank=True,
        null=True
    )
    articles_of_association = models.FileField(
        _('articles of association'),
        upload_to='groups/kyb/articles/',
        blank=True,
        null=True
    )
    
    # Group settings
    contribution_frequency = models.CharField(
        _('contribution frequency'),
        max_length=20,
        choices=[
            ('DAILY', 'Daily'),
            ('WEEKLY', 'Weekly'),
            ('BIWEEKLY', 'Bi-Weekly'),
            ('MONTHLY', 'Monthly'),
        ],
        default='MONTHLY'
    )
    minimum_contribution = models.DecimalField(
        _('minimum contribution'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Group balance
    total_balance = models.DecimalField(
        _('total balance'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Status
    is_active = models.BooleanField(_('is active'), default=True)
    kyb_verified = models.BooleanField(_('KYB verified'), default=False)
    kyb_verified_at = models.DateTimeField(_('KYB verified at'), blank=True, null=True)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_groups'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('chama group')
        verbose_name_plural = _('chama groups')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def is_kyb_complete(self):
        """Check if group has completed KYB."""
        return bool(
            self.registration_certificate and
            self.kra_pin and
            self.kra_document and
            self.articles_of_association
        )


class GroupMembership(models.Model):
    """Model for group membership and roles."""
    
    ROLES = [
        ('ADMIN', 'Administrator'),
        ('CHAIRPERSON', 'Chairperson'),
        ('TREASURER', 'Treasurer'),
        ('SECRETARY', 'Secretary'),
        ('MEMBER', 'Member'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('EXITED', 'Exited'),
    ]
    
    group = models.ForeignKey(ChamaGroup, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_memberships')
    role = models.CharField(_('role'), max_length=20, choices=ROLES, default='MEMBER')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Membership details
    joined_at = models.DateTimeField(_('joined at'), auto_now_add=True)
    approved_at = models.DateTimeField(_('approved at'), blank=True, null=True)
    exited_at = models.DateTimeField(_('exited at'), blank=True, null=True)
    
    # Member's contribution to this group
    total_contributions = models.DecimalField(
        _('total contributions'),
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    class Meta:
        verbose_name = _('group membership')
        verbose_name_plural = _('group memberships')
        unique_together = ['group', 'user']
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.group.name} ({self.role})"


class GroupOfficial(models.Model):
    """Model for elected group officials."""
    
    POSITION_CHOICES = [
        ('CHAIRPERSON', 'Chairperson'),
        ('VICE_CHAIRPERSON', 'Vice Chairperson'),
        ('TREASURER', 'Treasurer'),
        ('SECRETARY', 'Secretary'),
        ('ORGANIZING_SECRETARY', 'Organizing Secretary'),
    ]
    
    group = models.ForeignKey(ChamaGroup, on_delete=models.CASCADE, related_name='officials')
    membership = models.ForeignKey(GroupMembership, on_delete=models.CASCADE, related_name='official_positions')
    position = models.CharField(_('position'), max_length=30, choices=POSITION_CHOICES)
    
    # Term details
    elected_at = models.DateTimeField(_('elected at'), auto_now_add=True)
    term_start = models.DateField(_('term start'))
    term_end = models.DateField(_('term end'))
    is_current = models.BooleanField(_('is current'), default=True)
    
    class Meta:
        verbose_name = _('group official')
        verbose_name_plural = _('group officials')
        unique_together = ['group', 'position', 'is_current']
        ordering = ['-elected_at']
    
    def __str__(self):
        return f"{self.membership.user.get_full_name()} - {self.position} ({self.group.name})"


class GroupGoal(models.Model):
    """Model for tracking group financial goals."""
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ACHIEVED', 'Achieved'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    group = models.ForeignKey(ChamaGroup, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    target_amount = models.DecimalField(_('target amount'), max_digits=15, decimal_places=2)
    current_amount = models.DecimalField(_('current amount'), max_digits=15, decimal_places=2, default=Decimal('0.00'))
    target_date = models.DateField(_('target date'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_goals'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    achieved_at = models.DateTimeField(_('achieved at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('group goal')
        verbose_name_plural = _('group goals')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.title}"
    
    @property
    def progress_percentage(self):
        """Calculate goal progress percentage."""
        from decimal import Decimal
        if self.target_amount > Decimal('0'):
            percentage = (self.current_amount / self.target_amount) * Decimal('100')
            return float(percentage)
        return 0.0


class GroupMessage(models.Model):
    """Model for group chat messages."""
    
    group = models.ForeignKey(
        ChamaGroup,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='group_messages'
    )
    content = models.TextField(_('content'))
    
    # Optional file attachment
    attachment = models.FileField(
        _('attachment'),
        upload_to='groups/messages/attachments/',
        blank=True,
        null=True
    )
    attachment_name = models.CharField(
        _('attachment name'),
        max_length=255,
        blank=True
    )
    
    # Message metadata
    is_edited = models.BooleanField(_('is edited'), default=False)
    edited_at = models.DateTimeField(_('edited at'), blank=True, null=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('group message')
        verbose_name_plural = _('group messages')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['group', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} in {self.group.name}: {self.content[:50]}"

