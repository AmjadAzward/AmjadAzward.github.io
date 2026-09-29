import { Link, useLocation } from "@tanstack/react-router";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Github,
  Instagram,
  Linkedin,
  Menu,
  Moon,
  Sun,
  X,
  Facebook,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { navItems, socials } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const cinematicEase = [0.16, 1, 0.3, 1] as const;
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.99 }}
      whileInView={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.82, delay, ease: cinematicEase }}
    >
      {children}
    </motion.div>
  );
}
export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "site-section relative mx-auto w-full max-w-[1200px] px-5 py-20 md:px-8 md:py-28",
        className,
      )}
    >
      {children}
    </section>
  );
}
export function AnimatedHeading({
  children,
  className,
  accentWords = [],
}: {
  children: string;
  className?: string;
  accentWords?: string[];
}) {
  const reduce = useReducedMotion();
  const words = children.split(" ");
  return (
    <motion.h1
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
      }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[.08em] align-bottom">
          <motion.span
            className={cn(
              "inline-block",
              accentWords.includes(word.replace(/[^a-zA-Z]/g, "")) && "text-primary",
            )}
            variants={{
              hidden: reduce ? {} : { y: "112%", opacity: 0, filter: "blur(5px)" },
              shown: {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 0.72, ease: cinematicEase },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
export function PageHeading({
  index,
  eyebrow,
  title,
  description,
  ghost,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  ghost?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <header className="relative mb-14 overflow-hidden border-b border-border pb-12 md:mb-20 md:pb-16">
      <motion.span
        aria-hidden
        initial={reduce ? false : { opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: cinematicEase }}
        className="ghost-word"
      >
        {ghost ?? title}
      </motion.span>
      <motion.p
        initial={reduce ? false : { opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: cinematicEase }}
        className="eyebrow"
      >
        {index} - {eyebrow}
      </motion.p>
      <AnimatedHeading className="mt-5 max-w-4xl text-5xl font-bold leading-[.95] md:text-7xl lg:text-8xl">
        {title}
      </AnimatedHeading>
      {description && (
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            {description}
          </p>
        </Reveal>
      )}
    </header>
  );
}
export function EditorialCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("editorial-card", className)}>{children}</div>;
}
const socialIcons = { LinkedIn: Linkedin, GitHub: Github, Facebook, X, Instagram };
export function SocialLinks({ labels = false }: { labels?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {socials.map((s) => {
        const Icon = socialIcons[s.label as keyof typeof socialIcons] ?? ArrowUpRight;
        return (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            aria-label={s.label}
            className={cn("social-link", labels && "w-auto px-3")}
          >
            <Icon size={16} />
            {labels && <span>{s.label}</span>}
          </a>
        );
      })}
    </div>
  );
}
function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("aa-theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("aa-theme", next ? "dark" : "light");
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand-mark" aria-label="Amjad Azward home">
          <span>AA</span>
          <i aria-hidden />
        </Link>
        <nav aria-label="Primary" className="site-nav hidden lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-menu lg:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="brand-mark">
                <span>AA</span>
                <i aria-hidden />
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X />
              </Button>
            </div>
            <nav className="mt-14 flex flex-col">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link to={item.to} onClick={() => setOpen(false)} className="mobile-nav-link">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-10">
              <SocialLinks />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <p>© 2026 Amjad Azward. Designed and built with intention.</p>
      </div>
      <SocialLinks />
    </footer>
  );
}
function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer:fine)").matches) return;
    let x = -50,
      y = -50,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const transform = `translate3d(${x}px,${y}px,0)`;
        dot.current?.style.setProperty("transform", transform);
        ring.current?.style.setProperty("transform", transform);
        raf = 0;
      });
    };
    const hover = (e: PointerEvent) =>
      ring.current?.classList.toggle(
        "is-hovering",
        Boolean((e.target as Element).closest("a,button,input,textarea,[data-cursor]")),
      );
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", hover);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", hover);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reduce = useReducedMotion();
  const isHome = location.pathname === "/";
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, reduce]);
  return (
    <>
      <CustomCursor />
      <div className="site-atmosphere" aria-hidden>
        <span className="atmosphere-contours" />
      </div>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main-content"
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduce ? 0.12 : 0.48, ease: cinematicEase }}
          className={cn("relative z-[1] min-h-screen pt-16", isHome && "home-main")}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
export function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!seen) return;
    if (reduce) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.35,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [seen, value, reduce]);
  return (
    <span ref={ref}>
      {Number.isInteger(value) ? Math.round(shown) : shown.toFixed(2)}
      {suffix}
    </span>
  );
}
export function ActionLink({
  to,
  children,
  variant = "default",
  download = false,
}: {
  to: string;
  children: ReactNode;
  variant?: "default" | "outline";
  download?: boolean;
}) {
  const external = to.startsWith("http") || to.endsWith(".pdf");
  return (
    <Button asChild variant={variant} size="lg">
      {external ? (
        <a
          href={to}
          target={to.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          download={download || undefined}
        >
          {children}
        </a>
      ) : (
        <Link to={to as "/contact" | "/portfolio"}>{children}</Link>
      )}
    </Button>
  );
}
export function DownloadIcon() {
  return <Download />;
}
export function ExternalIcon() {
  return <ArrowUpRight />;
}
export function ScrollIcon() {
  return <ArrowDown />;
}
