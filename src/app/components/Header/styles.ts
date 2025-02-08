import styled from "styled-components"
import { theme } from './../../styles/theme';

export const HeaderContainer = styled.header`
  background-color: ${theme.colors.bagroundHeader};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border};
`

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Logo = styled.img`

`