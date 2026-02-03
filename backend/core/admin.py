from django.contrib import admin
from core.models import Post, Comment, Like, KarmaTransaction


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "created_at")
    search_fields = ("content",)
    list_filter = ("created_at",)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "parent", "created_at")
    search_fields = ("content",)
    list_filter = ("created_at",)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "comment", "created_at")
    list_filter = ("created_at",)


@admin.register(KarmaTransaction)
class KarmaTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "points", "created_at")
    list_filter = ("created_at",)
