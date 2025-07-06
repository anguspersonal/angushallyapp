// @ts-nocheck
import React from "react";
import { Table } from "@mantine/core";

function HabitLogTable({ habitLogs }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Habit</th>
          <th>Date Logged</th>
        </tr>
      </thead>
      <tbody>
        {habitLogs.map((log) => (
          <tr key={log.id}>
            <td>{log.id}</td>
            <td>{new Date(log.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default HabitLogTable;
