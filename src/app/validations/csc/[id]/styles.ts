import styled from "styled-components"

export const ContainerMain = styled.div`
  display: flex;
  justify-content: center; 
  align-items: center; 
  height: 120vh;

`

export const Container = styled.div`
  max-width: 1000px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    max-width: 90%;
  }
  
  `

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
  }
  
`

export const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
`

export const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${({ status }) =>
    status === "approved" ? "#C6F6D5" : status === "rejected" ? "#FED7D7" : "#EDF2F7"};
  color: ${({ status }) => (status === "approved" ? "#22543D" : status === "rejected" ? "#822727" : "#4A5568")};
`

export const FormDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`

export const FormSection = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`

export const SectionTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

export const FormRow = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  padding: 0.25rem 0;

  strong {
    font-weight: 600;
    color: #2d3748;
  }
`

export const TermsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`

export const TermsTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

export const CheckboxWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4a5568;
  gap: 0.25rem;
`

export const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 16px;
  height: 16px;
  cursor: pointer;
`

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`

export const Button = styled.button<{ variant: "primary" | "secondary" }>`
  background-color: ${({ variant }) => (variant === "primary" ? "#1a202c" : "#ffffff")};
  color: ${({ variant }) => (variant === "primary" ? "#ffffff" : "#1a202c")};
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 1px solid #1a202c;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ variant }) => (variant === "primary" ? "#2d3748" : "#f7fafc")};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(26, 32, 44, 0.5);
  }
`

export const Message = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  text-align: center;
  margin-top: 0.75rem;
`

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

export const ModalContent = styled.div`
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
`

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`

export const ModalDescription = styled.p`
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 1.5rem;
`

export const ModalButton = styled.button`
    background-color: #18181b;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
`

export const TermsCardsContainer = styled.div`
  display: flex;
  gap: 5rem;
  flex-wrap: wrap;
  margin-top: 2rem;
`

export const TermsCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    max-width: 90%;
  }

  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  p {
    font-size: 0.875rem;
    color: #4a5568;
    padding: 0.25rem 0;
  }
`
export const FeedbackGroup = styled.div`
  margin-top: 2rem;
`;

export const Textarea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #cbd5e0;
  resize: vertical;
`;

export const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
`;
