import { ThemeProvider } from 'styled-components';
import { Game } from './components/Game';
import { theme } from './helpers/theme';

function App () {

  return <ThemeProvider theme={theme}>
      <Game/>
      {import.meta.env.DEV && <Game/>}
  </ThemeProvider>;

}


export default App;


