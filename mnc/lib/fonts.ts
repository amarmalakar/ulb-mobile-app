import type { TextStyle } from 'react-native';

export const GEIST_FONT_FAMILY = {
  thin: 'Geist-Thin',
  thinItalic: 'Geist-ThinItalic',
  extraLight: 'Geist-ExtraLight',
  extraLightItalic: 'Geist-ExtraLightItalic',
  light: 'Geist-Light',
  lightItalic: 'Geist-LightItalic',
  regular: 'Geist-Regular',
  italic: 'Geist-Italic',
  medium: 'Geist-Medium',
  mediumItalic: 'Geist-MediumItalic',
  semiBold: 'Geist-SemiBold',
  semiBoldItalic: 'Geist-SemiBoldItalic',
  bold: 'Geist-Bold',
  boldItalic: 'Geist-BoldItalic',
  extraBold: 'Geist-ExtraBold',
  extraBoldItalic: 'Geist-ExtraBoldItalic',
  black: 'Geist-Black',
  blackItalic: 'Geist-BlackItalic',
} as const;

// Maps to require() calls so `useFonts` from expo-font can load them at runtime
// (this is also what enables Expo Go to use the fonts; on a development build
// the expo-font config plugin in app.json embeds them natively).
export const geistFontMap = {
  [GEIST_FONT_FAMILY.thin]: require('@/assets/fonts/Geist/static/Geist-Thin.ttf'),
  [GEIST_FONT_FAMILY.thinItalic]: require('@/assets/fonts/Geist/static/Geist-ThinItalic.ttf'),
  [GEIST_FONT_FAMILY.extraLight]: require('@/assets/fonts/Geist/static/Geist-ExtraLight.ttf'),
  [GEIST_FONT_FAMILY.extraLightItalic]: require('@/assets/fonts/Geist/static/Geist-ExtraLightItalic.ttf'),
  [GEIST_FONT_FAMILY.light]: require('@/assets/fonts/Geist/static/Geist-Light.ttf'),
  [GEIST_FONT_FAMILY.lightItalic]: require('@/assets/fonts/Geist/static/Geist-LightItalic.ttf'),
  [GEIST_FONT_FAMILY.regular]: require('@/assets/fonts/Geist/static/Geist-Regular.ttf'),
  [GEIST_FONT_FAMILY.italic]: require('@/assets/fonts/Geist/static/Geist-Italic.ttf'),
  [GEIST_FONT_FAMILY.medium]: require('@/assets/fonts/Geist/static/Geist-Medium.ttf'),
  [GEIST_FONT_FAMILY.mediumItalic]: require('@/assets/fonts/Geist/static/Geist-MediumItalic.ttf'),
  [GEIST_FONT_FAMILY.semiBold]: require('@/assets/fonts/Geist/static/Geist-SemiBold.ttf'),
  [GEIST_FONT_FAMILY.semiBoldItalic]: require('@/assets/fonts/Geist/static/Geist-SemiBoldItalic.ttf'),
  [GEIST_FONT_FAMILY.bold]: require('@/assets/fonts/Geist/static/Geist-Bold.ttf'),
  [GEIST_FONT_FAMILY.boldItalic]: require('@/assets/fonts/Geist/static/Geist-BoldItalic.ttf'),
  [GEIST_FONT_FAMILY.extraBold]: require('@/assets/fonts/Geist/static/Geist-ExtraBold.ttf'),
  [GEIST_FONT_FAMILY.extraBoldItalic]: require('@/assets/fonts/Geist/static/Geist-ExtraBoldItalic.ttf'),
  [GEIST_FONT_FAMILY.black]: require('@/assets/fonts/Geist/static/Geist-Black.ttf'),
  [GEIST_FONT_FAMILY.blackItalic]: require('@/assets/fonts/Geist/static/Geist-BlackItalic.ttf'),
};

type FontWeightInput = TextStyle['fontWeight'];

const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': GEIST_FONT_FAMILY.thin,
  '200': GEIST_FONT_FAMILY.extraLight,
  '300': GEIST_FONT_FAMILY.light,
  '400': GEIST_FONT_FAMILY.regular,
  normal: GEIST_FONT_FAMILY.regular,
  '500': GEIST_FONT_FAMILY.medium,
  '600': GEIST_FONT_FAMILY.semiBold,
  '700': GEIST_FONT_FAMILY.bold,
  bold: GEIST_FONT_FAMILY.bold,
  '800': GEIST_FONT_FAMILY.extraBold,
  '900': GEIST_FONT_FAMILY.black,
};

const WEIGHT_TO_ITALIC_FAMILY: Record<string, string> = {
  '100': GEIST_FONT_FAMILY.thinItalic,
  '200': GEIST_FONT_FAMILY.extraLightItalic,
  '300': GEIST_FONT_FAMILY.lightItalic,
  '400': GEIST_FONT_FAMILY.italic,
  normal: GEIST_FONT_FAMILY.italic,
  '500': GEIST_FONT_FAMILY.mediumItalic,
  '600': GEIST_FONT_FAMILY.semiBoldItalic,
  '700': GEIST_FONT_FAMILY.boldItalic,
  bold: GEIST_FONT_FAMILY.boldItalic,
  '800': GEIST_FONT_FAMILY.extraBoldItalic,
  '900': GEIST_FONT_FAMILY.blackItalic,
};

export function getGeistFontFamily(
  weight: FontWeightInput | undefined,
  italic = false,
): string {
  const key = weight === undefined || weight === null ? 'normal' : String(weight);
  const map = italic ? WEIGHT_TO_ITALIC_FAMILY : WEIGHT_TO_FAMILY;
  return map[key] ?? (italic ? GEIST_FONT_FAMILY.italic : GEIST_FONT_FAMILY.regular);
}
