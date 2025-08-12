import styled from "styled-components"
import { theme } from '../../styles/theme';

export const HeaderContainer = styled.header`
  background-color: ${theme.colors.backgroundHeader};
  padding: ${theme.spacing[4]} ${theme.spacing[2]};
  border-bottom: 1px solid ${theme.colors.border};
width: 100%;

`

export const HeaderContent = styled.div`
  margin: auto 4rem;
  display: flex;
  justify-content: space-between; /* Alterado para distribuir espaço */
  align-items: center;

  @media (max-width: 768px) {
    margin: auto 2rem;
  }
`


export const Logout = styled.a`
  display: flex;
  color: #fff;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  margin-left: auto; /* Isso pode não ser necessário agora */
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`

