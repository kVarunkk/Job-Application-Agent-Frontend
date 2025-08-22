# GetHired: The AI-Powered Job and Candidate Platform

**GetHired** is a full-stack application designed to streamline the hiring process for both job seekers and companies. The platform uses AI to provide a personalized experience, helping job seekers find the most relevant roles and enabling companies to discover the best-fit candidates for their job postings.

## ✨ Features

### For Job Seekers:

- **Personalized Job Matching:** AI-powered recommendations based on your profile, skills, and preferences.

- **Job Board:** A comprehensive list of all available job postings with powerful filtering and sorting options.

- **Application Tracking:** Track the status of your job applications from submission to final decision.

- **Favorite Jobs:** Save job postings you're interested in for future reference.

### For Companies:

- **Job Post Management:** A dedicated dashboard to create, edit, and manage all your job postings.

- **Applicant Tracking System (ATS):** View all applicants for each job posting, with the ability to filter and update their status.

- **AI-Powered Candidate Search:** Re-rank and filter candidate profiles based on a specific job's requirements to find the perfect fit.

- **Secure Resume Management:** Resumes are securely handled and stored in a private bucket, accessible only by authorized company users.

## 🛠️ Technology Stack

- **Frontend:** **Next.js 15** with **React** for a performant and modern user interface.

- **Styling:** **Tailwind CSS** for rapid and responsive UI development, with **Shadcn UI** components for a beautiful design.

- **Backend:** **FastAPI** for the AI-powered search and embedding generation.

- **Database:** **Supabase** (PostgreSQL) for authentication, database management, and file storage.

- **AI/Vector Search:** **Google Gemini API** for re-ranking profiles and **`pgvector`** for storing and querying vector embeddings directly in PostgreSQL.

<!-- ## 🚀 Getting Started

To get the project up and running locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/your-username/your-app.git](https://github.com/your-username/your-app.git)
    cd your-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Supabase:**

    - Create a new project on [Supabase](https://supabase.com/).

    - Copy your Project URL and Anon Key.

    - Set up your database tables and RLS policies as defined in the `supabase/schemas` directory (if applicable).

4.  **Configure Environment Variables:**

    - Create a `.env.local` file in the root of your project.

    - Add your Supabase credentials:

      ```
      NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```

    - Add your Google API key for AI features.

      ```
      GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
      ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the result.

## 🤝 Contribution

We welcome contributions! If you have suggestions for new features, bug fixes, or improvements to the documentation, feel free to open an issue or submit a pull request. -->
