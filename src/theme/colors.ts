export type AppColors = {
  appBackground: string;
  panel: string;
  surface: string;
  subtleBackground: string;
  text: string;
  muted: string;
  border: string;
  active: string;
  activeBorder: string;
  primary: string;
  destructive: string;
  destructiveBorder: string;
  // Card marks only. Everything else in the app is the one accent colour, which is
  // exactly why the marks cannot use it: they would disappear into it.
  positive: string;
  attention: string;
};

export const colors: AppColors = {
  appBackground: '#12141C',
  panel: '#1A1D28',
  surface: '#191C26',
  subtleBackground: '#222634',
  text: '#ECEEF5',
  muted: '#9AA0B4',
  border: '#2E3446',
  active: '#241E3C',
  activeBorder: '#4A3D7A',
  primary: '#A78BFA',
  destructive: '#FF8585',
  destructiveBorder: '#B85555',
  positive: '#6FD39B',
  attention: '#F0B45C',
};
