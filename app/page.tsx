import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ArrowUpRight,
  Camera,
  Shirt,
  Bookmark,
  Plus,
} from "lucide-react";

const benefits = [
  "3 complete looks per outfit",
  "A no-shopping version",
  "Made for your occasion",
];
export default function Home() {
  return (
    <main id="main" className="home">
      <section className="landing-hero wrap">
        <div className="landing-hero-copy">
          <h1>
            You have the clothes.
            <br />
            <em>Let’s make the look.</em>
          </h1>
          <p>
            Turn an outfit photo into three ways to wear it—with the right
            shoes, accessories and finishing touches. Personal AI styling for
            your plans, your budget and your wardrobe.
          </p>
          <Link className="button primary" href="/analysis">
            Get my first style plan free <ArrowRight size={18} />
          </Link>
          <div className="hero-reassurance">
            <Check size={14} />
            No card needed <span>·</span> ₹99/month when you’re ready
          </div>
          <Link href="/sample" className="text-link">
            See exactly what you’ll receive <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="landing-hero-art">
          <div className="hero-outfit-photo">
            <Image
              src="/images/street-edit.png"
              alt="A pink blazer styled with black denim and understated silver jewellery"
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
              <strong>One outfit. More possibilities.</strong>
              <p>Workday polish · Weekend coffee · Dinner out</p>
            </div>
          </div>
          <p className="image-disclosure">Illustrative styling example</p>
        </div>
      </section>
      <div className="value-bar">
        <div className="wrap">
          {benefits.map((item) => (
            <span key={item}>
              <Check size={15} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="landing-section wrap" id="how-it-works">
        <div className="landing-heading">
          <h2>
            For the “what do I wear?”
            <br />
            <em>moments.</em>
          </h2>
          <p>
            A dinner invite. A workday. Another wedding. You don’t always need a
            new outfit. Sometimes you need a different way to put it together.
          </p>
        </div>
        <div className="occasion-editorial-grid">
          <Link
            className="occasion-editorial-card"
            href="/analysis?occasion=Work"
          >
            <div className="occasion-image">
              <Image
                src="/images/street-edit.png"
                alt="Relaxed pink tailoring for a smart everyday outfit"
                fill
                sizes="(max-width:700px) 44vw, 35vw"
              />
            </div>
            <div>
              <h3>The everyday outfit</h3>
              <p>Feel put-together for work, coffee and everything between.</p>
              <span>
                Style my everyday look <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
          <Link
            className="occasion-editorial-card"
            href="/analysis?occasion=Wedding%20guest"
          >
            <div className="occasion-image">
              <Image
                src="/images/editorial.png"
                alt="A rose saree with gold accessories for a special occasion"
                fill
                sizes="(max-width:700px) 44vw, 35vw"
              />
            </div>
            <div>
              <h3>The special occasion</h3>
              <p>
                Sarees, kurtas and celebration looks, with the details sorted.
              </p>
              <span>
                Plan my occasion look <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
          <div className="wardrobe-message">
            <Shirt size={32} strokeWidth={1.2} />
            <h3>
              Start with what
              <br />
              you already love.
            </h3>
            <p>
              Tell us the shoes, bags and jewellery you own. Choose “Use what I
              own” for a plan that prioritises your wardrobe.
            </p>
            <Link href="/analysis" className="text-link">
              No shopping required <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="sample-section" id="your-plan">
        <div className="wrap sample-section-grid">
          <div className="sample-explanation">
            <h2>
              Advice you can
              <br />
              <em>actually get dressed with.</em>
            </h2>
            <p>
              Each plan turns one outfit into three complete looks. You’ll know
              what to wear with it, what to change, and which details to skip.
            </p>
            <ul>
              {[
                "A look for the occasion you chose",
                "Two alternative ways to restyle the same outfit",
                "Shoes, accessories and finishing touches",
                "A wardrobe-first version and a practical checklist",
              ].map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/sample" className="button secondary">
              Explore a full sample plan <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="sample-plan-preview">
            <div className="sample-preview-heading">
              <span>Example: a dinner outfit</span>
              <Bookmark size={18} />
            </div>
            <h3>
              Your pink blazer,
              <br />
              ready for the evening.
            </h3>
            <div className="preview-look-tabs">
              <span>Dinner out</span>
              <span>Workday</span>
              <span>Weekend</span>
            </div>
            <dl>
              <div>
                <dt>The outfit</dt>
                <dd>
                  Pink blazer + black top + your dark jeans. Keep the blazer
                  open for a relaxed finish.
                </dd>
              </div>
              <div>
                <dt>The finishing touches</dt>
                <dd>
                  Small silver earrings, a black bag and comfortable black
                  flats—if you own them.
                </dd>
              </div>
              <div>
                <dt>Skip the shopping</dt>
                <dd>
                  Keep your current bag and jewellery. A neat sleeve fold is
                  enough to change the feel.
                </dd>
              </div>
            </dl>
            <div className="sample-preview-footer">
              <Check size={15} /> A plan to save and use again
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section wrap process-section">
        <div className="landing-heading">
          <h2>
            A little styling help.
            <br />
            <em>A very simple start.</em>
          </h2>
          <p>You bring the outfit. We’ll help with the details.</p>
        </div>
        <div className="process-grid">
          {[
            {
              icon: Camera,
              title: "Upload your outfit",
              text: "A clear mirror selfie works. Make sure the full outfit is visible.",
            },
            {
              icon: Shirt,
              title: "Tell us your plans",
              text: "Pick the occasion, budget and any pieces you want to use.",
            },
            {
              icon: Bookmark,
              title: "Save your style plan",
              text: "Choose one of three looks. Follow your checklist, and keep the plan for later.",
            },
          ].map((step, i) => (
            <div key={step.title}>
              <div className="process-number">
                0{i + 1}
                <step.icon size={21} strokeWidth={1.3} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section wrap" id="membership">
        <div className="offer-layout">
          <div className="offer-copy">
            <h2>
              Your wardrobe has
              <br />
              <em>more to give.</em>
            </h2>
            <p>
              Make room for a fresh idea each time you get dressed for something
              that matters. Style Circle gives you 10 personal plans a month,
              saved in one place.
            </p>
            <div className="offer-uses">
              <span>Office days</span>
              <span>Dinner plans</span>
              <span>Wedding invites</span>
              <span>Festival outfits</span>
            </div>
            <p className="offer-free-note">
              Start with one complete plan free. See the value before you
              subscribe.
            </p>
          </div>
          <div className="offer-card">
            <h3>Style Circle</h3>
            <div className="offer-price">
              ₹99<span>/ month</span>
            </div>
            <p>10 outfit plans. 3 styled looks in every plan.</p>
            <ul>
              {[
                "Up to 30 look ideas from 10 outfit photos",
                "Wardrobe-first styling, suited to your budget",
                "Saved personal style preferences",
                "Getting-ready checklists & saved plans",
                "Cancel future billing from your account",
              ].map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
            <Link className="button primary full" href="/pricing">
              See membership details <ArrowRight size={17} />
            </Link>
            <p className="fineprint center">
              ₹99 billed monthly. Unused plans don’t roll over.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-section wrap landing-faq">
        <div>
          <h2>
            A few things
            <br />
            <em>you might ask.</em>
          </h2>
          <p>
            Something else on your mind?
            <br />
            <Link className="text-link" href="/contact">
              Get in touch <ArrowUpRight size={16} />
            </Link>
          </p>
        </div>
        <div>
          {[
            [
              "Why pay for this instead of asking a chatbot?",
              "GlamMetrics gives your outfit a consistent, saveable plan: three complete ways to style it, a wardrobe-first version, a checklist and a colour palette. Your saved comfort and wardrobe preferences are used in future plans. You can try a complete plan free and decide whether the convenience is worth ₹99/month to you.",
            ],
            [
              "Is this a human stylist?",
              "No. Plans are generated by AI using your outfit photo and preferences. They are suggestions, not guarantees. We focus on your clothes, coordination and occasion—not rating your face or body.",
            ],
            [
              "Does it work for sarees and kurtas?",
              "Yes. Use it for Indian, western and fusion outfits. Tell us the occasion and any comfort or coverage preferences so your plan fits how you like to dress.",
            ],
            [
              "Will I need to buy more clothes?",
              "You can choose “Use what I own” and list the pieces you already have. Your plan will prioritise visible and explicitly owned items. Shopping suggestions are optional budget ideas, not live product listings.",
            ],
            [
              "How does the free plan work?",
              "Create an account and upload one outfit. Your first complete plan is free with no payment details. Style Circle adds 10 plans per paid billing month for ₹99; unused plans don’t roll over.",
            ],
            [
              "Are my outfit photos saved?",
              "Your photo is sent to our AI provider to generate the plan. GlamMetrics saves your written plan, not the original image. Our privacy policy explains provider processing and retention.",
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
          Meet your wardrobe
          <br />
          <em>all over again.</em>
        </h2>
        <p>Your first personal outfit plan is on us.</p>
        <Link href="/analysis" className="button primary">
          Create my free style plan <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
