
export function getFreshBoard ( size:number ):Board {

  return new Array( size ).fill( null )
  .map( () => new Array( size ).fill( null ) );

}
