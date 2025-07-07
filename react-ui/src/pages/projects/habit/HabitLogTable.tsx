import React from "react";
import { Table } from "@mantine/core";
import { HabitLog } from "../../../types/common";

interface HabitLogTableProps {
  habitLogs: HabitLog[];
}

const HabitLogTable: React.FC<HabitLogTableProps> = ({ habitLogs }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Habit</th>
          <th>Date Logged</th>
        </tr>
      </thead>
      <tbody>
        {habitLogs.map((log: HabitLog) => (
          <tr key={log.id}>
            <td>{log.habit_type}</td>
            <td>{new Date(log.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default HabitLogTable;
