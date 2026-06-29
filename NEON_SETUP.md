# Circularia: Neon y login

## Variables en Vercel

En el proyecto de Vercel, ir a `Settings -> Environment Variables` y agregar:

```text
DATABASE_URL=postgresql://...
SESSION_SECRET=una_clave_larga_aleatoria
SETUP_SECRET=una_clave_temporal_para_crear_el_primer_usuario
```

`DATABASE_URL` sale de Neon. Usar la connection string con SSL.

Para generar `SESSION_SECRET` localmente:

```bash
openssl rand -base64 32
```

## Crear el primer usuario

Despues de redeployar con las variables cargadas, crear el primer usuario llamando al endpoint de setup:

```bash
curl -X POST https://TU-URL-DE-VERCEL/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "setupSecret": "TU_SETUP_SECRET",
    "email": "tu@email.com",
    "password": "contraseña-segura",
    "name": "Tu nombre"
  }'
```

El endpoint crea la tabla `users` automaticamente y solo permite crear usuario si la tabla esta vacia.

Cuando el primer usuario ya exista, borrar `SETUP_SECRET` de Vercel y hacer un redeploy. Asi el endpoint de setup queda desactivado.

## Ingreso

La app queda protegida por sesion. Al entrar a `/`, si no hay sesion activa, redirige a:

```text
/login
```

Para salir, usar el boton `Salir` en la navegacion.

## Diagnosticos guardados

La app crea automaticamente una tabla `diagnostics` cuando el usuario guarda su primera evaluacion.

Cada diagnostico queda asociado al usuario logueado e incluye:

- ficha del proyecto
- respuestas seleccionadas
- resumen por etapa
- totales ambiental, economico y social

En la app, usar `Guardar diagnostico` desde la evaluacion. Luego entrar a `Portafolio` para ver los diagnosticos guardados en Neon.

## Roles y revision

Los usuarios tienen un `role`:

- `designer`: crea proyectos/evaluaciones, cambia estados y resuelve comentarios.
- `admin`: gestiona usuarios, ve todos los proyectos y puede operar el workflow.
- `finance`: revisa proyectos en estado `En revision` y comenta.
- `marketing`: revisa proyectos en estado `En revision` y comenta.
- `sustainability`: revisa proyectos en estado `En revision` y comenta.
- `operations`: revisa proyectos en estado `En revision` y comenta.

Estados de proyecto:

- `En progreso`: visible solo para diseño.
- `En revision`: visible para perfiles revisores, que pueden comentar.
- `Aprobada`: visible para revisión como proyecto ya aprobado.

## Administracion de usuarios

La app tiene una vista `Equipo` para listar usuarios, crear nuevos usuarios y cambiar roles. Si todavia no existe ningun `admin`, una cuenta `designer` puede entrar a `Equipo` y crear el primer usuario admin.

Despues de que exista un admin, solo `admin` puede gestionar usuarios.

Tambien se puede crear un usuario por API:

```bash
curl -X POST https://TU-URL-DE-VERCEL/api/users \
  -H "Content-Type: application/json" \
  -b "circularia_session=COOKIE_DE_SESION" \
  -d '{
    "email": "finanzas@empresa.com",
    "password": "contraseña-segura",
    "name": "Finanzas",
    "role": "finance"
  }'
```

Roles validos:

```text
admin
designer
finance
marketing
sustainability
operations
```
