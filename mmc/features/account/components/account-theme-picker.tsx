import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { MonitorIcon, MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, View } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof SunIcon;
}[] = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonStarIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

export function AccountThemePicker() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className="gap-3">
      <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        Appearance
      </Text>

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
              <Text
                className={cn(
                  'text-sm font-semibold',
                  isActive ? 'text-primary' : 'text-foreground',
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
