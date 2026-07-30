//===== (Imports) ======
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "@/features/plants/styles/plantFormStyles";

//===== (Plant Select Modal) ======
export default function PlantSelectModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
  closeLabel,
  colors,
  showsVerticalScrollIndicator,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {title}
          </Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item}
            {...(showsVerticalScrollIndicator === undefined
              ? {}
              : { showsVerticalScrollIndicator })}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  { borderBottomColor: colors.bubbleBorder },
                ]}
                onPress={() => onSelect(item)}
              >
                <Text
                  style={[styles.optionItemText, { color: colors.textSoft }]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.input }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>
              {closeLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
