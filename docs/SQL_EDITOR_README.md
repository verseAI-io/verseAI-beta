# 🚀 VerseAI - The World's Most Advanced SQL Editor

An AI-powered SQL Editor with Matrix-themed UI, integrated with Google BigQuery and Vertex AI for natural language to SQL generation.

## ✨ Features

### 🤖 AI-Powered SQL Generation
- **Natural Language to SQL**: Describe what you want in plain English, AI generates the SQL
- **SQL Explanation**: Get plain English explanations of complex SQL queries
- **Query Optimization**: AI suggests performance improvements for your queries
- **Intelligent Chat**: Conversational interface for SQL help and guidance

### ⚡ Powerful SQL Editor
- **Monaco Editor**: VS Code-style SQL editing with syntax highlighting
- **Real-time Validation**: Validate SQL syntax before execution (dry-run)
- **Query Execution**: Run queries directly against Google BigQuery
- **Schema Browser**: Browse datasets, tables, and schemas
- **Query Metadata**: Execution time, bytes processed, cost estimation, cache hits

### 🎨 Matrix-Themed UI
- Animated Matrix rain background
- Neon green (#00ff41) terminal aesthetic
- Smooth framer-motion animations
- 4-panel responsive layout
- Scanning line effects

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           React Frontend (Port 3000)             │
│  ┌──────────────────────────────────────────┐   │
│  │  Landing → Login → Home → SQL Editor    │   │
│  └──────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/REST API
┌─────────────────┴───────────────────────────────┐
│         Node.js Backend (Port 5001)              │
│  ┌──────────────┐      ┌──────────────────┐    │
│  │   BigQuery   │      │   Vertex AI      │    │
│  │   Routes     │      │   Routes         │    │
│  └───────┬──────┘      └────────┬─────────┘    │
└──────────┼──────────────────────┼───────────────┘
           │                      │
    ┌──────┴─────┐         ┌─────┴──────┐
    │  BigQuery  │         │ Vertex AI  │
    │   (GCP)    │         │   Gemini   │
    └────────────┘         └────────────┘
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ installed
- GCP service account with BigQuery and Vertex AI permissions
- `cred.json` file with GCP credentials

### Installation

1. **Clone and install frontend dependencies**:
   ```bash
   cd /Users/georgian/verseai
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Ensure `cred.json` is in the backend folder**:
   ```bash
   ls backend/cred.json  # Should exist
   ```

### Running the Application

**Terminal 1 - Start Backend Server**:
```bash
cd /Users/georgian/verseai/backend
npm start
```

Backend will run on: `http://localhost:5001`

**Terminal 2 - Start React Frontend**:
```bash
cd /Users/georgian/verseai
npm start
```

Frontend will run on: `http://localhost:3000`

### Access the Application

1. Open `http://localhost:3000` in your browser
2. Navigate through: **Landing Page** → **Matrix Login** → **Home**
3. Click **"⚡ LAUNCH SQL EDITOR"** button
4. Start querying with AI!

## 📚 API Endpoints

### BigQuery Endpoints (`/api/bigquery`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/datasets` | List all datasets |
| GET | `/datasets/:id/tables` | List tables in dataset |
| GET | `/tables/:dataset/:table/schema` | Get table schema |
| POST | `/query` | Execute SQL query |
| POST | `/validate` | Validate SQL (dry-run) |
| POST | `/explain` | Get query execution plan |

### Vertex AI Endpoints (`/api/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate-sql` | Generate SQL from natural language |
| POST | `/explain-sql` | Explain SQL in plain English |
| POST | `/optimize-sql` | Get optimization suggestions |
| POST | `/chat` | General purpose AI chat |

## 💡 Usage Examples

### 1. Natural Language to SQL

**Input (Natural Language)**:
```
Show me the top 10 users by revenue from the last 30 days
```

**Output (Generated SQL)**:
```sql
SELECT
  user_id,
  SUM(revenue) as total_revenue
FROM `project.dataset.transactions`
WHERE transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY user_id
ORDER BY total_revenue DESC
LIMIT 10
```

### 2. SQL Execution

Run the generated query and get:
- **Results**: Data table with all rows
- **Metadata**:
  - Execution time: 1,234ms
  - Rows returned: 10
  - Bytes processed: 45.3 MB
  - Cache hit: No
  - Job ID: `job_abc123xyz`

### 3. Query Validation

Before running expensive queries:
```javascript
POST /api/bigquery/validate
{
  "query": "SELECT * FROM large_table"
}

Response:
{
  "valid": true,
  "estimatedBytes": "150000000000",  // 150 GB
  "statementType": "SELECT"
}
```

## 🎨 UI Components

### 4-Panel Layout

```
┌─────────────────────────────────────────────────┐
│  1. Natural Language Chat Interface             │
│     💬 "Show me top users by revenue"           │
├─────────────────────────────────────────────────┤
│  2. SQL Editor (Monaco Editor)                  │
│     ⚡ SELECT * FROM users...                    │
├────────────────────────┬────────────────────────┤
│  3. Query Results      │  4. Query Metadata     │
│     📊 Table with data │     ℹ️ Stats & info     │
└────────────────────────┴────────────────────────┘
```

### Key Features

1. **Natural Language Interface**
   - Chat-style conversation
   - Message history
   - Real-time AI responses

2. **SQL Editor**
   - VS Code Monaco Editor
   - Syntax highlighting
   - Line numbers
   - Auto-completion

3. **Results Panel**
   - Scrollable data table
   - Row count display
   - NULL value handling

4. **Metadata Panel**
   - Execution metrics
   - Cost estimation
   - Performance indicators

## 🔒 Security

- **Credentials**: `cred.json` stored only in backend, never exposed to frontend
- **CORS**: Configured for localhost:3000 only
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers enabled
- **Input Validation**: All API inputs validated

## 🛠️ Tech Stack

### Frontend
- React 19.2.0
- Framer Motion 12.23.22 (animations)
- Monaco Editor 4.7.0 (SQL editing)
- Axios 1.12.2 (HTTP client)

### Backend
- Node.js / Express 4.18.2
- @google-cloud/bigquery 7.3.0
- @google-cloud/vertexai 1.1.0
- CORS, Helmet, Rate Limiting

### Cloud Services
- Google BigQuery (Data Warehouse)
- Vertex AI Gemini Pro (AI Model)

## 📝 Environment Variables

**Backend `.env` file**:
```env
PORT=5001
GCP_PROJECT_ID=amplified-album-473216-a4
GCP_CREDENTIALS_PATH=./cred.json
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :5001

# Kill process if needed
kill -9 <PID>

# Restart
cd backend && npm start
```

### Frontend can't connect to backend
- Ensure backend is running on port 5001
- Check browser console for CORS errors
- Verify `API_BASE_URL` in SQLEditor.jsx

### BigQuery errors
- Verify `cred.json` has BigQuery permissions
- Check project ID in `.env` matches GCP project
- Ensure datasets exist in your project

### Vertex AI errors
- Verify Vertex AI API is enabled in GCP
- Check service account has Vertex AI permissions
- Confirm model name is correct (gemini-pro)

## 📈 Future Enhancements

- [ ] Input/Output example builder for training AI
- [ ] Query history and saved queries
- [ ] Export results (CSV, JSON, Excel)
- [ ] Multiple query tabs
- [ ] Visual query builder
- [ ] Schema auto-completion
- [ ] Query performance visualization
- [ ] Team collaboration features
- [ ] Query templates library

## 📄 License

Private project - All rights reserved

## 👨‍💻 Development

Built with ❤️ using Claude Code (claude.ai/code)

**Project Structure**:
```
verseai/
├── backend/
│   ├── routes/
│   │   ├── bigquery.js      # BigQuery API endpoints
│   │   └── vertexai.js      # Vertex AI endpoints
│   ├── server.js            # Express server
│   ├── package.json
│   ├── .env
│   └── cred.json            # GCP credentials
├── src/
│   ├── App.js               # Main app with routing
│   ├── LandingPage.jsx      # Entry page
│   ├── Login.jsx            # Matrix login
│   ├── Home.jsx             # Dashboard
│   ├── SQLEditor.jsx        # Main SQL editor ⭐
│   └── VerseAILogo.jsx      # Animated logo
├── public/
└── package.json
```

---

## 🚀 Quick Start Commands

```bash
# Terminal 1 - Backend
cd /Users/georgian/verseai/backend && npm start

# Terminal 2 - Frontend
cd /Users/georgian/verseai && npm start

# Open browser
open http://localhost:3000
```

**Enjoy the most advanced SQL Editor in the world! 🎉**
