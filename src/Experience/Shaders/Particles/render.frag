uniform vec2 nearFar;
uniform vec3 small;
uniform vec3 big;
uniform vec3 uColor;
uniform int uState1;
uniform int uState2;
uniform float uTransition;

varying vec3 vTargetColor;
varying vec3 vTargetColor2;
varying vec3 vTargetColor3;
varying vec3 vTargetColor4;
varying vec3 vTargetColor5;
varying vec3 vTargetColor6;
varying float size;

vec3 getColor(int state) {
    if (state == 0) return uColor;
    if (state == 1) return vTargetColor;
    if (state == 2) return vTargetColor2;
    if (state == 3) return vTargetColor3;
    if (state == 4) return vTargetColor4;
    if (state == 5) return vTargetColor5;
    if (state == 6) return vTargetColor6;
    return uColor;
}

float getAlpha(int state) {
    if (state == 0) return 0.8;
    if (state == 1) return 0.6;
    if (state == 2) return 0.15; // Yin Yang
    if (state == 3) return 0.6;
    if (state == 4) return 0.5; // DNA
    if (state == 5) return 0.6; // Heart
    if (state == 6) return 0.1; // Wave (Lower alpha for less brightness)
    return 0.8;
}

void main()
{
    vec3 color1 = getColor(uState1);
    vec3 color2 = getColor(uState2);
    vec3 finalTargetColor = mix(color1, color2, uTransition);

    float alpha1 = getAlpha(uState1);
    float alpha2 = getAlpha(uState2);
    float alpha = mix(alpha1, alpha2, uTransition);

    gl_FragColor = vec4( finalTargetColor, alpha );
}
