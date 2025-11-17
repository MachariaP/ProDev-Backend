from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class GroupConstitution(models.Model):
    """Model for group constitution and rules."""
    
    group = models.OneToOneField('groups.ChamaGroup', on_delete=models.CASCADE, related_name='constitution')
    
    # Constitution content
    title = models.CharField(_('title'), max_length=200, default='Group Constitution')
    content = models.TextField(_('content'), help_text=_('Full constitution text'))
    
    # Rules and policies
    membership_rules = models.TextField(_('membership rules'), blank=True)
    contribution_rules = models.TextField(_('contribution rules'), blank=True)
    loan_policy = models.TextField(_('loan policy'), blank=True)
    exit_procedure = models.TextField(_('exit procedure'), blank=True)
    
    # Fines and penalties
    late_contribution_fine = models.DecimalField(
        _('late contribution fine'),
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    missed_meeting_fine = models.DecimalField(
        _('missed meeting fine'),
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    
    # Document
    constitution_document = models.FileField(
        _('constitution document'),
        upload_to='governance/constitutions/',
        blank=True,
        null=True
    )
    
    # Metadata
    version = models.PositiveIntegerField(_('version'), default=1)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_constitutions'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    approved_at = models.DateTimeField(_('approved at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('group constitution')
        verbose_name_plural = _('group constitutions')
    
    def __str__(self):
        return f"{self.group.name} - Constitution v{self.version}"


class Fine(models.Model):
    """Model for tracking fines applied to members."""
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('WAIVED', 'Waived'),
    ]
    
    FINE_TYPE_CHOICES = [
        ('LATE_CONTRIBUTION', 'Late Contribution'),
        ('MISSED_MEETING', 'Missed Meeting'),
        ('BREACH_OF_RULES', 'Breach of Rules'),
        ('OTHER', 'Other'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='fines')
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fines')
    fine_type = models.CharField(_('fine type'), max_length=30, choices=FINE_TYPE_CHOICES)
    amount = models.DecimalField(_('amount'), max_digits=8, decimal_places=2)
    reason = models.TextField(_('reason'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Metadata
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_fines'
    )
    issued_at = models.DateTimeField(_('issued at'), auto_now_add=True)
    paid_at = models.DateTimeField(_('paid at'), blank=True, null=True)
    waived_at = models.DateTimeField(_('waived at'), blank=True, null=True)
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('fine')
        verbose_name_plural = _('fines')
        ordering = ['-issued_at']
    
    def __str__(self):
        return f"{self.member.get_full_name()} - {self.fine_type} - KES {self.amount}"


class Vote(models.Model):
    """Model for digital voting on group decisions."""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    VOTE_TYPE_CHOICES = [
        ('SIMPLE', 'Simple Majority'),
        ('TWO_THIRDS', 'Two-Thirds Majority'),
        ('UNANIMOUS', 'Unanimous'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='votes')
    title = models.CharField(_('title'), max_length=200)
    description = models.TextField(_('description'))
    vote_type = models.CharField(_('vote type'), max_length=20, choices=VOTE_TYPE_CHOICES, default='SIMPLE')
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Voting options (for simple yes/no, we track in VoteBallot)
    allow_proxy = models.BooleanField(_('allow proxy voting'), default=True)
    
    # Timing
    start_date = models.DateTimeField(_('start date'))
    end_date = models.DateTimeField(_('end date'))
    
    # Results
    total_eligible_voters = models.PositiveIntegerField(_('total eligible voters'), default=0)
    total_votes_cast = models.PositiveIntegerField(_('total votes cast'), default=0)
    yes_votes = models.PositiveIntegerField(_('yes votes'), default=0)
    no_votes = models.PositiveIntegerField(_('no votes'), default=0)
    abstain_votes = models.PositiveIntegerField(_('abstain votes'), default=0)
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_votes'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('vote')
        verbose_name_plural = _('votes')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.title}"
    
    @property
    def is_passed(self):
        """Check if vote has passed based on vote type."""
        if self.total_votes_cast == 0:
            return False
        
        yes_percentage = (self.yes_votes / self.total_votes_cast) * 100
        
        if self.vote_type == 'SIMPLE':
            return yes_percentage > 50
        elif self.vote_type == 'TWO_THIRDS':
            return yes_percentage >= 66.67
        elif self.vote_type == 'UNANIMOUS':
            return self.yes_votes == self.total_votes_cast
        
        return False


class VoteBallot(models.Model):
    """Model for individual vote ballots."""
    
    CHOICE_OPTIONS = [
        ('YES', 'Yes'),
        ('NO', 'No'),
        ('ABSTAIN', 'Abstain'),
    ]
    
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name='ballots')
    voter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vote_ballots')
    choice = models.CharField(_('choice'), max_length=10, choices=CHOICE_OPTIONS)
    
    # Proxy voting
    is_proxy = models.BooleanField(_('is proxy vote'), default=False)
    proxy_for = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='proxy_votes'
    )
    
    # Metadata
    cast_at = models.DateTimeField(_('cast at'), auto_now_add=True)
    comments = models.TextField(_('comments'), blank=True)
    
    class Meta:
        verbose_name = _('vote ballot')
        verbose_name_plural = _('vote ballots')
        unique_together = ['vote', 'voter']
        ordering = ['-cast_at']
    
    def __str__(self):
        return f"{self.voter.get_full_name()} - {self.choice}"


class Document(models.Model):
    """Model for storing group documents."""
    
    DOCUMENT_TYPE_CHOICES = [
        ('MEETING_MINUTES', 'Meeting Minutes'),
        ('FINANCIAL_STATEMENT', 'Financial Statement'),
        ('CONSTITUTION', 'Constitution'),
        ('POLICY', 'Policy Document'),
        ('REPORT', 'Report'),
        ('OTHER', 'Other'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(_('title'), max_length=200)
    document_type = models.CharField(_('document type'), max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    description = models.TextField(_('description'), blank=True)
    file = models.FileField(_('file'), upload_to='governance/documents/')
    
    # Access control
    is_public = models.BooleanField(_('is public'), default=False, help_text=_('Visible to all members'))
    
    # Metadata
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )
    uploaded_at = models.DateTimeField(_('uploaded at'), auto_now_add=True)
    file_size = models.PositiveIntegerField(_('file size (bytes)'), default=0)
    
    class Meta:
        verbose_name = _('document')
        verbose_name_plural = _('documents')
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.group.name} - {self.title}"


class ComplianceRecord(models.Model):
    """Model for tracking compliance and regulatory information."""
    
    STATUS_CHOICES = [
        ('COMPLIANT', 'Compliant'),
        ('NON_COMPLIANT', 'Non-Compliant'),
        ('PENDING', 'Pending'),
    ]
    
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.CASCADE, related_name='compliance_records')
    
    # Compliance areas
    odpc_registered = models.BooleanField(_('ODPC registered'), default=False)
    odpc_registration_number = models.CharField(_('ODPC registration number'), max_length=100, blank=True)
    
    aml_kyc_compliant = models.BooleanField(_('AML/KYC compliant'), default=False)
    security_certified = models.BooleanField(_('security certified'), default=False)
    certification_type = models.CharField(_('certification type'), max_length=100, blank=True, help_text=_('e.g., ISO 27001'))
    
    # Status
    overall_status = models.CharField(_('overall status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Documents
    compliance_certificate = models.FileField(
        _('compliance certificate'),
        upload_to='governance/compliance/',
        blank=True,
        null=True
    )
    
    # Metadata
    last_audit_date = models.DateField(_('last audit date'), blank=True, null=True)
    next_audit_date = models.DateField(_('next audit date'), blank=True, null=True)
    notes = models.TextField(_('notes'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('compliance record')
        verbose_name_plural = _('compliance records')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.group.name} - Compliance ({self.overall_status})"

