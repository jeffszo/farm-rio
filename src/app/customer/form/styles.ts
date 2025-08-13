import styled from "styled-components"

export const ContainerMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 85vh; /* Altera de 'height' para 'min-height' */
  margin: 3rem 0; /* Adiciona margem para evitar que o conteúdo toque nas bordas da tela */
  
  @media (max-width: 768px) {
    /* No mobile, já está 100%, mas adicionamos um flex-direction para organização */
    flex-direction: column;
    align-items: center;
    min-height: 100%;
  }
`;

export const FormContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "stepOne"
})<{ stepOne?: boolean }>`
  width: ${({ stepOne }) => (stepOne ? "95%" : "100%")};
  max-width: ${({ stepOne }) => (stepOne ? "1395px" : "1200px")};
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  margin-top: 2rem;

  @media (max-width: 768px) {
    height: 100%;
  }
`;


export const FormHeader = styled.div`
  margin-bottom: 2rem;
`

export const FormTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #18181b;
  margin-bottom: 0.5rem;
`

export const FormSubtitle = styled.p`
  font-size: 0.875rem;
  color: #71717a;

  div{
    font-size: 1rem;
  }
  
`

export const Section = styled.section`

`

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 1rem;
`

export const SectionTitleBuyer = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #18181b;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`

export const InputGroup = styled.div`
  gap: 1rem;
  margin-bottom: 1rem;
  
`

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #18181b;
  margin-bottom: 0.5rem;
`

export const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== "error",
})<{ error?: boolean }>`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid ${(props) => (props.error ? "red" : "#ccc")};
  border-radius: 0.25rem;
  background-color: #ffffff;
  color: #18181b;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    ring: 2px;
    ring-offset: 2px;
    ring-color: #18181b;
  }

  &:disabled {
    background-color: #f4f4f5;
    color: #a1a1aa;
  }
`

export const ErrorMessage = styled.span`
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`

export const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;

  ${(props) =>
    props.variant === "primary"
      ? `
          background-color: #18181b;
          color: #ffffff;
          &:hover {
            background-color: #27272a;
          }
          &:active {
            transform: translateY(1px);
          }
        `
      : `
          background-color: #71717a;
          color: #fff;
          border: 1px solid #71717a;
          &:hover {
            opacity: 0.9
          }
          &:active {
            transform: translateY(1px);
          }
        `}

  &:focus {
    outline: none;
    ring: 2px;
    ring-offset: 2px;
    ring-color: #18181b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`

export const ProgressBar = styled.div`
  width: 100%;
  height: 0.25rem;
  background-color: #e4e4e7;
  border-radius: 0.125rem;
  margin-bottom: 2rem;
  overflow: hidden;
`

export const ProgressFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background-color: #18181b;
  transition: width 0.3s ease;
`

export const FileInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const HiddenInput = styled.input`
    opacity: 0;
    position: absolute;
    width: 0.1px;
    height: 0.1px;
    z-index: -1;
`

export const UploadButton = styled.label`
display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid  #ccc;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #666;

`

export const FileNameText = styled.p`
  font-size: 14px;
  color: #333;
  margin-top: 4px;
`

export const FilePreviewContainer = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`

export const FilePreview = styled.span`
  background-color: #f0f0f0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #555;
  display: inline-flex;
  align-items: center;
`


export const ReviewContainer = styled.div`

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 700px;
  text-align: center;

  @media (max-width: 868px) {
    width: 90%;
  }
`

export const ReviewHeader = styled.div`
  margin-bottom: 2rem;
`

export const ReviewTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #18181b;
  margin-bottom: 0.5rem;
`

export const ReviewSubtitle = styled.div`

  font-size: 0.875rem;
  color: #71717a;
  line-height: 1.4;

  div {
    /* display: flex;
    justify-content: center;
    align-items: center; */
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
  }
`

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

export const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
`

export const ModalMessage = styled.p`
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 24px;
  text-align: center;
`

export const ModalButton = styled.button`
  background-color: #18181b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  
`

export const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const AddAddressButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: transparent;
  color: #18181b;
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
  }
`

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const CompactSection = styled.div`
  overflow: auto;
  max-width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 600px;
  overflow-y: auto;
`

export const AddressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 6px;
`

export const AddressTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  padding: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #fee2e2;
  }
`

export const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`

export const FieldRowAddress = styled.div`
  grid-template-columns: 3fr 2fr;
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

export const InputGroupField = styled(InputGroup)`
  flex: 1;
`

export const LabelField = styled(Label)`
  font-size: 0.85rem;
`

export const InputField = styled(Input)`
  padding: 0.5rem;
  font-size: 0.85rem;
`

export const ErrorMessageField = styled(ErrorMessage)`
  font-size: 0.75rem;
`

export const FixButton = styled.button`
  background-color: #3182ce;
  color: white;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;
  width: 100%;

  &:hover {
    background-color: #2b6cb0;
  }
`

// Novos componentes estilizados para a página de status
export const StatusCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
`

export const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`

export const StatusTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`

export const StatusContent = styled.div`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  color: #444;
`


export const EditButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #18181b;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 1rem  auto;
  
  &:hover {
    background-color: #27272a;
  }
`

export const StatusContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`


export const FeedbackCard = styled.div`
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  margin-top: 1rem;
`

export const FeedbackTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
`

export const FeedbackContent = styled.p`
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
`

// Novo estilo para agrupar o código do país e o número de telefone
export const PhoneInputGroup = styled.div`
  display: flex;
  gap: 1rem; /* Espaçamento entre o código do país e o número */
  width: 100%;

  ${InputGroup} { /* Aplica estilos do InputGroup aos elementos internos */
    flex: 1; /* Distribui o espaço igualmente */
  }

  ${InputGroup}:first-child {
    flex: 1; /* Ajusta o tamanho do campo de código do país */
    max-width: 100px; /* Limita a largura do campo de código do país */
  }

  ${InputGroup}:last-child {
    flex: 1.6; /* Ocupa o restante do espaço */
  }

  @media (max-width: 600px) {
    flex-direction: column; /* Empilha em telas menores */
    ${InputGroup}:first-child, ${InputGroup}:last-child {
      flex: none; /* Remove o flex em telas menores */
      max-width: 100%; /* Ocupa a largura total */
    }
  }
`

export const InfoButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666; /* Adjust color as needed */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 24px; /* Adjust size as needed */
  height: 24px; /* Adjust size as needed */
  border-radius: 50%; /* Makes it circular */
  /* transition: all 0.2s ease-in-out; */
  position: relative; /* Needed for tooltip positioning */

  &:hover {
    color: #007bff; /* Example hover color */
    background-color: #f0f0f0; /* Light background on hover */
  }

  /* Tooltip styles */
  &[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%; /* Position above the button */
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.8em;
    margin-bottom: 8px; /* Space between button and tooltip */
    z-index: 10; /* Ensure it's above other elements */
    pointer-events: none; /* Allows clicks on elements behind the tooltip */
  }
`;

export const AlertMessage = styled.p`
  background-color: rgb(240, 240, 240);
  color:rgb(19, 19, 19); 
  border: 1px solid transparent; /* Slightly darker yellow border */
  border-radius: 0.25rem;
  padding: 1rem 1.5rem;
  margin-top: 1.5rem; /* Space above the alert */
  font-size: 1.15rem; /* Larger font size */
  font-weight: 600; /* Bold text */
  text-align: center;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.8rem 1rem;
  }
`;