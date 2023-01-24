declare type GameStatus = 'IDLE' | 'RECEIVED' | 'SENT' | 'WORKING' | 'VICTORY' | 'DEFEAT';

declare type EndGameStatus = Extract<GameStatus, 'VICTORY'|'DEFEAT'>
