import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  findCountryByDialCode,
  searchCountries,
  detectUserCountry,
  normalizeDialCode,
} from '../../utils/countries';

const POPULAR_COUNTRY_CODES = ['IN', 'US', 'GB', 'AE', 'CA', 'AU', 'SG', 'SA', 'DE'];

export default function PhoneInputWithCountry({
  label = 'MOBILE NUMBER',
  phone = '',
  onChangePhone,
  dialCode = '+91',
  onChangeDialCode,
  country = DEFAULT_COUNTRY,
  onChangeCountry,
  error,
  containerStyle,
  disabled = false,
}) {
  const { colors, typography, spacing } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [isFocused, setIsFocused] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect user's country on mount if not explicitly set
  useEffect(() => {
    let isMounted = true;
    const runDetection = async () => {
      try {
        setIsDetecting(true);
        const detected = await detectUserCountry();
        if (isMounted && detected) {
          if (!dialCode || dialCode === '+91') {
            onChangeCountry?.(detected);
            onChangeDialCode?.(detected.dialCode);
          }
        }
      } catch {
        // Fallback already handled
      } finally {
        if (isMounted) setIsDetecting(false);
      }
    };

    runDetection();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update country when dialCode prop changes
  const handleDialCodeTextChange = (rawText) => {
    const normalized = normalizeDialCode(rawText);
    onChangeDialCode?.(normalized);

    const matched = findCountryByDialCode(normalized);
    if (matched) {
      onChangeCountry?.(matched);
    }
  };

  // Search filter inside modal
  const handleSearch = (text) => {
    setSearchQuery(text);
    setFilteredCountries(searchCountries(text));
  };

  const handleSelectCountry = (selected) => {
    onChangeCountry?.(selected);
    onChangeDialCode?.(selected.dialCode);
    setIsModalOpen(false);
    setSearchQuery('');
    setFilteredCountries(COUNTRIES);
  };

  const popularCountries = COUNTRIES.filter((c) =>
    POPULAR_COUNTRY_CODES.includes(c.code)
  );

  const displayCountry = country || findCountryByDialCode(dialCode) || DEFAULT_COUNTRY;
  const isRecognized = !!displayCountry;

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, containerStyle]}>
      {/* Input Label */}
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
              fontSize: typography.sizes.xs,
              marginBottom: spacing.xs,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            },
          ]}
        >
          {label}
        </Text>
      )}

      {/* Input Group: Dial Code Prefix + Local Phone Input */}
      <View style={styles.inputGroup}>
        {/* Dial Code Selector Button */}
        <TouchableOpacity
          style={[
            styles.dialCodeBox,
            {
              backgroundColor: colors.surface,
              borderColor: isFocused ? colors.accent : (error ? colors.danger : colors.border),
            },
          ]}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
          disabled={disabled}
        >
          <Text style={styles.countryFlag}>
            {displayCountry ? displayCountry.flag : '🌐'}
          </Text>
          <Text
            style={[
              styles.dialCodeText,
              {
                color: colors.accent,
                fontFamily: typography.fontFamily.header,
              },
            ]}
          >
            {dialCode || '+91'}
          </Text>
          <MaterialCommunityIcons
            name="menu-down"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Local Phone Number Input */}
        <TextInput
          style={[
            styles.phoneInput,
            {
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              borderColor: isFocused ? colors.accent : (error ? colors.danger : colors.border),
              fontFamily: typography.fontFamily.body,
            },
          ]}
          placeholder={displayCountry?.placeholder || '10-digit mobile number'}
          placeholderTextColor={colors.textSecondary}
          value={phone}
          onChangeText={(val) => onChangePhone?.(val.replace(/[^0-9]/g, ''))}
          keyboardType="phone-pad"
          maxLength={15}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={[
            styles.errorText,
            {
              color: colors.danger,
              fontFamily: typography.fontFamily.body,
              fontSize: typography.sizes.xs,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}

      {/* Country Selection Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: colors.textPrimary,
                      fontFamily: typography.fontFamily.header,
                      fontSize: typography.sizes.lg,
                    },
                  ]}
                >
                  SELECT COUNTRY
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.body,
                      fontSize: typography.sizes.xs,
                    },
                  ]}
                >
                  Choose country to set international dial code
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  marginHorizontal: spacing.md,
                  marginTop: spacing.sm,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: colors.textPrimary,
                    fontFamily: typography.fontFamily.body,
                  },
                ]}
                placeholder="Search country or code (e.g. India, +91, US)..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Popular Picks Section (when search is empty) */}
            {!searchQuery && (
              <View style={[styles.popularSection, { marginHorizontal: spacing.md, marginTop: spacing.xs }]}>
                <Text
                  style={[
                    styles.sectionHeader,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.header,
                      fontSize: 10,
                      marginBottom: 6,
                    },
                  ]}
                >
                  POPULAR REGIONS
                </Text>
                <View style={styles.popularRow}>
                  {popularCountries.map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      style={[
                        styles.popularChip,
                        {
                          backgroundColor:
                            country?.code === c.code ? colors.yellowMuted : colors.surface,
                          borderColor:
                            country?.code === c.code ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectCountry(c)}
                    >
                      <Text style={{ fontSize: 13, marginRight: 4 }}>{c.flag}</Text>
                      <Text
                        style={{
                          color: country?.code === c.code ? colors.accent : colors.textPrimary,
                          fontSize: 11,
                          fontWeight: '700',
                        }}
                      >
                        {c.code} ({c.dialCode})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* All Countries List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.code}-${item.dialCode}`}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 24 }}
              renderItem={({ item }) => {
                const isSelected = country?.code === item.code && dialCode === item.dialCode;
                return (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      {
                        backgroundColor: isSelected ? colors.yellowMuted : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => handleSelectCountry(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.countryItemLeft}>
                      <Text style={styles.countryItemFlag}>{item.flag}</Text>
                      <View style={{ marginLeft: 12 }}>
                        <Text
                          style={[
                            styles.countryItemName,
                            {
                              color: isSelected ? colors.accent : colors.textPrimary,
                              fontFamily: typography.fontFamily.body,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={[
                            styles.countryItemCode,
                            {
                              color: colors.textSecondary,
                              fontFamily: typography.fontFamily.body,
                            },
                          ]}
                        >
                          {item.code}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.countryItemRight}>
                      <Text
                        style={[
                          styles.countryItemDial,
                          {
                            color: isSelected ? colors.accent : colors.textSecondary,
                            fontFamily: typography.fontFamily.header,
                          },
                        ]}
                      >
                        {item.dialCode}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={18}
                          color={colors.accent}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dialCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 6,
    minWidth: 68,
  },
  countryFlag: {
    fontSize: 15,
    marginRight: 3,
  },
  dialCodeText: {
    fontWeight: '800',
    fontSize: 13,
  },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalSubtitle: {
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  popularSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  popularRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  countryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countryItemFlag: {
    fontSize: 22,
  },
  countryItemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  countryItemCode: {
    fontSize: 11,
    marginTop: 1,
  },
  countryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryItemDial: {
    fontSize: 13,
    fontWeight: '800',
  },
});
