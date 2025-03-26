import styled from "styled-components"

export const Container = styled.div`
  max-width: 1400px;
  /* width: 150%; */
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  width: 100%;
  
`

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

`

export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  color: #1a202c;
  text-align: center;


`

export const Message = styled.p`
  font-size: 1rem;
  color: #4a5568;
  text-align: center;
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

export const MobileListItem = styled.li`
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1rem;
  margin-bottom: 1rem;


  @media (max-width: 768px) {
    margin: 2rem 0;
  }
`

export const MobileListItemTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
`

export const TotalCount = styled.p`
  opacity: 0.8;
  font-size: 0.9rem;
`;

export const MobileListItemContent = styled.p`
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
`


export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`


export const ExportButton = styled.button`
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`
