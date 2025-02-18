import styled from "styled-components";

export const SkeletonContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  display: 'flex';
  justify-content: 'center';
  margin: 11.7rem auto;
  border-radius: 0.5rem;
  background-color: #f7fafc;
`;

export const SkeletonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 4rem;
  background-color: #e2e8f0;
  border-radius: 0.5rem 0.5rem 0 0;
`;

export const SkeletonRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 4rem;
  border-bottom: 1px solid #e2e8f0;
`;

export const SkeletonCell = styled.div`
  width: 20%;
  height: 16px;
  background-color: #cbd5e0;
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;
