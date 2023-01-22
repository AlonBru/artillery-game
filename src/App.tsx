import { ThemeProvider } from 'styled-components';
import { Game } from './components/Game';
import { theme } from './helpers/theme';

function App () {

  return <ThemeProvider theme={theme}>
    <div>
      <Game/>
      {import.meta.env.DEV && <Game/>}
    </div>
  </ThemeProvider>;

}


export default App;


