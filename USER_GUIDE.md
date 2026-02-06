# AI Ticket Management System - User Guide

## 🔐 User Roles & Access

### 1. **User** (Default Role)
All new signups are created as regular users by default.

**Permissions:**
- ✅ Create tickets
- ✅ View their own tickets
- ✅ See ticket status updates
- ❌ Cannot see AI analysis
- ❌ Cannot access Admin Panel
- ❌ Cannot see other users' tickets

**How to Access:**
1. Sign up at `/signup`
2. Automatically assigned "user" role
3. Can view tickets at `/`

---

### 2. **Moderator**
Moderators are assigned by admins and handle tickets based on their skills.

**Permissions:**
- ✅ Create tickets
- ✅ View tickets assigned to them
- ✅ See AI analysis and helpful notes
- ✅ View required skills for tickets
- ❌ Cannot access Admin Panel
- ❌ Cannot manage other users

**How to Become Moderator:**
- An admin must change your role in the Admin Panel

---

### 3. **Admin**
Full system access with user management capabilities.

**Permissions:**
- ✅ Everything a moderator can do
- ✅ Access Admin Panel via navbar
- ✅ View all tickets in the system
- ✅ Manage all users (view, edit roles, edit skills)
- ✅ Change user roles (user ↔ moderator ↔ admin)
- ✅ See complete AI analysis for all tickets

**How to Access Admin Panel:**
1. Log in as an admin
2. Look for "Admin Panel" button in the navbar (next to Logout)
3. Click to go to `/admin`

**How to Create First Admin:**
Since the first user will be created as "user" role, you need to manually update the database:

#### Option 1: Update via MongoDB
```javascript
// Connect to your MongoDB and run:
db.users.updateOne(
  { email: "youremail@example.com" },
  { $set: { role: "admin" } }
)
```

#### Option 2: Update via Backend Code (Temporary)
Add this to your `controller/user.js` in the signup function:
```javascript
// Add this after user creation for your first admin
const user = await UserSchema.create({
    email,
    password: hashed,
    skills,
    role: "admin"  // Add this line temporarily
});
```
Then remove it after creating your admin account.

---

## 🎯 Navigation Guide

### For All Users:
- **Home Page (`/`)** - View your tickets dashboard
- **Login (`/login`)** - Sign in
- **Signup (`/signup`)** - Create account
- **Ticket Details (`/tickets/:id`)** - View specific ticket

### For Admins Only:
- **Admin Panel (`/admin`)** - Manage users and view all tickets
  - Accessible via navbar "Admin Panel" button
  - Protected route - only admin role can access

---

## 🔧 Common Tasks

### Creating Your First Admin
1. Sign up normally: `http://localhost:5173/signup`
2. Connect to MongoDB and update your user:
   ```bash
   mongosh
   use your-database-name
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Refresh the page - you'll see "Admin Panel" button in navbar

### Managing Users (Admin Only)
1. Click "Admin Panel" in navbar
2. Switch to "Manage Users" tab
3. Click "Edit" on any user
4. Change role or skills
5. Click "Save Changes"

### Creating Moderators
1. Go to Admin Panel → Manage Users
2. Find the user you want to promote
3. Click "Edit"
4. Change role to "moderator"
5. Add relevant skills (important for AI ticket assignment!)
6. Click "Save Changes"

---

## 🤖 AI Features

### Automatic Ticket Analysis
When a ticket is created:
1. **AI analyzes** the ticket description
2. **Extracts priority** (high/medium/low)
3. **Identifies required skills**
4. **Generates helpful notes** for moderators
5. **Auto-assigns** to best-matching moderator based on skills

### Viewing AI Analysis
- **Admins & Moderators:** See full AI analysis on ticket details page
- **Users:** See simple confirmation message only

---

## 🚨 Troubleshooting

### "Access denied. Admin only."
- You're trying to access admin panel as non-admin
- Ask an admin to promote you, or update your role in the database

### Inngest Errors
- The system now works even if Inngest is not running
- Tickets/signups will complete successfully
- AI analysis will be skipped (but can be triggered manually later)

### No "Admin Panel" Button
- Check your role: `localStorage.getItem("user")` in browser console
- If role is not "admin", you won't see the button
- Update your role in the database

---

## 📊 Database Schema

### User
```javascript
{
  email: String,
  password: String (hashed),
  role: String (default: "user"), // "user" | "moderator" | "admin"
  skills: [String],
  createdAt: Date
}
```

### Ticket
```javascript
{
  title: String,
  description: String,
  status: String (default: "TODO"), // "TODO" | "IN_PROGRESS" | "DONE"
  priority: String, // "low" | "medium" | "high"
  createdBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  relatedSkill: [String],
  helpfullNotes: String,
  createdAt: Date
}
```

---

## 🎨 UI/UX Features

### Navbar (All Pages Except Login/Signup)
- **Logo & App Name** - Click to go home
- **User Email** - Shows logged-in user
- **Admin Panel** - Only visible to admins
- **Logout** - Sign out

### Status Colors
- 🟡 **TODO** - Yellow
- 🔵 **IN_PROGRESS** - Blue
- 🟢 **DONE** - Green

### Priority Colors
- 🔴 **High** - Red
- 🟠 **Medium** - Orange
- 🟢 **Low** - Green

---

**Need help?** Check the backend logs or frontend console for error messages.
