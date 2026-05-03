import { useEffect } from 'react';
import { useStore } from './state/loadSessionStore.js';
import AppShell from '../components/shell/AppShell.jsx';
import { SCREEN_MAP } from './routes.jsx';

export default function App() {
  const currentScreen = useStore((s) => s.currentScreen);

  useEffect(() => {
    const isPwa =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone;
    if (isPwa) document.documentElement.classList.add('pwa-standalone');
  }, []);

  const Screen = SCREEN_MAP[currentScreen] || SCREEN_MAP['splash'];

  return (
    <AppShell>
      <Screen />
    </AppShell>
  );
}
