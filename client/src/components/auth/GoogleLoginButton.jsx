import { useEffect, useRef } from "react";
import useAuthStore from "../../store/useAuthStore";
import useToastStore from "../../store/useToastStore";

function GoogleLoginButton() {
  const buttonRef = useRef(null);
  const { loginWithGoogleCredential } = useAuthStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const result = await loginWithGoogleCredential(response.credential);

        if (result) {
          showToast({
            message: `Signed in as ${result.user.name}`,
            type: "success",
          });
        } else {
          showToast({
            message: "Google login failed.",
            type: "error",
          });
        }
      },
    });

    buttonRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "sign_in_with",
      shape: "rectangular",
      width: 260,
    });
  }, [loginWithGoogleCredential, showToast]);

  return <div ref={buttonRef} />;
}

export default GoogleLoginButton;