import { Table } from '@mantine/core';
import { StravaPR } from '@/types/common';
import { convertMSToMinKm } from '../strava';

interface PRTableProps {
  prs: StravaPR[];
}

export function PRTable({ prs }: PRTableProps) {
  return (
    <section className="scrollable-table">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Distance</Table.Th>
            <Table.Th>Pace</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {prs.map(pr => (
            <Table.Tr key={pr.name}>
              <Table.Td>{pr.name}</Table.Td>
              <Table.Td>{pr.maxSpeed !== null ? convertMSToMinKm(pr.maxSpeed) : 'No PR yet'}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
} 