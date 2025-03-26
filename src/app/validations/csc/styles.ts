import styled from "styled-components"

export const Container = styled.div`
  /* max-width: 1200px;
  margin: 0 auto;
  padding: 20px; */
`

export const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
`

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
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
