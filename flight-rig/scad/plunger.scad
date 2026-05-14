// Plunger module used everywhere a printed part needs to press an MX-stem
// keycap (Aula Hero 68 HE arrow keys, W/S, and the auxiliary lid buttons).
//
// Renders a PLA arm + shaft in one piece, with a separately printable TPU
// hemispherical tip that glues to the shaft end. The shaft has an M3 grub-
// screw flat for the clamping point in either the gimbal inner ring or the
// throttle plunger slider.
//
// Render with RENDER = "shaft" for the PLA part, "tip" for the TPU tip,
// or "preview" for both stacked.

// ---------- PARAMETERS ----------

RENDER = "preview";     // "shaft", "tip", "preview"

// Shaft (PLA)
shaft_length      = 35;   // length from mount end to tip seat
shaft_d           = 6;    // diameter of the main shaft
mount_d           = 8;    // diameter at the clamped end (larger for grip in the bore)
mount_length      = 10;   // length of the larger-diameter clamp section
grub_flat_depth   = 0.6;  // flat cut on the shaft for M3 grub set-screw bite
grub_flat_length  = 6;
grub_flat_z       = 4;    // distance from mount end where the flat starts

// Tip (TPU 95A)
tip_d             = 6;    // hemisphere diameter — must be ≤ 10mm to avoid
                          // touching adjacent keys (Aula has 19.05mm pitch
                          // with 14mm keycap tops; 6mm is safely centered)
tip_extra         = 0;    // optional extension; keep 0 for stick/throttle,
                          // use a longer tip on lid buttons via lid_button.scad
tip_seat_depth    = 3;    // depth of the bore in the shaft end that the TPU
                          // tip plugs into for glue area
tip_post_d        = 3.8;  // diameter of the small post on the tip that plugs
                          // into the shaft

// Print tuning
clearance         = 0.2;
$fn               = 64;

// ---------- MODULES ----------

module shaft() {
    union() {
        // larger mount end (the part that clamps in the gimbal ring or slider)
        cylinder(d=mount_d, h=mount_length, center=false);
        // main shaft from mount-end to tip-seat
        translate([0, 0, mount_length])
            cylinder(d=shaft_d, h=shaft_length - mount_length, center=false);
    }
}

module shaft_with_features() {
    difference() {
        shaft();
        // grub-screw flat (cut a chord off the mount-end cylinder)
        translate([mount_d/2 - grub_flat_depth, -grub_flat_length/2, grub_flat_z])
            cube([grub_flat_depth + 0.5, grub_flat_length, mount_length]);
        // tip seat bore at the far end
        translate([0, 0, shaft_length - tip_seat_depth + 0.01])
            cylinder(d=tip_post_d + clearance, h=tip_seat_depth);
    }
}

module tip() {
    union() {
        // hemisphere
        difference() {
            sphere(d=tip_d);
            translate([0, 0, -tip_d])
                cube([tip_d*2, tip_d*2, tip_d*2], center=true);
        }
        // optional cylindrical extension below the hemisphere
        if (tip_extra > 0)
            translate([0, 0, -tip_extra])
                cylinder(d=tip_d, h=tip_extra);
        // post that plugs into the shaft for gluing
        translate([0, 0, -tip_extra - tip_seat_depth + 0.01])
            cylinder(d=tip_post_d, h=tip_seat_depth);
    }
}

module preview() {
    color("DimGray") shaft_with_features();
    color("Crimson")
        translate([0, 0, shaft_length + tip_extra])
            rotate([0, 0, 0])
                tip();
}

// ---------- RENDER SELECTOR ----------

if (RENDER == "shaft")        shaft_with_features();
else if (RENDER == "tip")     tip();
else                          preview();
