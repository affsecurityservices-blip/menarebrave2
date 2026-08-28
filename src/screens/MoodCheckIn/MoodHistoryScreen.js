import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import EmptyState from '../../components/common/EmptyState';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MOODS } from '../../utils/constants';

export default function MoodHistoryScreen() {
  const { colors, typography, spacing } = useTheme();
  const { moodHistory } = useUser();
  const [selectedCell, setSelectedCell] = useState(null);

  const getMoodIcon = (moodKey) => {
    const config = MOODS.find((m) => m.key === moodKey);
    return config || { icon: 'emoticon-neutral-outline', color: colors.textSecondary };
  };

  const getGridData = () => {
    const data = [];
    const today = new Date();
    // Generate data for the last 28 days (4 weeks of 7 days)
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const historyEntry = moodHistory.find((entry) => entry.date === dateStr);
      data.push({
        date: dateStr,
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: historyEntry?.mood || null,
        label: historyEntry?.label || 'No Log',
      });
    }
    return data;
  };

  const gridData = getGridData();

  const getCellColor = (item) => {
    if (!item.mood) return colors.border;
    const config = MOODS.find((m) => m.key === item.mood);
    return config ? config.color : colors.textSecondary;
  };

  const renderHeader = () => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: spacing.borderRadius.xs, marginBottom: spacing.md }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="grid" size={20} color={colors.accent} />
        <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.sm, marginLeft: 8 }]}>
          28-DAY MOOD MATRIX
        </Text>
      </View>
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 11, marginVertical: spacing.xs }]}>
        Visual consistency map. Keep recording daily to light up your shield.
      </Text>
      
      <View style={styles.grid}>
        {gridData.map((item, index) => {
          const isSelected = selectedCell?.date === item.date;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.gridCell,
                {
                  backgroundColor: getCellColor(item),
                  borderColor: isSelected ? colors.textPrimary : 'transparent',
                  borderWidth: isSelected ? 1.5 : 0,
                }
              ]}
              onPress={() => setSelectedCell(item)}
              activeOpacity={0.8}
            />
          );
        })}
      </View>

      <View style={[styles.tooltipContainer, { borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.sm }]}>
        {selectedCell ? (
          <View style={styles.tooltipContent}>
            <MaterialCommunityIcons 
              name={selectedCell.mood ? getMoodIcon(selectedCell.mood).icon : 'calendar-blank'} 
              size={18} 
              color={selectedCell.mood ? getCellColor(selectedCell) : colors.textSecondary} 
            />
            <Text style={[styles.tooltipText, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: 11, marginLeft: 8 }]}>
              {selectedCell.dateLabel}: <Text style={{ color: selectedCell.mood ? getCellColor(selectedCell) : colors.textSecondary }}>{selectedCell.label.toUpperCase()}</Text>
            </Text>
          </View>
        ) : (
          <Text style={[styles.tooltipPlaceholder, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 11, textAlign: 'center' }]}>
            Tap any block to view details.
          </Text>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const config = getMoodIcon(item.mood);
    return (
      <View style={[styles.historyRow, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: spacing.borderRadius.xs }]}>
        <View style={styles.left}>
          <MaterialCommunityIcons name={config.icon} size={28} color={config.color} />
          <Text style={[styles.moodLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md, marginLeft: 12 }]}>
            {item.label}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
          {item.date}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={moodHistory}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank"
            title="Matrix Empty"
            message="Secure your vibe daily to build your tracking matrix."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  gridCell: {
    width: '11%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  tooltipContainer: {
    borderTopWidth: 1,
    height: 32,
    justifyContent: 'center',
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tooltipPlaceholder: {
    fontStyle: 'italic',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  date: {
    fontWeight: '500',
  },
});
