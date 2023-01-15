import styled from 'styled-components';

export const BoardColumn = styled.div`
  display: grid;
  grid-template-rows: repeat(8,1fr);
  grid-row-gap: 2px;
  width: 100%;
  height: 100%;
`;
