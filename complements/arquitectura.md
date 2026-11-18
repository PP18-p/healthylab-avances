# Arquitectura de HealthyLab

## 1. Qué es
HealthyLab es una aplicación web que ofrece un catálogo de recetas saludables, con su información nutricional y herramientas para planificar las comidas, para que cualquier persona pueda cuidar su alimentación sin tener que pagar por un nutricionista.

**Tecnologías:**
- **Cliente:** React con Vite (carpeta `client/`).
- **Servidor:** Node.js con Express y Mongoose (carpeta `server/`).
- **Base de datos:** MongoDB Atlas, plan gratuito M0 (base `healthylab`).

## 2. Qué hace
### Imprescindible (MVP)
- Ver recetas.
- Ver ingredientes y preparación.
- Cambiar porciones.
- Revisar información nutricional de las recetas.
- Clasificar recetas (desayuno, almuerzo, cena) y buscarlas por nombre.
- Crear una cuenta e iniciar sesión.

### Deseable
- Agregar favoritos.
- Ver opciones de sustituir ingredientes.
- Escuchar recetas (lectura en voz alta).
- Buscar recetas en base a los ingredientes que se tienen ("¿Qué cocino hoy?").
- Lista de compras y planificador semanal.
- Modo cocina paso a paso, con temporizador.
- Valorar y comentar recetas.
- Panel de administración con estadísticas de visitas.
- Modo oscuro y texto ampliado.

### Fuera de alcance por ahora
- Que las personas agreguen sus propias recetas.
- Que el administrador agregue o edite recetas desde el panel (el servidor ya tiene las rutas preparadas, pero aún no están conectadas).
- Envío real del formulario de contacto.

## 3. Historias de usuario
### Historia 1: consultar recetas y su valor nutricional
Como alguien que quiere cuidar su alimentación, quiero poder acceder a recetas y revisar su valor nutricional, para no tener que depender de un nutricionista.

**Lista cuando:**
- Con sesión iniciada, en `/recetas` se ven todas las recetas con su foto y nombre.
- Se pueden filtrar por desayuno, almuerzo o cena, y buscar por nombre.
- Al abrir una receta se ven los ingredientes, la preparación y las calorías, proteínas, carbohidratos y grasas por porción.
- Al cambiar las porciones, las cantidades de los ingredientes se recalculan.
- Si la búsqueda no encuentra nada, aparece un mensaje que lo explica.

### Historia 2: guardar mis recetas y planificar
Como usuario registrado, quiero guardar mis recetas favoritas, armar una lista de compras y un plan semanal, para organizar mis comidas.

**Lista cuando:**
- Al tocar el corazón, la receta queda en favoritos.
- Los ingredientes de una receta se pueden agregar a la lista de compras.
- Se puede elegir una receta para cada comida de la semana.
- Al recargar la página o entrar desde otro navegador, los favoritos, la lista y el plan siguen ahí (se guardan en la base de datos).

### Historia 3: valorar una receta
Como usuario registrado, quiero dar estrellas y comentar una receta, para compartir mi opinión con otras personas.

**Lista cuando:**
- Se pueden elegir de 1 a 5 estrellas y escribir un comentario de 5 a 300 caracteres.
- La valoración se publica con el nombre de mi cuenta.
- Todas las personas ven las mismas valoraciones y el promedio de estrellas.

### Historia 4: administrar el sitio
Como administrador, quiero ver las estadísticas de visitas y gestionar las cuentas y valoraciones, para mantener el sitio en orden.

**Lista cuando:**
- Solo la cuenta de administrador puede entrar a `/admin`.
- Se ven las visitas, los dispositivos y las personas conectadas en este momento.
- Se puede suspender, reactivar o eliminar una cuenta, y generarle una contraseña temporal.
- Se pueden eliminar valoraciones inapropiadas.

## 4. Roles
| Rol | Qué puede hacer | Qué no |
|-----|-----------------|--------|
| Visitante (sin sesión) | Ver la página de inicio, crear una cuenta e iniciar sesión | Ver las recetas, guardar datos o valorar |
| Usuario | Ver recetas, guardar favoritos, lista de compras y plan, valorar recetas, usar el modo cocina y las herramientas | Entrar al panel, ver o modificar datos de otros usuarios, agregar recetas |
| Administrador | Todo lo del usuario, más ver estadísticas, administrar cuentas, eliminar valoraciones y cambiar su contraseña | Ver las contraseñas de los usuarios (se guardan cifradas), compartir datos personales |

## 5. Modelo de datos
Base de datos `healthylab` en MongoDB Atlas. Las recetas están en el cliente (`client/src/data/recetas.js`) y se identifican por su posición (0, 1, 2...).

### Colección: usuarios
| Campo | Tipo | ¿Obligatorio? | Ejemplo |
|-------|------|---------------|---------|
| nombre | String (3 a 60) | Sí | "Ana Pérez" |
| correo | String, único, en minúsculas | Sí | "ana@correo.com" |
| hash | String (bcrypt), nunca se envía al cliente | Sí | "$2b$12$..." |
| rol | "usuario" o "admin" | Sí (por defecto "usuario") | "usuario" |
| estado | "activo" o "suspendido" | Sí (por defecto "activo") | "activo" |
| ultimo | Date | No | 2026-11-18T12:00:00Z |
| accesos | Number | No (por defecto 0) | 5 |
| favs | [Number] | No | [0, 3, 7] |
| lista | [{ nombre, cant, uni, ok }] | No | [{ "nombre": "avena", "cant": 80, "uni": "g", "ok": false }] |
| plan | Objeto "día-comida": receta | No | { "0-0": "1", "2-1": "4" } |
| createdAt / updatedAt | Date (automáticos) | Sí | 2026-11-04T20:54:08Z |

### Colección: resenas
| Campo | Tipo | ¿Obligatorio? | Ejemplo |
|-------|------|---------------|---------|
| receta | Number (posición de la receta) | Sí | 0 |
| usuario | ObjectId (referencia a usuarios) | No (null si la cuenta se eliminó) | "6729f1..." |
| nombre | String (nombre de la cuenta al publicar) | Sí | "Ana Pérez" |
| estrellas | Number (1 a 5) | Sí | 5 |
| texto | String (5 a 300) | Sí | "Muy rica y fácil" |
| createdAt | Date (automático) | Sí | 2026-11-12T21:20:00Z |

### Colección: visitas
Se borran solas a los 90 días (índice TTL).

| Campo | Tipo | ¿Obligatorio? | Ejemplo |
|-------|------|---------------|---------|
| fecha | Date | Sí | 2026-11-18T12:00:00Z |
| vid | String (identifica al navegador) | Sí | "a1b2c3d4e5" |
| sid | String (identifica la pestaña) | Sí | "f6g7h8i9" |
| pagina | String | Sí | "hlp.html" |
| disp | "Escritorio", "Móvil" o "Tablet" | No | "Móvil" |
| usuario | String (nombre, si hay sesión) | No | "Ana Pérez" |

### Colección: activos
Personas conectadas ahora. Cada registro se borra solo si no llega un "latido" en 2 minutos.

| Campo | Tipo | ¿Obligatorio? | Ejemplo |
|-------|------|---------------|---------|
| sid | String, único | Sí | "f6g7h8i9" |
| pagina | String | No | "hlp.html" |
| disp | String | No | "Escritorio" |
| usuario | String | No | "Ana Pérez" |
| fecha | Date (último latido) | Sí | 2026-11-18T12:00:30Z |

## 6. Endpoints
Todas las rutas empiezan con `/api` y responden `{ ok: true, ... }` o `{ ok: false, error }`.

| Historia | Verbo | Ruta | Devuelve | Códigos |
|----------|-------|------|----------|---------|
| Cuenta | POST | /auth/registro | La cuenta creada (no inicia sesión) | 201, 400, 409, 429 |
| Cuenta | POST | /auth/login | Rol y sesión; deja la cookie `hl_token` | 200, 400, 401, 403, 429 |
| Cuenta | GET | /auth/sesion | La sesión actual o `null` | 200 |
| Cuenta | POST | /auth/salir | Borra la cookie | 200 |
| 4 | PUT | /auth/clave-admin | Cambia la contraseña del admin | 200, 400, 401, 403 |
| 2 | GET | /estado | Favoritos, lista y plan de la cuenta | 200, 401 |
| 2 | PATCH | /estado | Guarda solo los campos enviados | 200, 400, 401 |
| 3 | GET | /resenas/:receta | Valoraciones de una receta | 200, 400, 401 |
| 3 | POST | /resenas | Publica una valoración con el nombre de la cuenta | 201, 400, 401, 429 |
| 4 | GET | /resenas/todas | Todas las valoraciones (admin) | 200, 401, 403 |
| 4 | DELETE | /resenas/:id | Elimina una valoración (admin) | 200, 403, 404 |
| 4 | GET | /cuentas | Lista de cuentas sin contraseñas (admin) | 200, 401, 403 |
| 4 | PATCH | /cuentas/:id/estado | Suspende o reactiva una cuenta (admin) | 200, 403, 404 |
| 4 | POST | /cuentas/:id/clave-temporal | Genera una contraseña temporal (admin) | 200, 403, 404 |
| 4 | DELETE | /cuentas/:id | Elimina la cuenta; sus reseñas quedan sin cuenta (admin) | 200, 403, 404 |
| 4 | POST | /visitas | Registra una visita | 201, 400, 429 |
| 4 | POST | /visitas/latido | Marca a la persona como conectada | 200, 400, 429 |
| 4 | POST | /visitas/quitar-activo | La quita al cerrar la pestaña (sendBeacon) | 200, 400 |
| 4 | GET | /visitas | Últimas visitas (admin) | 200, 401, 403 |
| 4 | GET | /visitas/conectados | Personas conectadas ahora (admin) | 200, 401, 403 |
| 4 | DELETE | /visitas | Reinicia las estadísticas (admin) | 200, 401, 403 |
| — | GET | /salud | Si el servidor y la base responden | 200 |

## 7. Pantallas y componentes
| Pantalla | Quién la ve | Endpoint | Estado vacío |
|----------|-------------|----------|--------------|
| Inicio (`/`) | Todos | POST /visitas | — |
| Login y registro (`/login`) | Todos (con sesión, redirige) | /auth/login, /auth/registro | Mensajes de error por campo |
| Recetas (`/recetas`): tarjetas, buscador y filtros | Usuario y admin | GET /estado | "No encontramos recetas con esa búsqueda..." |
| Ficha de receta (`RecetaModal`) | Usuario y admin | GET y POST /resenas | "Sé la primera persona en valorar esta receta." |
| Favoritos, lista de compras, plan y "¿Qué cocino hoy?" (`Herramientas`) | Usuario y admin | PATCH /estado | "Tu lista está vacía...", "Aún no tienes recetas guardadas...", "Ninguna receta coincide todavía..." |
| Modo cocina (`ModoCocina`) | Usuario y admin | — | — |
| Panel: Resumen y Visitas | Admin | GET /visitas, /visitas/conectados, /cuentas | "Todavía no hay visitas registradas." |
| Panel: Cuentas | Admin | /cuentas | "Aún no hay cuentas. Aparecerán aquí cuando alguien se registre..." |
| Panel: Valoraciones | Admin | GET /resenas/todas, DELETE /resenas/:id | "Aún no hay comentarios." |
| Panel: Ajustes | Admin | PUT /auth/clave-admin | — |

`RutaProtegida` impide entrar a `/recetas` sin sesión y a `/admin` sin ser administrador. `Seguimiento` registra las visitas y envía los latidos.

## 8. Recorrido de la historia principal
1. La persona entra a la página de inicio y pulsa **Únete**.
2. En `/login` crea su cuenta → `POST /auth/registro` guarda la contraseña cifrada con bcrypt en Atlas.
3. La app inicia sesión sola → `POST /auth/login` devuelve una cookie `httpOnly` con un token JWT.
4. Pasa a `/recetas` → `GET /estado` carga sus favoritos, lista y plan.
5. Busca o filtra una receta y la abre: ve ingredientes, preparación e información nutricional, y ajusta las porciones.
6. La guarda en favoritos y agrega sus ingredientes a la lista → `PATCH /estado`.
7. Deja una valoración → `POST /resenas`, que toma el nombre de su cuenta.
8. Al volver otro día, desde cualquier navegador, encuentra todo como lo dejó.

## 9. Decisiones y pendientes
**Decisiones**
- Decidí usar un servidor propio con Express y MongoDB Atlas, en lugar de localStorage, porque así los datos se comparten entre dispositivos y el administrador ve las valoraciones y visitas de todas las personas.
- Decidí guardar las contraseñas con **bcrypt** porque está diseñado para contraseñas; antes se usaba SHA-256 en el navegador y el hash del admin era visible en el código.
- Decidí guardar la sesión en una **cookie `httpOnly`** porque JavaScript no puede leerla, lo que la protege si alguien inyecta código en la página.
- Decidí limitar los intentos de login (5 por minuto) y de registro en el servidor, porque en el navegador ese límite se podía saltar borrando datos.
- Decidí que el nombre de las valoraciones salga de la cuenta, para que nadie publique con el nombre de otra persona.
- Decidí que las visitas se borren solas a los 90 días, para no llenar el plan gratuito de Atlas (512 MB).
- Decidí dejar el texto ampliado en el navegador, porque es una preferencia del dispositivo y no de la cuenta.
- Decidí que el cliente llame a `/api` a través del proxy de Vite, para que la cookie funcione sin configurar CORS.

**Pendientes**
- Conectar al panel las rutas para que el administrador agregue y edite recetas.
- Publicar el sitio en internet (hosting para el servidor y el cliente, y permitir esa IP en Atlas).
- Hacer que el formulario de contacto envíe los mensajes de verdad.
