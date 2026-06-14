import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const DEFAULT_IOS_KEYBOARD_OFFSET = 64;

export type KeyboardFormScrollProps = {
  children: ReactNode;
  footer?: ReactNode;
  scrollViewProps?: Omit<ScrollViewProps, 'children'>;
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function KeyboardFormScroll({
  children,
  footer,
  scrollViewProps,
  keyboardVerticalOffset,
  style,
  className,
}: KeyboardFormScrollProps) {
  const offset =
    keyboardVerticalOffset ?? (Platform.OS === 'ios' ? DEFAULT_IOS_KEYBOARD_OFFSET : 0);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1 }, style]}
      className={className}
      keyboardVerticalOffset={offset}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}
