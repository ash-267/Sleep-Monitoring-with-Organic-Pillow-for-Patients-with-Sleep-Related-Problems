// ═══════════════════════════════════════════════════════
// RestNTravel Sleep Comparator — Application Logic
// ═══════════════════════════════════════════════════════

let globalData = [];
let filteredData = [];
let tableState = {
    page: 1,
    limit: 25,
    search: "",
    filter: "all",
    sortCol: "Timestamp",
    sortAsc: true
};

let charts = {};

// ─── INIT & DATA LOADING ───
document.addEventListener("DOMContentLoaded", () => {
    // Basic navigation active state switching
    const navLinks = document.querySelectorAll('.nav-pill');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    loadData();
});

function loadData() {
    Papa.parse("IoT_Sleep_Monitoring_30_Day_Before_After.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
            if (results.data && results.data.length > 0) {
                try {
                    // Sanitize keys and values in case of spaces in CSV headers/data!
                    globalData = results.data.map(row => {
                        let cleanRow = {};
                        for (let k in row) {
                            if (k) {
                                let val = row[k];
                                if (typeof val === 'string') val = val.trim();
                                cleanRow[k.trim()] = val;
                            }
                        }
                        return cleanRow;
                    });

                    // Ensure Date/Timestamps are properly sorted
                    globalData.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
                    filteredData = [...globalData];
                    initDashboard();
                } catch (e) {
                    console.error("Data Processing Error:", e);
                    showError("Error processing CSV data structure.");
                }
            } else {
                showError("Dataset is empty or failed to parse.");
            }
        },
        error: function (err) {
            console.error(err);
            showError("Could not load dataset. (Make sure you pushed the CSV to Github Pages)");
        }
    });
}

function showError(msg) {
    const statEl = document.getElementById("hero-stats");
    if (statEl) {
        statEl.innerHTML = `<div style="color: #ef4444; width: 100%; text-align: center; font-weight: 600;">${msg}</div>`;
    }
}

// ─── DASHBOARD POPULATION ───
function initDashboard() {
    // 1. Calculate and populate top Hero Stats
    const beforeData = globalData.filter(d => d.Phase && d.Phase.includes("Before"));
    const afterData = globalData.filter(d => d.Phase && d.Phase.includes("After"));

    if (beforeData.length === 0 && afterData.length === 0) {
        console.warn("Could not find 'Before' or 'After' phase data. Check the CSV 'Phase' column.");
    }

    const avgSqiBefore = mean(beforeData, "Sleep_Quality_Score");
    const avgSqiAfter = mean(afterData, "Sleep_Quality_Score");
    let improvement = ((avgSqiAfter - avgSqiBefore) / avgSqiBefore) * 100;

    if (isNaN(improvement) || !isFinite(improvement)) improvement = 0;

    // Remove shimmy loads
    document.querySelectorAll(".hero-stat").forEach(el => el.classList.remove("loading-shimmer"));

    // Update inner texts safely
    safeAnimate("stat-total-records", 0, globalData.length, 1000, 0);
    safeAnimate("stat-before-avg-sqi", 0, avgSqiBefore, 1000, 1);
    safeAnimate("stat-after-avg-sqi", 0, avgSqiAfter, 1000, 1);

    const impEl = document.getElementById("stat-improvement");
    if (impEl) {
        impEl.textContent = improvement === 0 ? "N/A" : `+${improvement.toFixed(1)}%`;
        impEl.style.color = improvement > 0 ? "var(--accent-emerald)" : "var(--accent-rose)";
    }

    // Wrap grids in Try/Catch so one failure doesn't break the whole app
    try { renderKPIGrid(beforeData, afterData); }
    catch (e) { console.error("KPI error:", e); }

    try { renderComparisonGrid(beforeData, afterData); }
    catch (e) { console.error("Comparison error:", e); }

    try { setupTable(); updateTable(); }
    catch (e) { console.error("Table error:", e); }

    try { initCharts(beforeData, afterData); }
    catch (e) { console.error("Chart error:", e); }
}

// ─── UTILITIES ───
function mean(arr, key) {
    if (!arr || !arr.length) return 0;
    let sum = 0;
    let validCount = 0;
    arr.forEach(curr => {
        let val = curr[key];
        if (typeof val === 'string') val = parseFloat(val);
        if (!isNaN(val) && val != null) {
            sum += val;
            validCount++;
        }
    });
    return validCount === 0 ? 0 : sum / validCount;
}

function safeAnimate(id, start, end, duration, decimals = 0) {
    const obj = document.getElementById(id);
    if (!obj) return;
    if (isNaN(end) || end == null || end === 0) {
        obj.innerHTML = "0";
        return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = progress * (end - start) + start;
        obj.innerHTML = current.toFixed(decimals);
        if (progress < 1) window.requestAnimationFrame(step);
        else obj.innerHTML = end.toFixed(decimals);
    };
    window.requestAnimationFrame(step);
}

// ─── UI GENERATORS ───
function renderKPIGrid(before, after) {
    const grid = document.getElementById("kpi-grid");
    if (!grid) return;

    const getChangeHtml = (valB, valA, invertGood = false) => {
        const diff = valA - valB;
        if (diff === 0 || !valB) return '';
        const pct = (diff / valB) * 100;
        const isPositiveChange = diff > 0;
        const isGood = invertGood ? !isPositiveChange : isPositiveChange;

        return `<span class="kpi-change ${isGood ? 'positive' : 'negative'}">
                    ${isPositiveChange ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}%
                </span>`;
    };

    const overallQScore = mean(globalData, "Sleep_Quality_Score");
    const avgDeep = mean(globalData, "Deep_Sleep_pct");
    const avgDisturbBefore = mean(before, "Sleep_Disturbances");
    const avgDisturbAfter = mean(after, "Sleep_Disturbances");

    grid.innerHTML = `
        <div class="kpi-card violet">
            <div class="kpi-icon">📊</div>
            <div class="kpi-value">${overallQScore.toFixed(1)}</div>
            <div class="kpi-label">Cohort Avg Score</div>
            ${getChangeHtml(mean(before, "Sleep_Quality_Score"), mean(after, "Sleep_Quality_Score"))}
        </div>
        <div class="kpi-card emerald">
            <div class="kpi-icon">💤</div>
            <div class="kpi-value">${avgDeep.toFixed(1)}%</div>
            <div class="kpi-label">Cohor Avg Deep Sleep</div>
            ${getChangeHtml(mean(before, "Deep_Sleep_pct"), mean(after, "Deep_Sleep_pct"))}
        </div>
        <div class="kpi-card amber">
            <div class="kpi-icon">📉</div>
            <div class="kpi-value">${avgDisturbAfter.toFixed(1)}</div>
            <div class="kpi-label">Avg Disturbances (After)</div>
            ${getChangeHtml(avgDisturbBefore, avgDisturbAfter, true)}
        </div>
        <div class="kpi-card blue">
            <div class="kpi-icon">⏱️</div>
            <div class="kpi-value">${mean(after, "Sleep_Duration_hr").toFixed(2)}h</div>
            <div class="kpi-label">Duration (After)</div>
            ${getChangeHtml(mean(before, "Sleep_Duration_hr"), mean(after, "Sleep_Duration_hr"))}
        </div>
    `;
}

function renderComparisonGrid(before, after) {
    const grid = document.getElementById("comparison-grid");
    if (!grid) return;

    const metrics = [
        { key: "Sleep_Quality_Score", label: "Sleep Quality Index", unit: "/ 100" },
        { key: "Deep_Sleep_pct", label: "Deep Sleep Ratio", unit: "%" },
        { key: "REM_Sleep_pct", label: "REM Sleep Ratio", unit: "%" },
        { key: "Movement_Count", label: "Avg Night Movement", unit: "events", invert: true },
        { key: "Heart_Rate_bpm", label: "Avg Heart Rate", unit: "BPM", invert: true },
        { key: "Pressure_Index", label: "Cervical Pressure", unit: "index", invert: true }
    ];

    let html = '';
    metrics.forEach(m => {
        const valB = mean(before, m.key);
        const valA = mean(after, m.key);
        const diff = valA - valB;
        const pct = valB ? (diff / valB) * 100 : 0;

        let isGood = diff > 0;
        if (m.invert) { isGood = diff < 0; }

        const sign = diff >= 0 ? '+' : '';
        const cl = isGood ? 'positive' : 'negative';

        html += `
            <div class="comparison-card">
                <div class="comp-metric-name">${m.label}</div>
                <div class="comp-values">
                    <div class="comp-phase">
                        <div class="comp-phase-label before">Phase 1 (Standard)</div>
                        <div class="comp-phase-value">${valB.toFixed(1)}<span style="font-size:0.6em;color:var(--text-muted)">${m.unit}</span></div>
                    </div>
                    <div class="comp-arrow">→</div>
                    <div class="comp-phase">
                        <div class="comp-phase-label after">Phase 2 (Organic)</div>
                        <div class="comp-phase-value">${valA.toFixed(1)}<span style="font-size:0.6em;color:var(--text-muted)">${m.unit}</span></div>
                    </div>
                </div>
                <div class="comp-change">
                    <span class="comp-change-value ${cl}">${sign}${pct.toFixed(2)}%</span>
                    <span style="font-size:0.75rem; color:var(--text-muted)">Change</span>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// ─── CHARTS (Chart.js) ───
function initCharts(before, after) {
    if (typeof Chart === 'undefined') {
        console.error("Chart.js failed to load.");
        return;
    }

    // Super safe global defaults (skipping deep property nesting which crashes older Chart v4 imports)
    Chart.defaults.color = "#94a3b8";
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Shared tooltip configuration
    const safeTooltipPlugin = {
        backgroundColor: "rgba(10, 14, 26, 0.9)",
        titleColor: "#f1f5f9",
        padding: 12,
        borderColor: "rgba(139, 92, 246, 0.4)",
        borderWidth: 1
    };

    // 1. Daily Trend
    const trendCtx = document.getElementById('chart-sqi-trend');
    if (trendCtx) {
        charts.trend = new Chart(trendCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: globalData.map((_, i) => `Rec ${i + 1}`),
                datasets: [{
                    label: 'Sleep Quality Score',
                    data: globalData.map(d => parseFloat(d.Sleep_Quality_Score) || 0),
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: globalData.map(d => (d.Phase && d.Phase.includes('Before')) ? '#f59e0b' : '#10b981'),
                    pointBorderColor: 'transparent',
                    pointRadius: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: safeTooltipPlugin },
                scales: { y: { suggestedMin: 30, suggestedMax: 100 } }
            }
        });
    }

    // 2. Heart Rate Distribution
    const processHR = (data) => {
        let counts = [0, 0, 0, 0, 0];
        data.forEach(d => {
            const hr = parseFloat(d.Heart_Rate_bpm) || 0;
            if (hr === 0) return;
            if (hr < 60) counts[0]++;
            else if (hr < 65) counts[1]++;
            else if (hr < 70) counts[2]++;
            else if (hr < 75) counts[3]++;
            else counts[4]++;
        });
        return counts;
    };

    const hrCtx = document.getElementById('chart-hr-dist');
    if (hrCtx) {
        charts.hr = new Chart(hrCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ["< 60", "60 - 64", "65 - 69", "70 - 74", "75+"],
                datasets: [
                    { label: 'Standard Pillow', data: processHR(before), backgroundColor: 'rgba(245, 158, 11, 0.7)' },
                    { label: 'Organic Pillow', data: processHR(after), backgroundColor: 'rgba(16, 185, 129, 0.7)' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: safeTooltipPlugin } }
        });
    }

    // 3. Sleep Stage Composition
    const stCtx = document.getElementById('chart-stages');
    if (stCtx) {
        charts.stages = new Chart(stCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Phase 1 (Standard)', 'Phase 2 (Organic)'],
                datasets: [
                    { label: 'Deep Sleep', data: [mean(before, "Deep_Sleep_pct"), mean(after, "Deep_Sleep_pct")], backgroundColor: '#8b5cf6' },
                    { label: 'REM Sleep', data: [mean(before, "REM_Sleep_pct"), mean(after, "REM_Sleep_pct")], backgroundColor: '#3b82f6' },
                    { label: 'Light Sleep', data: [mean(before, "Light_Sleep_pct"), mean(after, "Light_Sleep_pct")], backgroundColor: '#64748b' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { tooltip: safeTooltipPlugin },
                scales: { x: { stacked: true }, y: { stacked: true, max: 100 } }
            }
        });
    }

    // 4. Sleep Duration
    const bucketDur = (data) => {
        let counts = [0, 0, 0, 0];
        data.forEach(d => {
            const h = parseFloat(d.Sleep_Duration_hr) || 0;
            if (h === 0) return;
            if (h < 5.5) counts[0]++;
            else if (h < 6) counts[1]++;
            else if (h < 6.5) counts[2]++;
            else counts[3]++;
        });
        return counts;
    };

    const durCtx = document.getElementById('chart-duration');
    if (durCtx) {
        charts.duration = new Chart(durCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['< 5.5 hrs', '5.5 - 6 hrs', '6.0 - 6.5 hrs', '> 6.5 hrs'],
                datasets: [
                    { label: 'Before', data: bucketDur(before), backgroundColor: 'rgba(245, 158, 11, 0.5)', borderColor: '#f59e0b', borderWidth: 1 },
                    { label: 'After', data: bucketDur(after), backgroundColor: 'rgba(16, 185, 129, 0.5)', borderColor: '#10b981', borderWidth: 1 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: safeTooltipPlugin } }
        });
    }

    // 5. Scatter Movement vs SQI
    const scatCtx = document.getElementById('chart-scatter');
    if (scatCtx) {
        charts.scatter = new Chart(scatCtx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: [
                    { label: 'Before', data: before.map(d => ({ x: parseFloat(d.Movement_Count) || 0, y: parseFloat(d.Sleep_Quality_Score) || 0 })), backgroundColor: 'rgba(245, 158, 11, 0.6)' },
                    { label: 'After', data: after.map(d => ({ x: parseFloat(d.Movement_Count) || 0, y: parseFloat(d.Sleep_Quality_Score) || 0 })), backgroundColor: 'rgba(16, 185, 129, 0.6)' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { tooltip: safeTooltipPlugin },
                scales: { x: { title: { display: true, text: 'Movements (events)' } }, y: { title: { display: true, text: 'SQI Score' } } }
            }
        });
    }

    // 6. Radar Chart
    const radarCtx = document.getElementById('chart-radar');
    if (radarCtx) {
        const sqBefore = mean(before, "Sleep_Quality_Score");
        const srBefore = mean(before, "Sleep_Disturbances");

        charts.radar = new Chart(radarCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['SQI Score', 'Avg Duration (hrs x10)', 'Deep Sleep %', 'REM Sleep %', 'Efficiency Proxy'],
                datasets: [
                    {
                        label: 'Standard Pillow',
                        data: [
                            sqBefore,
                            mean(before, "Sleep_Duration_hr") * 10,
                            mean(before, "Deep_Sleep_pct"),
                            mean(before, "REM_Sleep_pct"),
                            Math.max(0, 100 - (srBefore * 5))
                        ],
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderColor: '#f59e0b',
                        pointBackgroundColor: '#f59e0b'
                    },
                    {
                        label: 'Organic Pillow',
                        data: [
                            mean(after, "Sleep_Quality_Score"),
                            mean(after, "Sleep_Duration_hr") * 10,
                            mean(after, "Deep_Sleep_pct"),
                            mean(after, "REM_Sleep_pct"),
                            Math.max(0, 100 - (mean(after, "Sleep_Disturbances") * 5))
                        ],
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: '#10b981',
                        pointBackgroundColor: '#10b981'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { tooltip: safeTooltipPlugin },
                scales: { r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { font: { size: 11 } } } }
            }
        });
    }
}

// ─── TABLE LOGIC ───
function setupTableEvents() {
    const searchEl = document.getElementById("table-search");
    if (searchEl) {
        searchEl.addEventListener("input", (e) => {
            tableState.search = e.target.value.toLowerCase();
            tableState.page = 1;
            applyTableState();
        });
    }

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            tableState.filter = e.target.dataset.filter;
            tableState.page = 1;
            applyTableState();
        });
    });
}

function setupTable() {
    setupTableEvents();

    if (!globalData.length) return;
    const thead = document.getElementById("table-header");
    if (!thead) return;

    const headers = Object.keys(globalData[0] || {});
    let thHtml = '';

    headers.forEach(h => {
        const label = h.replace(/_/g, ' ');
        thHtml += `<th data-col="${h}">${label}</th>`;
    });
    thead.innerHTML = thHtml;

    thead.querySelectorAll("th").forEach(th => {
        th.addEventListener("click", () => {
            if (tableState.sortCol === th.dataset.col) {
                tableState.sortAsc = !tableState.sortAsc;
            } else {
                tableState.sortCol = th.dataset.col;
                tableState.sortAsc = true;
            }
            thead.querySelectorAll("th").forEach(t => t.className = '');
            th.className = tableState.sortAsc ? 'sort-asc' : 'sort-desc';
            applyTableState();
        });
    });
}

function applyTableState() {
    filteredData = globalData.filter(row => {
        if (tableState.filter !== "all" && row.Phase && !row.Phase.includes(tableState.filter)) return false;

        if (tableState.search.length > 0) {
            const matches = Object.values(row).some(v =>
                String(v).toLowerCase().includes(tableState.search)
            );
            if (!matches) return false;
        }
        return true;
    });

    filteredData.sort((a, b) => {
        let valA = a[tableState.sortCol];
        let valB = b[tableState.sortCol];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return tableState.sortAsc ? -1 : 1;
        if (valA > valB) return tableState.sortAsc ? 1 : -1;
        return 0;
    });

    updateTable();
}

function updateTable() {
    const tbody = document.getElementById("table-body");
    const totalCountEl = document.getElementById("total-count");
    const showingCountEl = document.getElementById("showing-count");

    if (!tbody || !totalCountEl || !showingCountEl) return;

    const total = filteredData.length;
    const maxPages = Math.ceil(total / tableState.limit) || 1;
    if (tableState.page > maxPages) tableState.page = maxPages;

    const startIdx = (tableState.page - 1) * tableState.limit;
    const endIdx = Math.min(startIdx + tableState.limit, total);

    totalCountEl.textContent = total;
    showingCountEl.textContent = total > 0 ? `${startIdx + 1}-${endIdx}` : `0`;

    const pageData = filteredData.slice(startIdx, endIdx);

    let html = '';
    const headers = Object.keys(globalData[0] || {});

    pageData.forEach(row => {
        html += `<tr>`;
        headers.forEach(h => {
            let val = row[h];
            if (h.includes("Phase") && typeof val === 'string') {
                const cls = val.includes("Before") ? 'before' : val.includes("After") ? 'after' : '';
                val = `<span class="phase-badge ${cls}">${val}</span>`;
            } else if (typeof val === 'number') {
                if (h.includes("Count") || h.includes("Total") || h.includes("Disturbance")) {
                    val = Math.round(val);
                } else {
                    val = val.toFixed(2);
                }
            }
            html += `<td>${val != null ? val : '-'}</td>`;
        });
        html += `</tr>`;
    });

    if (pageData.length === 0) {
        html = `<tr><td colspan="${headers.length}" style="text-align:center; padding: 2rem;">No matching records found.</td></tr>`;
    }

    tbody.innerHTML = html;
    renderPagination(maxPages);
}

function renderPagination(maxPages) {
    const pag = document.getElementById("pagination");
    if (!pag) return;
    let html = '';

    html += `<button class="page-btn" ${tableState.page === 1 ? 'disabled' : ''} onclick="changePage(${tableState.page - 1})">← Prev</button>`;

    let startPage = Math.max(1, tableState.page - 2);
    let endPage = Math.min(maxPages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const cl = i === tableState.page ? 'active' : '';
        html += `<button class="page-btn ${cl}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="page-btn" ${tableState.page === maxPages ? 'disabled' : ''} onclick="changePage(${tableState.page + 1})">Next →</button>`;

    pag.innerHTML = html;
}

window.changePage = function (pageStr) {
    tableState.page = parseInt(pageStr);
    updateTable();
};
