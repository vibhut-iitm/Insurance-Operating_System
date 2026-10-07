"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { submitPublicLead } from "@/lib/api";

const categories = [
  { number: "01", title: "Health", description: "Support for the care and confidence your family deserves.", icon: "health" },
  { number: "02", title: "Life", description: "A thoughtful safety net for the people who count on you.", icon: "life" },
  { number: "03", title: "Motor", description: "Cover for everyday journeys, from the school run to the long way home.", icon: "motor" },
  { number: "04", title: "Home", description: "Help protect the place where your life happens.", icon: "home" },
];

const questions = [
  { question: "How do I choose the right insurance?", answer: "Start with what you want to protect, who depends on you, and what you can comfortably afford. Our team can help you compare options and understand the details before you decide." },
  { question: "Can I speak with someone before I buy?", answer: "Yes. Send us an enquiry with the type of cover you are considering and our team will follow up to understand what you need." },
  { question: "How do I make a claim?", answer: "The steps depend on your insurer and policy. Keep your policy details handy and contact your insurer or adviser as soon as possible so they can guide you through the correct process." },
  { question: "Are prices shown on this website?", answer: "No fixed prices are shown because premiums depend on your circumstances, selected cover, and insurer terms. Request a quote for options based on your needs." },
];

function BrandMark() {
  return <span className="brand-mark brand-mark-placeholder" role="img" aria-label="Blank logo image placeholder" />;
}

function LineIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, ReactNode> = {
    health: <><path d="M12 21s-8-4.4-8-11a4.5 4.5 0 0 1 8-2.9A4.5 4.5 0 0 1 20 10c0 6.6-8 11-8 11Z" /><path d="M12 9v6m-3-3h6" /></>,
    life: <><path d="M12 21s-7-3.8-7-9.5a4 4 0 0 1 7-2.6 4 4 0 0 1 7 2.6C19 17.2 12 21 12 21Z" /><path d="M12 5V3m0 9 2 2" /></>,
    motor: <><path d="m5 16 1.4-5.2A2.5 2.5 0 0 1 8.8 9h6.4a2.5 2.5 0 0 1 2.4 1.8L19 16" /><path d="M4 16h16v3H4zm3 3v2m10-2v2M7 13h10" /></>,
    home: <><path d="m3 11 9-7 9 7" /><path d="M5.5 10v10h13V10M9 20v-6h6v6" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name] ?? paths.health}</svg>;
}

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Health");
  const [requirement, setRequirement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await submitPublicLead({ fullName: name, phone, email: email || undefined, category, requirement });
      setMessage("Thank you. Your enquiry has been received, and our team will be in touch.");
      setName("");
      setPhone("");
      setEmail("");
      setRequirement("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not send your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="nav-wrap">
          <Link className="brand" href="/" aria-label="Insurance-Operating_System home">
            <BrandMark />
            <span><strong>Insurance-Operating_System</strong><small>Sample insurance website</small></span>
          </Link>
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
          <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Main navigation">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#coverage" onClick={() => setMenuOpen(false)}>Insurance</a>
            <a href="#plans" onClick={() => setMenuOpen(false)}>How we help</a>
            <a href="#claims" onClick={() => setMenuOpen(false)}>Claims</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          </nav>
          <div className="nav-actions">
            <Link className="button button-outline button-small" href="/login">Workspace login</Link>
            <a className="button button-coral button-small" href="#enquiry">Get started</a>
          </div>
        </div>
      </header>

      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-rule" /> Sample website · Demo information only</p>
          <h1>Feel ready for <em>what comes next.</em></h1>
          <p className="hero-lede">This sample site shows how an insurance experience could explain cover and guide an enquiry. All product names and descriptions are illustrative examples.</p>
          <div className="hero-actions">
            <a className="button button-coral" href="#enquiry">Try the sample enquiry <span aria-hidden="true">↗</span></a>
            <a className="button button-text" href="#coverage">Browse sample cover <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span className="note-check" aria-hidden="true">✓</span><span>Demo information only. No real coverage is offered.</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration representing personal protection">
          <div className="sun-disc" />
          <div className="hero-shape hero-shape-back" />
          <div className="hero-shape hero-shape-front">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="protection-symbol"><span className="hero-logo-placeholder" role="img" aria-label="Blank logo image placeholder" /></div>
            <div className="hero-art-label"><span>SAMPLE PROJECT</span><strong>Insurance<br />experience demo.</strong></div>
            <div className="art-small-number">01 <span>/ 04</span></div>
          </div>
          <div className="floating-note"><span className="floating-dot" /><div><small>Illustrative example</small><strong>Sample cover options</strong></div></div>
          <div className="art-caption">Example content only.<br />Not an insurance offer.</div>
        </div>
      </section>

      <section className="proof-strip" aria-label="Our approach">
        <div className="proof-inner">
          <p>GOOD COVER STARTS WITH <strong>GOOD QUESTIONS.</strong></p>
          <span>Listen first</span><i /><span>Explain clearly</span><i /><span>Choose confidently</span>
        </div>
      </section>

      <section className="coverage-section section-wrap" id="coverage">
        <div className="section-heading">
          <div><p className="eyebrow">Thoughtful cover, for every chapter</p><h2>Protect what matters <em>most.</em></h2></div>
          <p>Life is not one-size-fits-all. Your protection should not be either. Start with the part of life you want to feel more secure about.</p>
        </div>
        <div className="coverage-grid">
          {categories.map((item) => (
            <a className="coverage-card" href="#enquiry" key={item.title} onClick={() => setCategory(item.title)}>
              <div className="coverage-card-top"><span className="category-icon"><LineIcon name={item.icon} /></span><span className="card-number">{item.number}</span></div>
              <h3>{item.title}</h3><p>{item.description}</p>
              <span className="card-link">Explore cover <span aria-hidden="true">↗</span></span>
            </a>
          ))}
        </div>
        <p className="micro-copy">Sample content for demonstration only. Coverage names and descriptions are illustrative; actual availability and terms depend on the insurer and policy selected.</p>
      </section>

      <section className="trust-section" id="about">
        <div className="trust-inner section-wrap">
          <div className="trust-copy">
            <p className="eyebrow eyebrow-light">A steadier way to decide</p>
            <h2>Less fine-print fog.<br /><em>More feeling sure.</em></h2>
            <p>We help you make sense of the choices, trade-offs and details, so you can choose cover with your eyes open and your priorities in focus.</p>
            <a className="button button-cream" href="#enquiry">Talk it through <span aria-hidden="true">↗</span></a>
          </div>
          <div className="trust-visual">
            <div className="trust-ring"><div className="trust-ring-inner"><span>SAMPLE APPROACH</span><strong>People<br />before<br /><em>policies.</em></strong><small>Illustrative sample content.</small></div></div>
            <div className="trust-aside"><span className="trust-aside-line" /><p>Understand your options.<br />Take the time you need.<br /><strong>Choose what feels right.</strong></p></div>
            <span className="trust-spark" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="plans-section section-wrap" id="plans">
        <div className="section-heading">
          <div><p className="eyebrow">A little help goes a long way</p><h2>Good advice is part of <em>the cover.</em></h2></div>
          <p>Start wherever you are. We will help you understand the next step without rushing you into a decision.</p>
        </div>
        <div className="plans-grid">
          <article className="plan-card">
            <span className="plan-index">01 / UNDERSTAND</span><h3>Make sense of it all.</h3>
            <p>Get the basics in plain language, with room to ask every question on your mind.</p>
            <a href="#enquiry">Start a conversation <span aria-hidden="true">↗</span></a>
          </article>
          <article className="plan-card plan-card-featured">
            <span className="plan-index">02 / COMPARE</span><h3>See the whole picture.</h3>
            <p>Compare cover, costs and important details to understand what fits your priorities.</p>
            <a href="#enquiry">Explore your options <span aria-hidden="true">↗</span></a>
          </article>
          <article className="plan-card">
            <span className="plan-index">03 / FEEL READY</span><h3>Choose at your pace.</h3>
            <p>Take the time to decide. When you are ready, we can help you take the next step.</p>
            <a href="#enquiry">Get personal guidance <span aria-hidden="true">↗</span></a>
          </article>
        </div>
      </section>

      <section className="enquiry-section section-wrap" id="enquiry">
        <div className="enquiry-intro">
          <p className="eyebrow">A good place to begin</p>
          <h2>Tell us what you are <em>thinking about.</em></h2>
          <p>This form demonstrates the enquiry flow and sends submissions to the connected demo backend.</p>
          <div className="enquiry-aside"><span className="aside-icon"><LineIcon name="life" /></span><span>Use test details only. Do not enter real personal information.</span></div>
        </div>
        <form className="enquiry-form" onSubmit={handleEnquiry}>
          <div className="form-heading"><span>DEMO ENQUIRY</span><span>01 <i>/</i> 01</span></div>
          <h3>Try the sample form.</h3>
          <label>Your name<input required autoComplete="name" maxLength={160} value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" /></label>
          <div className="form-row">
            <label>Phone number<input required autoComplete="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Your best contact number" /></label>
            <label>Email <span className="optional-label">OPTIONAL</span><input type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          </div>
          <label>What would you like to protect?
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Health</option><option>Life</option><option>Motor</option><option>Home</option><option>Business</option><option>Something else</option>
            </select>
          </label>
          <label>Anything you would like us to know?
            <textarea required minLength={5} maxLength={3000} value={requirement} onChange={(event) => setRequirement(event.target.value)} placeholder="A little about what you need is a great start." rows={3} />
          </label>
          {message && <p className={message.startsWith("Thank you") ? "form-message form-success" : "form-message form-error"} role="status">{message}</p>}
          <button className="button button-coral form-submit" type="submit" disabled={submitting}>{submitting ? "Sending sample enquiry..." : "Send sample enquiry"} <span aria-hidden="true">↗</span></button>
          <p className="form-privacy">Demo only. Test details may be stored by the connected backend; do not submit real personal information.</p>
        </form>
      </section>

      <section className="claims-section" id="claims">
        <div className="claims-inner section-wrap">
          <div><p className="eyebrow">When life takes a turn</p><h2>Here for the <em>next step, too.</em></h2><p>When it is time to make a claim, clear support matters. We can help you understand where to begin and who to contact.</p></div>
          <div className="claims-steps">
            <article><span>01</span><div><h3>Keep your details close</h3><p>Have your policy number and the key information about what happened ready.</p></div></article>
            <article><span>02</span><div><h3>Contact your insurer</h3><p>Claim rules differ by policy. Contact the insurer promptly to confirm the required steps.</p></div></article>
            <article><span>03</span><div><h3>Ask us to help clarify</h3><p>If you need help understanding the process, reach out and we will point you in the right direction.</p></div></article>
          </div>
        </div>
      </section>

      <section className="values-section section-wrap">
        <div className="values-heading"><p className="eyebrow eyebrow-light">Sample service principles</p><h2>Care that goes beyond <em>the paperwork.</em></h2><p>Example content only. This demo does not represent a real insurance provider or an offer of coverage.</p></div>
        <div className="values-grid">
          <article><span>01</span><h3>Clear by design</h3><p>Useful explanations, honest conversations and no unnecessary jargon.</p></article>
          <article><span>02</span><h3>Built around you</h3><p>Your questions and priorities come before a list of products.</p></article>
          <article><span>03</span><h3>Here when it counts</h3><p>Guidance to help you understand the way forward, at every stage.</p></article>
        </div>
      </section>

      <section className="faq-section section-wrap" id="faq">
        <div className="faq-intro"><p className="eyebrow">Good questions welcome</p><h2>A few things you might <em>wonder about.</em></h2><p>Still unsure? Tell us what is on your mind and we will help you find an answer.</p><a href="#enquiry" className="text-link">Ask us directly <span aria-hidden="true">↗</span></a></div>
        <div className="faq-list">
          {questions.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-inner section-wrap"><div><p className="eyebrow">Your next chapter, better protected</p><h2>Let’s make feeling sure <em>feel simple.</em></h2></div><a className="button button-dark" href="#enquiry">Start a conversation <span aria-hidden="true">↗</span></a></div>
      </section>

      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <div className="footer-brand"><Link className="brand" href="/"><BrandMark /><span><strong>Insurance-Operating_System</strong><small>Sample insurance website</small></span></Link><p>Sample copy for a connected insurance experience.</p></div>
          <div className="footer-links"><div><h3>Explore</h3><a href="#coverage">Insurance</a><a href="#plans">How we help</a><a href="#claims">Claims support</a></div><div><h3>Connect</h3><a href="#enquiry">Talk to our team</a><Link href="/login">Workspace login</Link><a href="#faq">Common questions</a></div></div>
        </div>
        <div className="footer-bottom section-wrap"><span>© {new Date().getFullYear()} Insurance-Operating_System · Sample website</span><span>Demo information only. Not an insurance quote, policy, or offer of coverage.</span></div>
      </footer>
    </main>
  );
}
