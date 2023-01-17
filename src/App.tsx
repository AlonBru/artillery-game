import { Game } from './components/Game';

function App () {

  return <div>
    <Game/>
    {import.meta.env.DEV && <Game/>}
  </div>;

}


export default App;


