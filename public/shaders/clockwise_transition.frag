precision mediump float;

uniform float u_progress;   // 0.0 → start, 1.0 → finish
uniform int u_direction;    // 0 = blackout, 1 = reveal

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 scene = texture2D(tex, uv);

    // Center UVs at (0,0), range [-1..1]
    vec2 centered = (uv - 0.5) * 2.0;

    // Angle in radians [0..2π)
    float angle = atan(centered.y, centered.x);
    if (angle < 0.0) {
        angle += 6.28318530718; // wrap negatives
    }

    // Convert progress (0..1) → cutoff angle
    float cutoff = u_progress * 6.28318530718;

    // Two modes: blackout or reveal
    if (u_direction == 0) {
        // Blackout clockwise
        if (angle < cutoff) {
            return vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            return scene;
        }
    } else {
        // Reveal clockwise
        if (angle < cutoff) {
            return scene;
        } else {
            return vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
}
