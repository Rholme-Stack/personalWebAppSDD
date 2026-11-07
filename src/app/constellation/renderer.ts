import { BustLayout } from './layout';
import { MotionMode } from './motion';
import { ConstellationNodes, NODE_STRIDE } from './nodes';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

export const CAMERA_DISTANCE = 4.2;
export const FOV_Y = (35 * Math.PI) / 180;
export const NODE_SIZE_MIN = 1.5;
export const NODE_SIZE_MAX = 4;
export const FAR_OPACITY = 0.35;
export const DRIFT_AMPLITUDE = 0.01;
export const DPR_MAX = 2;

export interface FrameState {
  yaw: number;
  progress: number;
  time: number;
  layout: BustLayout;
  mode: MotionMode;
}

const ATTRIBUTES: [name: string, size: number][] = [
  ['a_position', 3],
  ['a_target', 3],
  ['a_color', 3],
  ['a_phase', 1],
  ['a_pace', 1],
];

/** Draws the nodes with WebGL2 in a single draw call. It holds no logic of its own (ADR 0003). */
export class ConstellationRenderer {
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();
  private readonly buffer: WebGLBuffer;
  /** One vertex array per node stride: every node, or every other node. */
  private readonly vertexArrays: WebGLVertexArrayObject[];
  private count = 0;
  private width = 1;
  private height = 1;
  private dpr = 1;

  /** Null when WebGL2 is not available or the shaders do not compile. */
  static create(
    canvas: HTMLCanvasElement,
    onContextLost: () => void,
  ): ConstellationRenderer | null {
    if (typeof WebGL2RenderingContext === 'undefined') {
      return null;
    }
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
    });
    const program = gl && createProgram(gl);
    if (!gl || !program) {
      return null;
    }
    canvas.addEventListener(
      'webglcontextlost',
      (event) => {
        event.preventDefault();
        onContextLost();
      },
      { once: true },
    );
    return new ConstellationRenderer(gl, program);
  }

  private constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly program: WebGLProgram,
  ) {
    this.buffer = gl.createBuffer();
    this.vertexArrays = [1, 2].map((stride) => this.createVertexArray(stride));
    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0, 0, 0, 1);
  }

  setNodes(nodes: ConstellationNodes): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodes.data, gl.STATIC_DRAW);
    this.count = nodes.count;
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    this.dpr = Math.min(devicePixelRatio, DPR_MAX);
    this.width = width;
    this.height = height;
    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  draw(frame: FrameState): void {
    const gl = this.gl;
    const { layout } = frame;
    const aspect = this.width / this.height;
    const tanHalf = Math.tan(FOV_Y / 2);

    gl.clear(gl.COLOR_BUFFER_BIT);
    this.set('u_progress', frame.progress);
    this.set('u_yaw', frame.yaw);
    this.set('u_time', frame.time);
    this.set('u_still', frame.mode === 'still' ? 1 : 0);
    this.set('u_scale', layout.heightFraction * CAMERA_DISTANCE * tanHalf);
    this.set('u_center', layout.centerX, layout.centerY);
    this.set(
      'u_cylinder',
      Math.min(1.1 * CAMERA_DISTANCE * tanHalf * aspect, CAMERA_DISTANCE - 0.8),
      1.1 * CAMERA_DISTANCE * tanHalf,
    );
    this.set('u_distance', CAMERA_DISTANCE);
    this.set('u_focal', 1 / tanHalf);
    this.set('u_aspect', aspect);
    this.set('u_size', NODE_SIZE_MIN, NODE_SIZE_MAX);
    this.set('u_far_opacity', FAR_OPACITY);
    this.set('u_drift', DRIFT_AMPLITUDE);
    this.set('u_opacity', layout.opacity);
    this.set('u_dpr', this.dpr);

    gl.bindVertexArray(this.vertexArrays[layout.nodeStride - 1]);
    gl.drawArrays(gl.POINTS, 0, Math.floor(this.count / layout.nodeStride));
  }

  dispose(): void {
    const gl = this.gl;
    this.vertexArrays.forEach((vao) => gl.deleteVertexArray(vao));
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }

  private createVertexArray(nodeStride: number): WebGLVertexArrayObject {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    const bytes = NODE_STRIDE * Float32Array.BYTES_PER_ELEMENT * nodeStride;
    let offset = 0;
    for (const [name, size] of ATTRIBUTES) {
      const location = gl.getAttribLocation(this.program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, bytes, offset);
      offset += size * Float32Array.BYTES_PER_ELEMENT;
    }
    gl.bindVertexArray(null);
    return vao;
  }

  private set(name: string, ...values: number[]): void {
    if (!this.uniforms.has(name)) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    }
    const location = this.uniforms.get(name) ?? null;
    if (values.length === 1) {
      this.gl.uniform1f(location, values[0]);
    } else {
      this.gl.uniform2f(location, values[0], values[1]);
    }
  }
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX_SHADER],
    [gl.FRAGMENT_SHADER, FRAGMENT_SHADER],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Constellation shader:', gl.getShaderInfoLog(shader));
      return null;
    }
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Constellation program:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}
