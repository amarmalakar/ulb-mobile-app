import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { MessageSquareTextIcon, XIcon } from 'lucide-react-native';

import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import {
  formatFeedbackDate,
  getFeedbackAuthorLabel,
  getFeedbackSubmitterRoleLabel,
} from '@/features/feedback-and-suggestion-form/lib/feedback-list-utils';
import type { FeedbackAndSuggestionListItem } from '@/features/feedback-and-suggestion-form/types';

export type FeedbackAndSuggestionDetailModalProps = {
  item: FeedbackAndSuggestionListItem | null;
  visible: boolean;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Typography className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </Typography>
      <Typography className="text-sm leading-5 text-foreground">{value}</Typography>
    </View>
  );
}

export function FeedbackAndSuggestionDetailModal({
  item,
  visible,
  onClose,
}: FeedbackAndSuggestionDetailModalProps) {
  const { t } = useTranslation();
  const { authType } = useAuthContext();
  const { userInfo } = useUserAuth();
  const { staffInfo } = useStaffAuth();

  if (!item) return null;

  const isFeedback = item.kind === 'FEEDBACK';
  const kindLabel =
    item.kind === 'FEEDBACK' ? t('feedback.kindFeedback') : t('feedback.kindSuggestion');
  const authorContext = {
    currentUserId: authType === 'User' ? userInfo?.id : undefined,
    currentStaffId: authType === 'Staff' ? staffInfo?.id : undefined,
  };
  const authorLabel = getFeedbackAuthorLabel(item, t, authorContext);
  const roleLabel = getFeedbackSubmitterRoleLabel(item, t, authorContext);
  const createdLabel = formatFeedbackDate(item.createdAt);
  const updatedLabel = formatFeedbackDate(item.updatedAt);
  const showUpdated = item.updatedAt !== item.createdAt;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel={t('common.close')} />
        <View className="absolute bottom-0 max-h-[85vh] w-full flex-col rounded-t-3xl bg-card">
          <View className="flex-row items-center justify-between px-4 py-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-2">
              <Icon as={MessageSquareTextIcon} className="size-6 shrink-0 text-primary" />
              <Typography className="text-lg font-bold text-primary" numberOfLines={1}>
                {t('feedback.detailTitle')}
              </Typography>
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

          <ScrollView
            className="max-h-[65vh] px-4 py-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <Typography className="flex-1 text-xl font-semibold text-foreground">{item.title}</Typography>
                <Badge
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1',
                    isFeedback ? 'bg-blue-500/15' : 'bg-amber-500/15',
                  )}
                >
                  <Typography
                    className={cn(
                      'text-xs font-semibold',
                      isFeedback ? 'text-blue-700' : 'text-amber-700',
                    )}
                  >
                    {kindLabel}
                  </Typography>
                </Badge>
              </View>

              <View className="gap-1.5">
                <Typography className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t('feedback.messageLabel')}
                </Typography>
                <Typography className="text-base leading-6 text-foreground">{item.message}</Typography>
              </View>

              <Separator />

              <View className="gap-3">
                <DetailRow label={t('feedback.detailSubmittedBy')} value={authorLabel} />
                <DetailRow label={t('feedback.detailRole')} value={roleLabel} />
                <DetailRow label={t('feedback.detailCreated')} value={createdLabel} />
                {showUpdated ? (
                  <DetailRow label={t('feedback.detailUpdated')} value={updatedLabel} />
                ) : null}
              </View>
            </View>
          </ScrollView>

          <Separator />

          <View className="px-4 py-3">
            <Button variant="outline" className="w-full" onPress={onClose}>
              <Typography className="font-semibold">{t('feedback.close')}</Typography>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
