import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/common/typography';
import { useTranslation } from 'react-i18next';
import type { TranslationKey } from '@/lib/i18n/locales/keys';
import { cn } from '@/lib/utils';
import { MonitorIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, View } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

const THEME_OPTIONS: {
  value: ThemePreference;
  labelKey: TranslationKey;
  icon: typeof SunIcon;
}[] = [
    { value: 'light', labelKey: 'account.themeLight', icon: SunIcon },
    { value: 'dark', labelKey: 'account.themeDark', icon: MoonStarIcon },
    { value: 'system', labelKey: 'account.themeSystem', icon: MonitorIcon },
  ];

export function AccountThemePicker() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className="gap-3">
      <Typography className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {t('account.appearance')}
      </Typography>

      <View className="flex-row gap-2">
        {THEME_OPTIONS.map((option) => {
          const isActive = colorScheme === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => setColorScheme(option.value)}
              className={cn(
                'bg-card border-border flex-1 items-center rounded-2xl border px-3 py-4',
                isActive && 'border-primary bg-primary/5',
              )}
            >
              <View
                className={cn(
                  'mb-2 h-10 w-10 items-center justify-center rounded-full',
                  isActive ? 'bg-primary' : 'bg-muted',
                )}
              >
                <Icon
                  as={option.icon}
                  className={cn('size-5', isActive ? 'text-primary-foreground' : 'text-foreground')}
                />
              </View>
              <Typography
                className={cn(
                  'text-sm font-semibold',
                  isActive ? 'text-primary' : 'text-foreground',
                )}
              >
                {t(option.labelKey)}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
