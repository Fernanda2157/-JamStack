import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSchema, graphql } from 'graphql';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data', 'contactos.json');
const PORT = 4000;

const schema = buildSchema(`
  type Contacto {
    id: ID!
    nombre: String!
    correo: String!
    mensaje: String!
    fecha: String!
  }

  input ContactoInput {
    nombre: String!
    correo: String!
    mensaje: String!
  }

  enum CampoBusqueda {
    NOMBRE
    CORREO
    ID
  }

  type Query {
    contactos: [Contacto!]!
    contacto(id: ID!): Contacto
    buscarContactos(campo: CampoBusqueda!, termino: String!): [Contacto!]!
  }

  type Mutation {
    crearContacto(input: ContactoInput!): Contacto!
  }
`);

async function leerContactos() {
  try {
    const contenido = await readFile(DATA_FILE, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function guardarContactos(contactos) {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  const temporal = `${DATA_FILE}.tmp`;
  await writeFile(temporal, JSON.stringify(contactos, null, 2), 'utf8');
  await rename(temporal, DATA_FILE);
}

function validarContacto({ nombre, correo, mensaje }) {
  if (typeof nombre !== 'string' || nombre.trim().length < 3 || nombre.trim().length > 100) {
    throw new Error('El nombre debe tener entre 3 y 100 caracteres.');
  }
  if (typeof correo !== 'string' || correo.length > 254 || !/^\S+@\S+\.\S+$/.test(correo.trim())) {
    throw new Error('Introduce un correo electrónico válido.');
  }
  if (typeof mensaje !== 'string' || mensaje.trim().length < 10 || mensaje.trim().length > 2000) {
    throw new Error('El mensaje debe tener entre 10 y 2000 caracteres.');
  }
}

const rootValue = {
  contactos: async () => (await leerContactos()).reverse(),
  contacto: async ({ id }) => (await leerContactos()).find((item) => item.id === id) ?? null,
  buscarContactos: async ({ campo, termino }) => {
    const texto = termino.trim().toLocaleLowerCase('es');
    if (!texto) return [];
    const propiedad = { NOMBRE: 'nombre', CORREO: 'correo', ID: 'id' }[campo];
    if (!propiedad) throw new Error('Campo de búsqueda no válido.');
    const contactos = await leerContactos();
    return contactos.filter((item) => item[propiedad].toLocaleLowerCase('es').includes(texto)).reverse();
  },
  crearContacto: async ({ input }) => {
    validarContacto(input);
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: input.nombre.trim(),
      correo: input.correo.trim(),
      mensaje: input.mensaje.trim(),
      fecha: new Date().toISOString(),
    };
    const contactos = await leerContactos();
    contactos.push(nuevo);
    await guardarContactos(contactos);
    return nuevo;
  },
};

createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.url !== '/graphql' || req.method !== 'POST') {
    res.writeHead(404).end(JSON.stringify({ error: 'Utiliza POST /graphql' }));
    return;
  }
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 100_000) {
        res.writeHead(413).end(JSON.stringify({ errors: [{ message: 'Solicitud demasiado grande.' }] }));
        return;
      }
    }
    const { query, variables, operationName } = JSON.parse(body);
    if (typeof query !== 'string') {
      res.writeHead(400).end(JSON.stringify({ errors: [{ message: 'Falta la consulta GraphQL.' }] }));
      return;
    }
    const result = await graphql({ schema, source: query, rootValue, variableValues: variables, operationName });
    res.writeHead(result.errors ? 400 : 200).end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(400).end(JSON.stringify({ errors: [{ message: error.message }] }));
  }
}).listen(PORT, () => {
  console.log(`GraphQL listo en http://localhost:${PORT}/graphql`);
});
