import { useEffect, useState } from "react";

// This line handles the automatic switch between production and local
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Feed({ onLike }) {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [comments, setComments] = useState({});
  const [commentForms, setCommentForms] = useState({});
  const [replyForms, setReplyForms] = useState({});
  const [replyContent, setReplyContent] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  const fetchPosts = () => {
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/posts/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("posts:", data);
        setPosts(data);
      })
      .catch((err) => {
        console.error("fetch failed", err);
        setPosts([]);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ... (Comment component remains the same)

  function handleLike(postId) {
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/posts/${postId}/like/`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, like_count: data.success ? p.like_count + 1 : p.like_count - 1 }
              : p
          )
        );
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (data.success) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
        if (onLike) onLike();
      })
      .catch((err) => {
        console.error("Like failed", err);
      });
  }

  const handleCreatePost = (e) => {
    e.preventDefault();
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/posts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ content: newPostContent }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts((prev) => [data, ...prev]);
        setNewPostContent("");
      })
      .catch((err) => console.error("Create post failed", err));
  };

  const handleShowComments = (postId) => {
    if (comments[postId]) {
      setComments((prev) => ({ ...prev, [postId]: null }));
      return;
    }
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/posts/${postId}/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => ({ ...prev, [postId]: data.comments }));
      })
      .catch((err) => console.error("Fetch comments failed", err));
  };

  const handleCreateComment = (postId, content) => {
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ post: postId, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data],
        }));
        setCommentForms((prev) => ({ ...prev, [postId]: false }));
      })
      .catch((err) => console.error("Create comment failed", err));
  };

  const handleReply = (commentId, content, postId) => {
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ post: postId, parent: commentId, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data],
        }));
        setReplyForms((prev) => ({ ...prev, [commentId]: false }));
        setReplyContent((prev) => ({ ...prev, [commentId]: "" }));
      })
      .catch((err) => console.error("Reply failed", err));
  };

  const handleLikeComment = (commentId, postId) => {
    // UPDATED URL
    fetch(`${API_BASE_URL}/api/comments/${commentId}/like/`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const increment = data.success ? 1 : -1;
        setComments((prev) => ({
          ...prev,
          [postId]: updateCommentLikeCount(prev[postId], commentId, increment),
        }));
        if (onLike) onLike();
      })
      .catch((err) => console.error("Like comment failed", err));
  };

  // ... (Remainder of the component UI and updateCommentLikeCount helper remain the same)
}
