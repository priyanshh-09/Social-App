import { useState } from "react";
import { createPost } from "../services/api";

function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || loading) {
      return;
    }

    try {
      setLoading(true);

      await createPost(trimmedContent);

      setContent("");
      onPostCreated();
    } catch (error) {
      console.error("Failed to create post:", error.message);
      alert(error.message || "Unable to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="avatar placeholder">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 font-bold text-white">
            <span>Y</span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor="post-content" className="sr-only">
            Write a post
          </label>

          <textarea
            id="post-content"
            placeholder="What's on your mind? Share it with your community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            className="textarea textarea-bordered w-full resize-y rounded-2xl border-base-300 bg-base-200/50 p-4 text-base leading-7 focus:border-violet-500 focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-base-content/50">
              Share something worth talking about.
            </span>

            <span
              className={`shrink-0 text-xs ${
                content.length >= 500
                  ? "font-bold text-error"
                  : "text-base-content/50"
              }`}
            >
              {content.length}/500
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-base-300 pt-4">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn btn-primary min-w-32 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-blue-700"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Posting...
            </>
          ) : (
            "✦ Create post"
          )}
        </button>
      </div>
    </form>
  );
}

export default CreatePost;
