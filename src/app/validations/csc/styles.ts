import styled from "styled-components"

// Previous styles remain the same, adding new select and input styles:

export const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  color: #4a5568;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1a202c;
    box-shadow: 0 0 0 2px rgba(26, 32, 44, 0.1);
  }

  &:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }
`

export const NumericInput = styled.input.attrs({ type: "number" })`
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  color: #4a5568;

  &:focus {
    outline: none;
    border-color: #1a202c;
    box-shadow: 0 0 0 2px rgba(26, 32, 44, 0.1);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`

export const TermsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`

export const TermsSection = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
`

// Add this new style for the divider
export const Divider = styled.span`
  color: #6b7280;
  font-size: 1.5rem;
  font-weight: 300;
  margin: 0 0.5rem;
`

export const Title = styled.h2``;
export const Message = styled.p``;
export const TitleWrapper = styled.h2``;