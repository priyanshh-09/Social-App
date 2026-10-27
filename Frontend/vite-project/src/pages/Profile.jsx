import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile } from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      try {

        const profileData = await getProfile();

        if (ignore) return;

        setUser(profileData.user);
        setName(profileData.user.name || "");
        setBio(profileData.user.bio || "");
      } catch (error) {
        if (!ignore) {
          setError(error.message || "Failed to load profile.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("bio", bio);

    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      setIsSaving(true);
      setMessage("");

      const data = await updateProfile(formData);

      setUser(data.user);
      setName(data.user.name || "");
      setBio(data.user.bio || "");
      setProfilePicture(null);

      const fileInput = document.getElementById("profilePicture");
      if (fileInput) fileInput.value = "";

      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content">
        <Navbar />
        <main className="mx-auto max-w-3xl space-y-5 px-4 py-10">
          <div className="h-40 animate-pulse rounded-3xl bg-base-300" />
          <div className="h-64 animate-pulse rounded-3xl bg-base-100" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="alert alert-error">
            <span>Failed to load profile: {error}</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {/* Page heading */}
        <section>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <span>✦</span>
            Your personal space
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            My <span className="text-primary">Profile</span>
          </h1>

          <p className="mt-2 text-sm text-base-content/60 sm:text-base">
            Manage your identity and see what you've shared.
          </p>
        </section>

        {/* Profile overview */}
        {user && (
          <section className="card overflow-hidden border border-base-300 bg-base-100 shadow-xl shadow-base-300/10">
            <div className="relative h-32 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-blue-600 sm:h-44">
              <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                My account
              </div>
            </div>

            <div className="card-body gap-5 p-5 sm:p-7">
              <div className="-mt-16 flex items-end gap-4 sm:-mt-20">
                <div className="avatar">
                  <div className="h-24 w-24 rounded-3xl border-4 border-base-100 bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg sm:h-32 sm:w-32">
                    {user.profilePicture?.url ? (
                      <img
                        src={user.profilePicture.url}
                        alt={`${user.name}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="break-words text-2xl font-black sm:text-3xl">
                  {user.name}
                </h2>
                <p className="mt-1 break-all text-sm text-base-content/60">
                  {user.email}
                </p>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-base-content/80 sm:text-base">
                  {user.bio ||
                    "You haven't added a bio yet. Tell your community about yourself!"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Edit profile */}
        <section className="card border border-base-300 bg-base-100 shadow-lg shadow-base-300/10">
          <div className="card-body gap-5 p-5 sm:p-7">
            <div>
              <h2 className="text-xl font-black">Edit profile</h2>
              <p className="mt-1 text-sm text-base-content/60">
                Keep your information up to date.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="form-control w-full">
                <label htmlFor="name" className="label">
                  <span className="label-text font-semibold">Display name</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                  className="input input-bordered w-full rounded-xl focus:border-primary"
                  placeholder="Your name"
                />
              </div>

              <div className="form-control w-full">
                <label htmlFor="bio" className="label">
                  <span className="label-text font-semibold">Bio</span>
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={300}
                  rows={4}
                  className="textarea textarea-bordered w-full rounded-xl leading-6 focus:border-primary"
                  placeholder="Write something about yourself..."
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    {bio.length}/300 characters
                  </span>
                </label>
              </div>

              <div className="form-control w-full">
                <label htmlFor="profilePicture" className="label">
                  <span className="label-text font-semibold">
                    Profile picture
                  </span>
                </label>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProfilePicture(e.target.files?.[0] || null)
                  }
                  className="file-input file-input-bordered w-full rounded-xl"
                />
                <p className="mt-2 text-xs text-base-content/50">
                  Choose an image to update your profile picture.
                </p>
              </div>

              {message && (
                <div
                  role="status"
                  className={`alert ${
                    message === "Profile updated successfully!"
                      ? "alert-success"
                      : "alert-error"
                  }`}
                >
                  <span>{message}</span>
                </div>
              )}

              <div className="flex justify-end border-t border-base-300 pt-4">
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="btn btn-primary rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-white"
                >
                  {isSaving ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;
