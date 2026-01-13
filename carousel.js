const images = [
  "assets/beeld1.jpg",
  "assets/beeld2.jpg",
  "assets/beeld3.jpg",
  "assets/beeld4.jpg",
  "assets/beeld5.jpg"
];

const stage = document.getElementById("carousel-stage");

const preloadImages = (sources) => {
  sources.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

const createLayer = () => {
  const layer = document.createElement("div");
  layer.className = "carousel__layer";
  stage.appendChild(layer);
  return layer;
};

const getIndexForX = (x, width, total) => {
  const clamped = Math.min(Math.max(0, x), width - 1);
  return Math.min(total - 1, Math.floor(clamped / (width / total)));
};

if (stage) {
  preloadImages(images);

  const layers = [createLayer(), createLayer()];
  const total = images.length;
  let currentIndex = 0;
  let activeLayer = 0;

  const setIndex = (index) => {
    if (index === currentIndex) {
      return;
    }

    const nextLayer = activeLayer === 0 ? 1 : 0;
    layers[nextLayer].style.backgroundImage = `url("${images[index]}")`;
    layers[nextLayer].classList.add("is-active");
    layers[activeLayer].classList.remove("is-active");
    activeLayer = nextLayer;
    currentIndex = index;
  };

  const updateFromEvent = (event) => {
    const rect = stage.getBoundingClientRect();
    const index = getIndexForX(event.clientX - rect.left, rect.width, total);
    setIndex(index);
  };

  layers[0].style.backgroundImage = `url("${images[0]}")`;
  layers[0].classList.add("is-active");

  stage.addEventListener("pointermove", updateFromEvent);
  stage.addEventListener("pointerdown", updateFromEvent);
}
