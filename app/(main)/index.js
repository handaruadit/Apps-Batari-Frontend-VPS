//===== (Imports) ======
import { Redirect } from "expo-router";

//===== (Index Screen) ======
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
