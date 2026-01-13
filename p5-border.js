let border = 10;
let stripeTarget = 200;
let stepMs = 500;
let stepFraction = 0.2;
let depthMin = 2;
let depthMax = 6;
let segmentMin = 20;
let segmentMax = 80;
let c1 = "#FFC314";
let c2 = "#00412D";
let leftShift = 3;
let rightShift = -3;

let stripe = stripeTarget;
let halfStripe = stripe / 2;
let band = border + depthMax;
let jagged = null;

const readCssColor = (name, fallback) => {
  const rootStyles = getComputedStyle(document.documentElement);
  const value = rootStyles.getPropertyValue(name).trim();
  return value || fallback;
};

const updateColors = () => {
  c1 = readCssColor("--color-1", c1);
  c2 = readCssColor("--color-2", c2);
};

const buildEdge = (length, startDepth, endDepth) => {
  const points = [];
  let pos = 0;
  points.push({ pos, depth: startDepth });
  while (pos < length) {
    pos += random(segmentMin, segmentMax);
    if (pos >= length) {
      pos = length;
    }
    const depth = pos === length ? endDepth : random(depthMin, depthMax);
    points.push({ pos, depth });
  }
  return points;
};

const generateJagged = () => {
  const corners = {
    tl: random(depthMin, depthMax),
    tr: random(depthMin, depthMax),
    br: random(depthMin, depthMax),
    bl: random(depthMin, depthMax)
  };

  const innerLeft = border;
  const innerTop = border;
  const innerRight = width - border;
  const innerBottom = height - border;

  const topStartX = innerLeft + corners.tl;
  const topEndX = innerRight - corners.tr;
  const topLen = Math.max(0, topEndX - topStartX);

  const rightStartY = innerTop + corners.tr;
  const rightEndY = innerBottom - corners.br;
  const rightLen = Math.max(0, rightEndY - rightStartY);

  const bottomStartX = innerLeft + corners.bl;
  const bottomEndX = innerRight - corners.br;
  const bottomLen = Math.max(0, bottomEndX - bottomStartX);

  const leftStartY = innerTop + corners.tl;
  const leftEndY = innerBottom - corners.bl;
  const leftLen = Math.max(0, leftEndY - leftStartY);

  const top = buildEdge(topLen, corners.tl, corners.tr).map(({ pos, depth }) => ({
    x: topStartX + pos,
    y: border + depth
  }));
  const right = buildEdge(rightLen, corners.tr, corners.br).map(({ pos, depth }) => ({
    x: width - border - depth,
    y: rightStartY + pos
  }));
  const bottom = buildEdge(bottomLen, corners.bl, corners.br).map(({ pos, depth }) => ({
    x: bottomStartX + pos,
    y: height - border - depth
  }));
  const left = buildEdge(leftLen, corners.tl, corners.bl).map(({ pos, depth }) => ({
    x: border + depth,
    y: leftStartY + pos
  }));

  bottom.reverse();
  left.reverse();

  return { top, right, bottom, left };
};

const updateStripe = () => {
  const perimeter = 2 * (width + height);
  const halfTarget = stripeTarget / 2;
  let halfCount = Math.round(perimeter / halfTarget);
  halfCount = Math.max(8, halfCount);
  if (halfCount % 2 !== 0) {
    halfCount += 1;
  }
  halfStripe = perimeter / halfCount;
  stripe = halfStripe * 2;
  band = border + depthMax;
};

const drawSegment = (side, start, length, color) => {
  fill(color);
  if (side === "top") {
    rect(start, 0, length, band);
    return;
  }
  if (side === "right") {
    rect(width - band, start + rightShift, band, length);
    return;
  }
  if (side === "bottom") {
    rect(width - start - length, height - band, length, band);
    return;
  }
  rect(0, height - start - length + leftShift, band, length);
};

const drawSide = (side, length, startDist, phase) => {
  let s = 0;
  const d0 = startDist - phase;
  let offset = d0 % stripe;
  if (offset < 0) {
    offset += stripe;
  }
  let useC1 = offset < halfStripe;
  let segLen = useC1 ? halfStripe - offset : stripe - offset;

  while (s < length) {
    const len = Math.min(segLen, length - s);
    drawSegment(side, s, len, useC1 ? c1 : c2);
    s += len;
    useC1 = !useC1;
    segLen = halfStripe;
  }
};

const drawStripes = (phase) => {
  const startTop = 0;
  const startRight = width;
  const startBottom = width + height;
  const startLeft = width + height + width;

  drawSide("right", height, startRight, phase);
  drawSide("left", height, startLeft, phase);
  drawSide("top", width, startTop, phase);
  drawSide("bottom", width, startBottom, phase);
};

const drawMask = () => {
  fill(255);
  beginShape();
  jagged.top.forEach((point) => vertex(point.x, point.y));
  jagged.right.forEach((point) => vertex(point.x, point.y));
  jagged.bottom.forEach((point) => vertex(point.x, point.y));
  jagged.left.forEach((point) => vertex(point.x, point.y));
  endShape(CLOSE);
};

const recalc = () => {
  updateColors();
  updateStripe();
  jagged = generateJagged();
};

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  const parent = document.getElementById("p5-border");
  if (parent) {
    canvas.parent(parent);
  }
  noStroke();
  frameRate(30);
  recalc();
}

function draw() {
  clear();
  const stepIndex = Math.floor(millis() / stepMs);
  const phase = stepIndex * (stripe * stepFraction);
  drawStripes(phase);
  erase();
  drawMask();
  noErase();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalc();
}
