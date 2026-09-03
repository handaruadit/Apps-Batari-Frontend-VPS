//===== (Imports) ======
import { styles } from "@/features/access/styles";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//===== (AccessSearchBar) ======
export default function AccessSearchBar({
  query,
  colors,
  isSearching,
  isUpdating,
  onChangeQuery,
  onSearch,
  onFocus,
}) {
  return (
    <View style={styles.searchRow}>
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        onFocus={onFocus}
        placeholder="Email atau nomor telepon"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        onSubmitEditing={onSearch}
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.inputBorder,
            color: colors.text,
          },
        ]}
      />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSearch}
        disabled={isSearching || isUpdating}
        style={[styles.searchButton, { backgroundColor: colors.accent }]}
      >
        {isSearching ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="search" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
}
