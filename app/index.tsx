import * as React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { router } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase/client";
import StarterCard from "./starter-card";

export default function Screen() {
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  function startGame() {
    router.push("/game");
  }

  function authPage() {
    router.push("/auth");
  }
  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      {/* <StarterCard /> */}
      <Button className="shadow shadow-foreground/5" onPress={startGame}>
        <Text>Start game</Text>
      </Button>
      <Button className="shadow shadow-foreground/5" onPress={authPage}>
        <Text>auth page</Text>
      </Button>
      {session && session.user && <Text>{session.user.id}</Text>}
    </View>
  );
}
