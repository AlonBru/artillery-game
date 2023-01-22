import { theme } from '../helpers/theme';

type Theme = typeof theme;


declare module 'styled-components' {
  export interface DefaultTheme extends Theme{
  }
}