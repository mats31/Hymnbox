uniform sampler2D tCloud;
uniform vec3 diffuse;
uniform float alpha;

varying vec3 vColor;
varying vec3 vPos;
varying float vRotation;
varying float vOpacity;

vec2 transformUV(vec2 uv, float a[9]) {

    // Convert UV to vec3 to apply matrices
	vec3 u = vec3(uv, 1.0);

    // Array consists of the following
    // 0 translate.x
    // 1 translate.y
    // 2 skew.x
    // 3 skew.y
    // 4 rotate
    // 5 scale.x
    // 6 scale.y
    // 7 origin.x
    // 8 origin.y

    // Origin before matrix
    mat3 mo1 = mat3(
        1, 0, -a[7],
        0, 1, -a[8],
        0, 0, 1);

    // Origin after matrix
    mat3 mo2 = mat3(
        1, 0, a[7],
        0, 1, a[8],
        0, 0, 1);

    // Translation matrix
    mat3 mt = mat3(
        1, 0, -a[0],
        0, 1, -a[1],
    	0, 0, 1);

    // Skew matrix
    mat3 mh = mat3(
        1, a[2], 0,
        a[3], 1, 0,
    	0, 0, 1);

    // Rotation matrix
    mat3 mr = mat3(
        cos(a[4]), sin(a[4]), 0,
        -sin(a[4]), cos(a[4]), 0,
    	0, 0, 1);

    // Scale matrix
    mat3 ms = mat3(
        1.0 / a[5], 0, 0,
        0, 1.0 / a[6], 0,
    	0, 0, 1);

	// apply translation
   	u = u * mt;

	// apply skew
   	u = u * mh;

    // apply rotation relative to origin
    u = u * mo1;
    u = u * mr;
    u = u * mo2;

    // apply scale relative to origin
    u = u * mo1;
    u = u * ms;
    u = u * mo2;

    // Return vec2 of new UVs
    return u.xy;
}
float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

vec2 rotate(vec2 uv) {
    float r = vRotation;
    float values[9];
    values[0] = 0.0; //x
    values[1] = 0.0; //y
    values[2] = 0.0; //skewX
    values[3] = 0.0; //skewY
    values[4] = r; //rotation
    values[5] = 1.0; //scaleX
    values[6] = 1.0; //scaleY
    values[7] = 0.5; //originX
    values[8] = 0.5; //originY
    return transformUV(uv, values);
}

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    uv = rotate(uv);

    vec4 color = texture2D(tCloud, uv);

    color.rgb *= diffuse;

    color.rgb *= clamp(range(uv.y, 0.5, 1.0, 1.0, 0.75), 0.75, 1.0);
    color.rgb *= clamp(range(vPos.y, 0.0, -400.0, 1.0, 0.75), 0.75, 1.0);

    color.a *= vOpacity * alpha;
    color.a *= 0.1;

    color.rgb += vColor * 0.5;

    gl_FragColor = color;
}
