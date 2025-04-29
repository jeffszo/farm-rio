import styled from "styled-components"

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
`

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`

export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a202c;
  margin-left: 0.5rem;
`

export const ExportButton = styled.button`
  background-color: #6e6e6e;
  color: white;
  font-size: 0.9rem;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  right: 0;

  &:hover {
    background-color: #555555;
  }
`

export const TotalCount = styled.p`
  opacity: 0.8;
  font-size: 0.9rem;
  margin-top: 1rem;
  text-align: center;
`

export const Message = styled.p`
  font-size: 1rem;
  color: #4a5568;
  text-align: center;
  margin: 2rem 0;
`

export const Table = styled.table`
  width: 150%;
  max-width: 1400px;
  margin: 1.5rem auto;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`

export const TableHeader = styled.th`
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  &:first-child {
    border-top-left-radius: 0.5rem;
  }
  &:last-child {
    border-top-right-radius: 0.5rem;
  }
`

export const TableHeaderFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`

export const TableFilterSelect = styled.select`
  padding: 0.3rem 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background-color: white;
  font-size: 0.85rem;
  color: #4a5568;
  outline: none;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-left: 0.5rem;
  
  &:hover {
    border-color: #cbd5e0;
  }
  
  &:focus {
    border-color: #333333;
    box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
  }
`

export const TableRow = styled.tr`
  &:hover {
    background-color: #f7fafc;
  }
`

export const EmptyTableRow = styled.tr`
  height: 150px;
`

export const TableData = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
`

export const EmptyTableData = styled.td`
  padding: 2rem;
  text-align: center;
  color: #718096;
`

export const EmptyStateMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #718096;
  font-size: 1rem;
`

export const EmptyMobileState = styled.div`
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin: 1rem 0;
  width: 100%;
`

export const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.status) {
      case "pending":
        return "#f7fafc" // Amarelo claro
      case "approved by the wholesale team":
        return "#f7fafc" // Azul claro
      case "rejected by wholesale team":
        return "#f7fafc" // Vermelho claro
      case "approved by the credit team":
        return "#f7fafc" // Verde água claro
      case "rejected by credit team":
        return "#f7fafc" // Vermelho claro
      case "approved by the CSC team":
        return "#f7fafc" // Verde claro
      default:
        return "#f7fafc" // Cinza claro padrão
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "pending":
        return "#4a5568" // Amarelo escuro
      case "approved by the wholesale team":
        return "#4a5568" // Azul
      case "rejected by wholesale team":
        return "#4a5568" // Vermelho
      case "approved by the credit team":
        return "#4a5568" // Verde água escuro
      case "rejected by credit team":
        return "#4a5568" // Vermelho
      case "approved by the CSC team":
        return "#4a5568" // Verde
      default:
        return "#4a5568" // Cinza escuro padrão
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.status) {
      case "pending":
        return "#e2e8f0" // Amarelo médio
      case "approved by the wholesale team":
        return "#e2e8f0" // Azul médio
      case "rejected by wholesale team":
        return "#e2e8f0" // Vermelho médio
      case "approved by the credit team":
        return "#e2e8f0" // Verde água médio
      case "rejected by credit team":
        return "#e2e8f0" // Vermelho médio
      case "approved by the CSC team":
        return "#e2e8f0" // Verde médio
      default:
        return "#e2e8f0" // Cinza padrão
    }
  }};
`

export const Button = styled.button`
  background-color: #333333;
  color: #ffffff;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:focus {
    outline: none;
  }
`

export const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  gap: 2rem;
`

export const PageInfo = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
`

export const PageButton = styled(Button)`
  background-color: #18181b;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    opacity: 0.9;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(240, 240, 240, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const MobileList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
`

export const MobileFilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`

export const FilterLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const MobileListItem = styled.li`
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    margin: 1rem 0;
  }
`

export const MobileListItemTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
`

export const MobileListItemContent = styled.p`
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`
