import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { SiteHeader } from "@/components/site-header";
import { SubmitForm } from "@/components/submit-form";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  await requireChatGPTUser("/submit");
  return (
    <main>
      <SiteHeader />
      <section className="form-page">
        <div className="form-intro">
          <span className="mono-label">COMMUNITY / HUMAN REVIEW REQUIRED</span>
          <h1>Submit a prompt that actually did something.</h1>
          <p>Paste it, link its GitHub source, or attach a small supporting file. Every submission enters review before it can earn a verified badge.</p>
          <div className="review-note"><strong>What reviewers check</strong><span>Outcome accuracy · clarity · adaptability · model coverage · safety · learning value</span></div>
        </div>
        <SubmitForm />
      </section>
    </main>
  );
}

