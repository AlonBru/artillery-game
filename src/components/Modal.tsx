import { PropsWithChildren, ReactPortal } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const ModalElement = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  padding: 20px;
  z-index: 2;
  background-color: #333;
  border-radius: 10px;
  min-width: 150px;
  min-height: 150px;
  transform-style: preserve-3d;
  animation: appear .2s 1;
  @keyframes appear {
      from{
        transform: rotateY(90deg)
      }
  }
`;
const CloseButton = styled.button`
  position: absolute;
  top:10px;
  right:10px;
  cursor: pointer;
  border:unset;
  ::after,::before{
    content:"";
    display: block;
    position: absolute;
    height: 10px;
    width:2px;
    border-radius: 1px;
    background: #eee;
    rotate: 45deg;
  }
  ::before{
    rotate: -45deg;
  }
`;

type Props ={
  onClickOnClose?():void;
  show:boolean;
} & Pick<PropsWithChildren, 'children'>

export function Modal ( { children, onClickOnClose, show }:Props ):ReactPortal|null {

  return show
    ? createPortal(
      <ModalElement>
        {onClickOnClose && <CloseButton onClick={onClickOnClose}/>}
        {children}
      </ModalElement>,
      document.body
    )
    : null;

}
