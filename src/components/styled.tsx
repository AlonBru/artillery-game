import styled from 'styled-components';

export const BoardColumn = styled.div`
  display: grid;
  grid-template-rows: repeat(8,1fr);
  grid-row-gap: 2px;
  width: 100%;
  height: 100%;
`;
export const GreenScreenDisplay = styled.div`
  @font-face {
    font-family: greenScreen;
    src: url(Greenscr.ttf);
  }
  background: #003800;
  color: #3bc880;
  font-family: greenScreen;
  border-radius: 10px;
  border: 5px inset #666;
  white-space: pre-wrap;
  text-transform: uppercase;
  text-shadow: #3bc880c7 0px 0 5px;
  font-weight: bold;
  box-shadow: #0be10b6e 0 0 20px inset;
  position: relative;
  
  ::after{
    content: "";
    --maskSize: 8px;
    position: absolute;
    left: 0;
    top:0;
    width: 100%;
    height: 100%;
    background: #0004;
    mask-image: linear-gradient( transparent 50%, black 100% );
    mask-size: 10px var(--maskSize);

    animation-name: scanlines;
    animation-duration: 1.8s;
    animation-direction: reverse;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  @keyframes scanlines{
    from{
      mask-position-y: 0;
    }
    to{
      mask-position-y: var(--maskSize);
    }
  }
`;
