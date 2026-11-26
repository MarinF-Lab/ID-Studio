// ── Portafolio · ID Studio ──
// Para añadir un proyecto, copia un bloque y edítalo.
//   k:      'gestion' | 'tiendas' | 'apps' | 'webs'   (filtro)
//   status: 'live' (En producción) | 'beta' | 'dev' (En desarrollo)
//   url:    enlace público (null = "Próximamente")
//   repo:   enlace al código (omitir para no mostrar el botón "Código")
window.PROJECTS = [
  {name:'ID Contable',cat:'SaaS contable',k:'gestion',status:'beta',color:'#F95A8A',desc:'Software contable para el mercado chileno. SaaS multi-cliente para estudios contables, con consultas al SII.',stack:['Firebase','JavaScript','SII'],url:'https://contapp-auditor.web.app'},
  {name:'Carnets',cat:'Escaneo OCR',k:'gestion',status:'live',color:'#4F86E8',desc:'Escanea carnets de trabajadores por contratista con lectura automática y exporta a PDF y ZIP.',stack:['Next.js','OCR','Firebase'],url:'https://carnets-a802e.web.app'},
  {name:'Asistencia',cat:'Control agrícola',k:'gestion',status:'live',color:'#2EC27E',desc:'Reemplaza la planilla Excel de asistencia de trabajadores agrícolas: control diario, justificaciones y feriados.',stack:['Next.js','Firebase','shadcn/ui'],url:'https://asistencia-1f39e.web.app'},
  {name:'STRIDE',cat:'Tienda online',k:'tiendas',status:'live',color:'#FF6B5A',desc:'Tienda de zapatos, bolsos y accesorios con panel de administración y portal de proveedores.',stack:['Firebase','JavaScript'],url:'https://tienda-647d4.web.app'},
  {name:'Eternal Garden',cat:'Taller y tienda',k:'tiendas',status:'live',color:'#D66BC4',desc:'Costos por flor, inventario de materiales por color, pedidos, pagos y tienda pública para un taller artesanal.',stack:['PWA','Firebase'],url:'https://marinf-lab.github.io/EternalGarden/'},
  {name:'Prisma',cat:'Herramienta de diseño',k:'apps',status:'live',color:'#9B6BFF',desc:'Crea y prueba combinaciones de color para web y apps, y guarda tus paletas con tu cuenta de Google.',stack:['Vite','Tailwind','Firebase'],url:'https://marinf-lab.github.io/Prisma/',repo:'https://github.com/MarinF-Lab/Prisma'},
  {name:'Kinetic',cat:'Simulador 3D',k:'apps',status:'beta',color:'#FFB547',desc:'Simulador de circuitos y mecanismos en vista isométrica 3D, en web y Android.',stack:['TypeScript','Vite','Android'],url:'https://marinf-lab.github.io/Simulador/',repo:'https://github.com/MarinF-Lab/Simulador'},
  {name:'Gestor de Ventas',cat:'Aluminios Vázquez',k:'gestion',status:'live',color:'#8FC3D9',desc:'Ventas, cotizaciones y costos para una aluminiería, instalable en el celular.',stack:['PWA','JavaScript'],url:'https://marinf-lab.github.io/Gestor-Ventas/'},
  {name:'Inventario',cat:'Maquinaria',k:'gestion',status:'live',color:'#F2C14E',desc:'Registro y control del inventario de maquinaria, disponible como app instalable.',stack:['PWA','JavaScript'],url:'https://marinf-lab.github.io/InventarioMaq/'},
  {name:'fly_vision.cl',cat:'Sitio web',k:'webs',status:'live',color:'#3BC7F0',desc:'Web de servicios de grabación FPV con dron DJI Avata 2.',stack:['HTML','CSS','Dominio propio'],url:'https://fly-vision.cl'},
  {name:'SIGEDUAL',cat:'Plataforma SaaS',k:'gestion',status:'dev',color:'#7C8BFF',desc:'Sistema Integral de Gestión Dual: cuentas, planes de suscripción, panel de control e invitaciones.',stack:['Next.js','TypeScript','Firebase'],url:null}
];
