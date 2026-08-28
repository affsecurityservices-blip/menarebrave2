import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import CommunityCard from '../../components/community/CommunityCard';
import { COMMUNITIES } from '../../utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CommunityListScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { joinedCommunityIds, toggleJoinCommunity } = useUser();

  const joinedCommunities = COMMUNITIES.filter((c) => joinedCommunityIds.includes(c.id));
  const suggestedCommunities = COMMUNITIES.filter((c) => !joinedCommunityIds.includes(c.id));

  const sections = [];
  if (joinedCommunities.length > 0) {
    sections.push({
      title: 'MY CIRCLES',
      data: joinedCommunities,
    });
  }
  if (suggestedCommunities.length > 0) {
    sections.push({
      title: 'SUGGESTED CIRCLES',
      data: suggestedCommunities,
    });
  }

  const renderCommunity = ({ item }) => {
    const isJoined = joinedCommunityIds.includes(item.id);
    return (
      <CommunityCard
        community={item}
        isJoined={isJoined}
        onJoinPress={() => toggleJoinCommunity(item.id)}
        onPress={() => navigation.navigate('CommunityDetail', { communityId: item.id, name: item.name })}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderCommunity}
        renderSectionHeader={({ section: { title } }) => {
          const isFirst = sections[0]?.title === title;
          return (
            <Text style={[styles.sectionHeader, {
              color: colors.accent,
              fontFamily: typography.fontFamily.header,
              fontSize: 11,
              marginTop: isFirst ? spacing.md : spacing.xl + 12,
              marginBottom: spacing.xs,
              letterSpacing: 1.2,
            }]}>
              {title}
            </Text>
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: 0,
          paddingBottom: spacing.xl + 40,
        }}
      />

      {/* Floating Action Button to Create Community */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => navigation.navigate('CreateCommunity')}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
      },
    }),
  },
});
