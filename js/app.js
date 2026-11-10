/**
 * WebData Pro - Application Logic
 * Handles Data Entry, "Not Working" Confirmation Popup, Queue Progression,
 * Dashboard Analytics, Data Tracking Filters, and Excel/CSV Export.
 */

document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_VERSION = 'v4_clean_production';
  const STORAGE_KEY_VERSION = 'webdata_pro_app_version';
  const STORAGE_KEY_RECORDS = 'webdata_pro_completed_records_v4';
  const STORAGE_KEY_PENDING = 'webdata_pro_pending_urls_v4';
  const STORAGE_KEY_TODAY = 'webdata_pro_today_count_v4';

  function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

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
    activeView: 'dataEntryView',
    isManualUrl: false,
    editingRecordId: null,
    // "Not Working" confirmation tracking
    previousWebsiteStatus: 'Working',
    editPreviousWebsiteStatus: 'Working',
    notWorkingConfirmedUrl: null,
    pendingNotWorkingContext: null // 'form-select' | 'form-submit' | 'edit-modal'
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
  const dashboardBreakdownPills = document.getElementById('dashboardBreakdownPills');
  const btnContinueWorking = document.getElementById('btnContinueWorking');
  const btnViewAssignments = document.getElementById('btnViewAssignments');
  const cardTrackingShortcut = document.getElementById('cardTrackingShortcut');
  const cardLoadDataShortcut = document.getElementById('cardLoadDataShortcut');
  const dashboardRecentTbody = document.getElementById('dashboardRecentTbody');
  const btnGoToFullTable = document.getElementById('btnGoToFullTable');

  // Data Entry Form DOM Elements
  const formViewHeading = document.getElementById('formViewHeading');
  const formModeBadge = document.getElementById('formModeBadge');
  const dataEntryForm = document.getElementById('dataEntryForm');
  const formQueueBadge = document.getElementById('formQueueBadge');
  const btnPrevQueueUrl = document.getElementById('btnPrevQueueUrl');
  const btnNextQueueUrl = document.getElementById('btnNextQueueUrl');
  const inputWebsiteName = document.getElementById('inputWebsiteName');
  const btnManualUrlMode = document.getElementById('btnManualUrlMode');
  const btnLoadNextQueueUrl = document.getElementById('btnLoadNextQueueUrl');
  const urlHelpText = document.getElementById('urlHelpText');
  const btnCopyUrl = document.getElementById('btnCopyUrl');
  const btnClickHere = document.getElementById('btnClickHere');
  const selectWebsiteStatus = document.getElementById('selectWebsiteStatus');
  const websiteStatusChip = document.getElementById('websiteStatusChip');
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
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnResetForm = document.getElementById('btnResetForm');

  // Tracking Table DOM Elements
  const quickStatusChips = document.getElementById('quickStatusChips');
  const filterWebsiteStatus = document.getElementById('filterWebsiteStatus');
  const filterStartDate = document.getElementById('filterStartDate');
  const filterEndDate = document.getElementById('filterEndDate');
  const filterSearchText = document.getElementById('filterSearchText');
  const btnApplyFilter = document.getElementById('btnApplyFilter');
  const btnResetFilter = document.getElementById('btnResetFilter');
  const btnExportExcel = document.getElementById('btnExportExcel');
  const recordsBannerText = document.getElementById('recordsBannerText');
  const selectPageSize = document.getElementById('selectPageSize');
  const trackingTableBody = document.getElementById('trackingTableBody');
  const paginationInfo = document.getElementById('paginationInfo');
  const paginationControls = document.getElementById('paginationControls');

  // "Not Working" Confirmation Modal Elements
  const notWorkingConfirmModal = document.getElementById('notWorkingConfirmModal');
  const notWorkingModalDesc = document.getElementById('notWorkingModalDesc');
  const notWorkingUrlPreview = document.getElementById('notWorkingUrlPreview');
  const btnCloseNotWorkingModal = document.getElementById('btnCloseNotWorkingModal');
  const btnNotWorkingConfirmCancel = document.getElementById('btnNotWorkingConfirmCancel');
  const btnNotWorkingConfirmOk = document.getElementById('btnNotWorkingConfirmOk');

  // General Action Confirmation Modal Elements
  const actionConfirmModal = document.getElementById('actionConfirmModal');
  const actionConfirmHeader = document.getElementById('actionConfirmHeader');
  const actionConfirmTitle = document.getElementById('actionConfirmTitle');
  const actionConfirmDesc = document.getElementById('actionConfirmDesc');
  const btnCloseActionConfirm = document.getElementById('btnCloseActionConfirm');
  const btnActionConfirmCancel = document.getElementById('btnActionConfirmCancel');
  const btnActionConfirmOk = document.getElementById('btnActionConfirmOk');
  let pendingActionConfirmCallback = null;

  // View Record Modal DOM Elements
  const recordModal = document.getElementById('recordModal');
  const modalRecordBody = document.getElementById('modalRecordBody');
  const btnCloseRecordModal = document.getElementById('btnCloseRecordModal');
  const btnCloseRecordFooter = document.getElementById('btnCloseRecordFooter');
  const btnExportSingleRecord = document.getElementById('btnExportSingleRecord');
  const btnEditFromViewModal = document.getElementById('btnEditFromViewModal');
  let currentViewingRecord = null;

  // Edit Record Modal DOM Elements
  const editRecordModal = document.getElementById('editRecordModal');
  const editRecordId = document.getElementById('editRecordId');
  const editWebsiteName = document.getElementById('editWebsiteName');
  const btnEditClickHere = document.getElementById('btnEditClickHere');
  const editWebsiteStatus = document.getElementById('editWebsiteStatus');
  const editBusinessType = document.getElementById('editBusinessType');
  const editCompanyProfile = document.getElementById('editCompanyProfile');
  const editCompanyName = document.getElementById('editCompanyName');
  const editCompanyAddress = document.getElementById('editCompanyAddress');
  const editCountry = document.getElementById('editCountry');
  const editState = document.getElementById('editState');
  const editCity = document.getElementById('editCity');
  const editEmail = document.getElementById('editEmail');
  const editSecondaryEmail = document.getElementById('editSecondaryEmail');
  const editPhone = document.getElementById('editPhone');
  const editProductCount = document.getElementById('editProductCount');
  const editProductImage = document.getElementById('editProductImage');
  const editProductDescription = document.getElementById('editProductDescription');
  const modalEditIdBadge = document.getElementById('modalEditIdBadge');
  const btnCloseEditModal = document.getElementById('btnCloseEditModal');
  const btnCancelEditModal = document.getElementById('btnCancelEditModal');
  const btnSaveEditRecord = document.getElementById('btnSaveEditRecord');

  // Assignments Modal Elements
  const assignmentsModal = document.getElementById('assignmentsModal');
  const assignmentsSearchInput = document.getElementById('assignmentsSearchInput');
  const assignmentsListContainer = document.getElementById('assignmentsListContainer');
  const btnCloseAssignmentsModal = document.getElementById('btnCloseAssignmentsModal');
  const btnCloseAssignmentsFooter = document.getElementById('btnCloseAssignmentsFooter');

  // Edit Pending URL Modal Elements
  const editPendingUrlModal = document.getElementById('editPendingUrlModal');
  const editPendingIndex = document.getElementById('editPendingIndex');
  const editPendingUrlInput = document.getElementById('editPendingUrlInput');
  const btnCloseEditPendingModal = document.getElementById('btnCloseEditPendingModal');
  const btnSavePendingUrl = document.getElementById('btnSavePendingUrl');
  const btnCancelEditPending = document.getElementById('btnCancelEditPending');

  // Load Data Modal Elements
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
    loadNextPendingUrlToForm(null, true);
    updateWebsiteStatusVisuals();
    renderDashboard();
    renderTrackingTable();
  }

  function checkAppVersion() {
    try {
      const ver = localStorage.getItem(STORAGE_KEY_VERSION);
      if (ver !== CURRENT_VERSION) {
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
        const parsed = JSON.parse(storedRecords);
        state.completedRecords = Array.isArray(parsed) ? parsed : [];
      } else {
        state.completedRecords = [];
        saveRecordsToStorage();
      }

      const storedPending = localStorage.getItem(STORAGE_KEY_PENDING);
      if (storedPending) {
        const parsedPending = JSON.parse(storedPending);
        state.pendingUrls = Array.isArray(parsedPending) ? parsedPending : [];
      } else {
        state.pendingUrls = typeof SEED_PENDING_URLS !== 'undefined' ? [...SEED_PENDING_URLS] : [];
        savePendingToStorage();
      }

      const storedToday = localStorage.getItem(STORAGE_KEY_TODAY);
      const today = getTodayDateString();
      if (storedToday) {
        try {
          const parsedToday = JSON.parse(storedToday);
          if (parsedToday && typeof parsedToday === 'object' && parsedToday.date) {
            state.todayCompletedCount = parsedToday.date === today ? (parseInt(parsedToday.count, 10) || 0) : 0;
          } else {
            state.todayCompletedCount = parseInt(storedToday, 10) || 0;
          }
        } catch {
          state.todayCompletedCount = parseInt(storedToday, 10) || 0;
        }
      } else {
        state.todayCompletedCount = 0;
      }
      saveTodayToStorage();
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
      const payload = { date: getTodayDateString(), count: state.todayCompletedCount };
      localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save today count', e);
    }
  }

  function normalizeUrl(rawUrl) {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return 'http://' + trimmed;
    }
    return trimmed;
  }

  // =========================================================================
  // Navigation Tabs Switching
  // =========================================================================
  function switchView(viewId) {
    state.activeView = viewId;

    navTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === viewId);
    });

    viewPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === viewId);
    });

    if (viewId === 'dashboardView') {
      renderDashboard();
    } else if (viewId === 'dataTrackingView') {
      renderTrackingTable();
    } else if (viewId === 'dataEntryView') {
      if (!state.isManualUrl && !inputWebsiteName.value.trim() && !state.editingRecordId) {
        loadNextPendingUrlToForm();
      }
    }
  }

  // =========================================================================
  // "Not Working" Confirmation Popup Logic
  // =========================================================================
  function openNotWorkingConfirmModal(context, targetUrl) {
    state.pendingNotWorkingContext = context;
    const displayUrl = (targetUrl || inputWebsiteName.value || '').trim();
    notWorkingModalDesc.textContent = 'You are about to mark this website as "Not Working".';
    if (displayUrl) {
      notWorkingUrlPreview.textContent = displayUrl;
      notWorkingUrlPreview.style.display = 'inline-block';
    } else {
      notWorkingUrlPreview.textContent = '';
      notWorkingUrlPreview.style.display = 'none';
    }
    notWorkingConfirmModal.classList.add('active');
    setTimeout(() => btnNotWorkingConfirmOk.focus(), 50);
  }

  function confirmNotWorkingModal() {
    const context = state.pendingNotWorkingContext;
    state.pendingNotWorkingContext = null;
    notWorkingConfirmModal.classList.remove('active');

    if (context === 'form-select') {
      const currentUrl = normalizeUrl(inputWebsiteName.value) || inputWebsiteName.value.trim();
      state.notWorkingConfirmedUrl = currentUrl || '__confirmed__';
      state.previousWebsiteStatus = 'Not Working';
      updateWebsiteStatusVisuals();
      showToast('Website marked as "Not Working". Click Submit to save.', 'warning');
    } else if (context === 'form-submit') {
      const currentUrl = normalizeUrl(inputWebsiteName.value) || `http://www.site-task-${state.completedRecords.length + 1}.com`;
      state.notWorkingConfirmedUrl = currentUrl;
      state.previousWebsiteStatus = 'Not Working';
      updateWebsiteStatusVisuals();
      handleSaveRecord(null, true);
    } else if (context === 'edit-modal') {
      state.editPreviousWebsiteStatus = 'Not Working';
    }
  }

  function cancelNotWorkingModal() {
    const context = state.pendingNotWorkingContext;
    state.pendingNotWorkingContext = null;
    notWorkingConfirmModal.classList.remove('active');

    if (context === 'form-select') {
      const revertTo = state.previousWebsiteStatus && state.previousWebsiteStatus !== 'Not Working'
        ? state.previousWebsiteStatus
        : 'Working';
      selectWebsiteStatus.value = revertTo;
      state.notWorkingConfirmedUrl = null;
      updateWebsiteStatusVisuals();
    } else if (context === 'edit-modal') {
      const revertTo = state.editPreviousWebsiteStatus && state.editPreviousWebsiteStatus !== 'Not Working'
        ? state.editPreviousWebsiteStatus
        : 'Working';
      editWebsiteStatus.value = revertTo;
    }
  }

  // =========================================================================
  // General Action Confirmation Modal (Delete / Clear Data)
  // =========================================================================
  function openActionConfirm({ header = 'Confirmation Required', title = 'Are You Sure?', message, onConfirm }) {
    actionConfirmHeader.textContent = header;
    actionConfirmTitle.textContent = title;
    actionConfirmDesc.textContent = message;
    pendingActionConfirmCallback = onConfirm;
    actionConfirmModal.classList.add('active');
    setTimeout(() => btnActionConfirmOk.focus(), 50);
  }

  function closeActionConfirm(execute) {
    actionConfirmModal.classList.remove('active');
    const cb = pendingActionConfirmCallback;
    pendingActionConfirmCallback = null;
    if (execute && typeof cb === 'function') {
      cb();
    }
  }

  // =========================================================================
  // Data Entry Logic & Queue Progression
  // =========================================================================
  function updateWebsiteStatusVisuals() {
    const val = selectWebsiteStatus.value || 'Working';
    selectWebsiteStatus.classList.remove('status-is-working', 'status-is-notworking', 'status-is-other');
    websiteStatusChip.classList.remove('chip-notworking', 'chip-other');

    if (val === 'Working') {
      selectWebsiteStatus.classList.add('status-is-working');
      websiteStatusChip.textContent = 'Working';
    } else if (val === 'Not Working' || val === 'Domain Expired') {
      selectWebsiteStatus.classList.add('status-is-notworking');
      websiteStatusChip.classList.add('chip-notworking');
      websiteStatusChip.textContent = val;
    } else if (val) {
      selectWebsiteStatus.classList.add('status-is-other');
      websiteStatusChip.classList.add('chip-other');
      websiteStatusChip.textContent = val;
    } else {
      websiteStatusChip.textContent = 'Select';
    }
  }

  function updateQueueNavButtons() {
    const totalPending = state.pendingUrls.length;
    if (btnPrevQueueUrl) btnPrevQueueUrl.disabled = totalPending <= 1;
    if (btnNextQueueUrl) btnNextQueueUrl.disabled = totalPending <= 1;
  }

  function loadNextPendingUrlToForm(targetUrl = null, force = false) {
    if (!force && state.isManualUrl && inputWebsiteName.value.trim() && !targetUrl) {
      return;
    }

    if (targetUrl) {
      state.isManualUrl = false;
      inputWebsiteName.value = targetUrl;
      const idx = state.pendingUrls.indexOf(targetUrl);
      if (idx !== -1) state.currentPendingIndex = idx;
    } else if (state.pendingUrls.length > 0) {
      state.isManualUrl = false;
      if (state.currentPendingIndex >= state.pendingUrls.length || state.currentPendingIndex < 0) {
        state.currentPendingIndex = 0;
      }
      inputWebsiteName.value = state.pendingUrls[state.currentPendingIndex];
    } else {
      inputWebsiteName.value = `http://www.site-task-${state.completedRecords.length + 1}.com`;
    }

    state.notWorkingConfirmedUrl = null;
    state.previousWebsiteStatus = selectWebsiteStatus.value || 'Working';

    const totalPending = state.pendingUrls.length;
    if (totalPending > 0) {
      const currentNum = state.currentPendingIndex + 1;
      formQueueBadge.textContent = `${currentNum} of ${totalPending} Pending`;
    } else {
      formQueueBadge.textContent = 'Queue Empty (0 pending)';
    }
    updateQueueNavButtons();

    if (urlHelpText) {
      if (state.isManualUrl) {
        urlHelpText.textContent = 'Manual URL mode: You can enter and submit any custom website URL.';
        urlHelpText.style.color = '#4338ca';
      } else {
        urlHelpText.textContent = 'Queue URL loaded. You can edit it or click "Enter Manually" to type any URL.';
        urlHelpText.style.color = 'var(--text-muted)';
      }
    }

    if (btnManualUrlMode && btnLoadNextQueueUrl) {
      btnManualUrlMode.classList.toggle('active', state.isManualUrl);
      btnLoadNextQueueUrl.classList.toggle('active', !state.isManualUrl);
    }
  }

  function handleOpenWebsite() {
    let url = inputWebsiteName.value.trim();
    if (!url) {
      showToast('Please enter a Website URL', 'warning');
      return;
    }
    url = normalizeUrl(url);
    inputWebsiteName.value = url;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Opening: ${url}`, 'info');
  }

  function handleCopyUrl() {
    const url = inputWebsiteName.value.trim();
    if (!url) {
      showToast('No Website URL to copy', 'warning');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => showToast(`Copied: ${url}`, 'success'))
        .catch(() => fallbackCopyText(url));
    } else {
      fallbackCopyText(url);
    }
  }

  function fallbackCopyText(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
      showToast(`Copied: ${text}`, 'success');
    } catch {
      showToast('Could not copy URL automatically', 'warning');
    }
    document.body.removeChild(temp);
  }

  // SAVE & SUBMIT RECORD OR UPDATE EXISTING RECORD
  function handleSaveRecord(e, bypassNotWorkingPrompt = false) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let websiteName = inputWebsiteName.value.trim();
    if (!websiteName) {
      websiteName = `http://www.site-task-${state.completedRecords.length + 1}.com`;
    } else {
      websiteName = normalizeUrl(websiteName);
      inputWebsiteName.value = websiteName;
    }

    const websiteStatus = selectWebsiteStatus.value || 'Working';

    // Require confirmation popup if Website Status is "Not Working" and not yet confirmed
    if (
      !bypassNotWorkingPrompt &&
      websiteStatus === 'Not Working' &&
      state.notWorkingConfirmedUrl !== websiteName &&
      state.notWorkingConfirmedUrl !== '__confirmed__'
    ) {
      openNotWorkingConfirmModal('form-submit', websiteName);
      return false;
    }

    const isUnavailableStatus = websiteStatus === 'Not Working' || websiteStatus === 'Domain Expired';
    const businessType = selectBusinessType.value || '';
    const companyProfile = selectCompanyProfile.value || (isUnavailableStatus ? 'Not Available' : '');
    const companyName = inputCompanyName.value.trim() || '';
    const companyAddress = inputCompanyAddress.value.trim() || '';
    const country = inputCountry.value.trim() || '';
    const stateVal = selectState ? (selectState.value || (isUnavailableStatus ? 'Not Available' : '')) : '';
    const cityVal = selectCity ? (selectCity.value || (isUnavailableStatus ? 'Not Available' : '')) : '';
    const email = inputEmail.value.trim() || '';
    const secondaryEmail = inputSecondaryEmail.value.trim() || '';
    const phone = inputPhone.value.trim() || '';
    const productCount = selectProductCount.value || '0';
    const productImage = selectProductImage.value || '0';
    const productDescription = selectProductDescription.value || '0';

    const todayDate = getTodayDateString();
    const isWorking = websiteStatus === 'Working';
    const statusBadge = isWorking ? 'W-Working' : websiteStatus;

    // 1. Check if we are UPDATING an existing record
    if (state.editingRecordId) {
      const idx = state.completedRecords.findIndex(r => r.id === state.editingRecordId);
      if (idx !== -1) {
        state.completedRecords[idx] = {
          ...state.completedRecords[idx],
          url: websiteName,
          websiteStatus,
          statusBadge,
          companyName,
          businessType,
          companyProfile,
          country,
          state: stateVal,
          city: cityVal,
          address: companyAddress,
          email,
          secondaryEmail,
          phone,
          productCount,
          productImage,
          productDescription,
          updatedDate: todayDate
        };
        saveRecordsToStorage();
        exitFormEditMode();
        updateUI();
        renderDashboard();
        renderTrackingTable();
        showToast(`Updated Record & URL: ${websiteName}`, 'success');
        return false;
      }
    }

    // 2. Create new record object
    const newRecord = {
      id: 'rec-' + Date.now(),
      url: websiteName,
      company: state.currentUser.email,
      userName: state.currentUser.username,
      websiteStatus,
      statusBadge,
      companyName,
      businessType,
      companyProfile,
      country,
      state: stateVal,
      city: cityVal,
      address: companyAddress,
      email,
      secondaryEmail,
      phone,
      productCount,
      productImage,
      productDescription,
      completedDate: todayDate
    };

    state.completedRecords.unshift(newRecord);
    saveRecordsToStorage();

    state.todayCompletedCount += 1;
    saveTodayToStorage();

    // Remove from pending queue if matching URL or active queue item
    const existingIndex = state.pendingUrls.findIndex(u => normalizeUrl(u).toLowerCase() === websiteName.toLowerCase());
    if (existingIndex !== -1) {
      state.pendingUrls.splice(existingIndex, 1);
      savePendingToStorage();
    } else if (!state.isManualUrl && state.pendingUrls.length > 0) {
      state.pendingUrls.splice(state.currentPendingIndex, 1);
      savePendingToStorage();
    }

    if (state.currentPendingIndex >= state.pendingUrls.length) {
      state.currentPendingIndex = 0;
    }

    resetFormFields();

    if (state.isManualUrl) {
      inputWebsiteName.value = '';
      inputWebsiteName.focus();
      if (urlHelpText) {
        urlHelpText.textContent = 'Manual URL mode: Ready for next custom website URL.';
      }
    } else {
      loadNextPendingUrlToForm(null, true);
    }

    updateUI();
    renderDashboard();
    renderTrackingTable();
    showToast(`Saved (${statusBadge}): ${websiteName}`, 'success');

    return false;
  }

  function resetFormFields(clearWebsite = false) {
    if (clearWebsite || state.isManualUrl) {
      inputWebsiteName.value = '';
    }
    inputCompanyName.value = '';
    inputCompanyAddress.value = '';
    inputCountry.value = '';
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
    state.previousWebsiteStatus = 'Working';
    state.notWorkingConfirmedUrl = null;
    updateWebsiteStatusVisuals();
  }

  function exitFormEditMode() {
    state.editingRecordId = null;
    state.isManualUrl = false;
    formViewHeading.textContent = 'Data Entry';
    formModeBadge.style.display = 'none';
    btnSubmitForm.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Submit';
    btnSubmitForm.style.background = '';
    btnCancelEdit.style.display = 'none';
    resetFormFields(true);
    loadNextPendingUrlToForm(null, true);
  }

  function openEditRecordModal(recordId) {
    const record = state.completedRecords.find(r => r.id === recordId);
    if (!record) return;

    editRecordId.value = record.id;
    editWebsiteName.value = record.url || '';
    editWebsiteStatus.value = record.websiteStatus || 'Working';
    state.editPreviousWebsiteStatus = editWebsiteStatus.value;
    editBusinessType.value = record.businessType || '';
    editCompanyProfile.value = record.companyProfile || '';
    editCompanyName.value = record.companyName || '';
    editCompanyAddress.value = record.address || '';
    editCountry.value = record.country || '';
    if (editState) editState.value = record.state || '';
    if (editCity) editCity.value = record.city || '';
    editEmail.value = record.email || '';
    editSecondaryEmail.value = record.secondaryEmail || '';
    editPhone.value = record.phone || '';
    editProductCount.value = record.productCount || '0';
    editProductImage.value = record.productImage || '0';
    editProductDescription.value = record.productDescription || '0';

    modalEditIdBadge.textContent = `ID: ${record.id.replace('rec-', '')}`;
    editRecordModal.classList.add('active');
  }

  function handleSaveEditRecordModal() {
    const id = editRecordId.value;
    const idx = state.completedRecords.findIndex(r => r.id === id);
    if (idx === -1) {
      showToast('Record not found', 'warning');
      return;
    }

    let websiteName = editWebsiteName.value.trim();
    if (!websiteName) {
      showToast('Please enter a Website URL', 'warning');
      editWebsiteName.focus();
      return;
    }
    websiteName = normalizeUrl(websiteName);
    editWebsiteName.value = websiteName;

    const websiteStatus = editWebsiteStatus.value || 'Working';
    const isWorking = websiteStatus === 'Working';
    const statusBadge = isWorking ? 'W-Working' : websiteStatus;

    state.completedRecords[idx] = {
      ...state.completedRecords[idx],
      url: websiteName,
      websiteStatus,
      statusBadge,
      companyName: editCompanyName.value.trim(),
      businessType: editBusinessType.value || '',
      companyProfile: editCompanyProfile.value || '',
      country: editCountry.value.trim(),
      state: editState ? editState.value : '',
      city: editCity ? editCity.value : '',
      address: editCompanyAddress.value.trim(),
      email: editEmail.value.trim(),
      secondaryEmail: editSecondaryEmail.value.trim(),
      phone: editPhone.value.trim(),
      productCount: editProductCount.value || '0',
      productImage: editProductImage.value || '0',
      productDescription: editProductDescription.value || '0',
      updatedDate: getTodayDateString()
    };

    saveRecordsToStorage();
    editRecordModal.classList.remove('active');
    renderTrackingTable();
    renderDashboard();
    updateUI();

    showToast(`Website URL and Record updated: ${websiteName}`, 'success');
  }

  // =========================================================================
  // Dashboard UI
  // =========================================================================
  function getStatusCounts() {
    const counts = {
      All: state.completedRecords.length,
      Working: 0,
      'Not Working': 0,
      'Domain Expired': 0,
      Other: 0
    };
    state.completedRecords.forEach(r => {
      if (r.websiteStatus === 'Working') counts.Working += 1;
      else if (r.websiteStatus === 'Not Working') counts['Not Working'] += 1;
      else if (r.websiteStatus === 'Domain Expired') counts['Domain Expired'] += 1;
      else counts.Other += 1;
    });
    return counts;
  }

  function renderDashboardBreakdown() {
    if (!dashboardBreakdownPills) return;
    const counts = getStatusCounts();
    const items = [
      { label: 'Working', filter: 'Working', count: counts.Working, cls: 'pill-working' },
      { label: 'Not Working', filter: 'Not Working', count: counts['Not Working'], cls: 'pill-notworking' },
      { label: 'Domain Expired', filter: 'Domain Expired', count: counts['Domain Expired'], cls: 'pill-expired' },
      { label: 'Other Statuses', filter: 'All', count: counts.Other, cls: 'pill-other' }
    ];

    dashboardBreakdownPills.innerHTML = items.map(item => `
      <button type="button" class="breakdown-pill ${item.cls}" data-status-filter="${escapeHtml(item.filter)}">
        <span>${escapeHtml(item.label)}</span>
        <span class="pill-count">${item.count}</span>
      </button>
    `).join('');
  }

  function renderDashboard() {
    updateUI();
    renderDashboardBreakdown();

    dashboardRecentTbody.innerHTML = '';
    const recents = state.completedRecords.slice(0, 5);

    if (recents.length === 0) {
      dashboardRecentTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 28px;">No completed records yet. Enter data in Data Entry to start tracking!</td></tr>`;
      return;
    }

    recents.forEach(rec => {
      const tr = document.createElement('tr');
      const businessBadge = rec.businessType
        ? `<span class="badge-pill badge-business">${escapeHtml(rec.businessType)}</span>`
        : '<span style="color: var(--text-light);">—</span>';

      tr.innerHTML = `
        <td><a href="${escapeHtml(rec.url)}" target="_blank" rel="noopener noreferrer" class="table-url-link">${escapeHtml(rec.url)}</a></td>
        <td><strong>${escapeHtml(rec.companyName || '—')}</strong></td>
        <td><span class="badge-pill ${getStatusBadgeClass(rec.websiteStatus)}">${escapeHtml(rec.statusBadge || rec.websiteStatus)}</span></td>
        <td>${businessBadge}</td>
        <td>${escapeHtml(rec.country || '—')}</td>
        <td><strong>${escapeHtml(rec.productCount || '0')}</strong></td>
        <td>${escapeHtml(rec.completedDate || '—')}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-icon-action btn-recent-view" data-id="${escapeHtml(rec.id)}" title="View Details">
              <i class="fa-regular fa-eye"></i>
            </button>
            <button type="button" class="btn-icon-action edit-action btn-recent-edit" data-id="${escapeHtml(rec.id)}" title="Edit Record">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
          </div>
        </td>
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
  // Data Tracking Dashboard & Table
  // =========================================================================
  function renderQuickStatusChips() {
    if (!quickStatusChips) return;
    const counts = getStatusCounts();
    const statuses = [
      { value: 'All', label: 'All', count: counts.All },
      { value: 'Working', label: 'Working', count: counts.Working },
      { value: 'Not Working', label: 'Not Working', count: counts['Not Working'] },
      { value: 'Domain Expired', label: 'Domain Expired', count: counts['Domain Expired'] }
    ];

    quickStatusChips.innerHTML = statuses.map(s => `
      <button type="button" class="status-chip-btn ${state.filters.status === s.value ? 'active' : ''}" data-status="${escapeHtml(s.value)}">
        <span>${escapeHtml(s.label)}</span>
        <span class="chip-count">${s.count}</span>
      </button>
    `).join('');
  }

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
          (rec.email && rec.email.toLowerCase().includes(q)) ||
          (rec.phone && rec.phone.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }

  function getAvailabilityBadge(val) {
    if (val === 'Available') return '<span class="badge-pill badge-available">Available</span>';
    if (val === 'Not Available') return '<span class="badge-pill badge-notavailable">Not Available</span>';
    return '<span class="badge-pill badge-neutral">—</span>';
  }

  function getCountBadge(val) {
    const num = parseInt(val || '0', 10);
    const cls = num > 0 ? 'badge-available' : 'badge-neutral';
    return `<span class="badge-pill ${cls}" style="font-size: 11px; padding: 2px 8px;">${escapeHtml(val || '0')}</span>`;
  }

  function renderTrackingTable() {
    renderQuickStatusChips();

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
          <td colspan="16" style="text-align: center; padding: 36px; color: var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px; display: block; opacity: 0.6;"></i>
            ${state.completedRecords.length === 0 ? 'No completed records yet. Fill answers in Data Entry to start!' : 'No records match your filter criteria.'}
          </td>
        </tr>
      `;
    } else {
      pageRecords.forEach(rec => {
        const tr = document.createElement('tr');
        const statusBadgeClass = getStatusBadgeClass(rec.websiteStatus);
        const businessHtml = rec.businessType
          ? `<span class="badge-pill badge-business">${escapeHtml(rec.businessType)}</span>`
          : `<span style="color: var(--text-light);">—</span>`;
        const emailLine = rec.email ? `<div class="contact-line" title="${escapeHtml(rec.email)}"><i class="fa-regular fa-envelope"></i> ${escapeHtml(rec.email)}</div>` : '';
        const phoneLine = rec.phone ? `<div class="contact-line" title="${escapeHtml(rec.phone)}"><i class="fa-solid fa-phone"></i> ${escapeHtml(rec.phone)}</div>` : '';
        const contactHtml = (emailLine || phoneLine) ? `<div class="cell-contact">${emailLine}${phoneLine}</div>` : '<span style="color: var(--text-light);">—</span>';

        tr.innerHTML = `
          <td>
            <a href="${escapeHtml(rec.url)}" target="_blank" rel="noopener noreferrer" class="table-url-link" title="${escapeHtml(rec.url)}">
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
          <td><strong>${escapeHtml(rec.companyName || '—')}</strong></td>
          <td>${businessHtml}</td>
          <td>${getAvailabilityBadge(rec.companyProfile)}</td>
          <td>${escapeHtml(rec.country || '—')}</td>
          <td>${getAvailabilityBadge(rec.state)}</td>
          <td>${getAvailabilityBadge(rec.city)}</td>
          <td>${contactHtml}</td>
          <td class="cell-address" title="${escapeHtml(rec.address || '')}">
            ${escapeHtml(rec.address || '—')}
          </td>
          <td><span style="font-weight: 700;">${escapeHtml(rec.productCount || '0')}</span></td>
          <td>${getCountBadge(rec.productImage)}</td>
          <td>${getCountBadge(rec.productDescription)}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="btn-icon-action btn-view-record" data-id="${escapeHtml(rec.id)}" title="View Details">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button type="button" class="btn-icon-action edit-action btn-edit-record" data-id="${escapeHtml(rec.id)}" title="Edit Record & Website URL">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button type="button" class="btn-icon-action delete-action btn-delete-record" data-id="${escapeHtml(rec.id)}" title="Delete Record">
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
    } else if (currentPage <= 4) {
      pages = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
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
  function buildExportRows(records) {
    return records.map((rec, index) => ({
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
  }

  function exportRecordsToSpreadsheet(records, filePrefix = 'Completed_Website_Data') {
    if (!records || records.length === 0) {
      showToast('No completed records available to export', 'warning');
      return;
    }

    const excelRows = buildExportRows(records);
    const timestamp = getTodayDateString();

    if (typeof XLSX !== 'undefined') {
      try {
        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        worksheet['!cols'] = [
          { wch: 6 }, { wch: 32 }, { wch: 18 }, { wch: 14 }, { wch: 16 },
          { wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 16 },
          { wch: 16 }, { wch: 36 }, { wch: 26 }, { wch: 24 }, { wch: 18 },
          { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 14 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Website Data');
        XLSX.writeFile(workbook, `${filePrefix}_${timestamp}.xlsx`);
        showToast(`Downloaded ${records.length} record${records.length > 1 ? 's' : ''} as Excel (.xlsx)!`, 'success');
        return;
      } catch (err) {
        console.error('SheetJS export error, using CSV fallback', err);
      }
    }

    downloadCsvFallback(excelRows, `${filePrefix}_${timestamp}.csv`);
  }

  function handleExportExcel() {
    exportRecordsToSpreadsheet(getFilteredRecords(), 'Completed_Website_Data');
  }

  function downloadCsvFallback(rows, fileName) {
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
    link.setAttribute('href', url);
    link.setAttribute('download', fileName || `Completed_Website_Data_${getTodayDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${rows.length} record${rows.length > 1 ? 's' : ''} as CSV spreadsheet!`, 'success');
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
            <a href="${escapeHtml(record.url)}" target="_blank" rel="noopener noreferrer" style="color: #7c3aed; text-decoration: underline;">
              ${escapeHtml(record.url)}
            </a>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Company Name</div>
          <div class="detail-value">${escapeHtml(record.companyName || '—')}</div>
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
            ${record.businessType ? `<span class="badge-pill badge-business">${escapeHtml(record.businessType)}</span>` : '—'}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Company Profile</div>
          <div class="detail-value">${getAvailabilityBadge(record.companyProfile)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Country</div>
          <div class="detail-value">${escapeHtml(record.country || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">State &amp; City</div>
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
          <div class="detail-value">${escapeHtml(record.completedDate || '—')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Number of Products</div>
          <div class="detail-value">${escapeHtml(record.productCount || '0')}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Image of Product</div>
          <div class="detail-value">${getCountBadge(record.productImage)}</div>
        </div>
        <div class="detail-item full-width">
          <div class="detail-label">No. of Product Description</div>
          <div class="detail-value">${getCountBadge(record.productDescription)}</div>
        </div>
      </div>
    `;

    recordModal.classList.add('active');
  }

  function renderAssignmentsList(filterQuery = '') {
    assignmentsListContainer.innerHTML = '';
    const q = filterQuery.trim().toLowerCase();
    const filteredEntries = state.pendingUrls
      .map((url, idx) => ({ url, idx }))
      .filter(item => !q || item.url.toLowerCase().includes(q));

    if (state.pendingUrls.length === 0) {
      assignmentsListContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">No pending assignments in queue!</div>`;
      return;
    }

    if (filteredEntries.length === 0) {
      assignmentsListContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">No pending URLs match "${escapeHtml(filterQuery)}".</div>`;
      return;
    }

    filteredEntries.forEach(({ url, idx }) => {
      const item = document.createElement('div');
      item.className = 'assignment-item';
      item.innerHTML = `
        <div style="flex: 1; min-width: 0; padding-right: 10px;">
          <div class="assignment-url" style="word-break: break-all;">${escapeHtml(url)}</div>
          <div class="assignment-index">Task #${idx + 1} of ${state.pendingUrls.length}</div>
        </div>
        <div style="display: flex; gap: 6px; align-items: center; flex: none;">
          <button type="button" class="btn-icon-action edit-action btn-edit-pending-url" data-index="${idx}" title="Edit this pending URL">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button type="button" class="btn-action-purple btn-work-this" data-url="${escapeHtml(url)}" style="padding: 7px 12px; font-size: 12px;">
            <i class="fa-solid fa-arrow-right"></i> Work on This
          </button>
        </div>
      `;
      assignmentsListContainer.appendChild(item);
    });
  }

  function openAssignmentsModal() {
    if (assignmentsSearchInput) assignmentsSearchInput.value = '';
    renderAssignmentsList('');
    assignmentsModal.classList.add('active');
  }

  function openEditPendingUrlModal(index) {
    editPendingIndex.value = String(index);
    editPendingUrlInput.value = state.pendingUrls[index] || '';
    editPendingUrlModal.classList.add('active');
    setTimeout(() => editPendingUrlInput.focus(), 50);
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
    }, 3500);
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================
  function setupEventListeners() {
    navTabs.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.target));
    });

    btnContinueWorking.addEventListener('click', () => switchView('dataEntryView'));
    btnViewAssignments.addEventListener('click', openAssignmentsModal);
    cardTrackingShortcut.addEventListener('click', () => switchView('dataTrackingView'));
    cardLoadDataShortcut.addEventListener('click', openLoadDataModal);
    btnGoToFullTable.addEventListener('click', () => switchView('dataTrackingView'));

    // Dashboard breakdown pills -> jump to tracking filtered by status
    if (dashboardBreakdownPills) {
      dashboardBreakdownPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.breakdown-pill');
        if (!pill) return;
        const statusFilter = pill.dataset.statusFilter || 'All';
        state.filters.status = statusFilter;
        filterWebsiteStatus.value = statusFilter;
        state.pagination.currentPage = 1;
        switchView('dataTrackingView');
      });
    }

    // Dashboard recent table quick View/Edit
    dashboardRecentTbody.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.btn-recent-view');
      if (viewBtn) {
        openRecordModal(viewBtn.dataset.id);
        return;
      }
      const editBtn = e.target.closest('.btn-recent-edit');
      if (editBtn) {
        openEditRecordModal(editBtn.dataset.id);
      }
    });

    // Data Entry URL & Queue Controls
    btnClickHere.addEventListener('click', handleOpenWebsite);
    if (btnCopyUrl) btnCopyUrl.addEventListener('click', handleCopyUrl);

    if (btnPrevQueueUrl) {
      btnPrevQueueUrl.addEventListener('click', () => {
        if (state.pendingUrls.length === 0) return;
        state.isManualUrl = false;
        state.currentPendingIndex = (state.currentPendingIndex - 1 + state.pendingUrls.length) % state.pendingUrls.length;
        resetFormFields(false);
        loadNextPendingUrlToForm(null, true);
      });
    }

    if (btnNextQueueUrl) {
      btnNextQueueUrl.addEventListener('click', () => {
        if (state.pendingUrls.length === 0) return;
        state.isManualUrl = false;
        state.currentPendingIndex = (state.currentPendingIndex + 1) % state.pendingUrls.length;
        resetFormFields(false);
        loadNextPendingUrlToForm(null, true);
      });
    }

    // Website Status change -> show "Confirmation Required" popup if "Not Working"
    selectWebsiteStatus.addEventListener('change', () => {
      const selected = selectWebsiteStatus.value;
      if (selected === 'Not Working') {
        updateWebsiteStatusVisuals();
        openNotWorkingConfirmModal('form-select', inputWebsiteName.value.trim());
      } else {
        state.previousWebsiteStatus = selected || 'Working';
        state.notWorkingConfirmedUrl = null;
        updateWebsiteStatusVisuals();
      }
    });

    // Edit Modal Website Status change -> show "Confirmation Required" popup if changed to "Not Working"
    editWebsiteStatus.addEventListener('change', () => {
      const selected = editWebsiteStatus.value;
      if (selected === 'Not Working' && state.editPreviousWebsiteStatus !== 'Not Working') {
        openNotWorkingConfirmModal('edit-modal', editWebsiteName.value.trim());
      } else {
        state.editPreviousWebsiteStatus = selected || 'Working';
      }
    });

    // "Not Working" Confirmation Modal listeners
    btnNotWorkingConfirmOk.addEventListener('click', confirmNotWorkingModal);
    btnNotWorkingConfirmCancel.addEventListener('click', cancelNotWorkingModal);
    btnCloseNotWorkingModal.addEventListener('click', cancelNotWorkingModal);
    notWorkingConfirmModal.addEventListener('click', (e) => {
      if (e.target === notWorkingConfirmModal) cancelNotWorkingModal();
    });

    // General Action Confirmation Modal listeners
    btnActionConfirmOk.addEventListener('click', () => closeActionConfirm(true));
    btnActionConfirmCancel.addEventListener('click', () => closeActionConfirm(false));
    btnCloseActionConfirm.addEventListener('click', () => closeActionConfirm(false));
    actionConfirmModal.addEventListener('click', (e) => {
      if (e.target === actionConfirmModal) closeActionConfirm(false);
    });

    // Manual URL inputs & queue switching listeners
    inputWebsiteName.addEventListener('input', () => {
      state.isManualUrl = true;
      state.notWorkingConfirmedUrl = null;
      if (btnManualUrlMode && btnLoadNextQueueUrl) {
        btnManualUrlMode.classList.add('active');
        btnLoadNextQueueUrl.classList.remove('active');
      }
      if (urlHelpText) {
        urlHelpText.textContent = 'Custom manual URL. Ready to submit and update tracking.';
        urlHelpText.style.color = '#4338ca';
      }
    });

    btnManualUrlMode.addEventListener('click', () => {
      state.isManualUrl = true;
      state.notWorkingConfirmedUrl = null;
      inputWebsiteName.value = '';
      inputWebsiteName.focus();
      btnManualUrlMode.classList.add('active');
      btnLoadNextQueueUrl.classList.remove('active');
      if (urlHelpText) {
        urlHelpText.textContent = 'Manual URL mode: Type or paste any website URL.';
        urlHelpText.style.color = '#4338ca';
      }
      showToast('Website URL cleared. Type your custom URL manually.', 'info');
    });

    btnLoadNextQueueUrl.addEventListener('click', () => {
      state.isManualUrl = false;
      btnManualUrlMode.classList.remove('active');
      btnLoadNextQueueUrl.classList.add('active');
      loadNextPendingUrlToForm(null, true);
      showToast('Loaded pending URL from queue.', 'info');
    });

    btnCancelEdit.addEventListener('click', () => {
      exitFormEditMode();
      showToast('Edit cancelled. Reverted to normal data entry.', 'info');
    });

    btnSubmitForm.addEventListener('click', handleSaveRecord);

    dataEntryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSaveRecord(e);
      return false;
    });

    btnResetForm.addEventListener('click', () => {
      resetFormFields(state.isManualUrl);
      showToast('Form fields reset', 'info');
    });

    // Tracking Filters & Quick Chips
    if (quickStatusChips) {
      quickStatusChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.status-chip-btn');
        if (!chip) return;
        const statusVal = chip.dataset.status || 'All';
        state.filters.status = statusVal;
        filterWebsiteStatus.value = statusVal;
        state.pagination.currentPage = 1;
        renderTrackingTable();
      });
    }

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

    let searchDebounceTimer = null;
    filterSearchText.addEventListener('input', () => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        state.filters.search = filterSearchText.value.trim();
        state.pagination.currentPage = 1;
        renderTrackingTable();
      }, 200);
    });

    filterSearchText.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        btnApplyFilter.click();
      }
    });

    if (selectPageSize) {
      selectPageSize.addEventListener('change', () => {
        state.pagination.pageSize = parseInt(selectPageSize.value, 10) || 50;
        state.pagination.currentPage = 1;
        renderTrackingTable();
      });
    }

    btnExportExcel.addEventListener('click', handleExportExcel);

    trackingTableBody.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('.btn-view-record');
      if (viewBtn) {
        openRecordModal(viewBtn.dataset.id);
        return;
      }

      const editBtn = e.target.closest('.btn-edit-record');
      if (editBtn) {
        openEditRecordModal(editBtn.dataset.id);
        return;
      }

      const delBtn = e.target.closest('.btn-delete-record');
      if (delBtn) {
        const id = delBtn.dataset.id;
        openActionConfirm({
          header: 'Delete Record',
          title: 'Delete This Record?',
          message: 'Are you sure you want to permanently remove this extracted record?',
          onConfirm: () => {
            state.completedRecords = state.completedRecords.filter(r => r.id !== id);
            saveRecordsToStorage();
            updateUI();
            renderTrackingTable();
            renderDashboard();
            showToast('Record deleted', 'info');
          }
        });
      }
    });

    // Assignments Modal Listeners
    if (assignmentsSearchInput) {
      assignmentsSearchInput.addEventListener('input', () => {
        renderAssignmentsList(assignmentsSearchInput.value);
      });
    }

    assignmentsListContainer.addEventListener('click', (e) => {
      const editPendingBtn = e.target.closest('.btn-edit-pending-url');
      if (editPendingBtn) {
        const idx = parseInt(editPendingBtn.dataset.index, 10);
        openEditPendingUrlModal(idx);
        return;
      }

      const workBtn = e.target.closest('.btn-work-this');
      if (workBtn) {
        const url = workBtn.dataset.url;
        resetFormFields(false);
        loadNextPendingUrlToForm(url, true);
        assignmentsModal.classList.remove('active');
        switchView('dataEntryView');
        showToast(`Loaded ${url} into Data Entry`, 'info');
      }
    });

    // Edit Pending URL Modal Listeners
    btnSavePendingUrl.addEventListener('click', () => {
      const idx = parseInt(editPendingIndex.value, 10);
      const updated = normalizeUrl(editPendingUrlInput.value);
      if (!updated) {
        showToast('Please enter a valid URL', 'warning');
        editPendingUrlInput.focus();
        return;
      }
      if (!Number.isNaN(idx) && state.pendingUrls[idx] !== undefined) {
        state.pendingUrls[idx] = updated;
        savePendingToStorage();
        renderAssignmentsList(assignmentsSearchInput ? assignmentsSearchInput.value : '');
        updateUI();
        if (state.currentPendingIndex === idx && !state.isManualUrl) {
          loadNextPendingUrlToForm(null, true);
        }
        editPendingUrlModal.classList.remove('active');
        showToast('Pending URL updated in queue', 'success');
      }
    });

    btnCloseEditPendingModal.addEventListener('click', () => editPendingUrlModal.classList.remove('active'));
    btnCancelEditPending.addEventListener('click', () => editPendingUrlModal.classList.remove('active'));

    // View Modal listeners
    btnCloseRecordModal.addEventListener('click', () => recordModal.classList.remove('active'));
    btnCloseRecordFooter.addEventListener('click', () => recordModal.classList.remove('active'));
    btnEditFromViewModal.addEventListener('click', () => {
      if (!currentViewingRecord) return;
      const recId = currentViewingRecord.id;
      recordModal.classList.remove('active');
      openEditRecordModal(recId);
    });

    // Edit Modal listeners
    btnEditClickHere.addEventListener('click', () => {
      let url = editWebsiteName.value.trim();
      if (!url) {
        showToast('Please enter a Website URL', 'warning');
        return;
      }
      url = normalizeUrl(url);
      editWebsiteName.value = url;
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast(`Opening: ${url}`, 'info');
    });

    btnSaveEditRecord.addEventListener('click', handleSaveEditRecordModal);
    btnCloseEditModal.addEventListener('click', () => editRecordModal.classList.remove('active'));
    btnCancelEditModal.addEventListener('click', () => editRecordModal.classList.remove('active'));

    // Assignments & Load Data Modals
    btnCloseAssignmentsModal.addEventListener('click', () => assignmentsModal.classList.remove('active'));
    btnCloseAssignmentsFooter.addEventListener('click', () => assignmentsModal.classList.remove('active'));
    btnCloseLoadDataModal.addEventListener('click', () => loadDataModal.classList.remove('active'));
    btnCancelLoadUrls.addEventListener('click', () => loadDataModal.classList.remove('active'));

    btnExportSingleRecord.addEventListener('click', () => {
      if (!currentViewingRecord) return;
      exportRecordsToSpreadsheet([currentViewingRecord], 'Single_Website_Record');
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

      const existingSet = new Set(state.pendingUrls.map(u => normalizeUrl(u).toLowerCase()));
      const newUrls = [];
      raw.split('\n')
        .map(u => normalizeUrl(u))
        .filter(u => u.length > 0)
        .forEach(u => {
          const key = u.toLowerCase();
          if (!existingSet.has(key)) {
            existingSet.add(key);
            newUrls.push(u);
          }
        });

      if (newUrls.length === 0) {
        showToast('All entered URLs are already in the pending queue.', 'warning');
        return;
      }

      state.pendingUrls.push(...newUrls);
      savePendingToStorage();
      updateUI();
      loadDataModal.classList.remove('active');
      showToast(`Added ${newUrls.length} unique URL${newUrls.length > 1 ? 's' : ''} to queue`, 'success');
      loadNextPendingUrlToForm();
    });

    btnClearAllData.addEventListener('click', () => {
      openActionConfirm({
        header: 'Reset All Data',
        title: 'Clear All Completed Records?',
        message: 'This will clear all completed records, reset today\'s counter to 0, and restore the default URL queue.',
        onConfirm: () => {
          localStorage.removeItem(STORAGE_KEY_RECORDS);
          localStorage.removeItem(STORAGE_KEY_PENDING);
          localStorage.removeItem(STORAGE_KEY_TODAY);
          state.completedRecords = [];
          state.todayCompletedCount = 0;
          state.currentPendingIndex = 0;
          state.pendingUrls = typeof SEED_PENDING_URLS !== 'undefined' ? [...SEED_PENDING_URLS] : [];
          saveRecordsToStorage();
          saveTodayToStorage();
          savePendingToStorage();
          updateUI();
          loadDataModal.classList.remove('active');
          renderTrackingTable();
          renderDashboard();
          resetFormFields(false);
          loadNextPendingUrlToForm(null, true);
          showToast('All data cleared. Reset to 0.', 'success');
        }
      });
    });

    // Backdrop click to close standard modals
    [recordModal, assignmentsModal, loadDataModal, editRecordModal, editPendingUrlModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    });

    // Global Keyboard Shortcuts (Escape to close modals, Ctrl+Enter to submit)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (notWorkingConfirmModal.classList.contains('active')) {
          cancelNotWorkingModal();
          return;
        }
        if (actionConfirmModal.classList.contains('active')) {
          closeActionConfirm(false);
          return;
        }
        [editPendingUrlModal, recordModal, editRecordModal, assignmentsModal, loadDataModal].forEach(m => {
          m.classList.remove('active');
        });
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const anyModalOpen = document.querySelector('.modal-overlay.active');
        if (!anyModalOpen && state.activeView === 'dataEntryView') {
          e.preventDefault();
          handleSaveRecord(e);
        }
      }
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
