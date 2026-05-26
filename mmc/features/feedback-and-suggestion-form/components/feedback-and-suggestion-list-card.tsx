import { Pressable, View } from 'react-native';
import { CalendarIcon, MessageSquareTextIcon, UserRoundIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/provider/auth-provider';
import { useStaffAuth } from '@/components/provider/staff-auth-provider';
import { useUserAuth } from '@/components/provider/user-auth-provider';
import {
  formatFeedbackDate,
  getFeedbackAuthorLabel,
} from '@/features/feedback-and-suggestion-form/lib/feedback-list-utils';
import type { FeedbackAndSuggestionListItem } from '@/features/feedback-and-suggestion-form/types';

type FeedbackAndSuggestionListCardProps = {
  item: FeedbackAndSuggestionListItem;
  onPress: () => void;
};

export function FeedbackAndSuggestionListCard({ item, onPress }: FeedbackAndSuggestionListCardProps) {
  const { t } = useTranslation();
  const { authType } = useAuthContext();
  const { userInfo } = useUserAuth();
  const { staffInfo } = useStaffAuth();

  const kindLabel =
    item.kind === 'FEEDBACK' ? t('feedback.kindFeedback') : t('feedback.kindSuggestion');

  const authorLabel = getFeedbackAuthorLabel(item, t, {
    currentUserId: authType === 'User' ? userInfo?.id : undefined,
    currentStaffId: authType === 'Staff' ? staffInfo?.id : undefined,
  });

  const createdLabel = formatFeedbackDate(item.createdAt);
  const isFeedback = item.kind === 'FEEDBACK';

  return (
    <Pressable
      className="active:opacity-90"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View className="overflow-hidden rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-start gap-3">
          <View
            className={cn(
              'size-11 shrink-0 items-center justify-center rounded-xl',
              isFeedback ? 'bg-blue-500/15' : 'bg-amber-500/15',
            )}
          >
            <Icon
              as={MessageSquareTextIcon}
              className={cn('size-5', isFeedback ? 'text-blue-600' : 'text-amber-600')}
            />
          </View>

          <View className="min-w-0 flex-1 gap-2">
            <View className="flex-row items-start justify-between gap-2">
              <Typography className="flex-1 text-base font-semibold text-foreground" numberOfLines={2}>
                {item.title}
              </Typography>
              <Badge
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5',
                  isFeedback ? 'bg-blue-500/15' : 'bg-amber-500/15',
                )}
              >
                <Typography
                  className={cn(
                    'text-[11px] font-semibold',
                    isFeedback ? 'text-blue-700' : 'text-amber-700',
                  )}
                >
                  {kindLabel}
                </Typography>
              </Badge>
            </View>

            <Typography className="text-sm leading-5 text-muted-foreground" numberOfLines={3}>
              {item.message}
            </Typography>

            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              <View className="flex-row items-center gap-1">
                <Icon as={UserRoundIcon} className="size-3.5 text-muted-foreground" />
                <Typography className="text-xs font-medium text-muted-foreground">{authorLabel}</Typography>
              </View>
              <View className="flex-row items-center gap-1">
                <Icon as={CalendarIcon} className="size-3.5 text-muted-foreground" />
                <Typography className="text-xs text-muted-foreground">{createdLabel}</Typography>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
