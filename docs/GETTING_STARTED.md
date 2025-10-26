# 🚀 VerseAI SQL Editor - Quick Start Guide

## What Did We Build?

The **most advanced SQL Editor in the world** with:
- 🤖 AI-powered natural language to SQL conversion (using Google Vertex AI Gemini Pro)
- ⚡ Real-time BigQuery integration for running queries
- 🎨 Matrix-themed UI with stunning animations
- 📊 4-panel layout: Chat, SQL Editor, Results, Metadata
- ✨ VS Code-style Monaco Editor with syntax highlighting

---

## How to Run

### Option 1: Quick Start (Two Terminals)

**Terminal 1 - Backend**:
```bash
cd /Users/georgian/verseai/backend
npm start
```
✅ Backend running on http://localhost:5001

**Terminal 2 - Frontend**:
```bash
cd /Users/georgian/verseai
npm start
```
✅ Frontend running on http://localhost:3000

### Option 2: Single Command (if you prefer)
```bash
# From project root
cd backend && npm start & cd .. && npm start
```

---

## Access the App

1. Open browser: **http://localhost:3000**
2. Navigate: **Landing Page → Matrix Login → Home**
3. Click: **"⚡ LAUNCH SQL EDITOR"** button
4. Start using the AI-powered SQL editor!

---

## How to Use

### 1. Natural Language to SQL

Type in plain English:
```
Show me the top 10 customers by revenue
```

AI will generate:
```sql
SELECT
  customer_id,
  SUM(revenue) as total_revenue
FROM `project.dataset.sales`
GROUP BY customer_id
ORDER BY total_revenue DESC
LIMIT 10
```

### 2. Edit and Run

- Edit the SQL in Monaco Editor (VS Code-style)
- Click **"▶ RUN QUERY"** to execute
- See results in the table below
- View metadata: execution time, bytes processed, cost

### 3. Validate Before Running

Click **"✓ VALIDATE"** to check SQL syntax without running (dry-run)

---

## Project Structure

```
verseai/
├── backend/              ← Node.js/Express API
│   ├── routes/
│   │   ├── bigquery.js   ← BigQuery endpoints
│   │   └── vertexai.js   ← AI endpoints (NL → SQL)
│   ├── server.js         ← Main server
│   ├── cred.json         ← GCP credentials
│   └── .env              ← Config (PORT=5001)
│
├── src/
│   ├── App.js            ← Page routing
│   ├── SQLEditor.jsx     ← ⭐ Main SQL Editor
│   ├── LandingPage.jsx   ← Entry page
│   ├── Login.jsx         ← Matrix login
│   └── Home.jsx          ← Dashboard
│
└── package.json          ← React dependencies
```

---

## API Endpoints

### BigQuery (`/api/bigquery`)
- `POST /query` - Execute SQL query
- `POST /validate` - Validate SQL (dry-run)
- `GET /datasets` - List all datasets
- `GET /datasets/:id/tables` - List tables

### Vertex AI (`/api/ai`)
- `POST /generate-sql` - Natural language → SQL
- `POST /explain-sql` - Explain SQL in plain English
- `POST /optimize-sql` - Get optimization tips
- `POST /chat` - General AI chat

---

## Key Features

✅ **Natural Language Interface**
- Chat-style conversation
- AI understands context
- Generates optimized BigQuery SQL

✅ **Powerful SQL Editor**
- Monaco Editor (same as VS Code)
- Syntax highlighting
- Line numbers & auto-completion

✅ **Query Execution**
- Run queries against BigQuery
- Real-time results
- Execution metadata (time, bytes, cost)

✅ **Matrix-Themed UI**
- Falling Matrix code background
- Neon green (#00ff41) theme
- Smooth framer-motion animations
- Scanning line effects

---

## Configuration

### Backend Environment (backend/.env)
```env
PORT=5001                              # API server port
GCP_PROJECT_ID=amplified-album-473216-a4
GCP_CREDENTIALS_PATH=./cred.json      # Service account
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro            # AI model
```

### Frontend API URL (src/SQLEditor.jsx:6)
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

---

## Troubleshooting

### "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:5001/health

# Should return:
# {"status":"online","message":"VerseAI SQL Editor API is running"}
```

### "Port 5001 already in use"
```bash
# Find process using port
lsof -i :5001

# Kill it
kill -9 <PID>

# Or change port in backend/.env
```

### "BigQuery error"
- Verify `backend/cred.json` exists
- Check GCP project ID in `.env`
- Ensure BigQuery API is enabled in GCP console

---

## Documentation

📖 **Full Documentation**: `SQL_EDITOR_README.md`
📖 **Codebase Guide**: `CLAUDE.md`
📖 **Backend API**: `backend/README.md`

---

## Tech Stack

**Frontend**: React 19, Framer Motion, Monaco Editor, Axios
**Backend**: Node.js, Express, BigQuery SDK, Vertex AI SDK
**Cloud**: Google Cloud Platform (BigQuery + Vertex AI)

---

## What's Next?

The foundation is complete! You can now:
- Add query history
- Build input/output example builder for AI training
- Add export functionality (CSV, JSON)
- Create saved queries feature
- Add multiple query tabs
- Build visual query builder

---

**🎉 Enjoy your advanced SQL Editor! Built with ❤️ using Claude Code**
