import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase/client";
import Auth from "../../components/Auth";
import { View } from "react-native";
import { Session } from "@supabase/supabase-js";
import { Text } from "~/components/ui/text";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View>
      <Auth />
      {session && session.user && <Text>{session.user.id}</Text>}
    </View>
  );
}
