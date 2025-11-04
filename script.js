/* ==========================================
   Mundo de Fe CR - Registro de Nuevos
   Funciones: Guardar datos en Firebase y enviar correos con EmailJS
   ========================================== */

// 🕊️ EmailJS CONFIGURACIÓN
// Crea una cuenta en https://www.emailjs.com y coloca tus datos:
const EMAILJS_SERVICE_ID = "service_bq2os92";
const EMAILJS_TEMPLATE_PASTOR = "template_yymapv4";
const EMAILJS_TEMPLATE_VISITANTE = "template_97nop0r";
const EMAILJS_PUBLIC_KEY = "uS7NMxU4mD_GgRgia"; // tu clave pública real

// Inicializar EmailJS con configuración ampliada
emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY,
  blockHeadless: false,
  limitRate: {
    id: "MundoDeFeApp",
    throttle: 10000, // 10 seg entre envíos para prevenir spam
  },
});

// 📖 Versículos aleatorios
const versiculos = [
  "Salmo 133:1 - ¡Cuán bueno y cuán delicioso es habitar los hermanos juntos en armonía!",
  "Juan 13:34 - Un mandamiento nuevo les doy: que se amen unos a otros.",
  "Romanos 15:7 - Por tanto, recibíos los unos a los otros, como también Cristo nos recibió.",
  "Filipenses 1:6 - El que comenzó en ustedes la buena obra, la perfeccionará hasta el día de Cristo Jesús.",
  "1 Tesalonicenses 5:11 - Anímense unos a otros y edifíquense mutuamente.",
];

// 🔥 FIREBASE CONFIGURACIÓN
const firebaseConfig = {
  apiKey: "AIzaSyCH3PFA3aZRfcWULt7zTTpNFERnKgijE7w",
  authDomain: "hospitalidad-mdf.firebaseapp.com",
  databaseURL: "https://hospitalidad-mdf-default-rtdb.firebaseio.com/",
  projectId: "hospitalidad-mdf",
  storageBucket: "hospitalidad-mdf.firebasestorage.app",
  messagingSenderId: "460182229194",
  appId: "1:460182229194:web:0dae840c04f5b5a7236433",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ================================
// Función principal de envío
// ================================
document
  .getElementById("form-visitante")

   // 🧍‍♂️ Acompañantes dinámicos
const contenedorAcomp = document.getElementById("acompanantes-container");
const btnAddAcomp = document.getElementById("btnAddAcompanante");

btnAddAcomp.addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("acompanante-input");

  div.innerHTML = `
    <input type="text" name="nombreAcomp" placeholder="Nombre del acompañante" required />
    <input type="text" name="relacionAcomp" placeholder="Relación (esposa, hijo, amigo...)" required />
    <button type="button" class="btn-secondary btn-remove">✖</button>
  `;

  div.querySelector(".btn-remove").addEventListener("click", () => div.remove());
  contenedorAcomp.appendChild(div);
});

  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    if (!nombre) {
      mostrarMensaje("Por favor, completa el campo de nombre.", "error");
      return;
    }

    const versiculo = versiculos[Math.floor(Math.random() * versiculos.length)];
    const timestamp = new Date().toISOString();

    try {
      // Guardar en Firebase
      const nuevoRef = db.ref("visitantes").push();
       // Capturar acompañantes
const acompElements = document.querySelectorAll(".acompanante-input");
let acompanantes = [];

acompElements.forEach(div => {
  const nombre = div.querySelector('[name="nombreAcomp"]').value.trim();
  const relacion = div.querySelector('[name="relacionAcomp"]').value.trim();
  if (nombre) {
    acompanantes.push({ nombre, relacion });
  }
});
      await nuevoRef.set({
        nombre,
        correo,
        telefono,
        fecha: timestamp,
        acompanantes, // 👈 aquí
      });

      // Enviar correo al pastor (usando método directo con clave pública)
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_PASTOR,
        {
          nombre,
          correo: correo || "No proporcionado",
          telefono: telefono || "No proporcionado",
          fecha: new Date().toLocaleString("es-CR"),
        },
        EMAILJS_PUBLIC_KEY
      );

      // Enviar correo al visitante si tiene correo
      if (correo) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_VISITANTE,
          {
            nombre,
            correo,
            versiculo,
          },
          EMAILJS_PUBLIC_KEY
        );
      }

      mostrarMensaje("¡Registro enviado con éxito! 🎉", "success");
      e.target.reset();
    } catch (error) {
      console.error("Error al enviar correos:", error);
      mostrarMensaje("Error al enviar los correos. Intenta de nuevo.", "error");
    }
  });

// ================================
// Función para mostrar mensajes
// ================================
function mostrarMensaje(texto, tipo) {
  const msgOk = document.querySelector(".msg.success");
  const msgErr = document.querySelector(".msg.error");

  msgOk.hidden = true;
  msgErr.hidden = true;

  if (tipo === "success") {
    msgOk.textContent = texto;
    msgOk.hidden = false;
  } else {
    msgErr.textContent = texto;
    msgErr.hidden = false;
  }
}
