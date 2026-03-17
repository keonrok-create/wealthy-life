"use client";
import { useState, useEffect, useCallback } from "react";

export type PostItem = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tag: string;
  likes: number;
  liked_by_me: boolean;
  comment_count: number;
  created_at: string;
  profiles?: { name: string; avatar_url?: string };
};

export type CommentItem = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { name: string; avatar_url?: string };
};

export function usePosts(tag: string) {
  const [posts,   setPosts]   = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/posts?tag=${encodeURIComponent(tag)}&limit=30`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [tag]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const addPost = async (title: string, content: string, postTag: string) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tag: postTag }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await fetch_();
  };

  const deletePost = async (id: string) => {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const toggleLike = async (id: string) => {
    const res  = await fetch(`/api/posts/${id}/like`, { method: "POST" });
    const data = await res.json();
    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, liked_by_me: data.liked, likes: p.likes + (data.liked ? 1 : -1) }
        : p
    ));
  };

  return { posts, loading, addPost, deletePost, toggleLike, refetch: fetch_ };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading,  setLoading]  = useState(true);

  const fetch_ = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const res  = await fetch(`/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const addComment = async (content: string) => {
    const res  = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const data = await res.json();
    setComments(prev => [...prev, data]);
  };

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, { method: "DELETE" });
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  return { comments, loading, addComment, deleteComment };
}
