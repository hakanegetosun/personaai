"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    const nav = document.getElementById("navbar");

    const onScroll = () => {
      if (!nav) return;
      if (window.scrollY > 16) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", onScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((r) => observer.observe(r));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #0C0A13;
          --surface: #141120;
          --surface2: #1A1628;
          --surface3: #201C30;
          --border: #251F38;
          --border2: #312A4A;
          --accent: #9B6DFF;
          --accent2: #C084FC;
          --accent-dim: #4B3580;
          --cta-from: #A855F7;
          --cta-to: #EC4899;
          --white: #F3F0FF;
          --muted: #7A7290;
          --muted2: #4A4460;
          --tag-bg: rgba(155,109,255,0.12);
          --tag-border: rgba(155,109,255,0.25);
        }

        * , *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        .lp-root {
          background: var(--bg);
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          line-height: 1.6;
          overflow-x: hidden;
          position: relative;
        }

        .lp-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.022;
          pointer-events: none;
          z-index: 9999;
        }

        .lp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0 40px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid transparent;
          transition: background .3s, border-color .3s, backdrop-filter .3s;
        }

        .lp-nav.scrolled {
          background: rgba(12,10,19,.88);
          backdrop-filter: blur(20px);
          border-color: var(--border);
        }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--white);
          text-decoration: none;
          letter-spacing: .01em;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          list-style: none;
        }

        .nav-links a {
          font-size: 13px;
          font-weight: 400;
          color: var(--muted);
          text-decoration: none;
          letter-spacing: .04em;
          transition: color .2s;
        }

        .nav-links a:hover {
          color: var(--white);
        }

        .nav-cta {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
          padding: 9px 22px;
          border-radius: 20px;
          text-decoration: none;
          transition: opacity .2s, transform .15s;
        }

        .nav-cta:hover {
          opacity: .88;
          transform: translateY(-1px);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
          position: relative;
          overflow: hidden;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(90px);
        }

        .orb-a {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(155,109,255,.12) 0%, transparent 70%);
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          animation: driftA 14s ease-in-out infinite;
        }

        .orb-b {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(192,132,252,.07) 0%, transparent 70%);
          bottom: 60px;
          left: -60px;
          animation: driftB 18s ease-in-out infinite;
        }

        .orb-c {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(236,72,153,.06) 0%, transparent 70%);
          bottom: 80px;
          right: -40px;
          animation: driftB 20s ease-in-out infinite reverse;
        }

        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(155,109,255,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,109,255,.04) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 75% 55% at 50% 40%, black 10%, transparent 80%);
        }

        @keyframes driftA {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-28px); }
        }

        @keyframes driftB {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .35; }
        }

        @keyframes scrollPulse {
          0%, 100% { opacity: .4; }
          50% { opacity: 1; }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--tag-bg);
          border: 1px solid var(--tag-border);
          border-radius: 20px;
          padding: 6px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: var(--accent2);
          margin-bottom: 36px;
          opacity: 0;
          animation: fadeUp .7s ease forwards .15s;
          position: relative;
          z-index: 1;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 2.5s ease-in-out infinite;
        }

        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(44px, 6.5vw, 86px);
          font-weight: 500;
          line-height: 1.06;
          letter-spacing: -.02em;
          max-width: 860px;
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeUp .85s ease forwards .3s;
          position: relative;
          z-index: 1;
        }

        .hero h1 em {
          font-style: italic;
          background: linear-gradient(135deg, var(--accent2), var(--cta-to));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 300;
          color: var(--muted);
          max-width: 520px;
          line-height: 1.75;
          margin-bottom: 44px;
          opacity: 0;
          animation: fadeUp .85s ease forwards .45s;
          position: relative;
          z-index: 1;
        }

        .hero-ctas {
          display: flex;
          gap: 14px;
          align-items: center;
          opacity: 0;
          animation: fadeUp .85s ease forwards .6s;
          position: relative;
          z-index: 1;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
          color: #fff;
          padding: 14px 32px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: .02em;
          border-radius: 24px;
          text-decoration: none;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          display: inline-block;
        }

        .btn-primary:hover {
          opacity: .9;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(168,85,247,.3);
        }

        .btn-ghost {
          color: var(--muted);
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 400;
          text-decoration: none;
          border: 1px solid var(--border2);
          border-radius: 24px;
          transition: color .2s, border-color .2s;
        }

        .btn-ghost:hover {
          color: var(--white);
          border-color: var(--muted2);
        }

        .scroll-hint {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0;
          animation: fadeIn 1s ease forwards 1.1s;
          z-index: 1;
        }

        .scroll-hint span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: .2em;
          color: var(--muted2);
          text-transform: uppercase;
        }

        .scroll-line {
          width: 1px;
          height: 36px;
          background: linear-gradient(to bottom, var(--accent-dim), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }

        .platform-bar {
          padding: 24px 40px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
        }

        .pbar-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: .16em;
          color: var(--muted2);
          text-transform: uppercase;
        }

        .platform-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 400;
        }

        .pdot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .lp-section {
          padding: 100px 40px;
        }

        .section-inner {
          max-width: 1080px;
          margin: 0 auto;
        }

        .eye {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: .2em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .stitle {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 3.8vw, 50px);
          font-weight: 500;
          line-height: 1.1;
          letter-spacing: -.01em;
          margin-bottom: 18px;
        }

        .stitle em {
          font-style: italic;
          background: linear-gradient(135deg, var(--accent2), var(--cta-to));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ssub {
          font-size: 16px;
          font-weight: 300;
          color: var(--muted);
          max-width: 480px;
          line-height: 1.75;
        }

        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          margin-top: 60px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .how-card {
          background: var(--surface);
          padding: 44px 36px;
          position: relative;
          overflow: hidden;
          transition: background .25s;
        }

        .how-card:hover {
          background: var(--surface2);
        }

        .how-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
          transform: scaleX(0);
          transition: transform .4s;
        }

        .how-card:hover::after {
          transform: scaleX(1);
        }

        .how-num {
          font-family: 'Playfair Display', serif;
          font-size: 56px;
          font-weight: 500;
          color: var(--border2);
          font-style: italic;
          line-height: 1;
          margin-bottom: 28px;
        }

        .how-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .how-card p {
          font-size: 14px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }

        .features-section {
          background: var(--surface);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 60px;
        }

        .feature-card {
          background: var(--bg);
          border: 1px solid var(--border);
          padding: 32px 28px;
          border-radius: 4px;
          transition: border-color .25s, transform .2s;
        }

        .feature-card:hover {
          border-color: var(--accent-dim);
          transform: translateY(-3px);
        }

        .ficon {
          width: 36px;
          height: 36px;
          color: var(--accent);
          margin-bottom: 22px;
        }

        .feature-card h3 {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 10px;
        }

        .feature-card p {
          font-size: 13px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
        }

        .ftag {
          display: inline-block;
          margin-top: 18px;
          background: var(--tag-bg);
          border: 1px solid var(--tag-border);
          border-radius: 12px;
          padding: 3px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .ftag-soon {
          display: inline-block;
          margin-top: 18px;
          background: rgba(74,222,128,.08);
          border: 1px solid rgba(74,222,128,.2);
          border-radius: 12px;
          padding: 3px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #4ade80;
        }

        .studio-inner {
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 72px;
          align-items: center;
        }

        .studio-mockup {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .studio-mockup::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(155,109,255,.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .m-bar {
          display: flex;
          gap: 6px;
          margin-bottom: 18px;
        }

        .m-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--border2);
        }

        .m-header {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 14px;
        }

        .m-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .m-tab {
          font-size: 11px;
          font-weight: 400;
          color: var(--muted);
          padding: 5px 12px;
          border-radius: 14px;
          background: var(--surface2);
        }

        .m-tab.active {
          background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
          color: #fff;
          font-weight: 500;
        }

        .m-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .m-card {
          background: var(--surface2);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .m-thumb {
          width: 40px;
          height: 56px;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--accent-dim), var(--border2));
          flex-shrink: 0;
        }

        .m-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding-top: 2px;
        }

        .m-line {
          height: 6px;
          background: var(--border2);
          border-radius: 3px;
        }

        .m-line.short {
          width: 55%;
        }

        .m-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--tag-bg);
          border: 1px solid var(--tag-border);
          border-radius: 8px;
          padding: 2px 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-top: 4px;
          width: fit-content;
        }

        .mpd {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          animation: pulse 2s ease-in-out infinite;
        }

        .m-pill.queued {
          background: rgba(250,204,21,.08);
          border-color: rgba(250,204,21,.2);
          color: #facc15;
        }

        .pricing-section {
          background: var(--surface);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 60px;
        }

        .plan-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 36px 28px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: border-color .25s;
        }

        .plan-card:hover {
          border-color: var(--border2);
        }

        .plan-card.featured {
          background: var(--surface2);
          border-color: var(--accent-dim);
        }

        .plan-badge {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
          padding: 5px 16px;
          border-radius: 0 0 10px 10px;
          white-space: nowrap;
        }

        .plan-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 20px;
          margin-top: 12px;
        }

        .plan-card.featured .plan-label {
          margin-top: 28px;
        }

        .plan-price {
          font-family: 'Playfair Display', serif;
          font-size: 52px;
          font-weight: 500;
          line-height: 1;
          margin-bottom: 4px;
        }

        .plan-price sup {
          font-size: 22px;
          vertical-align: super;
          font-weight: 400;
          color: var(--accent2);
        }

        .plan-period {
          font-size: 12px;
          color: var(--muted);
          font-weight: 300;
          margin-bottom: 28px;
        }

        .plan-divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 24px;
        }

        .plan-quota {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }

        .quota-item {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 10px 8px;
          text-align: center;
        }

        .plan-card.featured .quota-item {
          background: var(--surface3);
          border-color: var(--border2);
        }

        .quota-num {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 500;
          color: var(--white);
          line-height: 1;
          margin-bottom: 2px;
        }

        .quota-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--muted2);
        }

        .plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          margin-bottom: 28px;
        }

        .plan-features li {
          font-size: 13px;
          font-weight: 300;
          color: var(--muted);
          display: flex;
          gap: 9px;
          align-items: baseline;
          line-height: 1.5;
        }

        .plan-features li::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--border2);
          flex-shrink: 0;
          position: relative;
          top: -1px;
        }

        .plan-features li.hi {
          color: var(--white);
        }

        .plan-features li.hi::before {
          background: var(--accent);
        }

        .plan-features li.soon {
          color: var(--muted2);
        }

        .plan-features li.soon::before {
          background: rgba(74,222,128,.3);
        }

        .plan-btn {
          display: block;
          text-align: center;
          padding: 13px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: .04em;
          text-decoration: none;
          border-radius: 20px;
          transition: all .2s;
        }

        .plan-btn-ghost {
          border: 1px solid var(--border2);
          color: var(--muted);
        }

        .plan-btn-ghost:hover {
          border-color: var(--muted);
          color: var(--white);
        }

        .plan-btn-gradient {
          background: linear-gradient(135deg, var(--cta-from), var(--cta-to));
          color: #fff;
        }

        .plan-btn-gradient:hover {
          opacity: .88;
          box-shadow: 0 8px 30px rgba(168,85,247,.25);
        }

        .cta-section {
          text-align: center;
          position: relative;
          overflow: hidden;
          background: var(--surface);
          padding: 100px 40px;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 55% 70% at 50% 50%, rgba(155,109,255,.07), transparent);
        }

        .lp-footer {
          padding: 60px 40px 36px;
          border-top: 1px solid var(--border);
        }

        .footer-inner {
          max-width: 1080px;
          margin: 0 auto;
        }

        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 52px;
          margin-bottom: 52px;
        }

        .footer-brand p {
          font-size: 13px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          margin-top: 12px;
          max-width: 240px;
        }

        .footer-col h4 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--muted2);
          margin-bottom: 18px;
        }

        .footer-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .footer-col a {
          font-size: 13px;
          font-weight: 300;
          color: var(--muted);
          text-decoration: none;
          transition: color .2s;
        }

        .footer-col a:hover {
          color: var(--white);
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }

        .footer-copy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: .08em;
          color: var(--muted2);
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: .08em;
          color: var(--muted2);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse 3s ease-in-out infinite;
        }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .75s ease, transform .75s ease;
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 960px) {
          .lp-nav {
            padding: 0 20px;
          }

          .nav-links {
            display: none;
          }

          .lp-section, .cta-section, .lp-footer {
            padding-left: 24px;
            padding-right: 24px;
          }

          .how-grid, .features-grid, .pricing-grid {
            grid-template-columns: 1fr;
          }

          .studio-inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 36px;
          }

          .platform-bar {
            gap: 24px;
            padding: 24px 20px;
            flex-wrap: wrap;
          }

          .hero-ctas {
            flex-direction: column;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
        }
      `}</style>

      <div className="lp-root">
        <nav id="navbar" className="lp-nav">
          <a className="nav-logo" href="#">
            Aviora
          </a>
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
          </ul>
          <a className="nav-cta" href="/signup">
            Get Started
          </a>
        </nav>

        <section className="hero">
          <div className="hero-orb orb-a" />
          <div className="hero-orb orb-b" />
          <div className="hero-orb orb-c" />

          <div className="hero-badge">
            <div className="badge-dot" />
            AI Creator Platform
          </div>

          <h1>
            Content that looks like you.
            <br />
            <em>Built to perform.</em>
          </h1>

          <p className="hero-sub">
            Aviora generates high-quality creator content matched to your persona, your
            niche, and what is trending right now — with the production controls that
            matter.
          </p>

          <div className="hero-ctas">
            <a className="btn-primary" href="/signup">
              Start Creating
            </a>
            <a className="btn-ghost" href="#features">
              See How It Works
            </a>
          </div>

          <div className="scroll-hint">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        <div className="platform-bar">
          <span className="pbar-label">Built for creators on</span>

          <div className="platform-pill">
            <div className="pdot" style={{ background: "#ff0050" }} />
            TikTok
          </div>

          <div className="platform-pill">
            <div className="pdot" style={{ background: "#c13584" }} />
            Instagram
          </div>

          <div className="platform-pill">
            <div className="pdot" style={{ background: "#9B6DFF" }} />
            Your Persona
          </div>
        </div>

        <section className="lp-section" id="features">
          <div className="section-inner">
            <div className="reveal">
              <div className="eye">How It Works</div>
              <h2 className="stitle">
                From trend signal
                <br />
                to finished content.
              </h2>
            </div>

            <div className="how-grid reveal" style={{ transitionDelay: ".1s" }}>
              <div className="how-card">
                <div className="how-num">01</div>
                <h3>Discover Trends</h3>
                <p>
                  Aviora surfaces trending hooks, formats, and caption structures matched
                  to your niche so generation starts with signal, not guesswork.
                </p>
              </div>

              <div className="how-card">
                <div className="how-num">02</div>
                <h3>Generate Content</h3>
                <p>
                  One click produces reels, posts, and stories built around your persona
                  and style. Higher-tier plans add identity controls for greater
                  consistency.
                </p>
              </div>

              <div className="how-card">
                <div className="how-num">03</div>
                <h3>Review and Export</h3>
                <p>
                  Manage your generated content in the Studio, review output quality,
                  export for publishing, and build a consistent creative library over
                  time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section features-section">
          <div className="section-inner">
            <div className="reveal">
              <div className="eye">Core Capabilities</div>
              <h2 className="stitle">
                The tools a serious
                <br />
                creator <em>actually needs.</em>
              </h2>
            </div>

            <div className="features-grid">
              <div className="feature-card reveal" style={{ transitionDelay: ".04s" }}>
                <svg
                  className="ficon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <h3>Trend Intelligence</h3>
                <p>
                  Surface trending hook patterns, shot structures, and caption formulas
                  relevant to your niche before you generate anything.
                </p>
                <span className="ftag">All Plans</span>
              </div>

              <div className="feature-card reveal" style={{ transitionDelay: ".08s" }}>
                <svg
                  className="ficon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                </svg>
                <h3>Allure Mode</h3>
                <p>
                  Premium output polish applied at generation time. Better lighting,
                  refined styling, elevated visual quality on every paid plan.
                </p>
                <span className="ftag">Pro+</span>
              </div>

              <div className="feature-card reveal" style={{ transitionDelay: ".12s" }}>
                <svg
                  className="ficon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  />
                </svg>
                <h3>Identity Lock</h3>
                <p>
                  Advanced creator identity controls that enforce visual consistency
                  across your content. Available on Creator plan and above.
                </p>
                <span className="ftag">Creator+</span>
              </div>

              <div className="feature-card reveal" style={{ transitionDelay: ".04s" }}>
                <svg
                  className="ficon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4"
                  />
                </svg>
                <h3>Async Reel Engine</h3>
                <p>
                  Video generation runs as a background job. Queue your reels, close the
                  studio, and come back to finished content.
                </p>
                <span className="ftag">All Plans</span>
              </div>

              <div className="feature-card reveal" style={{ transitionDelay: ".08s" }}>
                <svg
                  className="ficon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <h3>Smart Controls</h3>
                <p>
                  Set content strategy, visual look, motion feel, and output priorities.
                  Each setting maps to deterministic generation behavior.
                </p>
                <span className="ftag">Creator</span>
              </div>

              <div className="feature-card reveal" style={{ transitionDelay: ".12s" }}>
                <svg
                  className="ficon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <h3>Auto-Publish</h3>
                <p>
                  Direct publishing to TikTok and Instagram is on the roadmap. Export
                  your finished content today and publish on your schedule.
                </p>
                <span className="ftag-soon">Coming Soon</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="studio-inner">
            <div className="reveal">
              <div className="eye">The Studio</div>
              <h2 className="stitle">
                Your entire creator
                <br />
                workflow, <em>one place.</em>
              </h2>
              <p className="ssub" style={{ marginBottom: 32 }}>
                Personas, trend briefs, generation queue, and content library in a
                single clean interface designed for consistent, high-quality output.
              </p>
              <a className="btn-primary" href="/signup">
                Open the Studio
              </a>
            </div>

            <div className="studio-mockup reveal" style={{ transitionDelay: ".18s" }}>
              <div className="m-bar">
                <div className="m-dot" />
                <div className="m-dot" />
                <div className="m-dot" />
              </div>

              <div className="m-header">Studio</div>

              <div className="m-tabs">
                <div className="m-tab active">30 Days</div>
                <div className="m-tab">Advanced</div>
                <div className="m-tab">Brand</div>
              </div>

              <div className="m-cards">
                <div className="m-card">
                  <div className="m-thumb" />
                  <div className="m-info">
                    <div className="m-line" />
                    <div className="m-line short" />
                    <div className="m-pill">
                      <div className="mpd" />
                      Generating
                    </div>
                  </div>
                </div>

                <div className="m-card">
                  <div
                    className="m-thumb"
                    style={{ background: "linear-gradient(135deg,#2a2535,#1a1628)" }}
                  />
                  <div className="m-info">
                    <div className="m-line" />
                    <div className="m-line" style={{ width: "75%" }} />
                    <div className="m-pill queued">
                      <div
                        className="mpd"
                        style={{ background: "#facc15", animation: "none" }}
                      />
                      Scheduled
                    </div>
                  </div>
                </div>

                <div
                  className="m-card"
                  style={{
                    background: "rgba(155,109,255,.06)",
                    border: "1px solid rgba(155,109,255,.14)",
                  }}
                >
                  <div
                    className="m-thumb"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(155,109,255,.3),rgba(155,109,255,.08))",
                    }}
                  />
                  <div className="m-info">
                    <div className="m-line" style={{ background: "rgba(155,109,255,.2)" }} />
                    <div
                      className="m-line short"
                      style={{ background: "rgba(155,109,255,.14)" }}
                    />
                    <div className="m-pill">Trend Match 91%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section pricing-section" id="pricing">
          <div className="section-inner">
            <div className="reveal" style={{ textAlign: "center" }}>
              <div className="eye" style={{ display: "flex", justifyContent: "center" }}>
                Pricing
              </div>
              <h2 className="stitle" style={{ maxWidth: 500, margin: "0 auto 14px" }}>
                Clear plans.
                <br />
                <em>No surprises.</em>
              </h2>
              <p className="ssub" style={{ margin: "0 auto", textAlign: "center" }}>
                Start where you are. Upgrade as your output demands grow.
              </p>
            </div>

            <div className="pricing-grid reveal" style={{ transitionDelay: ".12s" }}>
              <div className="plan-card">
                <div className="plan-label">Pro</div>
                <div className="plan-price">
                  <sup>$</sup>29
                </div>
                <div className="plan-period">per month</div>
                <div className="plan-divider" />

                <div className="plan-quota">
                  <div className="quota-item">
                    <div className="quota-num">4</div>
                    <div className="quota-label">Reels</div>
                  </div>
                  <div className="quota-item">
                    <div className="quota-num">12</div>
                    <div className="quota-label">Posts</div>
                  </div>
                  <div className="quota-item">
                    <div className="quota-num">12</div>
                    <div className="quota-label">Stories</div>
                  </div>
                </div>

                <ul className="plan-features">
                  <li className="hi">Allure Mode</li>
                  <li className="hi">Premium output quality</li>
                  <li>Trend suggestions</li>
                  <li>Draft export</li>
                  <li>1 active persona</li>
                  <li className="soon">Auto-publish (Coming Soon)</li>
                </ul>

                <a className="plan-btn plan-btn-ghost" href="/signup">
                  Get Started
                </a>
              </div>

              <div className="plan-card featured">
                <div className="plan-badge">Most Popular</div>
                <div className="plan-label">Creator</div>
                <div className="plan-price">
                  <sup>$</sup>89
                </div>
                <div className="plan-period">per month</div>
                <div className="plan-divider" />

                <div className="plan-quota">
                  <div className="quota-item">
                    <div className="quota-num">8</div>
                    <div className="quota-label">Reels</div>
                  </div>
                  <div className="quota-item">
                    <div className="quota-num">24</div>
                    <div className="quota-label">Posts</div>
                  </div>
                  <div className="quota-item">
                    <div className="quota-num">24</div>
                    <div className="quota-label">Stories</div>
                  </div>
                </div>

                <ul className="plan-features">
                  <li className="hi">Allure Mode</li>
                  <li className="hi">Identity Lock</li>
                  <li className="hi">Smart Controls</li>
                  <li className="hi">Creator consistency workflow</li>
                  <li>3 active personas</li>
                  <li className="soon">Auto-publish (Coming Soon)</li>
                </ul>

                <a
                  className="plan-btn plan-btn-gradient"
                  href="/signup"
                >
                  Get Started
                </a>
              </div>

              <div className="plan-card">
                <div className="plan-label">Agency</div>
                <div className="plan-price">
                  <sup>$</sup>229
                </div>
                <div className="plan-period">per month</div>
                <div className="plan-divider" />

                <div className="plan-quota">
                  <div className="quota-item">
                    <div className="quota-num">20</div>
                    <div className="quota-label">Reels</div>
                  </div>
                  <div className="quota-item">
                    <div className="quota-num">60</div>
                    <div className="quota-label">Posts</div>
                  </div>
                  <div className="quota-item">
                    <div className="quota-num">60</div>
                    <div className="quota-label">Stories</div>
                  </div>
                </div>

                <ul className="plan-features">
                  <li className="hi">Allure Mode + Identity Lock</li>
                  <li className="hi">Smart Controls</li>
                  <li className="hi">Repair Fallback</li>
                  <li className="hi">Higher production reliability</li>
                  <li className="hi">Up to 10 active personas</li>
                  <li>Batch content planning</li>
                  <li>Priority support</li>
                  <li className="soon">Multi-account publish (Coming Soon)</li>
                </ul>

                <a className="plan-btn plan-btn-ghost" href="/signup">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="reveal" style={{ position: "relative", zIndex: 1 }}>
            <div className="eye" style={{ display: "flex", justifyContent: "center" }}>
              Get Started
            </div>
            <h2
              className="stitle"
              style={{ maxWidth: 560, margin: "0 auto 16px", textAlign: "center" }}
            >
              Premium content.
              <br />
              <em>Your persona. Your pace.</em>
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--muted)",
                fontWeight: 300,
                maxWidth: 380,
                margin: "0 auto 40px",
                textAlign: "center",
                lineHeight: 1.75,
              }}
            >
              No prompt engineering. No guesswork. A controlled creative workflow built
              for real creators.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <a
                className="btn-primary"
                href="/signup"
                style={{ fontSize: 15, padding: "16px 44px" }}
              >
                Create Your Persona
              </a>
            </div>
          </div>
        </section>

        <footer className="lp-footer">
          <div className="footer-inner">
            <div className="footer-top">
              <div className="footer-brand">
                <a className="nav-logo" href="#">
                  Aviora
                </a>
                <p>
                  Premium AI creator platform for TikTok and Instagram. Trend-aware,
                  persona-controlled, production-grade.
                </p>
              </div>

              <div className="footer-col">
                <h4>Product</h4>
                <ul>
                  <li>
                    <a href="#features">Features</a>
                  </li>
                  <li>
                    <a href="#pricing">Pricing</a>
                  </li>
                  <li>
                    <a href="https://app.aviora.studio">Studio</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li>
                    <a href="/about">About</a>
                  </li>
                  <li>
                    <a href="mailto:hello@aviora.studio">Contact</a>
                  </li>
                  <li>
                    <a href="mailto:support@aviora.studio">Support</a>
                  </li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Legal</h4>
                <ul>
                  <li>
                    <a href="/privacy-policy">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="/terms-of-service">Terms of Service</a>
                  </li>
                  <li>
                    <a href="/cookie-policy">Cookie Policy</a>
                  </li>
                  <li>
                    <a href="/refund-policy">Refund Policy</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom">
              <span className="footer-copy">2026 Aviora. All rights reserved.</span>
              <div className="footer-status">
                <div className="status-dot" />
                All systems operational
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
