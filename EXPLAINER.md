# Explainer

## The Tree: Modeling Nested Comments

### Database Model

Nested comments are modeled using a self-referencing foreign key in the `Comment` model:

```python
class Comment(models.Model):
    # ... other fields ...
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    # ... other fields ...
```

- Each comment can have a `parent` comment, allowing for hierarchical nesting.
- The `related_name='replies'` allows accessing child comments via `parent.replies`.
- Top-level comments have `parent=None`.

### Serialization Without Killing the DB

To serialize nested comments efficiently without N+1 queries, we use a tree-building utility function:

```python
def build_comment_tree(comments):
    # Build a dictionary of comments by ID
    comment_dict = {comment.id: comment for comment in comments}
    
    # Initialize replies list for each comment
    for comment in comments:
        comment.replies_list = []
    
    # Build the tree
    root_comments = []
    for comment in comments:
        if comment.parent_id:
            parent = comment_dict[comment.parent_id]
            parent.replies_list.append(comment)
        else:
            root_comments.append(comment)
    
    return root_comments
```

This approach:
1. Fetches all comments for a post in a single query
2. Builds the tree structure in memory
3. Uses `SerializerMethodField` to recursively serialize replies

The serializer includes:

```python
class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    
    def get_replies(self, obj):
        replies = getattr(obj, 'replies_list', [])
        return CommentSerializer(replies, many=True).data
```

This ensures efficient serialization without additional database queries.

## The Math: Last 24h Leaderboard Query

The leaderboard calculation uses the following QuerySet:

```python
def get_leaderboard_last_24h(limit=5):
    since = timezone.now() - timedelta(hours=24)

    leaderboard = (
        KarmaTransaction.objects
        .filter(created_at__gte=since)
        .values('user')
        .annotate(total_karma=Sum('points'))
        .order_by('-total_karma')[:limit]
    )
    
    # ... rest of the function to build result with usernames ...
```

This query:
1. Filters `KarmaTransaction` records from the last 24 hours
2. Groups by user and sums the `points` field
3. Orders by total karma descending
4. Limits to top 5 users

The equivalent SQL would be:

```sql
SELECT 
    "user",
    SUM("points") AS "total_karma"
FROM 
    "core_karmatransaction"
WHERE 
    "created_at" >= datetime('now', '-24 hours')
GROUP BY 
    "user"
ORDER BY 
    "total_karma" DESC
LIMIT 5;
