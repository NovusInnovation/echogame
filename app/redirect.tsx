import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Redirect() {
  const router = useRouter();
  const { access_token } = useLocalSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted state
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Wait until mounted

    if (!access_token) {
      // Redirect to home if no OAuth access_token is provided
      router.replace("/");
      return;
    }

    const appScheme = `echogame://login?access_token=${access_token}`;
    const fallbackUrl = `/login?access_token=${access_token}`; // Web login fallback

    // Try opening the mobile app
    const timeout = setTimeout(() => {
      // Redirect to the web login page if the app isn't installed
      router.replace(fallbackUrl);
    }, 1000); // 1-second delay

    // Attempt to open the app
    window.location.href = appScheme;

    // Clear timeout if the app opens
    return () => clearTimeout(timeout);
  }, [isMounted, access_token, router]);

  return <p>Redirecting...</p>;
}
