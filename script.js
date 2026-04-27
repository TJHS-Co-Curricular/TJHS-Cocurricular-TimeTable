/**
 * SCHOOL TIMETABLE SYSTEM
 * Refactored Script - CSV File Loader for GitHub Pages
 */

// --- 1. CONFIGURATION ---
const APP_CONFIG = {
    startTime: 480, // 08:00 AM
    schoolSchedule: [
        { type: 'period', label: '1', duration: 35 },
        { type: 'period', label: '2', duration: 35 },
        { type: 'break',  label: 'Break',  duration: 5 },
        { type: 'period', label: '3', duration: 35 },
        { type: 'period', label: '4', duration: 35 },
        { type: 'break',  label: 'Break',  duration: 5 },
        { type: 'period', label: '5', duration: 35 },
        { type: 'period', label: '6', duration: 35 },
        { type: 'period', label: '7', duration: 35 },
        { type: 'break',  label: 'Break',  duration: 5 },
        { type: 'period', label: '8', duration: 35 },
        { type: 'period', label: '9', duration: 35 },
        { type: 'break',  label: 'Break',  duration: 10 },
        { type: 'period', label: '10', duration: 35 },
        { type: 'period', label: '11', duration: 35 }
    ]
};

let teacherTimetableData = {};

// --- 2. DATA LOADING & PARSING ---

async function loadCSVData() {
    try {
        const response = await fetch('timetable.csv');
        if (!response.ok) throw new Error('Could not load timetable.csv');
        const csvText = await response.text();
        parseCSV(csvText);
        
        setupDefaultDay();
        changeDay();
    } catch (error) {
        console.error(error);
        const tbody = document.getElementById('teacherRows');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan='30' style='color: red; padding: 50px;'>
                CRITICAL ERROR: Failed to load timetable.csv.<br>
                Please ensure the file exists in your repository.
            </td></tr>`;
        }
    }
}

function parseCSV(text) {
    const lines = text.split('\n');
    teacherTimetableData = {};

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const cols = lines[i].split(',').map(c => c.trim());
        const day = cols[0];
        
        if (!teacherTimetableData[day]) teacherTimetableData[day] = [];
        
        teacherTimetableData[day].push({
            name: cols[1],
            p0: cols[2], p1: cols[3], p2: cols[4], p3: cols[5], p4: cols[6],
            p5: cols[7], p6: cols[8], p7: cols[9], p8: cols[10], p9: cols[11],
            p10: cols[12], p11: cols[13]
        });
    }
}

// --- 3. UTILITY FUNCTIONS ---

window.formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

window.updateLiveClock = () => {
    const now = new Date();
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dayStr}:${monthStr}:${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString('en-GB');
    const el = document.getElementById('currentTime');
    if (el) el.innerHTML = `${dateStr}<br>${timeStr}`;
};

// --- 4. UI GENERATORS ---

window.renderTableHeaders = () => {
    const thead = document.getElementById('tableHeader');
    if (!thead) return;

    let runningTime = APP_CONFIG.startTime;
    // Row 1: "Teacher" and "Period 0" headers
    let periodRow = `<tr>
        <td class="print" rowspan="2">Teacher</td>
        <td class="print" colspan="3">0</td>
        <td class="print-break" rowspan="2"></td>`;
    
    // Row 2: Time slots for Period 0
    let timeRow = `<tr>
        <td class="print">07:14<br>07:30</td>
        <td class="print">07:30<br>07:45</td>
        <td class="print">07:45<br>08:00</td>`;

    APP_CONFIG.schoolSchedule.forEach(slot => {
        const endTime = runningTime + slot.duration;
        if (slot.type === 'break') {
            periodRow += `<td class="print-break" rowspan="2"></td>`;
        } else {
            periodRow += `<td class="print">${slot.label}</td>`;
            timeRow += `<td class="print">${formatMinutesToTime(runningTime)}<br>${formatMinutesToTime(endTime)}</td>`;
        }
        runningTime = endTime;
    });

    thead.innerHTML = periodRow + `</tr>` + timeRow + `</tr>`;
};

window.createTeacherRow = (teacher, isFirst, rowCount) => {
    const tr = document.createElement('tr');
    let html = `<td class="print" style="font-weight: bold;">${teacher.name || ""}</td>`;
    
    // 07:14-08:00 Slots: Vertically merged for all teachers
    if (isFirst) {
        html += `<td class="print vertical-text" rowspan="${rowCount}">早自习</td>`;
        html += `<td class="print vertical-text" rowspan="${rowCount}">班导师时间</td>`;
        html += `<td class="print vertical-text" rowspan="${rowCount}">晨读</td>`;
    }
    
    html += `<td class="print-break"></td>`;

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

window.renderMainTable = (mode) => {
    const tbody = document.getElementById('teacherRows');
    if (!tbody) return;
    tbody.innerHTML = "";

    const daysToRender = mode === "All" ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] : [mode];

    daysToRender.forEach(day => {
        const data = teacherTimetableData[day];
        if (!data) return;

        if (mode === "All") {
            const hr = document.createElement('tr');
            hr.innerHTML = `<td colspan="30" style="background-color: #ff0000; color: white; text-align: left; padding: 8px 15px; font-weight: bold;">${day.toUpperCase()}</td>`;
            tbody.appendChild(hr);
        }
        
        data.forEach((t, index) => {
            tbody.appendChild(createTeacherRow(t, index === 0, data.length));
        });
    });
};

window.changeDay = () => {
    const daySelect = document.getElementById('daySelect');
    if (daySelect) {
        renderMainTable(daySelect.value);
    }
};

// --- 5. INITIALIZATION ---

function setupDefaultDay() {
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = weekDays[new Date().getDay()];
    const select = document.getElementById('daySelect');

    if (select) {
        if (teacherTimetableData[currentDay]) select.value = currentDay;
        else select.value = "All";
    }
}

window.initApp = () => {
    setInterval(updateLiveClock, 1000);
    updateLiveClock();
    renderTableHeaders();
    loadCSVData();
};

initApp();