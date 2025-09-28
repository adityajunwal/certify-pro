// app/jobs/JobsList.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function JobsList({ userId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  function goToHomePage() {
    router.push(`/`);
  }

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(`/api/get-jobs?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="jobs-title">Jobs for {userId}</h2>

      <div className="jobs">
        {jobs.map((job) => (
          <div key={job.jobId} className="job">
            <p className="job-title"><strong>{job.title}</strong></p>
            <p className="job-description">{job.description}</p>
            <p className="job-date">{new Date(job.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="actions">
        <button onClick={goToHomePage} className="add-job">
          + Add Job
        </button>
      </div>
    </div>
  );
}
