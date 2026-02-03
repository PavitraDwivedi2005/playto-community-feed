from django.urls import path
from core.views import (
    PostListView,
    PostDetailView,
    CommentCreateView,
    LikePostView,
    LikeCommentView,
    LeaderboardView,
)

urlpatterns = [
    path('posts/', PostListView.as_view()),
    path('posts/<int:post_id>/', PostDetailView.as_view()),
    path('comments/', CommentCreateView.as_view()),
    path('posts/<int:post_id>/like/', LikePostView.as_view()),
    path('comments/<int:comment_id>/like/', LikeCommentView.as_view()),
    path('leaderboard/', LeaderboardView.as_view()),
]
