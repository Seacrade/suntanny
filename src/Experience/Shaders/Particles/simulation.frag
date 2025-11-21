
// simulation

varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uTarget;
uniform sampler2D uTarget2;
uniform sampler2D uTarget3;
uniform sampler2D uTarget4;
uniform sampler2D uTarget5;
uniform int uState1;
uniform int uState2;
uniform float uTransition;
uniform float timer;
uniform float frequency;
uniform float amplitude;
uniform float maxDistance;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float noise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

vec3 curl(float	x,	float	y,	float	z)
{

    float	eps	= 1., eps2 = 2. * eps;
    float	n1,	n2,	a,	b;

    x += timer * .05;
    y += timer * .05;
    z += timer * .05;

    vec3	curl = vec3(0.);

    n1	=	noise(vec2( x,	y	+	eps ));
    n2	=	noise(vec2( x,	y	-	eps ));
    a	=	(n1	-	n2)/eps2;

    n1	=	noise(vec2( x,	z	+	eps));
    n2	=	noise(vec2( x,	z	-	eps));
    b	=	(n1	-	n2)/eps2;

    curl.x	=	a	-	b;

    n1	=	noise(vec2( y,	z	+	eps));
    n2	=	noise(vec2( y,	z	-	eps));
    a	=	(n1	-	n2)/eps2;

    n1	=	noise(vec2( x	+	eps,	z));
    n2	=	noise(vec2( x	+	eps,	z));
    b	=	(n1	-	n2)/eps2;

    curl.y	=	a	-	b;

    n1	=	noise(vec2( x	+	eps,	y));
    n2	=	noise(vec2( x	-	eps,	y));
    a	=	(n1	-	n2)/eps2;

    n1	=	noise(vec2(  y	+	eps,	z));
    n2	=	noise(vec2(  y	-	eps,	z));
    b	=	(n1	-	n2)/eps2;

    curl.z	=	a	-	b;

    return	curl;
}

vec3 getTarget(int state) {
    if (state == 0) return texture2D(uTexture, vUv).xyz;
    if (state == 1) return texture2D(uTarget, vUv).xyz;
    if (state == 2) return texture2D(uTarget2, vUv).xyz;
    if (state == 3) return texture2D(uTarget3, vUv).xyz;
    if (state == 4) return texture2D(uTarget4, vUv).xyz;
    if (state == 5) return texture2D(uTarget5, vUv).xyz;
    return texture2D(uTexture, vUv).xyz; // State 0 or fallback
}

void main() {

    vec3 pos = texture2D( uTexture, vUv ).xyz;

    vec3 target1 = getTarget(uState1);
    vec3 target2 = getTarget(uState2);

    // If one of the states is 0 (Sphere), we want to transition chaosFactor.
    // If both are non-zero, we transition between targets with chaosFactor = 1.
    
    float chaos1 = (uState1 == 0) ? 0.0 : 1.0;
    float chaos2 = (uState2 == 0) ? 0.0 : 1.0;
    
    // Special case: If transitioning TO Sphere (0), keep the FROM target active
    if (uState2 == 0) target2 = target1;
    // Special case: If transitioning FROM Sphere (0), keep the TO target active
    if (uState1 == 0) target1 = target2;

    float currentChaos = mix(chaos1, chaos2, uTransition);
    vec3 currentTarget = mix(target1, target2, uTransition);

    // Sun/Sphere Behavior (Chaotic)
    vec3 curlTarget = pos + curl( pos.x * frequency, pos.y * frequency, pos.z * frequency ) * amplitude;
    float d = length( pos - curlTarget ) / maxDistance;
    vec3 sunPos = mix( pos, curlTarget, pow( d, 5. ) );

    // Target Behavior (Ordered)
    // Increase mix factor to make particles snap tighter to target (less fuzzy)
    vec3 targetPos = mix(pos, currentTarget, 0.2 + currentChaos * 0.75);
    
    // Mix between the two behaviors
    pos = mix(sunPos, targetPos, currentChaos);

    gl_FragColor = vec4( pos, 1. );

}
