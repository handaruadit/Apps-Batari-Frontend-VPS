import { View, Text, TouchableOpacity } from 'react-native';
import { appColors, appFont } from '@/config/theme';

export default function PlantCard({ plant, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          padding: 16,
          marginBottom: 12,
          backgroundColor: appColors.bubble,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: appColors.bubbleBorder,
        }}
      >
        <Text style={{ color: appColors.text, fontFamily: appFont }}>
          {plant?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
