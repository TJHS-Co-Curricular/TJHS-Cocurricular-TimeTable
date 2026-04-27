/**
 * SCHOOL TIMETABLE SYSTEM
 * Refactored Script - CSV File Loader for GitHub Pages
 */

// --- 1. CONFIGURATION ---
const APP_CONFIG = {
    startTime: 480, // 08:00 AM in minutes
    schoolSchedule: [
        { type: 'break',  label: '  ',  duration: 5 },
        { type: 'period', label: '1', duration: 35 },
        { type: 'period', label: '2', duration: 35 },
        { type: 'break',  label: '  ',  duration: 5 },
        { type: 'period', label: '3', duration: 35 },
        { type: 'period', label: '4', duration: 35 },
        { type: 'break',  label: '  ',  duration: 5 },
        { type: 'period', label: '5', duration: 35 },
        { type: 'period', label: '6', duration: 35 },
        { type: 'period', label: '7', duration: 35 },
        { type: 'period', label: '8', duration: 35 },
        { type: 'period', label: '9', duration: 35 },
        { type: 'period', label: '10', duration: 35 },
        { type: 'period', label: '11', duration: 35 }
    ]
};

// --- 2. UTILITY FUNCTIONS ---

const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const updateLiveClock = () => {
    const now = new Date();
    const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const dateStr = now.toLocaleDateString('zh-CN', dateOptions).replace(/\//g, ' / ');
    const timeStr = now.toLocaleTimeString('en-GB');
    document.getElementById('currentTime').innerHTML = `${dateStr}<br>${timeStr}`;
};

// --- 3. UI GENERATORS ---

const renderTableHeaders = () => {
    const thead = document.getElementById('tableHeader');
    let runningTime = APP_CONFIG.startTime;
    
    let periodCells = `<td class="print">Teacher</td><td class="print"></td><td class="print" colspan="2">0</td>`;
    let timeCells = `<td class="print">Time</td><td class="print">07:15<br>07:30</td><td class="print">07:30<br>07:45</td><td class="print">${formatMinutesToTime(465)}<br>${formatMinutesToTime(runningTime)}</td>`;

    APP_CONFIG.schoolSchedule.forEach(slot => {
        const endTime = runningTime + slot.duration;
        
        if (slot.type === 'break') {
            periodCells += `<td class="print-break"></td>`;
            timeCells += `<td class="print-break"></td>`;
        } else {
            periodCells += `<td class="print">${slot.label}</td>`;
            timeCells += `<td class="print">${formatMinutesToTime(runningTime)}<br>${formatMinutesToTime(endTime)}</td>`;
        }
        runningTime = endTime;
    });

    thead.innerHTML = `<tr>${periodCells}</tr><tr>${timeCells}</tr>`;
};

const createTeacherRow = (teacher) => {
    const tr = document.createElement('tr');
    let html = `<td class="print" style="font-weight: bold;">${teacher.name || "N/A"}</td>`;
    html += `<td class="print"></td><td class="print" colspan="2">${teacher.p0 || ""}</td>`;

    let pCount = 1;
    APP_CONFIG.schoolSchedule.forEach(slot => {
        if (slot.type === 'break') {
            html += `<td class="print-break"></td>`;
        } else {
            html += `<td class="print">${teacher[`p${pCount}`] || ""}</td>`;
            pCount++;
        }
    });

    tr.innerHTML = html;
    return tr;
};

// --- 4. MAIN APP LOGIC ---

const renderMainTable = (mode) => {
    const tbody = document.getElementById('teacherRows');
    tbody.innerHTML = "";
    
    if (typeof teacherTimetableData === 'undefined') return;

    const daysToRender = mode === "All" 
        ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] 
        : [mode];

    daysToRender.forEach(day => {
        const data = teacherTimetableData[day];
        if (!data) return;

        if (mode === "All") {
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<td colspan="30" style="background-color: rgb(0, 247, 255); color: black; text-align: left; padding: 8px 15px; font-weight: bold;">${day.toUpperCase()}</td>`;
            tbody.appendChild(headerRow);
        }

        data.forEach(teacher => tbody.appendChild(createTeacherRow(teacher)));
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = "<tr><td colspan='30' style='padding: 50px;'>No data available for this selection.</td></tr>";
    }
};

const handleDayChange = () => {
    const selectedDay = document.getElementById('daySelect').value;
    renderMainTable(selectedDay);
};

const exportFullCSV = () => {
    let csv = "Day,Teacher,P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11\n";
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach(day => {
        if (teacherTimetableData[day]) {
            teacherTimetableData[day].forEach(t => {
                const row = [day, t.name, t.p0, t.p1, t.p2, t.p3, t.p4, t.p5, t.p6, t.p7, t.p8, t.p9, t.p10, t.p11]
                    .map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",");
                csv += row + "\n";
            });
        }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `School_Timetable_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
};

// --- 5. INITIALIZATION ---

const initApp = () => {
    setInterval(updateLiveClock, 1000);
    updateLiveClock();
    renderTableHeaders();

    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = weekDays[new Date().getDay()];
    const daySelect = document.getElementById('daySelect');

    if (teacherTimetableData[currentDay]) {
        daySelect.value = currentDay;
    } else {
        daySelect.value = "All";
    }

    handleDayChange();
};

if (typeof teacherTimetableData !== 'undefined') {
    initApp();
} else {
    document.getElementById('teacherRows').innerHTML = "<tr><td colspan='30' style='color: red; padding: 50px;'>CRITICAL ERROR: data.js is missing or invalid.</td></tr>";
}
