"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, UserRound, ImageUp, CreditCard, CheckCircle2, Tag, Users, Crown, Sparkles } from "lucide-react";
import { submitRegistration, type ActionState } from "@/lib/actions";
import { governorates } from "@/lib/event-data";

const initialState: ActionState = { ok: false, message: "" };

const INTERESTS = [
  "Cultural Exchange", "Leadership", "Networking",
  "Travel", "Entrepreneurship", "Food & Culture", "Entertainment",
];

const HEARD_FROM = [
  "Instagram", "Facebook", "TikTok", "YouTube",
  "Friend / Word of mouth", "University", "Poster / Flyer", "Other",
];

// ── File upload preview ───────────────────────────────────────────────────────
function FileUpload({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  const [preview, setPreview] = useState("");
  return (
    <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/5 p-4 transition hover:border-limeflash/50 hover:bg-limeflash/5">
      <span className="mb-3 flex items-center gap-2 text-sm font-black uppercase text-paper/60">
        <ImageUp size={15} /> {label} {required && <span className="text-hotpink">*</span>}
      </span>
      <input type="file" name={name} accept="image/*" required={required} className="sr-only"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (!f) return setPreview("");
          const r = new FileReader();
          r.onload = () => setPreview(String(r.result));
          r.readAsDataURL(f);
        }}
      />
      {preview
        ? <img src={preview} alt="" className="mt-2 aspect-video w-full rounded-lg object-cover" />
        : <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-white/5 text-xs text-paper/30 uppercase font-bold">Click to upload</div>
      }
    </label>
  );
}

// ── Promo code checker ────────────────────────────────────────────────────────
function PromoInput({ ticketPrice }: { ticketPrice: number }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ discount: number; finalPrice: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function check() {
    if (!code.trim()) return;
    setChecking(true); setError(""); setResult(null);
    try {
      const res = await fetch(`/api/promo?code=${encodeURIComponent(code)}`);
      const data = await res.json() as { discount: number; finalPrice: number };
      if (data.discount === 0) setError("Invalid or expired promo code.");
      else setResult(data);
    } catch { setError("Could not verify code. Try again."); }
    setChecking(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40" />
          <input className="field pl-9 uppercase" name="promoCode" placeholder="Promo Code (optional)"
            value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); setError(""); }}
          />
        </div>
        <button type="button" onClick={check} disabled={checking || !code.trim()} className="btn-secondary shrink-0 text-sm">
          {checking ? "…" : "Apply"}
        </button>
      </div>
      {result && (
        <div className="rounded-xl border border-limeflash/30 bg-limeflash/10 px-4 py-3 text-sm font-bold text-limeflash">
          ✓ {result.discount}% off applied — Final price: <span className="text-2xl">{result.finalPrice}</span> EGP
          <span className="ml-2 text-xs line-through text-limeflash/50">{ticketPrice} EGP</span>
        </div>
      )}
      {error && <p className="text-xs font-bold text-hotpink">{error}</p>}
    </div>
  );
}

// ── Ticket Preview ────────────────────────────────────────────────────────────
function TicketPreview({ data, ticketPrice, onBack, onSubmit, pending }: {
  data: Record<string, string | string[]>;
  ticketPrice: number;
  onBack: () => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  const discount = 0; // shown from promo in form
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-limeflash/30 bg-limeflash/5 p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
          <div>
            <p className="text-xs font-black uppercase text-limeflash mb-1">Street Pass</p>
            <p className="font-display text-4xl">Review Your Order</p>
          </div>
          <Crown size={36} className="text-limeflash" />
        </div>
        <div className="space-y-3 text-sm">
          {[
            ["Full Name", data.fullName],
            ["Email", data.email],
            ["Phone", data.phone],
            ["City", data.city],
            ["Payment Method", data.paymentMethod],
            ...(data.promoCode ? [["Promo Code", data.promoCode]] : []),
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4 py-1 border-b border-white/5">
              <span className="text-paper/50 font-bold uppercase text-xs">{label}</span>
              <span className="text-paper/90 font-bold text-right">{String(value)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-end justify-between rounded-xl bg-limeflash/10 border border-limeflash/20 p-4">
          <span className="text-sm font-black uppercase text-limeflash">Total Due</span>
          <span className="font-display text-5xl text-limeflash">{ticketPrice} <span className="text-xl text-limeflash/70">EGP</span></span>
        </div>
        {data.paymentMethod === "Cash" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-hotpink/30 bg-hotpink/10 p-4">
            <Users size={18} className="mt-0.5 shrink-0 text-hotpink" />
            <p className="text-sm text-paper/80">A Global Village team member will contact you to arrange cash payment after your registration is reviewed.</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">
          <ArrowLeft size={18} /> Edit
        </button>
        <button type="button" onClick={onSubmit} disabled={pending} className="btn-primary flex-1">
          {pending ? <><Sparkles size={16} className="animate-spin" /> Submitting…</> : <>Confirm & Submit <Crown size={16} /></>}
        </button>
      </div>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export function RegistrationWizard({ ticketPrice, registrationOpen, capacityFull }: {
  ticketPrice: number;
  registrationOpen: boolean;
  capacityFull: boolean;
}) {
  const [step, setStep] = useState(0); // 0=step1 1=step2 2=preview
  const [paymentMethod, setPaymentMethod] = useState("Instapay");
  const [formSnapshot, setFormSnapshot] = useState<Record<string, string | string[]>>({});
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [state, action, pending] = useActionState(submitRegistration, initialState);
  const formRef = useState(() => (typeof document !== "undefined" ? document.createElement("form") : null))[0];

  const STEPS = [
    { label: "Registration", icon: UserRound },
    { label: "Experience", icon: Sparkles },
  ];

  function toggleInterest(v: string) {
    setSelectedInterests((prev) => prev.includes(v) ? prev.filter((i) => i !== v) : [...prev, v]);
  }

  function captureSnapshot() {
    const form = document.querySelector("form[data-reg]") as HTMLFormElement | null;
    if (!form) return;
    const fd = new FormData(form);
    const snap: Record<string, string | string[]> = {};
    fd.forEach((v, k) => { if (k !== "nationalIdFront" && k !== "nationalIdBack" && k !== "paymentScreenshot") snap[k] = String(v); });
    const interests = fd.getAll("interests").map(String);
    if (interests.length) snap.interests = interests;
    setFormSnapshot(snap);
  }

  if (!registrationOpen || capacityFull) {
    return (
      <div className="paint-card mx-auto max-w-2xl rounded-2xl p-10 text-center shadow-neon">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="graffiti-title text-5xl mb-3">{capacityFull ? "Sold Out" : "Closed"}</h2>
        <p className="text-paper/60">{capacityFull ? "Registration capacity has been reached." : "Registration is currently closed. Check back soon."}</p>
      </div>
    );
  }

  if (state.ok) {
    return (
      <motion.div className="paint-card mx-auto max-w-2xl rounded-2xl p-8 text-center shadow-neon"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      >
        <CheckCircle2 className="mx-auto text-limeflash mb-4" size={72} />
        <p className="text-xs font-black uppercase text-hotpink mb-2">Access Pending</p>
        <h2 className="graffiti-title text-5xl sm:text-6xl mb-3">You're In!</h2>
        <p className="text-paper/70 mb-6">Your registration is under review. You'll receive a confirmation email shortly.</p>
        <div className="rounded-2xl border border-limeflash/30 bg-limeflash/10 p-6 text-left space-y-4 mb-6">
          <div>
            <p className="text-xs font-black uppercase text-limeflash mb-1">Reference ID</p>
            <p className="font-display text-5xl">{state.referenceId}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-hotpink mb-1">Status</p>
            <p className="font-bold text-xl">{state.status}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={`/track?ref=${state.referenceId}`} className="btn-primary flex-1">Track Registration</a>
          <a href="/" className="btn-secondary flex-1">Back To Home</a>
        </div>
        <p className="mt-4 text-xs text-paper/40">Screenshot your reference ID for future tracking.</p>
      </motion.div>
    );
  }

  return (
    <form action={action} data-reg className="mx-auto max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-0 mb-4">
          {STEPS.map(({ label, icon: Icon }, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-black transition-all duration-300 ${step > i ? "bg-limeflash text-ink" : step === i ? "bg-limeflash text-ink shadow-neon" : "bg-white/10 text-paper/40"}`}>
                  {step > i ? "✓" : <Icon size={18} />}
                </div>
                <span className={`mt-1.5 text-xs font-black uppercase ${step >= i ? "text-limeflash" : "text-paper/30"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3 mb-5">
                  <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-limeflash transition-all duration-500" style={{ width: step > i ? "100%" : "0%" }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-paper/40 text-right font-bold uppercase">Step {Math.min(step + 1, 2)} of 2</p>
      </div>

      <div className="paint-card rounded-2xl p-5 shadow-neon sm:p-8">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Registration ── */}
          {step === 0 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h2 className="graffiti-title text-4xl mb-6">Personal Info</h2>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <input className="field md:col-span-2" name="fullName" placeholder="Full Name *" required />
                <input className="field" name="email" type="email" placeholder="Email Address *" required />
                <input className="field" name="phone" placeholder="Phone Number *" required />
                <input className="field" name="age" type="number" min="12" max="80" placeholder="Age *" required />
                <select className="field" name="city" required defaultValue="">
                  <option value="" disabled>City / Governorate *</option>
                  {governorates.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <h3 className="font-black uppercase text-paper/60 text-sm mb-4">National ID</h3>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <FileUpload name="nationalIdFront" label="ID Front" required />
                <FileUpload name="nationalIdBack" label="ID Back" required />
              </div>

              <h3 className="font-black uppercase text-paper/60 text-sm mb-4">Payment Method</h3>
              <div className="grid gap-3 sm:grid-cols-3 mb-6">
                {(["Instapay", "Vodafone Cash", "Cash"] as const).map((m) => (
                  <label key={m} className={`cursor-pointer rounded-xl border p-4 font-black transition ${paymentMethod === m ? "border-limeflash bg-limeflash text-ink" : "border-white/10 bg-white/5 hover:border-white/30"}`}>
                    <input type="radio" name="paymentMethod" value={m} className="sr-only" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                    {m}
                  </label>
                ))}
              </div>

              {paymentMethod === "Cash" && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-hotpink/30 bg-hotpink/10 p-4">
                  <Users size={20} className="mt-0.5 shrink-0 text-hotpink" />
                  <p className="text-sm text-paper/80">A Global Village team member will contact you to arrange cash payment after your registration is reviewed.</p>
                </div>
              )}

              {(paymentMethod === "Instapay" || paymentMethod === "Vodafone Cash") && (
                <div className="mb-6">
                  <h3 className="font-black uppercase text-paper/60 text-sm mb-3">Payment Screenshot</h3>
                  <FileUpload name="paymentScreenshot" label="Payment Screenshot" required />
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-black uppercase text-paper/60 text-sm mb-3">Promo Code</h3>
                <PromoInput ticketPrice={ticketPrice} />
              </div>

              {state.message && !state.ok && (
                <div className="mb-4 rounded-xl border border-hotpink/40 bg-hotpink/10 p-3 text-sm font-bold text-hotpink">{state.message}</div>
              )}

              <div className="flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setStep(1)}>
                  Next: Tell Us About You <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Optional Info ── */}
          {step === 1 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <div className="mb-6">
                <p className="text-xs font-black uppercase text-hotpink mb-1">Optional but appreciated</p>
                <h2 className="graffiti-title text-4xl">Help Us Create A Better Experience</h2>
                <p className="text-sm text-paper/50 mt-2">This information helps us tailor the event. All fields are optional.</p>
              </div>

              {/* Academic */}
              <div className="mb-6">
                <p className="text-xs font-black uppercase text-paper/40 mb-3">Academic Info</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="field" name="university" placeholder="University" />
                  <input className="field" name="major" placeholder="Major / Field of Study" />
                </div>
              </div>

              {/* Health */}
              <div className="mb-6">
                <p className="text-xs font-black uppercase text-paper/40 mb-3">Health Info</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="field" name="allergy" placeholder="Any Allergies?" />
                  <input className="field" name="allergyNotes" placeholder="Additional Health Notes" />
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <p className="text-xs font-black uppercase text-paper/40 mb-3">Availability</p>
                <div className="flex gap-3">
                  {[["yes", "Yes, I'm available all day ✓"], ["no", "Not for the full day"]].map(([val, label]) => (
                    <label key={val} className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-bold hover:border-limeflash/40 has-[:checked]:border-limeflash has-[:checked]:bg-limeflash/10 has-[:checked]:text-limeflash transition">
                      <input type="radio" name="availableFullDay" value={val} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <p className="text-xs font-black uppercase text-paper/40 mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const selected = selectedInterests.includes(interest);
                    return (
                      <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selected ? "border-limeflash bg-limeflash text-ink" : "border-white/20 bg-white/5 hover:border-white/40"}`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                  {selectedInterests.map((i) => <input key={i} type="hidden" name="interests" value={i} />)}
                </div>
              </div>

              {/* How did you hear */}
              <div className="mb-8">
                <p className="text-xs font-black uppercase text-paper/40 mb-3">How Did You Hear About Us?</p>
                <div className="flex flex-wrap gap-2">
                  {HEARD_FROM.map((source) => (
                    <label key={source} className="cursor-pointer rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold hover:border-hotpink/40 has-[:checked]:border-hotpink has-[:checked]:bg-hotpink/10 has-[:checked]:text-hotpink transition">
                      <input type="radio" name="heardFrom" value={source} className="sr-only" />
                      {source}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary">
                  <ArrowLeft size={18} /> Back
                </button>
                <button type="button" className="btn-primary" onClick={() => { captureSnapshot(); setStep(2); }}>
                  Review & Confirm <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Preview & Submit ── */}
          {step === 2 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <TicketPreview
                data={formSnapshot}
                ticketPrice={ticketPrice}
                onBack={() => setStep(1)}
                onSubmit={() => {
                  const form = document.querySelector("form[data-reg]") as HTMLFormElement | null;
                  form?.requestSubmit();
                }}
                pending={pending}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
