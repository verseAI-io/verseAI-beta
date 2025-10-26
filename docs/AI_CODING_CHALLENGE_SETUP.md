# 🤖 AI Coding Challenge - Setup Guide

## 🎯 What's New?

We've added a **NEW AI-Powered Coding Challenge** section to VerseAI! This feature includes:

✅ **3 Coding Questions:**
1. **Customer Order Analytics** (SQL) - Uses your BigQuery data
2. **Longest Substring Without Repeating Characters** (Python)
3. **Valid Parentheses** (Python)

✅ **AI-Powered Features:**
- 🤖 **Gemini AI Hints** - Get hints at 3 levels (Gentle, Specific, Detailed)
- 💡 **Concept Explanations** - Ask AI to explain algorithms, data structures, etc.
- 📝 **Code Review** - Get feedback on your solution
- 🎮 **Character Progression** - Earn XP with Naruto gamification

✅ **Professional Code Editor:**
- Monaco Editor (VS Code engine)
- Syntax highlighting for SQL and Python
- Real-time test execution

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VERSEAI PLATFORM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Landing → Matrix Login → Home Dashboard                   │
│                              │                              │
│                              ├─→ SQL Editor                 │
│                              ├─→ Interview Prep             │
│                              └─→ 🆕 AI Coding Challenge     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express on :5000)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /api/bigquery/*    - BigQuery integration                 │
│  /api/ai/*          - Vertex AI (Gemini Pro)               │
│  /api/gemini/*      - 🆕 Gemini API for hints              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE CLOUD PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • BigQuery - SQL execution (your customer data)           │
│  • Vertex AI - AI-powered SQL generation                   │
│  • Gemini API - Coding hints & explanations                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"**
3. Create a new API key or use an existing one
4. Copy the API key (starts with `AIza...`)

### Step 2: Configure Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Create `.env` file from template:
```bash
cp .env.example .env
```

3. Edit `.env` file and add your credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google Cloud Platform
GCP_PROJECT_ID=project-627b8b21-5a0c-430f-aa1
GCP_CREDENTIALS_PATH=./cred.json
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro

# Gemini API Key (for AI Coding Challenge)
GEMINI_API_KEY=AIza...your-key-here
```

4. Make sure your GCP credentials file exists:
```bash
# Should have your service account credentials
ls -l backend/cred.json
```

### Step 3: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies (from root)
cd ..
npm install
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

You should see:
```
    ╔═══════════════════════════════════════════════╗
    ║   🚀 VerseAI SQL Editor API Server           ║
    ║   Powered by Google BigQuery & Vertex AI     ║
    ╠═══════════════════════════════════════════════╣
    ║   🌐 Server: http://localhost:5000            ║
    ║   💚 Status: ONLINE                           ║
    ║   🔒 Security: Enabled                        ║
    ╚═══════════════════════════════════════════════╝
```

**Terminal 2 - Frontend:**
```bash
npm start
```

Frontend will open at: `http://localhost:3000`

---

## 🎮 How to Use AI Coding Challenge

### 1. Navigation
- Login via Matrix Login
- On Home Dashboard, click **"🤖 AI CODING CHALLENGE"**

### 2. Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Back | Title | Question Navigation (Q1, Q2, Q3)   │
├──────────────────────┬──────────────────────────────────────┤
│  LEFT PANEL          │  RIGHT PANEL                         │
│  (Question Details)  │  (Code Editor & Results)             │
│                      │                                      │
│  • Title             │  ┌─────────────────────────────────┐│
│  • Difficulty        │  │  Monaco Editor (SQL/Python)     ││
│  • Description       │  │                                 ││
│  • Tags              │  │  Write your code here...        ││
│  • Built-in Hints    │  │                                 ││
│  • AI Assistant      │  └─────────────────────────────────┘│
│    - Get Hint        │  ┌─────────────────────────────────┐│
│    - Explain Topics  │  │  Test Results                   ││
│                      │  │  ✓ Test 1: Passed               ││
│                      │  │  ✗ Test 2: Failed               ││
│                      │  └─────────────────────────────────┘│
│                      │  ┌─────────────────────────────────┐│
│                      │  │  Naruto Character Progress      ││
│                      │  │  Level 5 | 250/500 XP           ││
│                      │  └─────────────────────────────────┘│
└──────────────────────┴──────────────────────────────────────┘
```

### 3. Using AI Hints

**Hint Levels:**
- **Level 1 (Gentle)**: Points you in the right direction without revealing solution
- **Level 2 (Specific)**: Suggests specific algorithms or techniques
- **Level 3 (Detailed)**: Provides pseudocode and step-by-step approach

**How to use:**
1. Select hint level from dropdown
2. Click **"Get Hint"**
3. AI Assistant modal will appear with personalized hint
4. Hints are context-aware based on your current code!

**Explain Topics:**
- Click any tag (e.g., "Sliding Window", "Stack")
- AI will explain the concept with examples
- Includes time/space complexity considerations

### 4. Question Details

#### Question 1: Customer Order Analytics (SQL)
- **Difficulty:** Medium
- **XP Reward:** 100
- **Goal:** Find top 5 customers by total order value
- **Uses:** Your BigQuery tables
  - `project-627b8b21-5a0c-430f-aa1.customer_data.customer`
  - `project-627b8b21-5a0c-430f-aa1.customer_data.orders`
  - `project-627b8b21-5a0c-430f-aa1.customer_data.products`

#### Question 2: Longest Substring (Python)
- **Difficulty:** Medium
- **XP Reward:** 100
- **Goal:** Find length of longest substring without repeating characters
- **Techniques:** Sliding window, hash map

#### Question 3: Valid Parentheses (Python)
- **Difficulty:** Easy
- **XP Reward:** 75
- **Goal:** Check if parentheses/brackets are valid and balanced
- **Techniques:** Stack data structure

---

## 🎯 For Supercell Demo

### Demo Flow:

1. **Start at Landing Page**
   - Matrix-themed animations
   - Beta signup form

2. **Matrix Login**
   - Falling code animation
   - Enter the Matrix

3. **Home Dashboard**
   - Show 4 navigation options
   - Highlight new **AI Coding Challenge** button

4. **AI Coding Challenge Demo**
   - Navigate to Question 1 (SQL)
   - Show BigQuery integration
   - Get an AI hint to demonstrate Gemini API
   - Run the query and show results

5. **Character Progression**
   - Show XP earned
   - Demonstrate Naruto level-up animation

### Key Demo Points:

✨ **AI-Powered Learning:**
- Gemini API provides intelligent hints
- Explains complex concepts
- Adapts to user's code

✨ **Real Data Integration:**
- Uses actual BigQuery customer data
- Production-ready SQL execution
- Metadata (execution time, bytes processed)

✨ **Gamification:**
- Naruto character progression
- XP system (50-100 XP per question)
- Rank system (Academy Student → Hokage)

✨ **Professional Code Editor:**
- Monaco Editor (same as VS Code)
- Syntax highlighting
- Auto-completion

---

## 📊 API Endpoints Reference

### Gemini API Routes (`/api/gemini/*`)

#### Get Hint
```javascript
POST /api/gemini/hint
{
  "questionTitle": "Valid Parentheses",
  "questionDescription": "Given a string s...",
  "userCode": "def isValid(s):\n    ...",
  "hintLevel": 2  // 1, 2, or 3
}

Response:
{
  "success": true,
  "hint": "Consider using a stack data structure...",
  "hintLevel": 2
}
```

#### Explain Concept
```javascript
POST /api/gemini/explain
{
  "topic": "Sliding Window",
  "questionContext": "Finding longest substring..."
}

Response:
{
  "success": true,
  "explanation": "Sliding window is a technique..."
}
```

#### Review Code
```javascript
POST /api/gemini/review-code
{
  "code": "def isValid(s):\n    ...",
  "language": "python",
  "questionDescription": "Valid parentheses problem"
}

Response:
{
  "success": true,
  "review": "Your solution looks good! However..."
}
```

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check if .env file exists
cat backend/.env

# Check if Gemini API key is set
grep GEMINI_API_KEY backend/.env

# Install dependencies
cd backend && npm install
```

### AI Hints not working
- ✅ Check Gemini API key is valid
- ✅ Check backend is running on port 5000
- ✅ Check browser console for errors
- ✅ Verify API quota isn't exceeded

### BigQuery queries failing
- ✅ Check GCP credentials (`backend/cred.json`)
- ✅ Verify project ID in `.env` matches your GCP project
- ✅ Check table names are correct
- ✅ Ensure service account has BigQuery permissions

### Character not appearing
- ✅ Check if `naruto-character.png` exists in `public/` folder
- ✅ Verify NarutoCharacter component is imported
- ✅ Check browser console for image load errors

---

## 🎨 Customization

### Add More Questions

Edit `/src/data/codingQuestions.json`:

```json
{
  "id": 4,
  "title": "Your New Question",
  "slug": "your-new-question",
  "difficulty": "Easy",
  "category": "Python",
  "xpReward": 50,
  "description": "Question description...",
  "hints": ["Hint 1", "Hint 2"],
  "starterCode": "def solution():\n    pass",
  "language": "python",
  "tags": ["Array", "Two Pointers"],
  "testCases": [
    {
      "id": 1,
      "input": "test input",
      "expected": "expected output",
      "description": "Test case description"
    }
  ]
}
```

### Add More Characters

Currently supports: Naruto, SpiderMan, ShaktiMaan

To add more:
1. Create new character component in `src/`
2. Update character selection logic
3. Define character-specific abilities

---

## 📝 Questions Data Structure

All questions are stored in `/src/data/codingQuestions.json`:

- **Question 1**: SQL using your BigQuery tables
- **Question 2**: Python - Longest Substring
- **Question 3**: Python - Valid Parentheses

You can add more questions by editing this JSON file!

---

## 🚀 Next Steps

1. ✅ Install PostgreSQL (for future user data persistence)
2. ✅ Add more coding questions
3. ✅ Implement leaderboard
4. ✅ Add character selection screen
5. ✅ Deploy to GCP Cloud Run

---

## 🎯 Summary

You now have a fully functional **AI-Powered Coding Challenge Platform** with:
- 3 questions (1 SQL, 2 Python)
- Gemini AI integration for hints
- BigQuery integration for SQL execution
- Character progression with Naruto
- Professional Monaco editor

**For your Supercell demo, this showcases:**
- Modern full-stack architecture
- GCP integration (BigQuery + Gemini AI)
- Gamification for learning
- Real-time code execution
- AI-powered educational features

Good luck with your demo! 🚀
