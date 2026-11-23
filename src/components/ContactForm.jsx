import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { crearContacto, consultarContactos, buscarContactos } from '../services/contactGraphql';

export default function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { nombre: '', correo: '', mensaje: '' },
  });
  const [contactos, setContactos] = useState([]);
  const [consultando, setConsultando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');
  const [errorServidor, setErrorServidor] = useState('');
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const [campoBusqueda, setCampoBusqueda] = useState('NOMBRE');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroAplicado, setFiltroAplicado] = useState(null);

  async function onSubmit(datos) {
    setErrorServidor('');
    setMensajeEstado('');
    try {
      await crearContacto(datos);
      reset();
      setMensajeEstado('Mensaje guardado mediante una mutation de GraphQL.');
      // Si ya se consultó la lista, actualiza los resultados visibles.
      if (consultaRealizada) {
        if (filtroAplicado) {
          setContactos(await buscarContactos(filtroAplicado.campo, filtroAplicado.termino));
        } else {
          setContactos(await consultarContactos());
        }
      }
    } catch (error) {
      setErrorServidor(error.message);
    }
  }

  async function onConsultar() {
    setConsultando(true);
    setErrorServidor('');
    try {
      setContactos(await consultarContactos());
      setFiltroAplicado(null);
      setTerminoBusqueda('');
      setConsultaRealizada(true);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setConsultando(false);
    }
  }

  async function onBuscar(evento) {
    evento.preventDefault();
    const termino = terminoBusqueda.trim();
    if (!termino) {
      setErrorServidor('Escribe un valor para buscar.');
      return;
    }
    setConsultando(true);
    setErrorServidor('');
    try {
      const resultados = await buscarContactos(campoBusqueda, termino);
      setContactos(resultados);
      setFiltroAplicado({ campo: campoBusqueda, termino });
      setConsultaRealizada(true);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setConsultando(false);
    }
  }

  return (
    <section className="contact-panel">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="contact-form">
        <h2>Contacto con GraphQL</h2>
        <p className="contact-intro">Guarda un mensaje y consulta tus registros en esta misma pantalla.</p>
        <div className="field">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" placeholder="Tu nombre" aria-invalid={!!errors.nombre} {...register('nombre', {
            required: 'El nombre es obligatorio',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            maxLength: { value: 100, message: 'Máximo 100 caracteres' },
          })} />
          {errors.nombre && <p className="field-error" role="alert">{errors.nombre.message}</p>}
        </div>
        <div className="field">
          <label htmlFor="correo">Correo</label>
          <input id="correo" type="email" placeholder="correo@ejemplo.com" aria-invalid={!!errors.correo} {...register('correo', {
            required: 'El correo es obligatorio',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo no válido' },
          })} />
          {errors.correo && <p className="field-error" role="alert">{errors.correo.message}</p>}
        </div>
        <div className="field">
          <label htmlFor="mensaje">Mensaje</label>
          <textarea id="mensaje" rows="4" placeholder="Escribe tu mensaje..." aria-invalid={!!errors.mensaje} {...register('mensaje', {
            required: 'El mensaje es obligatorio',
            minLength: { value: 10, message: 'Mínimo 10 caracteres' },
            maxLength: { value: 2000, message: 'Máximo 2000 caracteres' },
          })} />
          {errors.mensaje && <p className="field-error" role="alert">{errors.mensaje.message}</p>}
        </div>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Enviar mensaje (Mutation)'}
        </button>
        {mensajeEstado && <p className="success-message" role="status">{mensajeEstado}</p>}
        {errorServidor && <p className="field-error" role="alert">{errorServidor}</p>}
      </form>

      <div className="contact-results">
        <div className="results-heading">
          <div>
            <h3>Consultar mensajes</h3>
            <p>Query GraphQL: <code>{filtroAplicado ? 'buscarContactos' : 'contactos'}</code></p>
          </div>
          <button type="button" className="secondary-button" disabled={consultando} onClick={onConsultar}>
            {consultando ? 'Consultando...' : 'Consultar con GraphQL'}
          </button>
        </div>
        <form className="search-form" onSubmit={onBuscar}>
          <label htmlFor="campo-busqueda">Buscar por</label>
          <div className="search-row">
            <select id="campo-busqueda" value={campoBusqueda} onChange={(e) => setCampoBusqueda(e.target.value)} aria-label="Campo de búsqueda">
              <option value="NOMBRE">Nombre</option>
              <option value="CORREO">Correo</option>
              <option value="ID">ID de registro</option>
            </select>
            <input value={terminoBusqueda} onChange={(e) => setTerminoBusqueda(e.target.value)} placeholder="Escribe el dato a buscar" aria-label="Valor de búsqueda" />
            <button type="submit" className="secondary-button" disabled={consultando}>
              {consultando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
        {filtroAplicado && <p className="search-summary">Filtro: {filtroAplicado.campo.toLowerCase()} contiene «{filtroAplicado.termino}». {contactos.length} resultado(s).</p>}
        {!consultaRealizada ? (
          <p className="empty-note">Presiona «Consultar con GraphQL» para ver los mensajes registrados.</p>
        ) : contactos.length === 0 ? (
          <p className="empty-note">{filtroAplicado ? 'No se encontraron registros para esta búsqueda.' : 'Todavía no hay mensajes guardados.'}</p>
        ) : (
          <ul className="contact-list">
            {contactos.map((contacto) => (
              <li key={contacto.id} className="contact-item">
                <div className="contact-item-head">
                  <strong>{contacto.nombre}</strong>
                  <time dateTime={contacto.fecha}>{new Date(contacto.fecha).toLocaleString('es-EC')}</time>
                </div>
                <span className="contact-email">{contacto.correo}</span>
                <p className="contact-message">{contacto.mensaje}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
