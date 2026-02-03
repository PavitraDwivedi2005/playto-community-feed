from collections import defaultdict


def build_comment_tree(comments):
    comment_map = defaultdict(list)
    comment_by_id = {}

    for comment in comments:
        comment_by_id[comment.id] = comment
        comment.replies_list = []

    for comment in comments:
        if comment.parent_id:
            comment_map[comment.parent_id].append(comment)
        else:
            comment_map[None].append(comment)

    for parent_id, replies in comment_map.items():
        if parent_id is not None:
            parent = comment_by_id[parent_id]
            parent.replies_list = replies

    return comment_map[None]
