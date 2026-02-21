# Project: `expo-starter-template`

**Stack:** Expo SDK 54 | React Native 0.81.5 | React 19.1 | TypeScript 5.9

## Project Structure

```
expo-starter-template/
├── App.tsx                    # Entry point (NavigationContainer + SafeAreaProvider)
├── index.ts                   # Expo entry
├── app.json                   # Expo config (auto dark/light mode, bundle IDs)
├── tsconfig.json              # Strict TS with @/ path aliases
├── babel.config.js            # Module resolver for @/ alias
├── assets/                    # Expo default assets (icon, splash, etc.)
└── src/
    ├── components/            # Reusable UI components
    │   ├── Button.tsx         # Themed button (primary/secondary/outline + loading)
    │   ├── Card.tsx           # Themed card container
    │   └── index.ts
    ├── screens/               # App screens
    │   ├── HomeScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── index.ts
    ├── navigation/            # React Navigation setup
    │   ├── RootNavigator.tsx  # Stack navigator (wraps tabs)
    │   ├── TabNavigator.tsx   # Bottom tab navigator (Home, Profile)
    │   └── index.ts
    ├── hooks/                 # Custom hooks
    │   ├── useAppTheme.ts     # Light/dark theme hook
    │   └── index.ts
    ├── constants/             # App constants
    │   ├── theme.ts           # Colors, spacing, fonts, border radius
    │   └── index.ts
    ├── services/              # API / backend services
    │   ├── api.ts             # Generic HTTP client (GET/POST/PUT/PATCH/DELETE)
    │   └── index.ts
    ├── types/                 # TypeScript type definitions
    │   ├── navigation.ts      # Navigation param lists
    │   └── index.ts
    ├── utils/                 # Utility helpers
    │   ├── helpers.ts         # truncate, formatDate, delay, generateId
    │   └── index.ts
    └── assets/
        ├── images/
        └── fonts/
```

## Key Features

- **Path aliases:** Use `@/components/Button` instead of `../../components/Button`
- **Auto dark/light mode:** `useAppTheme()` hook + themed color system
- **Navigation ready:** Stack + Bottom Tab navigators with typed params
- **Reusable components:** Button (3 variants + loading state), Card
- **API service:** Generic typed HTTP client ready for your backend
- **TypeScript strict mode** with zero type errors

## Getting Started

```bash
cd mobile_apps/expo-starter-template
npm start
```

Update `app.json` with your app name, slug, and bundle identifiers before building.
