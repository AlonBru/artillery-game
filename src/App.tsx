import { useState } from 'react';
import { Board } from './components/Board';


function App () {

  const [ commandMode, setCommandMode ] = useState<CommandMode>( 'INITIAL' );


  return (
    <Board
      commandMode={commandMode}
      setCommandMode={setCommandMode}
    />
  );

}

export default App;
