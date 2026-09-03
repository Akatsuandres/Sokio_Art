// ------------------ UI ------------------

// Efecto de escritura en el título
document.addEventListener("DOMContentLoaded", () => {
  const title = "Portafolio Sokio_Art";
  let i = 0;
  const titleElement = document.getElementById("title");
  function typeWriter() {
    if (i < title.length) {
      titleElement.textContent += title.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  }
  typeWriter();
});

// Dark Mode (persistente entre visitas)
const darkModeBtn = document.getElementById("darkModeBtn");
const darkModeIcon = document.getElementById("darkModeIcon");
const darkModeLabel = document.getElementById("darkModeLabel");

function applyDarkModeUI(isDark) {
  darkModeIcon.textContent = isDark ? "☀️" : "🌙";
  darkModeLabel.textContent = isDark ? "Modo claro" : "Modo oscuro";
}

if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark-mode");
}
applyDarkModeUI(document.body.classList.contains("dark-mode"));

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark ? "on" : "off");
  applyDarkModeUI(isDark);
  darkModeIcon.classList.remove("spin");
  void darkModeIcon.offsetWidth;
  darkModeIcon.classList.add("spin");
});

// Buscador interno + filtros por categoría + año
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
const filterChips = document.querySelectorAll(".chip");
const yearFilter = document.getElementById("yearFilter");
let activeCategory = "all";
let activeYear = "all";

function populateYearFilter() {
  const years = new Set();
  document.querySelectorAll(".art-card").forEach(card => {
    if (card.dataset.year) years.add(card.dataset.year);
  });
  const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a));
  sortedYears.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}
populateYearFilter();

function applyFilters() {
  const filter = searchInput.value.toLowerCase();
  let visibleCount = 0;
  document.querySelectorAll(".art-card").forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const desc = card.dataset.desc.toLowerCase();
    const category = card.dataset.category || "";
    const year = card.dataset.year || "";
    const matchesText = title.includes(filter) || desc.includes(filter);
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const matchesYear = activeYear === "all" || year === activeYear;
    const matches = matchesText && matchesCategory && matchesYear;
    card.style.display = matches ? "" : "none";
    if (matches) visibleCount++;
  });
  noResults.style.display = visibleCount === 0 ? "" : "none";
}

searchInput.addEventListener("keyup", applyFilters);

filterChips.forEach(chip => {
  chip.addEventListener("click", () => {
    filterChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.filter;
    applyFilters();
  });
});

yearFilter.addEventListener("change", () => {
  activeYear = yearFilter.value;
  applyFilters();
});

// Reacciones
document.querySelectorAll(".like-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let count = btn.querySelector(".count");
    count.textContent = parseInt(count.textContent) + 1;
    btn.classList.remove("pop");
    void btn.offsetWidth; // reinicia la animación
    btn.classList.add("pop");
  });
});
document.querySelectorAll(".love-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let count = btn.querySelector(".count");
    count.textContent = parseInt(count.textContent) + 1;
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
  });
});

// ------------------ Imagen ampliada (con navegación) ------------------

// Crear modal para mostrar imagen grande
const modal = document.createElement("div");
modal.id = "imageModal";
modal.innerHTML = `
  <button id="modalClose" aria-label="Cerrar">&times;</button>
  <button id="modalPrev" class="modal-nav" aria-label="Anterior">&#10094;</button>
  <img id="modalImg" alt="">
  <button id="modalNext" class="modal-nav" aria-label="Siguiente">&#10095;</button>
`;
document.body.appendChild(modal);

const modalImg = document.getElementById("modalImg");
let galleryImgs = [];
let currentIndex = 0;

function openModalAt(index) {
  currentIndex = index;
  modalImg.src = galleryImgs[currentIndex].src;
  modalImg.alt = galleryImgs[currentIndex].alt;
  modal.style.display = "flex";
}

function showRelative(step) {
  currentIndex = (currentIndex + step + galleryImgs.length) % galleryImgs.length;
  modalImg.src = galleryImgs[currentIndex].src;
  modalImg.alt = galleryImgs[currentIndex].alt;
}

function initLightbox() {
  galleryImgs = Array.from(document.querySelectorAll(".art-card img"));
  galleryImgs.forEach((img, index) => {
    img.addEventListener("click", () => openModalAt(index));
  });
}
initLightbox();

document.getElementById("modalClose").addEventListener("click", () => {
  modal.style.display = "none";
});
document.getElementById("modalPrev").addEventListener("click", (e) => {
  e.stopPropagation();
  showRelative(-1);
});
document.getElementById("modalNext").addEventListener("click", (e) => {
  e.stopPropagation();
  showRelative(1);
});

// Cerrar modal al hacer clic en el fondo
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Navegación con teclado
document.addEventListener("keydown", (e) => {
  if (modal.style.display !== "flex") return;
  if (e.key === "Escape") modal.style.display = "none";
  if (e.key === "ArrowLeft") showRelative(-1);
  if (e.key === "ArrowRight") showRelative(1);
});

// ------------------ Galería de proceso por obra ------------------
// Cada .art-card puede tener data-process="ruta1.jpg,ruta2.jpg,ruta3.jpg"
// con las distintas etapas de una obra (boceto, lineart, color, final...).
// Si solo hay una ruta (o coincide con la imagen principal), el botón
// "Proceso" no se muestra: solo aparece cuando de verdad hay varias fotos.

function initProcessGalleries() {
  const processModal = document.createElement("div");
  processModal.id = "processModal";
  processModal.innerHTML = `
    <button id="processClose" aria-label="Cerrar">&times;</button>
    <p id="processTitle" class="process-title"></p>
    <div class="process-main">
      <button id="processPrev" class="modal-nav" aria-label="Anterior">&#10094;</button>
      <img id="processMainImg" alt="">
      <button id="processNext" class="modal-nav" aria-label="Siguiente">&#10095;</button>
    </div>
    <div id="processThumbs" class="process-thumbs"></div>
  `;
  document.body.appendChild(processModal);

  const processMainImg = document.getElementById("processMainImg");
  const processThumbs = document.getElementById("processThumbs");
  const processTitle = document.getElementById("processTitle");
  let currentImages = [];
  let currentIndex = 0;

  function highlightThumb() {
    processThumbs.querySelectorAll("img").forEach((t, i) => {
      t.classList.toggle("active", i === currentIndex);
    });
  }

  function renderProcess() {
    processMainImg.src = currentImages[currentIndex];
    highlightThumb();
  }

  function showRelativeProcess(step) {
    currentIndex = (currentIndex + step + currentImages.length) % currentImages.length;
    renderProcess();
  }

  document.querySelectorAll(".art-card").forEach(card => {
    const raw = card.dataset.process;
    if (!raw) return;
    const images = raw.split(",").map(s => s.trim()).filter(Boolean);
    if (images.length < 2) return; // sin proceso real, no se muestra el botón

    const wrap = card.querySelector(".art-image-wrap");
    wrap.classList.add("has-process");

    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "process-badge";
    badge.innerHTML = `🖼️ Proceso <span>(${images.length})</span>`;
    wrap.appendChild(badge);

    badge.addEventListener("click", () => {
      currentImages = images;
      currentIndex = images.length - 1; // arranca mostrando la obra final
      processTitle.textContent = card.dataset.title;
      processThumbs.innerHTML = "";
      images.forEach((src, i) => {
        const t = document.createElement("img");
        t.src = src;
        t.alt = `${card.dataset.title} - paso ${i + 1}`;
        t.addEventListener("click", () => {
          currentIndex = i;
          renderProcess();
        });
        processThumbs.appendChild(t);
      });
      renderProcess();
      processModal.style.display = "flex";
    });
  });

  document.getElementById("processClose").addEventListener("click", () => {
    processModal.style.display = "none";
  });
  document.getElementById("processPrev").addEventListener("click", () => showRelativeProcess(-1));
  document.getElementById("processNext").addEventListener("click", () => showRelativeProcess(1));

  processModal.addEventListener("click", (e) => {
    if (e.target === processModal) processModal.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (processModal.style.display !== "flex") return;
    if (e.key === "Escape") processModal.style.display = "none";
    if (e.key === "ArrowLeft") showRelativeProcess(-1);
    if (e.key === "ArrowRight") showRelativeProcess(1);
  });
}
initProcessGalleries();

// ------------------ Compartir y Descargar ------------------
// Botón de guardar (descargar imagen)
document.querySelectorAll(".save-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.parentElement;
    const img = card.querySelector("img");
    const imgUrl = img.src;

    // Crear enlace invisible para forzar descarga
    const a = document.createElement("a");
    a.href = imgUrl;
    a.setAttribute("download", card.dataset.title.replace(/\s+/g, "_") + ".jpg");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("✅ Imagen descargada: " + card.dataset.title);
  });
});


// ------------------ Contador de visitas ------------------

let visits = localStorage.getItem("visits") || 0;
visits++;
localStorage.setItem("visits", visits);
document.getElementById("visitCounter").textContent = `Visitas: ${visits}`;

// ------------------ Firebase ------------------

// Configuración de Firebase (usa tus datos reales)
const firebaseConfig = {
  apiKey: "AIzaSyBZ0rlrNWGivcfiFP1GfqmTBIsIt7gQEao",
  authDomain: "sokio-cc346.firebaseapp.com",
  projectId: "sokio-cc346",
  storageBucket: "sokio-cc346.firebasestorage.app",
  messagingSenderId: "513517882748",
  appId: "1:513517882748:web:34377e11b1b55fe95fa8f9",
  measurementId: "G-083QBWB5JC"
};

// Initialize Firebase (SDK v8 - compat, coherente con los <script> cargados en index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ------------------ Comentarios ------------------

document.querySelectorAll(".art-card").forEach(card => {
  const obraId = card.dataset.obra;
  const comentariosDiv = card.querySelector(".comentarios");
  const usuarioInput = card.querySelector(".usuario");
  const textoInput = card.querySelector(".texto");
  const sendBtn = card.querySelector(".send-comment");

  // Guardar comentario
  sendBtn.addEventListener("click", () => {
    const usuario = usuarioInput.value.trim();
    const texto = textoInput.value.trim();
    if (usuario && texto) {
      db.collection("comentarios").add({
        obraId,
        usuario,
        texto,
        fecha: new Date()
      }).then(() => {
        usuarioInput.value = "";
        textoInput.value = "";
      }).catch(err => console.error("Error al guardar comentario:", err));
    }
  });

  // Mostrar comentarios en tiempo real (sin innerHTML para evitar inyección de HTML)
  db.collection("comentarios")
    .where("obraId", "==", obraId)
    .orderBy("fecha", "desc")
    .onSnapshot(snapshot => {
      comentariosDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const c = doc.data();
        const p = document.createElement("p");
        const strong = document.createElement("b");
        strong.textContent = c.usuario + ": ";
        p.appendChild(strong);
        p.appendChild(document.createTextNode(c.texto));
        comentariosDiv.appendChild(p);
      });
    });
});

// ------------------ Sugerencias ------------------

const suggestionsRef = db.collection("sugerencias");

document.getElementById("sendSuggestion").addEventListener("click", async () => {
  const input = document.getElementById("communityInput");
  const texto = input.value.trim();
  if (texto !== "") {
    await suggestionsRef.add({ texto, fecha: new Date() });
    input.value = "";
  }
});

suggestionsRef.orderBy("fecha", "desc").onSnapshot(snapshot => {
  const list = document.getElementById("communityList");
  list.innerHTML = "";
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().texto; // textContent evita inyección de HTML
    list.appendChild(li);
  });
});


// ------------------ Barra de progreso de lectura ------------------

const readingProgress = document.getElementById("readingProgress");

function updateReadingProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  readingProgress.style.width = pct + "%";
}

window.addEventListener("scroll", updateReadingProgress, { passive: true });
updateReadingProgress();

// ------------------ Botón "volver arriba" ------------------

const backToTop = document.createElement("button");
backToTop.id = "backToTop";
backToTop.type = "button";
backToTop.setAttribute("aria-label", "Volver arriba");
backToTop.textContent = "↑";
document.body.appendChild(backToTop);

function toggleBackToTop() {
  backToTop.classList.toggle("visible", window.scrollY > 500);
}

window.addEventListener("scroll", toggleBackToTop, { passive: true });
toggleBackToTop();

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ------------------ Inclinación 3D en las tarjetas (solo escritorio) ------------------

const supportsHoverTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (supportsHoverTilt) {
  document.querySelectorAll(".art-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(-4px, -4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// ------------------ Revelado de bloques al hacer scroll ------------------

function initScrollReveal() {
  const items = document.querySelectorAll(".reveal-up");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(item => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(item => observer.observe(item));
}
initScrollReveal();
// ------------------ Explosión de partículas (confeti) ------------------

function confettiBurst(x, y, emojis = ["✨", "💖", "⭐", "🩷"], count = 10) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("span");
    particle.className = "confetti-particle";
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 50;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rotate = (Math.random() - 0.5) * 220;

    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.setProperty("--dx", dx + "px");
    particle.style.setProperty("--dy", dy + "px");
    particle.style.setProperty("--rot", rotate + "deg");
    particle.style.fontSize = 12 + Math.random() * 10 + "px";

    document.body.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

function burstFromElement(el, emojis) {
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  confettiBurst(x, y, emojis);
}

document.querySelectorAll(".like-btn").forEach(btn => {
  btn.addEventListener("click", () => burstFromElement(btn, ["👍", "✨", "🩷"]));
});
document.querySelectorAll(".love-btn").forEach(btn => {
  btn.addEventListener("click", () => burstFromElement(btn, ["❤️", "💖", "✨"]));
});
document.querySelectorAll(".save-btn").forEach(btn => {
  btn.addEventListener("click", () => burstFromElement(btn, ["💾", "⭐", "✨"]));
});

// ------------------ Aviso flotante (toast) ------------------

function showToast(message) {
  let toast = document.getElementById("kawaiiToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "kawaiiToast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("visible");
  void toast.offsetWidth;
  toast.classList.add("visible");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

// Explosión + aviso al publicar un comentario en una obra
document.querySelectorAll(".send-comment").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".art-card");
    const usuario = card.querySelector(".usuario").value.trim();
    const texto = card.querySelector(".texto").value.trim();
    if (usuario && texto) {
      burstFromElement(btn, ["💬", "✨", "🩷", "⭐"]);
      showToast("¡Comentario enviado! 💌");
    }
  });
});

// Explosión + aviso al publicar una sugerencia de la comunidad
document.getElementById("sendSuggestion").addEventListener("click", () => {
  const input = document.getElementById("communityInput");
  if (input.value.trim() !== "") {
    burstFromElement(document.getElementById("sendSuggestion"), ["🎉", "✨", "💖", "⭐"]);
    showToast("¡Sugerencia publicada! 🎉");
  }
});
