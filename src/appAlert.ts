import { Alert } from 'react-native';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  onPress?: () => void;
  style?: AppAlertButtonStyle;
  text: string;
};

export type AppAlertConfig = {
  buttons?: AppAlertButton[];
  message?: string;
  title: string;
};

type AppAlertListener = (config: AppAlertConfig) => void;

let listener: AppAlertListener | null = null;

export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
) {
  if (listener) {
    listener({ title, message, buttons });
    return;
  }

  // Only reachable before AppAlertHost mounts. The native dialog ignores the dark
  // palette, but losing a message entirely would be worse.
  Alert.alert(title, message, buttons);
}

export function subscribeToAppAlerts(nextListener: AppAlertListener) {
  listener = nextListener;

  return () => {
    if (listener === nextListener) {
      listener = null;
    }
  };
}
