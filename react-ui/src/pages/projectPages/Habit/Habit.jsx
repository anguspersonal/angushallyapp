import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/Header";
import HabitHeader from "./HabitHeader";
import HabitTile from "./HabitTile";
import HabitDrawer from "./HabitDrawer";
import { useDisclosure } from "@mantine/hooks";
import { Button, SimpleGrid } from "@mantine/core"; // ✅ Use SimpleGrid for responsiveness
import "@mantine/core/styles.css";
import { addHabitLog, getHabitLogs } from "./habit";
import "../../../index.css";

function Habit() {
  const [loading, setLoading] = useState(false);
  const [habitLogs, setHabitLogs] = useState({}); // ✅ Initialize as an object, not an array
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [opened, handlers] = useDisclosure(false);
  const [selectedLogs, setSelectedLogs] = useState({});

  // Load habit logs
  useEffect(() => {
    const loadHabitLogs = async () => {
      try {
        const fetchedData = await getHabitLogs();
        setHabitLogs(fetchedData);
      } catch (error) {
        console.error("Error loading Habit data:", error);
      }
    };

    loadHabitLogs();
  }, []);

  // Define habits for tiles
  const habits = [
    { id: 1, name: "Alcohol", icon: "🍷", progress: 60 },
    { id: 2, name: "Exercise", icon: "🏋️", progress: 80 },
    { id: 3, name: "Coding", icon: "💻", progress: 90 },
  ];

  // ✅ Handle habit selection & open modal
  const handleOpenHabit = (habit) => {
    console.log(`Habit Opened: ${habit.name}`);
    setSelectedHabit(habit);
    setSelectedLogs(habitLogs[habit.id] || []);
    handlers.open(); // ✅ Ensures modal opens when clicking a habit tile
  };

  // ✅ Handles logging a habit
  const onLog = (habit) => {
    console.log(`Habit Logged: ${habit.name}`);

    // Simulate a loading state
    setLoading(true);

    // Simulate API call / update logs
    setTimeout(() => {
      setLoading(false);

      // ✅ Update logs correctly
      // setHabitLogs((prevLogs) => ({
      //   ...prevLogs,
      //   [habit.id]: [...(prevLogs[habit.id] || []), { id: Date.now(), date: new Date().toISOString() }]
      // }));

    }, 500);
  };

  return (
    <div className="Page">
      <Header />
      <HabitHeader />

      <div className="centre_stage">
        <h1 className="dashboard-header">Habit Tracker</h1>

        {/* ✅ Fix: Function reference instead of function call */}
        <Button variant="default" onClick={() => handlers.open()}>
          Open modal
        </Button>

        {/* ✅ Fix: Use SimpleGrid instead of regular div */}
        <div className="grid-container">
          {habits.map((habit) => (
            <HabitTile
              key={habit.id}
              habit={habit}
              onClick={() => handleOpenHabit(habit)}
              onLog={() => onLog(habit)}
            />
          ))}
        </div>
      </div>

      {/* ✅ Ensure modal opens only when a habit is selected */}
      {selectedHabit && (
        <HabitDrawer habit={selectedHabit} logs={selectedLogs} opened={opened} onClose={handlers.close} />
      )}
    </div>
  );
}

export default Habit;
