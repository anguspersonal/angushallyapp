'use client';

import React, { useEffect, useState, useRef } from "react";
import { Drawer, Button, Stack, Group, Table, ActionIcon, Text } from "@mantine/core";
import HabitCombobox from "./HabitCombobox";
import { useForm } from "@mantine/form";
import { addHabitLog, getHabitSpecificData } from "../habit";
import { calculateUnits } from "../../../../utils/calculateUnits";
import { getAggregateStats } from "../aggregateService";
import { HabitLog, DrinkCatalogItem, HabitType } from "../../../../types/common";

type ValidPeriod = 'week' | 'month' | 'year';

// Constants
const TARGET_UNITS = 14; // UK recommended weekly limit

interface HabitDefinition {
  id: number;
  name: HabitType;
  displayName: string;
  icon: string;
  progress: number;
}

// Local interface matching the aggregateService response
interface AggregateStats {
  sum: number;
  avg: number;
  min: number;
  max: number;
  stddev: number;
}

interface TempDrinkLog {
  id: string;
  name: string;
  icon: string;
  group: string;
  volumeML: number;
  abvPerc: number;
  count: number;
}

interface HabitDrawerProps {
  habit: HabitDefinition | null;
  selectedLogs: HabitLog[];
  opened: boolean;
  onClose: () => void;
  updateLogsCallback: () => Promise<void>;
}

const HabitDrawer: React.FC<HabitDrawerProps> = ({ habit, selectedLogs, opened, onClose, updateLogsCallback }) => {
  const [options, setOptions] = useState<DrinkCatalogItem[]>([]); // Initialize as an empty array
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [tempDrinkLogs, setTempDrinkLogs] = useState<TempDrinkLog[]>([]);
  const comboboxRef = useRef<(() => void) | null>(null);
  const [stats, setStats] = useState<Record<string, AggregateStats>>({
    week: { sum: 0, avg: 0, min: 0, max: 0, stddev: 0 },
    month: { sum: 0, avg: 0, min: 0, max: 0, stddev: 0 },
    year: { sum: 0, avg: 0, min: 0, max: 0, stddev: 0 }
  });

  // Fetch options for the selected habit
  useEffect(() => {
    if (!habit) return;
    const fetchOptions = async () => {
      try {
        const response = await getHabitSpecificData(habit.name);

        if (Array.isArray(response)) {
          setOptions(response);
        } else {
          console.error("Invalid response format for options:", response);
          setOptions([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]); // Fallback to an empty array
      }
    };
    fetchOptions();
  }, [habit]);

  // Sync logs with selectedLogs when habit changes
  useEffect(() => {
    if (!habit) return;

    if (Array.isArray(selectedLogs)) {
      setLogs((prevLogs) => {
        if (JSON.stringify(prevLogs) !== JSON.stringify(selectedLogs)) {
          return selectedLogs; // Only update if logs changed
        }
        return prevLogs; // Prevent unnecessary re-renders
      });
    } else {
      console.error("Invalid selectedLogs data:", selectedLogs);
    }
  }, [selectedLogs, habit]);

  useEffect(() => {
    if (habit) {
      const fetchStats = async () => {
        const periods: ValidPeriod[] = ['week', 'month', 'year'];
        const newStats: Record<string, AggregateStats> = {};
        
        console.log('Fetching stats for habit:', habit);
        
        for (const period of periods) {
          try {
            // Make sure we're using 'alcohol' as the habit type for alcohol habits
            const habitType = habit.name.toLowerCase() === 'alcohol' ? 'alcohol' : habit.name;
            console.log(`Fetching ${period} stats for ${habitType}`);
            const data = await getAggregateStats(habitType, period as ValidPeriod);
            console.log(`${period} stats result:`, data);
            // Ensure the data has all required properties
            newStats[period] = {
              sum: data.sum || 0,
              avg: data.avg || 0,
              min: data.min || 0,
              max: data.max || 0,
              stddev: data.stddev || 0
            };
          } catch (error) {
            console.error(`Error fetching ${period} stats:`, error);
            newStats[period] = { sum: 0, avg: 0, min: 0, max: 0, stddev: 0 };
          }
        }
        
        console.log('Setting stats:', newStats);
        setStats(newStats);
      };
      
      fetchStats();
    }
  }, [habit]);

  // Initialize form with default values
  const form = useForm({
    initialValues: {
      userId: 1,
      habitType: habit?.name || "",
      value: "",
      metric: "units",
    },
  });

  // Handle submission
  const handleSubmit = async (values: any) => {
    if (tempDrinkLogs.length === 0) {
      console.error("No drinks selected.");
      return;
    }

    try {
      const individualDrinks = tempDrinkLogs.map((drink) => {
        const drinkUnits = calculateUnits(drink.volumeML, drink.abvPerc, drink.count);
        return {
          id: drink.id,
          name: drink.name,
          icon: drink.icon,
          group: drink.group,
          volumeML: drink.volumeML,
          abvPerc: drink.abvPerc,
          count: drink.count,
          units: drinkUnits, // Include calculated units
          created_at: new Date().toISOString(), // Add timestamp
        };
      });

      const newLog = {
        userId: values.userId,
        habit_type: habit?.name as HabitType,
        value: individualDrinks.reduce((sum, drink) => sum + drink.units, 0), // Sum of all drink units
        metric: "units",
        extraData: { drinks: individualDrinks }, // Store drinks array in extraData
      };

      await addHabitLog(newLog as any, habit?.name as HabitType);
      await updateLogsCallback();

      // Reset the form and clear temporary drink logs
      form.reset();
      setTempDrinkLogs([]);
      if (comboboxRef.current) {
        comboboxRef.current(); // Reset the HabitCombobox
      }
    } catch (error) {
      console.error("Failed to add habit log:", error);
    }
  };

  // Function to reset the HabitCombobox
  const resetCombobox = (resetFunction: () => void) => {
    comboboxRef.current = resetFunction;
  };

  return (
    <Drawer opened={opened} onClose={onClose} title={`Habit: ${habit?.name || "Select Habit"}`} size="md">
      <Group justify="flex-start">
        <h4>{habit?.name ? habit.name.charAt(0).toUpperCase() + habit.name.slice(1) : "Select Habit"}</h4>
      </Group>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ backgroundColor: "", borderRadius: "15px" }}>
        <Stack gap="md">
          <HabitCombobox
            options={options}
            value={[]}
            onChange={(option: DrinkCatalogItem | string) => {
              if (typeof option === 'object' && option) {
                setTempDrinkLogs((prev) => {
                  const existingDrink = prev.find((drink) => drink.id === option.id);
                  if (existingDrink) {
                    // Increment count if drink already exists
                    return prev.map((drink) =>
                      drink.id === option.id ? { ...drink, count: drink.count + 1 } : drink
                    );
                  }
                  // Add new drink with count = 1
                  return [
                    ...prev,
                    {
                      id: option.id,
                      name: option.name,
                      icon: option.icon || "🍺",
                      group: option.drink_type || "Other",
                      volumeML: option.typical_volume_ml || 250,
                      abvPerc: option.abv || 12,
                      count: 1, // Initialize count
                    },
                  ];
                });
              }
            }}
            placeholder={`Add a ${habit?.name || "drink"}...`}
            resetCombobox={resetCombobox}
          />
          <Stack gap="md">
            <TemporaryDrinkTable tempDrinkLogs={tempDrinkLogs} setTempDrinkLogs={setTempDrinkLogs} />
          </Stack>
          <Group justify="flex-end">
            <Button type="submit">Submit</Button>
          </Group>
        </Stack>
      </form>
      <Stack mt="md">
        <Text>So far this week: {stats.week.sum.toFixed(1)} units</Text>
        <Text>Last week: {stats.week.sum.toFixed(1)} units</Text>
        <Text>Target units: {TARGET_UNITS} units</Text>
        <Text>Average units: {stats.week.avg.toFixed(1)} units</Text>
        <Text>Min/Max: {stats.week.min.toFixed(1)}/{stats.week.max.toFixed(1)} units</Text>
        <LogsTable logs={logs} habitType={habit?.name.toLowerCase() === 'alcohol' ? 'alcohol' : 'other'} />
      </Stack>
    </Drawer>
  );
}

// Logs Table Component
function LogsTable({ logs, habitType }: { logs: HabitLog[]; habitType: string }) {
  if (!Array.isArray(logs)) {
    console.warn("No logs available.");
    return <p>No logs found for this habit.</p>;
  }

  // Handle different log structures based on habit type
  const processedLogs = logs.map((log) => {
    if (habitType === 'alcohol') {
      // For alcohol logs, we already have the structure we need
      return {
        id: log.id,
        name: (log as any).drink_name || "N/A",
        units: (log as any).units || 0,
        date: log.created_at,
        volume: (log as any).volume_ml || 0,
        abv: (log as any).abv_percent || 0,
        count: (log as any).count || 1
      };
    } else {
      // For other habits, use the existing structure
      return {
        ...log,
        extraData: (log as any).extraData || (log as any).extra_data || { optionName: "N/A", volumeML: 0, abvPerc: 0 }
      };
    }
  });

  return (
    <section className="scrollable-table">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            {habitType === 'alcohol' && <Table.Th>Count</Table.Th>}
            <Table.Th>Units</Table.Th>
            {habitType === 'alcohol' && <Table.Th>Volume (ml)</Table.Th>}
            {habitType === 'alcohol' && <Table.Th>ABV (%)</Table.Th>}
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {processedLogs.map((log) => (
            <Table.Tr key={log.id}>
              <Table.Td>{log.name || "N/A"}</Table.Td>
              {habitType === 'alcohol' && <Table.Td>{(log as any).count || 1}</Table.Td>}
              <Table.Td>{(log as any).units || 0}</Table.Td>
              {habitType === 'alcohol' && <Table.Td>{(log as any).volume || 0}</Table.Td>}
              {habitType === 'alcohol' && <Table.Td>{(log as any).abv || 0}</Table.Td>}
              <Table.Td>{log.date ? new Date(log.date).toLocaleDateString() : "N/A"}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
}

// Temporary Drinks Table Component
function TemporaryDrinkTable({ tempDrinkLogs, setTempDrinkLogs }: { tempDrinkLogs: TempDrinkLog[]; setTempDrinkLogs: React.Dispatch<React.SetStateAction<TempDrinkLog[]>> }) {
  const incrementCount = (id: string) => {
    setTempDrinkLogs((prevLogs) =>
      prevLogs.map((drink) =>
        drink.id === id ? { ...drink, count: drink.count + 1 } : drink
      )
    );
  };

  const decrementCount = (id: string) => {
    setTempDrinkLogs((prevLogs) =>
      prevLogs
        .map((drink) =>
          drink.id === id ? { ...drink, count: drink.count - 1 } : drink
        )
        .filter((drink) => drink.count > 0) // Remove drinks with count = 0
    );
  };

  if (!Array.isArray(tempDrinkLogs) || tempDrinkLogs.length === 0) {
    return null;
  }

  return (
    <section className="scrollable-table">
      <Table withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Drink</Table.Th>
            <Table.Th>Units</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tempDrinkLogs.map((drink) => {
            const units = calculateUnits(drink.volumeML, drink.abvPerc);

            return (
              <Table.Tr key={drink.id}>
                <Table.Td>
                  <Group gap="xs" wrap="wrap">
                    <ActionIcon
                      variant="subtle"
                      color="dark"
                      onClick={() => decrementCount(drink.id)}
                    >
                      <span style={{ fontSize: "1.2rem" }}>−</span>
                    </ActionIcon>
                    <Text>{drink.count}</Text>
                    <ActionIcon
                      variant="subtle"
                      color="success"
                      onClick={() => incrementCount(drink.id)}
                    >
                      <span style={{ fontSize: "1.2rem" }}>+</span>
                    </ActionIcon>
                    <Text style={{ maxWidth: "8em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {drink.icon} {drink.name}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>{(units * drink.count).toFixed(2)}</Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </section>
  );
}

export default HabitDrawer; 