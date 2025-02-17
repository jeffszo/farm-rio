import styled from "styled-components";

export const Container = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1.5rem;
`;

export const FormDetails = styled.div`
  width: 100%;
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

export const FormRow = styled.p`
  font-size: 1rem;
  color: #4a5568;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const TermsContainer = styled.div`
  width: 100%;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f1f5f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const TermsTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #4a5568;
  gap: 0.5rem;
`;

export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 1.5rem;
`;

export const ApproveButton = styled.button`
  background-color: #38a169;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2f855a;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.5);
  }
`;

export const RejectButton = styled.button`
  background-color: #e53e3e;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c53030;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.5);
  }
`;

export const Button = styled.button`
  background-color: #333333;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover {
    background-color: #1a1a1a;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.5);
  }
`;

export const Message = styled.p`
  font-size: 1rem;
  color: #e53e3e;
  text-align: center;
  margin-top: 1rem;
`;
