"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation";
export default function Component() {
  const { data: session } = useSession();
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    formData.append("userId", session.user.email)
    // send the whole form (title, description, file) to API route
    const res = await fetch("/api/upload-csv", {
      method: "POST",
      body: formData,
    });


    const data = await res.json();
    console.log("Response:", data);

    router.push(`/jobs?uid=${encodeURIComponent(session.user.email)}`)

  };

  async function goToMyJobs(e) {
    e.preventDefault()
    router.push(`/jobs?uid=${encodeURIComponent(session.user.email)}`)
  }

  if (session) {
    return <>
      <div className="user-card">
        <img id="user-img" src={session.user.image} alt="" />
        <div className="user-details">
          <h1 className="user-name">{session.user.name}</h1>
          <h3 className="user-email">{session.user.email}</h3>
          <div className="actions">
            <button id="get-jobs" onClick={goToMyJobs}>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z" /></svg>              </div>
              Go To My Jobs
            </button>
            <button id="signout-btn" onClick={() => signOut()}>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
              </div>
              Sign Out
            </button>
          </div>
        </div>

      </div>

      <div className="container">
        <h1>CERTIFICATION AUTOMATION TOOL</h1>
        <form id="cert-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Certificate Title</label>
          <input name="title" required type="text" placeholder="Certificate for ..." />
          <label htmlFor="description">Certification Description</label>
          <textarea required name="description" id="cert-desc" placeholder="For succesfully completing the course..."></textarea>
          <label htmlFor="csv">Upload CSV</label>
          <input name="file" required id="file-input" accept=".csv" type="file" />
          <button id="submit-btn" type="submit">
            <div id="icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h400v80H160v480h640v-280h80v280q0 33-23.5 56.5T800-160ZM240-320h280v-120H240v120Zm0-200h280v-120H240v120Zm360 200h120v-200H600v200Zm-440 80v-480 480Zm560-360v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80Z" /></svg>
            </div>
            Generate
          </button>
        </form>
      </div>

    </>
  } else {
    return <>
      <h1>Please sign in to Use the Tool</h1>
      <div className="buttons">
        <button className="signin-btn" id="google-btn" onClick={() => signIn("google")}>
          <div>
            <img className="auth-icon" src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png" alt="" />
          </div>
          <div>
            Sign with Google
          </div>
        </button>
        <br />
        <button className="signin-btn" id="github-btn" onClick={() => signIn("github")}>
          <div>
            <img className="auth-icon" src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-social-github-1024.png" alt="" />
          </div>
          <div>
            Sign with Github
          </div>
        </button>
      </div>
    </>
  }

}