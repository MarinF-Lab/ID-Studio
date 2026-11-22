# ID Studio — DESIGN.md

**Concepto:** *Terminal editorial × Centro de operaciones.*
Una publicación técnica impresa que se escribe sola en vivo, dentro de una sala
de control. Cada proyecto es un sistema "online" que se monitorea; cada sección
es un capítulo numerado. La personalidad sale de la marca: el prompt `>_` y el globo.

**Referencias estudiadas (Firecrawl, nov 2026):**
- basement.studio — radio 0, un solo color de señal, contadores mono "Online (8)".
- missioncontrol.co — titular gigante con tracking negativo, aire generoso.
- noise.safaririot.com — portafolio como índice: nombres enormes en contorno + metadatos mono.

Se toma el patrón, no el look: ningún sitio se copia.

**Prohibido:** glassmorphism, orbes difusos, texto con degradado, tarjetas redondeadas
idénticas, emoji como iconos, todo centrado.

---

## Color

| Token | Oscuro (por defecto) | Claro | Rol |
|---|---|---|---|
| `--bg` | `#0A1220` | `#ECE8E1` | Fondo ("noche de sala de control" / "papel") |
| `--bg-2` | `#101B2E` | `#E2DDD4` | Bandas y paneles |
| `--ink` | `#E9EEF3` | `#0A1220` | Texto principal |
| `--ink-2` | `#8FA3B5` | `#4A5A6B` | Texto secundario, metadatos |
| `--line` | `#22324A` | `#C9C2B6` | Retícula, filetes de 1px |
| `--signal` | `#F95A8A` | `#C8235A` | **Color de señal**: acción principal, cursor, foco, pings |
| `--steel` | `#8FAFC0` | `#4F7286` | Globo, datos, enlaces secundarios |
| `--online` | `#3EE6C4` | `#0F8F75` | Estado "en producción" (solo indicadores) |
| `--amber` | `#FFB547` | `#A86400` | Estado "beta", avisos, cinta destacada |
| `--violet` | `#7B5CFF` | `#5A3FE0` | Solo bloques de color sólidos (nunca degradado) |

Reglas: un color de señal por pantalla; los demás acentos solo como **bloques sólidos**
o indicadores. Contraste de texto ≥ 4.5:1 en ambos temas.

## Tipografía

- **Display:** *Archivo* expandida (`wdth 125`, peso 800–900). Titulares en mayúsculas,
  `letter-spacing: -0.02em`, interlineado 0.9.
- **Mono:** *JetBrains Mono* 400/600 — metadatos, contadores, etiquetas, ticker.
- **Texto:** *Inter* 400/500, 17px base, líneas de 60–70 caracteres.

Escala: 12 · 14 · 17 · 22 · 32 · 56 · 96 · clamp(64px, 11vw, 176px).

## Espacio y forma

- Base 8px. Secciones con padding 96px (escritorio) / 56px (móvil). Ancho de contenido 1320px.
- **Radio 0** en todo. Excepción: indicadores de estado (círculos de 8px).
- Sin sombras difusas. Profundidad = filetes de 1px, bloques de color y desplazamiento duro (6px) en hover.

## Componentes

- **Botón primario:** bloque `--signal`, texto `--bg`, mayúsculas mono 14px, radio 0.
  Hover: desplazamiento -3px/-3px con sombra dura `--ink`. Foco: contorno 2px `--steel`.
- **Botón secundario:** borde 1px `--ink`, transparente. Hover: relleno `--ink`, texto `--bg`.
- **Enlace:** subrayado 1px, offset 4px; hover → `--signal`.
- **Etiqueta mono:** `[ TEXTO ]` o `01 / 05`, 12px, `--ink-2`.
- **Ticker de estado (arriba):** franja mono con hora de Santiago, coordenadas y "SISTEMAS ONLINE (n)".
- **Índice de portafolio:** filas a todo el ancho; nombre en display contorno → relleno `--signal` al hover;
  a la derecha metadatos mono (categoría, stack, estado, enlace). Vista previa sigue al cursor.
- **Navegación:** barra superior plana con filete inferior, contadores mono "Portafolio (11)".

## Imagen y movimiento

- **Globo de puntos** (Three.js / canvas) en `--steel`, con pings `--signal` sobre Chile y etiquetas
  de proyectos tipo HUD. Es la única pieza 3D.
- Iconos: trazo 1.5px, geométricos, sin rellenos.
- Movimiento (GSAP): titulares que se "teclean" con cursor `>_`, filas que entran por máscara,
  contadores que suben. Curva `cubic-bezier(.16,1,.3,1)`, 0.6–0.9s. Todo se desactiva con
  `prefers-reduced-motion`.
