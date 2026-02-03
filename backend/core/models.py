from django.conf import settings
from django.db import models
from django.db.models import Q

User = settings.AUTH_USER_MODEL


class Post(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post {self.id} by {self.author}"


class Comment(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment {self.id} by {self.author}"


class Like(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    post = models.ForeignKey(
        Post,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    comment = models.ForeignKey(
        Comment,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'post'],
                condition=Q(post__isnull=False),
                name='unique_user_post_like'
            ),
            models.UniqueConstraint(
                fields=['user', 'comment'],
                condition=Q(comment__isnull=False),
                name='unique_user_comment_like'
            ),
        ]

    def __str__(self):
        target = self.post if self.post else self.comment
        return f"Like by {self.user} on {target}"


class KarmaTransaction(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='karma_transactions'
    )
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    # Optional references (useful for debugging/audit)
    post = models.ForeignKey(
        Post,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    comment = models.ForeignKey(
        Comment,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    def __str__(self):
        return f"{self.user} +{self.points} karma"
