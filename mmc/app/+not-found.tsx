import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Typography } from '@/components/ui/typography';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.oops') }} />
      <View>
        <Typography>{t('notFound.title')}</Typography>

        <Link href="/">
          <Typography>{t('notFound.goHome')}</Typography>
        </Link>
      </View>
    </>
  );
}
