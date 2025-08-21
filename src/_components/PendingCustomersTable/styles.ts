import styled from "styled-components"

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
`

export const TitleWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
`

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1f2937;
`

export const Title = styled.h2`
  text-align: center;
  font-weight: 700;
  margin: 0;
  color: #111827;
`

export const ButtonAndTotalClientsWrapper = styled.div<{ $hasExcelButton: boolean }>`
  grid-column: 6;         /* ocupa a coluna do ACTION */
  justify-self: start;    /* alinha à ESQUERDA dessa coluna */
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;     /* mesmo padding dos TH/TD (20px) para "bater" com o texto */

  /* Enhanced responsive positioning and alignment */
  @media (max-width: 1400px) {
    grid-column: 2;
    justify-self: end;
    padding-left: 0;
    gap: 8px;
  }

  /* Keep on same line at 1200px by staying in column 2 */
  @media (max-width: 1200px) {
    grid-column: 2;
    justify-self: end;
    padding-left: 0;
    gap: 8px;
  }

  @media (max-width: 992px) {
    justify-self: center;
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    justify-self: end;    /* no mobile, fica à direita */
    padding-left: 0;
  }
`

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
`

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
`

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
`

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
`

export const TableFilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(150px, 1fr)); /* espelha a tabela */
  column-gap: 0;     /* sem gap lateral, como a tabela */
  row-gap: 12px;
  margin-bottom: 24px;
  padding: 20px;     /* mesmo "respiro" que TH/TD usam (20px) */
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
  align-items: center; /* Ensure all grid items are aligned to center vertically */

  /* Enhanced responsive breakpoints for better tablet and medium screen support */
  @media (max-width: 1400px) {
    grid-template-columns: 1fr auto; /* Two columns: filters take remaining space, controls fixed width */
    gap: 16px;
    padding: 16px;
  }

  /* Keep elements on same line at 1200px breakpoint */
  @media (max-width: 1200px) {
    grid-template-columns: 1fr auto; /* Keep two columns: filters on left, controls on right */
    gap: 12px;
    padding: 16px;
    align-items: center;
  }

  @media (max-width: 768px) {
    display: none; /* Hide on mobile, use MobileFiltersContainer instead */
  }
`

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  height: 30px; /* Set consistent height for all filter groups */

  /* Enhanced responsive gap adjustments */
  @media (max-width: 1400px) {
    gap: 10px;
  }

  @media (max-width: 1201px) {
    gap: 8px;
  }

  @media (max-width: 992px) {
    gap: 6px;
  }
`

export const FilterTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`

export const TableFilterSelect = styled.select`
  padding: 0 12px; /* Remove auto padding, use consistent horizontal padding */
  height: 30px;
  font-size: 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: #ffffff;
  min-width: 200px;
  max-width: 100%;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center; /* Ensure consistent vertical alignment */

  &:focus {
    outline: none;
    border-color: #9ca3af;
    box-shadow: 0 0 0 2px rgba(156, 163, 175, 0.1);
  }

  &:hover {
    border-color: #d1d5db;
  }

  /* Enhanced responsive width adjustments with more breakpoints */
  @media (max-width: 1600px) {
    min-width: 180px;
  }

  @media (max-width: 1499px) {
    min-width: 150px;
    width: 150px;
  }

  @media (max-width: 1414px) {
    min-width: 130px;
    width: 130px;
  }

  @media (max-width: 1276px) {
    min-width: 110px;
    width: 110px;
  }

  @media (max-width: 1200px) {
    min-width: 100px;
    width: 100px;
  }

  @media (max-width: 992px) {
    min-width: 90px;
    width: 90px;
    font-size: 0.75rem;
  }
`

export const TableRow = styled.tr`
  transition: all 0.2s ease-in-out;
  border-bottom: 1px solid #f9fafb;

  &:hover {
    background-color: #fafafa;
  }

  &:last-child {
    border-bottom: none;
  }
`

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
`

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
        `
      case "approved by the wholesale team":
      case "approved by the credit team":
      case "approved by the tax team":
      case "approved by the csc final team":
      case "finished":
        return `
          color: #374151;
          background-color: #f3f4f6;
          border-color: #d1d5db;
        `
      default:
        return `
          color: #6b7280;
          background-color: #f9fafb;
          border-color: #e5e7eb;
        `
    }
  }}
`

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

  /* Enhanced responsive button sizing with more breakpoints */
  @media (max-width: 1400px) {
    padding: 8px 14px;
  }

  @media (max-width: 1276px) {
    padding: 8px 12px;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  @media (max-width: 992px) {
    padding: 6px 10px;
    font-size: 0.7rem;
  }
`

export const EmptyTableRow = styled.tr`
  border-bottom: none;
`

export const EmptyTableData = styled.td`
  padding: 32px;
`

export const EmptyStateMessage = styled.p`
  text-align: center;
  color: #6b7280;
  font-style: italic;
  font-size: 1rem;
  margin: 0;
`

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
`

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
`

export const PageInfo = styled.span`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
  padding: 0 16px;
`

export const TotalClientsInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px; /* Use consistent horizontal padding like other elements */
  height: 30px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;

  /* Enhanced responsive adjustments for total clients info */
  @media (max-width: 1400px) {
    padding: 0 10px;
  }

  @media (max-width: 1276px) {
    padding: 0 8px;
    font-size: 0.75rem;
  }

  @media (max-width: 992px) {
    padding: 0 6px;
    font-size: 0.7rem;
  }
`

export const TableSearchInput = styled.input`
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  background-color: transparent;
  height: 100%;       /* ocupa toda a altura do wrapper */
  line-height: 30px;  /* centraliza verticalmente o texto */

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
  padding: 0 12px; /* Use consistent horizontal padding */
  background-color: #ffffff;
  height: 30px;
  flex: 0 0 250px;

  svg {
    color: #6b7280;
  }

  /* More granular responsive breakpoints for search input */
  @media (max-width: 1600px) {
    flex: 0 0 220px;
  }

  @media (max-width: 1499px) {
    flex: 0 0 180px;
    padding: 0 10px;
  }

  @media (max-width: 1400px) {
    flex: 0 0 160px;
  }

  @media (max-width: 1276px) {
    flex: 0 0 140px;
    padding: 0 8px;
  }

  @media (max-width: 1200px) {
    flex: 0 0 120px;
    padding: 0 6px;
  }

  @media (max-width: 992px) {
    flex: 1 1 auto;
    min-width: 100px;
    max-width: 150px;
  }
`

export const TopControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  width: 100%;
`

export const TableAndControlsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const FiltersRow = styled.div`
  grid-column: 1 / span 5;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
  height: 30px; /* Ensure consistent height alignment */

  /* Improved responsive behavior for filters row */
  @media (max-width: 1400px) {
    grid-column: 1;
    gap: 16px;
    flex-wrap: wrap;
    min-height: 30px;
    height: auto;
  }

  /* Keep in column 1 at 1200px to maintain horizontal layout */
  @media (max-width: 1200px) {
    grid-column: 1;
    gap: 10px;
    justify-content: flex-start;
    flex-wrap: nowrap; /* Prevent wrapping to keep on same line */
  }

  @media (max-width: 992px) {
    gap: 8px;
    flex-wrap: wrap; /* Allow wrapping only at smaller screens */
  }
`

export const MobileFiltersContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
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
      height: 30px;
    }
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
