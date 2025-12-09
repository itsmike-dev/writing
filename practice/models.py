from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserProfile(models.Model):
    """Additional user information captured around login sessions."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    display_name = models.CharField(max_length=150, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_login_user_agent = models.TextField(blank=True)

    def __str__(self) -> str:  # pragma: no cover - simple display helper
        return f"{self.user.username} profile"


class LoginActivity(models.Model):
    """Audit trail for user login attempts."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="login_activities"
    )
    occurred_at = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    success = models.BooleanField(default=True)

    class Meta:
        ordering = ["-occurred_at"]

    def __str__(self) -> str:  # pragma: no cover - simple display helper
        status = "success" if self.success else "failed"
        return f"{self.user.username} {status} @ {self.occurred_at:%Y-%m-%d %H:%M:%S}"


class Essay(models.Model):
    """Stores user essays along with basic metadata."""

    TASK_CHOICES = [
        ("task1", "Task 1"),
        ("task2", "Task 2"),
        ("practice", "Practice"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="essays"
    )
    title = models.CharField(max_length=255, blank=True)
    task_type = models.CharField(
        max_length=20, choices=TASK_CHOICES, default="practice"
    )
    topic_text = models.TextField(blank=True)
    content = models.TextField()
    word_count = models.PositiveIntegerField(default=0)
    character_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:  # pragma: no cover - simple display helper
        label = self.title or self.topic_text[:30] or "Untitled essay"
        return f"{self.user.username} — {label}"
