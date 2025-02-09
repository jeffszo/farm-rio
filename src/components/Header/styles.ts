import styled from "styled-components"
import { theme } from './../../styles/theme';

export const HeaderContainer = styled.header`
  background-color: ${theme.colors.backgroundHeader};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border};
`

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: auto 4rem;
  display: flex;
  align-items: center;

`
