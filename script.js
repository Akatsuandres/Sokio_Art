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

// Dark Mode
document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Buscador interno
document.getElementById("searchInput").addEventListener("keyup", () => {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  document.querySelectorAll(".art-card").forEach(card => {
    const title = card.dataset.title.toLowerCase();
    const desc = card.dataset.desc.toLowerCase();
    card.style.display = (title.includes(filter) || desc.includes(filter)) ? "" : "none";
  });
});

// Reacciones
document.querySelectorAll(".like-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let count = btn.querySelector(".count");
    count.textContent = parseInt(count.textContent) + 1;
  });
});
document.querySelectorAll(".love-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let count = btn.querySelector(".count");
    count.textContent = parseInt(count.textContent) + 1;
  });
});

// ------------------ Imagen ampliada ------------------

// Crear modal para mostrar imagen grande
const modal = document.createElement("div");
modal.id = "imageModal";
modal.style.display = "none";
modal.style.position = "fixed";
modal.style.top = "0";
modal.style.left = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.background = "rgba(0,0,0,0.8)";
modal.style.justifyContent = "center";
modal.style.alignItems = "center";
modal.style.zIndex = "1000";
modal.innerHTML = `<img id="modalImg" style="max-width:90%; max-height:90%; border:5px solid #fff; border-radius:10px;">`;
document.body.appendChild(modal);

// Cerrar modal al hacer clic
modal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Ampliar imagen al hacer clic
document.querySelectorAll(".art-card img").forEach(img => {
  img.addEventListener("click", () => {
    const modalImg = document.getElementById("modalImg");
    modalImg.src = img.src;
    modal.style.display = "flex";
  });
});

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ------------------ Comentarios ------------------

document.querySelectorAll(".art-card").forEach(card => {
  const obraId = card.dataset.obra;
  const comentariosDiv = card.querySelector(".comentarios");
  const usuarioInput = card.querySelector(".usuario");
  const textoInput = card.querySelector(".texto");
  const sendBtn = card.querySelector(".send-comment");

  // Guardar comentario
  sendBtn.addEventListener("click", () => {
    if (usuarioInput.value && textoInput.value) {
      db.collection("comentarios").add({
        obraId,
        usuario: usuarioInput.value,
        texto: textoInput.value,
        fecha: new Date()
      }).then(() => {
        usuarioInput.value = "";
        textoInput.value = "";
      }).catch(err => console.error("Error al guardar comentario:", err));
    }
  });

  // Mostrar comentarios en tiempo real
  db.collection("comentarios")
    .where("obraId", "==", obraId)
    .orderBy("fecha")
    .onSnapshot(snapshot => {
      comentariosDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const c = doc.data();
        comentariosDiv.innerHTML += `<p><b>${c.usuario}:</b> ${c.texto}</p>`;
      });
    });
});

// ------------------ Sugerencias ------------------

const suggestionsRef = db.collection("sugerencias");

document.getElementById("sendSuggestion").addEventListener("click", async () => {
  const input = document.getElementById("communityInput");
  if (input.value.trim() !== "") {
    await suggestionsRef.add({ texto: input.value, fecha: new Date() });
    input.value = "";
  }
});

suggestionsRef.orderBy("fecha", "desc").onSnapshot(snapshot => {
  const list = document.getElementById("communityList");
  list.innerHTML = "";
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().texto;
    list.appendChild(li);
  });
});

