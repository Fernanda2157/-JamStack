import { useForm } from 'react-hook-form'

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', message: '' },
  })

  const onSubmit = (data) => {
    console.log('Datos enviados:', data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          {...register('name', {
            required: 'El nombre es obligatorio',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
          })}
        />
        {errors.name && <p role="alert">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'El correo es obligatorio',
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: 'Correo no válido',
            },
          })}
        />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="message">Mensaje</label>
        <textarea
          id="message"
          {...register('message', {
            required: 'El mensaje es obligatorio',
            minLength: { value: 10, message: 'Mínimo 10 caracteres' },
          })}
        />
        {errors.message && <p role="alert">{errors.message.message}</p>}
      </div>

      <button type="submit">Enviar</button>
    </form>
  )
}