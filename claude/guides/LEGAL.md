# Legal guide (every project)

What a product may ship and say, and what it must publish. Not legal advice:
before the first paid release, have a lawyer check the product's own legal
file and its store listing.

How to use it:
- Read it when planning a product, before adding a third-party asset or
  dataset, before writing store or marketing texts, and before a release.
- Each product keeps its own legal file (e.g. `docs/LEGAL.md`): the rules
  that apply to it, its new-feature checklist and an audit table (below).
  This guide is the general source; the product file links here.
- Privacy and data rules live in `SECURITY.md` §12; this file links to them.

---

## 1. Published documents — when there are users

- **A privacy policy** that matches what the code really does
  (`SECURITY.md` §12), and **terms** (required by the app stores and most
  payment providers). Both show a "last updated" date.
- **Refunds:** say who handles them and how (for store purchases, Google and
  Apple; the listing and the terms say so).
- **Business details:** the developer's name, contact and address where the
  store or the law asks (Play for paid apps; the EU for traders).
- **Store forms** (data safety, privacy labels, age ratings) match the policy
  and the code.

## 2. Consent and users — when there are users

- **Cookie consent:** when non-essential cookies or trackers are set
  (EU/UK); none needed for strictly necessary cookies only.
- **Children:** choose the target age on purpose. Under 13 (16 in parts of
  the EU) brings parental consent and the stores' family rules; say the age
  in the store forms.
- **Account and data deletion** that users can do themselves (required by
  the app stores for apps with accounts); `SECURITY.md` §12.

## 3. Other products' names and looks — always

- A product may work *like* another (game rules and features are not
  owned), but never uses its name, logo, content, code or distinctive look.
  - **Name:** our own. Never another product's name in the product, the
    store listing, screenshots, links or ads ("like X" included). Put a name
    check in the tests where the texts live, and add a name to it whenever
    a new feature is inspired by another product.
  - **Look:** not the other product's signature colours, layout or
    animation.
  - **Content:** our own puzzles, texts and data, never copied from it.
- Names and marks we use as our own (the product, its parts, the developer)
  are checked for conflicts before the first release.

## 4. Third-party assets and data — always

- Every font, icon, sound, image, word list or dataset has a licence that
  allows commercial use: fonts under SIL OFL, icons under MIT or similar,
  stock images licensed for the use. No "non-commercial" (NC), "no
  derivatives" (ND) or unclear licences; nothing scraped without one.
- Each is credited in the product (a licences screen or page) and in a
  licence file in the repo.
- **Share-alike and copyleft data** (CC BY-SA, MPL, LGPL, GPL) stays under
  its licence: a file derived from it (a filtered list, reduced vectors) is
  shared under the same licence, credited, and its source made available.
  The product's own code is not affected.
- Keep an **audit table** per product (asset or feature, inspired by, name,
  look, content and licence, status) and check every new asset against it.

## 5. Honest listings — whenever the product is described

- No claim that can't be backed ("the best", "free" when parts are paid).
- No fake, bought or rewarded reviews or ratings.
- Prices and what is free are clear before the user commits (`UI_UX.md`
  §14).

## 6. Before a release

- [ ] Documents in §1 published and current; store forms match.
- [ ] The name check passes; no other product's name or look.
- [ ] Every asset credited, with a licence that allows commercial use;
      share-alike data published under its licence.
- [ ] The product's audit table is up to date.
- [ ] Before the first paid release: a lawyer check of the legal file, the
      names and the store listing.
