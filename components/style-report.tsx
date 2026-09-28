"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  Camera,
  Download,
  ArrowUpRight,
  Share2,
  ImageDown,
} from "lucide-react";
import type { StyleReport } from "@/lib/report";
import { saveStoryCard } from "@/lib/story-card";
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
}) {
  const [message, setMessage] = useState("");
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
        <span className="eyebrow">
          {sample ? "AN EXAMPLE STYLE EDIT" : "YOUR PERSONAL STYLE EDIT"} ·{" "}
          {occasion.toUpperCase()}
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
          A curated example of what you’ll receive. Your own review is created
          from your outfit and preferences.
        </div>
      )}
      <header className="report-title">
        <div>
          <h1>{r.title}</h1>
          <p>{r.summary}</p>
        </div>
        <div className="report-score">
          <strong>{r.score}</strong>
          <span>OUTFIT SCORE / 100</span>
        </div>
      </header>
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
          <span className="eyebrow">
            <Check size={15} /> WHAT’S WORKING
          </span>
          <h2>
            Your look’s <em>lovely details.</em>
          </h2>
          <ul>
            {r.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
        <section className="report-card tinted">
          <span className="eyebrow">
            <Sparkles size={15} /> THE FINISHING TOUCHES
          </span>
          <h2>
            Little changes.
            <br />
            <em>Lovely difference.</em>
          </h2>
          <ol>
            {r.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      </div>
      <section className="report-card">
        <span className="eyebrow">YOUR COLOUR STORY</span>
        <h2>
          A palette to <em>play with.</em>
        </h2>
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
      <section className="report-card">
        <span className="eyebrow">SHOP YOUR WARDROBE FIRST</span>
        <h2>
          Considered <em>additions.</em>
        </h2>
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
      <section className="camera-note">
        <Camera size={26} />
        <div>
          <h3>A camera-ready finishing touch</h3>
          <p>{r.cameraTip}</p>
        </div>
      </section>
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
          Review another look <ArrowUpRight size={18} />
        </button>
      ) : (
        <Link className="button primary" href="/analysis">
          {sample ? "Get my own style edit" : "Review another look"}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </article>
  );
}
