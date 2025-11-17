from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with email as the primary identifier."""
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(_('phone number'), max_length=15, blank=True)
    
    # KYC fields
    id_number = models.CharField(_('ID number'), max_length=20, blank=True)
    kra_pin = models.CharField(_('KRA PIN'), max_length=20, blank=True)
    id_document = models.FileField(_('ID document'), upload_to='kyc/ids/', blank=True, null=True)
    kra_document = models.FileField(_('KRA document'), upload_to='kyc/kra/', blank=True, null=True)
    kyc_verified = models.BooleanField(_('KYC verified'), default=False)
    kyc_verified_at = models.DateTimeField(_('KYC verified at'), blank=True, null=True)
    
    # Profile fields
    profile_picture = models.ImageField(_('profile picture'), upload_to='profiles/', blank=True, null=True)
    date_of_birth = models.DateField(_('date of birth'), blank=True, null=True)
    address = models.TextField(_('address'), blank=True)
    
    # Credit score (internal to the platform)
    credit_score = models.DecimalField(
        _('credit score'),
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text=_('Internal credit score based on payment history')
    )
    
    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f'{self.first_name} {self.last_name}'
        return full_name.strip() or self.email
    
    @property
    def is_kyc_complete(self):
        """Check if user has completed KYC."""
        return bool(self.id_number and self.kra_pin and self.id_document and self.kra_document)


class MemberWallet(models.Model):
    """Individual member wallet for tracking personal funds within groups."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(
        _('balance'),
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    
    # Metadata
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('member wallet')
        verbose_name_plural = _('member wallets')
    
    def __str__(self):
        return f"{self.user.get_full_name()}'s Wallet - KES {self.balance}"

