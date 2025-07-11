'use client';

import React from "react";
import { Card, Text, Progress, Group } from "@mantine/core";
import { IconCircleDashedCheck } from "@tabler/icons-react";
import { HabitType } from "../../../../types/common";

interface HabitDefinition {
  id: number;
  name: HabitType;
  displayName: string;
  icon: string;
  progress: number;
}

interface HabitTileProps {
  habit: HabitDefinition;
  onClick: () => void;
  onLog: (habit: HabitDefinition) => void;
}

const HabitTile: React.FC<HabitTileProps> = ({ habit, onClick, onLog }) => {
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{ width: "100%", background: "white", borderRadius: 10, cursor: "pointer" }}
      onClick={onClick} // Clicking the tile opens the modal
    >
      <Group gap="xs">
        <div style={{ flex: 1 }}>
          <Text size="lg">
            {habit.icon} {habit.displayName}
          </Text>
          <Progress value={habit.progress} size="sm" mt="sm" />
        </div>

        {/* Log Button calls `onLog`, stopping propagation to prevent modal opening */}
        <IconCircleDashedCheck 
          onClick={(event) => {
            event.stopPropagation(); // Prevents modal from opening
            onLog(habit); // Calls `onLog` from `Habit.jsx`
          }}
          size={24} stroke={2} 
          color={"var(--mantine-color-green-6)"} 
          style={{ cursor: "pointer", marginRight: 10 }} />
      </Group>
    </Card>
  );
}

export default HabitTile; 