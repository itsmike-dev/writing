from django.contrib import admin
from django.utils.html import format_html

from .models import Essay, LoginActivity, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "display_name", "last_login_at", "last_login_ip")
    search_fields = ("user__username", "display_name", "last_login_ip")
    readonly_fields = ("last_login_at", "last_login_ip", "last_login_user_agent")


@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
    list_display = ("user", "occurred_at", "ip_address", "success", "user_agent_short")
    list_filter = ("success", "occurred_at")
    search_fields = ("user__username", "ip_address", "user_agent")
    ordering = ("-occurred_at",)
    readonly_fields = ("occurred_at",)

    def user_agent_short(self, obj):
        if not obj.user_agent:
            return "-"
        return format_html("<span title='{}'>{}</span>", obj.user_agent, obj.user_agent[:40] + "…")

    user_agent_short.short_description = "User agent"


@admin.register(Essay)
class EssayAdmin(admin.ModelAdmin):
    list_display = ("user", "title_or_topic", "task_type", "word_count", "updated_at")
    list_filter = ("task_type", "created_at", "updated_at")
    search_fields = ("user__username", "title", "topic_text", "content")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-updated_at",)

    def title_or_topic(self, obj):
        if obj.title:
            return obj.title
        if obj.topic_text:
            return (obj.topic_text[:60] + "…") if len(obj.topic_text) > 60 else obj.topic_text
        return "Untitled"

    title_or_topic.short_description = "Essay"


# Admin site branding for clarity when reviewing data
admin.site.site_header = "IELTS Writing Admin"
admin.site.site_title = "IELTS Writing Admin"
admin.site.index_title = "Administration"
