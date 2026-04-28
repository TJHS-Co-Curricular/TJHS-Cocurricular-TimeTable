/**
 * 2026 TJHS SCHOOL TIMETABLE SYSTEM
 * --------------------------------------------------
 * 功能：加载 CSV 数据，生成并显示教师课表。
 * Features: Loads CSV data, generates and displays teacher schedules.
 */

// --- 1. 配置参数 / CONFIGURATION ---
const APP_CONFIG = {
  startTime: 480, // 08:00 AM (in minutes from midnight)
  schoolSchedule: [
    { type: "period", label: "1", p: 1, duration: 35 },
    { type: "period", label: "2", p: 2, duration: 35 },
    { type: "recess", label: "J&S Recess", duration: 30 }, // 09:10 - 09:40
    { type: "period", label: "3", p: 3, duration: 35 },
    { type: "period", label: "4", p: 4, duration: 35 },
    { type: "period", label: "5", p: 5, duration: 35 },
    { type: "break", label: "Break", duration: 5 }, // 11:25 - 11:30
    { type: "staggered", label: "J.Dinner / S.P6", p: 6, duration: 35 }, // 11:30 - 12:05
    { type: "break", label: "Break", duration: 5 }, // 12:05 - 12:10
    { type: "staggered", label: "S.Dinner / J.P6", p: 6, duration: 35 }, // 12:10 - 12:45
    { type: "period", label: "7", p: 7, duration: 35 },
    { type: "period", label: "8", p: 8, duration: 35 },
    { type: "period", label: "9", p: 9, duration: 35 },
    { type: "break", label: "Break", duration: 10 },
    { type: "period", label: "10", p: 10, duration: 35 },
    { type: "period", label: "11", p: 11, duration: 35 },
  ],
};

// 全局存储解析后的课表数据 / Global storage for parsed timetable data
let teacherTimetableData = {};

// --- 2. 数据处理逻辑 / DATA LOGIC ---

/**
 * 从服务器加载 timetable.csv 文件
 * Fetches timetable.csv from the server
 */
async function loadCSVData() {
  try {
    const response = await fetch("timetable.csv");
    if (!response.ok) throw new Error("Could not load timetable.csv");
    const csvText = await response.text();
    parseCSV(csvText);

    setupDefaultDay();
    changeDay();
  } catch (error) {
    console.error("Data Loading Error:", error);
    const tbody = document.getElementById("teacherRows");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan='30' style='color: red; padding: 50px;'>
                CRITICAL ERROR: Failed to load timetable.csv.<br>
                Please ensure the file exists in your repository.
            </td></tr>`;
    }
  }
}

/**
 * 将 CSV 文本解析为 JSON 对象结构
 * Parses raw CSV text into a structured JSON object
 * @param {string} text - Raw CSV content
 */
function parseCSV(text) {
  const lines = text.split("\n");
  teacherTimetableData = {};

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const cols = lines[i].split(",").map((c) => c.trim());
    const day = cols[0];

    if (!teacherTimetableData[day]) teacherTimetableData[day] = [];

    teacherTimetableData[day].push({
      name: cols[1],
      p0: cols[2],
      p1: cols[3],
      p2: cols[4],
      p3: cols[5],
      p4: cols[6],
      p5: cols[7],
      p6: cols[8],
      p7: cols[9],
      p8: cols[10],
      p9: cols[11],
      p10: cols[12],
      p11: cols[13],
    });
  }
}

// --- 3. 辅助函数 / UTILITIES ---

/**
 * 将分钟数转换为 HH:MM 格式
 * Formats total minutes into a HH:MM time string
 * @param {number} totalMinutes
 * @returns {string} HH:MM
 */
window.formatMinutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * 更新页面上的实时时钟
 * Updates the live digital clock on the UI
 */
window.updateLiveClock = () => {
  const now = new Date();
  const dayStr = String(now.getDate()).padStart(2, "0");
  const monthStr = String(now.getMonth() + 1).padStart(2, "0");
  const dateStr = `${dayStr}:${monthStr}:${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString("en-GB");
  const el = document.getElementById("currentTime");
  if (el) el.innerHTML = `${dateStr}<br>${timeStr}`;
};

// --- 4. 界面渲染逻辑 / UI GENERATION ---

/**
 * 生成时间表的表头（包含合并单元格逻辑）
 * Generates table headers with complex merging for early morning blocks
 */
window.renderTableHeaders = () => {
  const thead = document.getElementById("tableHeader");
  if (!thead) return;

  let runningTime = APP_CONFIG.startTime;

  // 第一行：显示 Teacher 标签、第 0 节课大标题以及各个 Period 标签
  // Row 1: Header labels for Periods
  let periodRow = `<tr>
        <td class="print" rowspan="2">Teacher</td>
        <td class="print" colspan="3">0</td>
        <td class="print-break" rowspan="2"></td>`;

  // 第二行：显示具体的早晨时间段（07:14 - 08:00）
  // Row 2: Specific time slots for the morning block
  let timeRow = `<tr>
        <td class="print">07:14<br>07:30</td>
        <td class="print">07:30<br>07:45</td>
        <td class="print">07:45<br>08:00</td>`;

  // 动态添加后续课程的时间段
  // Dynamically add remaining periods and breaks
  APP_CONFIG.schoolSchedule.forEach((slot) => {
    const endTime = runningTime + slot.duration;
    if (slot.type === "break") {
      periodRow += `<td class="print-break" rowspan="2"></td>`;
    } else {
      periodRow += `<td class="print">${slot.label}</td>`;
      timeRow += `<td class="print">${formatMinutesToTime(runningTime)}<br>${formatMinutesToTime(endTime)}</td>`;
    }
    runningTime = endTime;
  });

  thead.innerHTML = periodRow + `</tr>` + timeRow + `</tr>`;
};

/**
 * 为单个教师创建数据行
 * Creates a single table row for a teacher with vertical merging
 * @param {Object} teacher - Teacher data object
 * @param {boolean} isFirst - Is this the first teacher row of the day?
 * @param {number} rowCount - Total number of teachers for the day (for rowspan)
 */
window.createTeacherRow = (teacher, isFirst, rowCount) => {
  const tr = document.createElement("tr");

  // 教师姓名列 / Teacher Name Column
  let html = `<td class="print" style="font-weight: bold;">${teacher.name || ""}</td>`;

  // 垂直合并的早晨活动列 (07:14-08:00)
  // Vertically merged morning activity columns
  if (isFirst) {
    html += `<td class="print vertical-text" rowspan="${rowCount}"> 早 自 习 </td>`;
    html += `<td class="print vertical-text" rowspan="${rowCount}"> 班 导 师 时 间 </td>`;
    html += `<td class="print vertical-text" rowspan="${rowCount}"> 晨 读 </td>`;
  }

  // 间隔列 / Break Column
  html += `<td class="print-break"></td>`;

  // 渲染各个 Period 的课程内容
  // Render individual period content
  APP_CONFIG.schoolSchedule.forEach((slot) => {
    if (slot.type === "break") {
      html += `<td class="print-break"></td>`;
    } else if (slot.type === "recess") {
      html += `<td class="print recess">Recess</td>`;
    } else if (slot.type === "staggered") {
      const content = teacher[`p${slot.p}`] || "";
      const isJunior = content.trim().startsWith("J");
      const isSenior = content.trim().startsWith("S");

      // 启发式判断：如果内容不是明确的 J/S（如“备课”），则检查该老师其它时段
      // Heuristic: If content isn't clearly J/S (e.g., "Prep"), check other periods
      let likelyJunior = isJunior;
      let likelySenior = isSenior;
      if (!isJunior && !isSenior && content.trim() !== "") {
        for (let i = 1; i <= 11; i++) {
          const pVal = (teacher[`p${i}`] || "").trim();
          if (pVal.startsWith("J")) {
            likelyJunior = true;
            break;
          }
          if (pVal.startsWith("S")) {
            likelySenior = true;
            break;
          }
        }
      }

      if (slot.label.includes("J.Dinner")) {
        // 第一个槽位：初中用餐 / 高中 P6
        // Slot 1: Junior Dinner / Senior P6
        if (likelySenior) {
          html += `<td class="print">${content}</td>`;
        } else {
          html += `<td class="print dinner">Junior<br>Dinner</td>`;
        }
      } else {
        // 第二个槽位：高中用餐 / 初中 P6
        // Slot 2: Senior Dinner / Junior P6
        if (likelyJunior || (!likelySenior && content.trim() !== "")) {
          html += `<td class="print">${content}</td>`;
        } else {
          html += `<td class="print dinner">Senior<br>Dinner</td>`;
        }
      }
    } else {
      html += `<td class="print">${teacher[`p${slot.p}`] || ""}</td>`;
    }
  });

  tr.innerHTML = html;
  return tr;
};

/**
 * 渲染主表格内容
 * Renders the full timetable content based on the selected day mode
 * @param {string} mode - "All" or a specific day name (e.g., "Monday")
 */
window.renderMainTable = (mode) => {
  const tbody = document.getElementById("teacherRows");
  if (!tbody) return;
  tbody.innerHTML = "";

  const daysToRender =
    mode === "All"
      ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
      : [mode];

  daysToRender.forEach((day) => {
    const data = teacherTimetableData[day];
    if (!data) return;

    // 如果是全周模式，添加日期分隔行
    // Add a date header row in "All" mode
    if (mode === "All") {
      const hr = document.createElement("tr");
      hr.innerHTML = `<td colspan="30" style="background-color: #ff0000; color: white; text-align: left; padding: 8px 15px; font-weight: bold; border: 1px solid #000;">${day.toUpperCase()}</td>`;
      tbody.appendChild(hr);
    }

    // 为该天的每位教师生成行 / Generate rows for each teacher in that day
    data.forEach((t, index) => {
      tbody.appendChild(createTeacherRow(t, index === 0, data.length));
    });
  });
};

/**
 * 当选择框改变时触发的切换逻辑
 * Day selection change handler
 */
window.changeDay = () => {
  const daySelect = document.getElementById("daySelect");
  if (daySelect) {
    renderMainTable(daySelect.value);
  }
};

// --- 5. 初始化与生命周期 / INITIALIZATION ---

/**
 * 根据当前星期几自动设置默认显示的日期
 * Automatically sets the default day based on today's date
 */
function setupDefaultDay() {
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = weekDays[new Date().getDay()];
  const select = document.getElementById("daySelect");

  if (select) {
    if (teacherTimetableData[currentDay]) select.value = currentDay;
    else select.value = "All";
  }
}

/**
 * 应用程序入口点
 * Main entry point of the application
 */
window.initApp = () => {
  // 启动时钟 / Start Clock
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // 初始化界面 / Initialize UI
  renderTableHeaders();
  loadCSVData();
};

// 启动程序 / Start Application
initApp();
