export type ArticleBlock = { type: "p"; text: string } | { type: "ul"; items: string[] };

export type ArticleSection = {
  id: string;
  heading: string;
  blocks: ArticleBlock[];
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  intro: string;
  /** ISO date. */
  date: string;
  category: string;
  readMinutes: number;
  cover: { src: string; alt: string };
  sections: ArticleSection[];
  sources: { title: string; href: string }[];
};

const p = (text: string): ArticleBlock => ({ type: "p", text });
const ul = (...items: string[]): ArticleBlock => ({ type: "ul", items });

/** Entirely fictional content about taking part in an art fair. */
const ARTICLES: Article[] = [
  {
    slug: "montaje-del-stand",
    title: "Montaje del stand: qué esperar y cómo prepararte",
    excerpt: "Horarios, accesos y recomendaciones para que el montaje de tu stand salga sin contratiempos.",
    intro:
      "El montaje es la etapa más intensa de la feria. Con un plan claro, tu equipo puede entregar el stand listo antes de la apertura y sin sobresaltos.",
    date: "2026-09-14",
    category: "Montaje",
    readMinutes: 4,
    cover: { src: "/covers/montaje-del-stand.svg", alt: "Ilustración de un stand en montaje: paneles modulares azules con cuadros colgados, focos de riel, una escalera, una caja de herramientas y una cinta métrica" },
    sections: [
      {
        id: "antes-de-llegar",
        heading: "Antes de llegar al recinto",
        blocks: [
          p("Confirma con tu equipo quién será la persona responsable del montaje y comparte sus datos con la organización. Solo podrán ingresar personas acreditadas."),
          p("Revisa las medidas finales de tu stand y los puntos de conexión eléctrica disponibles. Cualquier cambio debe notificarse con al menos una semana de anticipación."),
          p("Define también un plan de trabajo por horas. Saber quién hace qué y en qué momento evita que el equipo se estorbe dentro de un espacio reducido."),
        ],
      },
      {
        id: "planos-y-medidas",
        heading: "Planos, medidas y layout",
        blocks: [
          p("Cada stand se entrega con paredes modulares de tres metros de altura y piso nivelado. Antes del montaje, dibuja un plano a escala con la ubicación de cada obra, los puntos de luz y las zonas de circulación."),
          p("Deja al menos ochenta centímetros libres frente a las obras de formato grande. Así los visitantes pueden mirarlas con comodidad y se reduce el riesgo de roces accidentales."),
          ul("Plano a escala con cotas en centímetros", "Ubicación de enchufes y salidas de luz", "Altura de colgado de cada obra", "Zona de atención y de almacenamiento"),
        ],
      },
      {
        id: "dia-de-montaje",
        heading: "El día de montaje",
        blocks: [
          p("Los accesos de carga abren desde las seis de la mañana. Cada galería tiene una franja horaria asignada para evitar congestión en los muelles."),
          p("Ten a mano los siguientes elementos:"),
          ul("Acreditaciones impresas del equipo", "Inventario de las obras con valores asegurados", "Herramientas básicas y elementos de sujeción", "Contacto de la persona de producción"),
          p("Si llegas fuera de tu franja, el personal de muelle podría pedirte esperar hasta que haya un espacio libre. Respetar el turno es la mejor forma de que todos terminen a tiempo."),
        ],
      },
      {
        id: "manejo-de-obras",
        heading: "Manejo y colgado de obras",
        blocks: [
          p("Desembala las piezas en una zona despejada y sobre superficies limpias. Conserva los embalajes, porque los necesitarás para el desmontaje y para posibles traslados intermedios."),
          p("Para colgar, utiliza sistemas de riel o ganchos certificados para el peso de cada obra. Evita clavos directos sobre las paredes modulares, ya que la organización puede cobrar reparaciones."),
          p("Las piezas escultóricas deben apoyarse sobre bases estables. Si alguna requiere refuerzo en el piso, avisa a producción antes de iniciar para que revisen la carga admitida."),
        ],
      },
      {
        id: "iluminacion",
        heading: "Iluminación y detalles finales",
        blocks: [
          p("La iluminación general del pabellón es neutra. Si tu propuesta requiere luces adicionales, solicita el servicio con anticipación para recibir asesoría técnica."),
          p("Al terminar, recorre el stand con una lista de verificación y toma fotografías del estado inicial. Esto facilita cualquier reclamación posterior."),
          ul("Orientar los focos para evitar reflejos en vidrios", "Probar todos los equipos audiovisuales", "Revisar etiquetas y cartelas de cada obra"),
        ],
      },
      {
        id: "seguridad-en-obra",
        heading: "Seguridad durante el montaje",
        blocks: [
          p("Todo el personal debe usar calzado cerrado y, en zonas de carga, casco y chaleco reflectivo. La organización dispone de puntos de entrega de elementos de protección en cada acceso."),
          p("Las escaleras y plataformas elevadoras solo pueden ser operadas por personal capacitado. Si necesitas trabajar en altura, coordina con producción para que te asignen apoyo."),
          p("Mantén libres los pasillos y las salidas de emergencia en todo momento. Una caja olvidada en el lugar equivocado puede detener el avance de toda la zona."),
        ],
      },
      {
        id: "residuos-y-limpieza",
        heading: "Residuos, embalajes y limpieza",
        blocks: [
          p("Cada galería es responsable de retirar sus residuos. Hay contenedores diferenciados para cartón, plástico y madera en los extremos de cada pabellón."),
          p("Los embalajes grandes pueden guardarse en el depósito común, siempre rotulados con el nombre de tu galería y el número de stand. Sin etiqueta, el personal podría moverlos o descartarlos."),
          ul("Cartón y papel en contenedor azul", "Plásticos y espumas en contenedor amarillo", "Madera y palés en la zona de reciclaje"),
        ],
      },
      {
        id: "revision-final",
        heading: "Revisión final antes de la apertura",
        blocks: [
          p("En la mañana de la inauguración, una persona de producción recorrerá cada stand para verificar que cumple las normas básicas. Si algo requiere ajuste, recibirás aviso para corregirlo a tiempo."),
          p("Aprovecha esa visita para resolver dudas sobre iluminación, rotulación o conexión eléctrica. Es el último momento en que los cambios son sencillos de hacer."),
          p("Antes de abrir, comprueba que todo el equipo conoce el plan del día, desde el horario de descanso hasta el protocolo ante cualquier incidente."),
        ],
      },
      {
        id: "desmontaje",
        heading: "Desmontaje",
        blocks: [
          p("El desmontaje comienza una vez finalizada la última jornada de visita. Retira las obras en el orden acordado y entrega el espacio limpio y sin residuos."),
          p("Revisa de nuevo el estado de cada pieza antes de embalarla y compáralo con las fotografías iniciales. Si detectas una novedad, repórtala de inmediato a la organización."),
          p("Al salir, entrega el stand a producción para una inspección final. Esa constancia es la que cierra tu participación en términos de montaje."),
        ],
      },
    ],
    sources: [
      { title: "Guía del expositor (ejemplo)", href: "https://example.com/guia-expositor" },
      { title: "Reglamento de montaje (ejemplo)", href: "https://example.org/reglamento-montaje" },
    ],
  },
  {
    slug: "fechas-clave",
    title: "Fechas clave de tu participación",
    excerpt: "Un calendario sencillo con los hitos que no te puedes perder, desde la inscripción hasta el cierre.",
    intro:
      "Organizar la participación es más fácil con un calendario a la vista. Aquí reunimos los hitos principales y lo que se espera de cada galería en cada etapa.",
    date: "2026-09-02",
    category: "Información",
    readMinutes: 3,
    cover: { src: "/covers/fechas-clave.svg", alt: "Ilustración de un calendario con días resaltados, un reloj despertador y una línea de tiempo con hitos y una bandera" },
    sections: [
      {
        id: "inscripcion",
        heading: "Inscripción y documentos",
        blocks: [
          p("La carga de documentos se hace desde tu espacio privado. Completa la información de tu marca y sube los archivos solicitados antes de la fecha límite."),
          ul("Descripción de la marca", "Logos en alta resolución", "Imágenes de las obras principales"),
          p("La inscripción se abre el 2 de febrero de 2026 y cierra el 31 de marzo del mismo año. Dejar el trámite para los últimos días aumenta el riesgo de errores en los archivos."),
        ],
      },
      {
        id: "pagos",
        heading: "Pagos y cronograma financiero",
        blocks: [
          p("El pago de la participación se divide en dos cuotas. La primera corresponde a la reserva del espacio y la segunda se liquida antes del envío de la documentación final."),
          p("Los pagos se habilitan solo después de recibir la confirmación de tu inscripción. Conserva siempre el comprobante, porque lo necesitarás para tu acreditación."),
          ul("Primera cuota: 30 de abril de 2026", "Segunda cuota: 30 de junio de 2026", "Plazo de ajustes por diferencias: 15 de julio de 2026"),
        ],
      },
      {
        id: "confirmaciones",
        heading: "Confirmaciones de tu inscripción",
        blocks: [
          p("Recibirás un correo de confirmación una vez revisemos tu documentación. Los pagos se habilitan después de esa confirmación."),
          p("Si falta algún archivo o hay dudas sobre un dato, te escribiremos con las observaciones. Tendrás cinco días hábiles para responder antes de que tu solicitud pase a lista de espera."),
          p("Una vez aprobada, tu galería aparecerá en el directorio de participantes. Revisa que el nombre y la descripción estén escritos como deseas que se publiquen."),
        ],
      },
      {
        id: "envio-de-documentos",
        heading: "Envío de documentos finales",
        blocks: [
          p("En el mes de agosto se solicita la documentación definitiva: inventario de obras, valores asegurados, datos del equipo y fichas técnicas. El plazo vence el 14 de agosto de 2026."),
          p("Cada obra debe llevar título, año, técnica, dimensiones y precio o indicación de consulta. Esta información alimenta el catálogo, por lo que conviene revisarla con detalle."),
          ul("Inventario en formato de hoja de cálculo", "Fichas técnicas de las obras", "Listado del equipo que ingresará al recinto"),
        ],
      },
      {
        id: "acreditaciones",
        heading: "Acreditaciones",
        blocks: [
          p("Cada galería recibe un número de acreditaciones según el tamaño de su espacio. Los nombres deben cargarse a más tardar el 1 de septiembre de 2026."),
          p("Las acreditaciones son personales e intransferibles, y se entregan en el punto de registro con documento de identidad. Si pierdes una, podrás solicitar una reposición con un costo menor."),
          p("Si necesitas más pases de los asignados, solicita una ampliación con tiempo. Se atienden por orden de llegada y según la capacidad del recinto."),
        ],
      },
      {
        id: "montaje-y-pruebas",
        heading: "Montaje y pruebas técnicas",
        blocks: [
          p("El montaje se realiza en los tres días previos a la apertura. Cada galería recibe una franja horaria que se confirma por correo con al menos dos semanas de anticipación."),
          p("El día anterior a la inauguración se hacen pruebas de iluminación y de conexión eléctrica. Si tienes equipos especiales, avísanos para programar tu revisión en el momento adecuado."),
          ul("Franjas de montaje: 5, 6 y 7 de octubre de 2026", "Pruebas técnicas: 7 de octubre de 2026", "Recorrido de producción: 8 de octubre de 2026"),
        ],
      },
      {
        id: "semana-de-feria",
        heading: "La semana de la feria",
        blocks: [
          p("Durante la semana de feria habrá jornadas para profesionales, coleccionistas y público general. Cada jornada tiene horarios y aforos distintos."),
          p("Te enviaremos el cronograma detallado unos días antes del inicio."),
          p("La inauguración está prevista para el 8 de octubre de 2026 y la feria se extiende hasta el 11 de octubre. Cada día se realizan reuniones breves de coordinación antes de abrir las puertas."),
        ],
      },
      {
        id: "cierre-y-balance",
        heading: "Cierre y balance",
        blocks: [
          p("El domingo 11 de octubre, al terminar la jornada, comienza el desmontaje. Los horarios de salida de obras se asignan por galería para mantener el orden en los muelles."),
          p("En las dos semanas siguientes recibirás una encuesta de satisfacción y un resumen con cifras generales de asistencia. Tus respuestas nos ayudan a mejorar la siguiente edición."),
          p("El balance final se publica a finales de noviembre de 2026. Allí encontrarás datos de visitantes, actividades y comentarios de los participantes."),
        ],
      },
    ],
    sources: [{ title: "Calendario general (ejemplo)", href: "https://example.com/calendario" }],
  },
  {
    slug: "logistica-y-transporte",
    title: "Logística y transporte de obras",
    excerpt: "Cómo coordinar el traslado, el embalaje y el seguro de tus obras hacia el recinto.",
    intro:
      "Mover obras de arte exige cuidado y coordinación. Estas recomendaciones te ayudarán a organizar el transporte y a proteger tu inventario.",
    date: "2026-08-21",
    category: "Logística",
    readMinutes: 4,
    cover: { src: "/covers/logistica-y-transporte.svg", alt: "Ilustración de un camión de transporte junto a cajas de embalaje con marca de frágil sobre una tarima, con una ruta punteada y pines de ubicación" },
    sections: [
      {
        id: "planeacion",
        heading: "Planeación del traslado",
        blocks: [
          p("Empieza por listar todas las obras que viajarán, con sus dimensiones y peso aproximado. Con esos datos podrás pedir cotizaciones comparables a distintos operadores."),
          p("Reserva el transporte con al menos seis semanas de anticipación. En temporada alta, los vehículos con control de clima y suspensión especial se agotan rápido."),
          ul("Inventario con medidas y pesos", "Fecha deseada de salida y de llegada", "Dirección de origen y punto de entrega"),
        ],
      },
      {
        id: "embalaje",
        heading: "Embalaje adecuado",
        blocks: [
          p("Usa materiales libres de ácido para el contacto directo con las obras y cajas rígidas para el traslado. Etiqueta cada pieza con un código que coincida con tu inventario."),
          p("Las pinturas se transportan en posición vertical y con protección en las esquinas. Las esculturas requieren bases de espuma a medida para repartir el peso y evitar vibraciones."),
          p("Marca en el exterior de cada caja el sentido de apertura y los puntos de agarre. Esa información reduce los errores cuando el personal descarga con prisa."),
        ],
      },
      {
        id: "transportistas",
        heading: "Transportistas y aduanas",
        blocks: [
          p("Si las obras llegan desde el exterior, trabaja con un agente aduanal con experiencia en arte. Los trámites pueden tardar varios días."),
          ul("Factura o documento de valor declarado", "Fotografías de cada obra", "Permisos de exportación temporal"),
          p("Pide siempre una confirmación escrita de las fechas de cruce y de los costos de almacenamiento temporal. Un retraso en la frontera puede alterar todo tu calendario."),
        ],
      },
      {
        id: "seguros",
        heading: "Seguros",
        blocks: [
          p("Las obras deben estar aseguradas durante el traslado y la permanencia en el recinto. Verifica que tu póliza cubra ambos tramos."),
          p("Declara los valores con base en una referencia reciente, como una tasación o una factura de venta. Un valor demasiado bajo puede dejar sin cobertura suficiente una pérdida parcial."),
          p("Guarda una copia de la póliza en formato digital y otra impresa dentro del vehículo. Así la tendrás disponible ante cualquier inspección o incidente en ruta."),
        ],
      },
      {
        id: "documentacion-de-viaje",
        heading: "Documentación de viaje",
        blocks: [
          p("Cada envío debe acompañarse de una lista de empaque, una copia del inventario y la información de contacto de la galería. Estos documentos viajan junto con la carga y no solo en formato digital."),
          p("Prepara un acta de salida firmada por quien entrega y por quien recibe en origen. Allí se anota el estado de cada obra, y ese registro sirve como referencia ante cualquier novedad."),
          ul("Lista de empaque por caja", "Copia de la póliza de seguro", "Acta de salida con fotografías"),
        ],
      },
      {
        id: "ruta-y-seguimiento",
        heading: "Ruta y seguimiento de la carga",
        blocks: [
          p("Pide a tu operador un plan de ruta con paradas y tiempos estimados. Los trayectos largos deben contemplar descansos y relevos del conductor para mantener la seguridad."),
          p("Solicita un enlace de seguimiento en tiempo real o, al menos, reportes de avance en puntos acordados. Con esa información puedes anticipar la llegada y avisar al muelle."),
          p("Define quién atenderá las llamadas del transportista durante el viaje. Tener una sola persona de contacto evita confusiones y respuestas contradictorias."),
        ],
      },
      {
        id: "recepcion",
        heading: "Recepción en el recinto",
        blocks: [
          p("A la llegada, un coordinador verificará el estado de cada caja contigo. Anota cualquier novedad en el acta de recepción."),
          p("Abre los embalajes solo en la zona indicada y deja que las cajas se aclimaten unas horas si hubo cambios fuertes de temperatura. Esto reduce el riesgo de condensación sobre las superficies."),
          p("Una vez revisadas, traslada las obras al stand siguiendo la ruta asignada. No dejes piezas en los pasillos, incluso por periodos cortos."),
        ],
      },
      {
        id: "almacenamiento",
        heading: "Almacenamiento temporal",
        blocks: [
          p("El recinto cuenta con un depósito vigilado para guardar embalajes y obras que no se exhiban todos los días. El espacio es limitado y se reserva por orden de solicitud."),
          p("Todo lo que ingrese al depósito debe estar rotulado con el nombre de la galería, el número de stand y un listado del contenido. El personal solo entrega materiales a quien figure en la autorización."),
          ul("Rotular cada caja con galería y stand", "Entregar un listado del contenido", "Registrar las salidas y devoluciones"),
        ],
      },
      {
        id: "retorno",
        heading: "Retorno de obras",
        blocks: [
          p("Programa el transporte de regreso desde antes de la feria. Los muelles se saturan al final, y quienes llegan sin cita pueden esperar varias horas para cargar."),
          p("Antes de cerrar cada caja, compara la pieza con las fotografías de ingreso y firma el acta de entrega. Si hay obras vendidas, confirma con el comprador la forma y la fecha de envío."),
          p("Tras el regreso a tu espacio, revisa de nuevo cada obra y conserva la documentación al menos doce meses. Será útil ante cualquier reclamación tardía con la aseguradora."),
        ],
      },
    ],
    sources: [],
  },
  {
    slug: "comunicacion-y-prensa",
    title: "Comunicación y prensa: cómo contar tu participación",
    excerpt: "Recursos y buenas prácticas para difundir tu presencia en la feria antes, durante y después.",
    intro:
      "Tu participación también se comunica. Con algunos recursos preparados con tiempo, puedes llegar a más coleccionistas y medios.",
    date: "2026-08-05",
    category: "Comunicación",
    readMinutes: 3,
    cover: { src: "/covers/comunicacion-y-prensa.svg", alt: "Ilustración de una cámara, un micrófono, una credencial de prensa, globos de diálogo y un periódico impreso" },
    sections: [
      {
        id: "estrategia",
        heading: "Define tu estrategia",
        blocks: [
          p("Antes de producir contenido, aclara qué quieres lograr: visibilidad para tus artistas, nuevos contactos o ventas directas. Cada objetivo pide mensajes y canales distintos."),
          p("Elige dos o tres ideas centrales y repítelas con coherencia en todos tus materiales. Un mensaje claro se recuerda más que una lista larga de datos."),
          ul("Objetivo principal de tu participación", "Públicos a los que quieres llegar", "Mensajes clave y tono de comunicación"),
        ],
      },
      {
        id: "kit-de-prensa",
        heading: "Kit de prensa",
        blocks: [
          p("Prepara un documento breve con la descripción de tu galería, los artistas que presentas y tres imágenes en alta resolución."),
          p("Incluye un texto de presentación de unas ciento cincuenta palabras y una cronología corta de la galería. Los periodistas valoran material que puedan usar sin tener que reescribirlo."),
          ul("Presentación de la galería", "Biografías breves de los artistas", "Imágenes con crédito y ficha técnica", "Datos de contacto de prensa"),
        ],
      },
      {
        id: "imagenes-y-derechos",
        heading: "Imágenes y derechos de uso",
        blocks: [
          p("Verifica que cuentas con autorización para difundir las imágenes de cada obra. Cuando haya fotógrafos externos, deja por escrito los usos permitidos y los créditos."),
          p("Entrega las fotografías con nombres de archivo ordenados, por ejemplo artista, título y año. Esto facilita que los medios las identifiquen sin errores."),
          p("Para las imágenes del stand, solicita permiso a las personas que aparezcan en ellas. Es una práctica sencilla que evita inconvenientes posteriores."),
        ],
      },
      {
        id: "redes-sociales",
        heading: "Redes sociales",
        blocks: [
          p("Usa las etiquetas oficiales y menciona a los artistas. Programa publicaciones para los días previos y comparte contenido en vivo durante la feria."),
          ul("Publicación de anuncio", "Historias del montaje", "Resumen al cierre"),
          p("Responde los comentarios y mensajes con rapidez, sobre todo en los días de feria. Una respuesta amable en pocos minutos puede convertirse en una visita al stand."),
        ],
      },
      {
        id: "calendario-editorial",
        heading: "Calendario editorial",
        blocks: [
          p("Organiza tus publicaciones en un calendario que cubra desde cuatro semanas antes hasta una semana después de la feria. Así evitas improvisar y distribuyes el contenido de forma pareja."),
          p("En las primeras semanas, presenta a los artistas y las obras principales. Durante la feria, prioriza lo inmediato, como recorridos, conversaciones y anuncios de actividades."),
          p("Tras el cierre, comparte agradecimientos y un balance con imágenes. Ese contenido mantiene el interés de quienes no pudieron asistir."),
        ],
      },
      {
        id: "medios",
        heading: "Relación con medios",
        blocks: [
          p("La organización comparte un directorio de periodistas acreditados. Si quieres coordinar una entrevista, escríbenos con tiempo."),
          p("Envía tu kit de prensa con una nota breve y personalizada para cada periodista. Explica por qué tu propuesta puede interesar a su público y ofrece una cita concreta."),
          p("Durante la feria, designa una persona del equipo para atender a la prensa. Tener un contacto fijo agiliza las visitas y evita contradicciones en la información."),
        ],
      },
      {
        id: "eventos-y-activaciones",
        heading: "Eventos y activaciones en el stand",
        blocks: [
          p("Una charla con un artista, una visita guiada o una presentación de catálogo pueden dar vida a tu espacio. Programa estas actividades con antelación y confírmalas con la organización."),
          p("Anuncia cada actividad en tus canales con día y hora precisos. Si puedes, prepara una pieza gráfica sencilla que el público identifique a primera vista."),
          ul("Charla con un artista", "Recorrido comentado de la selección", "Presentación de una publicación o catálogo"),
        ],
      },
      {
        id: "medicion-de-resultados",
        heading: "Medición de resultados",
        blocks: [
          p("Define desde el inicio unos pocos indicadores sencillos, como alcance de las publicaciones, menciones en medios y contactos nuevos. Medir pocas cosas bien es mejor que registrar muchas sin criterio."),
          p("Una semana después de la feria, reúne los datos en un documento breve y compáralos con tus objetivos. Esa lectura te servirá para planificar mejor la próxima participación."),
          p("Comparte los resultados con tu equipo y con los artistas que representas. Conocer el efecto de cada acción fortalece la confianza y la colaboración."),
        ],
      },
    ],
    sources: [{ title: "Manual de marca de la feria (ejemplo)", href: "https://example.com/manual-marca" }],
  },
  {
    slug: "vender-en-la-feria",
    title: "Vender en la feria: acuerdos, precios y seguimiento",
    excerpt: "Consejos para presentar tus precios, cerrar acuerdos y dar seguimiento a los contactos.",
    intro:
      "Una feria es una oportunidad comercial intensa. Tener claros tus precios y tu proceso de seguimiento marca la diferencia.",
    date: "2026-07-18",
    category: "Ventas",
    readMinutes: 3,
    cover: { src: "/covers/vender-en-la-feria.svg", alt: "Ilustración de un coleccionista frente a una pintura enmarcada con punto rojo de venta y un datáfono con tarjeta" },
    sections: [
      {
        id: "preparar-la-propuesta",
        heading: "Prepara tu propuesta comercial",
        blocks: [
          p("Selecciona las obras con una lógica clara: una idea curatorial, un artista o un conjunto de series. Un stand coherente comunica mejor que uno con piezas sin relación entre sí."),
          p("Reserva algunas obras de menor formato y precio. Suelen abrir la puerta a nuevos coleccionistas que aún no han comprado en galerías."),
          p("Escribe un breve texto de presentación para cada artista. Ayuda al equipo a explicar su trabajo de manera uniforme."),
        ],
      },
      {
        id: "lista-de-precios",
        heading: "Lista de precios",
        blocks: [
          p("Define con antelación qué obras se muestran con precio y cuáles bajo consulta. Mantén la información consistente entre el stand y los materiales digitales."),
          p("Indica si los valores incluyen impuestos, marco o transporte. Esa claridad evita discusiones en el momento del cierre."),
          ul("Precio de lista y moneda", "Condiciones de impuestos y envío", "Margen de descuento autorizado"),
        ],
      },
      {
        id: "atencion-en-el-stand",
        heading: "Atención en el stand",
        blocks: [
          p("Recibe a cada visitante con un saludo cordial y deja que recorra el espacio con calma. Acércate cuando muestre interés y ofrece información sin presionar."),
          p("Anota en una libreta o en una hoja compartida los comentarios y las preguntas más frecuentes. Esa información orienta tus ajustes durante los días siguientes."),
          p("Organiza turnos para que el stand nunca quede sin atención. Cuando hay pocas personas, el descanso y la alimentación también deben planificarse."),
        ],
      },
      {
        id: "acuerdos",
        heading: "Acuerdos y reservas",
        blocks: [
          p("Registra cada reserva con los datos del comprador, la obra y las condiciones de pago. Un formato simple evita malentendidos."),
          ul("Nombre y contacto del comprador", "Obra y precio acordado", "Condiciones de entrega"),
          p("Define cuánto tiempo mantendrás una reserva sin pago. Comunicar ese plazo desde el inicio permite liberar la obra a otros interesados si el trato no avanza."),
        ],
      },
      {
        id: "negociacion",
        heading: "Negociación y descuentos",
        blocks: [
          p("Acuerda con tus artistas el margen de negociación antes de la feria. Así puedes responder con rapidez sin tener que consultar cada vez."),
          p("Cuando un comprador pida un descuento, ofrece alternativas como pagos en cuotas o la inclusión del embalaje. A menudo estas opciones facilitan el cierre sin bajar el precio."),
          p("Si no puedes aceptar una propuesta, explícalo con respeto y deja abierta la conversación. Muchas ventas se concretan días después de la primera visita."),
        ],
      },
      {
        id: "pagos-y-facturacion",
        heading: "Pagos y facturación",
        blocks: [
          p("Define los medios de pago que aceptarás, como transferencia o tarjeta, y comunícalos con claridad. Ten a mano los datos bancarios y los formatos de factura de tu galería."),
          p("Emite un comprobante o una orden de venta en el momento del acuerdo. Esa constancia protege tanto al comprador como a la galería."),
          ul("Datos de la cuenta para transferencias", "Formato de orden de venta", "Política de cambios y devoluciones"),
        ],
      },
      {
        id: "entrega-de-obras",
        heading: "Entrega de obras vendidas",
        blocks: [
          p("Las obras vendidas permanecen en el stand hasta el cierre, salvo acuerdo distinto con la organización. Marca cada pieza con una señal discreta para indicar que está reservada o vendida."),
          p("Coordina con el comprador la forma de entrega, ya sea retiro en el recinto o envío posterior. Si hay envío, confirma el embalaje, el seguro y los plazos por escrito."),
          p("Cuando se concrete la entrega, solicita una firma de recibido. Ese documento cierra la operación y facilita cualquier gestión posterior."),
        ],
      },
      {
        id: "seguimiento",
        heading: "Seguimiento posterior",
        blocks: [
          p("Escribe a tus contactos en la semana siguiente a la feria. Un mensaje personalizado, con imágenes de las obras que les interesaron, suele funcionar mejor que un envío masivo."),
          p("Clasifica a tus contactos según su nivel de interés: compradores, interesados y curiosos. Con esa lista puedes definir el tipo y el ritmo de contacto con cada grupo."),
          ul("Agradecimiento y resumen de la conversación", "Imágenes de las obras de interés", "Invitación a la siguiente exposición"),
        ],
      },
      {
        id: "balance-comercial",
        heading: "Balance comercial",
        blocks: [
          p("Una vez cerrada la feria, reúne las ventas, las reservas y los contactos en un solo informe. Compáralo con tus metas iniciales para medir qué funcionó y qué conviene ajustar."),
          p("Comparte los resultados con los artistas y con tu equipo, destacando las obras que más atención recibieron. Esa información orienta decisiones sobre futuras selecciones."),
          p("Guarda el informe junto con tus notas de aprendizajes. Será el punto de partida para preparar tu próxima participación con más claridad."),
        ],
      },
    ],
    sources: [],
  },
];

export function listArticles(): readonly Article[] {
  return ARTICLES;
}

export function listArticleSlugs(): string[] {
  return ARTICLES.map((a) => a.slug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatArticleDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
