from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.models import Post, Comment
from core.serializers import (
    PostSerializer,
    CommentSerializer,
    PostCreateSerializer,
    CommentCreateSerializer,
)
from core.services import (
    like_post,
    like_comment,
    get_leaderboard_last_24h,
)
from core.utils import build_comment_tree


class PostListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        posts = (
            Post.objects
            .annotate(like_count=Count('likes'))
            .select_related('author')
            .order_by('-created_at')
        )
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            from django.contrib.auth.models import User
            request.user, created = User.objects.get_or_create(
                username='masked-username',
                defaults={'email': 'masked@example.com'}
            )
        serializer = PostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = serializer.save(author=request.user)

        return Response(
            PostSerializer(post).data,
            status=status.HTTP_201_CREATED
        )


class PostDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, post_id):
        post = (
            Post.objects
            .select_related('author')
            .annotate(like_count=Count('likes'))
            .get(id=post_id)
        )

        comments = (
            Comment.objects
            .filter(post=post)
            .select_related('author')
            .annotate(like_count=Count('likes'))
            .order_by('created_at')
        )

        comment_tree = build_comment_tree(comments)
        comments_data = CommentSerializer(comment_tree, many=True).data

        post_data = PostSerializer(post).data
        post_data['comments'] = comments_data

        return Response(post_data)


class CommentCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not request.user.is_authenticated:
            from django.contrib.auth.models import User
            request.user, created = User.objects.get_or_create(
                username='masked-username',
                defaults={'email': 'masked@example.com'}
            )
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = serializer.save(author=request.user)

        return Response(
            CommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )


class LikePostView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, post_id):
        if not request.user.is_authenticated:
            from django.contrib.auth.models import User
            request.user, created = User.objects.get_or_create(
                username='masked-username',
                defaults={'email': 'masked@example.com'}
            )
        success = like_post(request.user, post_id)
        return Response(
            {"success": success},
            status=status.HTTP_200_OK
        )


class LikeCommentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, comment_id):
        if not request.user.is_authenticated:
            from django.contrib.auth.models import User
            request.user, created = User.objects.get_or_create(
                username='masked-username',
                defaults={'email': 'masked@example.com'}
            )
        success = like_comment(request.user, comment_id)
        return Response(
            {"success": success},
            status=status.HTTP_200_OK
        )


class LeaderboardView(APIView):
    def get(self, request):
        # Temporarily show all time leaderboard for testing
        data = get_leaderboard_last_24h()
        if not data:
            # If no data in last 24h, show all time
            from core.services import get_leaderboard_all_time
            data = get_leaderboard_all_time()
        return Response(data)
