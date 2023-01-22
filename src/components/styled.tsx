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
`;
