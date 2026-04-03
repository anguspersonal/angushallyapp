import { Table } from '@mantine/core';
import type { StravaActivity } from '@/types/common';
import { convertMSToMinKm } from '../strava';

interface RecentRunsTableProps {
  recentRuns: StravaActivity[];
}

export function RecentRunsTable({ recentRuns }: RecentRunsTableProps) {
  return (
    <section className="scrollable-table">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Time</Table.Th>
            <Table.Th>Pace</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {recentRuns.map(activity => (
            <Table.Tr key={activity.id}>
              <Table.Td>{activity.name}</Table.Td>
              <Table.Td>{Math.round(activity.moving_time / (60) * 100) / 100}</Table.Td>
              <Table.Td>{convertMSToMinKm(activity.average_speed)}</Table.Td>
              <Table.Td>{new Date(activity.start_date).toLocaleDateString()}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
} 