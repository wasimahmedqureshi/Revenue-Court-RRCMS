# RCCMS - Revenue Court Computerized Management System

🏛️ **Assistant Collector (Fastrack), Niwai**  
📍 Government of Rajasthan

## 🌐 Live Demo

This is a **static HTML/CSS/JS** web application that runs entirely in the browser. No server required!

**GitHub Pages URL:** `https://yourusername.github.io/RCCMS/`

## 📁 Files to Upload on GitHub

| File | Purpose | Required |
|------|---------|----------|
| `index.html` | Main HTML structure | ✅ Yes |
| `style.css` | All styling & responsive design | ✅ Yes |
| `data.js` | Pre-loaded data from text files | ✅ Yes |
| `script.js` | All JavaScript functionality | ✅ Yes |
| `README.md` | This documentation file | ✅ Yes |
| `Total-files.txt` | Original data file (optional) | ❌ Optional |
| `Disposal-Files.txt` | Original data file (optional) | ❌ Optional |

## 📊 Pre-loaded Data

- **Total Registrations:** 1,043 files
- **Total Disposals:** 143 files
- **Pending Files:** 900 files

## 🚀 How to Deploy on GitHub Pages

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and login
2. Click **New Repository**
3. Name it: `RCCMS` (or any name)
4. Make it **Public**
5. Click **Create Repository**

### Step 2: Upload Files
**Option A - Direct Upload:**
1. Click **"Add file" → "Upload files"**
2. Upload these 5 files: `index.html`, `style.css`, `data.js`, `script.js`, `README.md`
3. Click **"Commit changes"**

**Option B - Using Git (Recommended):**
```bash
git clone https://github.com/yourusername/RCCMS.git
cd RCCMS
# Copy all 5 files here
git add .
git commit -m "Initial RCCMS portal"
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to repository **Settings**
2. Scroll down to **Pages** section
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch and **/(root)** folder
5. Click **Save**
6. Wait 2-3 minutes
7. Your site will be live at: `https://yourusername.github.io/RCCMS/`

## 🎯 Features

### 1. 📊 Dashboard
- Real-time statistics
- Age-wise pending analysis with visual bars
- Stream-wise (Dhara) breakdown
- Year-wise analysis

### 2. 📝 File Registration
- Add new RRCMS files
- Fields: RRCMS No, Reg Date, Stream (Dhara), Reg Year, Applicant, Village
- Edit/Delete existing files

### 3. ✅ File Disposal
- Dispose pending files
- Auto-populates file details
- Disposal types: Decided, Rejected, Withdrawn, Transferred, Settled
- Undo disposal option

### 4. 📋 Pending Files Report
- Complete pending files list
- Filters: Stream, Year, Age Category, Search
- Export to CSV
- Print-friendly format

### 5. 📈 MPR Report (Monthly Progress Report)
- Government format report
- Date range selection
- Age-wise breakup: Upto 6 Months to >40 Years
- Export to CSV

### 6. 📥 Import/Export
- Upload new Total Files data
- Upload new Disposal data
- Export complete backup (JSON)
- Clear all data

## 💾 Data Storage

All data is stored in **Browser LocalStorage**:
- Persists across browser sessions
- No internet required after first load
- Data survives page refreshes
- Export anytime for backup

## 📱 Responsive Design

Works on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📟 Tablets

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling & Animations
- **JavaScript (ES6)** - Logic & Data Processing
- **LocalStorage API** - Data Persistence
- **GitHub Pages** - Free Hosting

## 📞 Support

For any issues or questions:
- Check browser console for errors (F12)
- Clear browser cache and reload
- Export data before clearing

## 📄 License

Government of Rajasthan - Revenue Department
