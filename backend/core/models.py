from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    ROLE_CHOICES = [
        ('client', 'Client'),
        ('admin', 'Administrateur'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    lang = models.CharField(max_length=5, default='fr')

    def __str__(self):
        return f"Profile for {self.user.username} ({self.role})"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)

class CerfaSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cerfa_session')
    data = models.JSONField(default=dict)
    current_step = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session for {self.user.username}"

class Dossier(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('completed', 'Terminé'),
        ('abandoned', 'Abandonné'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dossiers')
    data = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)
    pdf_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Dossier {self.id} - {self.user.username}"

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    activity_type = models.CharField(max_length=50, default='info')
    details = models.JSONField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

class AdminNotification(models.Model):
    NOTIFICATION_TYPES = [
        ('new_user', 'Nouvel Utilisateur'),
        ('new_admin', 'Nouvel Administrateur'),
        ('new_session', 'Nouvelle Session'),
        ('pdf_generated', 'PDF Généré'),
        ('system', 'Système'),
    ]
    
    title = models.CharField(max_length=100)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.created_at}"
