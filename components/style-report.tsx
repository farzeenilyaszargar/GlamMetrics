"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Download,
  ArrowUpRight,
  Share2,
  ImageDown,
  Copy,
  Check,
} from "lucide-react";
import type { StyleReport } from "@/lib/report";
import { saveStoryCard } from "@/lib/story-card";
import { useSession } from "./session";
export default function Report({
  report: r,
  sample = false,
  occasion = "Your look",
  onNewReview,
}: {
  report: StyleReport;
  sample?: boolean;
  occasion?: string;
  onNewReview?: () => void;
  remainingPlans?: number | null;
}) {
  const { user } = useSession();
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  function downloadPlan() {
    const text = [
      r.title,
      r.summary,
      "What to change",
      ...r.suggestions.map((s, i) => `${i + 1}. ${s}`),
      ...(r.looks || []).flatMap((l) => [
        l.name,
        l.outfit,
        `Shoes: ${l.shoes}`,
        `Accessories: ${l.accessories}`,
        `Finishing touch: ${l.finishingTouch}`,
      ]),
      "Use your wardrobe",
      r.wardrobeRescue || "",
      "Getting-ready checklist",
      ...(r.checklist || []).map((s) => `□ ${s}`),
      `Photo tip: ${r.cameraTip}`,
      "AI-generated styling advice · GlamMetrics",
    ].join("\n\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "glammetrics-outfit-fix.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Your plan has been downloaded. Keep a copy before leaving this guest session.",
    );
  }
  async function copyLook(look: NonNullable<StyleReport["looks"]>[number]) {
    try {
      await navigator.clipboard.writeText(
        `${look.name}\n${look.outfit}\nShoes: ${look.shoes}\nAccessories: ${look.accessories}\nFinishing touch: ${look.finishingTouch}`,
      );
      setMessage(
        `Copied “${look.name}”. Save it in your notes for getting ready.`,
      );
    } catch {
      setMessage(
        "Copy isn’t available in this browser. You can print or save the plan instead.",
      );
    }
  }
  async function share() {
    const text = `My ${occasion.toLowerCase()} edit: ${r.title} Outfit styling score: ${r.score}/100. Discover your style at GlamMetrics.`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "My GlamMetrics style edit",
          text,
          url: window.location.origin,
        });
      else {
        await navigator.clipboard.writeText(
          `${text} ${window.location.origin}`,
        );
        setMessage("Copied! Paste it into your story caption or message.");
      }
    } catch {
      setMessage("Sharing cancelled. You can still save the report below.");
    }
  }
  return (
    <article className="report">
      <div className="report-top">
        <span className="report-meta">
          {sample ? "Sample style plan" : occasion}
        </span>
        <div className="report-actions">
          <button
            className="icon-button"
            aria-label="Download Instagram story card"
            onClick={async () => {
              try {
                await saveStoryCard(r, occasion);
                setMessage(
                  "Your story card is ready. Add it to your Instagram story from your downloads.",
                );
              } catch (e) {
                setMessage(
                  e instanceof Error
                    ? e.message
                    : "Could not create story card.",
                );
              }
            }}
          >
            <ImageDown size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Share style summary"
            onClick={share}
          >
            <Share2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Print or save report as PDF"
            onClick={() => window.print()}
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      {sample && (
        <div className="notice">
          A curated example of what you’ll receive. Your own plan is created
          from your outfit and preferences.
        </div>
      )}
      <header className="report-title">
        <div>
          <h1>{r.title}</h1>
          <p>{r.summary}</p>
        </div>
        {!r.looks && (
          <div className="report-score">
            <strong>{r.score}</strong>
            <span>OUTFIT SCORE / 100</span>
          </div>
        )}
      </header>
      <div className="plan-download-actions">
        <button className="button primary" onClick={downloadPlan}>
          <Download size={17} />
          Download my plan
        </button>
        <button className="button secondary" onClick={() => window.print()}>
          Print / save PDF
        </button>
      </div>
      {r.looks?.length === 1 && (
        <section className="report-card tinted">
          <h2>The changes to make.</h2>
          <ol>
            {r.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      )}
      {r.looks && (
        <section className="look-plan-section">
          <div className="section-heading">
            <div>
              <h2>
                {r.looks.length === 1
                  ? "Your outfit, figured out."
                  : "Your saved styling variations."}
              </h2>
              <p>
                {r.looks.length === 1
                  ? "One complete look for your occasion."
                  : "Choose the version that fits your plans."}
              </p>
            </div>
          </div>
          <div
            className={`look-plan-grid ${r.looks.length === 1 ? "single-look" : ""}`}
          >
            {r.looks.map((look, i) => (
              <article className="look-plan-card" key={look.name}>
                <div className="look-card-top">
                  <span>
                    {i === 0 ? "Your occasion look" : `Alternative ${i}`}
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Copy ${look.name}`}
                    onClick={() => copyLook(look)}
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <h3>{look.name}</h3>
                <p>{look.why}</p>
                <dl>
                  <dt>The outfit</dt>
                  <dd>{look.outfit}</dd>
                  <dt>Shoes</dt>
                  <dd>{look.shoes}</dd>
                  <dt>Accessories</dt>
                  <dd>{look.accessories}</dd>
                  <dt>Finishing touch</dt>
                  <dd>{look.finishingTouch}</dd>
                </dl>
              </article>
            ))}
          </div>
        </section>
      )}
      {r.wardrobeRescue && (
        <section className="wardrobe-rescue">
          <div>
            <span className="rescue-icon">
              <Check size={21} />
            </span>
            <h2>The no-shopping version.</h2>
          </div>
          <p>{r.wardrobeRescue}</p>
        </section>
      )}
      {r.checklist && (
        <section className="report-card getting-ready">
          <div className="section-heading">
            <h2>Your getting-ready checklist.</h2>
            <span className="count-label">
              {checked.length}/{r.checklist.length}
            </span>
          </div>
          <p>
            Tick these off as you get ready. Checkmarks reset when you leave
            this page.
          </p>
          <div>
            {r.checklist.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={(e) =>
                    setChecked((previous) =>
                      e.target.checked
                        ? [...previous, item]
                        : previous.filter((x) => x !== item),
                    )
                  }
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>
      )}
      {sample && (
        <section className="report-upgrade">
          <h2>Make it personal.</h2>
          <p>
            This is an illustrative Outfit Fix. Get one personal plan built
            around your outfit and occasion, for ₹99 once.
          </p>
          <Link href="/analysis" className="button primary">
            Fix my outfit · ₹99 <ArrowUpRight size={17} />
          </Link>
        </section>
      )}
      <details className="outfit-breakdown">
        <summary>
          Your outfit review & colour details <span>+</span>
        </summary>
        <div className="score-bars">
          {Object.entries(r.scores).map(([name, value]) => (
            <div key={name}>
              <div>
                <span>
                  {name === "occasion"
                    ? "Occasion fit"
                    : name === "details"
                      ? "Finishing touches"
                      : "Colour & coordination"}
                </span>
                <b>{value}</b>
              </div>
              <div className="bar">
                <i style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="report-columns">
          <section className="report-card">
            <h2>What’s working.</h2>
            <ul>
              {r.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section className="report-card tinted">
            <h2>Try this.</h2>
            <ol>
              {r.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        </div>
        <section className="report-card">
          <h2>Your colour palette.</h2>
          <div className="colour-palette">
            {r.palette.map((c) => (
              <div key={c.hex}>
                <div style={{ background: c.hex }} />
                <span>{c.name}</span>
                <small>{c.hex}</small>
              </div>
            ))}
          </div>
        </section>
        {r.shopping.length > 0 && (
          <section className="report-card">
            <h2>Finish the look.</h2>
            <div className="shopping-grid">
              {r.shopping.map((s) => (
                <div key={s.item}>
                  <h3>{s.item}</h3>
                  <p>{s.reason}</p>
                  <span>{s.budget}</span>
                </div>
              ))}
            </div>
            <p className="fineprint">
              Budget ideas, not live product listings. Start with something you
              already own.
            </p>
          </section>
        )}
        <section className="camera-note">
          <Camera size={26} />
          <div>
            <h3>A camera-ready finishing touch</h3>
            <p>{r.cameraTip}</p>
          </div>
        </section>
      </details>
      <p className="fineprint">
        AI style advice is subjective. Scores describe outfit choices, never
        your body or personal worth.
      </p>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {onNewReview ? (
        <button className="button primary" onClick={onNewReview}>
          Plan another outfit <ArrowUpRight size={18} />
        </button>
      ) : (
        <Link className="button primary" href="/analysis">
          {sample ? "Fix my outfit · ₹99" : "New Outfit Fix · ₹99"}
          <ArrowUpRight size={18} />
        </Link>
      )}
      {!sample && user?.is_anonymous && (
        <div className="report-upgrade">
          <p>
            Your plan is saved to this guest session. Connect an email or Google
            so it stays accessible if you change browsers or clear your data.
          </p>
          <Link href="/auth?next=/profile" className="text-link">
            Keep my plan across devices <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
    </article>
  );
}
