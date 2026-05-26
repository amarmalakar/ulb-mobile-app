import { TextClassContext } from '@/components/ui/text';
import { getGeistFontFamily } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role, type TextStyle } from 'react-native';

/**
 * Typography — the canonical text component for the app.
 *
 * Renders all text in the Geist font and exposes a rich, composable variant
 * API so callers rarely need to reach for raw Tailwind utility classes for
 * font sizing / weight / color.
 *
 * Usage:
 *   <Typography variant="h1">Big title</Typography>
 *   <Typography variant="body1" color="muted">Subtle copy</Typography>
 *   <Typography variant="label" weight="semibold">Field label</Typography>
 *   <Typography weight="bold" italic>Custom emphasis</Typography>
 */

const typographyVariants = cva(
  cn(
    'text-foreground font-sans',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        display: cn(
          'text-5xl tracking-tight',
          Platform.select({ web: 'scroll-m-20 text-balance' })
        ),
        h1: cn('text-4xl tracking-tight', Platform.select({ web: 'scroll-m-20 text-balance' })),
        h2: cn('text-3xl tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        h3: cn('text-2xl tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        h4: cn('text-xl tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        h5: 'text-lg',
        h6: 'text-base',
        subtitle1: 'text-base',
        subtitle2: 'text-sm',
        body1: 'text-base leading-6',
        body2: 'text-sm leading-5',
        caption: 'text-xs leading-4',
        overline: 'text-xs uppercase tracking-widest',
        label: 'text-sm leading-none',
        button: 'text-sm',
      },
      color: {
        default: 'text-foreground',
        primary: 'text-primary',
        'primary-foreground': 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
        'destructive-foreground': 'text-white',
        accent: 'text-accent-foreground',
        card: 'text-card-foreground',
        inverse: 'text-background',
        inherit: '',
      },
      align: {
        auto: '',
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      transform: {
        none: '',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
      },
      underline: {
        true: 'underline',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'body1',
      color: 'inherit',
      align: 'auto',
      transform: 'none',
      underline: false,
    },
  }
);

type TypographyVariantProps = VariantProps<typeof typographyVariants>;
type Variant = NonNullable<TypographyVariantProps['variant']>;

export type TypographyWeight =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

// Default font weight applied per variant. Can be overridden via `weight` prop.
const VARIANT_DEFAULT_WEIGHT: Record<Variant, TypographyWeight> = {
  display: 'extrabold',
  h1: 'extrabold',
  h2: 'bold',
  h3: 'semibold',
  h4: 'semibold',
  h5: 'semibold',
  h6: 'semibold',
  subtitle1: 'medium',
  subtitle2: 'medium',
  body1: 'regular',
  body2: 'regular',
  caption: 'regular',
  overline: 'medium',
  label: 'medium',
  button: 'medium',
};

const WEIGHT_TO_RN: Record<TypographyWeight, TextStyle['fontWeight']> = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

const ROLE: Partial<Record<Variant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  h5: 'heading',
  h6: 'heading',
};

const ARIA_LEVEL: Partial<Record<Variant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
  h5: '5',
  h6: '6',
};

type TypographyOwnProps = TypographyVariantProps & {
  weight?: TypographyWeight;
  italic?: boolean;
  asChild?: boolean;
};

export type TypographyProps = React.ComponentProps<typeof RNText> &
  React.RefAttributes<typeof RNText> &
  TypographyOwnProps;

function Typography({
  className,
  style,
  variant = 'body1',
  color,
  align,
  transform,
  underline,
  weight,
  italic = false,
  asChild = false,
  numberOfLines,
  ...props
}: TypographyProps) {
  const inheritedClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;

  const resolvedWeight: TypographyWeight =
    weight ?? VARIANT_DEFAULT_WEIGHT[variant ?? 'body1'];
  const rnFontWeight = WEIGHT_TO_RN[resolvedWeight];
  const fontFamily = getGeistFontFamily(rnFontWeight, italic);

  const fontStyle: TextStyle = {
    fontFamily,
    fontWeight: rnFontWeight,
    ...(italic ? { fontStyle: 'italic' } : null),
  };

  return (
    <Component
      className={cn(
        typographyVariants({ variant, color, align, transform, underline }),
        inheritedClass,
        className
      )}
      style={style ? [fontStyle, style] : fontStyle}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      numberOfLines={numberOfLines}
      {...props}
    />
  );
}

export { Typography, typographyVariants };
