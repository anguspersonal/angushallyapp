import React from "react";
import { Drawer, Text, Button, Stack, Button, Checkbox, Group, TextInput } from "@mantine/core";
import { useForm } from '@mantine/form';


function HabitDrawer({ habit, logs, opened, onClose }) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={`Habit: ${habit ? habit.name : ""}`}
      padding="md"
      size="md"
      position="bottom" // ✅ Opens as a right-side panel
    >
      {habit ? (
        <Stack>
          <Text size="md">📅 Logging history for <strong>{habit.name}</strong></Text>
          {/* Logging options */}

          <form onSubmit={form.onSubmit((values) => console.log(values))}>
      <TextInput
        withAsterisk
        label="Email"
        placeholder="your@email.com"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />

      <Checkbox
        mt="md"
        label="I agree to sell my privacy"
        key={form.key('termsOfService')}
        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
      />

      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>


          {/* Display Logs */}
          {/* {logs.length > 0 ? (
            logs.map((log) => (
              <Text key={log.id}>✅ {new Date(log.date).toLocaleDateString()}</Text>
            ))
          ) : (
            <Text color="dimmed">No logs yet.</Text>
          )} */}

       
        </Stack>
      ) : (
        <Text color="dimmed">No habit selected.</Text>
      )}
    </Drawer>
  );
}

export default HabitDrawer;
