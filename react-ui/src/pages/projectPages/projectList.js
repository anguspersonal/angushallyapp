export default function getProjectList() {
    const projectList = [
        {
            "id": 0,
            "name": "Data Value Game",
            "desc": "A game where you guess the value of data in different industries. Created for and utilising research from Anmut Consulting.",
            "route": "/projects/DataValueGame",
            "created_at": "2024-10-01"
        },
        {
            "id": 1,
            "name": "Eat Safe UK",
            "desc": "View UK restaurants by Health Rating. Search in map view and see hygiene ratings straight from the Food Standards Agency.",
            "route": "/projects/EatSafeUK",
            "created_at": "2025-01-03"
        },
        {
            "id": 2,
            "name": "Blog",
            "desc": "A place where I write about things I find interesting or useful.",
            "route": "/Blog",
            "created_at": "2025-01-01"
        },
        {
            "id": 3,
            "name": "Strava",
            "desc": "Displaying my Strava Activity.",
            "route": "/projects/Strava",
            "created_at": "2025-02-09"
        },
        {
            "id": 4,
            "name": "Habit",
            "desc": "Habit Tracker.",
            "route": "/projects/Habit",
            "created_at": "2025-02-23"
        }
    ];
    return projectList;
}
