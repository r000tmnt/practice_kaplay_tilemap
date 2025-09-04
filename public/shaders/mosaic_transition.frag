precision mediump float;

uniform float u_progress; // 0.0 = normal, 1.0 = max mosaic
uniform float u_block_size; // In crease or decrese block size with progress

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    // Increase block size with progress (e.g. up to 50px)
    float blockSize = mix(720.0, u_block_size, u_progress);

    // Quantize UVs into larger blocks
    vec2 mosaicUV = floor(uv * blockSize) / blockSize;

    // Sample the scene using the blocky UVs
    vec4 sceneColor = texture2D(tex, mosaicUV);

    return sceneColor;
}
