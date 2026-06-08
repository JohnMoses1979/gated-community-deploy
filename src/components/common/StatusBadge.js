// import React from 'react';
// import { View, Text } from 'react-native';
// import { COLORS, STATUS_LABELS, globalStyles } from './theme';

// export default function StatusBadge({ status }) {
//   const color = COLORS[status] || COLORS.textMuted;
//   const label = STATUS_LABELS[status] || status;
//   return (
//     <View style={[globalStyles.badge, { backgroundColor: color }]}>
//       <Text style={globalStyles.badgeText}>{label}</Text>
//     </View>
//   );
// }







/**
 * StatusBadge.js — shared component
 * Uses teal theme STATUS_COLORS and STATUS_LABELS from maintenanceStatus.js
 * Drop into: src/components/common/StatusBadge.js
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/maintenanceStatus';

export default function StatusBadge({ status, small }) {
  const color = STATUS_COLORS[status] || '#7A9E9E';
  const label = STATUS_LABELS[status] || status?.replace(/_/g, ' ') || '—';

  return (
    <View style={[st.badge, { backgroundColor: color + '22', borderColor: color + '55', borderWidth: 1 }, small && st.small]}>
      <Text style={[st.text, { color }, small && st.smallText]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 10,
  },
});