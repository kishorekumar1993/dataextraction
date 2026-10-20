# WebData Pro - Data Entry & Tracking Portal

A web application for website intelligence, data extraction, validation workflows, and tracking with instant **Excel (.xlsx)** export capabilities. Built with clean HTML, CSS, and JavaScript.

---

## 🌟 Key Features

### 1. Data Entry Form (Matching Screenshots 1, 2, 3)
- **3-Column Grid Layout** faithful to the original interface.
- **Website Name** with dedicated **`click here`** cyan button to immediately preview and open the website in a new browser tab.
- **Website Status Dropdown** with options:
  - `Working`, `Not Working`, `Domain Expired`, `Non English`, `Under Construction`, `Flash Site`, `Redirect Site`.
- **Business Type Dropdown** with options:
  - `Manufacturer`, `Industrial Services`, `Exporter`, `Trader`, `Distributer`, `Supplier`, `Wholesaler`, `Service Provider`, `Online Shopping`, `Restricted Site`, `Other`.
- **Product Details Specification**:
  - **Number of Product**: Select count (`0`, `1`, `2`, `3`, `4`, `5`, `6-10`, `11-20`, `21-50`, `50+`).
  - **Image Product**: `Available` / `Not Available`.
  - **No. of Product Description**: `Available` / `Not Available`.
  - **Company Profile**: `Available` / `Not Available`.
- **Company Info Fields**: Company Name, Company Address (resizable textarea), Country, State, City, Primary Email, Secondary Email, Phone Number.
- **Form Actions**:
  - **Submit Button** (Green): Validates fields, saves record to database, increments counts, decrements pending assignments, shows success notification, and auto-loads the **next pending website URL**!
  - **Reset Button** (Coral/Red): Resets form inputs to default values.

---

### 2. User Dashboard (Matching Screenshot 4)
- **User Profile Header**: Displays `kishore@01` & `kishore@admin` with breadcrumb navigation.
- **6 Real-time Stat Cards**:
  1. `Today Completed URLs`: Dynamic count of URLs processed today.
  2. `Total Completed URLs`: Total extracted records (starts with 416 pre-loaded records) with percentage calculation.
  3. `Pending URLs`: Number of remaining tasks in queue (starts with 34 pending URLs).
  4. `Total Assigned URLs`: Sum of completed + pending (450 total).
  5. `Data Tracking Dashboard`: Quick shortcut to reports & analytics.
  6. `Load Data`: Quick shortcut to import/paste new batches of URLs.
- **Quick Action Bar**:
  - `View My Assignments`: Opens modal showing all pending URLs with a 1-click **"Work on This"** button.
  - `Continue Working`: Instantly opens the Data Entry form with the active pending URL.
- **Recent Completed Records**: Live table previewing the latest extracted entries.

---

### 3. Data Tracking Dashboard (Matching Screenshot 5)
- **Extracted Website Data Table**:
  - Displays URL (clickable purple link), Company Admin, User Name, Website Status (e.g., pink `W-Working` badge), Company Name, Business Type (cyan badge), Company Profile (green `Available` badge), Country, Address, Product Count, Image Status, Description Status, and Action buttons.
- **Advanced Filtering**:
  - Filter by Website Status.
  - Filter by Start Date and End Date.
  - Keyword search across URL, Company, Country, City, Address, and Email.
  - Reset filters button.
- **Information Banner**:
  - Displays dynamic summary: `Showing 1 - 50 of 416 completed records`.
- **Pagination**:
  - 50 records per page with First, Previous, Page Numbers, Next, and Last navigation.
- **Record Inspection Modal**: Click the eye icon on any record to view all details.

---

### 4. Excel Download Feature (`Export Excel`)
- Click the green **`Export Excel`** button in the Tracking Dashboard.
- Generates and downloads a real Excel file (`Extracted_Website_Data_YYYY-MM-DD.xlsx`) containing all columns and filtered records with auto-calculated column widths.
- Includes automatic fallback to standard UTF-8 CSV download so it works in any offline or restricted environment without requiring external software!

---

## 🚀 How to Run the Website

No installation, Node.js, Python, or server required!

1. Open File Explorer and navigate to:
   ```
   d:\Freelancer\New folder (2)\
   ```
2. Double-click **`index.html`** to open it in Google Chrome, Microsoft Edge, Mozilla Firefox, or any modern web browser.
3. Everything runs locally and persists data in your browser's `localStorage`.

---

## 📁 File Structure

```
d:\Freelancer\New folder (2)\
│
├── index.html          # Main HTML structure with 3 views & modals
├── css/
│   └── style.css       # Complete modern stylesheet matching provided screenshots
├── js/
│   ├── data.js         # Dropdown constants, 416 seed completed records & 34 pending URLs
│   └── app.js          # Form handling, queue management, filters, pagination & Excel export
└── README.md           # Documentation & user guide
```
