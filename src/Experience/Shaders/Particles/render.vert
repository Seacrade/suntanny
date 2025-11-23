

//float texture containing the positions of each particle
uniform sampler2D positions;
uniform float uPointSize;
uniform float uPixelRatio;

attribute vec3 aTargetColor;
attribute vec3 aTargetColor2;
attribute vec3 aTargetColor3;
attribute vec3 aTargetColor4;
attribute vec3 aTargetColor5;
attribute vec3 aTargetColor6;
varying vec3 vTargetColor;
varying vec3 vTargetColor2;
varying vec3 vTargetColor3;
varying vec3 vTargetColor4;
varying vec3 vTargetColor5;
varying vec3 vTargetColor6;
varying float size;
void main() {

    vTargetColor = aTargetColor;
    vTargetColor2 = aTargetColor2;
    vTargetColor3 = aTargetColor3;
    vTargetColor4 = aTargetColor4;
    vTargetColor5 = aTargetColor5;
    vTargetColor6 = aTargetColor6;

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec3 pos = texture2D( positions, position.xy ).xyz;

    if (length(pos) < 1.0) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        return;
    }

    //pos now contains the position of a point in space taht can be transformed
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_PointSize = uPixelRatio * uPointSize;
    gl_PointSize *= (1.0 / - viewPosition.z);

    size = gl_PointSize;

    //size
    //gl_PointSize = size = max( 1., ( step( 1. - ( 1. / 512. ), position.x ) ) * pointSize );


}
