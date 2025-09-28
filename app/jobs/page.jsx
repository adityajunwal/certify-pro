// app/jobs/page.jsx
import JobList from "./JobList.jsx";

export const dynamic = "force-dynamic";

export default function JobsPage({ searchParams }) {
  const userId = searchParams.uid; // read safely on server

  return <JobList userId={userId} />;
}
