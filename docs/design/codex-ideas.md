# Application Tracker: Grow Something While You Wait

**The central idea: every application leaves something good behind.** A submitted application plants a tree. Preparation adds life to the clearing. Interviews bring visitors. Offers light lanterns. Rejections become mushrooms beneath trees that remain healthy.

The forest records effort, including effort that employers never acknowledge.

This should feel like a beautiful personal field journal: warm, quietly funny, satisfying to use, and easy to put down. The student should leave thinking, “I did something today,” even when the inbox says otherwise.

**Scope:** Each numbered idea below is a small illustration, interaction, or feature slice that can usually be built in a day or less once the underlying authentication, application storage, and upload plumbing exist. Larger systems are assembled from those slices. Everything uses authored assets and deterministic rules.

---

## 1. Forest Scene & World

### Art direction and composition

Use an illustrated field-guide style: rounded silhouettes, slightly irregular contours, flat colors, soft sky gradients, and very little internal linework.

| Element | Direction |
|---|---|
| Palette | Ink `#273D35`, pine `#315C48`, sage `#8EB398`, cream `#F5EDDA`, clay `#CF8368`, honey `#E8BC65`, lavender `#A9A3C9`. |
| Composition | Distant hills; middle application grove; foreground clearing with characters and landmarks. |
| Trees | Four reusable silhouettes: round oak, triangular pine, narrow birch, spreading maple. Choose species deterministically from the application ID. |
| Texture | A few irregular canopy shapes and leaf marks. Avoid expensive animated grain or large blur filters. |
| Typography | Editorial serif for welcoming headings; clear sans serif for forms and tables; tabular numerals for statistics. Keep meaningful text outside the SVG. |
| Desktop | Wide forest above a compact “next useful action” panel. |
| Mobile | Recompose the foreground into a taller clearing. Keep important animals and landmarks visible without requiring horizontal scrolling. |
| Interaction | A tree opens its application summary. Provide the same access through a keyboard-friendly list. |
| Density | Show approximately 40 detailed application trees. Additional applications appear as distant groves with counts and accessible lists. |
| Persistence | Assign stable positions. Updating one application should never rearrange the forest. |

**World rules**

- Submitted applications create trees; wishlist items remain seed packets.
- A rejection never kills, shrinks, or removes a tree.
- Inactivity never damages plants or makes animals unhappy.
- Weather is decorative, not a judgment about productivity.
- Outcome decorations can be hidden independently.
- Every meaningful scene change also has a plain-language explanation.
- All essential information remains available with animation disabled.

### Applications and growth

| # | Trigger | Concrete scene change |
|---:|---|---|
| 1 | First visit | A welcoming clearing already contains a watering can, empty planting bed, and small trail sign. Beginning should feel inviting. |
| 2 | Save a wishlist item | Add a seed packet to a nursery tray. Its symbol matches the tree species it will eventually grow. |
| 3 | Submit an application | Plant a sapling with a short trunk, three canopy shapes, and two visible roots. One leaf opens. |
| 4 | Submit without wishlisting | An acorn drops into its assigned planting spot, then becomes the same sapling. |
| 5 | Attach a resume version | Tie a narrow colored ribbon around the trunk. The color matches that version throughout the app. |
| 6 | Receive an OA invitation | Add three amber buds and a small assessment marker. The details panel explains the symbol. |
| 7 | Receive an interview invitation | Add five lavender blossoms. Pip the fox briefly visits the clearing. |
| 8 | Receive an offer | Hang one warm lantern from that tree. At night it glows steadily. |

### Rejection, silence, and changing plans

| # | Trigger | Concrete scene change |
|---:|---|---|
| 9 | Record a rejection | Preserve the tree and add mushrooms around its roots. Caption: “Still part of the forest.” |
| 10 | Different rejected applications | Select one of four mushroom shapes by application ID: button, shelf, inkcap, or chanterelle. No rarity system. |
| 11 | First rejection update of the day | Two leaves settle into a warm soil patch. An optional caption introduces “Rejections are fertilizer.” |
| 12 | Rejection update, comfort effects enabled | A small rainbow appears behind that tree for a few seconds. Keep the rest of the forest calm. |
| 13 | Thirty days without a substantive reply | Place a pale paper lantern beside the tree. Offer a “No reply yet” review rather than automatically changing its status. |
| 14 | User confirms ghosted | A friendly ghost with leaf-shaped ears peeks from behind the tree. Its expression is mildly confused. |
| 15 | Reply after ghosting | The ghost folds into a paper bird and leaves. Preserve the application’s earlier history. |
| 16 | Withdraw or decline | Tie an open bow around the trunk. Caption: “You get to choose, too.” This can be a small secondary disposition field. |

**Ghosting rule:** Default the review suggestion to 30 days since submission or the last substantive employer message, accounting for any known future response date. Let the user change the threshold. Silence remains uncertainty until they choose how to label it.

### Resumes and preparation

| # | Trigger | Concrete scene change |
|---:|---|---|
| 17 | Upload a resume version | Add a paper-white birch to a separate resume nursery. Show five individually; older versions become labeled seed envelopes. |
| 18 | Name a resume version | Its wooden plant marker gains the name: “Frontend — September,” for example. |
| 19 | First application using that version | A colored thread briefly connects its nursery birch to the application tree. |
| 20 | Review an analyzer result | A butterfly lands near the nursery. Keep a small fixed population; repeated runs do not multiply it indefinitely. |
| 21 | Open a missing-keyword category | A field-guide page unfolds beside the nursery, showing a tools, methods, or evidence icon. |
| 22 | Save an application note | Add a small pencil mark to its signpost. Never expose private note text in the scene. |
| 23 | Complete interview preparation | Set a tea cup and checklist on the clearing’s table. Steam rises once. |
| 24 | Log a follow-up actually sent | A paper boat crosses a watering basin, or the pond once unlocked. |

### Milestone landmarks

| # | Trigger | Landmark |
|---:|---|---|
| 25 | First application | Permanent hand-painted sign: “You started.” |
| 26 | Five applications | A bench made from one plank and two rounded supports. Characters can sit here. |
| 27 | Ten applications | A trail gate with ten carved leaves. Caption: “A real little grove.” |
| 28 | Twenty-five applications | A short arched bridge over a creek bed: one curve, six planks, two rails. |
| 29 | Fifty applications | A pond with three reeds, two lily pads, and an otter rock. |
| 30 | One hundred applications | A small treehouse with a triangular roof, rope ladder, and warm window. |
| 31 | First interview | A bronze bell hangs from the welcome sign or trail gate. It swings once. |
| 32 | First offer | A picnic lantern appears in the clearing. Keep it as a keepsake even if the offer is declined. |

### Time, seasons, weather, and rest

| # | Trigger | Scene behavior |
|---:|---|---|
| 33 | Real local time | Switch among dawn, day, dusk, and night using the device time zone. Offer a home-time-zone override. No location permission needed. |
| 34 | Approximately 5–8 a.m. | Peach horizon, two thin mist bands, sleepy bird on the sign. |
| 35 | Approximately 5–8 p.m. | Lavender sky, warm windows, a few firefly dots. |
| 36 | Night | Moon and fixed star map. Increase foreground contrast so labels and paths stay readable. |
| 37 | Seasonal selection | Spring blossoms, summer greens, autumn canopies, winter branch caps. Support manual selection and hemisphere preference. |
| 38 | Finish a productive session | A brief sunshower waters the foreground flowers, then clears. |
| 39 | Enable break mode | Put out a picnic blanket and thermos. Display the chosen return date beside reminders. |
| 40 | Choose cozy weather | Select clear, soft rain, or gentle snow as an ambient preference. Manual preference wins over automatic effects. |

### Animals, weekly history, and easter eggs

| # | Trigger | Detail |
|---:|---|---|
| 41 | Meet this week’s chosen goal | A flower blooms along the path. Completed weeks gradually create a flower bed; missed weeks leave no dead stalks. |
| 42 | Use a freeze or planned break | Place a blue glass pebble beside that week’s marker: “A week you protected.” |
| 43 | Record two interviews | Two songbirds perch on the bridge rail, occasionally exchanging one illustrated music note. |
| 44 | Save the first reminder | Tuck the turtle appears beside a sundial. The real reminder stays in the normal interface. |
| 45 | Reach 42 applications | A folded towel appears on the bench. Tooltip: “You seem like someone who knows where their towel is.” |
| 46 | Reach 64 applications | A tiny blocky butterfly appears. The pixel silhouette is the whole joke. |
| 47 | First-application anniversary | An acorn-shaped cake sits on the table for the week. |
| 48 | Select a tree or grove | A soft outline and floating company label connect the illustration to its record. “Find in forest” performs the reverse lookup. |

### Keep the forest performant

Use reusable SVG symbols, static scenery, and a small number of moving groups. Animate transforms and opacity wherever possible. Pause ambience when the forest is offscreen or the tab is hidden.

A useful initial motion budget: **one speaking character, one event animation, and at most twelve particles at a time.** Reduced-motion mode shows the settled illustration immediately.

---

## 2. Characters

Give each mascot one resting pose, one expression swap, and one small movement initially. Most should fit within roughly 8–15 filled SVG shapes.

Only one character speaks at a time. Rotate dialogue deterministically by event count. Let the student disable dialogue while keeping the animals.

### 1. Alder the Owl — The practical mentor

**Look:** Pine oval body; two cream face circles; honey diamond beak; ink dot eyes; short triangular ear tufts; cream belly; one raised eyebrow.

**Personality:** Patient, observant, quietly funny. Explains things without pretending to know what employers are thinking.

**Appears:** Onboarding, metric explanations, first weekly review, requested tips.

**Catchphrases:**

- “A small plan beats a large panic.”
- “Let’s give Future You fewer tabs.”
- “Your job today is the next step.”
- “I brought perspective. And excellent night vision.”
- “That number needs context. Conveniently, I have some.”
- “You can be new at this and still belong here.”

### 2. Pip the Fox — The interview friend

**Look:** Clay triangular ears and rounded triangular head; pill-shaped body; cream muzzle and tail tip; ink paws; one large comma-shaped tail; honey scarf.

**Personality:** Excited, useful, never overwhelming.

**Appears:** Interview invitation, preparation checklist, interview-day reminder, post-interview check-in.

**Catchphrases:**

- “They want to meet the person behind the PDF.”
- “Interview unlocked. Shoes optional until the camera turns on.”
- “You do not need to become a different person for this.”
- “Let’s prep three stories and one good question.”
- “A pause before answering is allowed. I checked.”
- “You showed up. That part is yours.”

### 3. Moss the Sloth — The guardian of breaks

**Look:** Sage bean-shaped body hanging from a branch; cream oval face; pine eye patches; clay nose; long rounded arms; three cream claw marks.

**Personality:** Unhurried, comfortable, dryly funny. Appears because rest is supported, never as punishment for inactivity.

**Appears:** Break mode, “done for today,” return from time away, optional late-night nudge.

**Catchphrases:**

- “Rest is a scheduled activity now.”
- “The forest has excellent unattended mode.”
- “We can pick this up after a sandwich.”
- “Your applications do not need a midnight supervisor.”
- “Welcome back. No explanation required.”
- “A sustainable pace is still a pace.”

### 4. Fern the Frog — The tiny-step specialist

**Look:** Sage horizontal oval body; two eye bumps; cream belly; pine dot eyes; clay cheeks; flattened oval back legs; one dark lily pad.

**Personality:** Cheerful, direct, delighted by manageable beginnings.

**Appears:** First quick-add, first application, one remaining task, first action after a break.

**Catchphrases:**

- “One hop. That’s the whole plan.”
- “Company, role, save. We can decorate later.”
- “This counts even if it took three tries to start.”
- “A small step is suspiciously good at becoming progress.”
- “One application is one more than the blank page had.”
- “We’re doing the next tiny thing.”

### 5. Nib the Beaver — The resume workshop lead

**Look:** Brown-clay rounded body; cream muzzle and belly; two square teeth; ink oval nose; dark paddle tail with three diagonal marks; honey pencil.

**Personality:** Practical, specific, opposed to polishing forever.

**Appears:** Resume upload, version naming, resume selection, version comparisons.

**Catchphrases:**

- “A version name now saves detective work later.”
- “Strong bullet. Could we give it a result?”
- “Built something? Say what changed.”
- “The resume is ready enough to leave the workshop.”
- “We are editing a document, not carving a marble statue.”
- “Let’s save this version before the next brilliant tweak.”

### 6. Clover the Rabbit — The quick-add concierge

**Look:** Cream pear-shaped body; tall ears with clay inner shapes; one bent ear; tiny ink eyes; sage satchel; horizontal oval feet.

**Personality:** Brisk, organized, determined to keep the tracker’s forms short.

**Appears:** Quick-add, draft restoration, URL paste, optional fields deferred.

**Catchphrases:**

- “Two fields. One saved application. Lovely.”
- “The details can catch up.”
- “I kept your draft warm.”
- “We can turn this tab into a plan.”
- “Less form. More forward.”
- “Saved. You may close the tab with confidence.”

Use the last line only after the relevant save actually succeeds.

### 7. Rue the Raccoon — The keyword detective

**Look:** Lavender-gray round head and body; pine eye mask; cream muzzle; comma tail with three broad bands; honey-rimmed magnifying glass.

**Personality:** Curious, skeptical of impressive percentages, interested in evidence.

**Appears:** Analyzer results, missing-category explanations, extraction problems.

**Catchphrases:**

- “I found keywords. I did not find your entire potential.”
- “A match score is a clue, not a hiring decision.”
- “Only add it if you can back it up.”
- “Different wording, same skill. Classic.”
- “Let’s investigate the missing category.”
- “No keyword confetti in the margins, please.”

### 8. Tuck the Turtle — The keeper of long timelines

**Look:** Sage head and round feet; pine half-oval shell; three honey shell plates; cream lower rim; small forward-facing eyes.

**Personality:** Calm and concrete. Never promises a reply.

**Appears:** Follow-up reminders, long silence, pending-application review.

**Catchphrases:**

- “Silence gives us limited information.”
- “We can follow up once and keep moving.”
- “Their timeline does not need to become your whole day.”
- “Still waiting is a status. It is not a personal review.”
- “A reminder can hold this thought for you.”
- “Let’s put this somewhere you do not have to keep remembering it.”

### 9. Prickle the Hedgehog — The rejection companion

**Look:** Cream circular face; clay semicircle body; five broad rounded pine spikes; ink nose and eyes; cream feet; small mushroom held in front.

**Personality:** Warm, candid, comfortable with disappointment.

**Appears:** Rejection recorded, optional reflection, return after a difficult update.

**Catchphrases:**

- “That stings. You can just let it sting.”
- “One decision. A whole person remains.”
- “You do not owe this rejection a productivity arc.”
- “The effort stays. So does your place here.”
- “We can close the tab and try again another day.”
- “I brought a mushroom. It has no career advice.”

### 10. Miso the Otter — The celebration host

**Look:** Clay capsule body; cream muzzle and belly; tiny pine ears; ink nose; flattened tail; two paws holding a honey leaf.

**Personality:** Delighted, grounded, remembers that offers involve choices.

**Appears:** Offer recorded, offer comparison, offer accepted or declined.

**Catchphrases:**

- “An offer! Please enjoy one full celebratory wiggle.”
- “You get to ask questions, too.”
- “We can celebrate before opening another spreadsheet.”
- “Salary, team, learning, location. Your priorities get a vote.”
- “Declining can also be a good decision.”
- “Someone should tell the pond. It’s me. I’m telling the pond.”

### 11. Dot the Moth — The evening desk friend

**Look:** Two lavender teardrop wings with cream spots; slim pine body; honey antenna curves; warm lantern perch.

**Personality:** Cozy, observant, protective of sleep.

**Appears:** Evening theme, optional late-night nudge, saved draft before leaving.

**Catchphrases:**

- “The draft will still be here tomorrow.”
- “Even excellent tabs can be closed.”
- “You can stop at saved.”
- “A very respectable amount of effort has occurred.”
- “The lamp is on. The pressure is off.”
- “Tomorrow You appreciates the autosave.”

### 12. Acorn the Squirrel — The progress archivist

**Look:** Honey round head and body; cream belly; pine eyes; upright clay curl tail; sage notebook with a leaf emblem.

**Personality:** Loves concrete progress and tiny rituals.

**Appears:** Weekly reviews, achievements, application milestones, export.

**Catchphrases:**

- “I kept the receipts. They say you did things.”
- “This week had progress in it.”
- “A broken streak does not erase a single application.”
- “Ten applications. That is a whole grove situation.”
- “You remembered less because the tracker remembered more.”
- “Your progress has excellent archival value.”

---

## 3. Funny and Delightful Animations

Play reward animations after a successful save. Never delay navigation or require watching an animation.

With `prefers-reduced-motion`, show the final state immediately and retain the same text confirmation. Celebrations should also have a separate intensity setting.

| # | Moment | Specific motion |
|---:|---|---|
| 1 | Submit an application | An envelope travels 24 px into a stump mailbox; its flag rises 20° over 450 ms. |
| 2 | New tree appears | Sapling grows vertically from its ground anchor over 450 ms; the crown settles once. |
| 3 | Save a wishlist role | Acorn drops 12 px into a basket with one 2 px rebound; 280 ms. |
| 4 | Drag an application card | Card follows the pointer directly, lifts 2 px, and rotates at most 1°. |
| 5 | Drop a card | Card settles into its destination over 160 ms. |
| 6 | Move a card by keyboard | A leaf marker appears beside the destination status for 180 ms. |
| 7 | Complete an OA | Three stepping stones brighten sequentially, 100 ms apart. |
| 8 | Receive an interview invitation | Pip’s ears lift 8° and tail sweeps once; 500 ms. |
| 9 | Attend an interview | A tiny bridge flag unfurls horizontally over 350 ms. |
| 10 | Record an offer | Eight leaves rise 35 px, rotate once, and fade within 900 ms. Night mode substitutes steady firefly dots. |
| 11 | Record a rejection | Three droplets fall over that tree’s roots; a mushroom opens over 650 ms. |
| 12 | Optional rejection comfort | A small rainbow fades in behind the patch over 800 ms, then settles away. |
| 13 | Confirm ghosted | Leaf-eared ghost peeks 10 px around the trunk, pauses, then stays still; 500 ms. |
| 14 | Receive a reply after ghosting | Ghost folds into a paper bird, travels 30 px upward, and fades; 650 ms. |
| 15 | Upload a resume | Paper straightens from −6° to 0° and slips into a folder; 320 ms. |
| 16 | Select a resume version | Bookmark slides down 8 px beside the selected filename; 180 ms. |
| 17 | Analyzer processing | A narrow light band crosses the results panel. Continue only while work is actually pending. |
| 18 | Analyzer finishes | Keyword chips fade in together over 160 ms. Display the actual score immediately. |
| 19 | Expand a keyword category | Fern-shaped caret turns 90° over 150 ms. |
| 20 | Save a local draft | Dew bead becomes a small check over 150 ms. Avoid a toast on every keystroke. |
| 21 | Restore a draft | Clover lifts one paper corner and tucks it into the form; 400 ms. |
| 22 | Set a reminder | Bell-shaped flower nods through ±5° once; 300 ms, silent. |
| 23 | Log a follow-up | Sparrow carries an envelope across 30 px of the card; 500 ms. |
| 24 | Earn a badge | Wooden medallion scales from 0.94 to 1 over 220 ms. |
| 25 | Reach a level | Thin light ring expands around one tree and fades over 600 ms. |
| 26 | Advance weekly progress | One goal pebble gains moss through a 250 ms opacity change. |
| 27 | Use a freeze | Blue pebble receives a frost cap through a 200 ms fade. |
| 28 | Finish for today | Lantern settles to steady warmth; ambient animals stop moving over 300 ms. |
| 29 | Merge a duplicate | Two overlapping seed packets slide into one labeled packet over 250 ms. |
| 30 | Export data | Acorn closes the notebook and places it in a tiny satchel; 400 ms. |

**Small comedy details:** Pip’s scarf briefly points the wrong way in the wind. Nib’s pencil is slightly too large. Moss raises a “closed” sign without moving anything else.

---

## 4. Gamification Systems

### XP: reward actions the student controls

Invitations, offers, rejections, and silence award **zero XP**. Completing work earns XP. Outcomes receive appropriate scenery and acknowledgement without becoming a measure of personal worth.

| Action | XP | Limit |
|---|---:|---|
| Confirm an application was submitted | 40 | Once per distinct application |
| Complete a real OA | 30 | Once per assessment event |
| Attend an interview | 40 | Once per interview event |
| Complete a company or interview preparation checklist | 15 | Once per application and preparation type |
| Upload a new resume version | 15 | First three distinct versions per week |
| Review an analyzer result and choose a next step | 10 | First three distinct job descriptions per week |
| Log a follow-up actually sent | 10 | At least seven days apart; maximum two awards per application |
| Complete a weekly review | 15 | Once per week |
| Choose a manageable weekly goal | 5 | Once per week |
| Receive an invitation or offer; record rejection or ghosting | 0 | Visual acknowledgement only |

**Reward integrity**

- Separate current status from historical events.
- Changing “interview → rejected → interview” does not issue another reward.
- Keep a persistent award identity for submissions, assessments, interviews, and reviews.
- Retries, duplicate merges, and undo reuse those identities.
- A genuine second interview is a separate event and can earn its own effort XP.
- Correcting a falsely recorded action reverses its original award; restoring it restores that same award.
- Imported history can receive first-time credit after duplicate review, presented in one quiet recap.
- Badges and quests do not add bonus XP on top of their underlying actions.
- Opening the app, leaving a tab open, and repeatedly editing notes earn none.

### Eighteen forest levels

Thresholds are cumulative. Essential features are available from the beginning.

| Level | Name | Total XP |
|---:|---|---:|
| 1 | Buried Acorn | 0 |
| 2 | First Root | 40 |
| 3 | Tiny Sprout | 100 |
| 4 | Sunlit Seedling | 200 |
| 5 | Fern Keeper | 350 |
| 6 | Moss Tender | 550 |
| 7 | Sapling Scout | 800 |
| 8 | Birch Companion | 1,100 |
| 9 | Woodland Walker | 1,500 |
| 10 | Grove Guardian | 2,000 |
| 11 | Canopy Climber | 2,600 |
| 12 | Cedar Steward | 3,300 |
| 13 | Wildwood Warden | 4,100 |
| 14 | Ancient Oak | 5,000 |
| 15 | Moonlit Ranger | 6,000 |
| 16 | Evergreen Keeper | 7,200 |
| 17 | Great Forest Friend | 8,600 |
| 18 | Keeper of the Clearing | 10,000 |

Each level adds a small accent: fern, stone, flower cluster, birdhouse, lantern, stump, or pond detail. The student is never asked to finish all levels. XP can continue after level 18 without escalating requirements.

### Fifty achievements

Use a shared circular wooden frame and a simple emblem. Hide irrelevant achievements until they become useful. Avoid a completion percentage that turns every badge into homework.

| # | Badge | Unlock condition | Description |
|---:|---|---|---|
| 1 | Groundbreaking | Submit one application | “The dirt has been disturbed.” |
| 2 | Three’s a Grove | Submit three | “A promising patch.” |
| 3 | High Fivelands | Submit five | “Five chances planted.” |
| 4 | Tenacious | Submit ten | “Look at all that trying.” |
| 5 | Quarter Forest | Submit 25 | “The squirrels need a map.” |
| 6 | Fifty Shades of Green | Submit 50 | “Every shade: effort.” |
| 7 | Canopy Club | Submit 75 | “Considerable leaf coverage.” |
| 8 | Hundred Acre Try | Submit 100 | “A landscape of showing up.” |
| 9 | Return Visitor | Submit in two separate weeks | “Welcome back to your patch.” |
| 10 | New Trail | Apply in a second chosen role category | “Curiosity entered the forest.” |
| 11 | Paper Trail | Upload the first resume | “One very portable rectangle.” |
| 12 | Second Edition | Upload a second distinct version | “Director’s cut. Fewer typos.” |
| 13 | Version Control | Upload a third distinct version | “The sequel has improvements.” |
| 14 | Receipts Attached | Link a resume to one submission | “Future You says thanks.” |
| 15 | Traceable Trails | Link resumes to ten submissions | “Organized breadcrumbs.” |
| 16 | Keyword Detective | Review the first analyzer report | “Enhance. Politely.” |
| 17 | Five Field Notes | Review five distinct job descriptions | “Patterns are appearing.” |
| 18 | Honest Match | Mark a suggested keyword “not my experience” | “Accuracy looks good on you.” |
| 19 | Better Bullet | Record a resume revision after review | “A sentence found its purpose.” |
| 20 | Evidence, Please | Save a project example for a claimed skill | “The skill brought a receipt.” |
| 21 | Know Your Trees | Complete company preparation | “Research, now with context.” |
| 22 | Three Good Questions | Save three interview questions | “You’re interviewing them, too.” |
| 23 | Story Collector | Save one STAR-style story outline | “A plot with your name in it.” |
| 24 | Practice Clearing | Complete a practice session | “Rehearsal counts.” |
| 25 | Brain Reps | Complete an OA-practice checklist | “The neurons did some lifting.” |
| 26 | Assessment Adventurer | Complete a real OA | “You did the thing with the timer.” |
| 27 | Present and Accounted For | Attend the first interview | “You showed up.” |
| 28 | Field Debrief | Save a post-interview reflection | “A note from the expedition.” |
| 29 | Back in the Clearing | Attend three interviews | “The room feels more familiar.” |
| 30 | Thoughtful Follow-Up | Log one follow-up actually sent | “A professional wave.” |
| 31 | Gentle Nudge | Log follow-ups for three applications | “Persistent. Still polite.” |
| 32 | Future Favor | Set the first reminder | “Tomorrow has a helpful note.” |
| 33 | Pocket Notebook | Recover a saved draft | “Your words survived the tab.” |
| 34 | Trail Maintenance | Complete a bulk status update | “A little less admin.” |
| 35 | Duplicate Detective | Merge a confirmed duplicate | “Two acorns, one tree.” |
| 36 | Portable Forest | Export the first CSV | “Your grove travels well.” |
| 37 | Looking Around | Complete a weekly review | “A bird’s-eye view helps.” |
| 38 | Gentle Rhythm | Meet the weekly goal twice | “A rhythm that fits.” |
| 39 | Steady Seasons | Meet it in four weeks | “Consistency has many speeds.” |
| 40 | Eight Rings | Meet it in eight weeks | “Growth leaves a record.” |
| 41 | Small Is Valid | Choose a one-action weekly goal | “A small plan is still a plan.” |
| 42 | Closed for Restoration | Start a planned rest week | “Maintenance is supported.” |
| 43 | Welcome Back | Complete an action after a seven-day break | “No explanation required.” |
| 44 | Enough for Today | Use “done for today” | “The laptop may now become a rectangle.” |
| 45 | Next Small Step | Save an optional next step after a setback | “No dramatic comeback required.” |
| 46 | No Lesson Required | Choose “nothing to reflect on” after rejection | “You don’t owe this a moral.” |
| 47 | Lights Out | Enable quiet celebrations | “Cozy has settings.” |
| 48 | Forest Naturalist | Inspect five different creatures | “The neighbors know your face.” |
| 49 | An Open Door | Receive the first interview invitation | “Someone wants a conversation.” |
| 50 | A Very Good Email | Record the first offer | “Please enjoy this particular email.” |

The last two are optional outcome keepsakes. They should never appear as missing requirements in a progress checklist.

### Forgiving weekly streaks

Call the feature **“Your rhythm.”**

- Default: **three meaningful actions per week**, adjustable from one to seven.
- All actions may happen on one day.
- Eligible actions: submissions, completed preparation, reviewed analyzer reports with a next step, completed OAs, attended interviews, and sent follow-ups.
- Duplicate action-and-target combinations count once.
- Show goal progress as moss-covered pebbles.
- Start with two freeze tokens; hold at most two.
- Restore one token after two completed goal weeks.
- With auto-freeze enabled, an incomplete week uses a token.
- A freeze preserves the run without counting as a completed week: four completed weeks, one frozen week, and another completed week becomes five completed weeks in the preserved run.
- Planned rest weeks pause the rhythm without spending tokens or awarding progress.
- Without a freeze, close the run quietly. Preserve best run, total active weeks, XP, and forest.
- Use the chosen time zone; allow honest late logging for 48 hours.
- Goal changes apply going forward.

Returning message: **“A fresh week. Your forest is still here.”**

### Daily suggestions and weekly quests

Show **one optional daily suggestion** with no expiration and no penalty:

| Situation | Suggestion |
|---|---|
| Wishlist contains a suitable role | “Open one saved role and decide whether it still interests you.” |
| Interview is approaching | “Write three questions you want answered.” |
| Resume lacks a version name | “Give this resume a name Future You will understand.” |
| Several applications are waiting | “Review three pending applications.” |
| Nothing urgent exists | “You’re caught up. You can leave it here.” |

Offer two optional weekly quest cards from a finite library:

1. Submit one saved role.
2. Improve one truthful resume bullet.
3. Prepare three interview questions.
4. Review three pending applications.
5. Send one appropriate follow-up.
6. Complete the weekly review.

Choose deterministically from relevant tasks. Allow replacement or dismissal. Completing either quest adds one journal stamp; completing both adds no extra reward.

### Rejection resilience

After recording a rejection, offer three equally valid actions:

- **Save a next step**
- **No lesson needed**
- **Close for today**

An optional reflection has three short fields: “What happened?”, “Anything useful to keep?”, and “Next step, if any.”

No rejection quotas. No increasingly valuable mushrooms. No special reward for enduring more disappointment.

A useful weekly recap: **“Four applications sent, one interview attended, two chapters closed.”** Let the student hide closed-outcome counts.

### Anti-burnout features

- **Enough for today:** save drafts, collapse quests, and mute reminders until the selected return time.
- **Exam week:** pause goals and reminders for a chosen interval.
- **Small week:** change the upcoming goal to one action.
- **Quiet celebrations:** retain the illustration and confirmation without particles.
- **Comparison controls:** hide benchmarks while retaining personal statistics.
- **Finite home page:** show one next action and a clear stopping point.
- **Optional late-night nudge:** “Your draft is saved. Tomorrow works.”
- **No activity leaderboard:** this is a personal tool, not a contest with strangers.

---

## 5. Statistics & Insights

### Define the numbers before decorating them

Keep these separate:

- **Any response:** a decision or next-step message, including rejection or an OA invitation; excludes receipt confirmations.
- **Positive next step:** OA invitation, interview invitation, or offer.
- **Interview conversion:** applications that ever received an interview invitation divided by submitted applications.
- **Offer conversion:** applications that ever received an offer divided by submitted applications.

A rejection can increase “any response rate.” That makes it a useful communication metric, but a poor headline success metric.

Use historical events rather than current status to calculate progression. A rejected application may still have reached interviews. An OA is an optional branch; never infer one simply because an interview happened.

### Twenty-two useful metrics and views

| # | Metric or view | Definition and presentation |
|---:|---|---|
| 1 | Applications submitted | Total genuine submissions, with this-week and this-month counts. |
| 2 | Meaningful actions | Submissions, preparation, assessments, interviews, and follow-ups shown separately. |
| 3 | Any response rate | Applications with a decision or next-step reply ÷ submissions. Show numerator and denominator. |
| 4 | Positive next-step rate | Applications with OA, interview, or offer progression ÷ submissions. |
| 5 | Interview conversion | Applications ever invited to interview ÷ submissions. Count each application once. |
| 6 | Offer conversion | Applications ever offered ÷ submissions. |
| 7 | Interview-to-offer conversion | Applications with both an interview invitation and offer ÷ applications invited to interview. |
| 8 | Progression chart | Submitted → positive next step → interview → offer, with OA shown as a separate branch. |
| 9 | Current pipeline | Horizontal counts by current status. Separate this from historical progression. |
| 10 | Pending age | Buckets: 0–7, 8–14, 15–30, and 31+ days since relevant contact. |
| 11 | Response time | Median days to first substantive reply among applications that received one. Show how many remain pending. |
| 12 | Thirty-day response rate | Only submissions at least 30 days old; count replies received within their first 30 days. |
| 13 | Resume-version outcomes | Matched application counts and observed next-step rates for each version. |
| 14 | Role-category outcomes | Compare SWE, data, design, and other chosen categories using the same observation window. |
| 15 | Application-source outcomes | Company website, campus board, referral, career fair, and other manually recorded sources. |
| 16 | Location preferences | Responses by remote, hybrid, and on-site; useful for planning, not causal claims. |
| 17 | Weekly rhythm | Completed goal weeks, protected weeks, best run, and total active weeks. |
| 18 | Preparation record | Interviews with completed preparation, plus useful notes retained. |
| 19 | Resume attachment coverage | “You know which resume you used for 18 of 22 applications.” |
| 20 | Follow-up queue | Eligible follow-ups, snoozed items, and next reminder dates. |
| 21 | Compensation view | Reported pay ranges, separated by currency and hourly versus annual units. Never invent conversions without stated assumptions. |
| 22 | Personal field journal | Weekly summary of effort, changes, and the next chosen priority. |

Charts should favor readable horizontal bars, small line charts, and labeled tables. Provide a text equivalent and avoid red/green-only comparisons.

### Benchmark context: useful numbers, honestly labeled

The sources checked do **not** establish a universal internship “any response” rate. The app should say so rather than inventing a reassuring average.

| Context | Rough number | How to use it |
|---|---|---|
| Broad application-to-interview conversion | Approximately **3–5%**: Ashby reports 3.6% for technical roles and 4.7% for business roles in its Q1 2026 figures. | An optional contextual reference, clearly labeled **broader recruiting data, not internship-specific**. Its report analyzes over 109 million applications across 247,000 jobs from 2021 through March 2026. [Ashby, April 2026](https://www.ashbyhq.com/talent-trends-report/reports/2023-recruiter-productivity-trends-report) |
| Differences by source | Ashby’s 2025 analysis reported approximately **3% inbound** versus **40% referred** application-to-interview progression. | Explain that applicant pools and selection differ substantially. This does not mean obtaining a referral causes a thirteenfold improvement. [Ashby referral analysis](https://www.ashbyhq.com/talent-trends-report/reports/referrals) |
| Internship market difficulty | Handshake reported internship postings declining **more than 15%** between January 2023 and January 2025. | Offer market context when useful, with the observation dates visible. [Handshake Internships Index](https://joinhandshake.com/research/economic-research/handshake-internships-index-2025/) |
| A commonly confused statistic | NACE’s 2025 report cited a **62% full-time offer rate for existing interns**. | Never compare this with applications to obtain an internship; it measures a different transition. [NACE executive summary](https://www.naceweb.org/docs/default-source/default-document-library/2025/publication/executive-summary/2025-nace-internship-and-coop-report-executive-summary.pdf?sfvrsn=4e8d957c_3) |

Every benchmark card should show its source, publication date, observed period, population, and metric definition. Industry, geography, school year, eligibility, employer mix, and tracking completeness all affect comparability.

Avoid “You are below average.” Prefer:

> “Your observed interview rate is 6%: 3 of 50 applications. A broader recruiting study reported roughly 3–5%, but its applicants and roles differ from yours.”

### Deterministic insight cards

These are templates populated from recorded data, not generated advice.

| Trigger | Example insight |
|---|---|
| First ten submissions | “Ten applications recorded. Your forest now has enough trees to need directions.” |
| All submissions are recent | “Most applications are under two weeks old. There is little outcome data to compare yet.” |
| Resume comparison has sufficient history | “In these recorded applications, v3 had twice the next-step rate: 12/40 versus 6/40 for v2.” |
| Same comparison | Add: “Different roles, dates, or employers may explain the difference.” |
| Resume samples are small | “v3 has 2 responses from 6 applications. Too early to choose a winner.” |
| Several records lack resume versions | “Six applications are missing a resume version. Adding it will improve future comparisons.” |
| A source has more observed interviews | “Campus-board applications account for 4 of your 7 interview invitations.” |
| Follow-up reminder becomes eligible | “Three applications are ready for a follow-up review.” |
| Many applications lack dates | “Eight imported records need submission dates before they can join time-based charts.” |
| Weekly goal is complete | “Your plan for this week is complete. Anything else is optional.” |
| User returns after a break | “Your records are here. Start with whichever application matters now.” |
| A role category has no mature applications | “These applications are still too recent for a fair comparison.” |

**Comparison rules:** Prefer identical 30-day observation windows. Show raw counts. Require at least 20 mature applications per group before surfacing ratio-based comparisons, while still labeling them preliminary. Never calculate a ratio against a zero rate; show counts and percentage-point differences instead.

An optional later slice can add uncertainty intervals. Even then, an observational difference should never become a causal claim about a resume.

---

## 6. Resume Analyzer Details

### Product promise

Call the main result **“Keyword match”**, with this explanation:

> “How much of the recognized language in this target appears in your resume.”

It cannot determine competence, fit, ATS acceptance, or hiring probability. It can identify wording, expose missing mentions, and make tailoring less tedious.

Use three result groups:

- **Found in your resume**
- **Not mentioned**
- **Optional ideas**

### Seven role presets

Each preset contains **30 canonical concepts** across six categories. Category weights sum to 100%. Within a category, concepts share the same base weight.

These are broad vocabulary menus. They should never imply that every internship requires every listed tool or method.

### Software engineering — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Languages | 20% | Python; Java; JavaScript; TypeScript; C++ | Name the language used in a real project and what you built. |
| Web and APIs | 20% | React; Node.js; REST APIs; HTML; CSS | Describe an interface or endpoint you implemented. |
| Foundations | 20% | Data structures; algorithms; object-oriented programming; debugging; problem solving | Give a specific problem, bug, or tradeoff. |
| Quality | 15% | Unit testing; integration testing; code review; CI/CD; test-driven development | Explain how you checked that your work functioned. |
| Tools and infrastructure | 15% | Git; Linux; Docker; SQL; AWS | Put relevant tools beside the project that used them. |
| Delivery | 10% | Agile; collaboration; documentation; performance optimization; accessibility | Describe something you made easier to ship, use, or maintain. |

### Data science — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Data handling | 20% | Python; SQL; pandas; NumPy; data cleaning | Explain the dataset and one cleaning decision. |
| Statistics | 20% | Hypothesis testing; regression; probability; statistical inference; A/B testing | Connect the method to the question it answered. |
| Modeling practice | 20% | Supervised learning; unsupervised learning; feature engineering; model evaluation; cross-validation | Name the evaluation method and metric when available. |
| Tools | 15% | scikit-learn; Jupyter; Git; matplotlib; seaborn | Attach tools to an actual analysis. |
| Applications | 15% | Classification; clustering; forecasting; natural language processing; recommendation systems | Highlight the project closest to this role. |
| Research and communication | 10% | Experimental design; reproducibility; dashboards; stakeholder communication; data storytelling | Explain a finding and why it mattered. |

### Product management — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Discovery | 20% | User research; customer interviews; personas; customer feedback; competitive analysis | Class and club projects can provide relevant examples. |
| Strategy | 20% | Product strategy; roadmaps; prioritization; opportunity sizing; product discovery | Explain what you prioritized and why. |
| Execution | 20% | Product requirements documents; user stories; acceptance criteria; sprint planning; backlog management | Name a planning artifact you created. |
| Measurement | 20% | KPIs; product analytics; funnels; retention; A/B testing | Connect a decision to a measurable outcome. |
| Technical fluency | 10% | SQL; APIs; Figma; wireframes; Jira | Describe how a tool helped investigate or communicate an idea. |
| Collaboration | 10% | Stakeholder management; cross-functional collaboration; communication; presentations; go-to-market | Identify your contribution to a shared decision. |

### Product and UX design — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Research | 20% | User interviews; usability testing; survey design; affinity mapping; personas | Explain what changed because of research. |
| Interaction | 20% | User flows; information architecture; wireframes; prototyping; interaction design | Name a flow you simplified or tested. |
| Visual craft | 20% | Typography; color theory; layout; visual hierarchy; iconography | Let the portfolio demonstrate craft. |
| Systems and inclusion | 15% | Design systems; components; design tokens; responsive design; accessibility | Describe a reusable pattern or accessibility decision. |
| Tools | 15% | Figma; FigJam; Adobe Illustrator; Adobe Photoshop; Sketch | List tools you can comfortably demonstrate. |
| Communication | 10% | Portfolios; case studies; design critique; developer handoff; design rationale | Make your individual contribution easy to find. |

### Finance — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Foundations | 20% | Financial statements; accounting; corporate finance; economics; time value of money | Coursework can provide truthful context. |
| Modeling | 25% | Financial modeling; forecasting; scenario analysis; sensitivity analysis; three-statement modeling | Describe a model and the assumptions you tested. |
| Valuation | 20% | Discounted cash flow; comparable companies; precedent transactions; enterprise value; equity value | Mention methods you actually used. |
| Tools | 15% | Excel; PowerPoint; SQL; Python; data analysis | Name a useful output you produced. |
| Markets and risk | 10% | Equities; fixed income; financial markets; risk analysis; portfolio analysis | Connect interest to completed research or analysis. |
| Execution | 10% | Due diligence; financial research; presentations; attention to detail; communication | Replace generic traits with a concrete responsibility. |

### Consulting — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Structuring | 20% | Problem structuring; issue trees; hypotheses; root cause analysis; frameworks | Show how you broke down a messy problem. |
| Research | 15% | Market research; competitive analysis; industry research; benchmarking; customer interviews | Explain your sources and the decision they supported. |
| Analysis | 25% | Excel; data analysis; financial modeling; market sizing; sensitivity analysis | Include a method and a result you can defend. |
| Business judgment | 15% | Strategy; operations; process improvement; business cases; profitability analysis | Describe a recommendation and its tradeoff. |
| Communication | 15% | PowerPoint; storylining; presentations; executive summaries; data visualization | Show how analysis became a recommendation. |
| Delivery | 10% | Stakeholder management; teamwork; project management; workshop facilitation; implementation planning | Give a specific coordination example. |

### Marketing — 30 concepts

| Category | Weight | Keywords and concepts | Tip |
|---|---:|---|---|
| Strategy | 20% | Segmentation; targeting; positioning; customer personas; competitive analysis | Explain the audience and why the message suited it. |
| Content | 15% | Copywriting; content strategy; editorial calendars; storytelling; brand voice | Link a sample or describe content you produced. |
| Channels | 20% | SEO; email marketing; social media; paid search; influencer marketing | Focus on channels you actually used. |
| Measurement | 20% | Google Analytics; conversion rate; click-through rate; customer acquisition cost; attribution | Include metrics whose sources you can explain. |
| Optimization | 15% | A/B testing; keyword research; campaign optimization; landing pages; funnels | Describe a change and its observed result. |
| Execution | 10% | Campaign planning; CRM; audience research; creative briefs; stakeholder communication | Explain your contribution to a real campaign. |

### Explicit synonym groups

Any alias produces one canonical match. Repeating aliases does not increase the score.

| Canonical concept | Accepted equivalents |
|---|---|
| JavaScript | JavaScript; JS |
| TypeScript | TypeScript; TS |
| Node.js | Node.js; NodeJS; Node JS |
| React | React; React.js; ReactJS |
| REST APIs | REST API; REST APIs; RESTful API; RESTful APIs |
| Object-oriented programming | Object-oriented programming; object oriented programming; OOP |
| Test-driven development | Test-driven development; test driven development; TDD |
| CI/CD | CI/CD; CICD; continuous integration and continuous delivery; continuous integration and continuous deployment |
| SQL | SQL; structured query language |
| AWS | AWS; Amazon Web Services |
| scikit-learn | scikit-learn; scikit learn; sklearn |
| Natural language processing | Natural language processing; NLP |
| A/B testing | A/B testing; AB testing; A B testing; split testing |
| Product requirements documents | Product requirements document; product requirements documents; PRD; PRDs |
| KPIs | KPI; KPIs; key performance indicator; key performance indicators |
| Accessibility | Accessibility; a11y |
| Adobe Illustrator | Adobe Illustrator; Illustrator |
| Adobe Photoshop | Adobe Photoshop; Photoshop |
| Discounted cash flow | Discounted cash flow; discounted cash flow analysis; DCF |
| Comparable companies | Comparable companies; comparable company analysis; trading comparables |
| Three-statement modeling | Three-statement modeling; three statement modeling; three-statement financial modeling |
| SEO | SEO; search engine optimization |
| Click-through rate | Click-through rate; click through rate; CTR |
| Customer acquisition cost | Customer acquisition cost; CAC |
| CRM | CRM; customer relationship management |
| Root cause analysis | Root cause analysis; root-cause analysis |

Do not equate Java with JavaScript, Git with GitHub, Excel with financial modeling, or Figma with prototyping. Related tools and skills are not automatically interchangeable.

### Matching rules

1. **Normalize Unicode, whitespace, and common punctuation variants.**
2. **Repair obvious PDF line-break hyphenation** while preserving original text for evidence.
3. **Preserve technical punctuation** in C++, C#, .NET, Node.js, and CI/CD.
4. **Match whole tokens and phrases.** Java must not match JavaScript.
5. **Use explicit singular and plural aliases.** Avoid broad stemming.
6. **Count each canonical concept once.**
7. **Guard short ambiguous terms.** Bare “PM” should not match product management. Require contextual evidence for terms such as R, Go, and TS.
8. **Recognize simple negative phrases:** “no experience with Python,” “never used Docker,” or “not familiar with SQL.” Flag these for review and withhold automatic credit.
9. **Handle exceptions:** “not only” is not a negation; “Python not required” is not a required skill.
10. **Show the exact evidence.** A matched chip opens the original sentence.
11. **Keep mention separate from proficiency.** “Learning Python” mentions Python; it does not establish expertise.
12. **Fail visibly on unreadable PDFs.** Offer pasted text instead of reporting a false zero.

### Two scoring modes

#### A. Preset mode: category coverage

Without a job description, show **“SWE category coverage”**, not a job-specific match claim.

To avoid implying that every language is required, each category reaches full credit after two of its five concepts are mentioned.

For category \(c\):

- \(W_c\): category weight as a fraction.
- \(m_c\): number of distinct matched concepts.

\[
P = \operatorname{round}\left(
100 \sum_c W_c \times \min(m_c / 2,\ 1)
\right)
\]

Explain the rule:

> “This measures coverage across six categories. Two recognized concepts fill a category. It does not mean you mention every preset keyword.”

Display the literal concept count beside it: **“14 of 30 concepts mentioned.”** Unmatched concepts remain optional ideas.

#### B. Job-description mode: weighted keyword match

The pasted job description determines the target list. The selected preset supplies category weights.

For recognized target concept \(i\):

- Base weight \(b_i = W_c / 5\).
- Required multiplier: **3**.
- Unclassified mention multiplier: **2**.
- Preferred or optional multiplier: **1**.
- Resume match \(x_i\): **1** if found, otherwise **0**.

\[
J = \operatorname{round}\left(
100 \times
\frac{\sum_i b_i r_i x_i}
{\sum_i b_i r_i}
\right)
\]

Repeated mentions do not increase weight.

**Requirement classification:** Use explicit headings and phrases such as “required,” “must have,” “preferred,” and “nice to have.” Show classifications so the student can correct them.

**Alternatives:** Recognize simple constructions such as “Python or Java” as an alternative group. Match either, use one group weight, and expose the grouping for review. More complicated requirements can be grouped manually.

**Sparse-description guard:** If fewer than six concepts are recognized, or everything falls into one category, show counts and highlights with **“Limited dictionary coverage”** instead of a prominent percentage.

**Requirements outside the score:** Put graduation dates, work authorization, location, availability, GPA, and application deadlines in a separate manual checklist. Keyword presence cannot establish eligibility.

### Results layout

1. **Summary:** “12 of 17 recognized job concepts appear in this resume.”
2. **Weighted match:** percentage, denominator, and calculation explanation.
3. **Found:** chips linked to original evidence.
4. **Not mentioned:** grouped by category, explicit requirements first.
5. **Three next steps:** hand-written tips from the highest-weight uncovered categories.
6. **Optional ideas:** collapsed preset suggestions.
7. **Extraction preview:** reveal exactly what text was analyzed.
8. **Add target phrase:** let the student supply an unfamiliar tool or requirement.
9. **Truthfulness reminder:** “Add it only if you’ve done it. Classes, clubs, and personal projects can count.”
10. **Compare versions:** show gained and lost mentions against the same target.

Save the resume version, target-text fingerprint, dictionary version, scoring version, and manual edits with each result. Compare scores only under the same configuration.

---

## 7. Quality-of-Life Features That Reduce Burden

| # | Feature | Concrete implementation slice |
|---:|---|---|
| 1 | Quick-add in under ten seconds | Company, role, status, save. Default to wishlist unless the student explicitly chooses applied. All other fields are optional. |
| 2 | “Just applied” mode | A dedicated entry point preselects applied and today’s date, with a visible confirmation. |
| 3 | URL suggestions | Recognize known ATS hostnames and path patterns. Suggest employer names when reliable; leave opaque job IDs unexplained. |
| 4 | Optional metadata extraction | For allowlisted public ATS pages, parse title and JobPosting metadata with strict fetch limits. Always provide a manual fallback. |
| 5 | Preserve the source URL | Store the original link separately from any cleaned display URL. |
| 6 | Duplicate warning | Compare requisition ID, employer, role, and cycle. Suggest a possible match without blocking legitimate second applications. |
| 7 | Sticky defaults | Remember the last chosen resume, location preference, and role category, with visible override controls. |
| 8 | Account-scoped local drafts | Save form fields after a short debounce and on blur. Restore only within the matching signed-in account. |
| 9 | Honest save labels | Distinguish “Saved on this device,” “Saved to your account,” and “Couldn’t save.” |
| 10 | Draft recovery card | On return, offer “Continue draft” and “Discard.” Display its last saved time. |
| 11 | Storage-failure fallback | If local storage is unavailable, show a persistent notice and offer “Copy draft text.” |
| 12 | Keyboard shortcuts | `/` search, `N` new application, `Esc` close, and a help overlay. Disable shortcuts while typing in inputs. |
| 13 | Keyboard status moves | Provide “Move to…” on every card. Dragging stays optional. |
| 14 | Follow-up reminders | Suggest a review date after submission; let the student snooze, dismiss, or record an expected reply date. |
| 15 | Calendar downloads | Download an interview or deadline as an `.ics` file with the correct time zone. |
| 16 | Copyable follow-up templates | Fill company and role names. Let the student edit and send through their own email client. |
| 17 | Interview-question bank | Save reusable questions, then pick three for a specific interview. |
| 18 | Experience story bank | Short situation, task, action, result fields reusable across interviews. |
| 19 | Bulk status updates | Select records, preview the change, apply once, and offer undo. Summarize forest changes together. |
| 20 | Bulk date entry | Set dates for imported records without opening each one. |
| 21 | Useful saved filters | “Interview this week,” “Awaiting reply,” “Missing resume version,” and “Follow-up review.” |
| 22 | Fast search | Match company, role, notes, and location; highlight where a result matched. |
| 23 | Resume naming prompt | Suggest labels such as “Frontend — October” rather than “resume_final_FINAL2.pdf.” |
| 24 | Resume attachment warning | Before marking applied, gently offer a resume selection. Allow “I don’t remember.” |
| 25 | Application snapshots | Preserve the pasted job description and resume reference used at submission time. |
| 26 | Spreadsheet-safe CSV export | Export dates, statuses, notes, URLs, and version names with safe text escaping. |
| 27 | CSV import preview | Map columns, show questionable dates and duplicates, then confirm the batch. |
| 28 | Undo recent changes | A small recent-activity panel supports correcting status and date mistakes. |
| 29 | Conflict-aware editing | If the same record changed elsewhere, show the competing values before replacing them. |
| 30 | Low-energy view | Show only “Next action,” “This week,” and the compact forest. |
| 31 | Session finish button | Save drafts, show completed actions, and offer a return date. |
| 32 | Offer comparison sheet | Compare pay, location, dates, learning goals, team notes, and decision deadlines. |
| 33 | “Unknown” is valid | Dates, salary, location, and resume version can remain unknown without blocking entry. |
| 34 | Application season tags | Separate summer 2027, fall 2027, and other cycles without creating another account. |

**Template examples**

- Follow-up: “Hi [Name], I’m following up on my application for [Role], submitted on [Date]. I’m still interested and would appreciate any update you can share. Thank you.”
- Post-interview note: “Thank you for speaking with me about [Role]. I enjoyed learning about [Specific topic]. Please let me know if I can provide anything else.”
- Personal debrief: “What did they ask? What did I explain well? Anything I want to practice next?”

---

## 8. Empty States, Loading States, 404, and Onboarding

### Onboarding: get to the first useful action quickly

Use three short, skippable steps:

1. **Choose a direction:** select role interests or “still exploring.”
2. **Choose a manageable rhythm:** one, three, or five actions per week; custom available.
3. **Plant the first tree:** quick-add an application, import existing records, or explore a demo.

The opening line:

> “You handle the applying. This place remembers the work.”

Additional details:

- Preview three healthy forest stages without making the empty clearing look inferior.
- Offer motion and dialogue settings before the first celebration.
- Detect the device time zone and let the student correct it.
- Keep demo data clearly marked and separate from real statistics and rewards.
- Let the first resume upload happen later.
- Do not require choosing an ideal career before tracking an application.

### Charming states

| State | Illustration | Copy and action |
|---|---|---|
| No applications | Fern beside the planting bed | “Every forest starts somewhere.” **Add your first application** |
| Empty wishlist | Seed tray with one blank packet | “A place for the possibilities.” **Save a role** |
| No interviews yet | Pip arranging two chairs | “The chairs are ready when you need them.” **View applications** |
| No offers yet | Unlit picnic lantern | “This page can wait. Your work is still growing.” |
| No resume versions | Nib holding a blank plant marker | “Give your next application a paper trail.” **Upload a resume** |
| No analyzer results | Rue beside a closed field guide | “Bring a resume and something to compare it with.” **Start a check** |
| Too little statistical history | Alder studying three leaves | “A few leaves don’t make a trend yet.” Show counts anyway. |
| No reminders | Tuck beside an empty notebook | “Nothing you need to remember right now.” |
| Search has no matches | Acorn looking behind a stump | “Nothing on this trail.” **Clear filters** |
| Weekly plan complete | Moss on the bench | “Your plan is complete. You can stop here.” |
| Everything archived | A tidy clearing with labeled baskets | “A chapter closed. The forest stays.” **Start another season** |
| Import complete | Acorn beside stacked notebooks | “Your history made it.” Show imported, skipped, and review-needed counts. |

### Loading and error states

| Situation | Behavior |
|---|---|
| Initial dashboard load | Stable skeletons matching the final layout; one static tree silhouette. |
| Saving an application | Button reads “Saving…”; preserve entered values; prevent accidental duplicate submission. |
| Slow save | “Still saving. Your draft is kept on this device” only if that local save succeeded. |
| Failed save | “Your account copy didn’t save. Your local draft is safe” only when true. Offer retry. |
| PDF extraction | “Reading the text in your PDF…” No invented progress percentages. |
| Scanned or unreadable PDF | Rue holds an almost blank page: “I couldn’t read enough text. Paste it below to continue.” |
| Analyzer processing | “Checking recognized phrases…” Avoid implying remote intelligence. |
| Session expired | Preserve the local draft and return to the same form after login. |
| Offline | “You’re offline. Keep drafting here; account saves will need a connection.” |

### The 404 page

**Illustration:** Tuck beside a trail sign pointing in three directions: “Home,” “Applications,” and “Definitely a Bush.”

**Headline:** “This trail goes nowhere.”

**Body:** “Your applications are still where you left them.”

**Actions:** **Back to the clearing** and **View applications**.

An optional second line after a pause: “Tuck has filed a map correction.”

### FAQ ideas

| Question | Short answer |
|---|---|
| Does a rejection remove progress? | “No. Your application and effort remain recorded.” |
| What happens when I take a break? | “Your forest stays healthy. You can pause goals and reminders.” |
| Is the analyzer predicting my chances? | “No. It compares recognized language and shows its evidence.” |
| Why is a keyword marked missing? | “It wasn’t found in the extracted text or approved aliases. You can review the text and target list.” |
| Is a 30-day silence definitely ghosting? | “No. It triggers a review suggestion; you choose the label.” |
| Why did my response rate rise after rejection? | “Any response includes decisions. Positive next steps are tracked separately.” |
| Can I correct a status? | “Yes. Your historical events and statistics can be corrected.” |
| Where is my draft saved? | “The save indicator distinguishes this device from your account.” |
| Can I export everything? | “Application records can be exported as CSV; original resumes remain downloadable.” |
| Do I have to maintain a streak? | “No. The weekly rhythm is optional.” |

---

## 9. Copywriting: Encouragement for Specific Moments

Keep copy short. Match the emotional weight of the event. Let the student choose a quieter tone.

### Starting and submitting

1. **Before the first application:** “You don’t need a whole plan to take one step.”
2. **First application saved:** “Your first tree is planted.”
3. **After submitting:** “Sent. The effort is yours, whatever happens next.”
4. **Quick-add complete:** “Recorded. One less thing to keep in your head.”
5. **Third application:** “A small grove is forming.”
6. **Tenth application:** “Ten applications. That is a whole grove situation.”
7. **Twenty-fifth application:** “Twenty-five chances planted. Bridge-worthy.”
8. **Hundredth application:** “A hundred records of showing up.”

### Rejection

9. “That one hurt. You can take a minute.”
10. “This decision belongs to one application.”
11. “The tree stays.”
12. “You don’t have to find the lesson today.”
13. “We can close this chapter without explaining your worth.”
14. “Your effort did not become imaginary.”
15. “A mushroom has arrived. No inspirational speech required.”
16. “Try again later is a complete plan.”

### Ghosting and waiting

17. **Thirty days without reply:** “No reply yet. Want to follow up, keep waiting, or close this out?”
18. “Silence gives us limited information.”
19. “We can hold the reminder so you don’t have to.”
20. “Their timeline can stay in this tab.”
21. **Ghosting confirmed:** “Moved out of your active queue. The effort remains.”
22. **Unexpected late reply:** “A plot development.”
23. “Still waiting is a status. It isn’t a personal review.”

### Interviews and assessments

24. **First interview invitation:** “They want to meet the person behind the PDF.”
25. “Three stories. Three questions. One manageable prep session.”
26. **Before an interview:** “You’re allowed to think before answering.”
27. **After attending:** “You showed up. Save anything you want to remember.”
28. **After an OA:** “Submitted. The timer no longer owns this afternoon.”
29. **After a difficult interview:** “One conversation can be difficult without defining you.”
30. **Second interview round:** “Another conversation. You’re allowed to ask more questions, too.”

### Offers and choices

31. **First offer:** “An offer. Take a moment before the next spreadsheet.”
32. “Your priorities get a vote.”
33. “You can be excited and still ask questions.”
34. **Offer accepted:** “A new chapter has a start date.”
35. **Offer declined:** “Choosing what fits is progress, too.”
36. **Decision deadline:** “Let’s make room for a considered answer.”

### Resumes and the analyzer

37. **Resume uploaded:** “Saved a version. Future detective work reduced.”
38. **Analyzer result:** “Here are the phrases I could verify.”
39. **Missing keyword:** “Not mentioned here. Add it only if it’s true.”
40. **Low coverage:** “This is a wording check, not a verdict.”
41. **Revision saved:** “A clearer version of work you already did.”
42. **Sparse job description:** “There isn’t enough recognized detail for a useful percentage.”

### Rest, evenings, and weekends

43. **Late-night applying:** “Your draft is saved. Tomorrow works.”
44. **Weekend applying:** “A little weekend progress. Then the weekend can continue.”
45. **Goal complete:** “Your plan for this week is complete.”
46. **Returning after a break:** “Welcome back. No explanation required.”
47. **Freeze used:** “A week protected. Nothing erased.”
48. **Done for today:** “Saved. You can leave it here.”
49. **Exam week:** “The forest can wait while other things need you.”
50. **No urgent tasks:** “Nothing needs your attention right now.”

---

## 10. Top 15 Must-Build Picks, Ranked by Impact to Effort

These rankings assume the basic authenticated tracker and storage exist. Effort refers to a narrow, reviewable slice, with reusable illustration assets where relevant.

| Rank | Pick | Why it earns its place | Initial slice |
|---:|---|---|---|
| 1 | Fast quick-add | The tracker must reduce application admin immediately. | Half day: company, role, status, optional resume, save. |
| 2 | Reliable local draft recovery | Losing work is especially costly when motivation is already low. | Half to one day: account-scoped drafts, restoration, honest save labels. |
| 3 | One application → one persistent tree | Makes the central promise visible from the first submission. | One day: four tree symbols, stable slots, successful-save planting. |
| 4 | Rejection preserves the tree and adds mushrooms | Gives disappointing updates a gentle, distinctive treatment. | Half day: mushroom symbol, supportive copy, no lost progress. |
| 5 | Follow-up review queue | Removes repeated inbox checking and remembering. | Half day: next-review dates, snooze, pending filter. |
| 6 | Resume version attached to each submission | Creates the data needed for meaningful later comparisons. | Half day: version picker, stable reference, “unknown” option. |
| 7 | Accurate outcome counts with denominators | Builds trust and prevents misleading dashboard percentages. | Half to one day: event-based counts and clear definitions. |
| 8 | Weekly rhythm with pause and freezes | Encourages consistency while accommodating college life. | One day: selectable goal, pebbles, two freezes, planned rest. |
| 9 | Bulk updates with undo | Makes maintenance tolerable after a batch of emails. | Half to one day: select, preview, apply, undo. |
| 10 | “Enough for today” | Gives the app a satisfying stopping point. | Half day: save, recap, collapse quests, reminder pause. |
| 11 | Transparent keyword checker | Provides immediate practical help without paid AI. | One day: one preset, pasted text, aliases, evidence, category coverage. |
| 12 | JD-specific weighted checking | Makes tailoring more targeted and useful. | One day after the checker: recognized targets, requirement weights, sparse guard. |
| 13 | Four milestone landmarks | Creates memorable medium-term progress. | One day: gate at 10, bridge at 25, pond at 50, treehouse at 100. |
| 14 | Local-time sky and motion controls | Makes the home page feel personal with little complexity. | Half day: four time palettes, override, reduced-motion behavior. |
| 15 | A small initial mascot cast | Adds personality without requiring twelve characters at launch. | One day per character: begin with Fern, Prickle, and Moss; expand later. |

**The first emotional loop to perfect:** submit an application → see a tree appear → receive a clear saved confirmation → know the next useful action → feel free to stop.