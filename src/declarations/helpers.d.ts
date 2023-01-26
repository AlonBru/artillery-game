type Vector2 = {
  x:number;
  y:number;
}
type PropsType<TComp> = TComp extends React.FC<infer P>
? P
: TComp extends React.Component<infer P>
? P
: never;
