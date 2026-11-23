// GraphQL de contactos: independiente de la API meteorológica.
async function ejecutarGraphQL(query, variables = {}) {
  const respuesta = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  let resultado;
  try {
    resultado = await respuesta.json();
  } catch {
    throw new Error('No se pudo conectar con el servidor GraphQL. Comprueba que está iniciado.');
  }
  if (resultado.errors?.length) throw new Error(resultado.errors[0].message);
  if (!respuesta.ok) throw new Error('Error al consultar GraphQL.');
  return resultado.data;
}

export async function crearContacto(input) {
  const data = await ejecutarGraphQL(`
    mutation CrearContacto($input: ContactoInput!) {
      crearContacto(input: $input) { id nombre correo mensaje fecha }
    }
  `, { input });
  return data.crearContacto;
}

export async function consultarContactos() {
  const data = await ejecutarGraphQL(`
    query ConsultarContactos {
      contactos { id nombre correo mensaje fecha }
    }
  `);
  return data.contactos;
}

export async function buscarContactos(campo, termino) {
  const data = await ejecutarGraphQL(`
    query BuscarContactos($campo: CampoBusqueda!, $termino: String!) {
      buscarContactos(campo: $campo, termino: $termino) {
        id nombre correo mensaje fecha
      }
    }
  `, { campo, termino });
  return data.buscarContactos;
}
