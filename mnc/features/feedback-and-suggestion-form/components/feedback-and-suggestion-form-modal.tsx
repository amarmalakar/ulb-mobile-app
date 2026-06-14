import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';
import { MessageSquarePlusIcon, XIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FeedbackAndSuggestionForm from '@/features/feedback-and-suggestion-form';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/common/typography';

export type FeedbackAndSuggestionFormModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function FeedbackAndSuggestionFormModal({
  visible,
  onClose,
}: FeedbackAndSuggestionFormModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel={t('common.close')} />
        <View
          className="w-full max-h-[85vh] rounded-t-3xl bg-card"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Icon as={MessageSquarePlusIcon} className="size-6 text-primary" />
              <Typography className="text-lg font-bold text-primary">{t('feedback.createTitle')}</Typography>
            </View>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-muted"
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <XIcon size={18} color="#737373" />
            </Pressable>
          </View>

          <Separator />

          <FeedbackAndSuggestionForm variant="modal" onCancel={onClose} onSubmitted={onClose} />
        </View>
      </View>
    </Modal>
  );
}
