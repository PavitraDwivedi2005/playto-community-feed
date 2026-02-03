from django.db import transaction, IntegrityError

from core.models import Like, KarmaTransaction, Post, Comment
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum

from django.contrib.auth import get_user_model

User = get_user_model()

POST_KARMA = 5
COMMENT_KARMA = 1


@transaction.atomic
def like_post(user, post_id):
    post = Post.objects.select_for_update().get(id=post_id)

    like, created = Like.objects.get_or_create(
        user=user,
        post=post
    )
    if not created:
        # User already liked this post, so unlike
        like.delete()
        # Remove karma
        KarmaTransaction.objects.filter(
            user=post.author,
            post=post
        ).delete()
        return False  # Indicate unliked

    KarmaTransaction.objects.create(
        user=post.author,
        post=post,
        points=POST_KARMA
    )

    return True  # Indicate liked


@transaction.atomic
def like_comment(user, comment_id):
    comment = Comment.objects.select_for_update().get(id=comment_id)

    like, created = Like.objects.get_or_create(
        user=user,
        comment=comment
    )
    if not created:
        # User already liked this comment, so unlike
        like.delete()
        # Remove karma
        KarmaTransaction.objects.filter(
            user=comment.author,
            comment=comment
        ).delete()
        return False  # Indicate unliked

    KarmaTransaction.objects.create(
        user=comment.author,
        comment=comment,
        points=COMMENT_KARMA
    )

    return True  # Indicate liked
User = get_user_model()


def get_leaderboard_last_24h(limit=5):
    since = timezone.now() - timedelta(hours=24)

    leaderboard = (
        KarmaTransaction.objects
        .filter(created_at__gte=since)
        .values('user')
        .annotate(total_karma=Sum('points'))
        .order_by('-total_karma')[:limit]
    )

    user_map = {
        user.id: user
        for user in User.objects.filter(
            id__in=[row['user'] for row in leaderboard]
        )
    }

    result = []
    for row in leaderboard:
        result.append({
            'user_id': row['user'],
            'username': user_map[row['user']].username,
            'karma': row['total_karma'],
        })

    return result


def get_leaderboard_all_time(limit=5):
    leaderboard = (
        KarmaTransaction.objects
        .values('user')
        .annotate(total_karma=Sum('points'))
        .order_by('-total_karma')[:limit]
    )

    user_map = {
        user.id: user
        for user in User.objects.filter(
            id__in=[row['user'] for row in leaderboard]
        )
    }

    result = []
    for row in leaderboard:
        result.append({
            'user_id': row['user'],
            'username': user_map[row['user']].username,
            'karma': row['total_karma'],
        })

    return result
