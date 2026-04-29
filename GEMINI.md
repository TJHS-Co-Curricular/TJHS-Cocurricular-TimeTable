# TJHS Cocurricular Teacher Timetable

This project is a web-based system designed to display the teaching schedules for the Co-Curricular Department at Tsun Jin High School (TJHS). It dynamically loads timetable data from CSV files and presents it in a responsive, printable table format.

## Project Overview

*   **Purpose:** To provide an easy-to-use interface for teachers and administrators to view daily and weekly class schedules.
*   **Target Audience:** TJHS Co-Curricular Department staff.
*   **Technologies:** HTML5, Vanilla CSS, Vanilla JavaScript (ES6+), and CSV for data storage.

## Architecture & Data Flow

1.  **Data Storage:** The `Schedule/` directory contains CSV files for each day of the week (`Monday.csv` to `Friday.csv`).
2.  **Initialization:** The `script.js` file initializes the application, starting a live clock and rendering the table headers.
3.  **Data Fetching:** The system fetches CSV files concurrently using the Fetch API.
4.  **Parsing:** `parseCSV` converts the raw CSV text into a structured JSON object (`teacherTimetableData`).
5.  **Rendering:** 
    *   `renderTableHeaders` builds the time-based header rows.
    *   `renderMainTable` and `createTeacherRow` dynamically generate the teacher schedule rows, handling complex logic like staggered lunch breaks for Junior and Senior sections.
6.  **Interactivity:** Users can filter the display by a specific day or view the entire week.

## Building and Running

Since this is a static web application, there is no build step required.

*   **Running Locally:** Open `index.html` in any modern web browser. For full functionality (fetching CSVs), it is recommended to serve the directory using a local web server (e.g., `npx serve`, `python -m http.server`, or Live Server in VS Code).
*   **Testing:** Manual verification of the table rendering and CSV parsing. Ensure CSV files follow the expected format: `Day,Teacher,P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11`.

## Development Conventions

*   **Naming:** Use descriptive variable names (e.g., `APP_CONFIG`, `teacherTimetableData`). Comments are bilingual (Chinese/English) to support the local context.
*   **Styling:** Custom CSS is defined in `style.css`. Use the `.no-print` class for elements that should be hidden during printing (like controls and the live clock).
*   **Data Updates:** To update the timetable, simply modify the corresponding `.csv` files in the `Schedule/` folder. Ensure the "Day" column matches the filename (e.g., "Monday" in `Monday.csv`).
*   **JavaScript:** Prefer modern ES6 features (async/await, arrow functions, template literals). Avoid external libraries to keep the project lightweight.
