# SkillSync – AI-Powered Ticket Management System

SkillSync is a full-stack ticket management platform that uses AI to automatically triage support tickets, assign them to the most suitable moderator, and notify stakeholders via email — all driven by event-based background workflows.

---

## ✨ Features

- **AI Ticket Triage** — Powered by Google Gemini 2.5 Flash via Inngest Agent Kit. Every new ticket is automatically analyzed for priority, required skills, and helpful resolution notes.
- **Smart Assignment** — Tickets are matched and assigned to moderators whose skill sets align with the ticket's required skills.
- **Role-Based Access Control** — Three roles: `user`, `moderator`, and `admin`, each with distinct permissions.
- **Email Notifications** — Welcome emails on signup and assignment emails on ticket creation, sent via Nodemailer.
- **Event-Driven Workflows** — Background jobs are orchestrated with [Inngest](https://www.inngest.com/), providing automatic retries and durable execution.
- **Admin Panel** — Admins can manage all users, update roles, and view all tickets.

---

## 🗂️ Project Structure

```
SkillSync-AI_AGENT/
├── ai-ticket-assistant/      # Node.js / Express backend
│   ├── controller/           # Route handlers (user, ticket)
│   ├── inngest/              # Inngest client & background functions
│   │   └── functions/
│   │       ├── on-signup.js      # Sends welcome email on user signup
│   │       └── on-ticket-create.js # AI triage + assignment + email
│   ├── middlewares/          # Auth middleware (JWT)
│   ├── models/               # Mongoose schemas (User, Ticket)
│   ├── routes/               # Express route definitions
│   ├── utils/
│   │   ├── ai.js             # Gemini AI ticket analysis
│   │   └── mailer.js         # Nodemailer email helper
│   └── index.js              # Server entry point
│
├── ai-ticket-frontend/       # React + Vite frontend
│   └── src/
│       ├── components/       # Navbar, Layout, Auth guard
│       └── pages/            # Login, Signup, Tickets, Ticket, Admin
│
└── USER_GUIDE.md             # Role & usage reference
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, DaisyUI, React Router v7 |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| AI | Google Gemini 2.5 Flash (via `@inngest/agent-kit`) |
| Background Jobs | Inngest |
| Auth | JWT + bcrypt |
| Email | Nodemailer |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB instance (local or Atlas)
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))
- SMTP credentials for email (e.g. Gmail with an App Password)

---

### 1. Clone the repository

```bash
git clone https://github.com/Debjitvk18/SkillSync-AI_AGENT.git
cd SkillSync-AI_AGENT
```

---

### 2. Backend setup

```bash
cd ai-ticket-assistant
npm install
```

Create a `.env` file based on the example:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/skillsync

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

Start the backend:

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

---

### 3. Inngest dev server (background jobs)

In a separate terminal inside `ai-ticket-assistant/`:

```bash
npm run inngest-dev
```

This starts the Inngest dev server at `http://localhost:8288`, which processes background events like ticket analysis and email delivery.

---

### 4. Frontend setup

```bash
cd ../ai-ticket-frontend
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 User Roles

| Role | Description |
|------|-------------|
| `user` | Default role. Can create and view their own tickets. |
| `moderator` | Can view assigned tickets and AI analysis. |
| `admin` | Full access: manage users, view all tickets, change roles. |

### Creating the first Admin

All signups default to the `user` role. Promote your first admin manually via MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Once promoted, the **Admin Panel** button will appear in the navbar.

---

## 🤖 How AI Triage Works

When a ticket is created, Inngest fires the `ticket/create` event and runs these steps:

1. **Fetch ticket** from MongoDB
2. **AI analysis** — Gemini analyzes the ticket and returns:
   - `summary` — Short description of the issue
   - `priority` — `low`, `medium`, or `high`
   - `helpfulNotes` — Technical guidance and external resources for moderators
   - `relatedSkills` — Array of skills needed (e.g. `["React", "MongoDB"]`)
3. **Update ticket** with AI output (priority, notes, skills, status → `IN_PROGRESS`)
4. **Assign moderator** — Finds a moderator whose skills match `relatedSkills`; falls back to admin if none found
5. **Send email** — Notifies the assigned moderator

---

## 📊 Data Models

### User
```js
{
  email: String,          // unique
  password: String,       // bcrypt hashed
  role: String,           // "user" | "moderator" | "admin"
  skills: [String],
  createdAt: Date
}
```

### Ticket
```js
{
  title: String,
  description: String,
  status: String,         // "TODO" | "IN_PROGRESS" | "DONE"
  priority: String,       // "low" | "medium" | "high"
  createdBy: ObjectId,    // ref: User
  assignedTo: ObjectId,   // ref: User
  relatedSkill: [String],
  helpfullNotes: String,
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🖥️ API Endpoints

### Auth (`/api/users`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login and receive JWT |

### Tickets (`/api/tickets`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ | Get tickets (own for user, assigned for moderator, all for admin) |
| POST | `/` | ✅ | Create a new ticket |
| GET | `/:id` | ✅ | Get a specific ticket |
| PATCH | `/:id` | ✅ Admin/Mod | Update ticket status |

---

## 🏗️ Building for Production

**Backend** — runs directly with Node.js:
```bash
cd ai-ticket-assistant && npm start
```

**Frontend** — build and serve the static files:
```bash
cd ai-ticket-frontend
npm run build
# Serve the `dist/` folder with any static file server
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Access denied. Admin only." | Your role is not `admin`. Update via MongoDB. |
| AI analysis not running | Ensure the Inngest dev server is running (`npm run inngest-dev`). |
| No "Admin Panel" button | Check `localStorage.getItem("user")` in browser console — role must be `"admin"`. |
| Emails not sending | Verify `EMAIL_USER` / `EMAIL_PASS` in `.env`. Use an App Password for Gmail. |
| MongoDB connection error | Check that `MONGO_URI` is correct and your MongoDB instance is running. |

---

## 📄 License

This project is licensed under the ISC License.
