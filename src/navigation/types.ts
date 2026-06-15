import { NavigatorScreenParams } from '@react-navigation/native';

/** Bottom tab routes. */
export type TabParamList = {
  Portfolio: undefined;
  Positions: undefined;
  Metrics: undefined;
  Add: undefined;
};

/** Root stack: the tabs plus modal screens layered on top. */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  EditPosition: { positionId: string };
};
