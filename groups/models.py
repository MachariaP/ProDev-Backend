"""
Models for the groups app.

This module contains models for managing Chama groups, including group information,
membership management, officials, goals, and messaging.
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class ChamaGroup(models.Model):
    """
    Model representing a Chama group with KYB (Know Your Business) information.
    
    A Chama group is a community-based savings and investment group. This model
    stores group information, settings, financial data, and verification status.
    
    Attributes:
        name (str): The name of the group
        description (str): Detailed description of the group
        group_type (str): Type of group (Savings, Investment, Welfare, Mixed)
        objectives (str): Group goals and objectives
        registration_certificate (File): Business registration certificate
        kra_pin (str): Kenya Revenue Authority PIN number
        kra_document (File): KRA registration/tax compliance document
        articles_of_association (File): Legal document outlining group rules
        contribution_frequency (str): How often members contribute
        minimum_contribution (Decimal): Minimum contribution amount
        total_balance (Decimal): Current group financial balance
        is_active (bool): Whether the group is currently active
        kyb_verified (bool): Whether KYB verification is complete
        kyb_verified_at (datetime): When KYB verification was completed
        created_by (User): User who created the group
        created_at (datetime): When the group was created
        updated_at (datetime): When the group was last updated
    
    Methods:
        is_kyb_complete(): Check if all KYB documents are provided
    """
    
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
        null=True,
        help_text=_('Official business registration certificate')
    )
    kra_pin = models.CharField(
        _('KRA PIN'),
        max_length=20,
        blank=True,
        help_text=_('Kenya Revenue Authority Personal Identification Number')
    )
    kra_document = models.FileField(
        _('KRA document'),
        upload_to='groups/kyb/kra/',
        blank=True,
        null=True,
        help_text=_('KRA registration or tax compliance document')
    )
    articles_of_association = models.FileField(
        _('articles of association'),
        upload_to='groups/kyb/articles/',
        blank=True,
        null=True,
        help_text=_('Legal document outlining group rules and structure')
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
        default='MONTHLY',
        help_text=_('How often members are expected to contribute')
    )
    minimum_contribution = models.DecimalField(
        _('minimum contribution'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Minimum amount required per contribution period')
    )
    
    # Group balance
    total_balance = models.DecimalField(
        _('total balance'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Current total funds available in the group')
    )
    
    # Status
    is_active = models.BooleanField(
        _('is active'),
        default=True,
        help_text=_('Whether the group is currently active and accepting contributions')
    )
    kyb_verified = models.BooleanField(
        _('KYB verified'),
        default=False,
        help_text=_('Whether the group has completed KYB verification')
    )
    kyb_verified_at = models.DateTimeField(
        _('KYB verified at'),
        blank=True,
        null=True,
        help_text=_('Timestamp when KYB verification was completed')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_groups',
        help_text=_('User who created this group')
    )
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('Timestamp when the group was created')
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        help_text=_('Timestamp when the group was last updated')
    )
    
    class Meta:
        """Meta options for ChamaGroup model."""
        verbose_name = _('chama group')
        verbose_name_plural = _('chama groups')
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'created_by'],
                name='unique_group_name_per_creator',
                condition=models.Q(created_by__isnull=False),
                violation_error_message=_('You already have a group with this name. Please choose a different name.')
            )
        ]
        indexes = [
            models.Index(fields=['created_by', 'created_at']),
            models.Index(fields=['is_active', 'kyb_verified']),
        ]
    
    def __str__(self):
        """String representation of the group."""
        return self.name
    
    @property
    def is_kyb_complete(self):
        """
        Check if group has completed all required KYB documentation.
        
        Returns:
            bool: True if all required KYB documents are provided, False otherwise
        """
        return bool(
            self.registration_certificate and
            self.kra_pin and
            self.kra_document and
            self.articles_of_association
        )
    
    def clean(self):
        """
        Custom validation for the ChamaGroup model.
        
        This method is called during model validation to ensure data integrity.
        """
        from django.core.exceptions import ValidationError
        
        # Ensure minimum contribution is not negative
        if self.minimum_contribution < Decimal('0.00'):
            raise ValidationError({
                'minimum_contribution': _('Minimum contribution cannot be negative.')
            })
        
        # Ensure total balance is not negative
        if self.total_balance < Decimal('0.00'):
            raise ValidationError({
                'total_balance': _('Group balance cannot be negative.')
            })


class GroupMembership(models.Model):
    """
    Model representing membership of a user in a Chama group.
    
    This model tracks user roles, status, contributions, and membership timeline
    within a specific Chama group.
    
    Attributes:
        group (ChamaGroup): The group the user belongs to
        user (User): The user who is a member
        role (str): User's role in the group (Admin, Chairperson, Treasurer, etc.)
        status (str): Membership status (Pending, Active, Suspended, Exited)
        joined_at (datetime): When the user joined or requested to join
        approved_at (datetime): When the membership was approved
        exited_at (datetime): When the user left the group
        total_contributions (Decimal): Total amount contributed by this member
    
    Methods:
        is_active(): Check if membership is currently active
    """
    
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
    
    group = models.ForeignKey(
        ChamaGroup,
        on_delete=models.CASCADE,
        related_name='memberships',
        help_text=_('The group this membership belongs to')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='group_memberships',
        help_text=_('The user who is a member of the group')
    )
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=ROLES,
        default='MEMBER',
        help_text=_('User role within the group')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text=_('Current status of the membership')
    )
    
    # Membership details
    joined_at = models.DateTimeField(
        _('joined at'),
        auto_now_add=True,
        help_text=_('Timestamp when the user joined or requested to join')
    )
    approved_at = models.DateTimeField(
        _('approved at'),
        blank=True,
        null=True,
        help_text=_('Timestamp when the membership was approved')
    )
    exited_at = models.DateTimeField(
        _('exited at'),
        blank=True,
        null=True,
        help_text=_('Timestamp when the user left the group')
    )
    
    # Member's contribution to this group
    total_contributions = models.DecimalField(
        _('total contributions'),
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Total amount contributed by this member to the group')
    )
    
    class Meta:
        """Meta options for GroupMembership model."""
        verbose_name = _('group membership')
        verbose_name_plural = _('group memberships')
        unique_together = ['group', 'user']
        ordering = ['-joined_at']
        indexes = [
            models.Index(fields=['group', 'status']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        """String representation of the membership."""
        return f"{self.user.get_full_name()} - {self.group.name} ({self.role})"
    
    @property
    def is_active(self):
        """
        Check if the membership is currently active.
        
        Returns:
            bool: True if status is 'ACTIVE', False otherwise
        """
        return self.status == 'ACTIVE'
    
    def clean(self):
        """Custom validation for GroupMembership."""
        from django.core.exceptions import ValidationError
        
        # Ensure total contributions are not negative
        if self.total_contributions < Decimal('0.00'):
            raise ValidationError({
                'total_contributions': _('Total contributions cannot be negative.')
            })


class GroupOfficial(models.Model):
    """
    Model representing elected officials in a Chama group.
    
    This model tracks group leadership positions, election dates, and terms
    of service for group officials.
    
    Attributes:
        group (ChamaGroup): The group the official serves in
        membership (GroupMembership): The member who holds the position
        position (str): Official position (Chairperson, Treasurer, etc.)
        elected_at (datetime): When the official was elected/appointed
        term_start (date): Start date of the term
        term_end (date): End date of the term
        is_current (bool): Whether this is the current official for the position
    
    Methods:
        is_in_term(): Check if current date is within the term period
    """
    
    POSITION_CHOICES = [
        ('CHAIRPERSON', 'Chairperson'),
        ('VICE_CHAIRPERSON', 'Vice Chairperson'),
        ('TREASURER', 'Treasurer'),
        ('SECRETARY', 'Secretary'),
        ('ORGANIZING_SECRETARY', 'Organizing Secretary'),
    ]
    
    group = models.ForeignKey(
        ChamaGroup,
        on_delete=models.CASCADE,
        related_name='officials',
        help_text=_('The group this official serves in')
    )
    membership = models.ForeignKey(
        GroupMembership,
        on_delete=models.CASCADE,
        related_name='official_positions',
        help_text=_('The member who holds this official position')
    )
    position = models.CharField(
        _('position'),
        max_length=30,
        choices=POSITION_CHOICES,
        help_text=_('Official position within the group')
    )
    
    # Term details
    elected_at = models.DateTimeField(
        _('elected at'),
        auto_now_add=True,
        help_text=_('Timestamp when the official was elected or appointed')
    )
    term_start = models.DateField(
        _('term start'),
        help_text=_('Start date of the official term')
    )
    term_end = models.DateField(
        _('term end'),
        help_text=_('End date of the official term')
    )
    is_current = models.BooleanField(
        _('is current'),
        default=True,
        help_text=_('Whether this is the current official for this position')
    )
    
    class Meta:
        """Meta options for GroupOfficial model."""
        verbose_name = _('group official')
        verbose_name_plural = _('group officials')
        unique_together = ['group', 'position', 'is_current']
        ordering = ['-elected_at']
        indexes = [
            models.Index(fields=['group', 'is_current']),
            models.Index(fields=['membership', 'is_current']),
        ]
    
    def __str__(self):
        """String representation of the official."""
        return f"{self.membership.user.get_full_name()} - {self.position} ({self.group.name})"
    
    @property
    def is_in_term(self):
        """
        Check if the current date is within the official's term.
        
        Returns:
            bool: True if current date is between term_start and term_end, False otherwise
        """
        from django.utils.timezone import now
        current_date = now().date()
        return self.term_start <= current_date <= self.term_end
    
    def clean(self):
        """Custom validation for GroupOfficial."""
        from django.core.exceptions import ValidationError
        
        # Ensure term_end is after term_start
        if self.term_end <= self.term_start:
            raise ValidationError({
                'term_end': _('Term end date must be after term start date.')
            })
        
        # Ensure the membership belongs to the same group
        if self.membership.group != self.group:
            raise ValidationError({
                'membership': _('The selected member must belong to the same group.')
            })


class GroupGoal(models.Model):
    """
    Model representing financial goals for a Chama group.
    
    This model tracks group financial targets, progress, and achievement status.
    
    Attributes:
        group (ChamaGroup): The group this goal belongs to
        title (str): Goal title/name
        description (str): Detailed description of the goal
        target_amount (Decimal): Financial target amount
        current_amount (Decimal): Current amount saved toward the goal
        target_date (date): Target completion date
        status (str): Goal status (Active, Achieved, Cancelled)
        created_by (User): User who created the goal
        created_at (datetime): When the goal was created
        updated_at (datetime): When the goal was last updated
        achieved_at (datetime): When the goal was achieved
    
    Methods:
        progress_percentage(): Calculate progress as a percentage
        is_overdue(): Check if goal is past target date and not achieved
    """
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('ACHIEVED', 'Achieved'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    group = models.ForeignKey(
        ChamaGroup,
        on_delete=models.CASCADE,
        related_name='goals',
        help_text=_('The group this goal belongs to')
    )
    title = models.CharField(
        _('title'),
        max_length=200,
        help_text=_('Name or title of the goal')
    )
    description = models.TextField(
        _('description'),
        help_text=_('Detailed description of what the goal aims to achieve')
    )
    target_amount = models.DecimalField(
        _('target amount'),
        max_digits=15,
        decimal_places=2,
        help_text=_('Financial target amount for the goal')
    )
    current_amount = models.DecimalField(
        _('current amount'),
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text=_('Current amount saved toward the goal')
    )
    target_date = models.DateField(
        _('target date'),
        help_text=_('Target date for achieving the goal')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        help_text=_('Current status of the goal')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_goals',
        help_text=_('User who created this goal')
    )
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('Timestamp when the goal was created')
    )
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True,
        help_text=_('Timestamp when the goal was last updated')
    )
    achieved_at = models.DateTimeField(
        _('achieved at'),
        blank=True,
        null=True,
        help_text=_('Timestamp when the goal was achieved')
    )
    
    class Meta:
        """Meta options for GroupGoal model."""
        verbose_name = _('group goal')
        verbose_name_plural = _('group goals')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group', 'status']),
            models.Index(fields=['target_date', 'status']),
        ]
    
    def __str__(self):
        """String representation of the goal."""
        return f"{self.group.name} - {self.title}"
    
    @property
    def progress_percentage(self):
        """
        Calculate goal progress as a percentage.
        
        Returns:
            float: Progress percentage (0-100)
        """
        from decimal import Decimal
        if self.target_amount > Decimal('0'):
            percentage = (self.current_amount / self.target_amount) * Decimal('100')
            return float(min(percentage, Decimal('100')))  # Cap at 100%
        return 0.0
    
    @property
    def is_overdue(self):
        """
        Check if the goal is past its target date and not achieved.
        
        Returns:
            bool: True if target_date has passed and status is not 'ACHIEVED', False otherwise
        """
        from django.utils.timezone import now
        if self.status == 'ACHIEVED':
            return False
        return now().date() > self.target_date
    
    def clean(self):
        """Custom validation for GroupGoal."""
        from django.core.exceptions import ValidationError
        
        # Ensure amounts are not negative
        if self.target_amount < Decimal('0.00'):
            raise ValidationError({
                'target_amount': _('Target amount cannot be negative.')
            })
        
        if self.current_amount < Decimal('0.00'):
            raise ValidationError({
                'current_amount': _('Current amount cannot be negative.')
            })
        
        # Ensure current amount doesn't exceed target amount unless goal is achieved
        if self.current_amount > self.target_amount and self.status != 'ACHIEVED':
            raise ValidationError({
                'current_amount': _('Current amount cannot exceed target amount for active goals.')
            })


class GroupMessage(models.Model):
    """
    Model representing chat messages within a Chama group.
    
    This model stores group conversation messages, including text content
    and optional file attachments.
    
    Attributes:
        group (ChamaGroup): The group the message belongs to
        user (User): The user who sent the message
        content (str): Message text content
        attachment (File): Optional file attachment
        attachment_name (str): Original name of the attached file
        is_edited (bool): Whether the message has been edited
        edited_at (datetime): When the message was last edited
        created_at (datetime): When the message was sent
    
    Methods:
        can_edit(user): Check if a user can edit this message
        can_delete(user): Check if a user can delete this message
    """
    
    group = models.ForeignKey(
        ChamaGroup,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text=_('The group this message belongs to')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='group_messages',
        help_text=_('User who sent this message')
    )
    content = models.TextField(
        _('content'),
        help_text=_('Text content of the message')
    )
    
    # Optional file attachment
    attachment = models.FileField(
        _('attachment'),
        upload_to='groups/messages/attachments/',
        blank=True,
        null=True,
        help_text=_('Optional file attachment')
    )
    attachment_name = models.CharField(
        _('attachment name'),
        max_length=255,
        blank=True,
        help_text=_('Original name of the attached file')
    )
    
    # Message metadata
    is_edited = models.BooleanField(
        _('is edited'),
        default=False,
        help_text=_('Whether this message has been edited')
    )
    edited_at = models.DateTimeField(
        _('edited at'),
        blank=True,
        null=True,
        help_text=_('Timestamp when the message was last edited')
    )
    
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('Timestamp when the message was sent')
    )
    
    class Meta:
        """Meta options for GroupMessage model."""
        verbose_name = _('group message')
        verbose_name_plural = _('group messages')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['group', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        """String representation of the message."""
        truncated_content = self.content[:50] + '...' if len(self.content) > 50 else self.content
        return f"{self.user.get_full_name()} in {self.group.name}: {truncated_content}"
    
    def can_edit(self, user):
        """
        Check if a user can edit this message.
        
        Args:
            user (User): The user to check permissions for
        
        Returns:
            bool: True if user can edit the message, False otherwise
        """
        # Only the original sender can edit their messages
        return self.user == user
    
    def can_delete(self, user):
        """
        Check if a user can delete this message.
        
        Args:
            user (User): The user to check permissions for
        
        Returns:
            bool: True if user can delete the message, False otherwise
        """
        # Original sender or group admin can delete messages
        from .models import GroupMembership
        is_admin = GroupMembership.objects.filter(
            group=self.group,
            user=user,
            role__in=['ADMIN', 'CHAIRPERSON'],
            status='ACTIVE'
        ).exists()
        return self.user == user or is_admin
    
    def clean(self):
        """Custom validation for GroupMessage."""
        from django.core.exceptions import ValidationError
        
        # Ensure content is not empty when there's no attachment
        if not self.content.strip() and not self.attachment:
            raise ValidationError({
                'content': _('Message must have either content or an attachment.')
            })
        
        # Ensure the user is a member of the group
        if not self.group.memberships.filter(user=self.user, status='ACTIVE').exists():
            raise ValidationError({
                'user': _('Only active group members can send messages.')
            })
