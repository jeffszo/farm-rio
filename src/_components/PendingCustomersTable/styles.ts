import styled from "styled-components";

export const Container = styled.div`
  margin: auto;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  background-color: #fefefe;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
`;

export const TitleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1f2937;
`;

export const Title = styled.h2`
  text-align: center;
  font-weight: 700;
  margin: 0;
  color: #111827;
`;

export const ButtonAndTotalClientsWrapper = styled.div<{ $hasExcelButton: boolean }>`
  grid-column: 6;         /* ocupa a coluna do ACTION */
  justify-self: start;    /* alinha à ESQUERDA dessa coluna */
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;     /* mesmo padding dos TH/TD (20px) para “bater” com o texto */

  @media (max-width: 1200px) {
    grid-column: 1 / -1;
    justify-self: end;    /* no mobile, fica à direita */
    padding-left: 0;
  }
`;



export const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #374151;
  border: 2px solid #374151;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
`;

export const TableScrollContainer = styled.div`
  width: 100%;
  max-height: 500px;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #f0f0f0;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;

    &:hover {
      background: #9ca3af;
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  table-layout: fixed;
`;

export const TableHeader = styled.th`
  padding: 16px 20px;
  background-color: #fafafa;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  position: relative;
  min-width: 150px;
  width: 100%;
  white-space: nowrap;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 20%;
    height: 60%;
    width: 1px;
    background-color: #e5e7eb;
  }
`;

export const TableFilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(150px, 1fr)); /* espelha a tabela */
  column-gap: 0;     /* sem gap lateral, como a tabela */
  row-gap: 12px;
  margin-bottom: 24px;
  padding: 20px;     /* mesmo “respiro” que TH/TD usam (20px) */
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr; /* empilha no responsivo */
  }
`;


export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FilterTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

export const TableFilterSelect = styled.select`
  padding: 4px 12px;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #ffffff;
  min-width: 200px;
  max-width: 100%;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
    border-color: #9ca3af;
    box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.1);
  }

  &:hover {
    border-color: #d1d5db;
  }

    @media (max-width: 1499px) {
      max-width: auto;
      width: 130px;
  }

      @media (max-width: 1414px) {
      max-width: auto;
      width: 130px;
  }

`;

export const TableRow = styled.tr`
  transition: all 0.2s ease-in-out;
  border-bottom: 1px solid #f9fafb;

  &:hover {
    background-color: #fafafa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableData = styled.td`
  padding: 18px 20px;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  text-align: left;
  position: relative;
  min-width: 150px;
  word-wrap: break-word;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 1px;
    background-color: #f3f4f6;
  }
`;

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid transparent;

  ${({ status }) => {
    switch (status) {
      case "pending":
      case "review requested by the tax team - customer":
      case "review requested by the wholesale team - customer":
      case "review requested by the credit team - customer":
      case "review requested by the csc initial team - customer":
      case "review requested by the csc final team - customer":
      case "review requested by the wholesale team":
      case "review requested by the tax team":
      case "review requested by the credit team":
      case "review requested by the csc initial team":
        return `
          color: #4b5563;
          background-color: #f3f4f6;
          border-color: #d1d5db;
        `;
      case "approved by the wholesale team":
      case "approved by the credit team":
      case "approved by the tax team":
      case "approved by the csc final team":
      case "finished":
        return `
          color: #374151;
          background-color: #f3f4f6;
          border-color: #d1d5db;
        `;
      default:
        return `
          color: #6b7280;
          background-color: #f9fafb;
          border-color: #e5e7eb;
        `;
    }
  }}
`;

export const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background-color: #1a202c;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #1a202c;
    border-color: #d1d5db;
  }

  &:active:not(:disabled) {
    background-color: #1a202c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const EmptyTableRow = styled.tr`
  border-bottom: none;
`;

export const EmptyTableData = styled.td`
  padding: 32px;
`;

export const EmptyStateMessage = styled.p`
  text-align: center;
  color: #6b7280;
  font-style: italic;
  font-size: 1rem;
  margin: 0;
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 32px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  flex-wrap: wrap;
`;

export const PageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  &:active:not(:disabled) {
    background-color: #f3f4f6;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PageInfo = styled.span`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
  padding: 0 16px;
`;

export const TotalClientsInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
`;

export const TableSearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  
  background-color: transparent;

  &::placeholder {
    color: #9ca3af;
  }

 


`

export const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 4px 12px;
  background-color: #ffffff;
  height: 32px;         /* mesma altura dos selects */
  box-sizing: border-box;
  flex: 0 0 250px;      /* largura fixa controlada */
  
  svg {
    color: #6b7280;
  }

  
`

export const TopControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;
`;





export const TableAndControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const FiltersRow = styled.div`
  grid-column: 1 / span 5;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
`

export const MobileFiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  select, input {
    width: 100%;
  }
`

export const MobileTotalClients = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`
