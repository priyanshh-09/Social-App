import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getProfile } from "../services/api";

function PublicRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const checkAuth = async () => {
      try {
        await getProfile();

        if (!ignore) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (!ignore) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return <p>Checking authentication...</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default PublicRoute;
