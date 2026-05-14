// Two-axis nested gimbal for the cinematic flight rig joystick.
//
// Renders the outer ring, inner ring, two pairs of axles, and the friction
// adjuster blocks as separate objects. Set RENDER to the part you want, then
// File > Export as STL.
//
// Geometry: outer ring pivots on X (pitch), inner ring nests inside and
// pivots on Y (roll). Stick shaft fixes to the inner ring. Four downward
// plunger arms hang from the inner ring's bottom face for the arrow keys.

// ---------- PARAMETERS ----------

// Which part to render: "outer", "inner", "axle", "friction_block", "all"
RENDER = "all";

// Outer ring
outer_od            = 90;   // outer diameter, mm
outer_id            = 76;   // inner diameter (cavity for inner ring), mm
ring_height         = 20;   // axial height of both rings, mm

// Inner ring
inner_od            = 74;   // 2mm clearance to outer ring ID for free rotation
inner_id            = 26;   // hole through center for stick shaft

// Axles
axle_d              = 4;    // M4
axle_seat_depth     = 6;    // how deep the axle penetrates each ring wall
axle_extra_length   = 14;   // axle length beyond ring face (into housing)

// Friction notch (flat on axle for thumbscrew-pressed pad)
notch_width         = 3;
notch_depth         = 0.8;
notch_length        = 8;

// Stick shaft mounting
shaft_od            = 22;   // outer shaft of telescoping stick
shaft_press_fit     = 21.7; // bore for press-fit (PLA shrink-allowance)

// Plunger arm pockets on inner-ring underside (four arms, 90° apart)
arm_pocket_d        = 8.4;  // bore for Ø8 plunger arm
arm_pocket_depth    = 10;
arm_mount_radius    = 24;   // distance from inner-ring center to plunger arm axis
arm_grub_d          = 3.2;  // M3 grub-screw clearance for plunger depth adjust

// Friction adjuster block (mounts to gimbal housing wall, holds thumbscrew)
fb_size             = [18, 18, 14];
fb_thumb_d          = 4.4;  // M4 clearance through block
fb_pad_pocket       = [10, 10, 3]; // friction pad seat

// Print tuning
clearance           = 0.2;
$fn                 = 96;

// ---------- MODULES ----------

module outer_ring() {
    difference() {
        // ring body
        cylinder(d=outer_od, h=ring_height, center=false);
        // inner cavity
        translate([0, 0, -0.01])
            cylinder(d=outer_id, h=ring_height + 0.02);
        // X-axis bores for outer-ring axles (pitch axis)
        for (s = [-1, 1])
            translate([s * outer_od/2, 0, ring_height/2])
                rotate([0, 90, 0])
                    cylinder(d=axle_d + clearance, h=axle_seat_depth + 1, center=true);
        // Y-axis bores for INNER-ring axles (these pass THROUGH the outer
        // ring wall so the inner-ring axles seat in the outer ring's inner
        // surface). This is the nested geometry.
        for (s = [-1, 1])
            translate([0, s * outer_od/2, ring_height/2])
                rotate([90, 0, 0])
                    cylinder(d=axle_d + clearance, h=axle_seat_depth + 2, center=true);
    }
}

module inner_ring() {
    difference() {
        cylinder(d=inner_od, h=ring_height, center=false);
        // bore for stick shaft
        translate([0, 0, -0.01])
            cylinder(d=shaft_press_fit, h=ring_height + 0.02);
        // Y-axis bores for inner-ring axles (roll axis)
        for (s = [-1, 1])
            translate([0, s * inner_od/2, ring_height/2])
                rotate([90, 0, 0])
                    cylinder(d=axle_d + clearance, h=axle_seat_depth + 1, center=true);
        // four plunger-arm pockets on the underside, at 0°/90°/180°/270°
        for (a = [0, 90, 180, 270])
            rotate([0, 0, a])
                translate([arm_mount_radius, 0, -0.01])
                    cylinder(d=arm_pocket_d, h=arm_pocket_depth);
        // grub-screw access holes (radial) for clamping plunger arms
        for (a = [0, 90, 180, 270])
            rotate([0, 0, a])
                translate([inner_od/2 + 1, 0, arm_pocket_depth/2])
                    rotate([0, -90, 0])
                        cylinder(d=arm_grub_d, h=inner_od/2 - arm_mount_radius + 3);
    }
}

module axle() {
    // total length = 2 × seat_depth + ring_height (for the through axle),
    // but we model the axle as it ships: just the rod. User cuts to length.
    // Default length is the full through-axle for the inner-ring (roll) axis,
    // which traverses both inner-ring walls plus a small projection.
    total_len = ring_height + 2 * (axle_seat_depth + axle_extra_length);
    difference() {
        cylinder(d=axle_d, h=total_len, center=true);
        // friction flats at both ends (where the thumbscrew pad bites)
        for (s = [-1, 1])
            translate([0, -axle_d/2 + (axle_d - notch_depth)/2,
                       s * (total_len/2 - notch_length/2 - 2)])
                cube([notch_width, axle_d, notch_length], center=true);
    }
}

module friction_block() {
    difference() {
        cube(fb_size, center=false);
        // thumbscrew through-hole (axial)
        translate([fb_size.x/2, fb_size.y/2, -0.01])
            cylinder(d=fb_thumb_d, h=fb_size.z + 0.02);
        // pad seat on the bottom face
        translate([(fb_size.x - fb_pad_pocket.x)/2,
                   (fb_size.y - fb_pad_pocket.y)/2,
                   fb_size.z - fb_pad_pocket.z])
            cube(fb_pad_pocket);
    }
}

module render_all_for_preview() {
    color("DimGray") outer_ring();
    color("Gainsboro") translate([0, 0, 0]) inner_ring();
    // axles preview
    color("Silver") {
        translate([0, 0, ring_height/2])
            rotate([0, 90, 0])
                cylinder(d=axle_d, h=outer_od + 20, center=true);
        translate([0, 0, ring_height/2])
            rotate([90, 0, 0])
                cylinder(d=axle_d, h=outer_od + 20, center=true);
    }
}

// ---------- RENDER SELECTOR ----------

if (RENDER == "outer")           outer_ring();
else if (RENDER == "inner")      inner_ring();
else if (RENDER == "axle")       axle();
else if (RENDER == "friction_block") friction_block();
else                              render_all_for_preview();
