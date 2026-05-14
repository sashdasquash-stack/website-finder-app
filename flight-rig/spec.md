# Cinematic Flight Rig — Design Specification

A 3D-printable mechanical flight rig that physically presses keyboard keys to
fly aircraft in Microsoft Flight Simulator, DCS World, War Thunder, and
X-Plane 12. No electronics, no USB controller — every input is a printed
plunger pushing a real keycap on a real keyboard underneath.

## 0. Build summary

- **Target keyboard**: Aula Hero 68 HE — 65% layout, Hall Effect magnetic
  switches, MX-stem keycaps, 19.05mm key pitch, ~4mm travel, software-
  adjustable actuation point (0.1–3.8mm)
- **Operator**: right-handed, medium hands
- **Sims**: MSFS 2020/2024, DCS World, War Thunder (air), X-Plane 12
- **Footprint**: ~760 × 260 × 90mm (frame + throttle bay + stick bay)
- **Mass goal**: ~2.5–3kg via sand-fill cavities (no desk clamps)
- **Aesthetic**: matte stealth black, PETG body with TPU plunger tips

## 1. Top-down layout

```
        +---------------------------------------------------------------+
        |                                                               |
        |  THROTTLE             KEYBOARD CAVITY              JOYSTICK   |
        |    bay         +-----------------------+              bay     |
        |  ┌────────┐    | Aula Hero 68 HE       |          ┌────────┐  |
        |  │ slot   │    | (hinged lid above)    |          │ gimbal │  |
        |  │ 220mm  │    |   330 × 120 mm        |          │  ±25°  │  |
        |  │ throw  │    |                       |          │        │  |
        |  └────────┘    +-----------------------+          └────────┘  |
        |                                                               |
        |  [GEAR]  [FLAP+] [FLAP-]      [HAT U/D/L/R]         [TRIGGER] |
        |  lid-mounted aux buttons (vertical plunger modules in lid)    |
        |                                                               |
        +---------------------------------------------------------------+
            260mm wide        340mm wide                  160mm wide
                            Total ~760 × 260 × 90 mm
```

Total length exceeds the 256mm build volume of every consumer Bambu printer,
so the **base must split into three pieces**: left base (throttle), center
base (keyboard tray), right base (gimbal). M4 bolted flanges with 10mm
overlap join the sections. The hinged top lid splits similarly into three
panels, each ≤250mm.

## 2. Frame (base + hinged lid)

- **Material**: PETG black, 4 walls, 25% gyroid infill
- **Cavity for keyboard**: 332 × 122 × 42mm (1mm clearance on each side)
- **Walls**: 5mm general, 8mm where the gimbal or hinge mounts
- **Hinge**: two printed barrel hinges at the rear, 80mm apart, using M4
  rod as the pin. Lid lifts 95° to clear the keyboard fully.
- **Lid lock**: front edge has a printed cam latch with an Ø8mm rod and
  a thumb-handle. Half-turn locks the lid down for play, eliminating
  rattle under aggressive throttle pushes.
- **Sand-fill cavity**: each base section has a sealed inner pocket
  (~10mm tall, ~80% of section floor area) accessible by a screwed cover
  plate. Fill with playground sand or steel shot before final assembly.
  This is the mass that keeps the rig planted without desk clamps.

## 3. Joystick assembly (right base section)

### 3.1 Two-axis nested gimbal

Two concentric printed rings, one inside the other, sharing a perpendicular
axis pair:

- **Outer ring**: rotates on the X-axis (pitch). Pivots on M4 axles seated
  in flanged bearings or printed bushings in the gimbal housing walls.
- **Inner ring**: nested inside, rotates on the Y-axis (roll). Pivots on
  M4 axles seated in the outer ring.
- **Stick shaft**: passes vertically through the inner ring and is fixed
  to it. Tilting the shaft tilts the inner ring (roll) and/or the outer
  ring (pitch) independently or together → 8-way motion with clean
  diagonals.

Why a nested gimbal over a ball joint: a ball joint adds an uncontrolled
twist axis, and uneven friction causes the stick to favor certain
directions. The nested ring design locks roll and pitch to independent
axes that you can friction-tune separately.

### 3.2 Friction adjustment (no spring return)

Each axis has its own friction system:

- An M4 thumbscrew threads through the housing wall (or ring wall for
  the inner axis)
- The thumbscrew presses a Delrin or printed friction pad against a flat
  notch ground into the axle
- Tighten = more hold force; loosen = freer movement
- The user tunes until the stick stays where left under its own weight
  but still moves smoothly under hand pressure

### 3.3 Plunger arms (the four arrow keys)

Four plunger arms project downward from the underside of the **inner
ring** — one each for Up, Down, Left, Right. Because the inner ring
tilts on both axes, all four plunger arms move together.

Per-plunger geometry (see `scad/plunger.scad`):
- **Arm length**: 35mm (gimbal pivot to tip at neutral)
- **Tip diameter**: 6mm hemispherical (self-centers in MX keycap dish)
- **Tip material**: TPU 95A glued or screwed onto a PLA arm shaft
- **Adjustability**: each plunger threads into the ring via an M3 grub
  screw clamp through a 6mm slot, so depth at neutral is adjustable
  (this is the gimbal's "dead zone" trim)
- **Neutral standoff**: tip sits 4mm above keycap top
- **At ±25° tilt**: tip descends ~12mm — well past the 3.8mm max
  actuation depth, so the press is guaranteed even with assembly
  variance

The four plungers sit directly above Up / Down / Left / Right on the
Aula Hero 68 HE arrow cluster. The gimbal housing centerline must be
positioned to put the gimbal pivot directly above the center of the
arrow cluster (see `scad/keymap.md` for the exact key coordinates).

### 3.4 F-16/F-18 grip

- **Total grip height from gimbal pivot**: 180mm (180–210mm with
  telescope adjustment)
- **Telescope**: outer shaft Ø22mm, inner shaft Ø18mm, locked at any of
  5 positions by an M4 thumbscrew through a slotted hole
- **Shape**: contoured pistol grip, finger grooves on front face, palm
  swell on the right side, thumb rest on the top-left
- **Stick is passive**: no buttons or triggers in the grip. All
  auxiliary controls live in the lid (see Section 5).

### 3.5 Stick throw envelope

- Pitch: ±25° fore-aft (Up / Down)
- Roll: ±25° left-right (Left / Right)
- Diagonals: any combination simultaneously (gimbal allows it
  geometrically and both inner-ring plungers fire independently)

## 4. Throttle assembly (left base section)

### 4.1 Linear slide

- **Rails**: two parallel Ø8mm steel rods, 220mm long, hardware-store
  sourced. Press-fit into end caps printed into the throttle base.
- **Carriage**: PLA block sliding on the rails. Uses either printed
  bushings (Ø8.3mm hole through PLA) or actual LM8UU linear bearings if
  the user wants a premium feel. See `scad/throttle-carriage.scad`.
- **Total throw**: 200mm (100mm forward + 100mm back from center)

### 4.2 Friction "suspension"

The user's "suspension" requirement (resistance to rapid pushes) is
delivered via tunable friction, not springs:

- Two M4 thumbscrews on the side of the carriage press 10×10×3mm
  felt or TPU pads against the rails
- Tighter = heavy military-stick feel; looser = light airliner feel
- Friction × travel = energy you must put in to move the throttle,
  which functionally damps rapid motion the same way real
  hydraulic-damped controls do
- **No springs anywhere on the throttle.** The user explicitly does
  not want spring return — the throttle must stay where placed.

### 4.3 Center detent (recommended)

A small printed leaf-spring flexure built into the throttle base
clicks into a notch on the carriage at neutral position. You feel
a tactile click when crossing the dead zone center — critical for
finding "off" without looking down. Adds no separate part, just a
feature of the base.

### 4.4 W / S plungers with adjustable dead zone

Under the carriage, an L-shaped plunger arm reaches forward and back
along the throttle's length. Two plunger sliders hang off the arm:

- **Forward plunger** (W): activates when throttle pushed away from
  user. Threaded into a sliding bracket along a 60mm slot.
- **Back plunger** (S): activates when throttle pulled toward user.
  Same sliding-bracket scheme on the opposite side.

The sliding brackets clamp via M3 thumbscrews. Slide inward → larger
dead zone (longer push before W triggers). Slide outward → smaller
dead zone (W triggers sooner). Adjustable range: 20–90mm of dead
zone per side. Default: 50mm (50% dead zone, matching the user's
"large lever" preference).

Plunger tips are the same TPU hemispheres used on the stick (see
`scad/plunger.scad`), sized to land on the centers of the W and S
keycaps.

### 4.5 F-16/F-18 throttle handle

- **Length**: 140mm angled 20° back from vertical
- **Shape**: contoured grip with finger grooves on front, thumb
  rest on top
- **Passive**: no buttons or switches in the handle. Gear and
  flap controls live in the lid (see Section 5).

## 5. Lid-mounted auxiliary buttons ("wireless physical")

Per the revised design, the trigger, view hat, gear, and flap controls
are NOT mounted on the grip or throttle handle. Each is a self-contained
**vertical plunger module** that drops into a circular hole in the rig's
top lid. The button cap projects above the lid surface for finger
access; the plunger shaft passes through the lid and rests on the
target keycap below. Press the cap → plunger drives the key. A small
compression spring from the user's hardware kit returns the cap when
released.

See `scad/lid-button.scad` for the parametric module.

### 5.1 Per-module geometry

- **Cap**: Ø14mm, height 6mm above lid
- **Cap travel**: 5mm before the plunger contacts the keycap, then
  another 4mm to actuate (with HE software actuation at 0.5mm,
  the press is reliable)
- **Shaft**: Ø6mm, slides in a 6.2mm hole through the lid
- **Return spring**: compression spring (~Ø5mm OD, ~12mm free length)
  in a sealed well between the cap and a flange on the lid underside
- **Plunger tip**: TPU 95A hemisphere, Ø6mm, glued onto the shaft

### 5.2 Module positions on the lid

The lid has 8 round holes pre-modeled into the surface at these
locations (each above the named key on the Aula Hero 68 HE — verify
with calipers before printing):

| Button | Position on lid | Target key | Function |
|---|---|---|---|
| Trigger | Right-front, near stick base | Space | Guns / weapons release |
| Hat Up | Mid-front cluster | Home | View pan up |
| Hat Down | Mid-front cluster | End | View pan down |
| Hat Left | Mid-front cluster | PgUp | View pan left |
| Hat Right | Mid-front cluster | PgDn | View pan right |
| Gear | Left-front, near throttle | G | Landing gear toggle |
| Flap up | Left-front, near throttle | F7 | Flaps retract |
| Flap down | Left-front, near throttle | F5 | Flaps extend |

The view hat cluster is arranged in a "+" pattern with 25mm spacing,
mimicking the look of a hat switch even though it's actually four
independent buttons.

### 5.3 Why this approach

- **No cables, no tubes, no electronics** — purely vertical mechanical
  transmission, the simplest possible design
- **Each button is independently printable, replaceable, and tunable**
  (cap diameter, plunger length per target key)
- **Trade-off**: the stick grip and throttle handle have no buttons on
  them. You must release the grip momentarily or use a free finger to
  hit the lid buttons. This matches "wireless, physical" — buttons
  are connected to the keyboard by gravity and direct mechanical
  contact alone.

## 6. Plunger tip geometry (critical detail, applies to all plungers)

The Aula Hero 68 HE uses MX-stem OEM-profile keycaps with concave dished
tops, ~14×14mm with a ~10mm flat center. All plunger tips (stick × 4,
throttle × 2, lid buttons × 8) must:

- **Tip diameter ≤ 10mm** so they don't push two adjacent keys at once
- **6mm hemispherical end** to self-center in the keycap dish
- **Overshoot allowance of 5mm past max actuation** to guarantee
  reliable press
- **TPU 95A material** to absorb impact (hard PLA tips hammer the
  switches and wear keycaps over thousands of presses)

For all SCAD modules, set `tip_material = "TPU"` to render the tip as a
separate object for printing in TPU and gluing onto the PLA shaft.

## 7. Software setup (the other half of "long lever" feel)

In the Aula Hero 68 HE's configurator software:

1. **Set actuation point to 0.5mm** on every key the rig touches:
   - W, S (throttle)
   - Up, Down, Left, Right (stick)
   - Space (trigger)
   - Home, End, PgUp, PgDn (hat)
   - G (gear)
   - F5, F7 (flaps)

The 0.5mm setting means the plunger barely needs to depress the cap
to register, making the rig feel light and responsive even with a
heavy throttle friction setting.

Per-sim bindings:

- **MSFS 2020/2024**: Controls → Keyboard → search "throttle" → bind
  Increase Throttle to W, Decrease Throttle to S. Defaults remap rudder
  to other keys (the user is not using rudder pedals).
- **DCS World**: per aircraft, Options → Controls → Pitch/Roll axis
  to arrows, Throttle Increase/Decrease to W/S. Save profile per
  aircraft.
- **War Thunder (air)**: defaults already match (W/S throttle, arrows
  pitch/roll). No rebind needed.
- **X-Plane 12**: Settings → Keyboard → assign Pitch up/down axis to
  Up/Down arrows, Roll axis to Left/Right, Throttle to W/S.

Full per-sim cheat-sheet lives in `scad/keymap.md`.

## 8. Print part list

| Part | Qty | Size (approx) | Filament | Notes |
|---|---|---|---|---|
| Base left (throttle housing) | 1 | 250×260×80 | PETG black | gyroid 25%, splits flange to center |
| Base center (keyboard tray) | 1 | 250×260×50 | PETG black | open-bottom, sand-fill pocket |
| Base right (gimbal housing) | 1 | 160×260×80 | PETG black | sand-fill pocket |
| Lid left | 1 | 250×260×8 | PETG black satin | houses gear + flap buttons |
| Lid center | 1 | 250×260×8 | PETG black satin | houses hat cluster |
| Lid right | 1 | 250×260×8 | PETG black satin | houses trigger button |
| Gimbal outer ring | 1 | 90×90×20 | PLA+ | on-edge for layer strength |
| Gimbal inner ring | 1 | 70×70×20 | PLA+ | on-edge |
| Stick shaft outer | 1 | Ø22×120 | PLA+ | vertical with brim |
| Stick shaft inner | 1 | Ø18×140 | PLA+ | vertical |
| Stick grip L half | 1 | 60×100×35 | PLA+ matte | flat on grip side |
| Stick grip R half | 1 | 60×100×35 | PLA+ matte | flat on grip side |
| Throttle carriage | 1 | 80×60×40 | PLA+ | |
| Throttle handle L half | 1 | 60×140×30 | PLA+ matte | |
| Throttle handle R half | 1 | 60×140×30 | PLA+ matte | |
| Throttle plunger arm | 1 | 100×30×8 | PLA+ | |
| W/S plunger sliders | 2 | 30×20×12 | PLA+ | |
| Arrow plunger arms | 4 | 35×8×8 | PLA+ | |
| Lid button caps | 8 | Ø14×6 | PLA+ matte | |
| Lid button shafts | 8 | Ø6×30 | PLA+ | length varies per target key |
| Plunger tips (all) | 14 | Ø6 hemisphere | TPU 95A | glued onto shafts |
| Friction pads | 8 | 10×10×3 | TPU 95A | |
| Center detent leaf | 1 | 30×8×1.5 | PLA+ | |
| Cam latches (front lid) | 2 | 40×15×10 | PLA+ | |
| Barrel hinge halves | 4 | 30×15×15 | PLA+ | rear lid |

## 9. Hardware shopping list

- M3×12 screws ×20, M3 nuts ×20
- M4×20 screws ×12, M4 nuts ×12
- M4 thumbscrews ×6 (friction adjusters + stick telescope)
- M4 rod ×2 (hinge pins, ~80mm each)
- Ø8mm steel rod ×2 (throttle rails, 240mm each)
- Compression springs ×8 (~Ø5mm OD, ~12mm free, for lid buttons)
- Optional: M4 flanged bearings ×4 (gimbal axles, premium feel)
- Optional: LM8UU linear bearings ×2 (throttle carriage, premium feel)
- ~2kg playground sand or steel shot (mass ballast)

## 10. Recommended modeling and print workflow

The SCAD files in `scad/` are parametric — they generate STLs for the
trickiest mechanical parts. The bulk of the body (base sections, lid
panels, grip halves) should be modeled in **Fusion 360** or **Onshape**
using the dimensions in Section 8. Onshape is free in-browser and good
for parametric work; Fusion 360 has a more polished UI.

Suggested order:

1. **Calipers pass**: measure the actual Aula Hero 68 HE. Verify case
   length, width, height, key pitch, and arrow-cluster offset.
   Manufacturer specs are typically off by 1–2mm.
2. **Model the keyboard tray** in CAD using your measured dimensions.
   This is the dimensional anchor for everything else.
3. **Print a single plunger** from `scad/plunger.scad` first. Test
   alignment against an arrow keycap before committing to anything else.
4. **Print one lid-button module** from `scad/lid-button.scad`. Test
   actuation in a dummy lid plate.
5. **Print the gimbal rings** from `scad/gimbal.scad`. Test assembly
   and ±25° travel.
6. **Print a 100mm throttle rail segment + carriage** from
   `scad/throttle-carriage.scad`. Test slide and friction.
7. **Then model the body** in Fusion/Onshape using the dimensions in
   Section 8, splitting into the three base sections and three lid
   panels.
8. **Final print + assembly**: base sections first, hardware
   assembly, then mount the gimbal/throttle subassemblies, then
   install lid panels with button modules.

## 11. Known compromises (be honest)

- **Keys are binary**. The "long lever feel" is purely tactile/cinematic.
  Once W is pressed, it's pressed — the sim has no idea how far the
  lever is pushed. This is acceptable for the user's stated goal (a
  cinematic flying experience) but is not analog input.
- **Throttle drift under heavy vibration**: friction-held controls
  will slowly creep under high-G simulated dogfighting. The center
  detent gives you a way to find neutral again without looking.
- **Lid button reach**: with both hands on the controls, hitting a
  lid button means releasing one grip briefly. This is true of all
  passive non-electronic designs. Trade-off accepted.
- **No rudder**: out of scope. Add a pair of foot levers later if
  desired — they'd press separate keys you bind to rudder.
- **Sand mass requires user sourcing**: ~2kg of playground sand
  or steel shot is not 3D-printable. The base cavities are sized
  to accept it.
