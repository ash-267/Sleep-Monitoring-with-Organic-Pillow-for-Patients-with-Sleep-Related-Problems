// ═══════════════════════════════════════════════════════
// RestNTravel Sleep Comparator — Application Logic
// ═══════════════════════════════════════════════════════

let globalData = [];
let filteredData = [];
let tableState = {
    page: 1,
    limit: 25,
    search: "",
    filter: "all", // "all", "Before", "After"
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
                // Ensure Date/Timestamps are properly sorted
                globalData = results.data.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
                filteredData = [...globalData];
                initDashboard();
            } else {
                showError("Dataset is empty or failed to parse.");
            }
        },
        error: function (err) {
            console.error(err);
            showError("Could not load dataset. If you opened this via file://, please use a local web server to prevent CORS issues.");
        }
    });
}

function showError(msg) {
    document.getElementById("hero-stats").innerHTML = `<div style="color: #ef4444; width: 100%; text-align: center; font-weight: 600;">${msg}</div>`;
}

// ─── DASHBOARD POPULATION ───
function initDashboard() {
    // Remove shimmy loads
    document.querySelectorAll(".hero-stat").forEach(el => el.classList.remove("loading-shimmer"));

    // Update inner texts
    animateValue("stat-total-records", 0, globalData.length, 1000, 0);

    // --- HIDDEN ALL METRICS/CHARTS PER USER REQUEST ---
    // (Uncomment these if you want the charts back later!)
    // const beforeData = globalData.filter(d => d.Phase === "Before");
    // const afterData = globalData.filter(d => d.Phase === "After");
    // renderKPIGrid(beforeData, afterData);
    // renderComparisonGrid(beforeData, afterData);
    // initCharts(beforeData, afterData);

    // 4. Initialize Data Table
    setupTable();
    updateTable();
}

// ─── UTILITIES ───
function mean(arr, key) {
    if (!arr.length) return 0;
    const sum = arr.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return sum / arr.length;
}

function animateValue(id, start, end, duration, decimals = 0) {
    const obj = document.getElementById(id);
    if (!obj) return;
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

// ─── TABLE LOGIC ───
function setupTableEvents() {
    // Search
    document.getElementById("table-search").addEventListener("input", (e) => {
        tableState.search = e.target.value.toLowerCase();
        tableState.page = 1;
        applyTableState();
    });

    // Filters
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

    // Headers
    if (!globalData.length) return;
    const headers = Object.keys(globalData[0]);
    const thead = document.getElementById("table-header");
    let thHtml = '';

    headers.forEach(h => {
        // Humanize labels slightly
        const label = h.replace(/_/g, ' ');
        thHtml += `<th data-col="${h}">${label}</th>`;
    });
    thead.innerHTML = thHtml;

    // Sorting listeners
    thead.querySelectorAll("th").forEach(th => {
        th.addEventListener("click", () => {
            if (tableState.sortCol === th.dataset.col) {
                tableState.sortAsc = !tableState.sortAsc;
            } else {
                tableState.sortCol = th.dataset.col;
                tableState.sortAsc = true;
            }
            // update visual classes
            thead.querySelectorAll("th").forEach(t => t.className = '');
            th.className = tableState.sortAsc ? 'sort-asc' : 'sort-desc';
            applyTableState();
        });
    });
}

function applyTableState() {
    // Filtering
    filteredData = globalData.filter(row => {
        // phase filter
        if (tableState.filter !== "all" && row.Phase !== tableState.filter) return false;

        // search filter (match any val)
        if (tableState.search.length > 0) {
            const matches = Object.values(row).some(v =>
                String(v).toLowerCase().includes(tableState.search)
            );
            if (!matches) return false;
        }
        return true;
    });

    // Sorting
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

    // pagination bounds
    const total = filteredData.length;
    const maxPages = Math.ceil(total / tableState.limit) || 1;
    if (tableState.page > maxPages) tableState.page = maxPages;

    const startIdx = (tableState.page - 1) * tableState.limit;
    const endIdx = Math.min(startIdx + tableState.limit, total);

    // Update texts
    totalCountEl.textContent = total;
    showingCountEl.textContent = total > 0 ? `${startIdx + 1}-${endIdx}` : `0`;

    // Render Rows
    const pageData = filteredData.slice(startIdx, endIdx);

    let html = '';
    const headers = Object.keys(globalData[0] || {});

    pageData.forEach(row => {
        html += `<tr>`;
        headers.forEach(h => {
            let val = row[h];
            if (h === "Phase") {
                const cls = val === "Before" ? 'before' : val === "After" ? 'after' : '';
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

    // Render Pagination Buttons
    renderPagination(maxPages);
}

function renderPagination(maxPages) {
    const pag = document.getElementById("pagination");
    let html = '';

    html += `<button class="page-btn" ${tableState.page === 1 ? 'disabled' : ''} onclick="changePage(${tableState.page - 1})">← Prev</button>`;

    // logic for quick page links (showing max 5 numbered buttons)
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

// globally accessible for innerHTML onclick
window.changePage = function (pageStr) {
    tableState.page = parseInt(pageStr);
    updateTable();
};
