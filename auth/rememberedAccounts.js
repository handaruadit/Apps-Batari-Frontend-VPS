//===== (Imports) ======
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

//===== (Constants) ======
const REMEMBERED_ACCOUNTS_KEY = "rememberedAccounts";

//===== (cleanEmailValue) ======
function cleanEmailValue(email) {
  return email.trim().toLowerCase();
}

//===== (getPasswordKey) ======
function getPasswordKey(email) {
  const cleanEmail = cleanEmailValue(email);
  const safeEmail = cleanEmail.replace(/[^a-zA-Z0-9._-]/g, "_");

  return `rememberedPassword.${safeEmail}`;
}

//===== (getRememberedAccounts) ======
export async function getRememberedAccounts() {
  try {
    const data = await AsyncStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
    const accounts = data ? JSON.parse(data) : [];

    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

//===== (saveRememberedAccount) ======
export async function saveRememberedAccount(email, password) {
  if (!email || !password) return;

  const cleanEmail = cleanEmailValue(email);
  const accounts = await getRememberedAccounts();

  const updatedAccounts = [
    cleanEmail,
    ...accounts.filter((item) => item !== cleanEmail),
  ];

  await AsyncStorage.setItem(
    REMEMBERED_ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts),
  );

  await SecureStore.setItemAsync(getPasswordKey(cleanEmail), password);
}

//===== (getRememberedPassword) ======
export async function getRememberedPassword(email) {
  if (!email) return "";

  try {
    const password = await SecureStore.getItemAsync(getPasswordKey(email));
    return password || "";
  } catch {
    return "";
  }
}

//===== (removeRememberedAccount) ======
export async function removeRememberedAccount(email) {
  if (!email) return;

  const cleanEmail = cleanEmailValue(email);
  const accounts = await getRememberedAccounts();

  const updatedAccounts = accounts.filter((item) => item !== cleanEmail);

  await AsyncStorage.setItem(
    REMEMBERED_ACCOUNTS_KEY,
    JSON.stringify(updatedAccounts),
  );

  await SecureStore.deleteItemAsync(getPasswordKey(cleanEmail));
}
