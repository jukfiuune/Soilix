import { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  SignUp: undefined;
  DeviceDetails: { deviceId: string };
  Statistics: { deviceId: string };
};
