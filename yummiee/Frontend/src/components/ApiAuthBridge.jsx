import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { setApiAuth } from "../services/api";

function ApiAuthBridge({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Set this during render so child providers never issue a request using the
  // previous account while Clerk is changing sessions.
  setApiAuth({
    userId: isSignedIn ? user?.id : null,
    getToken: isSignedIn ? getToken : null,
  });

  useEffect(() => {
    setApiAuth({
      userId: isSignedIn ? user?.id : null,
      getToken: isSignedIn ? getToken : null,
    });

    return () => setApiAuth();
  }, [getToken, isSignedIn, user?.id]);

  return children;
}

export default ApiAuthBridge;
