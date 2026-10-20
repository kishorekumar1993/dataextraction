/**
 * WebData Pro - Application Logic
 * No validation blocking. Clicking Submit saves data to tracking dashboard
 * and immediately advances to the next record in queue.
 */

document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_VERSION = 'v4_clean_production';
  const STORAGE_KEY_VERSION = 'webdata_pro_app_version';
  const STORAGE_KEY_RECORDS = 'webdata_pro_completed_records_v4';
  const STORAGE_KEY_PENDING = 'webdata_pro_pending_urls_v4';
  const STORAGE_KEY_TODAY = 'webdata_pro_today_count_v4';

  // Application State
  const state = {
    currentUser: {
      username: 'kishore@01',
      email: 'kishore@admin'
    },
    todayCompletedCount: 0,
    completedRecords: [],
    pendingUrls: [],
    currentPendingIndex: 0,
    filters: {
      status: 'All',
      startDate: '',
      endDate: '',
      search: ''
    },
    pagination: {
      currentPage: 1,
      pageSize: 50
    },
    activeView: 'dataEntryView'
  };

  // Navigation DOM Elements
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const viewPanels = document.querySelectorAll('.view-panel');
  const navPendingBadge = document.getElementById('navPendingBadge');
  const navCompletedBadge = document.getElementById('navCompletedBadge');

  // Dashboard DOM Elements
  const statTodayCount = document.getElementById('statTodayCount');
  const statCompletedCount = document.getElementById('statCompletedCount');
  const statPercentage = document.getElementById('statPercentage');
  const statPendingCount = document.getElementById('statPendingCount');
  const statAssignedCount = document.getElementById('statAssignedCount');
  const btnContinueWorking = document.getElementById('btnContinueWorking');
  const btnViewAssignments = document.getElementById('btnViewAssignments');
  const cardTrackingShortcut = document.getElementById('cardTrackingShortcut');
  const cardLoadDataShortcut = document.getElementById('cardLoadDataShortcut');
  const dashboardRecentTbody = document.getElementById('dashboardRecentTbody');
  const btnGoToFullTable = document.getElementById('btnGoToFullTable');

  // Data Entry Form DOM Elements
  const dataEntryForm = document.getElementById('dataEntryForm');
  const formQueueBadge = document.getElementById('formQueueBadge');
  const inputWebsiteName = document.getElementById('inputWebsiteName');
  const btnClickHere = document.getElementById('btnClickHere');
  const selectWebsiteStatus = document.getElementById('selectWebsiteStatus');
  const selectBusinessType = document.getElementById('selectBusinessType');
  const selectCompanyProfile = document.getElementById('selectCompanyProfile');
  const inputCompanyName = document.getElementById('inputCompanyName');
  const inputCompanyAddress = document.getElementById('inputCompanyAddress');
  const inputCountry = document.getElementById('inputCountry');
  const selectState = document.getElementById('selectState');
  const selectCity = document.getElementById('selectCity');
  const inputEmail = document.getElementById('inputEmail');
  const inputSecondaryEmail = document.getElementById('inputSecondaryEmail');
  const inputPhone = document.getElementById('inputPhone');
  const selectProductCount = document.getElementById('selectProductCount');
  const selectProductImage = document.getElementById('selectProductImage');
  const selectProductDescription = document.getElementById('selectProductDescription');
  const btnSubmitForm = document.getElementById('btnSubmitForm');
  const btnResetForm = document.getElementById('btnResetForm');

  // Tracking Table DOM Elements
  const filterWebsiteStatus = document.getElementById('filterWebsiteStatus');
  const filterStartDate = document.getElementById('filterStartDate');
  const filterEndDate = document.getElementById('filterEndDate');
  const filterSearchText = document.getElementById('filterSearchText');
  const btnApplyFilter = document.getElementById('btnApplyFilter');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const btnExportExcel = document.getElementById('btnExportExcel');
  const recordsBannerText = document.getElementById('recordsBannerText');
  const trackingTableBody = document.getElementById('trackingTableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const paginationControls = document.getElementById('paginationControls');

  // Modals DOM Elements
  const recordModal = document.getElementById('recordModal');
  const modalRecordBody = document.getElementById('modalRecordBody');
  const btnCloseRecordModal = document.getElementById('btnCloseRecordModal');
  const btnCloseRecordFooter = document.getElementById('btnCloseRecordFooter');
  const btnExportSingleRecord = document.getElementById('btnExportSingleRecord');
  let currentViewingRecord = null;

  const assignmentsModal = document.getElementById('assignmentsModal');
  const assignmentsListContainer = document.getElementById('assignmentsListContainer');
  const btnCloseAssignmentsModal = document.getElementById('btnCloseAssignmentsModal');
  const btnCloseAssignmentsFooter = document.getElementById('btnCloseAssignmentsFooter');

  const loadDataModal = document.getElementById('loadDataModal');
  const bulkUrlsInput = document.getElementById('bulkUrlsInput');
  const btnCloseLoadDataModal = document.getElementById('btnCloseLoadDataModal');
  const btnCancelLoadUrls = document.getElementById('btnCancelLoadUrls');
  const btnConfirmLoadUrls = document.getElementById('btnConfirmLoadUrls');
  const btnQuickSampleBatch = document.getElementById('btnQuickSampleBatch');
  const btnClearAllData = document.getElementById('btnClearAllData');

  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // Initialize Application
  // =========================================================================
  function init() {
    checkAppVersion();
    loadStoredData();
    setupEventListeners();
    updateUI();
    loadNextPendingUrlToForm();
    renderDashboard();
    renderTrackingTable();
  }

  function checkAppVersion() {
    try {
      const ver = localStorage.getItem(STORAGE_KEY_VERSION);
      if (ver !== CURRENT_VERSION) {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
      }
    } catch (e) {
      console.warn('Storage check exception', e);
    }
  }

  function loadStoredData() {
    try {
      const storedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (storedRecords) {
        state.completedRecords = JSON.parse(storedRecords);
      } else {
        state.completedRecords = [];
        saveRecordsToStorage();
      }

      const storedPending = localStorage.getItem(STORAGE_KEY_PENDING);
      if (storedPending) {
        state.pendingUrls = JSON.parse(storedPending);
      } else {
        state.pendingUrls = typeof SEED_PENDING_URLS !== 'undefined' ? [...SEED_PENDING_URLS] : [];
        savePendingToStorage();
      }

      const storedToday = localStorage.getItem(STORAGE_KEY_TODAY);
      state.todayCompletedCount = storedToday ? parseInt(storedToday, 10) : 0;
    } catch (e) {
      console.warn('LocalStorage not available, running in-memory', e);
      state.completedRecords = [];
      state.pendingUrls = typeof SEED_PENDING_URLS !== 'undefined' ? [...SEED_PENDING_URLS] : [];
    }
  }

  function saveRecordsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(state.completedRecords));
    } catch (e) {
      console.warn('Failed to save completed records', e);
    }
  }

  function savePendingToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(state.pendingUrls));
    } catch (e) {
      console.warn('Failed to save pending URLs', e);
    }
  }

  function saveTodayToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_TODAY, state.todayCompletedCount.toString());
    } catch (e) {
      console.warn('Failed to save today count', e);
    }
  }

  // =========================================================================
  // Navigation Tabs Switching
  // =========================================================================
  function switchView(viewId) {
    state.activeView = viewId;

    navTabs.forEach(btn => {
      if (btn.dataset.target === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    viewPanels.forEach(panel => {
      if (panel.id === viewId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    if (viewId === 'dashboardView') {
      renderDashboard();
    } else if (viewId === 'dataTrackingView') {
      renderTrackingTable();
    } else if (viewId === 'dataEntryView') {
      loadNextPendingUrlToForm();
    }
  }

  // =========================================================================
  // Data Entry Logic & Queue Progression
  // =========================================================================
  function loadNextPendingUrlToForm(targetUrl = null) {
    if (targetUrl) {
      inputWebsiteName.value = targetUrl;
      const idx = state.pendingUrls.indexOf(targetUrl);
      if (idx !== -1) state.currentPendingIndex = idx;
    } else if (state.pendingUrls.length > 0) {
      if (state.currentPendingIndex >= state.pendingUrls.length) {
        state.currentPendingIndex = 0;
      }
      inputWebsiteName.value = state.pendingUrls[state.currentPendingIndex];
    } else {
      inputWebsiteName.value = `http://www.site-task-${state.completedRecords.length + 1}.com`;
    }

    const totalPending = state.pendingUrls.length;
    if (totalPending > 0) {
      const currentNum = state.currentPendingIndex + 1;
      formQueueBadge.textContent = `${currentNum} of ${totalPending} Pending`;
    } else {
      formQueueBadge.textContent = 'Queue Empty (0 pending)';
    }
  }

  function handleOpenWebsite() {
    let url = inputWebsiteName.value.trim();
    if (!url) {
      showToast('Please enter a Website URL', 'warning');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
      inputWebsiteName.value = url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Opening: ${url}`, 'info');
  }

  // SAVE & SUBMIT RECORD - ZERO VALIDATION ERRORS, ADVANCE TO NEXT RECORD
  function handleSaveRecord(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let websiteName = inputWebsiteName.value.trim();
    if (!websiteName) {
      websiteName = `http://www.site-task-${state.completedRecords.length + 1}.com`;
    }

    const websiteStatus = selectWebsiteStatus.value || 'Working';
    const businessType = selectBusinessType.value || 'Kind of Business';
    const companyProfile = selectCompanyProfile.value || 'Available';
    const companyName = inputCompanyName.value.trim() || 'Company name';
    const companyAddress = inputCompanyAddress.value.trim() || '';
    const country = inputCountry.value.trim() || 'Country';
    const stateVal = selectState ? (selectState.value || 'Available') : 'Available';
    const cityVal = selectCity ? (selectCity.value || 'Available') : 'Available';
    const email = inputEmail.value.trim() || '';
    const secondaryEmail = inputSecondaryEmail.value.trim() || '';
    const phone = inputPhone.value.trim() || '';
    const productCount = selectProductCount.value || '0';
    const productImage = selectProductImage.value || '0';
    const productDescription = selectProductDescription.value || '0';

    const todayDate = new Date().toISOString().split('T')[0];
    const isWorking = websiteStatus === 'Working';
    const statusBadge = isWorking ? 'W-Working' : websiteStatus;

    // Create record object
    const newRecord = {
      id: 'rec-' + Date.now(),
      url: websiteName,
      company: state.currentUser.email,
      userName: state.currentUser.username,
      websiteStatus: websiteStatus,
      statusBadge: statusBadge,
      companyName: companyName,
      businessType: businessType,
      companyProfile: companyProfile,
      country: country,
      state: stateVal,
      city: cityVal,
      address: companyAddress,
      email: email,
      secondaryEmail: secondaryEmail,
      phone: phone,
      productCount: productCount,
      productImage: productImage,
      productDescription: productDescription,
      completedDate: todayDate
    };

    // 1. Prepend to completed records
    state.completedRecords.unshift(newRecord);
    saveRecordsToStorage();

    // 2. Increment today completed count
    state.todayCompletedCount += 1;
    saveTodayToStorage();

    // 3. Remove completed URL from pending queue
    const existingIndex = state.pendingUrls.indexOf(websiteName);
    if (existingIndex !== -1) {
      state.pendingUrls.splice(existingIndex, 1);
    } else if (state.pendingUrls.length > 0) {
      state.pendingUrls.splice(state.currentPendingIndex, 1);
    }
    savePendingToStorage();

    if (state.currentPendingIndex >= state.pendingUrls.length) {
      state.currentPendingIndex = 0;
    }

    // 4. Reset form inputs for next record
    resetFormFields();

    // 5. Auto load NEXT record into the form
    loadNextPendingUrlToForm();

    // 6. Update Dashboard and Data Tracking Table
    updateUI();
    renderDashboard();
    renderTrackingTable();

    // 7. Show confirmation notification
    showToast(`✓ Saved to Tracking Dashboard! Next URL loaded.`, 'success');

    return false;
  }

  function resetFormFields() {
    inputCompanyName.value = '';
    inputCompanyAddress.value = '';
    if (selectState) selectState.value = '';
    if (selectCity) selectCity.value = '';
    inputEmail.value = '';
    inputSecondaryEmail.value = '';
    inputPhone.value = '';
    selectWebsiteStatus.value = 'Working';
    selectBusinessType.value = '';
    selectCompanyProfile.value = '';
    selectProductCount.value = '0';
    selectProductImage.value = '0';
    selectProductDescription.value = '0';
  }

  // =========================================================================
  // Dashboard UI (Screenshot 4)
  // =========================================================================
  function renderDashboard() {
    const totalCompleted = state.completedRecords.length;
    const totalPending = state.pendingUrls.length;
    const totalAssigned = totalCompleted + totalPending;
    const pct = totalAssigned > 0 ? ((totalCompleted / totalAssigned) * 100).toFixed(1) : '0.0';

    statTodayCount.textContent = state.todayCompletedCount;
    statCompletedCount.textContent = totalCompleted;
    statPendingCount.textContent = totalPending;
    statAssignedCount.textContent = totalAssigned;
    statPercentage.innerHTML = `<i class="fa-solid fa-check"></i> ${pct}% Complete`;

    // Render Recent 5 records
    dashboardRecentTbody.innerHTML = '';
    const recents = state.completedRecords.slice(0, 5);
    
    if (recents.length === 0) {
      dashboardRecentTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 28px;">No completed records yet. Enter data in Data Entry to start tracking!</td></tr>`;
      return;
    }

    recents.forEach(rec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><a href="${escapeHtml(rec.url)}" target="_blank" class="table-url-link">${escapeHtml(rec.url)}</a></td>
        <td><strong>${escapeHtml(rec.companyName)}</strong></td>
        <td><span class="badge-pill ${getStatusBadgeClass(rec.websiteStatus)}">${escapeHtml(rec.statusBadge || rec.websiteStatus)}</span></td>
        <td><span class="badge-pill badge-business">${escapeHtml(rec.businessType)}</span></td>
        <td>${escapeHtml(rec.country)}</td>
        <td><strong>${escapeHtml(rec.productCount)}</strong></td>
        <td>${escapeHtml(rec.completedDate)}</td>
      `;
      dashboardRecentTbody.appendChild(tr);
    });
  }

  function updateUI() {
    const totalCompleted = state.completedRecords.length;
    const totalPending = state.pendingUrls.length;
    const totalAssigned = totalCompleted + totalPending;
    const pct = totalAssigned > 0 ? ((totalCompleted / totalAssigned) * 100).toFixed(1) : '0.0';

    navPendingBadge.textContent = totalPending;
    navCompletedBadge.textContent = totalCompleted;

    statTodayCount.textContent = state.todayCompletedCount;
    statCompletedCount.textContent = totalCompleted;
    statPendingCount.textContent = totalPending;
    statAssignedCount.textContent = totalAssigned;
    statPercentage.innerHTML = `<i class="fa-solid fa-check"></i> ${pct}% Complete`;
  }

  // =========================================================================
  // Data Tracking Dashboard & Table (Screenshot 5)
  // =========================================================================
  function getFilteredRecords() {
    return state.completedRecords.filter(rec => {
      if (state.filters.status !== 'All') {
        if (rec.websiteStatus !== state.filters.status) return false;
      }

      if (state.filters.startDate && rec.completedDate < state.filters.startDate) {
        return false;
      }
      if (state.filters.endDate && rec.completedDate > state.filters.endDate) {
        return false;
      }

      if (state.filters.search) {
        const q = state.filters.search.toLowerCase();
        const match = 
          (rec.url && rec.url.toLowerCase().includes(q)) ||
          (rec.companyName && rec.companyName.toLowerCase().includes(q)) ||
          (rec.country && rec.country.toLowerCase().includes(q)) ||
          (rec.city && rec.city.toLowerCase().includes(q)) ||
          (rec.state && rec.state.toLowerCase().includes(q)) ||
          (rec.businessType && rec.businessType.toLowerCase().includes(q)) ||
          (rec.address && rec.address.toLowerCase().includes(q)) ||
          (rec.email && rec.email.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }

  function renderTrackingTable() {
    const filtered = getFilteredRecords();
    const totalRecords = filtered.length;
    const pageSize = state.pagination.pageSize;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    if (state.pagination.currentPage > totalPages) {
      state.pagination.currentPage = totalPages;
    }

    const currentPage = state.pagination.currentPage;
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalRecords);
    const pageRecords = filtered.slice(startIdx, endIdx);

    if (totalRecords === 0) {
      recordsBannerText.textContent = `Showing 0 completed records`;
    } else {
      recordsBannerText.textContent = `Showing ${startIdx + 1} - ${endIdx} of ${totalRecords} completed records`;
    }

    trackingTableBody.innerHTML = '';
    if (pageRecords.length === 0) {
      trackingTableBody.innerHTML = `
        <tr>
          <td colspan="15" style="text-align: center; padding: 36px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.6;"></i>
            ${state.completedRecords.length === 0 ? 'No completed records yet. Fill answers in Data Entry to start!' : 'No records match your filter criteria.'}
          </td>
        </tr>
      `;
    } else {
      pageRecords.forEach(rec => {
        const tr = document.createElement('tr');
        
        const statusBadgeClass = getStatusBadgeClass(rec.websiteStatus);
        const profileBadgeClass = rec.companyProfile === 'Available' ? 'badge-available' : 'badge-notavailable';
        const stateBadgeClass = rec.state === 'Available' ? 'badge-available' : 'badge-notavailable';
        const cityBadgeClass = rec.city === 'Available' ? 'badge-available' : 'badge-notavailable';

        tr.innerHTML = `
          <td>
            <a href="${escapeHtml(rec.url)}" target="_blank" class="table-url-link" title="${escapeHtml(rec.url)}">
              ${escapeHtml(rec.url)}
            </a>
          </td>
          <td>${escapeHtml(rec.company)}</td>
          <td>${escapeHtml(rec.userName)}</td>
          <td>
            <span class="badge-pill ${statusBadgeClass}">
              ${escapeHtml(rec.statusBadge || rec.websiteStatus)}
            </span>
          </td>
          <td><strong>${escapeHtml(rec.companyName)}</strong></td>
          <td>
            <span class="badge-pill badge-business">
              ${escapeHtml(rec.businessType)}
            </span>
          </td>
          <td>
            <span class="badge-pill ${profileBadgeClass}">
              ${escapeHtml(rec.companyProfile)}
            </span>
          </td>
          <td>${escapeHtml(rec.country)}</td>
          <td>
            <span class="badge-pill ${stateBadgeClass}" style="font-size: 11px; padding: 2px 7px;">
              ${escapeHtml(rec.state || 'N/A')}
            </span>
          </td>
          <td>
            <span class="badge-pill ${cityBadgeClass}" style="font-size: 11px; padding: 2px 7px;">
              ${escapeHtml(rec.city || 'N/A')}
            </span>
          </td>
          <td class="cell-address" title="${escapeHtml(rec.address || '')}">
            ${escapeHtml(rec.address || '—')}
          </td>
          <td><span style="font-weight: 700;">${escapeHtml(rec.productCount || '0')}</span></td>
          <td>
            <span class="badge-pill badge-available" style="font-size: 11px; padding: 2px 8px;">
              ${escapeHtml(rec.productImage || '0')}
            </span>
          </td>
          <td>
            <span class="badge-pill badge-available" style="font-size: 11px; padding: 2px 8px;">
              ${escapeHtml(rec.productDescription || '0')}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-icon-action btn-view-record" data-id="${rec.id}" title="View Full Details">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="btn-icon-action delete-action btn-delete-record" data-id="${rec.id}" title="Delete Record">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        `;
        trackingTableBody.appendChild(tr);
      });
    }

    renderPagination(totalRecords, totalPages, currentPage);
  }

  function getStatusBadgeClass(status) {
    if (!status) return 'badge-status-other';
    const s = status.toLowerCase();
    if (s.includes('working') && !s.includes('not')) return 'badge-status-working';
    if (s.includes('not working') || s.includes('expired')) return 'badge-status-notworking';
    return 'badge-status-other';
  }

  function renderPagination(totalRecords, totalPages, currentPage) {
    paginationInfo.textContent = `Showing page ${currentPage} of ${totalPages} (${totalRecords} total records)`;
    paginationControls.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (state.pagination.currentPage > 1) {
        state.pagination.currentPage -= 1;
        renderTrackingTable();
      }
    });
    paginationControls.appendChild(prevBtn);

    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    pages.forEach(p => {
      if (p === '...') {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.style.padding = '0 6px';
        dots.style.color = '#94a3b8';
        paginationControls.appendChild(dots);
      } else {
        const btn = document.createElement('button');
        btn.className = `page-btn ${p === currentPage ? 'active' : ''}`;
        btn.textContent = p;
        btn.addEventListener('click', () => {
          state.pagination.currentPage = p;
          renderTrackingTable();
        });
        paginationControls.appendChild(btn);
      }
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (state.pagination.currentPage < totalPages) {
        state.pagination.currentPage += 1;
        renderTrackingTable();
      }
    });
    paginationControls.appendChild(nextBtn);
  }

  // =========================================================================
  // Excel Export Functionality
  // =========================================================================
  function handleExportExcel() {
    const dataToExport = getFilteredRecords();
    if (dataToExport.length === 0) {
      showToast('No completed records available to export', 'warning');
      return;
    }

    const excelRows = dataToExport.map((rec, index) => ({
      'S.No': index + 1,
      'Website URL': rec.url || '',
      'Company Admin': rec.company || '',
      'User Name': rec.userName || '',
      'Website Status': rec.statusBadge || rec.websiteStatus || '',
      'Company Name': rec.companyName || '',
      'Business Type': rec.businessType || '',
      'Company Profile': rec.companyProfile || '',
      'Country': rec.country || '',
      'State': rec.state || '',
      'City': rec.city || '',
      'Company Address': rec.address || '',
      'Email Id': rec.email || '',
      'Secondary Email': rec.secondaryEmail || '',
      'Phone Number': rec.phone || '',
      'Number of Products': rec.productCount || '',
      'Image Product': rec.productImage || '',
      'Product Description': rec.productDescription || '',
      'Completed Date': rec.completedDate || ''
    }));

    if (typeof XLSX !== 'undefined') {
      try {
        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        const colWidths = [
          { wch: 6 },
          { wch: 32 },
          { wch: 18 },
          { wch: 14 },
          { wch: 16 },
          { wch: 28 },
          { wch: 18 },
          { wch: 16 },
          { wch: 20 },
          { wch: 16 },
          { wch: 16 },
          { wch: 36 },
          { wch: 26 },
          { wch: 24 },
          { wch: 18 },
          { wch: 18 },
          { wch: 15 },
          { wch: 18 },
          { wch: 14 }
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Website Data');
        
        const timestamp = new Date().toISOString().slice(0, 10);
        const fileName = `Completed_Website_Data_${timestamp}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        showToast(`✓ Downloaded ${dataToExport.length} records as Excel (.xlsx)!`, 'success');
        return;
      } catch (err) {
        console.error('SheetJS export error, using CSV fallback', err);
      }
    }

    downloadCsvFallback(excelRows);
  }

  function downloadCsvFallback(rows) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvLines = [];
    
    csvLines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
    
    rows.forEach(row => {
      const line = headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
      csvLines.push(line);
    });

    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Completed_Website_Data_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`✓ Downloaded ${rows.length} records as CSV spreadsheet!`, 'success');
  }

  // =========================================================================
  // Modals Handling
  // =========================================================================
  function openRecordModal(recordId) {
    const record = state.completedRecords.find(r => r.id === recordId);
    if (!record) return;
    currentViewingRecord = record;

    modalRecordBody.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item full-width">
          <div class="detail-label">Website URL</div>
          <div class="detail-value">
            <a href="${escapeHtml(record.url)}" target="_blank" style="color: #7c3aed; text-decoration: underline;">
              ${escapeHtml(record.url)}
            </a>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Company Name</div>
          <div class="detail-value">${escapeHtml(record.companyName)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Website Status</div>
          <div class="detail-value">
            <span class="badge-pill ${getStatusBadgeClass(record.websiteStatus)}">
              ${escapeHtml(record.statusBadge || record.websiteStatus)}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Business Type</div>
          <div class="detail-value">
            <span class="badge-pill badge-business">${escapeHtml(record.businessType)}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Company Profile</div>
          <div class="detail-value">
            <span class="badge-pill ${record.companyProfile === 'Available' ? 'badge-available' : 'badge-notavailable'}">
              ${escapeHtml(record.companyProfile)}
            </span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Country</div>
          <div class="detail-value">${escapeHtml(record.country)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">State & City</div>
          <div class="detail-value">State: ${escapeHtml(record.state || '—')}, City: ${escapeHtml(record.city || '—')}</div>
        </div>
        <div class="detail-item full-width">
          <div class="detail-label">Full Address</div>
          <div class="detail-value">${escapeHtml(record.address || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Primary Email</div>
          <div class="detail-value">${escapeHtml(record.email || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Secondary Email</div>
          <div class="detail-value">${escapeHtml(record.secondaryEmail || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Phone Number</div>
          <div class="detail-value">${escapeHtml(record.phone || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Completed Date</div>
          <div class="detail-value">${escapeHtml(record.completedDate)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Number of Products</div>
          <div class="detail-value">${escapeHtml(record.productCount)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Image of Product</div>
          <div class="detail-value">
            <span class="badge-pill badge-available">${escapeHtml(record.productImage)}</span>
          </div>
        </div>
        <div class="detail-item full-width">
          <div class="detail-label">No. of Product Description</div>
          <div class="detail-value">
            <span class="badge-pill badge-available">${escapeHtml(record.productDescription)}</span>
          </div>
        </div>
      </div>
    `;

    recordModal.classList.add('active');
  }

  function openAssignmentsModal() {
    assignmentsListContainer.innerHTML = '';
    if (state.pendingUrls.length === 0) {
      assignmentsListContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">No pending assignments in queue!</div>`;
    } else {
      state.pendingUrls.forEach((url, i) => {
        const item = document.createElement('div');
        item.className = 'assignment-item';
        item.innerHTML = `
          <div>
            <div class="assignment-url">${escapeHtml(url)}</div>
            <div class="assignment-index">Task #${i + 1} of ${state.pendingUrls.length}</div>
          </div>
          <button class="btn-action-purple btn-work-this" data-url="${escapeHtml(url)}" style="flex: none; padding: 8px 14px; font-size: 12.5px;">
            <i class="fa-solid fa-arrow-right"></i> Work on This
          </button>
        `;
        assignmentsListContainer.appendChild(item);
      });
    }
    assignmentsModal.classList.add('active');
  }

  function openLoadDataModal() {
    bulkUrlsInput.value = '';
    loadDataModal.classList.add('active');
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-solid fa-circle-info';
    if (type === 'success') icon = 'fa-solid fa-circle-check';
    if (type === 'warning') icon = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `<i class="${icon}"></i> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================
  function setupEventListeners() {
    navTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        switchView(btn.dataset.target);
      });
    });

    btnContinueWorking.addEventListener('click', () => {
      switchView('dataEntryView');
    });

    btnViewAssignments.addEventListener('click', () => {
      openAssignmentsModal();
    });

    cardTrackingShortcut.addEventListener('click', () => {
      switchView('dataTrackingView');
    });

    cardLoadDataShortcut.addEventListener('click', () => {
      openLoadDataModal();
    });

    btnGoToFullTable.addEventListener('click', () => {
      switchView('dataTrackingView');
    });

    btnClickHere.addEventListener('click', handleOpenWebsite);

    // DIRECT CLICK LISTENER on Submit Button (no form refresh, no validation errors!)
    btnSubmitForm.addEventListener('click', handleSaveRecord);

    // Also handle form submit in case Enter key is pressed
    dataEntryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveRecord(e);
      return false;
    });

    btnResetForm.addEventListener('click', () => {
      resetFormFields();
      showToast('Form fields reset', 'info');
    });

    btnApplyFilter.addEventListener('click', () => {
      state.filters.status = filterWebsiteStatus.value;
      state.filters.startDate = filterStartDate.value;
      state.filters.endDate = filterEndDate.value;
      state.filters.search = filterSearchText.value.trim();
      state.pagination.currentPage = 1;
      renderTrackingTable();
      showToast('Filters applied', 'info');
    });

    btnResetFilter.addEventListener('click', () => {
      filterWebsiteStatus.value = 'All';
      filterStartDate.value = '';
      filterEndDate.value = '';
      filterSearchText.value = '';
      state.filters = { status: 'All', startDate: '', endDate: '', search: '' };
      state.pagination.currentPage = 1;
      renderTrackingTable();
      showToast('Filters reset', 'info');
    });

    filterSearchText.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        btnApplyFilter.click();
      }
    });

    btnExportExcel.addEventListener('click', handleExportExcel);

    trackingTableBody.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.btn-view-record');
      if (viewBtn) {
        openRecordModal(viewBtn.dataset.id);
        return;
      }

      const delBtn = e.target.closest('.btn-delete-record');
      if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm('Delete this record?')) {
          state.completedRecords = state.completedRecords.filter(r => r.id !== id);
          saveRecordsToStorage();
          updateUI();
          renderTrackingTable();
          renderDashboard();
          showToast('Record deleted', 'info');
        }
      }
    });

    assignmentsListContainer.addEventListener('click', (e) => {
      const workBtn = e.target.closest('.btn-work-this');
      if (workBtn) {
        const url = workBtn.dataset.url;
        loadNextPendingUrlToForm(url);
        assignmentsModal.classList.remove('active');
        switchView('dataEntryView');
        showToast(`Loaded ${url} into Data Entry`, 'info');
      }
    });

    btnCloseRecordModal.addEventListener('click', () => recordModal.classList.remove('active'));
    btnCloseRecordFooter.addEventListener('click', () => recordModal.classList.remove('active'));
    btnCloseAssignmentsModal.addEventListener('click', () => assignmentsModal.classList.remove('active'));
    btnCloseAssignmentsFooter.addEventListener('click', () => assignmentsModal.classList.remove('active'));
    btnCloseLoadDataModal.addEventListener('click', () => loadDataModal.classList.remove('active'));
    btnCancelLoadUrls.addEventListener('click', () => loadDataModal.classList.remove('active'));

    btnExportSingleRecord.addEventListener('click', () => {
      if (!currentViewingRecord) return;
      downloadCsvFallback([currentViewingRecord]);
    });

    btnQuickSampleBatch.addEventListener('click', () => {
      bulkUrlsInput.value = [
        'http://www.tas.com',
        'http://www.nexustech.io',
        'http://www.globalequip.de',
        'http://www.apexlogistics.com'
      ].join('\n');
    });

    btnConfirmLoadUrls.addEventListener('click', () => {
      const raw = bulkUrlsInput.value.trim();
      if (!raw) {
        showToast('Please enter at least one URL', 'warning');
        return;
      }

      const newUrls = raw.split('\n')
        .map(u => u.trim())
        .filter(u => u.length > 0);

      state.pendingUrls.push(...newUrls);
      savePendingToStorage();
      updateUI();
      loadDataModal.classList.remove('active');
      showToast(`✓ Added ${newUrls.length} URLs to queue`, 'success');
      loadNextPendingUrlToForm();
    });

    btnClearAllData.addEventListener('click', () => {
      if (confirm('Clear all completed records and reset counters to 0?')) {
        localStorage.clear();
        state.completedRecords = [];
        state.todayCompletedCount = 0;
        state.pendingUrls = typeof SEED_PENDING_URLS !== 'undefined' ? [...SEED_PENDING_URLS] : [];
        saveRecordsToStorage();
        saveTodayToStorage();
        savePendingToStorage();
        updateUI();
        loadDataModal.classList.remove('active');
        renderTrackingTable();
        renderDashboard();
        loadNextPendingUrlToForm();
        showToast('All data cleared. Reset to 0.', 'success');
      }
    });

    [recordModal, assignmentsModal, loadDataModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  init();
});
