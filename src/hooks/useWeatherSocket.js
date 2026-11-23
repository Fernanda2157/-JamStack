import { useEffect, useState } from "react";

const WS_URL = "ws://localhost:8080";

export function useWeatherSocket() {
  const [estado, setEstado] = useState("Conectando...");
  const [clima, setClima] = useState(null);
  const [usuarios, setUsuarios] = useState(0);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => setEstado("Conectado");
    socket.onclose = () => setEstado("Desconectado");
    socket.onerror = () => setEstado("Error");

    socket.onmessage = (evento) => {
      const msg = JSON.parse(evento.data);
      if (msg.tipo === "clima") setClima(msg.datos);
      if (msg.tipo === "usuarios") setUsuarios(msg.total);
    };

    // Al desmontar el componente, cerramos la conexión
    return () => {
      socket.onclose = null;
      socket.onerror = null;
      socket.close();
    };
  }, []);

  return { estado, clima, usuarios };
}