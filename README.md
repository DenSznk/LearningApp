# Learning App

A question and answer viewer for interview preparation.

## Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    cd backend && npm install
    ```

2.  **Start the App**
    Runs both the Next.js frontend and the Node.js backend.
    ```bash
    npm run dev:all
    ```
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend: [http://localhost:3001](http://localhost:3001)

## Data Management

### Adding Questions
1.  Open `backend/questions.json`.
2.  Add a new block or questions to an existing block:
    ```json
    {
      "text": "Your Question?",
      "difficulty": "easy",
      "answer": "The answer.",
      "week": "Week 1"
    }
    ```
3.  Run the seed script:
    ```bash
    npm run seed
    ```

### Clearing the Database
To completely wipe the database and start fresh:
```bash
cd backend
npx prisma migrate reset
```
*Note: This will delete everything. You will need to run `npm run seed` afterwards to restore data from `questions.json`.*

## Tech Stack
-   **Frontend**: Next.js 16, React 19, Tailwind CSS.
-   **Backend**: Node.js, Express.
-   **Database**: SQLite, Prisma.
