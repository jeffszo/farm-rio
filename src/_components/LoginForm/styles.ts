import styled from "styled-components"
import { theme } from '../../styles/theme';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`

export const Label = styled.label`
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.foreground};
`

export const Input = styled.input`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.input};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.foreground};
  background-color: ${theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${theme.colors.ring};
    box-shadow: 0 0 0 1px ${theme.colors.ring};
  }
`

export const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.primaryForeground};
  border: none;
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${theme.colors.ring};
  }

  &:disabled {
    background-color: ${theme.colors.muted};
    color: ${theme.colors.mutedForeground};
    cursor: not-allowed;
  }
`

export const ErrorMessage = styled.p`
  color: ${theme.colors.destructive};
  margin-top: ${theme.spacing[1]};
  font-size: ${theme.fontSizes.sm};
`


export const ForgotPassword = styled.a`
  font-size: 14px;
  color: #586b7fff; 
  text-decoration: none; 
  margin-top: 0.25px;
  cursor: pointer;

  &:hover {
      opacity: 0.8;
  }
`;