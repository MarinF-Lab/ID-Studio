# ID Studio — DESIGN.md

**Concepto:** *Capas con profundidad, en escenas.*
La web se recorre como una secuencia de cinco escenas a pantalla completa (sin scroll
infinito). La profundidad no viene de modelos 3D sino de **capas planas** a distintas
alturas, con sombras suaves y movimiento con **física de resorte**. Cada escena tiene
su propia forma de interacción.

**Prohibido:** modelos 3D tipo CGI, glassmorphism, orbes difusos, texto con degradado,
emoji como iconos, tarjetas idénticas en fila, scroll infinito.

---

## Escenas

| # | Escena | Interacción |
|---|---|---|
| 1 | Inicio | Capas con parallax (cursor) + **terminal interactiva** (`ayuda`, `servicios`, `portafolio`, `proceso`, `contacto`, `proyectos`, `limpiar`) |
| 2 | Servicios | **Selector** que desarma y recompone la escena de la derecha; "Cotizar esto" preselecciona el formulario |
| 3 | Portafolio | **Arco** de tarjetas arrastrable con inercia + **filtros** por categoría. Datos en `projects.js` |
| 4 | Proceso | **Línea de tiempo arrastrable** (4 etapas); los entregables se desplazan según su profundidad |
| 5 | Contacto | **Formulario por pasos** (tipo → plazo → datos → resumen) |

**Navegación:** rueda/trackpad (un gesto = una escena, se ignora la inercia), deslizar en
móvil, ↑/↓/PageUp/PageDown/Espacio, puntos laterales, menú y `#hash` por escena.
Si una escena es más alta que la pantalla, primero se recorre por dentro.

**Transición entre escenas:** cada elemento con clase `.t` y `data-z` (0–1) sale y entra
con un desplazamiento proporcional a su profundidad: lo cercano viaja más. Salida
`cubic-bezier(.55,0,.75,.2)` ~0.5–0.7 s; entrada `cubic-bezier(.16,1,.3,1)` 0.98 s con
retraso escalonado por `data-z`. La dirección se invierte al retroceder.

## Color (tema oscuro único)

| Token | Valor | Rol |
|---|---|---|
| `--bg` | `#0A1120` | Fondo |
| `--bg-2` / `--bg-3` / `--bg-4` | `#111A2C` / `#182339` / `#202D47` | Superficies por nivel de elevación |
| `--ink` / `--ink-2` / `--ink-3` | `#EDF2F7` / `#9AAABD` / `#62738A` | Texto principal, secundario, terciario |
| `--line` | `#223049` | Bordes de 1px |
| `--signal` | `#F95A8A` | Acción principal, foco, acentos de marca |
| `--violet` | `#7B5CFF` | Webs y tiendas, luz ambiental |
| `--online` | `#3EE6C4` | Estado "en producción", mantenimiento |
| `--amber` | `#FFB547` | Estado "beta", cinta "Hecho en Chile" |
| `--blue` | `#4F86E8` | Proceso, ejemplos de app |

## Tipografía

- **Display:** Archivo expandida (`wdth 112`, 800–900), interlineado .95, tracking −0.03em.
- **Texto:** Inter 400/500/600, base 17px.
- **Mono:** JetBrains Mono — etiquetas, terminal, contadores.

## Profundidad y forma

- **Sombra natural en tres capas**, escalada por `--d` (profundidad 0–1.4):
  contacto (1px) + media + ambiente amplia. Más profundidad = sombra más grande y suave.
- Brillo superior `inset 0 1px 0 rgba(255,255,255,.06)` y borde `inset 0 0 0 1px var(--line)`.
- Radios: 16px tarjetas, 22px paneles grandes, 999px botones y chips.

## Movimiento

- Resorte amortiguado (`Spring`: rigidez 60–140, amortiguación 14–20) para parallax,
  arrastres y encaje; nada usa interpolación lineal.
- Los bucles de animación corren solo en la escena activa y con la pestaña visible.
- `prefers-reduced-motion`: transiciones como fundido corto, sin parallax ni flotación.
