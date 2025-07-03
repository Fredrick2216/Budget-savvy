<div align="center">

# 🌌 Budget Savvy
### *Your Personal Finance Command Center in the Stars* ✨

<img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&size=24&duration=3000&pause=1000&color=9F7AEA&center=true&vCenter=true&multiline=true&width=600&height=100&lines=Track+%E2%80%A2+Analyze+%E2%80%A2+Optimize;Your+Financial+Journey+Starts+Here" alt="Typing SVG" />

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Stellar%20Experience-blueviolet?style=for-the-badge&logo=rocket)](https://stellar-budget-tracker-galaxy-git-main-fredrick2216s-projects.vercel.app/)


---

</div>

## 🎯 **What is Budget Savvy?**

Budget Savvy is a **next-generation personal finance management platform** that transforms the way you interact with money. Built with cutting-edge web technologies and a stunning **space-themed UI**, it provides intelligent insights into your spending habits while making budgeting an engaging, visual experience.

<div align="center">

### 🌟 **Experience the Future of Financial Management**

```
┌─────────────────────────────────────────────────────────────┐
│  💰 Smart Expense Tracking  │  📊 AI-Powered Analytics      │
│  🎯 Goal Setting & Progress │  🔄 Multi-Currency Support   │
│  📱 Receipt Scanning       │  🎨 Customizable Themes      │
│  💳 Debt Management        │  📈 Financial Goal Tracking  │
└─────────────────────────────────────────────────────────────┘
```

</div>

---

## 🚀 **Key Features**

<table>
<tr>
<td width="50%">

### 🔐 **Authentication & Security**
- 🛡️ Secure Supabase Authentication
- 👤 User Profile Management
- 🔒 Encrypted Data Storage
- 🎨 Personalized Themes

### 💰 **Expense Management**
- 📝 Smart Expense Categorization
- 📊 Real-time Spending Analysis
- 📅 Date-range Filtering
- 💱 Multi-currency Support

### 🎯 **Budget Planning**
- 📈 Dynamic Budget Creation
- ⚡ Real-time Budget Tracking
- 🚨 Smart Spending Alerts
- 📋 Category-wise Breakdown

</td>
<td width="50%">

### 📱 **Smart Features**
- 🔍 AI-Powered Receipt Scanner
- 🎯 Financial Goal Tracker
- 💳 Comprehensive Debt Manager
- 📊 Advanced Analytics Dashboard

### 📊 **Visualizations**
- 🎨 Interactive Charts & Graphs
- 🌈 Beautiful Data Presentations
- 📈 Trend Analysis
- 🔄 Real-time Updates

### 🎨 **User Experience**
- 🌌 Immersive Space Theme
- 📱 Fully Responsive Design
- ⚡ Lightning-fast Performance
- 🎭 Multiple Theme Options

</td>
</tr>
</table>

---

## 💻 **Tech Stack**

<div align="center">

### **Frontend Technologies**
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### **UI Components & Styling**
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=recharts&logoColor=white)

### **Backend & Database**
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

### **Deployment & Tools**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

</div>

---

## 🎨 **Visual Showcase**

<div align="center">

### 🌌 **Galaxy Theme Dashboard**
<img src="https://github.com/user-attachments/assets/b64cf482-86c1-4439-893a-c3a2d52e01e5" alt="Galaxy Theme Dashboard" width="800px" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(159, 122, 234, 0.3);">

### 🌊 **Nebula Theme Interface**
<img src="https://github.com/user-attachments/assets/a73a4ddb-1623-436f-b0bd-10e875dae0d8" alt="Nebula Theme Interface" width="800px" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(56, 178, 172, 0.3);">

</div>

---

## 🚀 **Quick Start Guide**

### 📋 **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### ⚡ **Installation**

```bash
# 🎯 Step 1: Clone the stellar repository
git clone https://github.com/Fredrick2216/Full-stack-project---Budget-Savvy.git

# 🚀 Step 2: Navigate to project directory  
cd Full-stack-project---Budget-Savvy

# 📦 Step 3: Install dependencies
npm install

# 🔧 Step 4: Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# ✨ Step 5: Launch the application
npm run dev
```

### 🌐 **Environment Setup**

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📊 **Database Schema**

<details>
<summary>🔍 <strong>Click to expand database structure</strong></summary>

```sql
-- 👤 User Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  theme TEXT DEFAULT 'galaxy',
  preferred_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 💰 Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2),
  category TEXT,
  item TEXT,
  date DATE,
  currency TEXT DEFAULT 'USD'
);

-- 🎯 Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  category TEXT,
  amount DECIMAL(10,2),
  period TEXT,
  start_date DATE
);

-- 🏆 Financial Goals
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  target_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date DATE,
  category TEXT
);

-- 💳 Debt Tracking
CREATE TABLE debts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  total_amount DECIMAL(10,2),
  current_balance DECIMAL(10,2),
  interest_rate DECIMAL(5,2),
  minimum_payment DECIMAL(10,2)
);
```

</details>

---

## 🎯 **Project Structure**

```
src/
├── 🎨 components/           # Reusable UI components
│   ├── ui/                 # Shadcn/UI components
│   ├── Dashboard.tsx       # Main dashboard
│   ├── ExpenseForm.tsx     # Expense tracking
│   ├── BudgetForm.tsx      # Budget management
│   └── ...
├── 🧠 contexts/            # React context providers
│   └── ThemeContext.tsx    # Theme management
├── 🎣 hooks/               # Custom React hooks
├── 🔧 integrations/        # Third-party integrations
│   └── supabase/          # Database integration
├── 📄 pages/              # Application pages
└── 🎨 styles/             # Global styles
```

---

## 🌟 **Features in Detail**

<div align="center">

### 🎯 **Smart Expense Tracking**
Track expenses with AI-powered categorization, receipt scanning, and real-time insights.

### 📊 **Advanced Analytics**
Beautiful charts and graphs powered by Recharts for comprehensive financial analysis.

### 🎨 **Multiple Themes**
Choose from Galaxy, Nebula, and Cosmic themes for a personalized experience.

### 💱 **Multi-Currency Support**
Track expenses in multiple currencies with real-time conversion rates.

### 🔍 **Receipt Scanner**
AI-powered receipt scanning for effortless expense entry.

</div>

---

## 🤝 **Contributing**

We welcome contributions from the community! Here's how you can help:

### 🚀 **Getting Started**

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💫 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

### 📝 **Contribution Guidelines**

- Follow TypeScript best practices
- Maintain consistent code styling
- Write comprehensive tests
- Update documentation as needed

---

## 👨‍💻 **Developer**

<div align="center">

### **Fredrick**
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Fredrick2216)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](#)

*"Building the future of personal finance, one commit at a time."*

</div>

---

## 📞 **Support**

<div align="center">

### Need Help? 

[![Issues](https://img.shields.io/badge/Report%20Issues-GitHub-red?style=for-the-badge&logo=github)](https://github.com/Fredrick2216/Budget-savvy/issues)
[![Documentation](https://img.shields.io/badge/Documentation-Wiki-blue?style=for-the-badge&logo=gitbook)](#)

</div>

---

<div align="center">

### 🌟 **Star this repository if you found it helpful!**

[![Star](https://img.shields.io/github/stars/Fredrick2216/Full-stack-project---Budget-Savvy?style=social)](https://github.com/Fredrick2216/Full-stack-project---Budget-Savvy)

---

**Made with 💜 by Fredrick | Powered by ⚡ Supabase & 🚀 Vercel**

<img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&size=16&duration=3000&pause=1000&color=9F7AEA&center=true&vCenter=true&width=400&lines=Thank+you+for+visiting!;Happy+Budgeting!+🌌" alt="Thanks" />

</div>
