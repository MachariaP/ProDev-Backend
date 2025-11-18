from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ChatConversation(models.Model):
    """AI assistant chat conversations."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_conversations')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_conversations')
    
    title = models.CharField(_('title'), max_length=200, blank=True)
    is_active = models.BooleanField(_('is active'), default=True)
    
    started_at = models.DateTimeField(_('started at'), auto_now_add=True)
    last_message_at = models.DateTimeField(_('last message at'), auto_now=True)
    
    class Meta:
        verbose_name = _('chat conversation')
        verbose_name_plural = _('chat conversations')
        ordering = ['-last_message_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title or 'Conversation'}"


class ChatMessage(models.Model):
    """Individual chat messages."""
    
    ROLE_CHOICES = [
        ('USER', 'User'),
        ('ASSISTANT', 'Assistant'),
        ('SYSTEM', 'System'),
    ]
    
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(_('role'), max_length=20, choices=ROLE_CHOICES)
    content = models.TextField(_('content'))
    
    intent = models.CharField(_('intent'), max_length=50, blank=True, help_text=_('Detected user intent'))
    confidence = models.DecimalField(_('confidence'), max_digits=5, decimal_places=2, blank=True, null=True)
    
    metadata = models.JSONField(_('metadata'), default=dict, blank=True)
    
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('chat message')
        verbose_name_plural = _('chat messages')
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}"


class FinancialAdvice(models.Model):
    """AI-generated financial advice."""
    
    ADVICE_TYPE_CHOICES = [
        ('SAVINGS', 'Savings Strategy'),
        ('INVESTMENT', 'Investment Recommendation'),
        ('LOAN', 'Loan Guidance'),
        ('BUDGETING', 'Budgeting Tips'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='financial_advice')
    group = models.ForeignKey('groups.ChamaGroup', on_delete=models.SET_NULL, null=True, blank=True)
    
    advice_type = models.CharField(_('advice type'), max_length=20, choices=ADVICE_TYPE_CHOICES)
    advice_content = models.TextField(_('advice content'))
    action_items = models.JSONField(_('action items'), default=list)
    
    relevance_score = models.DecimalField(_('relevance score'), max_digits=5, decimal_places=2)
    
    generated_at = models.DateTimeField(_('generated at'), auto_now_add=True)
    user_feedback = models.CharField(_('user feedback'), max_length=20, blank=True, choices=[('HELPFUL', 'Helpful'), ('NOT_HELPFUL', 'Not Helpful')])
    
    class Meta:
        verbose_name = _('financial advice')
        verbose_name_plural = _('financial advice')
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"{self.advice_type} for {self.user.get_full_name()}"
