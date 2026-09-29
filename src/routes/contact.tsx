import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeading, Reveal, Section, SocialLinks } from "@/components/portfolio-ui";
import { Button } from "@/components/ui/button";
import { makeHead } from "@/lib/head";

const CONTACT_EMAIL = "amjadazward693@gmail.com";
const CONTACT_RETURN_URL = "https://amjadazward.github.io/contact?sent=1";

export const Route = createFileRoute("/contact")({
  head: makeHead(
    "Contact",
    "Start a software, web, data, or machine learning collaboration with Amjad Azward.",
    "/contact",
  ),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setSent(new URLSearchParams(window.location.search).get("sent") === "1");
  }, []);

  return (
    <Section>
      <PageHeading
        index="06"
        eyebrow="CONTACT"
        title="Let's Make Something Useful"
        ghost="CONNECT"
        description="Have an idea, an opportunity, or a difficult problem? I'd like to hear about it."
      />
      <div className="contact-layout grid gap-10 lg:grid-cols-[1.3fr_.7fr]">
        <Reveal>
          <form
            action={`https://formsubmit.co/${CONTACT_EMAIL}`}
            method="POST"
            onSubmit={() => setIsSending(true)}
            className="grid gap-5"
            aria-label="Contact form"
          >
            <input type="hidden" name="_subject" value="New portfolio enquiry" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={CONTACT_RETURN_URL} />
            <input
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="name" label="Name" type="text" />
              <Field name="email" label="Email" type="email" />
            </div>
            <Field name="subject" label="Subject" type="text" />
            <label className="field-label">
              Message
              <textarea name="message" required rows={7} className="field" />
            </label>
            <Button type="submit" size="lg" className="w-fit" disabled={isSending}>
              {isSending ? (
                <>
                  Sending <LoaderCircle className="animate-spin" />
                </>
              ) : (
                <>
                  Send Message <Send />
                </>
              )}
            </Button>
            {sent && !isSending && (
              <p
                role="status"
                className="border-l-2 border-secondary-accent pl-4 text-sm text-secondary-accent"
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Message sent successfully. I'll get back to
                  you soon.
                </span>
              </p>
            )}
          </form>
        </Reveal>
        <Reveal delay={0.1}>
          <aside className="editorial-card p-7 lg:p-9">
            <p className="eyebrow">OPEN TO COLLABORATION</p>
            <h2 className="mt-5 font-display text-3xl font-semibold">Let's Connect</h2>
            <p className="mt-5 leading-7 text-muted-foreground">
              I'm always interested in thoughtful products, ambitious teams, and opportunities to
              learn while building real value.
            </p>
            <div className="mt-8">
              <SocialLinks />
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-7 inline-flex font-mono text-xs text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-10 border-t border-border pt-6 font-mono text-xs text-muted-foreground">
              Colombo, Sri Lanka - Available remotely
            </p>
          </aside>
        </Reveal>
      </div>
    </Section>
  );
}

function Field({ name, label, type }: { name: string; label: string; type: string }) {
  return (
    <label className="field-label">
      {label}
      <input name={name} type={type} required className="field" />
    </label>
  );
}
