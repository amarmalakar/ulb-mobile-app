import { AlertCircleIcon, RefreshCcwIcon, UsersIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Typography } from '@/components/common/typography';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LeadershipMember, LeadershipPosition } from '@/types/leadership';

type UserLeadershipProps = {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  leadership: LeadershipMember[];
  onRetry?: () => void;
};

function leadershipPositionKey(position: LeadershipPosition) {
  const keys = {
    Mayor: 'leadership.positions.mayor',
    'Deputy Mayor': 'leadership.positions.deputyMayor',
    'Ward Coordinator': 'leadership.positions.wardCoordinator',
  } as const;
  return keys[position];
}

function getPositionLabel(position: string, t: (key: string) => string): string {
  if (position === 'Mayor' || position === 'Deputy Mayor' || position === 'Ward Coordinator') {
    return t(leadershipPositionKey(position));
  }
  return position;
}

function LeadershipSectionTitle() {
  const { t } = useTranslation();
  return (
    <Typography variant="h4" className="text-primary">
      {t('leadership.title')}
    </Typography>
  );
}

function LeadershipSkeleton() {
  return (
    <View className="gap-4 py-4 px-2">
      <Skeleton className="h-7 w-40" />
      <View className="flex-row gap-3">
        {new Array(3).fill(0).map((_, index) => (
          <View
            key={index}
            className="flex-1 gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <Skeleton className="mx-auto size-14 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </View>
        ))}
      </View>
    </View>
  );
}

function LeadershipError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="gap-4 py-4 px-2">
      <LeadershipSectionTitle />
      <View className="items-center gap-4 rounded-2xl border border-border bg-card px-4 py-8">
        <View className="bg-destructive/10 size-16 items-center justify-center rounded-full">
          <Icon as={AlertCircleIcon} className="text-destructive" size={32} />
        </View>
        <View className="gap-1.5">
          <Typography className="text-destructive text-center text-base font-bold">
            {t('common.errorTitle')}
          </Typography>
          <Typography className="text-muted-foreground text-center text-sm">
            {message ?? t('leadership.loadError')}
          </Typography>
        </View>
        {onRetry ? (
          <Button size="sm" variant="outline" onPress={onRetry}>
            <Icon as={RefreshCcwIcon} className="size-4" />
            <Typography>{t('common.retry')}</Typography>
          </Button>
        ) : null}
      </View>
    </View>
  );
}

function LeadershipEmpty() {
  const { t } = useTranslation();

  return (
    <View className="gap-4 py-4 px-2">
      <LeadershipSectionTitle />
      <View className="items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8">
        <View className="size-16 items-center justify-center rounded-full bg-muted">
          <Icon as={UsersIcon} className="text-muted-foreground" size={32} />
        </View>
        <View className="gap-1.5">
          <Typography className="text-center text-base font-bold text-foreground">
            {t('leadership.emptyTitle')}
          </Typography>
          <Typography className="text-muted-foreground max-w-[280px] text-center text-sm leading-relaxed">
            {t('leadership.emptyHint')}
          </Typography>
        </View>
      </View>
    </View>
  );
}

function LeadershipCard({ member }: { member: LeadershipMember }) {
  const { t } = useTranslation();
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View className="flex-1 gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <Avatar alt={`${member.name} photo`} className="mx-auto size-14">
        {member.profilePic ? (
          <AvatarImage source={{ uri: member.profilePic }} />
        ) : null}
        <AvatarFallback className="bg-primary/10">
          <Text className="text-sm font-bold text-primary">{initials || '?'}</Text>
        </AvatarFallback>
      </Avatar>

      <View className="gap-2">
        <Typography className="text-center text-xs font-bold text-foreground" numberOfLines={2}>
          {member.name}
        </Typography>
        <View
          className={cn(
            'items-center rounded-full border px-1.5 py-0.5',
            'border-sky-200 bg-sky-100'
          )}
        >
          <Typography
            className={cn('text-center text-[10px] font-semibold leading-tight text-sky-700')}
            numberOfLines={1}
          >
            {getPositionLabel(member.position, t)}
          </Typography>
        </View>
      </View>
    </View>
  );
}

function LeadershipList({ leadership }: { leadership: LeadershipMember[] }) {
  const sorted = useMemo(
    () => [...leadership].sort((a, b) => a.sortOrder - b.sortOrder),
    [leadership],
  );

  return (
    <View className="gap-4 py-4 px-2">
      <LeadershipSectionTitle />
      <View className="flex-row gap-3">
        {sorted.map((member) => (
          <LeadershipCard
            key={`${member.position}-${member.sortOrder}-${member.name}`}
            member={member}
          />
        ))}
      </View>
    </View>
  );
}

export function Leadership({
  isLoading,
  isError,
  error,
  leadership,
  onRetry,
}: UserLeadershipProps) {
  if (isLoading) {
    return <LeadershipSkeleton />;
  }

  if (isError) {
    return <LeadershipError message={error?.message} onRetry={onRetry} />;
  }

  if (leadership.length === 0) {
    return <LeadershipEmpty />;
  }

  return <LeadershipList leadership={leadership} />;
}
