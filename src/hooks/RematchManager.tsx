import { useEffect, useState } from 'react';
import { useConnectionContext } from './useConnection';
import { Modal } from '../components/Modal';
import { RematchMessage } from '../helpers/Message';

export function RematchManager ( { reset }:{reset():void} ) {

  const [ showModal, setShow ] = useState( false );
  const { disconnect, addDataConnectionEventListener, sendMessage } = useConnectionContext();
  useEffect(
    () => addDataConnectionEventListener( ( message ) => {

      if ( message.type !== 'rematch' ) {

        return;

      }
      if ( message.data === 'request' ) {

        setShow( true );

      }

    } ),
    []
  );
  return <Modal
    show={showModal}
  >
    Your Opponent is requesting a rematch, <br />
    you in?
    <button
      onClick={() => {

        sendMessage( new RematchMessage( 'accept' ) );
        setShow( false );
        reset();

      }}
    >
      yes
    </button>
    <button
      onClick={() => {

        disconnect();

      }}
    >
      leave
    </button>
  </Modal>;

}
