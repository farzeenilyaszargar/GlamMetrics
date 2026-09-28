import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, ScanLine, Plus } from "lucide-react";

export default function Home() {
  return (
    <main id="main" className="home">
      <section className="campaign wrap">
        <div className="campaign-copy">
          <h1>
            Good outfit.
            <br />
            Great <span>energy.</span>
          </h1>
          <p>
            Your look, a fresh perspective. Get personal outfit feedback, colour
            pairings and the details that make it click.
          </p>
          <div className="campaign-actions">
            <Link href="/analysis" className="button primary">
              Check my outfit <ArrowUpRight size={20} />
            </Link>
            <Link href="/sample" className="text-link">
              See a sample <ArrowRight size={17} />
            </Link>
          </div>
          <p className="campaign-note">
            First review free. No card, no commitment.
          </p>
          <div className="campaign-swatches" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>Your style. Turned up.</span>
          </div>
        </div>
        <div className="campaign-photo">
          <Image
            src="/images/street-edit.png"
            alt="Pink oversized blazer, black denim and silver accessories"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 55vw"
          />
          <span className="photo-sticker">
            Wear it
            <br />
            <strong>your way.</strong>
            <ArrowUpRight size={25} />
          </span>
          <Link
            href="/analysis"
            className="photo-action"
            aria-label="Review your own outfit"
          >
            <ScanLine size={24} />
            <span>
              Your next great look
              <br />
              <strong>starts here.</strong>
            </span>
            <ArrowUpRight size={24} />
          </Link>
        </div>
      </section>

      <section className="edits-section wrap">
        <div className="section-heading">
          <h2>What’s the plan?</h2>
          <Link href="/analysis" className="text-link">
            Find your look <ArrowUpRight size={17} />
          </Link>
        </div>
        <nav className="occasion-pills" aria-label="Choose your occasion">
          {[
            "Everyday",
            "Wedding guest",
            "Work",
            "Date night",
            "Festive",
            "Content shoot",
          ].map((occasion, i) => (
            <Link
              key={occasion}
              className={i === 0 ? "highlight" : ""}
              href={`/analysis?occasion=${encodeURIComponent(occasion)}`}
            >
              {occasion}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
        <div className="edit-grid">
          <Link href="/analysis?occasion=Everyday" className="edit-card">
            <div className="edit-photo street">
              <Image
                src="/images/street-edit.png"
                alt="Relaxed tailoring with a pink blazer and black denim"
                fill
                sizes="(max-width:700px) 47vw, 34vw"
              />
              <span className="round-arrow">
                <ArrowUpRight size={20} />
              </span>
            </div>
            <h3>Off-duty. On point.</h3>
            <p>Everyday looks, a little louder.</p>
          </Link>
          <Link href="/analysis?occasion=Wedding%20guest" className="edit-card">
            <div className="edit-photo">
              <Image
                src="/images/editorial.png"
                alt="Rose silk saree with gold jewellery for a celebration"
                fill
                sizes="(max-width:700px) 47vw, 34vw"
              />
              <span className="round-arrow">
                <ArrowUpRight size={20} />
              </span>
            </div>
            <h3>Make an entrance.</h3>
            <p>For every invite on your calendar.</p>
          </Link>
          <Link href="/sample" className="sample-tile">
            <div className="sample-tile-top">
              <ScanLine size={28} />
              <ArrowUpRight size={25} />
            </div>
            <div className="sample-score">
              89<span>/100</span>
            </div>
            <div
              className="sample-palette"
              aria-label="Sample palette: rose, ivory, brown and gold"
            >
              <i />
              <i />
              <i />
              <i />
            </div>
            <h3>
              A second opinion.
              <br />A stronger look.
            </h3>
            <p>Explore a sample outfit review.</p>
          </Link>
        </div>
      </section>

      <section className="how-edit wrap">
        <h2>
          Less “does this work?”
          <br />
          <span>More out the door.</span>
        </h2>
        <div className="how-edit-steps">
          {[
            [
              "01",
              "Drop your fit.",
              "A mirror selfie or outfit photo. Just make sure we can see the whole look.",
            ],
            [
              "02",
              "Set the mood.",
              "Pick the occasion. Add your budget and the details you want help with.",
            ],
            [
              "03",
              "Make it yours.",
              "Get an AI outfit review with colour pairings and practical styling ideas.",
            ],
          ].map(([n, title, description]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="club-section wrap">
        <div className="club-banner">
          <div>
            <h2>
              Your style era.
              <br />
              For <span>₹99</span> a month.
            </h2>
            <p>
              10 personal outfit reviews. Saved edits. Your next favourite
              colour combination.
            </p>
            <Link href="/pricing" className="button dark-button">
              Meet Style Circle <ArrowUpRight size={20} />
            </Link>
          </div>
          <div className="club-art" aria-hidden="true">
            <span>
              good
              <br />
              taste.
            </span>
            <ArrowUpRight size={86} strokeWidth={1} />
          </div>
        </div>
      </section>

      <section className="wrap faq-section">
        <div>
          <h2>
            A few good
            <br />
            questions.
          </h2>
          <p>Here’s how it works.</p>
        </div>
        <div>
          {[
            [
              "What’s in an outfit review?",
              "An outfit score, colour palette, occasion feedback and specific styling suggestions. Reviews are generated by AI and offer a subjective second opinion on your clothes and styling, never your body.",
            ],
            [
              "Does it work with Indian wear?",
              "Yes. Sarees, kurtas, western looks and fusion outfits are all welcome. Choose your occasion and add your preferences to guide the review.",
            ],
            [
              "Are my photos saved?",
              "Your photo is sent to our AI provider to create the review. GlamMetrics saves the written report, not your original photo. Our privacy policy explains how images are processed.",
            ],
            [
              "How does the subscription work?",
              "Try one review free. Style Circle is ₹99 per month for 10 outfit reviews. Reviews reset each billing month and don’t roll over. You can cancel future billing from your account.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
