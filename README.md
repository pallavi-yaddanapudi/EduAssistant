# 🎓 EduAssistant

**Smart Academic Assistance Platform**

EduAssistant is an AI-powered educational platform that helps students improve their writing, analyze grammar, generate summaries, and securely upload documents for teacher verification. The platform provides an intuitive workspace for both students and teachers with role-based access and a modern user interface.

---

## 🚀 Core Features

### 👨‍🎓 Student Panel

* Generate essays with customizable word limits
* AI-powered grammar checking and correction
* Automatic essay summarization
* Securely upload assignment documents
* View uploaded documents and profile

### 👩‍🏫 Teacher Panel

* View documents uploaded by all students
* Verify and manage submitted assignments
* Access student submissions in one place

---

## ⚙️ Platform Capabilities

* AI-assisted essay writing
* Grammar analysis with correction suggestions
* Automatic text summarization
* Secure document upload and storage
* Role-based authentication using JWT
* Responsive interface built with React and Tailwind CSS

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React.js (Vite), Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT, BCrypt |
| Deployment | Frontend – Vercel • Backend – Render |

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/pallavi-yaddanapudi/EduAssistant.git
cd EduAssistant
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup

(Open a new terminal)

```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Run Application

Open your browser:

```
http://localhost:5173
```

---

## 📁 Project Structure

```
EduAssistant
├── backend
│   ├── config
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   └── utils
│   └── package.json
│
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

```

---

## 📌 Key Learning Highlights

* Built a complete MERN stack application
* Implemented secure JWT authentication
* Integrated AI-powered essay generation and summarization
* Developed grammar analysis and correction features
* Built secure document upload functionality
* Designed a responsive and user-friendly interface
* Implemented role-based access for students and teachers

---

## Contact

**Pallavi Yaddanapudi**

📧 **Email:** yaddanapudipallavi101@gmail.com

💼 **GitHub:** https://github.com/pallavi-yaddanapudi
