import React, { useState, useEffect, use } from "react";
import { fetchStravaData, getPRs, getWeeklyRuns, getRecentRuns } from './stravaDataService.js';
import Header from '../../../components/Header.jsx';
import '@mantine/charts/styles.css';
import { Table, table } from '@mantine/core';
import { LineChart } from '@mantine/charts';


export default function Strava() {
    const [data, setData] = useState([]);
    const [prs, setPRs] = useState([]);
    const [weeklyRuns, setWeeklyRuns] = useState({});
    const [recentRuns, setRecentRuns] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedData = await fetchStravaData();
                setData(fetchedData);
                setPRs(getPRs(fetchedData));
                setWeeklyRuns(getWeeklyRuns(fetchedData));
                setRecentRuns(getRecentRuns(fetchedData));
            } catch (error) {
                console.error('Error loading Strava data:', error);
            }
        };
        loadData();
    }, []);


    // Check loaded data
    // console.log('weeklyRuns', weeklyRuns);
    // console.log('prs', prs);
    // console.log('recentRuns', recentRuns);

    return (
        <div className='Page'>
            <Header />
            <h1>Strava</h1>
            {/* Render your aggregated data here */}
            <div className="centre_stage">
                <section>
                    <h2>Personal Records (PRs)</h2>
                    <PRTable prs={prs} />
                </section>
                <div className="centre_stage">
                <h2>Recent Activities</h2>
                    <RecentRunsTable recentRuns={recentRuns} />
                </div>
            </div>
            <div className="centre_stage">
                {/* <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/efd6ac3e-966b-4a33-8604-63d696e1c7c7/page/p_wi48ouloed" frameborder="0"  allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe> */}
                <LineChart
                    h={300}
                    data={weeklyRuns}
                    dataKey="preciseDate"
                    valueFormatter={(value) => new Intl.NumberFormat('en-US').format(Math.round(value))}
                    series={[{ name: 'totalDistance', color: 'teal.6' }]}
                    yAxisLabel="Distance (m)"
                />
            </div>
        </div>
    );
}


// Update PR table
// Usage: <PRList prs={prs} />
function PRTable({ prs }) {
    return (
        <div>
            {prs.map(({ name, maxSpeed }) => (
                <div key={name}>

                    <p><strong>{name}</strong> Max Speed (m/s): {maxSpeed !== null ? maxSpeed.toFixed(2) : 'No PR yet'}</p>
                </div>
            ))}
        </div>
    );
}

function RecentRunsTable({ recentRuns }) {
    return (
    <Table>
        <Table.Thead>
            <Table.Tr>
                <Table.Th>name</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Pace</Table.Th>
                <Table.Th>Date</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {recentRuns.map(activity => (
                <Table.Tr key={activity.id}>
                    <Table.Td>{activity.name}</Table.Td>
                    <Table.Td>{Math.round(activity.moving_time/(60)*100)/100}</Table.Td>
                    <Table.Td>{convertMSToMinKm(activity.average_speed)}</Table.Td>
                    <Table.Td>{new Date(activity.start_date).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
            ))}
        </Table.Tbody>
    </Table>);
}


function convertMSToMinKm(speedMps) {
    if (speedMps <= 0) return "0:00"; // Handle invalid input
  
    const secondsPerKm = 1000 / speedMps; // Time in seconds per kilometer
    const minutes = Math.floor(secondsPerKm / 60); // Whole minutes
    const seconds = Math.round(secondsPerKm % 60); // Remaining seconds
  
    // Format as "mm:ss"
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }