import styled from "styled-components";


export const ContainerMain = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; 
  margin-top: 9rem;
` 

export const FormContainer = styled.div`

  width: 85%; /* Ou um valor fixo como 800px */
  max-width: 1200px;
  padding: 1.5rem;
  margin-bottom: 12rem;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

  @media (max-width: 868px) {
    margin-top: 12rem;
  }


`;

export const FormHeader = styled.div`
  margin-bottom: 2rem;
`;

export const FormTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #18181b;
  margin-bottom: 0.5rem;
`;

export const FormSubtitle = styled.p`
  font-size: 0.875rem;
  color: #71717a;

  div{
    font-size: 1rem;
  }
  
`;

export const Section = styled.section`
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #18181b;
  margin-bottom: 1rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

export const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #18181b;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid ${(props) => (props.$error ? "red" : "#ccc")};
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
`;

export const ErrorMessage = styled.span`
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

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
          background-color: #rgba(240, 240, 240, 0.5);
          color: #18181b;
          border: 1px solid #d4d4d8;
          &:hover {
            background-color: #f4f4f5;
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
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 0.25rem;
  background-color: #e4e4e7;
  border-radius: 0.125rem;
  margin-bottom: 2rem;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background-color: #18181b;
  transition: width 0.3s ease;
`;
