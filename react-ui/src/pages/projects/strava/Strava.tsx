import React, { useState, useEffect } from "react";
import { fetchStravaData, getPRs, getWeeklyRuns, getRecentRuns } from './stravaDataService';
import Header from '../../../components/Header';
import '@mantine/charts/styles.css';
import { Table } from '@mantine/core';
import { LineChart } from '@mantine/charts';
import "./strava.css";


export default function Strava() {
    const [prs, setPRs] = useState([]);
    const [weeklyRuns, setWeeklyRuns] = useState({});
    const [recentRuns, setRecentRuns] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedData = await fetchStravaData();
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
        // <Header />
        <div>
            <Header />
            <div className="strava-dashboard">
                <div className="dashboard">
                    <h1 className="dashboard-header">Strava</h1>
                    <div className="dashboard-content">
                        <section className="card">
                            <h4>Personal Records (PRs)</h4>
                            <PRTable prs={prs} />
                        </section>
                        <section className="card">
                            <h4>Recent Activities</h4>
                            <RecentRunsTable recentRuns={recentRuns} />
                        </section>
                    </div>
                </div>
                <section className="dashboard-chart">
                    {/* <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/efd6ac3e-966b-4a33-8604-63d696e1c7c7/page/p_wi48ouloed" frameborder="0"  allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe> */}
                    <LineChart
                        h={300}
                        data={weeklyRuns}
                        dataKey="preciseDate"
                        valueFormatter={(value) => new Intl.NumberFormat('en-US').format(Math.round(value))}
                        series={[{ name: 'totalDistance', color: 'teal.6' }]}
                        yAxisLabel="Distance (m)"
                    />
                </section>
        </div>
        </div>

    );
}


// Update PR table
// Usage: <PRList prs={prs} />
function PRTable({ prs }) {
    return (
        <section className="scrollable-table">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Distance</Table.Th>
                        <Table.Th>Pace</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {prs.map(pr => (
                        <Table.Tr key={pr.name}>
                            <Table.Td>{pr.name}</Table.Td>
                            <Table.Td>{pr.maxSpeed !== null ? convertMSToMinKm(pr.maxSpeed) : 'No PR yet'}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </section>
    )
    // return (
    //     <div>
    //         {prs.map(({ name, maxSpeed }) => (
    //             <div key={name}>
    //                 <p><strong>{name}</strong> Max Speed (m/s): {maxSpeed !== null ? convertMSToMinKm(maxSpeed) : 'No PR yet'}</p>
    //             </div>
    //         ))}
    //     </div>
    // );
}

function RecentRunsTable({ recentRuns }) {
    return (
        <section className="scrollable-table">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Time</Table.Th>
                        <Table.Th>Pace</Table.Th>
                        <Table.Th>Date</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {recentRuns.map(activity => (
                        <Table.Tr key={activity.id}>
                            <Table.Td>{activity.name}</Table.Td>
                            <Table.Td>{Math.round(activity.moving_time / (60) * 100) / 100}</Table.Td>
                            <Table.Td>{convertMSToMinKm(activity.average_speed)}</Table.Td>
                            <Table.Td>{new Date(activity.start_date).toLocaleDateString()}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </section>);
}


function convertMSToMinKm(speedMps) {
    if (speedMps <= 0) return "0:00"; // Handle invalid input

    const secondsPerKm = 1000 / speedMps; // Time in seconds per kilometer
    const minutes = Math.floor(secondsPerKm / 60); // Whole minutes
    const seconds = Math.round(secondsPerKm % 60); // Remaining seconds

    // Format as "mm:ss"
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}