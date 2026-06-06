const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: "com.amarmalakar.mmc",
    },
    plugins: [
      ...(appJson.expo.plugins ?? []),
      [
        "react-native-maps",
        {
          androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
        },
      ],
    ],
  },
};
