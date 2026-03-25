from django.contrib import admin
from .models import PLUAnalysisRecord


@admin.register(PLUAnalysisRecord)
class PLUAnalysisRecordAdmin(admin.ModelAdmin):
    list_display = ('commune', 'section', 'parcelle', 'user', 'created_at')
    search_fields = ('commune', 'section', 'parcelle', 'user__email')
    list_filter = ('commune', 'created_at')
