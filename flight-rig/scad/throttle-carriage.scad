// Throttle slide carriage + W/S plunger arm + adjustable dead-zone sliders.
//
// Renders: carriage block (with rail bushings, friction thumbscrew bosses,
// plunger-arm mount), the plunger arm itself, two plunger sliders, and a
// rail end-cap for the throttle base. Set RENDER to pick a part.
//
// The "long lever" feel comes from: (1) long 200mm throw, (2) adjustable
// friction pads pressing on the rails, (3) plunger sliders that can be
// moved along the arm so the dead zone can be tuned 20–90mm per side.

// ---------- PARAMETERS ----------

RENDER = "preview";   // "carriage", "arm", "slider", "endcap", "preview"

// Rails
rail_d            = 8;     // Ø8mm steel rod from hardware store
rail_spacing      = 40;    // center-to-center between the two parallel rails
rail_length       = 240;   // total rail length; carriage throws 200mm in this
bushing_clearance = 0.3;   // bore = rail_d + this, for sliding fit

// Carriage block
car_size          = [80, 60, 40];
car_handle_post_d = 16;    // post on top of carriage that the throttle handle
                           // bolts onto
car_handle_post_h = 18;
car_arm_post_d    = 12;    // post on bottom of carriage that the plunger arm
                           // bolts onto
car_arm_post_h    = 14;

// Friction thumbscrews (one per rail)
fric_thumb_d      = 4.4;   // M4 clearance
fric_pad_pocket   = [10, 10, 3]; // pad seats inside the bores

// Plunger arm (the long horizontal bar slung under the carriage)
arm_length        = 200;   // total length, oriented along throttle axis
arm_width         = 30;
arm_thickness     = 8;
arm_slot_length   = 60;    // length of the slider-clamp slot, each side
arm_slot_width    = 3.4;   // M3 clearance for slider thumbscrew

// Plunger slider (clamps onto the arm via M3 thumbscrew, holds a plunger)
sl_size           = [30, 20, 12];
sl_plunger_bore   = 8.2;   // bore for a Ø8 mount end of plunger.scad

// End cap (closes the throttle base around the rails)
ec_size           = [60, 20, 30];
ec_rail_clearance = 0.1;   // tight press-fit for rails

// Print tuning
clearance         = 0.2;
$fn               = 64;

// ---------- MODULES ----------

module carriage() {
    difference() {
        cube(car_size, center=false);
        // two rail bores running the long axis of the carriage
        for (y = [car_size.y/2 - rail_spacing/2, car_size.y/2 + rail_spacing/2])
            translate([-0.5, y, car_size.z/2])
                rotate([0, 90, 0])
                    cylinder(d=rail_d + bushing_clearance, h=car_size.x + 1);
        // two friction thumbscrew bores, one per rail, drilled top-down to
        // intersect each rail bore so the pad inside pushes against the rail
        for (y = [car_size.y/2 - rail_spacing/2, car_size.y/2 + rail_spacing/2])
            translate([car_size.x/2, y, -0.01])
                cylinder(d=fric_thumb_d, h=car_size.z + 0.02);
        // pad pockets at the rail-side of each thumbscrew bore
        for (y = [car_size.y/2 - rail_spacing/2, car_size.y/2 + rail_spacing/2])
            translate([car_size.x/2 - fric_pad_pocket.x/2,
                       y - fric_pad_pocket.y/2,
                       car_size.z/2 - rail_d/2 - fric_pad_pocket.z])
                cube(fric_pad_pocket);
    }
    // handle post on top
    translate([car_size.x/2, car_size.y/2, car_size.z])
        cylinder(d=car_handle_post_d, h=car_handle_post_h);
    // plunger arm post on bottom
    translate([car_size.x/2, car_size.y/2, -car_arm_post_h])
        cylinder(d=car_arm_post_d, h=car_arm_post_h);
}

module arm() {
    difference() {
        cube([arm_length, arm_width, arm_thickness], center=false);
        // center mounting bore for the carriage post
        translate([arm_length/2, arm_width/2, -0.01])
            cylinder(d=car_arm_post_d + clearance, h=arm_thickness + 0.02);
        // two slots, one on each side of center, for slider thumbscrews
        for (side = [-1, 1]) {
            slot_center_x = arm_length/2 + side * (arm_slot_length/2 + 15);
            hull() {
                translate([slot_center_x - arm_slot_length/2 + arm_slot_width/2,
                           arm_width/2, -0.01])
                    cylinder(d=arm_slot_width, h=arm_thickness + 0.02);
                translate([slot_center_x + arm_slot_length/2 - arm_slot_width/2,
                           arm_width/2, -0.01])
                    cylinder(d=arm_slot_width, h=arm_thickness + 0.02);
            }
        }
    }
}

module slider() {
    difference() {
        cube(sl_size, center=false);
        // plunger bore (top-down through the slider)
        translate([sl_size.x/2, sl_size.y/2, -0.01])
            cylinder(d=sl_plunger_bore, h=sl_size.z + 0.02);
        // M3 thumbscrew clamping bore (through the long axis, into the arm slot)
        translate([-0.01, sl_size.y/2, sl_size.z/2])
            rotate([0, 90, 0])
                cylinder(d=3.2, h=sl_size.x + 0.02);
        // M3 grub flat on the plunger bore for plunger-depth lock
        translate([sl_size.x/2 + sl_plunger_bore/2 - 0.6,
                   sl_size.y/2 - 3, sl_size.z/2])
            cube([1.5, 6, sl_size.z]);
    }
}

module endcap() {
    difference() {
        cube(ec_size, center=false);
        // two rail bores
        for (y = [ec_size.y/2 - rail_spacing/2, ec_size.y/2 + rail_spacing/2])
            translate([-0.01, y, ec_size.z/2])
                rotate([0, 90, 0])
                    cylinder(d=rail_d - ec_rail_clearance, h=ec_size.x + 0.02);
        // four M4 mounting bolts down through the corners
        for (x = [8, ec_size.x - 8])
            for (y = [4, ec_size.y - 4])
                translate([x, y, -0.01])
                    cylinder(d=4.4, h=ec_size.z + 0.02);
    }
}

module preview() {
    color("DimGray") translate([rail_length/2 - car_size.x/2, 0, 0])
        carriage();
    color("Gainsboro") translate([rail_length/2 - arm_length/2,
                                    car_size.y/2 - arm_width/2,
                                    -car_arm_post_h - arm_thickness])
        arm();
    color("Silver") {
        for (y = [car_size.y/2 - rail_spacing/2, car_size.y/2 + rail_spacing/2])
            translate([0, y, car_size.z/2])
                rotate([0, 90, 0])
                    cylinder(d=rail_d, h=rail_length, center=false);
    }
    color("DarkSlateGray") {
        translate([-ec_size.x, 0, car_size.z/2 - ec_size.z/2])
            endcap();
        translate([rail_length, 0, car_size.z/2 - ec_size.z/2])
            endcap();
    }
}

// ---------- RENDER SELECTOR ----------

if (RENDER == "carriage")      carriage();
else if (RENDER == "arm")      arm();
else if (RENDER == "slider")   slider();
else if (RENDER == "endcap")   endcap();
else                            preview();
