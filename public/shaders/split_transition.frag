precision mediump float;

uniform float u_progress; // 0.0 = normal, 1.0 = fully split
uniform int u_direction; // 0 = vertical, 1 = horizontal

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    // Split point at middle of screen
    float mid = 0.5;
    vec2 displacedUV = uv;

    if(u_direction < 1){
        if (uv.y < mid) {
            // Top half moves upward
            displacedUV.y -= u_progress * 0.5;
        } else {
            // Bottom half moves downward
            displacedUV.y += u_progress * 0.5;
        } 

        // If displaced UVs go out of bounds, fill with black
        if (displacedUV.y < 0.0 || displacedUV.y > 1.0) {
            return vec4(0.0, 0.0, 0.0, 1.0);
        }         
    }

    if(u_direction > 0){
        if (uv.x < mid) {
            // Left half moves backward
            displacedUV.x -= u_progress * 0.5;
        } else {
            // Right half moves backward
            displacedUV.x += u_progress * 0.5;
        } 

        // If displaced UVs go out of bounds, fill with black
        if (displacedUV.x < 0.0 || displacedUV.x > 1.0) {
            return vec4(0.0, 0.0, 0.0, 1.0);
        }   
    }

    if(u_progress == 1.0){
        return vec4(0.0, 0.0, 0.0, 1.0);
    }else{
        return texture2D(tex, displacedUV);   
    } 
}
