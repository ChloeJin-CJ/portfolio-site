import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroTitle from "./HeroTitle";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

const ASSET = "/assets/";

function Loader({ onComplete }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const letters = gsap.utils.toArray(".loader-letter");
      const first = letters[0];
      const secondWord = letters.slice(5);
      const dot = root.current.querySelector(".loader-dot");
      const flash = root.current.querySelector(".loader-flash");
      const stage = root.current.querySelector(".loader-stage");

      if (reduceMotion) {
        gsap.set(letters, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        gsap.timeline()
          .to(root.current, { autoAlpha: 0, duration: 0.15, delay: 0.35 })
          .call(onComplete);
        return;
      }

      const burstPoints = [
        [-220, -150],
        [-155, 140],
        [-70, -185],
        [105, 165],
        [215, -125],
        [240, 130],
      ];
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set(letters, { autoAlpha: 0 });
      gsap.set(first, { x: 8, y: window.innerHeight * 0.58, scale: 4 });
      gsap.set(letters[5], { x: 26, y: -window.innerHeight * 0.55, scale: 1 });

      tl.to(first, { autoAlpha: 0.55, y: 0, scale: 1.2, duration: 0.7 })
        .to(letters[5], { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.in" }, ">+=0.12")
        .addLabel("impact")
        .to(flash, { scale: 42, autoAlpha: 0, duration: 0.5 }, "impact")
        .to(stage, { x: -4, y: 2, duration: 0.045, repeat: 7, yoyo: true }, "impact")
        .to(first, { x: -48, scale: 1.3, duration: 0.15 }, "impact")
        .to(letters[5], { x: 56, scale: 1.3, duration: 0.15 }, "impact")
        .set(letters.filter((_, index) => index !== 0 && index !== 5), {
          autoAlpha: 1,
          x: (index) => burstPoints[index][0],
          y: (index) => burstPoints[index][1],
          rotation: () => gsap.utils.random(-16, 16),
          scale: 1.08,
        })
        .to(letters, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.025,
        }, ">+=0.15")
        .fromTo(dot, { autoAlpha: 0, y: -160 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.in" }, ">+=0.06")
        .to(dot, { y: -14, scale: 1.3, duration: 0.15 })
        .to(dot, { y: 0, scale: 1, duration: 0.2, ease: "power2.in" })
        .to(secondWord, { skewX: -13, duration: 0.55, ease: "power3.out" }, ">+=0.1")
        .to(dot, {
          boxShadow: "0 0 30px 12px rgba(255,255,255,.75), 0 0 60px 24px rgba(255,255,255,.35)",
          duration: 0.18,
        }, ">+=0.12")
        .to(root.current, {
          clipPath: () => {
            const rect = dot.getBoundingClientRect();
            return `circle(0% at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px)`;
          },
          duration: 0.85,
          ease: "power3.inOut",
        }, ">+=0.08")
        .call(onComplete);
    },
    { scope: root },
  );

  return (
    <div className="loader" ref={root} role="status" aria-label="Loading Chloe Jin's portfolio">
      <div className="loader-texture" />
      <div className="loader-stage">
        <div className="loader-name" aria-hidden="true">
          {"ChloeJin".split("").map((letter, index) => (
            <span className={`loader-letter loader-letter-${index}`} key={`${letter}-${index}`}>
              {letter === "i" ? "ı" : letter}
            </span>
          ))}
        </div>
        <span className="loader-dot" aria-hidden="true" />
        <span className="loader-flash" aria-hidden="true" />
      </div>
    </div>
  );
}

function CameraPortrait() {
  const root = useRef(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          motionAllowed: "(prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (conditions.reduceMotion) {
            gsap.set(".camera-assembly", { rotation: 0, x: 0 });
            return;
          }

          gsap.fromTo(
            ".camera-assembly",
            { rotation: -1.35, x: -1 },
            {
              rotation: 1.35,
              x: 1,
              duration: 1.85,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              transformOrigin: "50% 1%",
            },
          );
        },
      );

      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <div className="camera-object hero-item" data-hero="left" ref={root}>
      <div className="camera-assembly">
        <img className="camera-shell" src={`${ASSET}camera.png`} alt="Vintage Sony camera" draggable="false" />
        <div className="camera-screen">
          <img src={`${ASSET}chloe.jpg`} alt="Chloe Jin" draggable="false" />
        </div>
      </div>
    </div>
  );
}

function StickyNote() {
  return (
    <div className="sticky-object hero-item" data-hero="right">
      <img src={`${ASSET}sticky-note-with-text.png`} alt="Sticky note about Chloe" draggable="false" />
    </div>
  );
}

function BoardingPass() {
  const root = useRef(null);
  const card = useRef(null);
  const shine = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      if (!window.matchMedia("(hover: hover)").matches) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const onEnter = contextSafe(() => {
        gsap.set(root.current, { zIndex: 30 });
        gsap.to(card.current, {
          y: -42,
          rotation: 0,
          scale: 1.38,
          filter: "drop-shadow(0 30px 32px rgba(32, 29, 26, 0.28))",
          duration: reduceMotion ? 0 : 0.56,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.fromTo(
          shine.current,
          { left: "-80%" },
          { left: "130%", duration: reduceMotion ? 0 : 0.9, ease: "power2.inOut", overwrite: "auto" },
        );
      });

      const onLeave = contextSafe(() => {
        gsap.to(card.current, {
          y: 0,
          rotation: -10,
          scale: 1,
          filter: "drop-shadow(0 14px 16px rgba(32, 29, 26, 0.16))",
          duration: reduceMotion ? 0 : 0.5,
          ease: "power3.inOut",
          overwrite: "auto",
          onComplete: () => gsap.set(root.current, { zIndex: 11 }),
        });
        gsap.to(shine.current, { left: "-80%", duration: reduceMotion ? 0 : 0.25, overwrite: "auto" });
      });

      root.current.addEventListener("mouseenter", onEnter);
      root.current.addEventListener("mouseleave", onLeave);
      return () => {
        root.current?.removeEventListener("mouseenter", onEnter);
        root.current?.removeEventListener("mouseleave", onLeave);
        gsap.killTweensOf([card.current, shine.current]);
      };
    },
    { scope: root },
  );

  return (
    <div className="ticket-object hero-item" data-hero="up" ref={root}>
      <a href="/Chloe_Resume.pdf" target="_blank" rel="noreferrer" className="ticket-card" ref={card} aria-label="View Resume">
        <img src={`${ASSET}boarding-pass-continuous-learner.png`} alt="Boarding pass from UBC to Software Engineer or ML Engineer, class Continuous Learner" draggable="false" />
        <span className="ticket-shine" aria-hidden="true" ref={shine} />
      </a>
    </div>
  );
}

function TurntablePlayer() {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = async () => {
    if (!audio.current) return;

    if (audio.current.paused) {
      try {
        await audio.current.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="turntable-object hero-item" data-hero="left">
      <button
        className={`turntable-player${playing ? " is-playing" : ""}`}
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        title={playing ? "Pause music" : "Play music"}
      >
        <img className="turntable-base" src={`${ASSET}pink-turntable.png`} alt="" draggable="false" />
        <span className="turntable-record" aria-hidden="true" />
      </button>
      <img className="music-notes" src={`${ASSET}music-notes.png`} alt="" draggable="false" />
      <audio
        ref={audio}
        src={`${ASSET}belle-epoque.mp3`}
        preload="metadata"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      <span className="sr-only" aria-live="polite">Music {playing ? "playing" : "paused"}</span>
    </div>
  );
}

function LaptopDesk() {
  const root = useRef(null);
  const pencil = useRef(null);
  const line = useRef(null);

  useGSAP(
    (context, contextSafe) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;

      gsap.set(line.current, { drawSVG: "0% 0%", autoAlpha: 1 });
      const timeline = gsap.timeline({ paused: true });

      timeline
        .to(pencil.current, {
          x: () => root.current.offsetWidth * 0.19,
          y: 0,
          rotation: 45,
          scale: 1.03,
          duration: 0.55,
          ease: "power3.inOut",
        })
        .addLabel("draw")
        .to(line.current, { drawSVG: "0% 100%", duration: 1.25, ease: "power1.inOut" }, "draw")
        .to(pencil.current, {
          motionPath: {
            path: line.current,
            align: line.current,
            alignOrigin: [0.5, 0.91],
            autoRotate: false,
          },
          duration: 1.25,
          ease: "power1.inOut",
        }, "draw")
        .to({}, { duration: 2 })
        .to(line.current, { autoAlpha: 0, duration: 0.25, ease: "power1.out" })
        .to(pencil.current, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: "power3.inOut" }, "<")
        .set(line.current, { drawSVG: "0% 0%", autoAlpha: 1 });

      const draw = contextSafe(() => timeline.invalidate().restart());
      const trigger = pencil.current;
      trigger.addEventListener("mouseenter", draw);
      trigger.addEventListener("focus", draw);
      trigger.addEventListener("click", draw);

      return () => {
        trigger.removeEventListener("mouseenter", draw);
        trigger.removeEventListener("focus", draw);
        trigger.removeEventListener("click", draw);
        timeline.kill();
      };
    },
    { scope: root },
  );

  return (
    <div className="laptop-object hero-item parallax-near" data-hero="right" ref={root}>
      <img className="laptop-image" src={`${ASSET}laptop.png`} alt="Laptop, coffee, and notebook" draggable="false" />
      <img className="ubc-badge" src={`${ASSET}ubc-badge.png`} alt="UBC crest" draggable="false" />
      <svg className="pencil-doodle" viewBox="0 0 180 72" aria-hidden="true">
        <path ref={line} d="M8 40 C22 22 34 55 49 39 S73 24 87 39 C98 51 110 50 120 39 C128 28 138 27 145 38 C151 27 166 29 166 40 C166 51 145 62 145 62 C145 62 124 51 124 40 C124 31 136 28 145 38" />
      </svg>
      <button className="pencil-tool" type="button" aria-label="Animate the pencil drawing" title="Draw with pencil" ref={pencil}>
        <img src={`${ASSET}pencil.png`} alt="" draggable="false" />
      </button>
    </div>
  );
}

function Hero() {
  const root = useRef(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(".hero-item", { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      const fromVars = {
        left: { x: -70, y: 15 },
        right: { x: 70, y: 15 },
        up: { x: 0, y: 45 },
        pop: { x: 0, y: 0, scale: 0.82 },
      };

      gsap.utils.toArray(".hero-item").forEach((item, index) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, ...(fromVars[item.dataset.hero] || fromVars.up) },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: 0.08 * index,
            ease: "power3.out",
          },
        );
      });

      const handlePointer = (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        gsap.to(".parallax-near", { x: x * 14, y: y * 10, duration: 0.9, ease: "power2.out", overwrite: "auto" });
        gsap.to(".parallax-far", { x: x * -8, y: y * -6, duration: 1.2, ease: "power2.out", overwrite: "auto" });
      };

      window.addEventListener("pointermove", handlePointer, { passive: true });
      return () => window.removeEventListener("pointermove", handlePointer);
    },
    { scope: root },
  );

  return (
    <main className="hero" ref={root}>
      <h1 className="sr-only">Chloe Jin - Software Engineer and UBC Computer Science Student</h1>

      <img className="stars-object hero-item parallax-far" data-hero="pop" src={`${ASSET}stars.png`} alt="" draggable="false" />
      <CameraPortrait />

      <img className="dream-object hero-item parallax-far" data-hero="left" src={`${ASSET}hero-dream-text.png`} alt="" draggable="false" />

      <img className="books-object hero-item parallax-far" data-hero="up" src={`${ASSET}hero-books.png`} alt="" draggable="false" />

      <section className="identity hero-item" data-hero="pop" aria-label="Introduction">
        <HeroTitle />
      </section>

      <img className="bling-object hero-item parallax-far" data-hero="right" src={`${ASSET}bling.png`} alt="" draggable="false" />
      <StickyNote />

      <BoardingPass />

      <TurntablePlayer />

      <img className="flowers-object hero-item parallax-near" data-hero="up" src={`${ASSET}hero-flowers.png`} alt="" draggable="false" />
      <LaptopDesk />
    </main>
  );
}

const projects = [
  {
    title: "FIRE Tracker",
    type: "FINTECH / FULL-STACK",
    description: "Data-driven retirement projections to map your exact timeline to financial independence.",
    image: "fire-tracker.png",
    color: "#c9e2f5",
    slug: "fire-tracker",
    href: "https://fire-tracker-five.vercel.app/",
  },
  {
    title: "Workday Enhancer",
    type: "CHROME EXTENSION / EDTECH",
    description: "A registration portal upgrade used by 100+ active students, featuring visual schedules, ICS exports, and integrated professor analytics.",
    image: "workday-enhancer.png",
    color: "#f0dfb3",
    slug: "workday-enhancer",
    href: "https://chromewebstore.google.com/detail/ubc-go-%E2%80%94-workday-enhancer/agnehnnhgeeokifbjmajkgkdomhhlobe",
  },
  {
    title: "BC Rental Agent",
    type: "REACT AGENT / RAG PIPELINE",
    description: "Automating the Vancouver housing hunt with a deep-research AI agent and a cited tenancy law engine.",
    image: "bc-rental-agent.jpg",
    color: "#eee9e1",
    slug: "bc-rental-agent",
  },
  {
    title: "Crypto Pipeline",
    type: "DATA PIPELINE",
    description: "I'm working on this 🚧",
    image: "goggles.png",
    color: "#eed0d0",
    slug: "crypto-pipeline",
  },
];

function ProjectCard({ project, index }) {
  const href = project.href ?? `/projects/${project.slug}`;
  const external = href.startsWith("http");

  return (
    <a
      className={`project-card project-card-${index + 1}`}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      aria-label={`Open ${project.title} project${external ? " in a new tab" : ""}`}
    >
      <span className="project-card-image" style={{ backgroundColor: project.color }}>
        <img src={`${ASSET}${project.image}`} alt="" draggable="false" />
        <span className="project-card-stamp">{String(index + 1).padStart(2, "0")}</span>
      </span>
      <span className="project-card-meta">
        <span className="project-card-type">{project.type}</span>
        <strong>{project.title}</strong>
        <span className="project-card-description">{project.description}</span>
      </span>
      <span className="project-card-arrow" aria-hidden="true">↗</span>
    </a>
  );
}

function Portfolio() {
  const root = useRef(null);
  const folder = useRef(null);
  const [folderOpen, setFolderOpen] = useState(false);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(".portfolio-kicker, .portfolio-title, .folder-stage", { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        ".portfolio-kicker, .portfolio-title",
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        },
      );

      gsap.fromTo(
        ".folder-stage",
        { autoAlpha: 0, y: 90, rotationX: 8 },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current.querySelector(".folder-stage"), start: "top 84%", once: true },
        },
      );

    },
    { scope: root },
  );

  useGSAP(
    (context, contextSafe) => {
      const canHover = window.matchMedia("(hover: hover) and (min-width: 721px)").matches;
      if (!folder.current || !canHover || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = gsap.utils.toArray(".project-card", root.current);
      let isOpen = false;

      const getCardPositions = () => {
        const cardWidth = cards[0].offsetWidth;
        const folderWidth = folder.current.clientWidth;
        const stageWidth = folder.current.closest(".folder-stage").clientWidth;
        const closedStep = Math.min(190, Math.max(105, (folderWidth - cardWidth - 40) / 3));
        const openStep = Math.min(250, Math.max(closedStep + 34, (stageWidth - cardWidth - 30) / 3));

        return {
          closedX: [-1.5, -0.5, 0.5, 1.5].map((position) => position * closedStep),
          openX: [-1.5, -0.5, 0.5, 1.5].map((position) => position * openStep),
        };
      };

      const placeCards = (open, immediate = false) => {
        const { closedX, openX } = getCardPositions();
        const x = open ? openX : closedX;
        const y = open ? [-150, -200, -200, -150] : [24, 8, 8, 24];
        const rotation = open ? [-12, -4, 4, 12] : [-5, -2, 2, 5];

        cards.forEach((card, index) => {
          const vars = { x: x[index], y: y[index], rotation: rotation[index], overwrite: "auto" };
          if (immediate) {
            gsap.set(card, vars);
          } else {
            gsap.to(card, {
              ...vars,
              duration: open ? 0.7 : 0.5,
              delay: index * 0.045,
              ease: open ? "back.out(1.35)" : "power3.inOut",
            });
          }
        });
      };

      placeCards(false, true);

      const onEnter = contextSafe(() => {
        isOpen = true;
        setFolderOpen(true);
        placeCards(true);
      });
      const onLeave = contextSafe(() => {
        isOpen = false;
        setFolderOpen(false);
        placeCards(false);
      });
      const onResize = contextSafe(() => placeCards(isOpen, true));

      folder.current.addEventListener("mouseenter", onEnter);
      folder.current.addEventListener("mouseleave", onLeave);
      window.addEventListener("resize", onResize, { passive: true });
      return () => {
        gsap.killTweensOf(cards);
        folder.current?.removeEventListener("mouseenter", onEnter);
        folder.current?.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root },
  );

  return (
    <section className="portfolio" ref={root} aria-labelledby="portfolio-title">
      <img className="portfolio-gems portfolio-gems-left" src={`${ASSET}portfolio-gems-left.png`} alt="" draggable="false" />
      <img className="portfolio-gems portfolio-gems-right" src={`${ASSET}portfolio-gems-right.png`} alt="" draggable="false" />
      <div className="portfolio-intro">
        <p className="portfolio-kicker"><span>02</span> Personal Projects</p>
        <h2 className="portfolio-title" id="portfolio-title"><span>Things I&apos;ve built</span><em>with intention.</em></h2>
      </div>
      <div className={`folder-stage ${folderOpen ? "is-open" : ""}`}>
        <img className="portfolio-wordmark" src={`${ASSET}portfolio-backdrop.png`} alt="" draggable="false" />
        <div className="folder-shadow" aria-hidden="true" />
        <div className="folder-tab" aria-hidden="true"><span>CHLOE / 2026</span></div>
        <div className="folder" ref={folder}>
          <div className="folder-glass" aria-hidden="true" />
          <div className="project-stack">
            {projects.map((project, index) => <ProjectCard project={project} index={index} key={project.slug} />)}
          </div>
          <div className="folder-label">
            <span>PROJECTS</span>
            <span className="folder-label-mark" aria-hidden="true">+</span>
          </div>
          <p className="folder-hint">hover to unfold <span aria-hidden="true">↗</span></p>
        </div>
      </div>
      <div className="portfolio-tail" aria-hidden="true">
        <span>keep scrolling</span><span className="tail-line" /><span>03</span>
      </div>
    </section>
  );
}

function NavBar() {
  const [connectOpen, setConnectOpen] = useState(false);

  return (
    <div className="nav-container">
      <nav className="navbar">
        <div className="navbar-links">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); document.querySelector('.portfolio')?.scrollIntoView({behavior: 'smooth'}); }}>Projects</a>
        </div>
        
        <div 
          className="nav-connect-wrapper"
          onMouseEnter={() => setConnectOpen(true)}
          onMouseLeave={() => setConnectOpen(false)}
        >
          <button className="nav-connect-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2.99H2C1.45 2.99 1.01 3.44 1.01 3.99L1 19.99C1 20.54 1.45 20.99 2 20.99H22C22.55 20.99 23 20.54 23 19.99V3.99C23 3.44 22.55 2.99 22 2.99ZM22 7.08L12 13.34L2 7.08V4.99L12 11.24L22 4.99V7.08Z" fill="currentColor"/>
            </svg>
            Connect
          </button>
          <div className={`nav-connect-dropdown ${connectOpen ? 'is-open' : ''}`}>
            <a href="https://www.linkedin.com/in/chloe-jyl" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"/></svg>
            </a>
            <a href="https://github.com/ChloeJin-CJ" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21V19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26V21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/></svg>
            </a>
            <a href="mailto:chloejin.cj@gmail.com" aria-label="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"/></svg>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="site-shell">
      <NavBar />
      <Hero />
      <Portfolio />
      {loading && <Loader onComplete={() => setLoading(false)} />}
    </div>
  );
}
