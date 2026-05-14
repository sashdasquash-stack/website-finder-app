# Keymap & Sim Binding Reference

Quick reference for the cinematic flight rig: which physical plunger
presses which keyboard key, and which sim controls that key needs to be
bound to in each title.

## Physical plunger → keyboard key

| Plunger location | Target key on Aula Hero 68 HE |
|---|---|
| Stick — forward (push away) | ↑ (Up arrow) |
| Stick — back (pull toward) | ↓ (Down arrow) |
| Stick — left | ← (Left arrow) |
| Stick — right | → (Right arrow) |
| Throttle — forward (push away) | W |
| Throttle — back (pull toward) | S |
| Lid button — trigger | Space |
| Lid button — hat up | Home |
| Lid button — hat down | End |
| Lid button — hat left | PgUp |
| Lid button — hat right | PgDn |
| Lid button — gear | G |
| Lid button — flap up | F7 |
| Lid button — flap down | F5 |

## Aula Hero 68 HE software setup (do this first)

1. Open the Aula configurator / driver software for the keyboard.
2. Set actuation point to **0.5mm** on every key in the table above.
   Leave all other keys at default (≥1.5mm) so accidental brushes don't
   register elsewhere.
3. (Optional) Save the rig profile as "FlightRig" so you can switch
   between rig and normal typing modes.

## Per-sim bindings

### Microsoft Flight Simulator 2020 / 2024

Defaults are wrong — W/S is rudder, not throttle. Fix:

| MSFS action | Bind to |
|---|---|
| Throttle (Increase) | W |
| Throttle (Decrease) | S |
| Pitch axis (or Elevator Up / Down) | ↑ / ↓ |
| Roll axis (or Aileron Left / Right) | ← / → |
| Cockpit View pan up / down / left / right | Home / End / PgUp / PgDn |
| Toggle landing gear | G (already default) |
| Flaps extend | F7 (already default — note MSFS uses F7 to extend) |
| Flaps retract | F5 (already default) |
| Rudder — leave unbound (out of scope) | — |

Path: Options → Controls Options → Keyboard. Search by action name.

### DCS World

Per aircraft. For each module (F-16C, F-18C, A-10C, etc.):

1. Options → Controls
2. Filter to the aircraft you fly
3. Set:
   - Pitch — Nose Up / Nose Down → ↑ / ↓
   - Roll — Bank Left / Bank Right → ← / →
   - Throttle — Increase / Decrease → W / S
   - View Cockpit Pan → Home / End / PgUp / PgDn
   - Trigger / Master Arm fire → Space
   - Landing Gear → G
   - Flaps → F5 / F7
4. Save profile per aircraft (DCS does not share keybinds across modules).

### War Thunder (air realistic / sim battles)

Defaults already match the rig:

| Action | Key | Default? |
|---|---|---|
| Throttle up | W | yes |
| Throttle down | S | yes |
| Pitch up / down | ↑ / ↓ | yes |
| Roll left / right | ← / → | yes |
| Fire guns | Space (or LMB) | bind Space to "fire all weapons" |
| Gear toggle | G | yes |
| Flaps next | F | rebind to F5 if you want match |
| View pan | Numpad by default | rebind to Home/End/PgUp/PgDn |

Path: Options → Controls → Air vehicles.

### X-Plane 12

| X-Plane command | Bind to |
|---|---|
| flightmodel/throttle_up | W |
| flightmodel/throttle_down | S |
| flightmodel/pitch_up | ↓ (yes, X-Plane is inverted — pulling back = pitch up means assigning to Down-arrow if you want pull-to-climb feel; OR keep ↑ = pitch up and accept push-to-climb) |
| flightmodel/pitch_down | ↑ |
| flightmodel/roll_left | ← |
| flightmodel/roll_right | → |
| view/glance_left | PgUp |
| view/glance_right | PgDn |
| view/glance_up | Home |
| view/glance_down | End |
| flightcontrols/landing_gear_toggle | G |
| flightcontrols/flaps_up | F7 |
| flightcontrols/flaps_down | F5 |
| Fire weapons | Space |

Path: Settings → Keyboard → search by command name.

**Note on X-Plane pitch direction**: real aircraft pitch up when you
PULL the stick back. With the rig holding "stays in position" instead
of spring-centered, you have to push forward to pitch down and back to
pitch up. If you want this realistic feel, bind ↓ to pitch_up and ↑ to
pitch_down. If you find it confusing, swap.

## Aula Hero 68 HE key cluster positions

These are approximate (verify with calipers before final printing — the
manufacturer specs can be off by 1–2mm).

```
65% layout (right side, where the rig plungers land):

+---+---+---+---+---+---+---+---+   +---+
| 7 | 8 | 9 | 0 | - | = |Bsp|Bsp|   |Del|
+---+---+---+---+---+---+---+---+   +---+
| U | I | O | P | [ | ] | \ |   |   |PgU|
+---+---+---+---+---+---+---+   +   +---+
| J | K | L | ; | ' |Ent|Ent|   |   |PgD|
+---+---+---+---+---+---+---+   +---+---+
| M | , | . | / |RSh|RSh|RSh|   | ↑ |End|
+---+---+---+---+---+---+---+---+---+---+
| Fn|Win|Alt|Spc|Spc|Spc|Alt| ← | ↓ | → |
+---+---+---+---+---+---+---+---+---+---+
```

The arrow cluster is in the bottom-right corner. The plunger arms on the
gimbal inner ring must land on:

- **↑**: ~13mm right of bottom-right corner of typing area
- **↓**: directly below ↑
- **←**: ~19mm left of ↓
- **→**: ~19mm right of ↓

For the lid buttons, the right-side function cluster (Del / PgUp / PgDn /
End) sits to the right of the main typing area. Hat buttons drop into
the lid above these keys with a 19.05mm pitch matching the keyboard.

Trigger (Space) is dead-center under the lid. Gear (G) and Flap rocker
(F5 / F7) live on the left side of the lid above the function row and
the G key respectively.

## Verifying alignment before final assembly

1. Place the keyboard in the frame cavity (lid open).
2. Lower a single plunger module by hand to where it should land on its
   target key.
3. Verify the TPU tip hits the keycap centerline within ±1mm.
4. Press by hand. If the key registers (with 0.5mm actuation set), the
   alignment is correct. If it misses or hits two keys, recompute the
   X/Y position and reprint that arm/module.
5. Repeat for all 14 plungers (4 stick + 2 throttle + 8 lid buttons).
