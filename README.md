# 📘 Personal Productivity Tracker

A minimal yet powerful full-stack web application designed to track daily execution, maintain consistency, and measure long-term progress.

Built with a focus on **simplicity, speed, and real-world usability** — not overengineering.

---

# 🚀 Overview

This application acts as a **daily operating system for personal productivity**.

It helps you:
- plan your day with structured tasks  
- track completion and consistency  
- carry forward unfinished work  
- measure weekly performance  
- manage long-term goals  
- visualize productivity trends  

---

# 🧠 Core Philosophy

- Low friction > complexity  
- Consistency over perfection  
- Daily execution drives long-term success  
- Built for real daily usage — not just a demo  

---

# ✨ Features

## 🗓️ Daily System (Core Feature)

### Task Types
- **Personal Tasks** → recurring daily habits  
- **Weekday Template Tasks** → weekday-specific routines  
- **Extra Tasks** → ad-hoc tasks added during the day  

### Capabilities
- Add / Edit / Delete extra tasks  
- Inline task editing  
- Checkbox-based completion tracking  
- Real-time end-of-day countdown timer  

### Task Grouping
- Personal  
- Template  
- Extra  
- Moved  

### Completion Tracking
Daily completion %:

completed / total active tasks


### End-of-Day Flow
- Move incomplete tasks to next day (carry-over)  
- Or discard them  

Tracks:
- `endOfDayProcessed`
- `endOfDayAction`

---

## 🔁 Carry-Over System

- Incomplete tasks can be moved to the next day  
- Original task is marked:

status: "moved"

- New task is created:

type: "extra"
carryOver: true


---

## 📅 Weekly System

- Weekly reset cycle (Monday → Sunday)

Tracks:
- Task completion %
- Daily consistency %

### Weekly Score Formula

Weekly Score = (Task Completion % * 0.7) + (Daily Consistency % * 0.3)


---

## 🎯 Goals System

### Supported Types
1. **Monthly Goals**
2. **6-Month Goals**

### Features
- Progress tracking (0–100%)
- Editable anytime
- Status indicators:
  - On Track
  - At Risk
  - Overdue
  - Completed

### 🧾 Goal History
Tracks every change:
- field changed  
- old value → new value  
- timestamp  

---

## 📊 Analytics

### Trends
- Daily completion (line chart)
- Weekly score (line chart)

### Insights
- Task composition (pie chart)
- Weekly score breakdown (bar chart)

### Metrics
- Average daily completion  
- Current & best streak  
- Success vs missed days  
- Best daily performance  
- Average weekly score  

---

## 🔔 UX Enhancements

- Inline editing for fast updates  
- Toast feedback system  
- Keyboard-friendly interactions  
- Auto-focus for rapid task entry  
- Visual badges:
  - Personal
  - Template
  - Extra
  - Carry-over
  - Moved  

---

# 🏗️ Tech Stack

## Frontend
- React (Vite)
- Zustand
- Axios
- Recharts

## Backend
- Node.js
- Express

## Database
- MongoDB
- Mongoose

---

# 🧩 Architecture Overview

## Core Collections

### DailyEntry
- date
- tasks[]
- completionPercentage
- endOfDayProcessed
- endOfDayAction

### Task Structure
- text  
- done  
- status (active / completed / moved)  
- movedToDate  
- type (personal / template / extra)  
- carryOver  
- order  

### Other Collections
- PersonalTasks  
- DailyTemplate  
- WeeklyPlan  
- Goals  
- GoalHistory  

---

# 🔄 Key Workflows

## Daily Entry Generation
1. Load personal tasks  
2. Load weekday template tasks  
3. Combine into DailyEntry  
4. Persist in DB  

## End-of-Day Processing
1. Identify incomplete tasks  
2. Either:
   - carry forward  
   - or discard  
3. Mark current day as processed  
4. Prevent duplicate execution  

---

# ⚡ API Overview

### Daily APIs

GET /api/daily/:date
POST /api/daily
PATCH /api/daily/task/:entryId/:taskId
POST /api/daily/:entryId/tasks
PATCH /api/daily/:entryId/tasks/:taskId
DELETE /api/daily/:entryId/tasks/:taskId
POST /api/daily/end-of-day


---

# 📁 Project Structure


productivity-tracker/
│
├── client/ # React (Vite)
│ ├── components/
│ ├── pages/
│ ├── store/
│ ├── api/
│ └── styles/
│
├── server/ # Node + Express
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── services/
│ └── config/


---

# 🧪 How to Run

Backend
```bash
cd server
npm install
npm run dev

Frontend
cd client
npm install
npm run dev

🔒 Data Integrity & Safeguards
Prevent duplicate end-of-day execution
Input validation on tasks
Controlled editing (only allowed where valid)
Consistent ordering using order field

📌 Roadmap
Completed
Daily tracking system
Weekly scoring system
Goals + history tracking
Analytics dashboard
Chart visualizations
Backend validation & hardening

Upcoming
🔐 OAuth2 (Google login)
👤 User profiles
🧑‍🤝‍🧑 Multi-user support
☁️ Deployment (Vercel + Render + MongoDB Atlas)
📅 Calendar integration

💡 What Makes This Project Unique
Not just CRUD — models real productivity behavior
Implements a complete daily execution system
Focuses on:
clarity
speed
repeat usability
Designed for real-world use, not just demonstration

🧑‍💻 Author

Built as a practical full-stack system to improve:
execution discipline
consistency tracking
long-term goal alignment

⭐ Final Note

This project demonstrates:

full-stack system design
real-world UX thinking
state management
data modeling
production-like workflow handling