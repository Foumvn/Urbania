from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class PLUAnalysisRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plu_records')
    commune = models.CharField(max_length=120)
    section = models.CharField(max_length=10, blank=True)
    parcelle = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        base = f"{self.commune}"
        if self.section:
            base += f" - {self.section} {self.parcelle}"
        return base
