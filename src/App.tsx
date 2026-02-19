import { useGame } from './GameContext';
import SetupScreen from './components/SetupScreen';
import BattleScreen from './components/BattleScreen';

function App() {
  const { state } = useGame();

  return state.phase === 'setup' ? <SetupScreen /> : <BattleScreen />;
}

export default App;
