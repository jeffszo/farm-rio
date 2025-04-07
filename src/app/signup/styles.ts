import { theme } from '../../styles/theme';
import Link from 'next/link';
import styled from 'styled-components';

export const Container = styled.div`
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[6]};
  background-color: ${theme.colors.background};
`;

export const FormContainer = styled.div`
  background-color: ${theme.colors.card};
  padding: ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

export const FormTitle = styled.h1`
  color: ${theme.colors.foreground};
  font-size: ${theme.fontSizes.xl};
  font-weight: 600;
  text-align: center;
  margin-bottom: ${theme.spacing[4]};
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

export const Label = styled.label`
  font-size: ${theme.fontSizes.sm};
  font-weight: 500;
  color: ${theme.colors.foreground};
`;

export const Input = styled.input`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.input};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.foreground};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}40;
  }
`;

export const Select = styled.select`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.input};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  color: ${theme.colors.foreground};
  background-color: ${theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}40;
  }
`;

export const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.primaryForeground};
  border: none;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSizes.base};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.cardForeground};
  }

  &:disabled {
    background-color: ${theme.colors.muted};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: ${theme.colors.destructive};
  font-size: ${theme.fontSizes.sm};
  margin-top: ${theme.spacing[1]};
`;

export const LoginLink = styled(Link)`
  color: ${theme.colors.primary};
  text-decoration: none;
  text-align: center;
  font-size: ${theme.fontSizes.sm};
  margin-top: ${theme.spacing[4]};
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

// Corrigido o posicionamento do ModalOverlay
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

export const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  margin-bottom: 20px;
`;

export const ModalMessage = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

export const ModalButton = styled.button`
  background-color: #18181b;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  
`;

