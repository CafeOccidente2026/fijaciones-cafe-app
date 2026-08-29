import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";
import { LoadingScreen } from "../src/components/LoadingScreen";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
}
