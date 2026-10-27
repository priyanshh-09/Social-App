const API_URL = "http://localhost:5000/api";

const apiRequest = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(!isFormData && {
        "Content-Type": "application/json",
      }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const signupUser = async (userData) => {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (userData) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const getFeed = async () => {
  return apiRequest("/posts/feed");
};

export const createPost = async (content) => {
  return apiRequest("/posts", {
    method: "POST",
    body: JSON.stringify({
      content,
    }),
  });
};

export const likePost = async (postId) => {
  return apiRequest(`/posts/${postId}/like`, {
    method: "POST",
  });
};

export const postComment = async (postId, content) => {
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

export const logoutUser = async () => {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
};

export const getProfile = async () => {
  return apiRequest("/profile");
};

export const getProfilePosts = async () => {
  return apiRequest("/profile/posts");
};

export const updateProfile = async (formData) => {
  return apiRequest("/profile", {
    method: "PATCH",
    body: formData,
  });
};

export const getUserProfile = async (userId) => {
  return apiRequest(`/users/${userId}`);
};

export const followUser = async (userId) => {
  return apiRequest(`/users/${userId}/follow`, {
    method: "POST",
  });
};

export const getUserPosts = async (userId) => {
  return apiRequest(`/users/${userId}/posts`);
};