/**
 * GLSL ES 3.00 shaders of the constellation. The rules are in specs/003-constelacion/data-model.md:
 * explosion, cloud center, drift, turn, perspective, size and opacity by depth, triangle and twinkle.
 */

export const VERTEX_SHADER = `#version 300 es
in vec3 a_position;
in vec3 a_target;
in vec3 a_color;
in float a_phase;
in float a_pace;

uniform float u_progress;   // scroll progress p, 0..1
uniform float u_yaw;        // radians, positive turns the face toward the viewer's right
uniform float u_time;       // seconds
uniform float u_still;      // 1 with reduced motion
uniform float u_scale;      // bust units -> world units
uniform vec2 u_center;      // bust center, fractions of the viewport (y from the top)
uniform vec2 u_cylinder;    // explosion cylinder radius and half height, world units
uniform float u_distance;   // camera distance to the center
uniform float u_focal;      // 1 / tan(fov / 2)
uniform float u_aspect;     // width / height
uniform vec2 u_size;        // node size in px: far, near
uniform float u_far_opacity;
uniform float u_drift;
uniform float u_opacity;    // layout opacity
uniform float u_dpr;

out vec3 v_color;
out float v_alpha;
out float v_phase;
out float v_size;

float smooth01(float p) {
  p = clamp(p, 0.0, 1.0);
  return p * p * (3.0 - 2.0 * p);
}

void main() {
  bool still = u_still > 0.5;
  float s = smooth01(u_progress);
  float amount = still ? 0.0 : pow(s, a_pace);

  vec3 cylinder = vec3(u_cylinder.x, u_cylinder.y, u_cylinder.x);
  vec3 p = mix(a_position * u_scale, a_target * cylinder, amount);
  if (!still) {
    p += u_drift * u_scale * sin(u_time * vec3(0.9, 0.7, 0.8) + a_phase * vec3(1.0, 1.7, 2.3));
  }

  float c = cos(u_yaw);
  float n = sin(u_yaw);
  p = vec3(c * p.x + n * p.z, p.y, -n * p.x + c * p.z);

  float depth = max(u_distance - p.z, 0.3);
  vec2 ndc = vec2(p.x * u_focal / u_aspect, p.y * u_focal) / depth;
  vec2 center = vec2(mix(u_center.x, 0.5, s), u_center.y);
  gl_Position = vec4(ndc + vec2(center.x * 2.0 - 1.0, 1.0 - center.y * 2.0), 0.0, 1.0);

  float k = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);
  float size = mix(u_size.x, u_size.y, k) * u_dpr;
  v_size = size;
  gl_PointSize = size;

  float speed = 1.5 + 1.5 * fract(a_phase * 7.13);
  float twinkle = still ? 1.0 : 0.75 + 0.25 * sin(u_time * speed + a_phase);
  float fade = still ? 1.0 - u_progress : 1.0;
  v_alpha = mix(u_far_opacity, 1.0, k) * twinkle * u_opacity * fade;
  v_color = a_color;
  v_phase = a_phase;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

in vec3 v_color;
in float v_alpha;
in float v_phase;
in float v_size;

out vec4 out_color;

void main() {
  float alpha = v_alpha;
  if (v_size >= 3.0) {
    // Equilateral triangle turned by the node's phase.
    vec2 q = gl_PointCoord * 2.0 - 1.0;
    float c = cos(v_phase);
    float n = sin(v_phase);
    q = vec2(c * q.x - n * q.y, n * q.x + c * q.y);
    float edge = max(max(-q.y, dot(q, vec2(0.866, 0.5))), dot(q, vec2(-0.866, 0.5)));
    if (edge > 0.5) {
      discard;
    }
  } else {
    // Too small to show a triangle: a dimmer dot with the same visual weight.
    alpha *= 0.6;
  }
  out_color = vec4(v_color * alpha, alpha);
}
`;
