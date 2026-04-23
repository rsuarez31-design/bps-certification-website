/**
 * ARCHIVO DE DATOS DEL EXAMEN (FALLBACK LOCAL)
 *
 * Este archivo contiene las 75 preguntas del examen de navegacion
 * segun la Ley 430 de Puerto Rico. Se usa como respaldo local cuando
 * Supabase no esta disponible.
 *
 * La fuente de verdad son las filas de la tabla exam_questions en Supabase.
 * Este arreglo debe mantenerse sincronizado con ese banco.
 *
 * Estructura:
 * - id: Identificador unico de la pregunta (1-75)
 * - question: Texto de la pregunta
 * - options: Array con las 4 opciones (a, b, c, d)
 * - correctAnswer: Indice de la respuesta correcta (0=a, 1=b, 2=c, 3=d)
 * - hint: Pista que se guarda en base de datos pero no se muestra en UI
 * - imageUrl: Ruta/URL de la imagen a mostrar sobre la pregunta.
 *            Cadena vacia si la pregunta no tiene imagen.
 *            Solo la pregunta #28 tiene imagen por ahora.
 */

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  imageUrl?: string;
}

export const examQuestions: ExamQuestion[] = [
  {
    id: 1,
    question: "Como se comportaria un bote si se cargara por encima o mas alla de la capacidad especificada o estipulada en la placa de capacidad?",
    options: [
      "este navegara mejor",
      "este sera mas facil de detener",
      "este sera dificil de controlar",
      "este sera mucho mas rapido"
    ],
    correctAnswer: 2,
    hint: "La carga excesiva complica el manejo.",
    imageUrl: ""
  },
  {
    id: 2,
    question: "Ponerse el salvavidas cuando se esta en el agua:",
    options: [
      "es mas facil ya que el salvavidas flota",
      "es mas facil ya que los tirantes del salvavidas estan mojados y flexibles",
      "es mas dificil de ponerselo rapido ya que los salvavidas tienen una fuerza boyante considerable",
      "es mas dificil ya que estos todavia deben estar en su empaque original envueltos en celofan"
    ],
    correctAnswer: 2,
    hint: "La flotacion hace mas lento ponerselo.",
    imageUrl: ""
  },
  {
    id: 3,
    question: "Cual es una caracteristica de un chaleco salvavidas Tipo III?",
    options: [
      "esta disenado para ser usado como un objeto que se puede lanzar",
      "este sea considerado como un buen chaleco salvavidas para aguas turbulentas (mar picado) en alta mar",
      "este tiene una fuerza boyante o flotabilidad mayor que todos los demas chalecos",
      "este no volteara boca arriba a la mayoria de las personas inconscientes que lo esten usando"
    ],
    correctAnswer: 3,
    hint: "Piensa en lo que no hace con una persona inconsciente.",
    imageUrl: ""
  },
  {
    id: 4,
    question: "Que debes buscar cuando seleccionas un salvavidas?",
    options: [
      "uso, tipo y tamano",
      "estilo y costo",
      "habilidad de nadar del usuario o persona",
      "el tipo de bote donde lo vas a usar"
    ],
    correctAnswer: 0,
    hint: "La respuesta combina criterios basicos de eleccion.",
    imageUrl: ""
  },
  {
    id: 5,
    question: "Cual precaucion de seguridad debe tomarse primero, por el operador de un bote, cuando este navegando en aguas tormentosas, o aguas picadas, o con mal tiempo?",
    options: [
      "cerrar todas las escotillas",
      "enviar mensaje por radiotelefono de socorro \"MAYDAY\"",
      "asegurarse que todos abordo tengan puesto un chaleco salvavidas aprobado por la Guardia Costanera de los Estados Unidos (USCG)",
      "pedir ayuda inmediatamente a la Guardia Costanera"
    ],
    correctAnswer: 2,
    hint: "Primero protege a las personas a bordo.",
    imageUrl: ""
  },
  {
    id: 6,
    question: "Despues de haber usado un salvavidas inflable, que paso debes seguir para asegurarte que este sera funcional en el futuro?",
    options: [
      "rellenar el cartucho o cilindro de CO2",
      "usas la valvula oral de inflar para rellenar el salvavidas",
      "lo envias al USCG para inspeccion",
      "reemplaza el cilindro o cartucho de CO2 y lo ensamblas o re-armas de nuevo"
    ],
    correctAnswer: 3,
    hint: "Hay que dejar el equipo listo para usarse otra vez.",
    imageUrl: ""
  },
  {
    id: 7,
    question: "Que factor determina el numero y tamano de los extintores de fuegos que debes llevar abordo de un bote recreacional?",
    options: [
      "el calado del bote",
      "el largo del bote",
      "el tipo del material del casco",
      "el numero de pasajeros"
    ],
    correctAnswer: 1,
    hint: "La medida del bote define ese requisito.",
    imageUrl: ""
  },
  {
    id: 8,
    question: "Senales de bengala marinos son senales populares de pirotecnia visual para pedir socorro o notificar el estar en apuros. Estos estan marcados con una fecha de expiracion:",
    options: [
      "que puede ignorarse ya que usted usualmente tiene algunas senales adicionales como reserva o reemplazo",
      "que es de 10 anos despues de la fecha de fabricacion",
      "que es igual a la fecha de registracion del bote",
      "que significa la fecha limite en que cumplen con los requisitos de la Guardia Costera (\"Coast Guard\")"
    ],
    correctAnswer: 3,
    hint: "La fecha indica hasta cuando cumplen la norma.",
    imageUrl: ""
  },
  {
    id: 9,
    question: "Los conocimientos de navegacion, cabotaje o pilotaje (\"Piloting\") le dara dos habilidades invaluables de seguridad: 1) la habilidad de determinar tu posicion en cualquier momento, y 2) la habilidad de:",
    options: [
      "seleccionar la ruta mas segura y eficiente de un lugar a otro",
      "determinar la localizacion de los mejores sitios o lugares para pescar",
      "determinar la localizacion de todos los tocones y troncos de arbol sumergidos en tu area o vecindad",
      "pronosticar el tiempo"
    ],
    correctAnswer: 0,
    hint: "La otra destreza tiene que ver con el recorrido.",
    imageUrl: ""
  },
  {
    id: 10,
    question: "Que luces de navegacion deben ser visibles en la proa de un bote de motor de 19 pies que este navegando de noche?",
    options: [
      "roja sobre verde, montadas o apiladas verticalmente",
      "verde sobre roja, montadas o apiladas verticalmente",
      "roja en el lado de babor, verde en el lado de estribor",
      "verde en el lado de babor, roja en el lado de estribor"
    ],
    correctAnswer: 2,
    hint: "Recuerda el color de cada costado.",
    imageUrl: ""
  },
  {
    id: 11,
    question: "Un operador o capitan de embarcacion que es consciente de la seguridad, nunca prende el motor de un bote antes de:",
    options: [
      "oler o usar el olfato para detectar vapores de combustible en el compartimiento del motor y el combustible",
      "que todos los pasajeros esten confortablemente sentados en la cabina, borda o espejo",
      "haber chequeado de que hay bastante alcohol y aditivos en el combustible",
      "haber chequeado o leido el informe climatologico en el periodico del domingo"
    ],
    correctAnswer: 0,
    hint: "Antes de arrancar, verifica si hay vapores.",
    imageUrl: ""
  },
  {
    id: 12,
    question: "Para evitar quedarse sin combustible, usted debe estimar o determinar la capacidad usable de su tanque de combustible y el rendimiento de consumo, y entonces:",
    options: [
      "traes combustible adicional en envases faciles de usar como lo es una jarra o galon plastico de leche",
      "planificas tener suficiente combustible para llegar a la proxima marina con estacion de combustible (gasolinera)",
      "planificas en usar 1/2 tanque para llegar a tu destino, y 1/2 tanque para llegar al hogar",
      "planificas en usar 1/3 de tanque para llegar a tu destino, un 1/3 de tanque para llegar a tu hogar, y 1/3 para emergencias"
    ],
    correctAnswer: 3,
    hint: "Una parte del combustible se reserva para imprevistos.",
    imageUrl: ""
  },
  {
    id: 13,
    question: "Cual es una senal tipica de que se aproxima mal tiempo?",
    options: [
      "no hay cambios en la velocidad y direccion del viento por un periodo largo de tiempo",
      "nubes amontonandose, oscureciendo, y aumentando en tamano",
      "corrientes marinas cambiando de direccion",
      "un aumento en la presion barometrica"
    ],
    correctAnswer: 1,
    hint: "Mira el desarrollo de las nubes.",
    imageUrl: ""
  },
  {
    id: 14,
    question: "Como deberia ser manejado un bote cuando es atrapado en ventiscas o ventarrones y aguas turbulentas o mar picado?",
    options: [
      "girar el bote de tal forma que las olas las tomaras de lado (\"broadside\")",
      "reduzca la velocidad y dirijase hacia las olas con un angulo leve",
      "aumente la velocidad y suavice el comportamiento de la embarcacion",
      "gire el bote hacia aguas mas profundas"
    ],
    correctAnswer: 1,
    hint: "La proa no debe quedar totalmente de lado a las olas.",
    imageUrl: ""
  },
  {
    id: 15,
    question: "Cuando llegamos a un muelle o giramos para entrar en un espacio estrecho, la persona que esta al timon debe entender como varia el punto de pivote del bote. Donde esta el punto de pivote tipico cuando marchas hacia atras?",
    options: [
      "causa que el bote avance en circulos",
      "aproximadamente a 1/3 del largo del bote desde la popa",
      "afecta el consumo de combustible del bote",
      "es similar al radio de giro de un carro"
    ],
    correctAnswer: 1,
    hint: "El punto de giro se desplaza hacia atras.",
    imageUrl: ""
  },
  {
    id: 16,
    question: "Que cotejo de mantenimiento rutinario debes hacer antes de encender el motor de tu bote?",
    options: [
      "pulir las superficies brillosas de tal forma que sean resbaladizas cuando te le pares encima",
      "escuchar el informe del tiempo en el radio VHF",
      "verificar o chequear la fecha de expiracion de la pistola de bengalas (\"flare gun\")",
      "chequear que las mangas del motor esten firmes y libres de goteo"
    ],
    correctAnswer: 3,
    hint: "Busca firmeza y ausencia de fugas.",
    imageUrl: ""
  },
  {
    id: 17,
    question: "Como deberian usarse las cadenas de seguridad con el enganche del arrastre?",
    options: [
      "cruzados sobre la lanza (poste de enganche) del carreton o remolque",
      "cruzado debajo de la lanza o lengueta del carreton o remolque",
      "amarrado al parachoques (\"bumper\") del vehiculo que remolca",
      "amarrado a la winche (malacate) del carreton o arrastre"
    ],
    correctAnswer: 1,
    hint: "La posicion correcta crea soporte bajo la lanza.",
    imageUrl: ""
  },
  {
    id: 18,
    question: "Que condiciones afectan el juicio de una persona, hacen que la persona no piense claramente, reduce la habilidad del operador del bote para sobrevivir en el agua, y es la causa mayor que contribuye en los accidentes del bote?",
    options: [
      "indigestion",
      "mareo",
      "el uso de alcohol y drogas",
      "fatiga por el calor"
    ],
    correctAnswer: 2,
    hint: "Piensa en el factor que altera juicio y reaccion.",
    imageUrl: ""
  },
  {
    id: 19,
    question: "Que debes hacerle al bote antes de echarle combustible?",
    options: [
      "abrir todas las puertas",
      "abrir todas las escotillas delanteras",
      "cerrar todas las puertas y escotillas",
      "cerrar todas las escotillas a favor del viento y abrir todas las escotillas en contra del viento"
    ],
    correctAnswer: 2,
    hint: "Antes de llenar, evita que entren vapores al interior.",
    imageUrl: ""
  },
  {
    id: 20,
    question: "En un bote de recreo o placer, la localizacion del equipo de emergencia (chalecos salvavidas, extintores de fuego, senales visuales de emergencia, radio, etc.), debe verificarse antes de partir. Quienes deben participar para verificar o revisar la localizacion?",
    options: [
      "todos abordo",
      "la tripulacion con paga de la embarcacion",
      "todos los que no saben nadar",
      "adultos con la edad de 21 y mayores"
    ],
    correctAnswer: 0,
    hint: "Todos deben saber donde esta el equipo.",
    imageUrl: ""
  },
  {
    id: 21,
    question: "Para que se usa un \"float plan\"?",
    options: [
      "para informar a un amigo responsable sobre tu plan de viaje en bote",
      "para describir las areas de una marina",
      "para definir las reparaciones que se haran a tu bote",
      "para identificar cualquier dispositivo de flotacion fijo en tu bote"
    ],
    correctAnswer: 0,
    hint: "Se comparte con alguien responsable antes de salir.",
    imageUrl: ""
  },
  {
    id: 22,
    question: "El uso de alcohol y drogas es un problema significativo en el agua. De acuerdo a las estadisticas del \"USCG\", el 50% de todos los accidentes fatales envuelven el haber ingerido alcohol. El alcohol:",
    options: [
      "no tiene ningun efecto en la habilidad para sobrevivir si cayeras al agua",
      "no tiene ningun efecto en tu juicio o habilidad de pensar claramente",
      "aumenta los efectos de fatiga del operador del bote",
      "aumenta tu flexibilidad y mejora tu balance cuando estas parado sobre el borde de los lados del casco"
    ],
    correctAnswer: 2,
    hint: "Su efecto se suma al cansancio.",
    imageUrl: ""
  },
  {
    id: 23,
    question: "Cuando operas o manejas un bote cerca de otros botes, o cuando entras a un area congestionada, por que debes atento a la ola que tu generas o produces?",
    options: [
      "esta puede usarse para juzgar distancia contra otros",
      "esta no debe ser mayor de tres pulgadas de alto",
      "esta puede causar lesion personal o dano",
      "esta puede usarse para estimar la velocidad del bote"
    ],
    correctAnswer: 2,
    hint: "La estela puede afectar a otros.",
    imageUrl: ""
  },
  {
    id: 24,
    question: "Como el uso de alcohol afecta a los operadores de bote o a los pasajeros?",
    options: [
      "las reacciones fisicas se tornan mas lentas",
      "la habilidad de razonar se torna mas rapida",
      "la percepcion de profundidad se agudiza",
      "el balance y sentido de direccion mejora"
    ],
    correctAnswer: 0,
    hint: "Piensa en el efecto sobre el tiempo de reaccion.",
    imageUrl: ""
  },
  {
    id: 25,
    question: "Cuando es que tu puedes obviar, desviar o ignorar una Regla de la Guardia Costanera de los EUA?",
    options: [
      "cuando otro bote que viene detras te esta pasando para irse al frente",
      "cuando todavia estas dentro de una marina",
      "cuando tu estas operando una embarcacion menor de 14 pies de largo",
      "cuando es necesario para evitar una colision o choque"
    ],
    correctAnswer: 3,
    hint: "La excepcion existe solo para evitar un peligro mayor.",
    imageUrl: ""
  },
  {
    id: 26,
    question: "Durante que horario aplica a los botes que esten navegando, la responsabilidad de mantener vigilancia humana, por via visual y auditiva?",
    options: [
      "puesta del sol hasta el amanecer",
      "amanecer hasta puesta del sol",
      "en todo momento",
      "durante lluvia o neblina"
    ],
    correctAnswer: 2,
    hint: "No depende de la hora del dia.",
    imageUrl: ""
  },
  {
    id: 27,
    question: "De acuerdo a las Reglas de Navegacion, que factor se toma en cuenta para determinar una velocidad segura?",
    options: [
      "las condiciones de visibilidad",
      "la velocidad maxima del bote",
      "el numero de pasajeros",
      "la capacidad indicada en la placa del bote"
    ],
    correctAnswer: 0,
    hint: "La velocidad segura cambia con lo que puedes ver.",
    imageUrl: ""
  },
  {
    id: 28,
    question: "En la situacion de botes de motor mostrada arriba, que se deberia esperar que hiciera el bote \"B\" para aminorar las posibilidades de un choque o colision con el bote \"A\"?",
    options: [
      "bajar la velocidad y/o virar a babor",
      "bajar la velocidad y mantener el curso",
      "aumentar la velocidad y/o virar a estribor",
      "mantener el curso y velocidad actual"
    ],
    correctAnswer: 3,
    hint: "Usa la opcion que marcaste en la imagen.",
    imageUrl: "/exam-images/boat-q28.png"
  },
  {
    id: 29,
    question: "Cuando esta navegando se requiere que usted proceda a una velocidad segura y mantenga vigilancia o atencion en todo momento. La atencion y vision o vigilancia adecuada son factores mayores en:",
    options: [
      "encontrar lineas de demarcacion",
      "evita una colision o choque",
      "medir la temperatura del agua para determinar las aguas mas calmadas",
      "determinar la precision de la direccion de la brujula"
    ],
    correctAnswer: 1,
    hint: "La funcion principal es prevenir incidentes.",
    imageUrl: ""
  },
  {
    id: 30,
    question: "Cuando te encuentras de frente con otro bote de motor, este emite un bocinazo o pito corto. Que te esta comunicando o diciendo el operador de la otra embarcacion?",
    options: [
      "su intencion de mantener curso y velocidad",
      "que mi timon esta a la izquierda y piensa cambiar su curso a babor",
      "que se apresta a cambiar curso hacia estribor para pasar babor con babor",
      "que se prepara a anclar en un minuto para permitir que el trafico pase"
    ],
    correctAnswer: 2,
    hint: "Un sonido corto indica un cambio simple de rumbo.",
    imageUrl: ""
  },
  {
    id: 31,
    question: "Cuando dejas la marina y te encaminas hacia alta mar y ves una boya roja, como tu deberias actuar o proceder:",
    options: [
      "quedarme no menos de 20 yardas alejado de la boya",
      "quedarme totalmente alejado de la boya",
      "mantener la boya a mi lado de estribor",
      "mantener la boya a mi lado de babor"
    ],
    correctAnswer: 3,
    hint: "Piensa en la regla al salir hacia mar abierto.",
    imageUrl: ""
  },
  {
    id: 32,
    question: "Marcadores (rotulos) de Regulaciones e Informacion son faciles de identificar a traves de que rasgos o caracteristicas?",
    options: [
      "lineas verticales negras y blancas",
      "forma triangular y letras rojas",
      "color blanco con formas geometricas de naranja",
      "simbolo amarillo cuadrado o triangular"
    ],
    correctAnswer: 2,
    hint: "Se reconocen por el fondo y las figuras.",
    imageUrl: ""
  },
  {
    id: 33,
    question: "Cual es el factor principal a considerarse cuando planeas acercarte con tu embarcacion al muelle donde te vas a amarrar?",
    options: [
      "el informe o pronostico del tiempo para esa noche",
      "el largo de los cabos de amarre de la embarcacion",
      "la capacidad de poder parar de tu embarcacion",
      "la fuerza del viento o la corriente"
    ],
    correctAnswer: 3,
    hint: "Piensa en lo que mas afecta la maniobra al acercarte.",
    imageUrl: ""
  },
  {
    id: 34,
    question: "Cual es la tecnica adecuada para anclarse?",
    options: [
      "desde la borda de estribor",
      "sobre el lado de babor",
      "sobre el espejo o popa",
      "desde la proa"
    ],
    correctAnswer: 3,
    hint: "El ancla se maneja desde el extremo delantero.",
    imageUrl: ""
  },
  {
    id: 35,
    question: "Cual es la mejor precaucion contra el envenenamiento por monoxido de carbono?",
    options: [
      "mantenga aire fluyendo a traves de la embarcacion",
      "prenda el ventilador (extractor de aire) del motor cuando este navegando",
      "instalar una alarma de humo en la cabina delantera",
      "quedarse en la parte de la popa cuando la embarcacion este navegando"
    ],
    correctAnswer: 0,
    hint: "La circulacion de aire es clave.",
    imageUrl: ""
  },
  {
    id: 36,
    question: "Cual es la primera accion requerida de un operador de bote que haya presenciado un accidente de bote?",
    options: [
      "mantengase alejado o fuera del camino",
      "provea asistencia o ayuda si es posible",
      "escriba un reporte del incidente",
      "espere a que llegue personal de rescate"
    ],
    correctAnswer: 1,
    hint: "Primero ayuda, si puedes hacerlo con seguridad.",
    imageUrl: ""
  },
  {
    id: 37,
    question: "Si su embarcacion se vuelca cuando usted esta lejos de la orilla, cual seria la accion mas segura a seguir?",
    options: [
      "nadar hacia la orilla mas cercana",
      "nadar hacia la embarcacion mas cercana",
      "quedarse con el bote y subirse o treparse encima si es posible",
      "quedarse en el agua al lado del bote y mantenerse en movimiento en el agua"
    ],
    correctAnswer: 2,
    hint: "La embarcacion sigue siendo tu mejor apoyo.",
    imageUrl: ""
  },
  {
    id: 38,
    question: "Cuando es que un bote es menos estable y propenso a volcarse boca abajo?",
    options: [
      "cuando el peso o la carga esta distribuida uniformemente",
      "cuando los tanques de combustible estan medio vacios",
      "cuando se esta en aguas profundas",
      "cuando se esta con sobrepeso o sobre cargado"
    ],
    correctAnswer: 3,
    hint: "La carga excesiva reduce estabilidad.",
    imageUrl: ""
  },
  {
    id: 39,
    question: "Cual es la forma recomendada de moverse o caminar dentro de un bote pequeno?",
    options: [
      "limitese a moverse en la mitad delantera del bote",
      "mantengase agachado y muevase cerca de la linea del centro del bote",
      "mantengase erguido o derecho con los pies separados para mejor balance",
      "acomode las personas en un lado y muevase a traves del lado opuesto"
    ],
    correctAnswer: 1,
    hint: "Conviene mantenerse bajo y centrado.",
    imageUrl: ""
  },
  {
    id: 40,
    question: "Cual es la accion recomendable al encontrarse con visibilidad limitada de cualquier tipo:",
    options: [
      "pongase el equipo para mal tiempo para protegerse del frio y de mojarse",
      "determine su posicion tan precisa como sea posible mientras haya visibilidad para hacerlo",
      "toque o timbre la campana del barco un timbre corto cada segundo para avisarle a otras embarcaciones de su presencia",
      "use su transmisor cada tres minutos para anunciar que usted se esta moviendo o navegando y le pide a las demas embarcaciones que se mantengan fuera de su camino"
    ],
    correctAnswer: 1,
    hint: "Ubicate bien antes de perder referencia visual.",
    imageUrl: ""
  },
  {
    id: 41,
    question: "Cuando estas solo, abandonado o aislado en agua fria, y tienes puesto tu salvavidas aprobado por el USCG, que debes hacer para evitar perder calor corporal?",
    options: [
      "mantener el cuerpo en movimiento en el agua",
      "nade con brazadas de pecho en circulos grande",
      "contraiga las rodillas y brazos hacia el pecho",
      "flote boca arriba con sus brazos y piernas extendidas"
    ],
    correctAnswer: 2,
    hint: "La postura debe conservar calor, no gastarlo.",
    imageUrl: ""
  },
  {
    id: 42,
    question: "Para evitar una lesion grave causada por la helice de tu motor, como tu deberias acercartele a un banista o nadador en un area designada como area de banistas o para nadar?",
    options: [
      "solamente cuando el salvavidas no este trabajando.",
      "solamente cuando el salvavidas este trabajando",
      "nunca se le acerque a un banista que este en un area designada como area para banistas",
      "desde viento abajo del banista y dentro de las sogas"
    ],
    correctAnswer: 2,
    hint: "La zona marcada excluye esa aproximacion.",
    imageUrl: ""
  },
  {
    id: 43,
    question: "A que parte del fuego tu debes apuntar cuando usas un extintor de fuegos?",
    options: [
      "al tope",
      "a un lado",
      "a la base",
      "al medio"
    ],
    correctAnswer: 2,
    hint: "El punto eficaz esta donde comienza el fuego.",
    imageUrl: ""
  },
  {
    id: 44,
    question: "Cual es el primer paso o accion que se debe seguir o tomar, cuando una embarcacion encalla o se vara?",
    options: [
      "llamar a la Guardia Costanera",
      "buscar infiltraciones o goteras de agua",
      "averiguar la profundidad del agua",
      "poner el motor en reversa o marcha hacia atras"
    ],
    correctAnswer: 1,
    hint: "Primero verifica si hubo entrada de agua.",
    imageUrl: ""
  },
  {
    id: 45,
    question: "Operadores de canoa o remeros estan particularmente en riesgo de una situacion peligrosa llamada:",
    options: [
      "fatiga de los boteros",
      "a la deriva",
      "entrampamiento",
      "fatiga por agua fria"
    ],
    correctAnswer: 3,
    hint: "La respuesta menciona un efecto del agua.",
    imageUrl: ""
  },
  {
    id: 46,
    question: "Que accion pudiera causar la perdida de la habilidad de guiar en una motora acuatica o PWC?",
    options: [
      "poner el control de la gasolina al maximo",
      "soltar el control de la gasolina",
      "no girar el guia lo suficiente",
      "girar el guia en exceso o demasiado"
    ],
    correctAnswer: 1,
    hint: "En PWC, el giro depende del empuje.",
    imageUrl: ""
  },
  {
    id: 47,
    question: "Que Regla(s) de Navegacion aplica(n) a un bote propulsado por chorro de agua (PWC)?",
    options: [
      "un PWC debe mostrar sus luces de navegacion cuando se usa despues de anochecer",
      "normalmente un PWC tiene prioridad de movimiento en situaciones de encuentro o cruce",
      "un PWC esta exento de todas las reglas y regulaciones que aplican para botes",
      "operadores se tienen que adherir a muchas de las mismas reglas y regulaciones que aplican a botes grandes"
    ],
    correctAnswer: 3,
    hint: "No esta exento por ser pequeno o distinto.",
    imageUrl: ""
  },
  {
    id: 48,
    question: "Debido a las diferentes caracteristicas de operar, algunos estados consideran las motoras acuaticas (PWC) como una clase especial de bote y tienen regulaciones especiales para estos. Como operador de una motora acuatica (PWC), usted tiene que:",
    options: [
      "llevar abordo una copia de las reglas de la Comision de Reglas Especiales para PWC",
      "estar consciente de/y proceder de acuerdo a todas las leyes que gobiernan o regulan el uso de motoras acuaticas en su area",
      "conocer las Reglas Especiales de la Navegacion que aplican unicamente a los PWCs",
      "seguir las reglas establecidas por la Asociacion Nacional de Navegacion"
    ],
    correctAnswer: 1,
    hint: "La clave es conocer y seguir la ley local aplicable.",
    imageUrl: ""
  },
  {
    id: 49,
    question: "Remolcar a esquiadores en el agua, tablas para las olas generadas por el bote, y tubos es muy popular y divertido. Se requieren procedimientos especiales para la seguridad de todas las personas envueltas que incluyen:",
    options: [
      "remolcar lo mas cerca posible y justamente despues de la puesta del sol, porque es cuando el agua es normalmente mas calmada",
      "remolcar en aguas profundas, canales estrechos para asegurarse de que el agua sea lo suficientemente profunda",
      "mantener la mayor distancia posible de los barcos, muelles y casa-botes con un minimo de 200 pies de ancho para el paso del esquiador",
      "estar cerca de otros botes recreacionales de tal forma que ellos puedan ayudar en recoger personas cuando estas se caen"
    ],
    correctAnswer: 2,
    hint: "Busca espacio amplio y separacion.",
    imageUrl: ""
  },
  {
    id: 50,
    question: "Que reglas de navegacion aplican a operadores envueltos en la pesca recreacional?",
    options: [
      "solamente aquellas reglas de navegacion que son especificamente para deportistas",
      "reglas del Servicio Nacional de Pesca y Vida Silvestre (\"US Fish and Wildlife Service\")",
      "las mismas reglas que aplican a todos los operadores de embarcacion",
      "reglas de navegacion para cuando es de dia"
    ],
    correctAnswer: 2,
    hint: "Pescar no elimina las reglas generales.",
    imageUrl: ""
  },
  {
    id: 51,
    question: "Las areas azules en una carta indican:",
    options: [
      "agua profunda y segura",
      "areas sujetas a la fluctuacion de la marea",
      "agua relativamente llana",
      "tierra seca"
    ],
    correctAnswer: 2,
    hint: "No se refiere a tierra ni a gran profundidad.",
    imageUrl: ""
  },
  {
    id: 52,
    question: "Las cartas, para areas sujetas o expuestas a la marea, siempre muestran el espacio libre vertical hacia los objetos altos en:",
    options: [
      "mitad de la marea",
      "marea baja",
      "un plano de referencia escogido por las autoridades del pueblo",
      "el promedio de la marea alta"
    ],
    correctAnswer: 1,
    hint: "La referencia es la condicion de menor nivel.",
    imageUrl: ""
  },
  {
    id: 53,
    question: "En el sistema cuadriculado que hace posible identificar cualquier punto en la superficie de la tierra, lineas laterales imaginarias o paralelos de latitud:",
    options: [
      "corren hacia el este y oeste",
      "corren norte y sur",
      "son numeradas de 0 a 180",
      "corren a traves de los polos geograficos"
    ],
    correctAnswer: 0,
    hint: "Los paralelos rodean la tierra de lado a lado.",
    imageUrl: ""
  },
  {
    id: 54,
    question: "Una forma precisa de determinar donde te encuentras en el agua es:",
    options: [
      "mirando la brujula o compas",
      "encontrando tu posicion en los (\"Local Notice to Mariners\") Comunicados Locales para Marineros",
      "encontrando tu posicion relativa a un objeto o ayuda a la navegacion que este identificado en la carta",
      "preguntandole al operador de un bote que pase cerca"
    ],
    correctAnswer: 2,
    hint: "Relaciona tu posicion con una referencia en la carta.",
    imageUrl: ""
  },
  {
    id: 55,
    question: "La direccion verdadera en una carta es medida desde 000 hasta 359 en direccion a favor de las manecillas del reloj desde:",
    options: [
      "el rumbo o direccion de la brujula",
      "el norte geografico verdadero",
      "el sur geografico verdadero",
      "desde la Linea de Lubber (\"Lubber's Line\")"
    ],
    correctAnswer: 1,
    hint: "La medida parte del norte correcto de la carta.",
    imageUrl: ""
  },
  {
    id: 56,
    question: "La Rosa Nautica y _________ te indicaran el norte verdadero y te dara la direccion norte- sur en las cartas.",
    options: [
      "los meridianos de longitud",
      "el bloque del titulo de la carta",
      "los paralelos de latitud",
      "la escala de las millas nauticas"
    ],
    correctAnswer: 0,
    hint: "La otra referencia corre de norte a sur.",
    imageUrl: ""
  },
  {
    id: 57,
    question: "El maximo de caballaje permitido por ley para operar una embarcacion en lagos es de:",
    options: [
      "10 caballos de fuerza",
      "20 caballos de fuerza",
      "30 caballos de fuerza",
      "40 caballos de fuerza"
    ],
    correctAnswer: 3,
    hint: "Es la cifra mayor entre las opciones.",
    imageUrl: ""
  },
  {
    id: 58,
    question: "Si una brujula o compas esta debidamente instalada y la desviacion es cero, los numeros en la tarjeta del compas cuando se lee la Linea de Lubber (\"Lubber's Line\"), esta estara indicando la direccion o rumbo hacia donde se dirige el bote, con referencia a:",
    options: [
      "el norte magnetico",
      "la estrella polar",
      "el norte verdadero",
      "la linea de centro del bote"
    ],
    correctAnswer: 0,
    hint: "Sin desviacion, la referencia sigue siendo magnetica.",
    imageUrl: ""
  },
  {
    id: 59,
    question: "Instale una brujula o compas de tal forma que:",
    options: [
      "la tarjeta del compas se pueda ver desde cualquier parte del bote",
      "este lo mas cerca posible de tu radio VHF",
      "no este en el camino--en cualquier lugar que puedas encontrarle un lugar",
      "una linea que atraviesa el \"Lubber's Line\" y el centro del compas tambien este paralelo a la quilla"
    ],
    correctAnswer: 3,
    hint: "Debe quedar alineado con el eje del bote.",
    imageUrl: ""
  },
  {
    id: 60,
    question: "Cuantas horas tiene usted para informar a cualquier agente del orden publico cuando ocurre un accidente donde hay danos a la propiedad que excedan los $100.00?",
    options: [
      "12 horas",
      "24 horas",
      "48 horas",
      "72 horas"
    ],
    correctAnswer: 1,
    hint: "La notificacion se hace dentro de un dia.",
    imageUrl: ""
  },
  {
    id: 61,
    question: "Una milla nautica es:",
    options: [
      "mas pequena que una milla terrestre o estatuaria",
      "igual a un minuto de longitud",
      "igual a un minuto de latitud",
      "usado a lo largo de rutas o pistas costeras"
    ],
    correctAnswer: 2,
    hint: "Se relaciona con una medida angular sobre la tierra.",
    imageUrl: ""
  },
  {
    id: 62,
    question: "Un nudo se define como:",
    options: [
      "algo que usted no deberia hacer",
      "una milla nautica por hora",
      "la velocidad de un bote cuando no es afectado por la corriente",
      "una milla terrestre o estatuaria por hora"
    ],
    correctAnswer: 1,
    hint: "Es una unidad de velocidad nautica.",
    imageUrl: ""
  },
  {
    id: 63,
    question: "El proposito principal de la Ley 430 es:",
    options: [
      "garantizar a la ciudadania el disfrute de playas, lagos y lagunas, dentro de un marco de seguridad",
      "fijar derechos a pagar por la numeracion e inscripcion de las embarcaciones de motor",
      "fijar los derechos a pagar por el uso de vehiculos de campo traviesa",
      "penalizar a toda persona que incurra en un delito menos grave segun lo establece la Ley 430"
    ],
    correctAnswer: 0,
    hint: "La ley combina acceso y seguridad.",
    imageUrl: ""
  },
  {
    id: 64,
    question: "Que velocidad maxima debe mantener una embarcacion cuando navega dentro de los 150 pies paralelos a la costa u orilla en area NO demarcada para banistas?",
    options: [
      "5 mph",
      "10 mph",
      "25 mph",
      "no hay limite de velocidad establecido"
    ],
    correctAnswer: 1,
    hint: "La opcion correcta es el limite intermedio.",
    imageUrl: ""
  },
  {
    id: 65,
    question: "Las profundidades en una carta pueden estar en pies, metros, o brazas. La unidad de medida se puede determinar de:",
    options: [
      "Comunicado a los Marineros (\"Notice to Mariners\")",
      "Almanaque Nautico (\"Nautical Almanac\")",
      "el bloque donde esta el titulo de la carta",
      "lectura del medidor o metro de brazas (\"Fathometer Readings\")"
    ],
    correctAnswer: 2,
    hint: "Ese dato aparece en la informacion principal de la carta.",
    imageUrl: ""
  },
  {
    id: 66,
    question: "Los conocimientos de navegacion o pilotaje o cabotaje te daran DOS destrezas importantes: 1) la habilidad de seleccionar la ruta mas segura de un sitio a otro, y 2) la habilidad de:",
    options: [
      "encontrar el sitio mas cercano para abastecerse de combustible",
      "determinar las condiciones del tiempo para el dia en el mar",
      "determinar tu posicion en cualquier momento",
      "predecir el consumo de combustible"
    ],
    correctAnswer: 2,
    hint: "La otra destreza es saber ubicarse.",
    imageUrl: ""
  },
  {
    id: 67,
    question: "Cuando descansas o confias en tu GPS para darte la posicion actual, es importante:",
    options: [
      "mantener una velocidad constante",
      "comparar lo que ves alrededor tuyo con tu carta para estar seguro donde te encuentras y para verificar tu GPS",
      "limpiar las conexiones electricas para prevenir la corrosion",
      "girar usando los rumbos magneticos"
    ],
    correctAnswer: 1,
    hint: "Conviene confirmar el GPS con referencias externas.",
    imageUrl: ""
  },
  {
    id: 68,
    question: "En la navegacion de una canoa, kayak u otro bote de remo, tu debes:",
    options: [
      "quedarte en el centro del canal porque tu tienes el derecho de paso",
      "quedarte alejado de la costa cuando hallan rocas o escombros",
      "estar consciente de que puede que no seas visible para el capitan o tripulacion de una embarcacion de mayor tamano",
      "amarrar tu salvavidas al bote, de forma segura, de tal forma que este no se extravie o se pierda"
    ],
    correctAnswer: 2,
    hint: "Piensa en como te ven los botes grandes.",
    imageUrl: ""
  },
  {
    id: 69,
    question: "Ves una bandera ondeando desde una boya flotando en el agua. La bandera es roja con una linea o franja diagonal blanca. Esto indica:",
    options: [
      "agua segura en el lado sur de la boya",
      "un buen sitio para anclar",
      "un buzo bajo el agua",
      "el centro del canal con agua segura a todo su alrededor"
    ],
    correctAnswer: 2,
    hint: "La bandera advierte actividad bajo la superficie.",
    imageUrl: ""
  },
  {
    id: 70,
    question: "Operar una embarcacion bajo __________ de alcohol en la sangre se considera una violacion a la Ley 430, segun enmendada.",
    options: [
      "0.05%",
      "0.08%",
      "0.10%",
      "0.15%"
    ],
    correctAnswer: 1,
    hint: "La cifra coincide con el limite legal comun.",
    imageUrl: ""
  },
  {
    id: 71,
    question: "Se considera una actividad prohibida segun lo establece la Ley de Navegacion y Seguridad Acuatica de Puerto Rico (Ley 430):",
    options: [
      "nadar en un area demarcada para banistas",
      "amarrar una embarcacion a las boyas del area demarcada para banistas",
      "operar una embarcacion en estado de embriaguez",
      "alternativas b y c son correctas"
    ],
    correctAnswer: 3,
    hint: "La clave es identificar que dos opciones aplican.",
    imageUrl: ""
  },
  {
    id: 72,
    question: "Cualquier agente del orden publico podra detener y abordar cualquier embarcacion, nave, vehiculo de navegacion o vehiculo de campo traviesa, asi como poner bajo arresto a su operador cuando:",
    options: [
      "tuviese motivo fundado para creer que el mismo esta siendo utilizado en violacion a las disposiciones de ley",
      "tuviese motivo fundado para creer que su operador esta manejando bajo los efectos de bebidas embriagantes o sustancias controladas",
      "las alternativas a y b son correctas",
      "ninguna de las alternativas son correctas"
    ],
    correctAnswer: 2,
    hint: "La opcion correcta une dos condiciones validas.",
    imageUrl: ""
  },
  {
    id: 73,
    question: "Las areas reservadas para banistas son aquellas:",
    options: [
      "delimitadas exclusivamente para el bano y areas aledanas",
      "donde se observan personas nadando",
      "donde se permite anclar embarcaciones",
      "todas las alternativas son correctas"
    ],
    correctAnswer: 0,
    hint: "La definicion depende de su delimitacion.",
    imageUrl: ""
  },
  {
    id: 74,
    question: "El anclaje de una embarcacion se debe observar a:",
    options: [
      "13 pies paralelos a la linea de la costa u orilla",
      "14 pies paralelos a la linea de la costa u orilla",
      "15 pies paralelos a la costa u orilla",
      "20 pies paralelos de la costa u orilla"
    ],
    correctAnswer: 2,
    hint: "La distancia correcta es la opcion central mayor.",
    imageUrl: ""
  },
  {
    id: 75,
    question: "El operador y los pasajeros de una motora acuatica tienen que:",
    options: [
      "vestir un salvavidas si nacio despues del 1ro. de julio de 1972",
      "vestir un salvavidas si es menor de 12 anos",
      "no tienen que vestir salvavidas",
      "vestir un salvavidas mientras la motora acuatica se encuentre en movimiento"
    ],
    correctAnswer: 3,
    hint: "La exigencia aplica mientras esta operando.",
    imageUrl: ""
  }
];

/**
 * Retorna el banco completo de 75 preguntas en orden aleatorio (Fisher-Yates).
 * Si se pide menos de 75, solo devuelve ese prefijo del arreglo mezclado.
 *
 * Nota: el examen oficial usa este orden aleatorio; la practica NO lo usa
 * (la practica siempre muestra las primeras 10 en orden fijo via slice(0,10)).
 */
export function getRandomQuestions(count: number = 75): ExamQuestion[] {
  const shuffled = [...examQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
