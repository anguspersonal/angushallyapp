import React from "react";
import { Group, Title, ActionIcon } from "@mantine/core";
import { IconPlus, IconSettings, IconHome } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface HabitHeaderProps {
  onButtonClick: (action: string) => void;
}

const HabitHeader: React.FC<HabitHeaderProps> = ({ onButtonClick }) => {

  return (
    <Group justify="space-between" px="md" py="sm" style={{ borderBottom: "1px solid #ddd" }}>
      {/* Home Button (Logo) */}
      <Link to="/">
        <ActionIcon size="lg" variant="transparent">
          <IconHome size={24} />
        </ActionIcon>
      </Link>

      {/* Page Title */}
      <Title order={3}>Habit Tracker</Title>

      {/* Action Buttons */}
      <Group gap="xs">
        <ActionIcon size="lg" variant="light" onClick={() => onButtonClick("add-habit")}>
          <IconPlus size={24} />
        </ActionIcon>
        <ActionIcon size="lg" variant="light" onClick={() => onButtonClick("settings")}>
          <IconSettings size={24} />
        </ActionIcon>
      </Group>
    </Group>
  );
}

export default HabitHeader;
