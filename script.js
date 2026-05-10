// RCCMS - Revenue Court Computerized Management System
// Main JavaScript File

// ===================== DATA STORE =====================
let registrations = JSON.parse(localStorage.getItem('rccms_registrations')) || PRELOADED_REGISTRATIONS || [];
let disposals = JSON.parse(localStorage.getItem('rccms_disposals')) || PRELOADED_DISPOSALS || [];
let currentEditIndex = -1;

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-IN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    document.getElementById('regDate').valueAsDate = new Date();
    document.getElementById('dispDate').valueAsDate = new Date();

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('mprFromDate').valueAsDate = firstDay;
    document.getElementById('mprToDate').valueAsDate = today;

    // Show loaded data counts
    updateLoadedCounts();

    refreshAll();
});

function updateLoadedCounts() {
    document.getElementById('loadedReg').textContent = registrations.length;
    document.getElementById('loadedDisp').textContent = disposals.length;
    document.getElementById('loadedPending').textContent = getPendingFiles().length;
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    refreshAll();
}

function saveData() {
    localStorage.setItem('rccms_registrations', JSON.stringify(registrations));
    localStorage.setItem('rccms_disposals', JSON.stringify(disposals));
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===================== REGISTRATION =====================
function registerFile() {
    const rrcms = document.getElementById('regRRCMS').value.trim();
    const date = document.getElementById('regDate').value;
    const stream = document.getElementById('regStream').value.trim();
    const year = document.getElementById('regYear').value;
    const applicant = document.getElementById('regApplicant').value.trim();
    const village = document.getElementById('regVillage').value.trim();

    if (!rrcms || !date || !stream || !year) {
        showToast('Please fill all required fields!', 'error');
        return;
    }

    if (registrations.find(r => r.rrcms === rrcms)) {
        showToast('RRCMS Number already exists!', 'error');
        return;
    }

    registrations.push({
        sno: registrations.length + 1,
        rrcms: rrcms,
        regDate: date,
        stream: stream,
        regYear: parseInt(year),
        applicant: applicant,
        village: village,
        registeredOn: new Date().toISOString()
    });

    saveData();
    showToast('File registered successfully!');

    document.getElementById('regRRCMS').value = '';
    document.getElementById('regStream').value = '';
    document.getElementById('regYear').value = '';
    document.getElementById('regApplicant').value = '';
    document.getElementById('regVillage').value = '';

    refreshAll();
}

function renderRegistrations() {
    const tbody = document.getElementById('registrationTableBody');
    const search = document.getElementById('regSearch')?.value.toLowerCase() || '';

    let filtered = registrations;
    if (search) {
        filtered = registrations.filter(r => 
            r.rrcms.toLowerCase().includes(search) ||
            r.stream.toLowerCase().includes(search) ||
            (r.applicant && r.applicant.toLowerCase().includes(search))
        );
    }

    filtered = [...filtered].sort((a, b) => new Date(b.regDate) - new Date(a.regDate));

    tbody.innerHTML = filtered.map((r, i) => {
        const isDisposed = disposals.find(d => d.rrcms === r.rrcms);
        return `<tr>
            <td>${i + 1}</td>
            <td><strong>${r.rrcms}</strong></td>
            <td>${formatDate(r.regDate)}</td>
            <td><span class="stream-tag" style="background:${getStreamColor(r.stream)}20;color:${getStreamColor(r.stream)}">${r.stream}</span></td>
            <td>${r.regYear}</td>
            <td>${r.applicant || '-'}</td>
            <td>${r.village || '-'}</td>
            <td>${isDisposed ? '<span class="badge badge-green">Disposed</span>' : '<span class="badge badge-orange">Pending</span>'}</td>
            <td class="no-print">
                <button class="btn btn-primary" style="padding:4px 10px;font-size:0.8rem;" onclick="editFile('${r.rrcms}')">Edit</button>
                <button class="btn btn-danger" style="padding:4px 10px;font-size:0.8rem;" onclick="deleteFile('${r.rrcms}')">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

function filterRegistrations() {
    renderRegistrations();
}

// ===================== DISPOSAL =====================
function updateDisposalDropdown() {
    const select = document.getElementById('dispRRCMS');
    const pending = registrations.filter(r => !disposals.find(d => d.rrcms === r.rrcms));
    select.innerHTML = '<option value="">Select RRCMS Number</option>' + 
        pending.map(r => `<option value="${r.rrcms}">${r.rrcms} - ${r.stream}</option>`).join('');
}

// ===================== SEARCH FILES TO DISPOSE =====================
function searchFilesToDispose() {
    const searchTerm = document.getElementById('disposeSearch').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');

    if (!searchTerm) {
        resultsDiv.style.display = 'none';
        resultsDiv.innerHTML = '';
        return;
    }

    // Search in ALL registered files (both pending and disposed)
    const matchedFiles = registrations.filter(r => {
        const isDisposed = disposals.find(d => d.rrcms === r.rrcms);
        return (
            r.rrcms.toLowerCase().includes(searchTerm) ||
            r.stream.toLowerCase().includes(searchTerm) ||
            r.regYear.toString().includes(searchTerm) ||
            (r.applicant && r.applicant.toLowerCase().includes(searchTerm)) ||
            (r.village && r.village.toLowerCase().includes(searchTerm))
        );
    }).slice(0, 20); // Show max 20 results

    if (matchedFiles.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">❌ No files found matching your search</div>';
        resultsDiv.style.display = 'block';
        return;
    }

    resultsDiv.innerHTML = matchedFiles.map(r => {
        const isDisposed = disposals.find(d => d.rrcms === r.rrcms);
        const statusClass = isDisposed ? 'status-disposed' : 'status-pending';
        const statusText = isDisposed ? '✅ Disposed' : '⏳ Pending';
        const clickAction = isDisposed ? '' : `onclick="selectFileForDisposal('${r.rrcms}')"`;
        const cursorStyle = isDisposed ? 'cursor: not-allowed; opacity: 0.6;' : 'cursor: pointer;';
        const highlightRRCMS = highlightText(r.rrcms, searchTerm);
        const highlightStream = highlightText(r.stream, searchTerm);

        return `<div class="search-result-item ${isDisposed ? '' : ''}" ${clickAction} style="${cursorStyle}">
            <div>
                <div class="rrcms-num">${highlightRRCMS}</div>
                <div class="file-info">
                    Stream: ${highlightStream} | Reg Date: ${formatDate(r.regDate)} | Year: ${r.regYear}
                    ${r.applicant ? '| Applicant: ' + r.applicant : ''}
                    ${r.village ? '| Village: ' + r.village : ''}
                </div>
            </div>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>`;
    }).join('');

    resultsDiv.style.display = 'block';
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function selectFileForDisposal(rrcms) {
    const file = registrations.find(r => r.rrcms === rrcms);
    if (!file) return;

    // Check if already disposed
    if (disposals.find(d => d.rrcms === rrcms)) {
        showToast('This file is already disposed!', 'error');
        return;
    }

    // Set the dropdown value
    const select = document.getElementById('dispRRCMS');
    select.value = rrcms;

    // Trigger the onchange event
    loadFileDetails();

    // Clear search results
    document.getElementById('disposeSearch').value = '';
    document.getElementById('searchResults').style.display = 'none';

    // Show success message
    showToast(`File ${rrcms} selected for disposal`);

    // Scroll to disposal form
    document.getElementById('fileDetails').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearDisposeSearch() {
    document.getElementById('disposeSearch').value = '';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchResults').innerHTML = '';
}

function loadFileDetails() {
    const rrcms = document.getElementById('dispRRCMS').value;
    const file = registrations.find(r => r.rrcms === rrcms);
    const detailsDiv = document.getElementById('fileDetails');
    if (file) {
        detailsDiv.style.display = 'block';
        document.getElementById('fileDetailText').innerHTML = 
            `RRCMS: <strong>${file.rrcms}</strong> | Stream: <strong>${file.stream}</strong> | Reg Date: <strong>${formatDate(file.regDate)}</strong> | Reg Year: <strong>${file.regYear}</strong>`;
    } else {
        detailsDiv.style.display = 'none';
    }
}

function disposeFile() {
    const rrcms = document.getElementById('dispRRCMS').value;
    const date = document.getElementById('dispDate').value;
    const type = document.getElementById('dispType').value;
    const remarks = document.getElementById('dispRemarks').value.trim();

    if (!rrcms || !date || !type) {
        showToast('Please fill all required fields!', 'error');
        return;
    }

    const file = registrations.find(r => r.rrcms === rrcms);
    if (!file) {
        showToast('File not found!', 'error');
        return;
    }

    if (disposals.find(d => d.rrcms === rrcms)) {
        showToast('File already disposed!', 'error');
        return;
    }

    disposals.push({
        rrcms: rrcms,
        stream: file.stream,
        regDate: file.regDate,
        disposalDate: date,
        disposalType: type,
        remarks: remarks,
        disposedOn: new Date().toISOString()
    });

    saveData();
    showToast('File disposed successfully!');

    document.getElementById('dispRRCMS').value = '';
    document.getElementById('dispType').value = '';
    document.getElementById('dispRemarks').value = '';
    document.getElementById('fileDetails').style.display = 'none';

    refreshAll();
}

function renderDisposals() {
    const tbody = document.getElementById('disposalTableBody');
    const search = document.getElementById('dispSearch')?.value.toLowerCase() || '';

    let filtered = disposals;
    if (search) {
        filtered = disposals.filter(d => 
            d.rrcms.toLowerCase().includes(search) ||
            d.stream.toLowerCase().includes(search)
        );
    }

    filtered = [...filtered].sort((a, b) => new Date(b.disposalDate) - new Date(a.disposalDate));

    tbody.innerHTML = filtered.map((d, i) => {
        const pendingDays = Math.ceil((new Date(d.disposalDate) - new Date(d.regDate)) / (1000 * 60 * 60 * 24));
        return `<tr>
            <td>${i + 1}</td>
            <td><strong>${d.rrcms}</strong></td>
            <td><span class="stream-tag" style="background:${getStreamColor(d.stream)}20;color:${getStreamColor(d.stream)}">${d.stream}</span></td>
            <td>${formatDate(d.regDate)}</td>
            <td>${formatDate(d.disposalDate)}</td>
            <td><span class="badge badge-green">${d.disposalType}</span></td>
            <td>${pendingDays} days</td>
            <td>${d.remarks || '-'}</td>
            <td class="no-print">
                <button class="btn btn-danger" style="padding:4px 10px;font-size:0.8rem;" onclick="undoDisposal('${d.rrcms}')">Undo</button>
            </td>
        </tr>`;
    }).join('');
}

function undoDisposal(rrcms) {
    if (!confirm('Are you sure you want to undo this disposal?')) return;
    disposals = disposals.filter(d => d.rrcms !== rrcms);
    saveData();
    showToast('Disposal undone successfully!');
    refreshAll();
}

function filterDisposals() {
    renderDisposals();
}

// ===================== PENDING FILES =====================
function getAgeCategory(days) {
    if (days <= 180) return { label: 'Upto 6 Months', class: 'badge-green' };
    if (days <= 365) return { label: '6 Months - 1 Year', class: 'badge-yellow' };
    if (days <= 730) return { label: '1 - 2 Years', class: 'badge-orange' };
    if (days <= 1095) return { label: '2 - 3 Years', class: 'badge-orange' };
    if (days <= 1825) return { label: '3 - 5 Years', class: 'badge-red' };
    if (days <= 3650) return { label: '5 - 10 Years', class: 'badge-red' };
    if (days <= 7300) return { label: '10 - 20 Years', class: 'badge-purple' };
    if (days <= 10950) return { label: '20 - 30 Years', class: 'badge-purple' };
    if (days <= 14600) return { label: '30 - 40 Years', class: 'badge-gray' };
    return { label: 'More Than 40 Years', class: 'badge-gray' };
}

function getPendingFiles() {
    return registrations.filter(r => !disposals.find(d => d.rrcms === r.rrcms));
}

function renderPending() {
    const tbody = document.getElementById('pendingTableBody');
    const streamFilter = document.getElementById('pendingStreamFilter')?.value || '';
    const yearFilter = document.getElementById('pendingYearFilter')?.value || '';
    const ageFilter = document.getElementById('pendingAgeFilter')?.value || '';
    const search = document.getElementById('pendingSearch')?.value.toLowerCase() || '';

    let pending = getPendingFiles();
    const today = new Date();

    if (streamFilter) pending = pending.filter(r => r.stream === streamFilter);
    if (yearFilter) pending = pending.filter(r => r.regYear == yearFilter);
    if (search) pending = pending.filter(r => r.rrcms.toLowerCase().includes(search));

    if (ageFilter) {
        pending = pending.filter(r => {
            const days = Math.ceil((today - new Date(r.regDate)) / (1000 * 60 * 60 * 24));
            const [min, max] = ageFilter.split('-');
            if (max) return days >= parseInt(min) && days < parseInt(max);
            return days >= parseInt(min.replace('+', ''));
        });
    }

    pending.sort((a, b) => new Date(a.regDate) - new Date(b.regDate));

    tbody.innerHTML = pending.map((r, i) => {
        const days = Math.ceil((today - new Date(r.regDate)) / (1000 * 60 * 60 * 24));
        const age = getAgeCategory(days);
        return `<tr>
            <td>${i + 1}</td>
            <td><strong>${r.rrcms}</strong></td>
            <td>${formatDate(r.regDate)}</td>
            <td><span class="stream-tag" style="background:${getStreamColor(r.stream)}20;color:${getStreamColor(r.stream)}">${r.stream}</span></td>
            <td>${r.regYear}</td>
            <td>${days}</td>
            <td><span class="badge ${age.class}">${age.label}</span></td>
            <td>${r.applicant || '-'}</td>
            <td>${r.village || '-'}</td>
        </tr>`;
    }).join('');

    if (pending.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No pending files found</td></tr>`;
    }
}

function filterPending() {
    renderPending();
}

function updateFilters() {
    const streams = [...new Set(registrations.map(r => r.stream))].sort();
    const years = [...new Set(registrations.map(r => r.regYear))].sort((a, b) => b - a);

    const streamSelect = document.getElementById('pendingStreamFilter');
    if (streamSelect) {
        streamSelect.innerHTML = '<option value="">All Streams</option>' + 
            streams.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    const yearSelect = document.getElementById('pendingYearFilter');
    if (yearSelect) {
        yearSelect.innerHTML = '<option value="">All Years</option>' + 
            years.map(y => `<option value="${y}">${y}</option>`).join('');
    }
}

function exportPendingCSV() {
    const pending = getPendingFiles();
    const today = new Date();

    let csv = 'S.No.,RRCMS No.,Reg Date,Stream (Dhara),Reg Year,Pending Days,Age Category,Applicant,Village\n';
    pending.forEach((r, i) => {
        const days = Math.ceil((today - new Date(r.regDate)) / (1000 * 60 * 60 * 24));
        const age = getAgeCategory(days);
        csv += `${i+1},${r.rrcms},${r.regDate},${r.stream},${r.regYear},${days},"${age.label}","${r.applicant || ''}","${r.village || ''}"\n`;
    });

    downloadCSV(csv, 'Pending_Files_Report.csv');
    showToast('Pending files exported successfully!');
}

// ===================== MPR REPORT =====================
function generateMPR() {
    const fromDate = new Date(document.getElementById('mprFromDate').value);
    const toDate = new Date(document.getElementById('mprToDate').value);

    if (!fromDate || !toDate) {
        showToast('Please select both From and To dates!', 'error');
        return;
    }

    const officeName = "Assistant Collector (Fastrack), Niwai";

    const initialPending = registrations.filter(r => {
        const regDate = new Date(r.regDate);
        if (regDate >= fromDate) return false;
        const disp = disposals.find(d => d.rrcms === r.rrcms);
        if (!disp) return true;
        return new Date(disp.disposalDate) >= fromDate;
    }).length;

    const newRegistered = registrations.filter(r => {
        const regDate = new Date(r.regDate);
        return regDate >= fromDate && regDate <= toDate;
    }).length;

    const totalDecided = disposals.filter(d => {
        const dispDate = new Date(d.disposalDate);
        return dispDate >= fromDate && dispDate <= toDate;
    }).length;

    const pendingAsOn = registrations.filter(r => {
        const regDate = new Date(r.regDate);
        if (regDate > toDate) return false;
        const disp = disposals.find(d => d.rrcms === r.rrcms);
        if (!disp) return true;
        return new Date(disp.disposalDate) > toDate;
    });

    const ageBreakup = { '0-6': 0, '6-12': 0, '12-24': 0, '24-36': 0, '36-60': 0, '60-120': 0, '120-240': 0, '240-360': 0, '360-480': 0, '480+': 0 };

    pendingAsOn.forEach(r => {
        const days = Math.ceil((toDate - new Date(r.regDate)) / (1000 * 60 * 60 * 24));
        if (days <= 180) ageBreakup['0-6']++;
        else if (days <= 365) ageBreakup['6-12']++;
        else if (days <= 730) ageBreakup['12-24']++;
        else if (days <= 1095) ageBreakup['24-36']++;
        else if (days <= 1825) ageBreakup['36-60']++;
        else if (days <= 3650) ageBreakup['60-120']++;
        else if (days <= 7300) ageBreakup['120-240']++;
        else if (days <= 10950) ageBreakup['240-360']++;
        else if (days <= 14600) ageBreakup['360-480']++;
        else ageBreakup['480+']++;
    });

    const tbody = document.getElementById('mprTableBody');
    tbody.innerHTML = `<tr>
        <td>1</td>
        <td style="text-align:left;font-weight:600;">${officeName}</td>
        <td>${initialPending}</td>
        <td>${newRegistered}</td>
        <td>${totalDecided}</td>
        <td style="font-weight:700;color:#e53e3e;">${pendingAsOn.length}</td>
        <td>${ageBreakup['0-6']}</td>
        <td>${ageBreakup['6-12']}</td>
        <td>${ageBreakup['12-24']}</td>
        <td>${ageBreakup['24-36']}</td>
        <td>${ageBreakup['36-60']}</td>
        <td>${ageBreakup['60-120']}</td>
        <td>${ageBreakup['120-240']}</td>
        <td>${ageBreakup['240-360']}</td>
        <td>${ageBreakup['360-480']}</td>
        <td>${ageBreakup['480+']}</td>
    </tr>`;

    showToast('MPR Report generated successfully!');
}

function exportMPRCSV() {
    const tbody = document.getElementById('mprTableBody');
    if (!tbody.innerHTML.trim()) {
        showToast('Please generate MPR first!', 'error');
        return;
    }

    const fromDate = document.getElementById('mprFromDate').value;
    const toDate = document.getElementById('mprToDate').value;

    let csv = `MPR Report - ${fromDate} to ${toDate}\n\n`;
    csv += 'S.No.,Office Name,Initial Pending,New Registered,Total Decided,Pending As On Date,Upto 6 Months,6 Months To 1 year,1 To 2 Years,2 To 3 Years,3 To 5 Years,5 To 10 Years,10 To 20 Years,20 To 30 Years,30 To 40 Years,More Than 40 Years\n';

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const values = Array.from(cells).map(c => c.textContent.trim());
        csv += values.join(',') + '\n';
    });

    downloadCSV(csv, `MPR_Report_${fromDate}_to_${toDate}.csv`);
    showToast('MPR exported successfully!');
}

// ===================== DASHBOARD =====================
function updateDashboard() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    document.getElementById('totalFiles').textContent = registrations.length;
    document.getElementById('disposedFiles').textContent = disposals.length;
    document.getElementById('pendingFiles').textContent = getPendingFiles().length;

    const pendingOver5 = getPendingFiles().filter(r => {
        const days = Math.ceil((today - new Date(r.regDate)) / (1000 * 60 * 60 * 24));
        return days > 1825;
    }).length;
    document.getElementById('pendingOver5Yrs').textContent = pendingOver5;

    const todayReg = registrations.filter(r => r.regDate === todayStr).length;
    document.getElementById('todayRegistered').textContent = todayReg;

    const todayDisp = disposals.filter(d => d.disposalDate === todayStr).length;
    document.getElementById('todayDisposed').textContent = todayDisp;

    updateLoadedCounts();

    // Age analysis
    const pending = getPendingFiles();
    const ageCounts = { 'Upto 6 Months': 0, '6 Months - 1 Year': 0, '1 - 2 Years': 0, '2 - 3 Years': 0, '3 - 5 Years': 0, '5 - 10 Years': 0, '10 - 20 Years': 0, '20 - 30 Years': 0, '30 - 40 Years': 0, 'More Than 40 Years': 0 };
    const ageColors = ['#48bb78', '#ecc94b', '#ed8936', '#ed8936', '#e53e3e', '#e53e3e', '#805ad5', '#805ad5', '#718096', '#718096'];

    pending.forEach(r => {
        const days = Math.ceil((today - new Date(r.regDate)) / (1000 * 60 * 60 * 24));
        const age = getAgeCategory(days);
        ageCounts[age.label]++;
    });

    const totalPending = pending.length || 1;
    const ageBody = document.getElementById('ageAnalysisBody');
    ageBody.innerHTML = Object.entries(ageCounts).map(([label, count], i) => {
        const pct = ((count / totalPending) * 100).toFixed(1);
        return `<tr>
            <td>${label}</td>
            <td style="font-weight:700;">${count}</td>
            <td>${pct}%</td>
            <td style="width:200px;"><div class="age-bar"><div class="age-fill" style="width:${pct}%;background:${ageColors[i]}"></div></div></td>
        </tr>`;
    }).join('');

    // Stream analysis
    const streams = [...new Set(registrations.map(r => r.stream))];
    const streamBody = document.getElementById('streamAnalysisBody');
    streamBody.innerHTML = streams.map(stream => {
        const total = registrations.filter(r => r.stream === stream).length;
        const disp = disposals.filter(d => d.stream === stream).length;
        const pend = total - disp;
        const pct = total > 0 ? ((pend / total) * 100).toFixed(1) : 0;
        return `<tr>
            <td><span class="stream-tag" style="background:${getStreamColor(stream)}20;color:${getStreamColor(stream)}">${stream}</span></td>
            <td>${total}</td>
            <td style="color:#e53e3e;font-weight:600;">${pend}</td>
            <td style="color:#48bb78;font-weight:600;">${disp}</td>
            <td>${pct}%</td>
        </tr>`;
    }).join('');

    // Year analysis
    const years = [...new Set(registrations.map(r => r.regYear))].sort((a, b) => b - a);
    const yearBody = document.getElementById('yearAnalysisBody');
    yearBody.innerHTML = years.map(year => {
        const total = registrations.filter(r => r.regYear === year).length;
        const disp = disposals.filter(d => {
            const reg = registrations.find(r => r.rrcms === d.rrcms);
            return reg && reg.regYear === year;
        }).length;
        const pend = total - disp;
        const pct = total > 0 ? ((pend / total) * 100).toFixed(1) : 0;
        return `<tr>
            <td style="font-weight:600;">${year}</td>
            <td>${total}</td>
            <td style="color:#e53e3e;font-weight:600;">${pend}</td>
            <td style="color:#48bb78;font-weight:600;">${disp}</td>
            <td>${pct}%</td>
        </tr>`;
    }).join('');
}

// ===================== IMPORT / EXPORT =====================
function handleTotalFilesUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        let imported = 0;

        lines.forEach((line, idx) => {
            if (idx === 0 && (line.includes('S.No') || line.includes('RRCMS'))) return;
            const parts = line.split(/[\t,]/).map(p => p.trim());
            if (parts.length >= 4) {
                const rrcms = parts[1] || parts[0];
                const regDate = parts[2] || parts[1];
                const stream = parts[3] || parts[2];
                const year = parts[4] || new Date(regDate).getFullYear();

                if (rrcms && regDate && !registrations.find(r => r.rrcms === rrcms)) {
                    try {
                        const dateObj = new Date(regDate);
                        const isoDate = dateObj.toISOString().split('T')[0];
                        registrations.push({
                            sno: registrations.length + 1,
                            rrcms: rrcms,
                            regDate: isoDate,
                            stream: stream,
                            regYear: parseInt(year) || new Date().getFullYear(),
                            applicant: '',
                            village: '',
                            registeredOn: new Date().toISOString()
                        });
                        imported++;
                    } catch(e) {}
                }
            }
        });

        saveData();
        showToast(`Imported ${imported} files from Total Files data!`);
        refreshAll();
    };
    reader.readAsText(file);
}

function handleDisposalUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        let imported = 0;

        lines.forEach((line, idx) => {
            if (idx === 0 && (line.includes('RRCMS') || line.includes('Stream'))) return;
            const parts = line.split(/[\t,]/).map(p => p.trim());
            if (parts.length >= 2) {
                const rrcms = parts[0];
                const dispDate = parts[parts.length - 1];

                const reg = registrations.find(r => r.rrcms === rrcms);
                if (reg && !disposals.find(d => d.rrcms === rrcms)) {
                    try {
                        const dateObj = new Date(dispDate);
                        const isoDate = dateObj.toISOString().split('T')[0];
                        disposals.push({
                            rrcms: rrcms,
                            stream: reg.stream,
                            regDate: reg.regDate,
                            disposalDate: isoDate,
                            disposalType: 'Decided',
                            remarks: 'Imported from file',
                            disposedOn: new Date().toISOString()
                        });
                        imported++;
                    } catch(e) {}
                }
            }
        });

        saveData();
        showToast(`Imported ${imported} disposals!`);
        refreshAll();
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (!confirm('⚠️ WARNING: This will delete ALL data. Are you sure?')) return;
    registrations = [];
    disposals = [];
    saveData();
    showToast('All data cleared!');
    refreshAll();
}

function exportAllData() {
    const data = { registrations: registrations, disposals: disposals, exportedOn: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RCCMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup exported successfully!');
}

// ===================== EDIT / DELETE =====================
function editFile(rrcms) {
    const file = registrations.find(r => r.rrcms === rrcms);
    if (!file) return;

    currentEditIndex = registrations.findIndex(r => r.rrcms === rrcms);
    document.getElementById('editRRCMS').value = file.rrcms;
    document.getElementById('editDate').value = file.regDate;
    document.getElementById('editStream').value = file.stream;
    document.getElementById('editYear').value = file.regYear;
    document.getElementById('editApplicant').value = file.applicant || '';
    document.getElementById('editVillage').value = file.village || '';

    document.getElementById('editModal').classList.add('active');
}

function saveEdit() {
    if (currentEditIndex < 0) return;

    registrations[currentEditIndex].regDate = document.getElementById('editDate').value;
    registrations[currentEditIndex].stream = document.getElementById('editStream').value;
    registrations[currentEditIndex].regYear = parseInt(document.getElementById('editYear').value);
    registrations[currentEditIndex].applicant = document.getElementById('editApplicant').value;
    registrations[currentEditIndex].village = document.getElementById('editVillage').value;

    saveData();
    closeModal();
    showToast('File updated successfully!');
    refreshAll();
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditIndex = -1;
}

function deleteFile(rrcms) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    registrations = registrations.filter(r => r.rrcms !== rrcms);
    disposals = disposals.filter(d => d.rrcms !== rrcms);
    saveData();
    showToast('File deleted successfully!');
    refreshAll();
}

// ===================== UTILITIES =====================
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getStreamColor(stream) {
    const colors = { 
        '188,53': '#3182ce', 
        '212(02)': '#38a169', 
        '188,88': '#d69e2e', 
        '88': '#e53e3e', 
        '188': '#805ad5', 
        '136,188,88': '#dd6b20', 
        '39(2)': '#38b2ac', 
        'General': '#718096' 
    };
    return colors[stream] || '#718096';
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

function refreshAll() {
    updateDashboard();
    renderRegistrations();
    updateDisposalDropdown();
    renderDisposals();
    updateFilters();
    renderPending();
}
