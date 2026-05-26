import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useLogout } from '@/hooks/use-logout';
import {
  BellIcon,
  CircleHelpIcon,
  LogOutIcon,
  MessageSquareTextIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { AccountLanguagePicker } from './components/account-language-picker';
import { AccountSettingsRow } from './components/account-settings-row';
import { AccountThemePicker } from './components/account-theme-picker';
import { useAccountProfile } from './hooks/use-account-profile';

export function Account() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout, isLoggingOut } = useLogout();
  const {
    authType,
    ulb,
    name,
    email,
    phone,
    subtitle,
    isLoading,
    error,
  } = useAccountProfile();

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <SafeAreaView className="bg-background flex-1" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-28 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Typography className="text-foreground text-2xl font-extrabold">{t('account.title')}</Typography>
        <Typography className="text-muted-foreground mt-1 text-sm">{t('account.subtitle')}</Typography>

        <View className="bg-card border-border mt-6 rounded-2xl border p-4">
          <View className="flex-row items-center gap-4">
            <Avatar alt={`${name} avatar`} className="size-16">
              <AvatarFallback className="bg-primary/15 rounded-2xl">
                <Typography className="text-primary text-lg font-bold">{initials}</Typography>
              </AvatarFallback>
            </Avatar>

            <View className="flex-1">
              {isLoading ? (
                <ActivityIndicator className="self-start" />
              ) : (
                <>
                  <Typography className="text-foreground text-xl font-bold">{name}</Typography>
                  <Typography className="text-primary mt-0.5 text-sm font-semibold">
                    {authType}
                    {ulb?.key ? ` · ${ulb.key}` : ''}
                  </Typography>
                  {subtitle ? (
                    <Typography className="text-muted-foreground mt-1 text-sm">{subtitle}</Typography>
                  ) : null}
                </>
              )}
            </View>
          </View>

          {!isLoading && !error ? (
            <View className="border-border mt-4 gap-2 border-t pt-4">
              {phone ? (
                <Typography className="text-muted-foreground text-sm">
                  <Typography className="text-foreground font-semibold">{t('account.phone')} </Typography>
                  {phone}
                </Typography>
              ) : null}
              {email ? (
                <Typography className="text-muted-foreground text-sm">
                  <Typography className="text-foreground font-semibold">{t('account.email')} </Typography>
                  {email}
                </Typography>
              ) : null}
              {ulb?.name ? (
                <Typography className="text-muted-foreground text-sm">
                  <Typography className="text-foreground font-semibold">{t('account.ulb')} </Typography>
                  {ulb.name}
                </Typography>
              ) : null}
            </View>
          ) : null}

          {error ? (
            <Typography className="text-destructive mt-3 text-sm">
              {t('account.profileError')}
            </Typography>
          ) : null}
        </View>

        <View className="mt-6 gap-6">
          <AccountLanguagePicker />
          <AccountThemePicker />
        </View>

        <View className="mt-6 gap-2">
          <Typography className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
            {t('account.preferences')}
          </Typography>

          {/* <AccountSettingsRow
            label="Notifications"
            description="Alerts and updates"
            icon={BellIcon}
          /> */}
          <AccountSettingsRow
            label={t('account.feedback')}
            icon={MessageSquareTextIcon}
            onPress={() => router.push('/common/feedback-and-suggestion-screen')}
          />
          {/* <AccountSettingsRow
            label="Help & support"
            icon={CircleHelpIcon}
          /> */}
        </View>

        <Button
          variant="destructive"
          className="mt-8 h-14 rounded-2xl"
          disabled={isLoggingOut}
          onPress={() => void logout()}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon as={LogOutIcon} className="text-primary-foreground size-5" />
              <Typography className="text-primary-foreground ml-2 text-base font-semibold">
                {t('account.logout')}
              </Typography>
            </>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
