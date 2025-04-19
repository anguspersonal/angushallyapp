export default function getProjectList() {
    const projectList = [
        {
            "id": 0,
            "name": "Data Value Game",
            "desc": "Test your knowledge of data's worth across industries in this interactive game, based on Anmut Consulting research.",
            "route": "/projects/data-value-game",
            "created_at": "2024-10-01"
        },
        {
            "id": 1,
            "name": "Eat Safe UK",
            "desc": "Check UK food hygiene ratings on an interactive map using official Food Standards Agency data via the Google Maps API.",
            "route": "/projects/eat-safe-uk",
            "created_at": "2025-01-03"
        },
        {
            "id": 2,
            "name": "Blog",
            "desc": "Personal blog covering topics in strategy, software development, data, and continuous learning through projects.",
            "route": "/blog",
            "created_at": "2025-01-01"
        },
        {
            "id": 3,
            "name": "Strava Activity Dashboard",
            "desc": "Visualizing personal Strava data using its API to track fitness activities and monitor progress over time.",
            "route": "/projects/strava",
            "created_at": "2025-02-09"
        },
        {
            "id": 4,
            "name": "Habit Tracker App",
            "desc": "A simple application designed to help build positive routines and track daily habit streaks effectively.",
            "route": "/projects/habit",
            "created_at": "2025-02-23"
        }
    ];
    return projectList;
}
