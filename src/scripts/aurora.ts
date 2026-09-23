import { motion } from './state';

const vertex = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const fragment = `precision mediump float;
uniform vec2 u_res;uniform float u_t;uniform vec2 u_m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;vec2 p=uv;p.x*=u_res.x/u_res.y;float t=u_t*.045;
  vec2 q=vec2(fbm(p*1.3+t),fbm(p*1.3-t+3.1));
  vec2 r=vec2(fbm(p*1.9+q*1.7+vec2(1.7,9.2)+t*1.2),fbm(p*1.9+q*1.7+vec2(8.3,2.8)-t));
  float f=fbm(p*1.7+r*1.5+u_m*.12);
  vec3 night=vec3(.043,.031,.125),plum=vec3(.2,.09,.4),pink=vec3(1.,.24,.5),amber=vec3(1.,.66,.15),lagoon=vec3(.26,.72,1.);
  vec3 c=mix(night,plum,smoothstep(.25,.85,f));
  c=mix(c,pink,smoothstep(.55,.95,f*r.x+.12*uv.y)*.7);
  c=mix(c,amber,smoothstep(.6,1.,r.y*f+(1.-uv.y)*.14)*.6);
  c=mix(c,lagoon,smoothstep(.72,1.,q.x*r.x+.1)*.35);
  float band=smoothstep(.0,1.,sin(uv.x*2.4+f*3.+t*2.6)*.5+.5);
  c+=amber*.07*band*smoothstep(.35,1.,uv.y);
  c*=mix(.5,1.,smoothstep(0.,.7,uv.x));
  c*=.72+.28*smoothstep(0.,.55,uv.y);
  gl_FragColor=vec4(c,1.);
}`;

/** Animated dusk sky behind the hero. Runs only while visible, unpaused and allowed by motion preferences. */
export function startAurora(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;
  const program = gl.createProgram();
  if (!program) return;
  for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(type);
    if (!shader) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return;
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(program, 'u_res');
  const uTime = gl.getUniformLocation(program, 'u_t');
  const uMouse = gl.getUniformLocation(program, 'u_m');

  let frame = 0;
  let last = 0;
  let elapsed = 8;
  let visible = true;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw();
  };
  const draw = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (now - last < 33) return;
    elapsed += Math.min(now - last, 100) / 1000;
    last = now;
    draw();
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (visible && motion.ambient) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? false; sync(); }).observe(canvas);
  motion.subscribe(sync);
  window.addEventListener('pointermove', (event) => {
    mouse.tx = event.clientX / window.innerWidth - 0.5;
    mouse.ty = 0.5 - event.clientY / window.innerHeight;
  }, { passive: true });
  resize();
  canvas.classList.add('is-live');
}
