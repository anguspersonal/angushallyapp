import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import HabitHeader from "./HabitHeader";
import HabitTile from "./HabitTile";
import HabitDrawer from "./HabitDrawer";
import { useDisclosure } from "@mantine/hooks";
import { getHabitLogs, getLogsByHabit } from "./habit";
import { HabitLog, HabitType } from "../../../types/common";
import "../../../index.css";

interface HabitDefinition {
  id: number;
  name: HabitType;
  displayName: string;
  icon: string;
  progress: number;
}

const Habit: React.FC = () => {
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<HabitDefinition | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [opened, handlers] = useDisclosure(false);
  const isInitialMount = useRef<boolean>(true);

  // Load all habit logs once on mount
  useEffect(() => {
    const loadHabitLogs = async () => {
      try {
        const fetchedData = await getHabitLogs();
        if (Array.isArray(fetchedData)) {
          setHabitLogs(fetchedData);
        } else {
          console.error("Fetched data is not an array:", fetchedData);
        }
      } catch (error) {
        console.error("Error loading Habit data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isInitialMount.current) {
      loadHabitLogs();
      isInitialMount.current = false;
    }
  }, []);

  // Define habits for tiles
  const habits: HabitDefinition[] = [
    { id: 1, name: "alcohol", displayName: "Alcohol", icon: "🍷", progress: 60 },
    { id: 2, name: "exercise", displayName: "Exercise", icon: "🏋️", progress: 80 },
    { id: 3, name: "custom", displayName: "Coding", icon: "💻", progress: 90 },
  ];

  // 🔹 Ensure selectedLogs updates properly when selectedHabit changes
  useEffect(() => {
    if (selectedHabit && selectedLogs.length === 0) {
      console.log(`Filtering logs for habit: ${selectedHabit.name}`);
      setSelectedLogs(habitLogs.filter(log => log.habit_type === selectedHabit.name));
    }
  }, [selectedHabit, habitLogs, selectedLogs.length]);
  


  // ✅ Function to open a habit and filter its logs
  const handleOpenHabit = async (habit: HabitDefinition): Promise<void> => {
    console.log(`Opening Habit: ${habit.displayName}`);
  
    // ✅ Fetch specific logs for the selected habit
    try {
      const fetchedLogs = await getLogsByHabit(habit.name);
      if (Array.isArray(fetchedLogs)) {
        setSelectedLogs(fetchedLogs); // ✅ Ensure logs are fresh before opening drawer
      } else {
        console.error("Fetched data is not an array:", fetchedLogs);
      }
    } catch (error) {
      console.error(`Error fetching logs for ${habit.name}:`, error);
    }
  
    setSelectedHabit(habit);
    handlers.open();
  };
  

  const handleCloseDrawer = () => {
    handlers.close();
    setSelectedHabit(null); // ✅ Ensure habit resets on close
  };




  // Handler for header button clicks
  const handleHeaderButtonClick = (action: string): void => {
    console.log(`Header button clicked: ${action}`);
    // Add specific logic for add-habit, settings, etc.
  };

  // Handler for habit tile log button
  const handleHabitLog = (habit: HabitDefinition): void => {
    console.log(`Log button clicked for habit: ${habit.displayName}`);
    // Quick log functionality can be added here
  };

  // ✅ Modify updateLogsCallback to handle alcohol-specific logs
  const updateLogsCallback = async (): Promise<void> => {
    if (!selectedHabit) return;
    
    console.log("Refreshing logs after new habit entry...");
    await new Promise(resolve => setTimeout(resolve, 500)); // ✅ Small delay before fetching logs
    
    try {
      // Fetch fresh logs based on habit type
      const fetchedData = await getLogsByHabit(selectedHabit.name);
      
      if (Array.isArray(fetchedData)) {
        // Update both habitLogs and selectedLogs
        setHabitLogs(prevLogs => {
          // Remove old logs for this habit type
          const filteredLogs = prevLogs.filter(log => log.habit_type !== selectedHabit.name);
          // Add new logs
          return [...filteredLogs, ...fetchedData];
        });
        setSelectedLogs(fetchedData);
      } else {
        console.error("Fetched data is not an array:", fetchedData);
      }
    } catch (error) {
      console.error("Error refreshing logs:", error);
    }
  };



  return (
    <div className="Page" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <HabitHeader onButtonClick={handleHeaderButtonClick} />
      <h1 className="dashboard-header">Habit Tracker</h1>

      {loading ? <p>Loading habits...</p> : null}

      <div className="grid-container" style={{ flex: 1 }}>
        {habits.map((habit) => (
          <HabitTile 
            key={habit.id} 
            habit={habit} 
            onClick={() => handleOpenHabit(habit)}
            onLog={handleHabitLog}
          />
        ))}
      </div>

      {selectedHabit && (
        <HabitDrawer
          habit={selectedHabit}
          selectedLogs={selectedLogs}
          opened={opened}
          onClose={handleCloseDrawer}
          updateLogsCallback={updateLogsCallback}
        />
      )}
    </div>
  );
}

export default Habit;
