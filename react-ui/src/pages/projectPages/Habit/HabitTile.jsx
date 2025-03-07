import React from "react";
import { Card, Text, Progress, Button, Group } from "@mantine/core";
import { IconCircleDashedCheck } from "@tabler/icons-react";

function HabitTile({ habit, onClick, onLog }) { // ✅ Accept `onLog` as a prop
  return (
    <Group
      spacing="xs"
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{ width: "100%", background: "white", borderRadius: 10, cursor: "pointer" }}
      onClick={onClick} // ✅ Clicking the tile opens the modal
    >
      <Card style={{ flex: 1, background: "transparent" }}>
        <Text size="lg">
          {habit.icon} {habit.name}
        </Text>
        <Progress value={habit.progress} size="sm" mt="sm" />
      </Card>

      {/* ✅ Log Button calls `onLog`, stopping propagation to prevent modal opening */}
      <IconCircleDashedCheck 
        onClick={(event) => {
          event.stopPropagation(); // ✅ Prevents modal from opening
          onLog(habit); // ✅ Calls `onLog` from `Habit.jsx`
        }}
        size={24} stroke={2} 
        color={"var(--success-color)"} 
        style={{ cursor: "pointer", marginRight: 10 }} />

    </Group>
  );
}

export default HabitTile;
