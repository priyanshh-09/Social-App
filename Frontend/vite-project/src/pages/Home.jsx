import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { getFeed } from "../services/api";

function Home() {
  const [posts, setPosts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadPosts = async () => {
      setIsLoading(true);

      try {
        const data = await getFeed();

        if (!ignore) {
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Failed to fetch feed:", error.message);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome heading */}
        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Your community
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Home{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent">
              Feed
            </span>
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-base-content/60 sm:text-base">
            Discover new ideas, connect with people, and share what's on your
            mind.
          </p>
        </section>

        {/* Create post */}
        <section className="card mb-8 border border-base-300 bg-base-100 shadow-lg shadow-base-300/10">
          <div className="card-body gap-4 p-4 sm:p-6">
            <div>
              <h2 className="text-lg font-extrabold">Create something ✨</h2>
              <p className="mt-1 text-sm text-base-content/60">
                Your next conversation starts here.
              </p>
            </div>

            <CreatePost
              onPostCreated={() => {
                setRefreshKey((previous) => previous + 1);
              }}
            />
          </div>
        </section>

        {/* Feed header */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">Latest posts</h2>
              <p className="mt-1 text-xs text-base-content/60">
                See what your community is sharing
              </p>
            </div>

            <div className="badge badge-primary badge-lg gap-1 font-bold">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </div>
          </div>

          {/* Loading skeletons */}
          {isLoading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="card border border-base-300 bg-base-100"
                >
                  <div className="card-body animate-pulse p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-base-300" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded bg-base-300" />
                        <div className="h-2 w-20 rounded bg-base-300" />
                      </div>
                    </div>

                    <div className="mt-3 h-3 w-full rounded bg-base-300" />
                    <div className="h-3 w-2/3 rounded bg-base-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="card border border-dashed border-base-300 bg-base-100">
              <div className="card-body items-center px-6 py-12 text-center">
                <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-3xl">
                  ✨
                </div>

                <h3 className="text-lg font-extrabold">
                  Your feed starts here
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-base-content/60">
                  No posts yet. Share your first thought and start a
                  conversation!
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

        <footer className="py-8 text-center text-xs text-base-content/40">
          Made for your community · SocialApp
        </footer>
      </main>
    </div>
  );
}

export default Home;
