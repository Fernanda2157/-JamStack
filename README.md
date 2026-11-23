# Jamstack Weather + formulario GraphQL

Este proyecto conserva el clima (Open-Meteo) y WebSocket original, y agrega una **API GraphQL propia** para el formulario de contacto.

## Requisitos

Node.js 22 o posterior, npm.

## Iniciar (tres terminales en la raíz del proyecto)

Primero ejecuta `npm install` una sola vez. Después:

1. **Terminal 1:** `npm run graphql` (API local: `http://localhost:4000/graphql`).
2. **Terminal 2:** `npm run server` (WebSocket del clima: `ws://localhost:8080`).
3. **Terminal 3:** `npm run dev` (sitio React: normalmente `http://localhost:5173`).

Al abrir la web, completa el formulario y pulsa **Enviar mensaje (Mutation)**. Después pulsa **Consultar con GraphQL** para ejecutar la query y ver todos los mensajes en pantalla. Las entradas se guardan en `server/data/contactos.json` (se crea automáticamente).

## Operaciones GraphQL del formulario

**Guardar un contacto**:

```graphql
mutation CrearContacto($input: ContactoInput!) {
  crearContacto(input: $input) {
    id
    nombre
    correo
    mensaje
    fecha
  }
}
```

Variables de ejemplo:

```json
{"input":{"nombre":"Ana Pérez","correo":"ana@example.com","mensaje":"Hola, este es mi mensaje de prueba."}}
```

**Consultar todos los contactos**:

```graphql
query ConsultarContactos {
  contactos { id nombre correo mensaje fecha }
}
```

**Consultar por ID**:

```graphql
query ($id: ID!) { contacto(id: $id) { nombre correo mensaje } }
```

Las consultas se envían como HTTP POST a `/graphql` desde el frontend. Vite redirige esta ruta al puerto 4000.

## Archivos relevantes

- `src/components/ContactForm.jsx`: formulario y visualización de resultados.
- `src/services/contactGraphql.js`: mutation y query reales (no utiliza la API del clima).
- `server/graphql.js`: esquema GraphQL, validación, resolvers y guardado local.
- `vite.config.js`: proxy de desarrollo.

**Nota:** es una demostración local. Los mensajes y correos se muestran sin autenticación a quien acceda a la aplicación; antes de publicar en Internet, agrega autenticación y autorización y utiliza una base de datos.

## Buscar contactos con GraphQL

En la sección «Consultar mensajes», selecciona el campo (Nombre, Correo o ID), escribe el valor y presiona «Buscar». La búsqueda se ejecuta en el servidor GraphQL, no como un filtro local de React. El botón «Consultar con GraphQL» vuelve a listar todos los registros.

Ejemplo de consulta:

```graphql
query Buscar($campo: CampoBusqueda!, $termino: String!) {
  buscarContactos(campo: $campo, termino: $termino) {
    id nombre correo mensaje fecha
  }
}
```

Variables: `{ "campo": "NOMBRE", "termino": "Fernanda" }`. Los tres campos aceptan búsquedas parciales sin distinguir mayúsculas.

**Seguridad**: esta versión es para desarrollo local; no se deben publicar nombres/correos de contacto sin autenticación y autorización.
