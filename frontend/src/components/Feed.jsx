import { useEffect, useState } from "react";

// This handles the switch between Railway and Localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// --- SUB-COMPONENT: COMMENT ---
function Comment({ comment, level, onReply, onLike, postId, replyForms, setReplyForms, replyContent, setReplyContent }) {
  return (
    <div className={`ml-${level * 6} mt-3 p-3 bg-gray-50 border-l-2 border-gray-200 rounded`}>
      <div className="text-sm text-gray-600 font-medium">{comment.author.username}</div>
      <div className="mt-2 text-base leading-relaxed">{comment.content}</div>
      <div className="mt-3 flex items-center space-x-4">
        <button
          className="text-red-500 hover:text-red-600 transition-colors flex items-center space-x-1 text-sm"
          onClick={() => onLike(comment.id, postId)}
        >
          <span>❤️</span>
          <span>{comment.like_count || 0}</span>
        </button>
        <button
          className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          onClick={() => setReplyForms((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
        >
          Reply
        </button>
      </div>
      {replyForms[comment.id] && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onReply(comment.id, replyContent[comment.id] || "", postId);
          }}
          className="mt-3"
        >
          <textarea
            value={replyContent[comment.id] || ""}
            onChange={(e) => setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))}
            placeholder="Write a reply..."
            className="w-full p-3 bg-white text-black rounded border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Reply
          </button>
        </form>
      )}
      {comment.replies && comment.replies.map((reply) => (
        <Comment
          key={reply.id}
          comment={reply}
          level={level + 1}
          onReply={onReply}
          onLike={onLike}
          postId={postId}
          replyForms={replyForms}
          setReplyForms={setReplyForms}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
        />
      ))}
    </div>
  );
}

// --- MAIN COMPONENT: FEED ---
export default function Feed({ onLike }) {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [comments, setComments] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [replyForms, setReplyForms] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  const fetchPosts = () => {
    fetch(`${API_BASE_URL}/api/posts/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => {
        console.error("fetch failed", err);
        setPosts([]);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const updateCommentLikeCount = (commentsList, commentId, increment) => {
    return commentsList.map((c) => {
      if (c.id === commentId) {
        return { ...c, like_count: (c.like_count || 0) + increment };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: updateCommentLikeCount(c.replies, commentId, increment) };
      }
      return c;
    });
  };

  const handleLike = (postId) => {
    fetch(`${API_BASE_URL}/api/posts/${postId}/like/`, { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, like_count: data.success ? p.like_count + 1 : p.like_count - 1 } : p));
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          data.success ? newSet.add(postId) : newSet.delete(postId);
          return newSet;
        });
        if (onLike) onLike();
      });
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/posts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: newPostContent }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts((prev) => [data, ...prev]);
        setNewPostContent("");
      });
  };

  const handleShowComments = (postId) => {
    if (comments[postId]) {
      setComments((prev) => ({ ...prev, [postId]: null }));
      return;
    }
    fetch(`${API_BASE_URL}/api/posts/${postId}/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setComments((prev) => ({ ...prev, [postId]: data.comments })));
  };

  const handleCreateComment = (postId, content) => {
    fetch(`${API_BASE_URL}/api/comments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ post: postId, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
        setCommentForms((prev) => ({ ...prev, [post.id]: false }));
      });
  };

  const handleReply = (commentId, content, postId) => {
    fetch(`${API_BASE_URL}/api/comments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ post: postId, parent: commentId, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
        setReplyForms((prev) => ({ ...prev, [commentId]: false }));
        setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
      });
  };

  const handleLikeComment = (commentId, postId) => {
    fetch(`${API_BASE_URL}/api/comments/${commentId}/like/`, { method: "POST", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const increment = data.success ? 1 : -1;
        setComments((prev) => ({ ...prev, [postId]: updateCommentLikeCount(prev[postId], commentId, increment) }));
        if (onLike) onLike();
      });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreatePost} className="mb-8">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 bg-gray-100 text-black rounded-lg resize-none border-0 focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
        <button type="submit" className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Post
        </button>
      </form>

      {posts.length === 0 && <div className="text-gray-500 text-center py-8">No posts yet</div>}

      {posts.map((post) => (
        <div key={post.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-600 font-medium">{post.author.username}</div>
          <div className="mt-3 text-lg leading-relaxed">{post.content}</div>
          <div className="mt-4 flex items-center space-x-6">
            <button className="text-red-500 hover:text-red-600 transition-colors flex items-center space-x-1" onClick={() => handleLike(post.id)}>
              <span>{likedPosts.has(post.id) ? '❤️' : '🤍'}</span>
              <span>{post.like_count}</span>
            </button>
            <button
              className="text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => {
                setCommentForms((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                if (!comments[post.id]) handleShowComments(post.id);
              }}
            >
              Comment
            </button>
          </div>

          {commentForms[post.id] && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateComment(post.id, e.target.comment.value);
                e.target.comment.value = "";
              }}
              className="mt-4"
            >
              <textarea name="comment" placeholder="Write a comment..." className="w-full p-3 bg-gray-100 text-black rounded resize-none border-0 focus:ring-2 focus:ring-blue-500" rows="2" />
              <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Comment</button>
            </form>
          )}

          {comments[post.id] && (
            <div className="mt-6 space-y-3">
              {comments[post.id].map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  level={0}
                  onReply={handleReply}
                  onLike={handleLikeComment}
                  postId={post.id}
                  replyForms={replyForms}
                  setReplyForms={setReplyForms}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
