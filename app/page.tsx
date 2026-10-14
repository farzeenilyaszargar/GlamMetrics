import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Camera,
  CreditCard,
  Bookmark,
  Plus,
} from "lucide-react";

const included = [
  "3 specific changes to your outfit",
  "One complete look for your occasion",
  "Shoes, jewellery & bag, figured out",
  "A getting-ready checklist to keep",
];
export default function Home() {
  return (
    <main id="main" className="home">
      <section className="landing-hero wrap">
        <div className="landing-hero-copy">
          <h1>
            Love the outfit.
            <br />
            <em>
              Not sure how
              <br className="mobile-break" /> to finish it?
            </em>
          </h1>
          <p>
            Send us your outfit photo. Get a personal styling plan with the
            exact changes, shoes and accessories to bring it together—for the
            occasion you have in mind.
          </p>
          <Link className="button primary" href="/analysis">
            Fix my outfit · ₹99 <ArrowRight size={18} />
          </Link>
          <div className="hero-reassurance">
            <Check size={14} /> One-time payment <span>·</span> No subscription
          </div>
          <Link href="/sample" className="text-link">
            See exactly what you get <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="landing-hero-art">
          <div className="hero-outfit-photo">
            <Image
              src="/images/street-edit.png"
              alt="A pink blazer, black denim and silver jewellery styled together"
              fill
              loading="eager"
              sizes="(max-width:700px) 90vw, 45vw"
            />
          </div>
          <div className="hero-plan-preview">
            <span className="preview-check">
              <Check size={17} />
            </span>
            <div>
              <strong>The outfit stays. The details change.</strong>
              <p>Sleeves folded. Jewellery edited. Evening sorted.</p>
            </div>
          </div>
          <p className="image-disclosure">
            Illustrative styling example · AI-generated image
          </p>
        </div>
      </section>
      <div className="value-bar">
        <div className="wrap">
          {[
            "Made from your outfit photo",
            "Indian & western wardrobes",
            "Written plan you can download",
          ].map((t) => (
            <span key={t}>
              <Check size={15} />
              {t}
            </span>
          ))}
        </div>
      </div>
      <section className="sample-section" id="your-plan">
        <div className="wrap sample-section-grid">
          <div className="sample-explanation">
            <h2>
              Less “looks nice.”
              <br />
              <em>More “here’s what to do.”</em>
            </h2>
            <p>
              Your Outfit Fix is a decision made easier. What to keep. What to
              change. How to put it all together—using your wardrobe first.
            </p>
            <ul>
              {included.map((t) => (
                <li key={t}>
                  <Check size={16} />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/sample" className="button secondary">
              Read a complete example <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="sample-plan-preview">
            <div className="sample-preview-heading">
              <span>Example · dinner with friends</span>
              <Bookmark size={18} />
            </div>
            <h3>
              Your pink blazer.
              <br />
              An evening finish.
            </h3>
            <dl>
              <div>
                <dt>Keep</dt>
                <dd>
                  The pink blazer, black top and dark jeans. They already work
                  together.
                </dd>
              </div>
              <div>
                <dt>Change</dt>
                <dd>
                  Fold the sleeves neatly, leave the blazer open and choose one
                  jewellery focal point.
                </dd>
              </div>
              <div>
                <dt>Finish</dt>
                <dd>
                  Black flats, a compact black bag and small silver earrings—if
                  you own them. No extra necklace needed.
                </dd>
              </div>
            </dl>
            <div className="sample-preview-footer">
              <Check size={15} /> Clear instructions. Not another mood board.
            </div>
          </div>
        </div>
      </section>
      <section
        className="landing-section wrap process-section"
        id="how-it-works"
      >
        <div className="landing-heading">
          <h2>
            An outfit question.
            <br />
            <em>A straightforward answer.</em>
          </h2>
          <p>No quizzes. No booking a call. No monthly commitment.</p>
        </div>
        <div className="process-grid">
          {[
            {
              icon: Camera,
              title: "Show us the outfit",
              text: "Upload a clear photo and choose the occasion. Add any pieces you own or comfort preferences.",
            },
            {
              icon: CreditCard,
              title: "Pay ₹99 once",
              text: "One transparent price for one personal Outfit Fix. No login wall or recurring mandate.",
            },
            {
              icon: Bookmark,
              title: "Get dressed with a plan",
              text: "Your AI-written fix is generated after payment. Read it, follow the checklist and download it.",
            },
          ].map((s, i) => (
            <div key={s.title}>
              <div className="process-number">
                0{i + 1}
                <s.icon size={21} strokeWidth={1.3} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="landing-section wrap" id="outfit-fix">
        <div className="offer-layout">
          <div className="offer-copy">
            <h2>
              One outfit.
              <br />
              <em>
                One less thing
                <br />
                to overthink.
              </em>
            </h2>
            <p>
              A wedding invite. Dinner plans. A work presentation. Get help
              finishing the clothes you already want to wear, without committing
              to a stylist subscription.
            </p>
            <div className="offer-uses">
              <span>Sarees & kurtas</span>
              <span>Dinner outfits</span>
              <span>Workwear</span>
              <span>Wedding guests</span>
            </div>
          </div>
          <div className="offer-card">
            <h3>Outfit Fix</h3>
            <div className="offer-price">
              ₹99<span>one time</span>
            </div>
            <p>One photo → one complete personal styling plan.</p>
            <ul>
              {included.map((t) => (
                <li key={t}>
                  <Check size={16} />
                  {t}
                </li>
              ))}
              <li>
                <Check size={16} />
                Download your plan. Keep it yours.
              </li>
            </ul>
            <Link className="button primary full" href="/analysis">
              Fix my outfit · ₹99 <ArrowRight size={17} />
            </Link>
            <p className="fineprint center">
              No subscription. No auto-renewal. AI-generated advice.
            </p>
          </div>
        </div>
      </section>
      <section className="landing-section wrap landing-faq">
        <div>
          <h2>
            Before you
            <br />
            <em>send the selfie.</em>
          </h2>
          <p>
            <Link href="/contact" className="text-link">
              A question? Get in touch <ArrowUpRight size={16} />
            </Link>
          </p>
        </div>
        <div>
          {[
            [
              "What exactly am I buying?",
              "One written Outfit Fix based on one outfit photo and your occasion: three practical changes, one complete styled look with shoes and accessories, and a getting-ready checklist. It is not a subscription, a human stylist appointment, a shopping order or a generated try-on image.",
            ],
            [
              "How quickly do I get it?",
              "Generation begins once your payment is verified. Stay on the page while it runs; it may take a minute or more depending on demand. There is no appointment or manual delivery. If processing fails, retry the same purchase without paying again.",
            ],
            [
              "Do I need an account?",
              "No signup is required to buy. We create a secure guest session behind the scenes, while payment and purchase ownership are verified on the server—not just saved locally. Download the result or connect an email afterwards. Clearing browser data or changing browsers can otherwise lose your guest access.",
            ],
            [
              "Is this a human stylist?",
              "No. The advice is generated by AI from your photo and notes. It is subjective and may make mistakes. We advise on the outfit and occasion, never your body or attractiveness. Read the example before deciding whether this convenience is worth ₹99 to you.",
            ],
            [
              "Will I need to shop?",
              "The fix prioritises your visible clothes and items you tell us you own. Add your shoes, bags and jewellery in the optional notes. Unconfirmed items are suggestions with wardrobe swaps, not a requirement to buy anything.",
            ],
            [
              "What if I pay but it doesn’t work?",
              "Use Check payment & result in the studio to recover an interrupted purchase. Failed generations can be retried on that same purchase. If the service still cannot deliver, contact support with your purchase or Razorpay reference for help or a refund under our policy.",
            ],
            [
              "What happens to my photo?",
              "Your selected photo is held in a temporary draft in this browser and sent to our AI provider when you generate the fix. GlamMetrics stores the written result, not the original photo on our server. Read the privacy policy for provider processing details.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-invitation wrap">
        <h2>
          Wear the outfit.
          <br />
          <em>Lose the second-guessing.</em>
        </h2>
        <p>A personal Outfit Fix. ₹99, just once.</p>
        <Link href="/analysis" className="button primary">
          Fix my outfit · ₹99 <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
