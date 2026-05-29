# Consent categorisation (issue #140, PRD #123 · Feature D)

This documents how each cookie / script on the site is categorised by the
consent-management platform, and the gating rules that follow. The source of
truth for the catalogue is [`src/lib/consent/types.ts`](../src/lib/consent/types.ts);
this file explains the *reasoning*.

## Categories

| Category | Always on? | Covers | Gating behaviour |
| --- | --- | --- | --- |
| **Strictly necessary** | Yes | Supabase auth session cookies; the consent record itself | Cannot be switched off — the site cannot function without it. The preference-center toggle is rendered read-only. |
| **Security & anti-spam** | No | Google reCAPTCHA | Loaded when the user consents to *Security* up-front, **or** the moment they interact with the contact form (focus / typing / submit). See "reCAPTCHA" below. |
| **Analytics** | No | PostHog (stood up consent-gated in #141) | Never loaded until the *Analytics* category is consented. Revoking it must stop further loading. |
| **Functional** | No | Non-essential preference cookies, e.g. the day/night theme preference | Never loaded until the *Functional* category is consented. |

## The gate

Non-essential code defers loading behind the gate API
([`src/lib/consent/useConsentGate.ts`](../src/lib/consent/useConsentGate.ts)):

```ts
const analyticsAllowed = useConsentGate('analytics');
useEffect(() => {
  if (!analyticsAllowed) return; // not consented → never loads
  loadPostHog();
}, [analyticsAllowed]);
```

The gate **fails closed**: before the client hydrates stored consent, and when
no provider is mounted, every non-necessary category reads as *not consented*.
`necessary` always reads as consented. This guarantees non-essential scripts
never load during SSR or before a decision, and that revoking a category flips
the gate to `false` so a watching consumer can tear its script down.

## reCAPTCHA (Security) — why it loads on interaction

reCAPTCHA is categorised under **Security & anti-spam**, not Analytics. It is a
legitimate, proportionate anti-spam measure that protects the contact form from
abuse; it is not used for cross-site tracking or analytics.

To respect consent while keeping the existing `/contact` flow working for
everyone, the widget is **deferred** rather than blocked:

- If the user has consented to *Security* up-front, the widget mounts eagerly.
- Otherwise, the widget mounts the **moment the user starts interacting with the
  contact form** (focusing a field, typing, or pressing Send). Beginning to fill
  in a contact form is itself the legitimate-use signal that warrants loading
  spam protection.

The net effect: a visitor who never touches the form never loads reCAPTCHA; a
visitor who actually wants to send a message always gets a working form,
regardless of their up-front Security choice. The submit button continues to be
gated on the reCAPTCHA script finishing loading (issue #101), so nobody can
submit before the widget is interactive.

Implementation: [`src/app/contact/page.tsx`](../src/app/contact/page.tsx) reads
`useConsentGate('security')` and tracks first interaction; the widget renders
when `securityConsented || hasInteracted`.

## Where consent is surfaced

- **Banner** ([`ConsentBanner`](../src/components/consent/ConsentBanner.tsx)) —
  shown once, until a decision is made: *Accept all* / *Reject non-essential* /
  *Manage*.
- **Preference center**
  ([`PreferenceCenter`](../src/components/consent/PreferenceCenter.tsx)) —
  per-category toggles; strictly-necessary is read-only.
- **Re-opener** ([`ConsentManageLink`](../src/components/consent/ConsentManageLink.tsx))
  — wired into the site footer and the `/privacy` page so consent is revocable
  at any time.

All consent UI is **visually neutral and tokenized** (reads the shared
`--site-*` tokens). Per-persona skins are issue D1 (#145 / #146 / #147), a
separate slice. The banner links to `/privacy` as a placeholder; the canonical
policy content lands in #126.
