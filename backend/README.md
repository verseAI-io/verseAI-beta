# VerseAI Backend Server

Backend API for the VerseAI SQL Editor with Google BigQuery and Vertex AI integration.

## Setup

1. Ensure `cred.json` (GCP service account credentials) is in this directory
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### BigQuery Endpoints

- `GET /api/bigquery/datasets` - List all datasets
- `GET /api/bigquery/datasets/:datasetId/tables` - List tables in a dataset
- `GET /api/bigquery/tables/:datasetId/:tableId/schema` - Get table schema
- `POST /api/bigquery/query` - Execute SQL query
- `POST /api/bigquery/validate` - Validate SQL syntax (dry run)
- `POST /api/bigquery/explain` - Get query execution plan

### Vertex AI Endpoints

- `POST /api/ai/generate-sql` - Generate SQL from natural language
- `POST /api/ai/explain-sql` - Explain SQL query in plain English
- `POST /api/ai/optimize-sql` - Get optimization suggestions
- `POST /api/ai/chat` - General purpose chat

## Environment Variables

See `.env` file for configuration:
- `PORT` - Server port (default: 5000)
- `GCP_PROJECT_ID` - Your GCP project ID
- `GCP_CREDENTIALS_PATH` - Path to credentials file
- `VERTEX_AI_LOCATION` - Vertex AI region
- `VERTEX_AI_MODEL` - Model name (default: gemini-pro)
