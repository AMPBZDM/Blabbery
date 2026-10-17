/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(true),
  getStringAsync: jest.fn().mockResolvedValue(''),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native', () => ({
  Share: {
    share: jest.fn().mockResolvedValue({ action: 'sharedAction' }),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },
  Platform: {
    OS: 'android',
    select: (objs) => (objs && objs.android ? objs.android : objs ? objs.default : undefined),
  },
  StyleSheet: {
    create: (styles) => styles,
    absoluteFill: {},
  },
  Alert: {
    alert: jest.fn(),
  },
}));
