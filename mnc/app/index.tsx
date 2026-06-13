import { Typography } from '@/components/common/typography';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

const SCREEN_OPTIONS = {
  title: 'Typography',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const VARIANTS = [
  'display',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'overline',
  'label',
  'button',
] as const;

const COLORS = [
  'default',
  'primary',
  'secondary',
  'muted',
  'destructive',
  'accent',
] as const;

const WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Typography variant="overline" color="primary">
        {title}
      </Typography>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1 border-b border-border/60 pb-3">
      <Typography variant="caption" color="muted">
        {label}
      </Typography>
      {children}
    </View>
  );
}

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-8 px-4 pb-12 pt-28">
        <Section title="Variants">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={variant}>
              <Typography variant={variant}>The quick brown fox jumps over the lazy dog</Typography>
            </Row>
          ))}
        </Section>

        <Section title="Colors">
          {COLORS.map((color) => (
            <Row key={color} label={color}>
              <Typography variant="body1" color={color}>
                Sample text in {color} color
              </Typography>
            </Row>
          ))}
          <Row label="primary-foreground on primary">
            <View className="self-start rounded-md bg-primary px-3 py-2">
              <Typography variant="body1" color="primary-foreground">
                Text on primary background
              </Typography>
            </View>
          </Row>
        </Section>

        <Section title="Weights">
          {WEIGHTS.map((weight) => (
            <Row key={weight} label={weight}>
              <Typography variant="body1" weight={weight}>
                Weight {weight}
              </Typography>
            </Row>
          ))}
        </Section>

        <Section title="Alignment">
          <Row label="left">
            <Typography variant="body1" align="left">
              Left aligned text
            </Typography>
          </Row>
          <Row label="center">
            <Typography variant="body1" align="center">
              Center aligned text
            </Typography>
          </Row>
          <Row label="right">
            <Typography variant="body1" align="right">
              Right aligned text
            </Typography>
          </Row>
        </Section>

        <Section title="Transform">
          <Row label="uppercase">
            <Typography variant="body1" transform="uppercase">
              uppercase transform
            </Typography>
          </Row>
          <Row label="lowercase">
            <Typography variant="body1" transform="lowercase">
              LOWERCASE TRANSFORM
            </Typography>
          </Row>
          <Row label="capitalize">
            <Typography variant="body1" transform="capitalize">
              capitalize each word
            </Typography>
          </Row>
        </Section>

        <Section title="Style modifiers">
          <Row label="underline">
            <Typography variant="body1" underline>
              Underlined text
            </Typography>
          </Row>
          <Row label="italic">
            <Typography variant="body1" italic>
              Italic text
            </Typography>
          </Row>
          <Row label="underline + italic + primary">
            <Typography variant="body1" color="primary" underline italic weight="semibold">
              Emphasized link style
            </Typography>
          </Row>
        </Section>
      </ScrollView>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
