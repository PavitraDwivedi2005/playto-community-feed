from rest_framework import serializers
from django.contrib.auth.models import User
from core.models import Post, Comment



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at', 'replies', 'like_count']

    def get_replies(self, obj):
        replies = getattr(obj, 'replies_list', [])
        return CommentSerializer(replies, many=True).data


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'like_count']
class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content']


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content']
