// Año dinámico en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// Menú móvil
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Animación de aparición al hacer scroll
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
revealEls.forEach((el) => revealObserver.observe(el));

// Carrusel de tecnologías
const TECH_STACK = [
  ["python", "Python"], ["javascript", "JavaScript"], ["typescript", "TypeScript"],
  ["nextdotjs", "Next.js"], ["react", "React"], ["nodedotjs", "Node.js"],
  ["fastify", "Fastify"], ["fastapi", "FastAPI"], ["flask", "Flask"], ["express", "Express"],
  ["sqlalchemy", "SQLAlchemy"], ["prisma", "Prisma"], ["postgresql", "PostgreSQL"],
  ["mariadb", "MariaDB"], ["sqlite", "SQLite"], ["redis", "Redis"],
  ["anthropic", "Claude"], ["openai", "OpenAI"], ["googlegemini", "Gemini"],
  ["ollama", "Ollama"], ["langchain", "LangChain"], ["qwen", "Qwen"],
  ["opencv", "OpenCV"], ["pytorch", "PyTorch"], ["mediapipe", "MediaPipe"],
  ["discord", "Discord"], ["whatsapp", "WhatsApp"], ["playwright", "Playwright"],
  ["selenium", "Selenium"], ["celery", "Celery"], ["docker", "Docker"],
  ["linux", "Linux"], ["nginx", "Nginx"], ["caddy", "Caddy"],
  ["git", "Git"], ["github", "GitHub"], ["seafile", "Seafile"], ["numpy", "NumPy"],
  ["html5", "HTML5"], ["css3", "CSS3"], ["streamlit", "Streamlit"],
];

const techTrack = document.getElementById("techTrack");
if (techTrack) {
  techTrack.innerHTML = TECH_STACK.map(
    ([slug, name]) => `
    <div class="tech-item" data-slug="${slug}">
      <span class="tech-icon"></span>
      <span>${name}</span>
    </div>`
  ).join("");

  // Los SVG se cargan como imagen -> no se pueden colorear con CSS.
  // Se inyectan inline para poder pintarlos con currentColor.
  TECH_STACK.forEach(([slug]) => {
    fetch(`assets/icons/${slug}.svg`)
      .then((r) => (r.ok ? r.text() : ""))
      .then((svg) => {
        if (!svg) return;
        const el = techTrack.querySelector(`.tech-item[data-slug="${slug}"] .tech-icon`);
        if (el) el.innerHTML = svg;
      })
      .catch(() => {});
  });

  const items = () => Array.from(techTrack.querySelectorAll(".tech-item"));
  const progressBar = document.getElementById("techProgressBar");

  function updateActiveTech() {
    const trackRect = techTrack.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = null;
    let closestDist = Infinity;
    items().forEach((item) => {
      const r = item.getBoundingClientRect();
      const itemCenter = r.left + r.width / 2;
      const dist = Math.abs(itemCenter - center);
      item.classList.remove("is-active");
      if (dist < closestDist) {
        closestDist = dist;
        closest = item;
      }
    });
    if (closest) closest.classList.add("is-active");

    if (progressBar) {
      const maxScroll = techTrack.scrollWidth - techTrack.clientWidth;
      const pct = maxScroll > 0 ? techTrack.scrollLeft / maxScroll : 0;
      progressBar.style.transform = `scaleX(${Math.max(0.15, pct)})`;
      progressBar.style.width = "100%";
    }
  }

  let tickPending = false;
  techTrack.addEventListener("scroll", () => {
    if (tickPending) return;
    tickPending = true;
    setTimeout(() => {
      updateActiveTech();
      tickPending = false;
    }, 30);
  });

  // Indice del icono que se esta mostrando (el mas cercano al centro).
  // Se calcula por geometria en el momento (no depende de la clase is-active,
  // que se actualiza con retraso en cada evento de scroll).
  function activeIndex() {
    const t = techTrack.getBoundingClientRect();
    const center = t.left + t.width / 2;
    let best = 0;
    let bestDist = Infinity;
    items().forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  // Centra un icono en la pista. El centro de un elemento no cambia con el scale()
  // del item activo, y el destino se calcula desde el scroll actual, asi que
  // funciona tambien si se hace clic mientras aun hay una animacion en curso.
  function scrollToItem(item) {
    const t = techTrack.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const delta = r.left + r.width / 2 - (t.left + t.width / 2);
    techTrack.scrollTo({ left: techTrack.scrollLeft + delta });
  }

  // Avanza o retrocede EXACTAMENTE un icono por clic. Se recuerda el destino para que
  // varios clics seguidos sumen de 1 en 1 aunque el scroll suave no haya terminado.
  let targetIndex = null;
  let targetTimer = null;

  function moveBy(direction) {
    const list = items();
    const max = techTrack.scrollWidth - techTrack.clientWidth;
    let next;
    if (direction > 0 && techTrack.scrollLeft >= max - 4) {
      next = 0; // al final: vuelve al primero
    } else if (direction < 0 && techTrack.scrollLeft <= 4) {
      next = list.length - 1; // al inicio: salta al ultimo
    } else {
      const base = targetIndex ?? activeIndex();
      next = Math.min(list.length - 1, Math.max(0, base + direction));
    }
    targetIndex = next;
    clearTimeout(targetTimer);
    targetTimer = setTimeout(() => {
      targetIndex = null;
    }, 700);
    scrollToItem(list[next]);
  }

  document.querySelector(".tech-prev")?.addEventListener("click", () => {
    pauseAutoplay();
    moveBy(-1);
  });
  document.querySelector(".tech-next")?.addEventListener("click", () => {
    pauseAutoplay();
    moveBy(1);
  });

  // Auto-scroll continuo, en bucle, con pausa al interactuar
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let autoplayTimer = null;
  let resumeTimer = null;

  function startAutoplay() {
    if (reducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const maxScroll = techTrack.scrollWidth - techTrack.clientWidth;
      if (techTrack.scrollLeft >= maxScroll - 4) {
        techTrack.style.scrollBehavior = "auto";
        techTrack.scrollLeft = 0;
        requestAnimationFrame(() => {
          techTrack.style.scrollBehavior = "smooth";
        });
      } else {
        moveBy(1);
      }
    }, 2400);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function pauseAutoplay() {
    stopAutoplay();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoplay, 4500);
  }

  techTrack.addEventListener(
    "wheel",
    () => {
      targetIndex = null;
      pauseAutoplay();
    },
    { passive: true }
  );

  // Arrastrar con el mouse (el scroll táctil nativo ya funciona solo en móvil).
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragMoved = false;

  techTrack.addEventListener("pointerdown", (e) => {
    targetIndex = null;
    pauseAutoplay();
    if (e.pointerType === "touch") return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartScroll = techTrack.scrollLeft;
    techTrack.classList.add("is-dragging");
    techTrack.setPointerCapture(e.pointerId);
  });
  techTrack.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 3) dragMoved = true;
    techTrack.scrollLeft = dragStartScroll - dx;
  });
  function endDrag() {
    isDragging = false;
    techTrack.classList.remove("is-dragging");
  }
  techTrack.addEventListener("pointerup", endDrag);
  techTrack.addEventListener("pointercancel", endDrag);
  techTrack.addEventListener("pointerleave", () => {
    if (isDragging) endDrag();
  });
  // Evita que un arrastre termine abriendo un link/click accidental.
  techTrack.addEventListener(
    "click",
    (e) => {
      if (dragMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { capture: true }
  );

  window.addEventListener("load", updateActiveTech);
  setTimeout(updateActiveTech, 300);
  startAutoplay();
}

// Modal "Ver más información"
const PROJECT_DETAILS = {
  "compu-ai": {
    title: "Compu AI: asistente universitario por WhatsApp",
    sub: "Proyecto de tesis de grado",
    steps: [
      "El estudiante escribe su pregunta directamente por WhatsApp (horarios, aulas, docentes, exámenes, reglamentos).",
      "El sistema intenta responder primero con una consulta directa a la base de datos (rápido y siempre exacto).",
      "Si la pregunta necesita razonar sobre la respuesta, arma el contexto relevante y se lo pasa a un modelo de lenguaje.",
      "Cascada de respaldo: si un proveedor de IA falla o está saturado, reintenta automáticamente con el siguiente (Groq → Gemini → Claude → un modelo local).",
      "La respuesta final se envía de vuelta por WhatsApp, y todo el intercambio queda registrado para el panel de administración (protegido con verificación en dos pasos).",
    ],
    stack: [
      ["Backend", "FastAPI + LangGraph"],
      ["Datos / IA", "PostgreSQL + pgvector (búsqueda semántica)"],
      ["Panel admin", "Next.js + TypeScript, con 2FA"],
      ["Mensajería", "WhatsApp Cloud API"],
      ["Modelos de IA", "Groq, Gemini, Claude y Ollama en cascada"],
      ["Infraestructura", "Docker sobre un VPS propio"],
    ],
    note: "Es un proyecto realizado para un cliente, así que por confidencialidad no se pueden mostrar capturas reales ni más información del contenido. La explicación de arriba resume su funcionamiento real.",
  },
  "ocr-furigana": {
    title: "Pipeline OCR de furigana a EPUB",
    sub: "Pipeline de visión por computador + IA",
    steps: [
      "Se parte de páginas escaneadas de una novela ligera japonesa (incluyen furigana, las pequeñas guías de lectura sobre los kanji).",
      "Un modelo de visión-lenguaje (Qwen2.5-VL) hace OCR de cada página, separando el texto principal del furigana.",
      "El furigana se alinea automáticamente con su kanji correspondiente usando el diccionario KANJIDIC2.",
      "El texto reconstruido se marca para respetar la escritura vertical japonesa, igual que en una edición comercial.",
      "Un constructor de EPUB3 hecho a medida arma el libro final y lo valida antes de entregarlo.",
    ],
    stack: [
      ["OCR", "Qwen2.5-VL (modelo de visión-lenguaje)"],
      ["Cómputo", "PyTorch + CUDA (GPU local)"],
      ["Diccionario", "KANJIDIC2 para alinear el furigana"],
      ["Salida", "EPUB3 validado, formato de escritura vertical"],
    ],
    note: "Es un proyecto realizado para un cliente, así que por confidencialidad no se pueden mostrar capturas reales ni más información del contenido. La explicación de arriba resume su funcionamiento real.",
  },
  "qa-dashboard": {
    title: "Coordinador de pruebas para equipos de testers",
    sub: "Herramienta interna de QA (bot de Discord + panel web)",
    steps: [
      "Un tester termina de probar una build y escribe un solo comando en Discord (por ejemplo /reportar) con el link de la build que usó.",
      "El bot valida que el link tenga el formato correcto y lo guarda en una base de datos.",
      "Un panel web se actualiza solo, al instante, mostrando la lista de builds reportadas, sin que nadie tenga que recargar la página ni revisar el chat manualmente.",
      "Cuando alguien del equipo abre un link desde el panel, el servidor lo vuelve a verificar antes de abrirlo, para evitar enlaces rotos, caducados o maliciosos.",
    ],
    stack: [
      ["Bot", "discord.js v14 (slash commands)"],
      ["Panel web", "Express + actualización en vivo (Server-Sent Events)"],
      ["Base de datos", "SQLite en modo WAL (bot y web comparten datos sin chocar)"],
      ["Seguridad", "Helmet, límite de peticiones, re-verificación de enlaces"],
    ],
    note: "Es un proyecto realizado para un cliente, así que por confidencialidad no se pueden mostrar capturas reales ni más información del contenido. La explicación de arriba resume su funcionamiento real.",
  },
  "self-storage": {
    title: "Almacenamiento en la nube auto-hospedado",
    sub: "Infraestructura self-hosted",
    steps: [
      "Los archivos se suben a un servidor propio (VPS) en vez de a un servicio externo como Google Drive.",
      "El sistema (Seafile) parte cada archivo en bloques y solo guarda un bloque una vez aunque se repita en varios archivos: eso es la deduplicación.",
      "Un proxy (Caddy) expone el servicio con HTTPS automático, renovando los certificados solo.",
      "Backups cifrados se rotan automáticamente para poder recuperar versiones anteriores si algo falla.",
    ],
    stack: [
      ["Almacenamiento", "Seafile CE"],
      ["Base de datos", "MariaDB"],
      ["Cache", "Memcached"],
      ["Proxy / HTTPS", "Caddy (certificados automáticos)"],
      ["Infraestructura", "Docker Compose sobre un VPS"],
    ],
    note: "Es un proyecto realizado para un cliente, así que por confidencialidad no se pueden mostrar capturas reales ni más información del contenido. La explicación de arriba resume su funcionamiento real.",
  },
};

const modalOverlay = document.getElementById("projectModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

function openProjectModal(id) {
  const data = PROJECT_DETAILS[id];
  if (!data) return;
  const stepsHtml = data.steps
    .map((s, i) => `<li data-step="${i + 1}">${s}</li>`)
    .join("");
  const stackHtml = data.stack
    .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
    .join("");
  modalBody.innerHTML = `
    <h3 id="modalTitle">${data.title}</h3>
    <p class="modal-sub">${data.sub}</p>
    <h4>Cómo funciona</h4>
    <ul class="flow-steps">${stepsHtml}</ul>
    <h4>Stack técnico</h4>
    <table class="stack-table">${stackHtml}</table>
    ${data.note ? `<p class="modal-note">🔒 ${data.note}</p>` : ""}
  `;
  modalOverlay.classList.add("is-open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  modalOverlay.classList.remove("is-open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".more-info-btn").forEach((btn) => {
  btn.addEventListener("click", () => openProjectModal(btn.dataset.project));
});
modalClose.addEventListener("click", closeProjectModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeProjectModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) closeProjectModal();
});

// Filtro de proyectos
const filterBtns = document.querySelectorAll(".filter-btn");
const filterable = document.querySelectorAll("[data-cat]");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const filter = btn.dataset.filter;
    filterable.forEach((card) => {
      const cats = card.dataset.cat.split(" ");
      const show = filter === "all" || cats.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  });
});
