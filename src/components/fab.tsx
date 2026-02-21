/**
 * Floating Action Button (FAB)
 *
 * Expandable FAB with menu options. Tapping the main button toggles
 * a list of action items that appear above it.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';

interface FabAction {
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

interface FabProps {
  actions: FabAction[];
}

export default function Fab({ actions }: FabProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const handleAction = useCallback(
    (action: FabAction) => {
      setOpen(false);
      action.onPress();
    },
    []
  );

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Action menu */}
          <View style={styles.menuContainer}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[
                  styles.menuItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => handleAction(action)}
                activeOpacity={0.7}
              >
                <Feather name={action.iconName} size={18} color={colors.secondary} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Main FAB (repeated inside modal so it stays visible) */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.secondary }]}
            onPress={() => setOpen(false)}
            activeOpacity={0.8}
          >
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Pressable>
      </Modal>

      {/* Main FAB (visible when menu is closed) */}
      {!open && (
        <TouchableOpacity
          style={[styles.fab, styles.fabPositioned, { backgroundColor: colors.secondary }]}
          onPress={toggle}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.lg + FAB_SIZE + Spacing.md,
  },
  menuContainer: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabPositioned: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
});
