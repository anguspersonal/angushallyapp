import { addHabitLog, getHabitLogs } from "./habit";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../index.css";
import Header from "../../../components/Header";
import '@mantine/charts/styles.css';
import { Table, table } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import { useMantineTheme } from '@mantine/core';
import { checkValueType } from "../../../utils/checkValueType";
import "../Strava/strava.css";

function Habit() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); 

  const loadData = async () => {
    try {
      const fetchedData = await getHabitLogs();
      setData(fetchedData);
      // checkValueType(fetchedData);
      console.log('Habit data:', fetchedData);
    } catch (error) {
      console.error('Error loading Habit data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []); 

  const testHabitData = {
    type: 'walking',
    duration: 30,
    distance: 5,
    date: '2021-09-01',
  }

  const handleClick = async () => {
    setLoading(true); // Set loading state to true
    await addHabitLog(testHabitData);
    setLoading(false); // Set loading state to false once the response is obtained
    loadData(); // Reload data after adding a new habit log
  }

  return (
    <div className="Page">
      <Header />
      <h1>Habit Tracker</h1>
      <div className="habit">
        <button onClick={handleClick} disabled={loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
<br />
      <HabitTable habitLogs={data} />
    </div>
  );
}

export default Habit;


// Create Habit Table
function HabitTable({ habitLogs }) {
  return ( 
     <section className="scrollable-table">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Habit</Table.Th>
                            <Table.Th>Value</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {habitLogs.map(log => (
                            <Table.Tr key={log.id}>
                                <Table.Td>{log.id }</Table.Td>
                                <Table.Td>{log.created_at }</Table.Td>

                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </section>
  )
}