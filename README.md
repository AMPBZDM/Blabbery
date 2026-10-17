# Blabbery 💬✨

> A delightful, privacy-first fill-in-the-blank party story game for mobile.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline-success.svg)](#privacy--offline-first)

**Blabbery** is a modern fill-in-the-blank party game that turns everyday words into pure comedic gold! You provide the words (nouns, verbs, wacky adjectives, silly noises, and favorite foods) without knowing the context—then watch the app weave them into hilarious, unpredictable, and heartwarming stories!

Play solo for quick creative laughs, or pass the phone around with friends and family at parties, road trips, and game nights.

---

## ✨ Features

- 📚 **Handcrafted Story Collection**: 40+ original templates across 6 engaging categories:
  - 🍕 **Funny**: Absurd situations, kitchen chaos, and hilarious mishaps.
  - 🧭 **Adventure**: Epic quests, enchanted castles, and brave heroes.
  - 🚀 **Sci-Fi**: Space travels, time machines, and rogue vacuum cleaners.
  - 💼 **School & Work**: Chaotic classrooms and bizarre office shenanigans.
  - 🐱 **Animals**: Secret pet lives and wild creature capers.
  - 👻 **Spooky**: Friendly phantoms, vampire dentists, and eerie mysteries.
- 💡 **Inspiration & Word Banks**: Stuck on an adverb or animal? Quick-pick inspiration chips and examples help spark your imagination.
- 💾 **Smart Auto-Saving Drafts**: Step away anytime without worry—active stories are saved locally so you can resume where you left off.
- 🔍 **Instant Search & Favorites**: Filter by category, search stories by title or description, and star your favorites for quick access.
- 🔊 **Text-to-Speech (TTS)**: Listen to your masterpiece read aloud with adjustable speech rate.
- 📸 **Shareable Story Cards**: Export and share your finished creation as a styled image card or copy formatted plain text to clipboard.
- 📖 **Saved Stories Library**: Keep a permanent personal collection of all completed stories to re-read and share later.
- 🎨 **Adaptive Themes & Accessibility**:
  - Full Dark Mode, Light Mode, and System Theme support.
  - Dynamic Font Size scaling for comfortable reading.
  - Tactile haptic feedback on interactions.
- 🛡️ **100% Offline & Private**: Zero tracking, zero telemetry, zero accounts, and zero ads. Everything stays securely on your device.

---

## 🛡️ Privacy & Offline-First

Blabbery is designed from the ground up to respect user privacy:

- **No Network Required**: The entire game runs completely offline.
- **No Data Collection**: No analytics, telemetry, crash reporting, or tracking SDKs.
- **No Accounts**: Install and play immediately—no sign-ups or logins required.
- **Local Storage Only**: Your saved stories and preferences are stored exclusively on your device.
- **Open Source**: Fully auditable code under the permissive [MIT License](LICENSE).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)
- [Expo Go](https://expo.dev/go) on your physical device, or an Android/iOS emulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AMPBZDM/Blabbery.git
   cd Blabbery
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Launch the app:**
   - Scan the terminal QR code with **Expo Go** (Android) or the Camera app (iOS).
   - Or press `a` for Android Emulator, `i` for iOS Simulator, or `w` for Web.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Expo](https://expo.dev) (SDK 57) + [React Native](https://reactnative.dev) (0.86)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `@react-native-async-storage/async-storage` persistence
- **Audio & Sharing**: `expo-speech`, `expo-sharing`, `react-native-view-shot`
- **UI & Icons**: [Lucide React Native](https://lucide.dev), custom accessible theme system
- **Feedback**: `expo-haptics`
- **Language**: TypeScript (strict type safety)
- **Testing**: Jest + `ts-jest`

---

## 📁 Project Structure

```
├── assets/                 # App icons, splash screens, and images
├── src/
│   ├── app/                # Expo Router screens and layouts
│   │   ├── (tabs)/         # Bottom tab navigator (Home, Library, Settings)
│   │   ├── story/[id].tsx  # Interactive word input flow & review
│   │   └── result/[id].tsx # Story presentation, TTS, and sharing
│   ├── components/         # Modular, reusable UI components
│   │   ├── common/         # Buttons, Badges, Cards, SearchInput
│   │   ├── home/           # HeroQuickPlay, CategorySection, FavoritesBanner
│   │   └── story/          # StoryCard, WordInputCard, StoryReader, ShareCard
│   ├── constants/          # Colors, typography, spacing, shadows
│   ├── data/               # Story templates and word banks
│   │   └── stories/        # Categorized story collections
│   ├── hooks/              # Custom hooks (useTheme, useColorScheme)
│   ├── services/           # Business logic & engines
│   │   ├── engine/         # Template parsing, tokenization, validators
│   │   ├── speech.ts       # Text-to-speech service
│   │   └── share.ts        # Story sharing and clipboard helpers
│   ├── store/              # Zustand stores (useStoryStore, useSettingsStore)
│   ├── types/              # TypeScript interfaces and types
│   └── utils/              # Haptics and helper utilities
├── app.json                # Expo application configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

---

## 🧪 Testing & Code Quality

The project includes unit and integration tests covering story template parsing, token collision prevention, word validation, and local persistence.

```bash
# Run unit and integration tests
npm test

# Run TypeScript type check
npx tsc --noEmit

# Run ESLint
npx expo lint
```

---

## 🤝 Contributing

Contributions are warmly welcomed! If you have ideas for new hilarious stories, features, or improvements:

1. **Fork the repository**
2. **Create your feature branch**:
   ```bash
   git checkout -b feature/new-funny-story
   ```
3. **Add your changes** (e.g. add a new story in `src/data/stories/`)
4. **Ensure all tests pass**:
   ```bash
   npm test
   npx tsc --noEmit
   npx expo lint
   ```
5. **Commit and push**:
   ```bash
   git commit -m "feat: add Time Traveler's Grocery List story"
   git push origin feature/new-funny-story
   ```
6. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
