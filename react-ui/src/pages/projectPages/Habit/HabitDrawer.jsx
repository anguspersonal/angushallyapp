import React, { useEffect, useState, useRef } from "react";
import { Drawer, Button, Stack, Group, NumberInput, Table } from "@mantine/core";
import HabitCombobox from "./HabitCombobox";
import { useForm } from "@mantine/form";
import { addHabitLog, getHabitSpecificData } from "./habit";

function HabitDrawer({ habit, selectedLogs, opened, onClose, updateLogsCallback }) {
  const [options, setOptions] = useState([]);
  const [logs, setLogs] = useState([]);
  const comboboxRef = useRef(null);

  // 🔹 Fetch options for the selected habit
  useEffect(() => {
    if (!habit) return;
    const fetchOptions = async () => {
      try {
        const response = await getHabitSpecificData(habit.name);
        console.log("Fetched options for habit:", response);
        setOptions(response);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, [habit]);

  // 🔹 Sync logs with selectedLogs when habit changes
  useEffect(() => {
    if (!habit) return;

    if (Array.isArray(selectedLogs)) {
      console.log(`Updating logs for habit "${habit.name}":`, selectedLogs.length, "logs found.");

      setLogs((prevLogs) => {
        if (JSON.stringify(prevLogs) !== JSON.stringify(selectedLogs)) {
          return selectedLogs; // ✅ Only update if logs changed
        }
        return prevLogs; // ✅ Prevent unnecessary re-renders
      });
    } else {
      console.error("Invalid selectedLogs data:", selectedLogs);
    }
  }, [selectedLogs, habit]);

  // 🔹 Initialize form with default values
  const form = useForm({
    initialValues: {
      userId: 1,
      habitType: habit?.name || "",
      value: "",
      metric: "units",
      optionId: null,
      optionName: "",
      volumeML: "",
      abvPerc: "",
    },
  });

  // ✅ Handle submission
  const handleSubmit = async (values) => {
    const volumeML = parseFloat(values.volumeML) || 0;
    const abvPerc = parseFloat(values.abvPerc) || 0;
    const units = volumeML * abvPerc;

    const newLog = {
      userId: values.userId,
      id: Date.now(),
      created_at: new Date().toISOString(),
      habit_type: habit?.name, // ✅ Ensure habit is not null
      value: units || 0,
      metric: values.metric,
      extraData: {
        optionId: values.optionId || null, // ✅ Ensure default values
        optionName: values.optionName || "N/A",
        volumeML: values.volumeML || 0,
        abvPerc: values.abvPerc || 0,
      },
    };

    try {
      console.log("Submitting habit log:", newLog);
      await addHabitLog(newLog, habit?.name); // ✅ Prevent error if habit is null
      await updateLogsCallback(); // ✅ Refresh logs from DB
      form.reset(); // ✅ Reset the form after submission
      if (comboboxRef.current) {
        comboboxRef.current(); // ✅ Reset the HabitCombobox after submission
      }
    } catch (error) {
      console.error("Failed to add habit log:", error);
    }
  };

  // ✅ Function to reset the HabitCombobox
  const resetCombobox = (resetFunction) => {
    comboboxRef.current = resetFunction;
  };

  return (
    <Drawer opened={opened} onClose={onClose} title={`Habit: ${habit?.name || "Select Habit"}`} size="md">
      <Group justify="flex-start">
        <h4>{habit?.name.charAt(0).toUpperCase() + habit?.name.slice(1)}</h4>
      </Group>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <HabitCombobox
            options={options}
            value={options.find((opt) => opt.id === form.values.optionId)}
            onChange={(option) => form.setValues({ optionId: option.id, optionName: option.name })}
            placeholder={`Select ${habit?.name || "an option"}`}
            resetCombobox={resetCombobox} // Pass the reset function to HabitCombobox
          />
          <NumberInput withAsterisk label="Volume (ml)" {...form.getInputProps("volumeML")} />
          <NumberInput withAsterisk label="ABV (%)" {...form.getInputProps("abvPerc")} suffix="%" />
          <Group justify="flex-end">
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
      <LogsTable logs={logs} />
    </Drawer>
  );
}

// ✅ Logs Table Component
function LogsTable({ logs }) {
  if (!Array.isArray(logs)) {
    console.warn("No logs available.");
    return <p>No logs found for this habit.</p>;
  }

  // 🔹 Convert backend extra_data → frontend extraData
  const deconstructedLogs = logs.map((log) => ({
    ...log,
    extraData: log.extraData || log.extra_data || { optionName: "N/A", volumeML: 0, abvPerc: 0 }, // ✅ Ensure extraData always exists
  }));

  return (
    <section className="scrollable-table">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Unit</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {deconstructedLogs.map((log) => (
            <Table.Tr key={log.id}>
              <Table.Td>{log.drink_name || "N/A"}</Table.Td>
              <Table.Td>{log.units}</Table.Td>
              <Table.Td>{new Date(log.created_at).toLocaleDateString()}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
}

export default HabitDrawer;
