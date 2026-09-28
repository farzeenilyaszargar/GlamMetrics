import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  ScanLine,
  Palette,
  ShieldCheck,
  Camera,
  Check,
  Flower2,
} from "lucide-react";
export default function Home() {
  return (
    <main id="main">
      <div className="announcement">
        A fresh perspective on your wardrobe <span>✧</span> Your first style
        review is on us
      </div>
      <section className="hero-section wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-line" /> YOUR PERSONAL AI STYLE STUDIO
          </div>
          <h1>
            Your style.
            <br />
            Beautifully
            <br />
            <em>considered.</em>
          </h1>
          <p>
            A second opinion for the “does this work?” moments. Discover what
            makes your outfit shine, and the little details that bring it all
            together.
          </p>
          <Link href="/analysis" className="button primary">
            Find your style moment <ArrowUpRight size={19} />
          </Link>
          <div className="hero-footnote">
            <Check size={14} /> First review free <span /> No card needed
          </div>
          <Link className="text-link" href="/sample">
            Take a peek at a style report <ArrowRight size={15} />
          </Link>
        </div>
        <div className="hero-art">
          <div className="photo-frame">
            <Image
              src="/images/editorial.png"
              alt="Rose silk saree with delicate gold accessories in a sunlit courtyard"
              fill
              priority
              sizes="(max-width: 700px) 95vw, 48vw"
            />
            <div className="photo-caption">
              <span>THE OCCASION EDIT</span>
              <span>01 / 06</span>
            </div>
          </div>
          <div className="floating-score">
            <span className="mini-icon">
              <Sparkles size={18} />
            </span>
            <div>
              <span className="eyebrow">A LITTLE STYLE INSPIRATION</span>
              <strong>Made for your moment.</strong>
              <p>Colour. Details. Confidence.</p>
            </div>
            <span className="score-circle">
              89<small>/100</small>
            </span>
          </div>
          <span className="image-note">
            Illustrative outfit · example score
          </span>
          <div className="art-star">✳</div>
        </div>
      </section>
      <section className="benefit-strip">
        <span>
          <ScanLine size={17} /> Thoughtful outfit reviews
        </span>
        <span>
          <Palette size={17} /> Your own colour story
        </span>
        <span>
          <Flower2 size={17} /> Indian occasions, understood
        </span>
        <span>
          <ShieldCheck size={17} /> Private by design
        </span>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FOR EVERY VERSION OF YOU</span>
            <h2>
              What’s the <em>occasion?</em>
            </h2>
          </div>
          <p>
            From everyday favourites to the main event.
            <br />A little styling help, wherever life takes you.
          </p>
        </div>
        <div className="occasion-grid">
          {[
            {
              title: "Everyday, elevated",
              sub: "Coffee runs. College days. Just because.",
              value: "Everyday",
              n: "01",
              cls: "everyday",
            },
            {
              title: "The celebration edit",
              sub: "Sarees, sparkle & unforgettable evenings.",
              value: "Wedding guest",
              n: "02",
              cls: "festive",
            },
            {
              title: "Camera-ready you",
              sub: "Your next reel deserves a good outfit.",
              value: "Content shoot",
              n: "03",
              cls: "creator",
            },
          ].map((o) => (
            <Link
              href={`/analysis?occasion=${encodeURIComponent(o.value)}`}
              className={`occasion-card ${o.cls}`}
              key={o.n}
            >
              <div className="occasion-visual">
                <span className="occasion-number">{o.n}</span>
                {o.cls === "festive" ? (
                  <Image
                    src="/images/editorial.png"
                    alt="Rose saree occasion styling"
                    fill
                    sizes="(max-width: 700px) 80vw, 30vw"
                  />
                ) : (
                  <div className="fashion-flatlay" aria-hidden="true">
                    <div className="fabric" />
                    <div className="jewellery" />
                    <div className="palette-dots">
                      <i />
                      <i />
                      <i />
                    </div>
                    <span>
                      {o.cls === "everyday"
                        ? "THE EVERYDAY EDIT"
                        : "IN YOUR ELEMENT"}
                    </span>
                  </div>
                )}
                <span className="round-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </div>
              <h3>{o.title}</h3>
              <p>{o.sub}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="how-section">
        <div className="wrap how-grid">
          <div>
            <span className="eyebrow">LESS SECOND-GUESSING. MORE YOU.</span>
            <h2>
              A fresh pair of eyes.
              <br />
              <em>In three little steps.</em>
            </h2>
            <Link href="/sample" className="text-link">
              Explore an example report <ArrowRight size={16} />
            </Link>
          </div>
          <div className="steps">
            {[
              {
                icon: Camera,
                title: "Show us your look",
                text: "Upload an outfit photo. A mirror selfie works beautifully.",
              },
              {
                icon: Flower2,
                title: "Set the scene",
                text: "Tell us the occasion, your budget and what you have in mind.",
              },
              {
                icon: Sparkles,
                title: "Make it your own",
                text: "Get a style score, colour palette and useful finishing touches.",
              },
            ].map((s, i) => (
              <div className="step" key={s.title}>
                <span className="step-index">0{i + 1}</span>
                <s.icon size={23} />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section wrap philosophy">
        <div className="quote-mark">“</div>
        <h2>
          Good style isn’t about changing who you are.
          <br />
          It’s about feeling <em>more like yourself.</em>
        </h2>
        <p>
          We review the outfit: colour, coordination and finishing touches.
          Every suggestion is yours to take, adapt or leave. Your body is never
          a score.
        </p>
        <Link href="/analysis" className="button primary">
          Try your first style review <Sparkles size={17} />
        </Link>
      </section>
      <section className="wrap faq-section">
        <div>
          <span className="eyebrow">A FEW THINGS YOU MIGHT WONDER</span>
          <h2>
            Let’s make it <em>simple.</em>
          </h2>
        </div>
        <div>
          {[
            [
              "What do I get in a style review?",
              "An outfit score, a breakdown of colour coordination and occasion suitability, practical styling suggestions, a palette and budget-aware ideas. Every review is generated by AI and is a subjective second opinion.",
            ],
            [
              "Will it work with sarees and Indian wear?",
              "Yes. The studio is designed for Indian wardrobes, from sarees and kurtas to western and fusion outfits. Tell us your occasion and preferences so the advice fits your plans.",
            ],
            [
              "Do you save my photos?",
              "We send the photo securely to our AI provider to generate your review. GlamMetrics saves the written report to your account, not the original image. See our privacy policy for provider processing details.",
            ],
            [
              "Is this a subscription?",
              "Yes. The Style Circle is ₹99 per month for 10 reviews. Start with one free review before subscribing. Monthly reviews don’t roll over, and you can cancel future billing from your account.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
