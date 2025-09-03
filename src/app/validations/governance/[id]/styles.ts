// src/app/validations/csc/[id]/styles.ts
import styled from "styled-components"

export const ContainerMain = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5rem 0;
`

export const Container = styled.div`
  width: 1200px;
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
  grid-template-columns: 2fr 3fr 2fr;
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

export const SectionTitle = styled.span`
  
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

export const SectionTitleTerms = styled.span`
  font-size: 0.95rem;  
  font-weight: 600;     
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.25rem;

`

export const FormRow = styled.div`
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

export const AddressBlock = styled.div`
  background: #f0f4f8;
  padding: 0.8rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e2e8f0;
  color: #2d3748;

  div {
    font-size: 0.875rem;
    padding: 0.1rem 0;
  }

  strong {
    font-weight: 600;
    color: #2d3748;
  }
`;

export const AddressTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1a202c;
`;


// New styles for editable fields
export const EditableValueContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const EditIcon = styled.span`
  cursor: pointer;
  color: #606060;
  &:hover {
    color: #1a202c;
  }
`;

export const EditInput = styled.input`
  padding: 4px 8px;
  font-size: 14px;
  width: 120px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

export const EditButtonContainer = styled.div`
  display: flex;
  gap: 0.25rem;
`;

export const ActionButton = styled.button<{ color?: string }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ color }) => color || '#4a5568'};

  &:hover {
    color: ${({ color }) => (color === 'red' ? '#e53e3e' : color === 'green' ? '#38a169' : '#1a202c')};
  }
`;

// New style for Photo Gallery
export const PhotoGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem; /* Space between links/images */
  margin-top: 0.5rem;

  a {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    background-color: #e2e8f0;
    color: #2d3748;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.8rem;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: #cbd5e0;
    }
  }

  /* If you decide to display images directly, add styles for img tags */
  img {
    max-width: 100px; /* Example size */
    max-height: 100px;
    border-radius: 4px;
    object-fit: cover;
    border: 1px solid #e2e8f0;
  }
`;



export const ValueWithCopy = styled.span`
  display: flex; // Permite que o número e o ícone fiquem lado a lado
  align-items: center;
  gap: 4px; // Espaçamento entre o número e o ícone
`;

export const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007bff; // Cor do ícone
  padding: 0; // Remova o padding padrão do botão
  margin-left: 5px; // Ajuste o espaçamento se necessário

  &:hover {
    color: #0056b3;
  }
`;

// New styles for terms display from page.tsx and page1.tsx
export const TermsGrid = styled.div`
  display: grid;
  gap: 0.50rem;
  margin-top: 0.75rem;
`;

export const TermsSection = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.85rem;
    color: #6a768c;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

export const InfoText = styled.p`
  /* gap: 0.5rem; */
  font-size: 14px;
  padding-left: 1.25rem;
  opacity: 0.7;

`;

export const AddressContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1.5rem 0;
`;

export const MainSectionTitle = styled.h3`
  font-size: 1rem; /* levemente menor que Customer Details */
  font-weight: 600;   /* negrito forte */
  color: #2d3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`