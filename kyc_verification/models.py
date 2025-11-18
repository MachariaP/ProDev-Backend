from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class KYCDocument(models.Model):
    """KYC/Identity verification documents."""
    
    DOCUMENT_TYPE_CHOICES = [
        ('NATIONAL_ID', 'National ID'),
        ('PASSPORT', 'Passport'),
        ('DRIVERS_LICENSE', 'Drivers License'),
        ('PROOF_OF_RESIDENCE', 'Proof of Residence'),
        ('BANK_STATEMENT', 'Bank Statement'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kyc_documents')
    document_type = models.CharField(_('document type'), max_length=30, choices=DOCUMENT_TYPE_CHOICES)
    document_number = models.CharField(_('document number'), max_length=50)
    document_file = models.FileField(_('document file'), upload_to='kyc/')
    
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    issue_date = models.DateField(_('issue date'))
    expiry_date = models.DateField(_('expiry date'), blank=True, null=True)
    
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_documents')
    verified_at = models.DateTimeField(_('verified at'), blank=True, null=True)
    rejection_reason = models.TextField(_('rejection reason'), blank=True)
    
    uploaded_at = models.DateTimeField(_('uploaded at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('KYC document')
        verbose_name_plural = _('KYC documents')
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.document_type} - {self.status}"


class BiometricData(models.Model):
    """Biometric authentication data."""
    
    BIOMETRIC_TYPE_CHOICES = [
        ('FINGERPRINT', 'Fingerprint'),
        ('FACE', 'Face Recognition'),
        ('IRIS', 'Iris Scan'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='biometric_data')
    biometric_type = models.CharField(_('biometric type'), max_length=20, choices=BIOMETRIC_TYPE_CHOICES)
    biometric_hash = models.CharField(_('biometric hash'), max_length=256, help_text=_('Encrypted biometric template'))
    
    is_active = models.BooleanField(_('is active'), default=True)
    registered_at = models.DateTimeField(_('registered at'), auto_now_add=True)
    last_used_at = models.DateTimeField(_('last used at'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('biometric data')
        verbose_name_plural = _('biometric data')
        unique_together = ['user', 'biometric_type']
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.biometric_type}"


class VerificationWorkflow(models.Model):
    """Member verification workflow tracking."""
    
    STATUS_CHOICES = [
        ('INITIATED', 'Initiated'),
        ('DOCUMENTS_SUBMITTED', 'Documents Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ADDITIONAL_INFO_REQUIRED', 'Additional Info Required'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='verification_workflow')
    status = models.CharField(_('status'), max_length=30, choices=STATUS_CHOICES, default='INITIATED')
    
    documents_complete = models.BooleanField(_('documents complete'), default=False)
    biometric_complete = models.BooleanField(_('biometric complete'), default=False)
    compliance_check_complete = models.BooleanField(_('compliance check complete'), default=False)
    
    workflow_notes = models.TextField(_('workflow notes'), blank=True)
    reviewer_notes = models.TextField(_('reviewer notes'), blank=True)
    
    initiated_at = models.DateTimeField(_('initiated at'), auto_now_add=True)
    completed_at = models.DateTimeField(_('completed at'), blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_verifications')
    
    class Meta:
        verbose_name = _('verification workflow')
        verbose_name_plural = _('verification workflows')
        ordering = ['-initiated_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.status}"
