import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { getUserProfile, followUser, getUserPosts } from "../services/api";

function UserProfile() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadUserProfile = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [profileData, postsData] = await Promise.all([
          getUserProfile(userId),
          getUserPosts(userId),
        ]);

        if (ignore) return;

        setUser(profileData.user);
        setIsFollowing(profileData.user.isFollowing || false);
        setPosts(postsData.posts || []);
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Unable to load this profile.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadUserProfile();

    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    const handleFollowersUpdated = (data) => {
      if (data.followerId === userId) return;

      setUser((previousUser) => {
        if (!previousUser) return previousUser;

        return {
          ...previousUser,
          followersCount: data.followersCount,
        };
      });
    };

    socket.on("followersUpdated", handleFollowersUpdated);

    return () => {
      socket.off("followersUpdated", handleFollowersUpdated);
    };
  }, [userId]);

  const handleFollow = async () => {
    if (isFollowLoading) return;

    try {
      setIsFollowLoading(true);

      const data = await followUser(userId);

      setIsFollowing(data.isFollowing);

      setUser((previousUser) => {
        if (!previousUser) return previousUser;

        return {
          ...previousUser,
          followersCount: data.followersCount,
        };
      });
    } catch (error) {
      console.error("Follow error:", error.message);
      alert(error.message || "Unable to update follow status.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content">
        <Navbar />
        <main className="mx-auto max-w-3xl space-y-5 px-4 py-10">
          <div className="h-40 animate-pulse rounded-3xl bg-base-300" />
          <div className="h-32 animate-pulse rounded-3xl bg-base-100" />
          <div className="h-48 animate-pulse rounded-3xl bg-base-100" />
        </main>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="alert alert-error">
            {error || "User profile not found."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {/* Profile card */}
        <section className="card overflow-hidden border border-base-300 bg-base-100 shadow-xl shadow-base-300/10">
          {/* Gradient banner */}
          <div className="relative h-36 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-blue-600 sm:h-48">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute right-5 top-5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              Community profile
            </div>
          </div>

          <div className="card-body gap-5 p-5 sm:p-7">
            <div className="-mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
              {/* Avatar */}
              <div className="avatar">
                <div className="h-24 w-24 rounded-3xl border-4 border-base-100 bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg sm:h-32 sm:w-32">
                  {user.profilePicture?.url ? (
                    <img
                      src={user.profilePicture.url}
                      alt={`${user.name}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white sm:text-5xl">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleFollow}
                disabled={isFollowLoading}
                className={`btn rounded-xl px-6 ${
                  isFollowing
                    ? "btn-outline"
                    : "btn-primary bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                }`}
              >
                {isFollowLoading
                  ? "Please wait..."
                  : isFollowing
                    ? "✓ Following"
                    : "+ Follow"}
              </button>
            </div>

            {/* User details */}
            <div>
              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl">
                {user.name}
              </h1>

              <p className="mt-1 break-all text-sm text-base-content/60">
                {user.email}
              </p>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-base-content/80 sm:text-base">
                {user.bio || "This user hasn't added a bio yet."}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 border-t border-base-300 pt-5">
              <div className="rounded-2xl bg-base-200 p-3 text-center">
                <p className="text-2xl font-black">{posts.length}</p>
                <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                  Posts
                </p>
              </div>

              <div className="rounded-2xl bg-base-200 p-3 text-center">
                <p className="text-2xl font-black">
                  {user.followersCount || 0}
                </p>
                <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                  Followers
                </p>
              </div>

              <div className="rounded-2xl bg-base-200 p-3 text-center">
                <p className="text-2xl font-black">
                  {user.followingCount || 0}
                </p>
                <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                  Following
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* User posts */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Posts</h2>
              <p className="mt-1 text-sm text-base-content/60">
                What {user.name} has shared
              </p>
            </div>

            <span className="badge badge-primary badge-lg">{posts.length}</span>
          </div>

          {posts.length === 0 ? (
            <div className="card border border-dashed border-base-300 bg-base-100">
              <div className="card-body items-center py-12 text-center">
                <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  ✨
                </div>
                <h3 className="text-lg font-bold">No posts yet</h3>
                <p className="text-sm text-base-content/60">
                  This user hasn't shared anything yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserProfile;
