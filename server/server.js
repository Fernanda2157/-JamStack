import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-0.1807&longitude=-78.4678&current=temperature_2m,wind_speed_10m";

let ultimoClima = null;

// Enviar un objeto a TODOS los clientes conectados (broadcast)
function enviarATodos(objeto) {
  const texto = JSON.stringify(objeto);
  wss.clients.forEach((cliente) => {
    if (cliente.readyState === WebSocket.OPEN) cliente.send(texto);
  });
}

// El servidor consulta la API y reparte el resultado
async function actualizarClima() {
  try {
    const respuesta = await fetch(API_URL);
    const data = await respuesta.json();
    ultimoClima = { ...data.current, consultado: new Date().toISOString() };
    enviarATodos({ tipo: "clima", datos: ultimoClima });
    console.log("Clima enviado a", wss.clients.size, "cliente(s)");
  } catch (error) {
    console.error("Error consultando la API:", error.message);
  }
}

wss.on("connection", (socket) => {
  // Al conectarse, el cliente recibe de inmediato el último dato
  if (ultimoClima) {
    socket.send(JSON.stringify({ tipo: "clima", datos: ultimoClima }));
  }
  enviarATodos({ tipo: "usuarios", total: wss.clients.size });

  socket.on("close", () => {
    enviarATodos({ tipo: "usuarios", total: wss.clients.size });
  });
});

actualizarClima();
setInterval(actualizarClima, 30000); // cada 30 segundos

console.log("Servidor WebSocket en ws://localhost:8080");