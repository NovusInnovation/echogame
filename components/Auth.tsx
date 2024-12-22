import { View, StyleSheet } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase/client";
import { SetStateAction, useState } from "react";
import { Button } from "./ui/button";

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

const performOAuth = async (setLoading: {
  (value: SetStateAction<boolean>): void;
  (arg0: boolean): void;
}) => {
  setLoading(true);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://new.echogame.xyz/redirect",
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );

  if (res.type === "success") {
    const { url } = res;
    await createSessionFromUrl(url);
  }

  setLoading(false);
};

const anonSignIn = async (setLoading: {
  (value: SetStateAction<boolean>): void;
  (arg0: boolean): void;
}) => {
  setLoading(true);
  const { error } = await supabase.auth.signInAnonymously();

  if (error) throw error;
  setLoading(false);
};

export default function Auth() {
  // Handle linking into app from email app.
  const [loading, setLoading] = useState(false);
  const url = Linking.useURL();
  if (url) createSessionFromUrl(url);

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          disabled={loading}
          variant="outline"
          className="shadow shadow-foreground/5"
          onPress={() => performOAuth(setLoading)}
        >
          Sign in with Google
        </Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          disabled={loading}
          onPress={() => anonSignIn(setLoading)}
          variant="outline"
          className="shadow shadow-foreground/5"
        >
          Sign in anonn
        </Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          disabled={loading}
          onPress={() => supabase.auth.signOut()}
          variant="outline"
          className="shadow shadow-foreground/5"
        >
          Sign out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
