import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.oops') }} />
      <View>
        <Text>{t('notFound.title')}</Text>

        <Link href="/">
          <Text>{t('notFound.goHome')}</Text>
        </Link>
      </View>
    </>
  );
}
