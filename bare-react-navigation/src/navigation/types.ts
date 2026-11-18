export type RootStackParamList = {
  Home: undefined;
  Trail: { id: string; ref?: string };
  Settings: undefined;
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
