/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { Link } from "react-router";
import { likePost, postComment } from "../services/api";

function PostCard({ post }) {
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  useEffect(() => {
    setLikesCount(post.likesCount || 0);
    setIsLiked(post.isLiked || false);
  }, [post.likesCount, post.isLiked]);

  useEffect(() => {
    const handlePostLikesUpdated = (data) => {
      if (data.postId !== post._id.toString()) return;
      setLikesCount(data.likesCount);
    };

    socket.on("postLikesUpdated", handlePostLikesUpdated);

    return () => {
      socket.off("postLikesUpdated", handlePostLikesUpdated);
    };
  }, [post._id]);

  useEffect(() => {
    const handleNewComment = (data) => {
      if (data.postId !== post._id.toString()) return;

      setComments((previous) => {
        if (previous.some((comment) => comment._id === data.comment._id)) {
          return previous;
        }

        return [...previous, data.comment];
      });

      setCommentsCount((count) => count + 1);
    };

    socket.on("newComment", handleNewComment);

    return () => {
      socket.off("newComment", handleNewComment);
    };
  }, [post._id]);

  const handleLike = async () => {
    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      const data = await likePost(post._id);

      setLikesCount(data.likesCount);
      setIsLiked(data.isLiked ?? !isLiked);
    } catch (error) {
      console.error("Failed to like post:", error.message);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const content = commentText.trim();
    if (!content || isCommentLoading) return;

    try {
      setIsCommentLoading(true);
      await postComment(post._id, content);
      setCommentText("");
      setCommentsCount((count) => count + 1);
    } catch (error) {
      console.error("Failed to post comment:", error.message);
      alert(error.message);
    } finally {
      setIsCommentLoading(false);
    }
  };

  return (
    <article className="card overflow-hidden border border-base-300 bg-base-100 shadow-lg shadow-base-300/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      {/* Accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-500" />

      <div className="card-body gap-4 p-4 sm:p-6">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-lg font-bold text-white">
              <span>{post.author?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Link
              to={`/users/${post.author?._id}`}
              className="font-bold transition-colors hover:text-violet-600"
            >
              {post.author?.name || "User"}
            </Link>

            <p className="text-xs text-base-content/60">Community member</p>
          </div>

          <span className="badge badge-outline border-violet-400/40 text-violet-600 dark:text-violet-300">
            Post
          </span>
        </div>

        {/* Post content */}
        <div className="whitespace-pre-wrap break-words text-sm leading-7 sm:text-base">
          {post.content}
        </div>

        {/* Counts */}
        <div className="flex items-center gap-4 border-b border-base-300 pb-3 text-sm text-base-content/60">
          <span>
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </span>
          <span>
            {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={isLikeLoading}
            className={`btn btn-sm flex-1 rounded-xl sm:flex-none ${
              isLiked ? "btn-primary" : "btn-ghost"
            }`}
          >
            {isLikeLoading ? "Loading..." : isLiked ? "♥ Liked" : "♡ Like"}
          </button>

          <a
            href={`#comment-${post._id}`}
            className="btn btn-ghost btn-sm flex-1 rounded-xl sm:flex-none"
          >
            💬 Comment
          </a>
        </div>

        {/* Comment form */}
        <form
          id={`comment-${post._id}`}
          onSubmit={handleCommentSubmit}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={300}
            className="input input-bordered input-sm min-w-0 flex-1 rounded-xl focus:border-violet-500"
          />

          <button
            type="submit"
            disabled={isCommentLoading || !commentText.trim()}
            className="btn btn-primary btn-sm rounded-xl"
          >
            {isCommentLoading ? "..." : "Send"}
          </button>
        </form>

        {/* Recent comments */}
        {comments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold">Recent comments</h4>

            {comments.map((comment) => (
              <div key={comment._id} className="rounded-xl bg-base-200/70 p-3">
                <p className="text-sm font-semibold">
                  {comment.author?.name || "User"}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-base-content/80">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default PostCard;
