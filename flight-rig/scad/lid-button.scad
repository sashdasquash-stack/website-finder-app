// Lid-mounted auxiliary button module — the "wirelessly, physically"
// design. A self-contained vertical plunger that drops into a circular hole
// in the rig's top lid. The cap projects above the lid for finger access;
// the plunger shaft passes through the lid and a TPU tip rests on the
// target keycap below. Press the cap → plunger drives the key. A small
// compression spring (user-supplied) between the cap underside and a flange
// on the lid underside returns the cap when released.
//
// Used for trigger / view-hat (×4) / gear / flap-up / flap-down → 8 modules
// total. The only parameter that changes per module is plunger_length, which
// depends on which target key the module sits over (different keycaps have
// slightly different heights and the lid sits at a fixed Z).
//
// Renders: cap (PLA), shaft (PLA), tip (TPU), retainer flange (PLA),
// or a preview of all four stacked.

// ---------- PARAMETERS ----------

RENDER = "preview";   // "cap", "shaft", "tip", "retainer", "preview"

// Cap (the part the user presses)
cap_d            = 14;      // diameter
cap_h            = 6;       // height above lid surface
cap_dish_depth   = 1.5;     // concave dish on the cap top, for finger
                            // self-centering and to match the "tactile" feel
cap_skirt_d      = 16;      // skirt diameter on the underside of the cap
                            // (larger than the lid hole, retains the cap on
                            // top of the lid and provides spring seat)
cap_skirt_h      = 3;

// Lid (the panel this module drops into)
lid_thickness    = 8;
lid_hole_d       = 10;      // hole through the lid for the shaft

// Shaft (the plunger going down through the lid)
shaft_d          = 6;       // shaft diameter; lid_hole_d - shaft_d = sliding
                            // clearance of 4mm radial (much loose) → keep
                            // shaft centered with a small printed sleeve
                            // (see retainer module)
plunger_length   = 30;      // distance from the bottom face of the cap skirt
                            // to the bottom face of the shaft, BEFORE the
                            // TPU tip. Adjust per target key.
                            // Defaults:
                            //   trigger (Space)        : 30mm
                            //   hat × 4 (Home/End/Pg)  : 30mm (right side cluster)
                            //   gear (G)               : 30mm
                            //   flap up (F7) flap down (F5): 32mm (function row is slightly higher)

// Spring well (return spring sits between cap underside and retainer top)
spring_od        = 5.2;     // user's compression spring outer Ø, clearance
spring_free_len  = 12;      // free length of the spring
spring_compressed = 7;      // compressed length under finger pressure
                            // → travel = free - compressed = 5mm of cap dip
                            //   before the tip contacts the keycap

// Retainer (a printed flange that screws or press-fits to the lid underside,
// trapping the cap and giving the spring a seat to push against)
ret_od           = 18;      // outer diameter of retainer (larger than
                            // lid_hole_d so it sits flush under the lid)
ret_h            = 4;
ret_hole_d       = 6.4;     // sliding fit on shaft
ret_screw_circle = 14;      // pitch circle for the three M3 screws securing
                            // the retainer to the lid underside

// Tip (TPU 95A hemisphere)
tip_d            = 6;
tip_extra        = 0;
tip_seat_depth   = 3;
tip_post_d       = 3.8;

// Print tuning
clearance        = 0.2;
$fn              = 64;

// ---------- MODULES ----------

module cap() {
    difference() {
        union() {
            // visible cap above the lid
            cylinder(d=cap_d, h=cap_h);
            // skirt under the lid surface (retained on top)
            translate([0, 0, -cap_skirt_h])
                cylinder(d=cap_skirt_d, h=cap_skirt_h);
        }
        // dish on top for finger feel
        translate([0, 0, cap_h - cap_dish_depth + 0.5])
            scale([1, 1, cap_dish_depth / (cap_d/4)])
                sphere(d=cap_d * 0.8);
        // bore for the shaft post (the shaft press-fits or glues into this)
        translate([0, 0, -cap_skirt_h - 0.01])
            cylinder(d=shaft_d + clearance, h=cap_skirt_h + 2);
        // spring well in the underside of the skirt
        translate([0, 0, -cap_skirt_h - 0.01])
            cylinder(d=spring_od, h=cap_skirt_h - 1);
    }
}

module shaft() {
    // single Ø6 rod, full plunger_length
    difference() {
        cylinder(d=shaft_d, h=plunger_length);
        // tip seat bore at the bottom end
        translate([0, 0, -0.01])
            cylinder(d=tip_post_d + clearance, h=tip_seat_depth);
    }
}

module retainer() {
    difference() {
        cylinder(d=ret_od, h=ret_h);
        // through-hole for shaft
        translate([0, 0, -0.01])
            cylinder(d=ret_hole_d, h=ret_h + 0.02);
        // three M3 screw holes for securing to lid underside
        for (a = [0, 120, 240])
            rotate([0, 0, a])
                translate([ret_screw_circle/2, 0, -0.01])
                    cylinder(d=3.2, h=ret_h + 0.02);
        // counterbore for screw heads (optional, comment in if needed)
        for (a = [0, 120, 240])
            rotate([0, 0, a])
                translate([ret_screw_circle/2, 0, ret_h - 1.5])
                    cylinder(d=5.5, h=2);
    }
    // raised lip around the through-hole as the spring seat
    translate([0, 0, ret_h - 0.01])
        difference() {
            cylinder(d=ret_hole_d + 3, h=1.5);
            translate([0, 0, -0.01])
                cylinder(d=ret_hole_d, h=2);
        }
}

module tip() {
    // (same as plunger.scad tip — duplicated here so this file is self-contained)
    union() {
        difference() {
            sphere(d=tip_d);
            translate([0, 0, -tip_d])
                cube([tip_d*2, tip_d*2, tip_d*2], center=true);
        }
        if (tip_extra > 0)
            translate([0, 0, -tip_extra])
                cylinder(d=tip_d, h=tip_extra);
        translate([0, 0, -tip_extra - tip_seat_depth + 0.01])
            cylinder(d=tip_post_d, h=tip_seat_depth);
    }
}

module preview() {
    // lid (sliced for clarity, just a slab)
    %color("Black", 0.4)
        translate([-15, -15, 0])
            cube([30, 30, lid_thickness]);
    // cap on top
    color("DimGray")
        translate([0, 0, lid_thickness])
            cap();
    // shaft hanging from cap into the lid
    color("Gainsboro")
        translate([0, 0, lid_thickness - cap_skirt_h - plunger_length])
            shaft();
    // retainer under the lid
    color("DarkSlateGray")
        translate([0, 0, -ret_h])
            translate([0, 0, lid_thickness])
                rotate([180, 0, 0])
                    retainer();
    // tip
    color("Crimson")
        translate([0, 0, lid_thickness - cap_skirt_h - plunger_length])
            rotate([180, 0, 0])
                tip();
}

// ---------- RENDER SELECTOR ----------

if (RENDER == "cap")             cap();
else if (RENDER == "shaft")      shaft();
else if (RENDER == "tip")        tip();
else if (RENDER == "retainer")   retainer();
else                              preview();
