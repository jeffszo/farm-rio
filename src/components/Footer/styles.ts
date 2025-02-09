import styled from "styled-components"
import { theme } from './../../styles/theme';

export const FooterContainer = styled.footer`
  background-color: ${theme.colors.muted};
  color: ${theme.colors.mutedForeground};
  padding: ${theme.spacing[4]};
  text-align: center;
  font-size: ${theme.fontSizes.sm};
  position:fixed;
  bottom:0;
  width:100%;
`
