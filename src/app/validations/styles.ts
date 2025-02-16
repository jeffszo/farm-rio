import styled from "styled-components"

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Title = styled.h2`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
  text-align: center;
`

export const Message = styled.p`
  font-size: 1rem;
  color: #4a5568;
  margin: 0;
  text-align: center;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1.5rem;
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

export const TableRow = styled.tr`
  &:hover {
    background-color: #f7fafc;
  }
`

export const TableData = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
`

export const Button = styled.button`
  background-color: #007bff;
  color: #ffffff;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
  }
`

export const Pagination = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-top: 1.5rem;
`

export const PageInfo = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
`

export const PageButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;

  &:hover {
    background-color: #e0e0e0;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(240, 240, 240, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

