import { Icon } from '@/components/ui/icon';
import { Typography } from '@/components/ui/typography';
import { useTranslation } from 'react-i18next';
import { useAppLocale } from '@/hooks/use-app-locale';
import { cn } from '@/lib/utils';
import type { AppLocale } from '@/locales';
import type { TranslationKey } from '@/locales/keys';
import { LanguagesIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

const LANGUAGE_OPTIONS: { value: AppLocale; labelKey: TranslationKey }[] = [
  { value: 'en', labelKey: 'locale.english' },
  { value: 'hi', labelKey: 'locale.hindi' },
];

export function AccountLanguagePicker() {
  const { t } = useTranslation();
  const { locale, setLocale } = useAppLocale();

  return (
    <View className="gap-3">
      <Typography className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {t('locale.language')}
      </Typography>

      <View className="flex-row gap-2">
        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = locale === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => void setLocale(option.value)}
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
                  as={LanguagesIcon}
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
