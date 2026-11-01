# Sergio Torres Carpintería — Sitio estático para Netlify

Web comercial separada en **HTML + CSS + JavaScript**, sin Node.js, sin API privada ni base de datos.
Los visitantes ven la página en Netlify; los contenidos se editan desde **Pages CMS**, que guarda cambios en **GitHub**.

## Organización

```text
sergio-torres-netlify/
├── index.html             # Página para los clientes
├── assets/
│   ├── site.css           # Diseño adaptable a celular
│   ├── site.js            # Interacciones y lectura de contenido
│   ├── logo.svg
│   └── *-placeholder.svg   # Fotos alternativas
├── data/
│   ├── site.json          # Nombre, textos, contacto, imágenes portada
│   ├── services.json      # Servicios ofrecidos
│   └── projects.json      # Catálogo y galería
├── media/                 # Fotos que se suben desde Pages CMS
├── admin/index.html       # Acceso informativo a Pages CMS
├── .pages.yml             # Configuración del editor visual
├── netlify.toml           # Publicación estática en Netlify
└── README.md
```

## 1. Probar desde tu computadora

1. Abrí la carpeta en VS Code.
2. Usá la extensión **Live Server** para abrir `index.html`. Alternativa, desde una terminal situada en la carpeta:

   ```powershell
   python -m http.server 8000
   ```

3. Visitá `http://localhost:8000`.

**No abras el HTML haciendo doble clic**: los navegadores pueden bloquear `fetch` de archivos JSON cuando usás `file://`. No hace falta ejecutar `npm install` ni `npm start`.

## 2. Publicar en Netlify desde GitHub (recomendado)

1. Creá un repositorio nuevo en https://github.com/new, por ejemplo `sergio-torres-carpinteria`.
2. Subí **todo el contenido de esta carpeta**, incluidos los archivos ocultos `.pages.yml` y `.gitignore` (el archivo `.pages.yml` es necesario para administrar el sitio).
   Desde VS Code podés inicializar y publicar con la interfaz de Source Control. Con Git por consola, ya dentro de la carpeta:

   ```powershell
   git init
   git add .
   git commit -m "Primera versión Sergio Torres Carpintería"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/sergio-torres-carpinteria.git
   git push -u origin main
   ```

   Reemplazá `TU-USUARIO` y creá antes el repositorio vacío en GitHub. Si usás la interfaz de VS Code, no necesitás pegar estos comandos.
3. Abrí https://app.netlify.com/, elegí **Add new project → Import an existing project** y conectá GitHub.
4. Seleccioná el repositorio; Netlify detectará `netlify.toml`. No hay comando de compilación; **Publish directory: `.`** (raíz).
5. Publicá. Tendrás una URL del tipo `https://nombre-del-sitio.netlify.app`.

**Importante:** para recibir actualizaciones del administrador, conectá el sitio de Netlify al repositorio GitHub. Arrastrar el ZIP a Netlify Drop sirve para mostrar una demo, pero **no** configura las publicaciones automáticas desde Pages CMS.

## 3. Administrar sin tocar el código

1. Entrá a https://app.pagescms.org/.
2. Iniciá sesión con **GitHub**.
3. Autorizá/instalá la aplicación de Pages CMS para el repositorio (solo se hace una vez).
4. Abrí el repositorio `sergio-torres-carpinteria`.
5. Verás tres secciones configuradas por `.pages.yml`:

   - **01 · Presentación y contacto:** textos de portada, fotos principales, teléfono, Instagram, correo y ciudad.
   - **02 · Servicios:** agregá, corregí o quitá servicios.
   - **03 · Trabajos y fotografías:** agregá trabajos, subí foto principal y fotos adicionales, categoría, descripción y visibilidad.

6. Guardá los cambios: Pages CMS crea un cambio en GitHub y **Netlify vuelve a publicar automáticamente**. No hay que tocar HTML/CSS/JS.

También hay un acceso informativo en `https://TU-SITIO.netlify.app/admin/` que abre Pages CMS; la autenticación sucede en GitHub/Pages CMS, **no dentro de Netlify**.

## 4. Configurar WhatsApp y usar el formulario

Abrí **01 · Presentación y contacto**, campo `WhatsApp`, y escribí el número internacional completo, **solo cifras**, con el código de Argentina `54` y el `9` para líneas móviles. Ejemplo de formato **ficticio**: `54911XXXXXXXX` (reemplazá las X por el número real, sin espacios ni signos). Hasta que lo configures, la web no podrá abrir el WhatsApp real.

El formulario prepara un mensaje que el visitante revisa y envía desde WhatsApp: **no guarda datos en una base de datos**, no realiza envíos automáticos ni manda mensajes sin que la persona confirme en WhatsApp.

## 5. Cambiar las fotografías de ejemplo

Las fotos de portada y de galería iniciales se muestran como **inspiración**, no como obras realizadas. Las tarjetas de ejemplo incluyen una etiqueta “IMAGEN ILUSTRATIVA”.

Desde Pages CMS, reemplazá las imágenes por fotografías propias, y en cada trabajo real desmarcá **Es una imagen ilustrativa**.

Para velocidad, conviene subir imágenes **JPG o WebP comprimidas**, idealmente por debajo de 500 KB a 1 MB cada una. Los archivos se guardan en `media/` del repositorio. Evitá subir videos pesados allí.

## 6. Cuestiones importantes

- **Sin servidor activo:** todo el sitio puede servirse desde Netlify de forma estática.
- **Panel en servicio externo:** Pages CMS no está hospedado por esta web. Depende de su servicio y de GitHub.
- **Las modificaciones no son instantáneas:** se ven cuando termina la nueva publicación de Netlify.
- **Derechos de edición:** solo las cuentas autorizadas para editar el repositorio pueden modificar contenido mediante Pages CMS.
- **No hay carrito de compra ni registro de usuarios**: es un catálogo de trabajos con consultas por WhatsApp.
- **Límites:** se aplican los términos y cuotas gratuitas vigentes de GitHub, Netlify y Pages CMS.
- **Imágenes de ejemplo:** pueden depender de Unsplash para cargar en la web; si no hay conexión o se bloquean, se verán imágenes alternativas (o un fondo). Conviene reemplazarlas por fotografías propias.

Documentación: https://pagescms.org/docs/quick-start/ · https://docs.netlify.com/deploy/create-deploys/
