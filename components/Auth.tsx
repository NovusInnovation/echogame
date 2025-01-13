import { View, Image, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase/client";
import { SetStateAction, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Edit3 } from "../lib/icons/Edit3";
import { Check } from "../lib/icons/Check";

WebBrowser.maybeCompleteAuthSession();
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
  console.log("performOAuth");
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "google",
    options: {
      redirectTo: "https://new.echogame.xyz/redirect",
      skipBrowserRedirect: true,
    },
  });
  console.log("error");
  console.log(error);
  if (error) throw error;
  console.log("data");
  console.log(data);

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

const deleteUser = async () => {
  // const { error } = await supabase.auth.api.deleteUser();
  // if (error) {
  //   Alert.alert("Error", error.message);
  // } else {
  //   Alert.alert("Success", "User deleted successfully");
  // }
  Alert.alert("Error", "This feature is not yet implemented");
};

const confirmDeleteUser = () => {
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete your account? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteUser },
    ]
  );
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("User");
  const [profilePicture, setProfilePicture] = useState("https://qbwthytkshrdqrvphuih.supabase.co/storage/v1/object/public/profile_pictures/default-profile-picture.webp");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const nicknameInputRef = useRef<TextInput>(null);
  const url = Linking.useURL();
  if (url) createSessionFromUrl(url);

  const handleNicknameChange = (newNickname: string) => {
    setNickname(newNickname);
  };

  const handleProfilePictureChange = () => {
    // Logic to change profile picture
  };

  const handleConfirmNicknameChange = () => {
    setIsEditingNickname(false);
    Keyboard.dismiss();
  };

  const handleEditNickname = () => {
    setIsEditingNickname(true);
    setTimeout(() => {
      nicknameInputRef.current?.focus();
    }, 100);
  };

  return (
    <TouchableWithoutFeedback onPress={handleConfirmNicknameChange}>
      <View className="mt-10 p-3">
        <View className="items-center">
          <Image
            source={{ uri: profilePicture }}
            className="w-24 h-24 rounded-full"
          />
          <Button
            className="mt-2 shadow shadow-foreground/5"
            onPress={handleProfilePictureChange}
          >
            <Text>Change Picture</Text>
          </Button>
        </View>
        <View className="py-1 self-stretch mt-5 items-center">
          {isEditingNickname ? (
            <TouchableWithoutFeedback onPress={handleConfirmNicknameChange}>
              <View className="flex-row items-center">
                <TextInput
                  ref={nicknameInputRef}
                  value={nickname}
                  onChangeText={handleNicknameChange}
                  onBlur={handleConfirmNicknameChange}
                  onSubmitEditing={handleConfirmNicknameChange}
                  className="p-2 text-2xl font-bold text-foreground"
                />
                <Check
                  className="ml-2 text-foreground"
                  onPress={handleConfirmNicknameChange}
                />
              </View>
            </TouchableWithoutFeedback>
          ) : (
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-foreground">
                {nickname}
              </Text>
              <Edit3
                className="ml-2 text-foreground"
                onPress={handleEditNickname}
              />
            </View>
          )}
        </View>
        <View className="py-1 self-stretch mt-5">
          <Button
            disabled={loading}
            className="shadow shadow-foreground/5 flex-row items-center"
            onPress={() => performOAuth(setLoading)}
          >
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png",
              }}
              style={{ width: 24, height: 24, marginRight: 8 }}
            />
            <Text>Log in with Google</Text>
          </Button>
        </View>
        <View className="py-1 self-stretch mt-5">
          <Button
            className="shadow shadow-foreground/5 flex-row items-center"
            onPress={confirmDeleteUser}
          >
            <Text>Delete Account</Text>
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
