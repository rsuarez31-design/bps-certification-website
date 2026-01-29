/**
 * ARCHIVO DE DATOS DEL EXAMEN
 * 
 * Este archivo contiene todas las 85 preguntas del examen de navegación
 * según la Ley 430 de Puerto Rico.
 * 
 * Estructura:
 * - id: Identificador único de la pregunta (1-85)
 * - question: Texto de la pregunta
 * - options: Array con las 4 opciones (a, b, c, d)
 * - correctAnswer: Índice de la respuesta correcta (0=a, 1=b, 2=c, 3=d)
 * - hint: Pista que se muestra cuando el estudiante falla muchas preguntas
 */

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0=a, 1=b, 2=c, 3=d
  hint: string;
}

export const examQuestions: ExamQuestion[] = [
  {
    id: 1,
    question: "¿Qué describe mejor a una embarcación de recreo?",
    options: [
      "Cualquier tipo de embarcación que no sea una canoa.",
      "Cualquier embarcación fabricada después de 1971.",
      "Una embarcación fabricada y utilizada principalmente para fines no comerciales.",
      "Una embarcación utilizada principalmente para fines comerciales."
    ],
    correctAnswer: 2,
    hint: "Piensa en la diferencia entre uso personal/familiar vs. uso para ganar dinero."
  },
  {
    id: 2,
    question: "¿Qué tipo de embarcación se mueve principalmente por la acción del viento sobre sus velas?",
    options: [
      "Bote de remo.",
      "Velero.",
      "Bote de motor.",
      "PWC (Moto acuática)."
    ],
    correctAnswer: 1,
    hint: "El nombre de este tipo de embarcación contiene la palabra 'vela'."
  },
  {
    id: 3,
    question: "¿Cuál es el nombre de la parte delantera de una embarcación?",
    options: [
      "Popa.",
      "Babor.",
      "Proa.",
      "Estribor."
    ],
    correctAnswer: 2,
    hint: "Es una palabra de dos sílabas que empieza con 'P' y está al frente."
  },
  {
    id: 4,
    question: "¿Cuál es el término para la parte posterior de una embarcación?",
    options: [
      "Proa.",
      "Popa.",
      "Babor.",
      "Estribor."
    ],
    correctAnswer: 1,
    hint: "También empieza con 'P' pero se refiere a la parte de atrás."
  },
  {
    id: 5,
    question: "¿Qué lado de la embarcación es 'Babor'?",
    options: [
      "El lado derecho cuando se mira hacia la proa.",
      "El lado izquierdo cuando se mira hacia la proa.",
      "El lado derecho cuando se mira hacia la popa.",
      "La parte de arriba de la embarcación."
    ],
    correctAnswer: 1,
    hint: "Babor es el lado izquierdo. Ambas palabras empiezan con consonantes."
  },
  {
    id: 6,
    question: "¿Qué lado de la embarcación es 'Estribor'?",
    options: [
      "El lado derecho cuando se mira hacia la proa.",
      "El lado izquierdo cuando se mira hacia la proa.",
      "El lado derecho cuando se mira hacia la popa.",
      "La parte de abajo de la embarcación."
    ],
    correctAnswer: 0,
    hint: "Estribor es el lado derecho. Ambas palabras empiezan con vocales."
  },
  {
    id: 7,
    question: "¿Cómo se llama la parte superior del costado de una embarcación?",
    options: [
      "Quilla.",
      "Regala (Gunwale).",
      "Espejo de popa (Transom).",
      "Casco."
    ],
    correctAnswer: 1,
    hint: "Es el borde superior donde uno se puede apoyar o sentar."
  },
  {
    id: 8,
    question: "¿Qué tipo de casco permite que la embarcación se deslice sobre el agua a altas velocidades?",
    options: [
      "Casco de desplazamiento.",
      "Casco de planeo.",
      "Casco de fondo redondo.",
      "Casco de quilla profunda."
    ],
    correctAnswer: 1,
    hint: "La palabra clave es 'planeo' - como un avión que 'planea' sobre la pista."
  },
  {
    id: 9,
    question: "¿Cuál es la función principal de la placa de capacidad de una embarcación?",
    options: [
      "Mostrar el nombre del fabricante.",
      "Indicar el peso máximo y el número máximo de personas que la embarcación puede llevar con seguridad.",
      "Indicar la velocidad máxima.",
      "Mostrar la fecha de fabricación."
    ],
    correctAnswer: 1,
    hint: "Es sobre la CAPACIDAD - cuánto peso y cuántas personas puede transportar de forma segura."
  },
  {
    id: 10,
    question: "¿Dónde debe colocarse el número de registro en una embarcación?",
    options: [
      "En el espejo de popa.",
      "En ambos lados de la mitad delantera (proa).",
      "En la parte superior de la cabina.",
      "En la quilla."
    ],
    correctAnswer: 1,
    hint: "Debe ser visible desde ambos lados y cerca del frente para identificación fácil."
  },
  {
    id: 11,
    question: "¿Qué es el 'Calado' (Draft) de una embarcación?",
    options: [
      "La distancia desde la línea de flotación hasta la parte más alta.",
      "La profundidad mínima de agua necesaria para que la embarcación flote.",
      "El ancho máximo de la embarcación.",
      "El peso total de la embarcación."
    ],
    correctAnswer: 1,
    hint: "Es importante saber qué tan profundo debe ser el agua para navegar sin tocar el fondo."
  },
  {
    id: 12,
    question: "¿Qué tipo de motor se monta generalmente en el exterior del espejo de popa?",
    options: [
      "Motor intraborda.",
      "Motor fueraborda.",
      "Motor de propulsión a chorro.",
      "Motor diésel."
    ],
    correctAnswer: 1,
    hint: "Si está 'fuera' del borde de la embarcación, es 'fuera-borda'."
  },
  {
    id: 13,
    question: "¿Qué equipo es obligatorio llevar en todas las embarcaciones de recreo para emergencias de hundimiento?",
    options: [
      "Una radio VHF.",
      "Dispositivos de Flotación Personal (PFD) para cada persona a bordo.",
      "Un GPS.",
      "Una linterna estroboscópica."
    ],
    correctAnswer: 1,
    hint: "Lo más importante en caso de hundimiento es que las personas puedan flotar."
  },
  {
    id: 14,
    question: "¿Cuál es un requisito para los PFD (Chalecos Salvavidas)?",
    options: [
      "Deben ser de color azul oscuro.",
      "Deben estar aprobados por la Guardia Costera de los EE. UU.",
      "Deben tener al menos 10 años de antigüedad.",
      "Deben guardarse en cajas cerradas con llave."
    ],
    correctAnswer: 1,
    hint: "La Guardia Costera es la autoridad que certifica equipos de seguridad marítima."
  },
  {
    id: 15,
    question: "¿Qué clase de extintor de incendios se requiere para incendios de líquidos inflamables (gasolina, aceite)?",
    options: [
      "Clase A.",
      "Clase B.",
      "Clase C.",
      "Clase D."
    ],
    correctAnswer: 1,
    hint: "Clase B es para líquidos inflamables. Recuerda: B de Barril (líquidos)."
  },
  {
    id: 16,
    question: "¿Qué dispositivo ayuda a ventilar los vapores de gasolina del compartimiento del motor?",
    options: [
      "Un ventilador eléctrico (Blower).",
      "Una bomba de achique.",
      "Un silbato.",
      "Un ancla."
    ],
    correctAnswer: 0,
    hint: "Necesitas algo que 'sople' o ventile el aire para sacar los vapores peligrosos."
  },
  {
    id: 17,
    question: "¿Qué luces de navegación deben mostrar las embarcaciones de motor durante la noche?",
    options: [
      "Luces rojas en ambos lados.",
      "Una luz roja en babor, una verde en estribor y una blanca de todo horizonte.",
      "Solo una luz blanca intermitente.",
      "Luces azules y amarillas."
    ],
    correctAnswer: 1,
    hint: "Rojo = babor (izquierda), Verde = estribor (derecha), más una luz blanca."
  },
  {
    id: 18,
    question: "¿Cuál es la función de una señal acústica (pito o campana)?",
    options: [
      "Para atraer peces.",
      "Para advertir a otras embarcaciones de su presencia o intenciones en condiciones de poca visibilidad.",
      "Para anunciar la llegada al puerto.",
      "Para comunicarse con el muelle."
    ],
    correctAnswer: 1,
    hint: "Es una herramienta de seguridad para ser escuchado cuando la visibilidad es limitada."
  },
  {
    id: 19,
    question: "¿Qué indica una boya con franjas verticales rojas y blancas?",
    options: [
      "Peligro inminente.",
      "Aguas seguras (Mid-channel).",
      "Zona de natación.",
      "Obstrucción submarina."
    ],
    correctAnswer: 1,
    hint: "Las franjas rojas y blancas verticales indican que puedes navegar en medio del canal con seguridad."
  },
  {
    id: 20,
    question: "Según las Reglas de Navegación, ¿qué debe hacer una embarcación que es 'cedente de paso'?",
    options: [
      "Mantener su curso y velocidad.",
      "Tomar una acción temprana y sustancial para mantenerse alejada de la otra embarcación.",
      "Aumentar la velocidad para pasar rápido.",
      "Detener el motor de inmediato."
    ],
    correctAnswer: 1,
    hint: "Si debes 'ceder el paso', debes moverte claramente para evitar la otra embarcación."
  },
  {
    id: 21,
    question: "¿Qué debe hacer una embarcación 'privilegiada' (stand-on)?",
    options: [
      "Cambiar de dirección inmediatamente.",
      "Mantener su curso y velocidad a menos que sea evidente que la otra embarcación no está cediendo el paso.",
      "Tocar la bocina continuamente.",
      "Dar la vuelta completa."
    ],
    correctAnswer: 1,
    hint: "Si tienes el privilegio de paso, mantente en tu curso para ser predecible."
  },
  {
    id: 22,
    question: "Cuando dos embarcaciones de motor se encuentran de frente, ¿qué deben hacer?",
    options: [
      "Ambas deben girar a babor (izquierda).",
      "Ambas deben girar a estribor (derecha) para pasar por el lado de babor de la otra.",
      "La más pequeña debe detenerse.",
      "La más rápida tiene la preferencia."
    ],
    correctAnswer: 1,
    hint: "Como al conducir un auto, cada uno gira a su derecha para evitar colisión frontal."
  },
  {
    id: 23,
    question: "¿Quién tiene la preferencia de paso: un velero bajo vela o una embarcación de motor?",
    options: [
      "La embarcación de motor siempre.",
      "El velero, a menos que esté adelantando a la embarcación de motor.",
      "El que vaya por el lado derecho.",
      "Depende del tamaño de las velas."
    ],
    correctAnswer: 1,
    hint: "Los veleros tienen limitaciones de maniobra, por eso generalmente tienen preferencia sobre motores."
  },
  {
    id: 24,
    question: "¿Cuál es el color de las boyas que marcan el lado derecho de un canal cuando se regresa del mar?",
    options: [
      "Verde.",
      "Rojo.",
      "Amarillo.",
      "Negro."
    ],
    correctAnswer: 1,
    hint: "Recuerda: 'Rojo a la derecha al volver' (Red Right Returning)."
  },
  {
    id: 25,
    question: "¿Qué frase ayuda a recordar los colores de las boyas al entrar a puerto?",
    options: [
      "'Verde a la derecha al volver'.",
      "'Rojo a la derecha al volver' (Red Right Returning).",
      "'Blanco a la izquierda siempre'.",
      "'Azul al sur'."
    ],
    correctAnswer: 1,
    hint: "Es una regla mnemotécnica en inglés muy popular: Red Right Returning."
  },
  {
    id: 26,
    question: "¿Qué indica una boya blanca con un diamante naranja?",
    options: [
      "Zona de velocidad limitada.",
      "Peligro (rocas, naufragio).",
      "Información general.",
      "Área prohibida."
    ],
    correctAnswer: 1,
    hint: "Un diamante naranja es una señal de advertencia de peligro."
  },
  {
    id: 27,
    question: "¿Qué indica una boya blanca con un círculo naranja?",
    options: [
      "Peligro.",
      "Operaciones restringidas (ej. Límite de velocidad).",
      "Área prohibida.",
      "Amarre de botes."
    ],
    correctAnswer: 1,
    hint: "Un círculo indica control o restricción, como límites de velocidad."
  },
  {
    id: 28,
    question: "¿Cuál es el principal peligro de consumir alcohol mientras se navega?",
    options: [
      "Aumenta la velocidad de la embarcación.",
      "Afecta el juicio, el equilibrio y el tiempo de reacción.",
      "Mejora la visión nocturna.",
      "Ayuda a mantener el calor corporal."
    ],
    correctAnswer: 1,
    hint: "El alcohol tiene los mismos efectos peligrosos en el agua que al conducir un auto."
  },
  {
    id: 29,
    question: "¿Qué sucede si un operador se niega a realizar una prueba de sobriedad?",
    options: [
      "No pasa nada.",
      "Se le da una advertencia verbal.",
      "Puede perder sus privilegios de navegación y enfrentar multas.",
      "Debe pagar una pequeña propina."
    ],
    correctAnswer: 2,
    hint: "Negarse a la prueba tiene consecuencias legales graves, similar a las carreteras."
  },
  {
    id: 30,
    question: "¿A qué distancia mínima deben mantenerse las embarcaciones de una bandera de buceo ('Diver Down')?",
    options: [
      "10 pies.",
      "50 pies.",
      "100 pies (en aguas abiertas generalmente más).",
      "500 pies."
    ],
    correctAnswer: 2,
    hint: "Los buceadores necesitan espacio considerable para seguridad - piensa en al menos un campo de fútbol de longitud."
  },
  {
    id: 31,
    question: "¿Qué debe hacer si alguien cae al agua (Hombre al agua)?",
    options: [
      "Seguir navegando y llamar a la policía.",
      "Girar la popa (y la hélice) lejos de la persona y lanzarle un dispositivo de flotación.",
      "Tirarse al agua de inmediato sin chaleco.",
      "Aumentar la velocidad para buscar ayuda."
    ],
    correctAnswer: 1,
    hint: "Lo más importante es proteger a la persona de la hélice y darle algo para flotar."
  },
  {
    id: 32,
    question: "¿Cuál es el peligro del Monóxido de Carbono (CO)?",
    options: [
      "Es un gas visible y con olor a flores.",
      "Es un gas incoloro, inodoro y altamente tóxico producido por los motores.",
      "Ayuda a respirar mejor en el mar.",
      "Solo se encuentra en los veleros."
    ],
    correctAnswer: 1,
    hint: "El CO es peligroso precisamente porque NO puedes verlo ni olerlo, pero es mortal."
  },
  {
    id: 33,
    question: "¿Qué debe hacer antes de llenar el tanque de gasolina en un muelle?",
    options: [
      "Dejar el motor encendido.",
      "Apagar el motor y cerrar todas las escotillas y puertas.",
      "Encender un cigarrillo para relajarse.",
      "Mantener el radio a todo volumen."
    ],
    correctAnswer: 1,
    hint: "Los vapores de gasolina son extremadamente inflamables - necesitas eliminar todas las fuentes de ignición."
  },
  {
    id: 34,
    question: "¿Cuál es la causa principal de la mayoría de los accidentes fatales en embarcaciones?",
    options: [
      "Rayos.",
      "Incendios.",
      "Ahogamiento por no usar PFD tras caídas o vuelcos.",
      "Ataques de tiburones."
    ],
    correctAnswer: 2,
    hint: "La mayoría de las muertes ocurren porque las personas no llevaban puesto su chaleco salvavidas."
  },
  {
    id: 35,
    question: "¿Qué factor meteorológico es más peligroso para un navegante?",
    options: [
      "El sol brillante.",
      "Cambios repentinos en el viento y nubes oscuras (tormentas).",
      "La marea baja.",
      "La brisa suave."
    ],
    correctAnswer: 1,
    hint: "Las tormentas pueden aparecer rápidamente y crear condiciones peligrosas en minutos."
  },
  {
    id: 36,
    question: "¿Cómo se debe acercar una embarcación a un muelle para atracar?",
    options: [
      "A máxima velocidad.",
      "Contra el viento o la corriente (lo que sea más fuerte) para un mejor control.",
      "A favor del viento siempre.",
      "De popa primero sin mirar."
    ],
    correctAnswer: 1,
    hint: "Ir contra el viento/corriente te permite frenar naturalmente y tener más control."
  },
  {
    id: 37,
    question: "¿Qué es el 'Corte de seguridad del motor' (Engine Cut-Off Switch)?",
    options: [
      "Un interruptor para encender las luces.",
      "Un dispositivo que apaga el motor si el operador cae por la borda.",
      "Un botón para aumentar la potencia.",
      "El control del aire acondicionado."
    ],
    correctAnswer: 1,
    hint: "Es un dispositivo de seguridad que se conecta al operador y detiene el motor si se separa."
  },
  {
    id: 38,
    question: "¿Qué documento debe llevarse a bordo siempre que la embarcación esté operando?",
    options: [
      "El certificado de título original.",
      "El certificado de número de registro (original o copia según la ley).",
      "El manual del motor.",
      "Un mapa de carreteras."
    ],
    correctAnswer: 1,
    hint: "Similar a la licencia de conducir de un auto, necesitas el registro a bordo."
  },
  {
    id: 39,
    question: "¿Qué edad mínima se requiere en muchos estados para operar una PWC (Moto acuática) sin supervisión?",
    options: [
      "8 años.",
      "10 años.",
      "14 o 16 años (varía por estado, pero suele ser la respuesta estándar en exámenes).",
      "21 años."
    ],
    correctAnswer: 2,
    hint: "Es similar a la edad para conducir ciclomotores - entre la adolescencia temprana y media."
  },
  {
    id: 40,
    question: "¿A qué hora está generalmente prohibido operar una PWC?",
    options: [
      "Al mediodía.",
      "Entre la puesta del sol y la salida del sol (noche).",
      "Durante la mañana.",
      "Cuando hay otros botes cerca."
    ],
    correctAnswer: 1,
    hint: "Las PWC no tienen las luces de navegación requeridas para operación nocturna."
  },
  {
    id: 41,
    question: "¿Qué es necesario para que una PWC pueda girar?",
    options: [
      "Apagar el motor.",
      "Tener potencia (aceleración). Si se suelta el acelerador, se pierde el control de dirección.",
      "Bajar un ancla.",
      "Moverse hacia la parte trasera."
    ],
    correctAnswer: 1,
    hint: "Las PWC necesitan el flujo de agua del motor para dirigir - sin aceleración, no hay dirección."
  },
  {
    id: 42,
    question: "¿Qué equipo adicional debe llevar una embarcación que remolca a un esquiador?",
    options: [
      "Un segundo motor.",
      "Un observador competente o un espejo retrovisor de gran angular (según la ley estatal).",
      "Una caña de pescar.",
      "Luces de discoteca."
    ],
    correctAnswer: 1,
    hint: "El operador necesita observar al esquiador - ya sea con otra persona o con un espejo."
  },
  {
    id: 43,
    question: "¿Qué indica una bandera roja con una franja blanca diagonal?",
    options: [
      "Barco en peligro.",
      "Buceador en el agua (Bandera de buceo recreativa).",
      "Área de carreras.",
      "Fin de la zona navegable."
    ],
    correctAnswer: 1,
    hint: "Esta bandera advierte que hay buceadores bajo el agua en el área."
  },
  {
    id: 44,
    question: "¿Cuál es la mejor manera de prevenir la propagación de especies acuáticas invasoras (como el mejillón cebra)?",
    options: [
      "Pintar el bote de colores brillantes.",
      "Lavar, drenar y secar el bote y el equipo antes de ir a otro cuerpo de agua.",
      "Navegar solo en agua salada.",
      "Dejar el agua acumulada en la sentina."
    ],
    correctAnswer: 1,
    hint: "Las especies invasoras viajan en el agua o adheridas al equipo - limpieza total es clave."
  },
  {
    id: 45,
    question: "¿Qué debe hacer si su embarcación se vuelca?",
    options: [
      "Tratar de nadar hacia la orilla aunque esté lejos.",
      "Quedarse con la embarcación (flotar sobre ella o agarrarse).",
      "Quitarse el chaleco salvavidas para nadar mejor.",
      "Gritar hasta quedarse sin aliento."
    ],
    correctAnswer: 1,
    hint: "La embarcación es más visible para los rescatistas y te ayuda a conservar energía."
  },
  {
    id: 46,
    question: "¿Qué tipo de extintor debe llevar una embarcación de menos de 26 pies?",
    options: [
      "Al menos uno de Clase B-I.",
      "Al menos tres de Clase A.",
      "Ninguno.",
      "Uno de Clase D."
    ],
    correctAnswer: 0,
    hint: "Embarcaciones pequeñas necesitan al menos un extintor Clase B (para líquidos inflamables) tamaño I."
  },
  {
    id: 47,
    question: "¿Dónde se encuentra la línea de 'Estribor'?",
    options: [
      "A la izquierda.",
      "A la derecha.",
      "Al frente.",
      "Atrás."
    ],
    correctAnswer: 1,
    hint: "Recuerda: Estribor = Derecha (ambas con vocales al inicio)."
  },
  {
    id: 48,
    question: "¿Qué información se encuentra en el Título de una embarcación?",
    options: [
      "El historial de pesca del dueño.",
      "Prueba de propiedad de la embarcación.",
      "El menú del puerto.",
      "Las reglas de etiqueta."
    ],
    correctAnswer: 1,
    hint: "El título es el documento legal que prueba quién es el dueño."
  },
  {
    id: 49,
    question: "¿Qué es un 'Plan de Flotación' (Float Plan)?",
    options: [
      "Un dibujo del bote.",
      "Un documento dejado en tierra con detalles del viaje y personas a bordo.",
      "El manual de instrucciones del ancla.",
      "Una receta de comida marina."
    ],
    correctAnswer: 1,
    hint: "Es como dejar una nota diciendo a dónde vas y cuándo vuelves - para seguridad."
  },
  {
    id: 50,
    question: "¿Qué tipo de ancla es más común para embarcaciones pequeñas?",
    options: [
      "Ancla de cemento.",
      "Ancla tipo Danforth o de arado.",
      "Un bloque de madera.",
      "Una cadena simple."
    ],
    correctAnswer: 1,
    hint: "Las anclas Danforth y de arado son diseños específicos muy efectivos para botes pequeños."
  },
  {
    id: 51,
    question: "¿Qué debe hacer si se encuentra en condiciones de niebla densa?",
    options: [
      "Aumentar la velocidad para salir rápido.",
      "Reducir la velocidad a la mínima necesaria para mantener el rumbo y emitir señales sonoras.",
      "Apagar todas las luces.",
      "Anclar en medio del canal."
    ],
    correctAnswer: 1,
    hint: "En niebla, ve despacio, escucha y haz ruido para que otros te escuchen."
  },
  {
    id: 52,
    question: "¿Cuál es el propósito de las señales visuales de socorro (VDS)?",
    options: [
      "Para iluminar la cubierta en fiestas.",
      "Para pedir ayuda en caso de emergencia.",
      "Para asustar a las aves.",
      "Para marcar el final de una carrera."
    ],
    correctAnswer: 1,
    hint: "VDS son herramientas para señalar que necesitas ayuda de emergencia."
  },
  {
    id: 53,
    question: "¿Qué es la 'Hipotermia'?",
    options: [
      "Un exceso de energía.",
      "Una pérdida peligrosa de calor corporal por exposición al agua o aire frío.",
      "Una alergia al pescado.",
      "Una técnica de buceo."
    ],
    correctAnswer: 1,
    hint: "'Hipo' significa bajo, 'termia' se refiere a temperatura - baja temperatura corporal."
  },
  {
    id: 54,
    question: "¿Cuál es la regla de oro para el mantenimiento del motor?",
    options: [
      "Nunca cambiar el aceite.",
      "Seguir el programa de mantenimiento del fabricante.",
      "Usar gasolina con mucho etanol.",
      "Solo revisarlo cuando se rompa."
    ],
    correctAnswer: 1,
    hint: "El fabricante sabe mejor que nadie cómo cuidar su motor - sigue sus instrucciones."
  },
  {
    id: 55,
    question: "¿Qué indica una luz blanca visible desde todas las direcciones en una embarcación de motor de menos de 39.4 pies?",
    options: [
      "Que la embarcación está pescando.",
      "Que la embarcación está anclada o navegando (según el contexto de otras luces).",
      "Que es un barco de policía.",
      "Que el barco está hundiéndose."
    ],
    correctAnswer: 1,
    hint: "Una luz blanca de 360° puede indicar diferentes cosas dependiendo de si hay otras luces encendidas."
  },
  {
    id: 56,
    question: "¿Cómo se llama la cuerda o cadena conectada al ancla?",
    options: [
      "Cabo de ancla (Rode).",
      "Cordón.",
      "Hilo.",
      "Escota."
    ],
    correctAnswer: 0,
    hint: "En terminología náutica, la línea del ancla se llama 'rode' en inglés o 'cabo de ancla'."
  },
  {
    id: 57,
    question: "¿A qué lado debe dejar una boya roja al navegar hacia aguas arriba (hacia la fuente)?",
    options: [
      "Babor.",
      "Estribor (Derecha).",
      "Detrás.",
      "Por debajo."
    ],
    correctAnswer: 1,
    hint: "Hacia arriba es como 'regresar' al interior - aplica 'Rojo a la derecha al volver'."
  },
  {
    id: 58,
    question: "¿Qué significa 'Navegación por estima' (Dead Reckoning)?",
    options: [
      "Adivinar dónde se está.",
      "Calcular la posición actual basada en una posición anterior, velocidad y tiempo.",
      "Usar solo el GPS.",
      "Preguntar a otros navegantes."
    ],
    correctAnswer: 1,
    hint: "Es un cálculo matemático usando tu última posición conocida más tu velocidad y dirección."
  },
  {
    id: 59,
    question: "¿Qué es el 'Escobén' (Hawsepipe)?",
    options: [
      "Una parte del motor.",
      "El orificio por donde pasa la cadena del ancla.",
      "Un tipo de remo.",
      "Una ventana."
    ],
    correctAnswer: 1,
    hint: "Es el tubo o agujero en el casco por donde baja y sube la cadena del ancla."
  },
  {
    id: 60,
    question: "¿Cuál es el efecto de la corriente en la maniobrabilidad?",
    options: [
      "No tiene efecto.",
      "Puede desviar la embarcación de su curso planeado.",
      "Siempre ayuda a ir más rápido.",
      "Solo afecta a los veleros."
    ],
    correctAnswer: 1,
    hint: "La corriente es como un río invisible que empuja tu embarcación hacia un lado."
  },
  {
    id: 61,
    question: "¿Qué es un 'Nudo' en términos de velocidad náutica?",
    options: [
      "Una milla terrestre por hora.",
      "Una milla náutica por hora.",
      "Diez kilómetros por hora.",
      "La longitud de una cuerda."
    ],
    correctAnswer: 1,
    hint: "En navegación, un nudo es la velocidad de una milla náutica por hora."
  },
  {
    id: 62,
    question: "¿Cuántos pies tiene una milla náutica aproximadamente?",
    options: [
      "5,280 pies.",
      "6,076 pies.",
      "3,000 pies.",
      "10,000 pies."
    ],
    correctAnswer: 1,
    hint: "Una milla náutica es más larga que una milla terrestre - unos 6,076 pies."
  },
  {
    id: 63,
    question: "¿Qué es el 'Francobordo' (Freeboard)?",
    options: [
      "La parte del barco bajo el agua.",
      "La distancia desde la línea de flotación hasta la cubierta o regala.",
      "El costo de estacionar el barco.",
      "Un tipo de vela."
    ],
    correctAnswer: 1,
    hint: "Es la altura de la embarcación que está 'libre' sobre el agua - no sumergida."
  },
  {
    id: 64,
    question: "¿Cuál es el uso de un 'Bichero' (Boat hook)?",
    options: [
      "Para pescar tiburones.",
      "Para ayudar a atracar o recuperar objetos del agua.",
      "Para limpiar el motor.",
      "Como remo de emergencia."
    ],
    correctAnswer: 1,
    hint: "Es una vara larga con gancho que te ayuda a alcanzar el muelle o agarrar cosas en el agua."
  },
  {
    id: 65,
    question: "¿Qué tipo de embarcación tiene prioridad en un canal estrecho?",
    options: [
      "La más pequeña y ágil.",
      "Una embarcación grande que solo puede navegar con seguridad dentro del canal.",
      "El que vaya más rápido.",
      "Cualquiera que use remos."
    ],
    correctAnswer: 1,
    hint: "Los barcos grandes tienen menos capacidad de maniobra en canales estrechos."
  },
  {
    id: 66,
    question: "¿Qué debe hacer si ve una luz verde y una blanca en la noche?",
    options: [
      "Se acerca a un velero por babor.",
      "Se acerca al lado de estribor de una embarcación de motor.",
      "Se acerca a un barco anclado.",
      "Debe detenerse inmediatamente."
    ],
    correctAnswer: 1,
    hint: "Verde = estribor (derecha). Estás viendo el lado derecho de otra embarcación."
  },
  {
    id: 67,
    question: "¿Qué significa 'Estar al garete' (Adrift)?",
    options: [
      "Estar bien amarrado.",
      "Estar sin control, moviéndose solo por el viento o corriente.",
      "Estar navegando a vela.",
      "Estar hundido."
    ],
    correctAnswer: 1,
    hint: "Estar 'a la deriva' o 'al garete' significa flotar sin control, sin motor ni ancla."
  },
  {
    id: 68,
    question: "¿Cuál es la función del 'Arraigo' (Cleat)?",
    options: [
      "Medir la profundidad.",
      "Asegurar las cuerdas (cabos) de amarre.",
      "Decorar la proa.",
      "Servir de asiento."
    ],
    correctAnswer: 1,
    hint: "Los cleats son las piezas de metal con forma especial donde atas las cuerdas."
  },
  {
    id: 69,
    question: "¿Qué es el 'Pantoque' (Bilge)?",
    options: [
      "La parte más alta del mástil.",
      "La parte más baja del interior del casco donde se acumula el agua.",
      "El timón.",
      "La cabina del capitán."
    ],
    correctAnswer: 1,
    hint: "Es el 'sótano' del barco donde el agua se acumula en el fondo."
  },
  {
    id: 70,
    question: "¿Para qué sirve una 'Bomba de achique' (Bilge pump)?",
    options: [
      "Para inflar los chalecos.",
      "Para sacar el agua que se acumula en el pantoque.",
      "Para dar presión a la ducha.",
      "Para enfriar el motor."
    ],
    correctAnswer: 1,
    hint: "La bomba de achique saca el agua acumulada del fondo del barco."
  },
  {
    id: 71,
    question: "¿Qué es un 'Waypoints' en navegación GPS?",
    options: [
      "Un tipo de pez.",
      "Coordenadas geográficas grabadas para marcar una posición o ruta.",
      "El nombre de un fabricante de botes.",
      "Una señal de tráfico marítimo."
    ],
    correctAnswer: 1,
    hint: "Son puntos de referencia que guardas en tu GPS para marcar lugares importantes."
  },
  {
    id: 72,
    question: "¿Qué es 'Abatir' (Leeway)?",
    options: [
      "Ir muy rápido.",
      "El movimiento lateral de una embarcación causado por el viento.",
      "Anclar correctamente.",
      "Limpiar el casco."
    ],
    correctAnswer: 1,
    hint: "El viento lateral empuja la embarcación hacia un lado - ese movimiento es el abatimiento."
  },
  {
    id: 73,
    question: "¿Cuál es el propósito de un 'Ánodo de sacrificio'?",
    options: [
      "Como amuleto de buena suerte.",
      "Para proteger las partes metálicas del motor de la corrosión galvánica.",
      "Para pesar más el bote.",
      "Para mejorar la estética."
    ],
    correctAnswer: 1,
    hint: "Se 'sacrifica' corroyéndose él para proteger otras partes metálicas más importantes."
  },
  {
    id: 74,
    question: "¿Qué significa 'Trim' en una embarcación de motor?",
    options: [
      "El color de la pintura.",
      "El ángulo del motor respecto al espejo de popa para nivelar la embarcación.",
      "Cortar el césped del muelle.",
      "La limpieza de las velas."
    ],
    correctAnswer: 1,
    hint: "Ajustar el trim cambia el ángulo del motor para optimizar el desempeño."
  },
  {
    id: 75,
    question: "¿Qué es el 'Paso' (Pitch) de una hélice?",
    options: [
      "El diámetro de la hélice.",
      "La distancia teórica que avanza la hélice en una revolución completa.",
      "El material de la hélice.",
      "La velocidad de rotación."
    ],
    correctAnswer: 1,
    hint: "Como un tornillo, el 'paso' es cuánto avanzaría la hélice en cada vuelta completa."
  },
  {
    id: 76,
    question: "¿Qué debe hacer si su motor se incendia?",
    options: [
      "Abrir la tapa del motor para ver mejor.",
      "Cortar el suministro de combustible y usar el extintor.",
      "Echarle gasolina para apagarlo.",
      "Nadar lejos y dejar el bote solo."
    ],
    correctAnswer: 1,
    hint: "Primero elimina el combustible, luego apaga el fuego con el extintor apropiado."
  },
  {
    id: 77,
    question: "¿Qué es un 'Aparato de gobierno' (Steering gear)?",
    options: [
      "El GPS.",
      "El sistema que conecta el volante con el timón o motor.",
      "La cocina del barco.",
      "El equipo de pesca."
    ],
    correctAnswer: 1,
    hint: "Es el sistema mecánico que traduce el movimiento del volante en dirección del barco."
  },
  {
    id: 78,
    question: "¿Qué indica una boya con franjas horizontales rojas y verdes?",
    options: [
      "Una bifurcación en el canal; el color de arriba indica el canal preferido.",
      "Zona de peligro absoluto.",
      "Estacionamiento para botes.",
      "Área de esquí acuático."
    ],
    correctAnswer: 0,
    hint: "Cuando el canal se divide, el color superior te dice cuál es el camino preferido."
  },
  {
    id: 79,
    question: "¿Qué es la 'Manga' (Beam) de una embarcación?",
    options: [
      "El largo total.",
      "El ancho máximo de la embarcación.",
      "Un tipo de motor.",
      "La profundidad del agua."
    ],
    correctAnswer: 1,
    hint: "La manga es la medida del ancho más amplio del barco."
  },
  {
    id: 80,
    question: "¿Qué es la 'Estanqueidad'?",
    options: [
      "El color del agua.",
      "La capacidad de un casco o estructura para evitar que entre agua.",
      "Un tipo de pez.",
      "La velocidad del viento."
    ],
    correctAnswer: 1,
    hint: "'Estanco' significa hermético, que no deja pasar agua."
  },
  {
    id: 81,
    question: "¿Qué es un 'Defensa' (Fender)?",
    options: [
      "Un abogado marítimo.",
      "Un cojín o parachoques para proteger el casco contra el muelle u otros botes.",
      "El parachoques de un auto.",
      "Una luz de navegación."
    ],
    correctAnswer: 1,
    hint: "Son los 'cojines' que cuelgas del lado del barco para que no se raye al atracar."
  },
  {
    id: 82,
    question: "¿Qué es 'Bornear' (Swinging)?",
    options: [
      "Bailar en cubierta.",
      "El giro de una embarcación anclada alrededor de su ancla por viento o corriente.",
      "Pescar con red.",
      "Cambiar de capitán."
    ],
    correctAnswer: 1,
    hint: "Cuando estás anclado, el barco 'baila' alrededor del ancla con el viento."
  },
  {
    id: 83,
    question: "¿Cuál es la función del 'Espejo de popa' (Transom)?",
    options: [
      "Reflejar la luz del sol.",
      "La parte plana de la popa donde se suelen montar los motores fueraborda.",
      "Servir de ventana al mar.",
      "Sujetar el mástil."
    ],
    correctAnswer: 1,
    hint: "Es la 'pared' trasera plana del barco donde se atornilla el motor."
  },
  {
    id: 84,
    question: "¿Qué es la 'Escora' (Heel)?",
    options: [
      "La parte trasera del pie.",
      "La inclinación lateral de una embarcación, común en veleros.",
      "Un tipo de ancla.",
      "La velocidad máxima."
    ],
    correctAnswer: 1,
    hint: "Los veleros se 'inclinan' hacia un lado con el viento - esa inclinación es la escora."
  },
  {
    id: 85,
    question: "¿Qué es un 'Bichero' o 'Boathook'?",
    options: [
      "Un dispositivo para atrapar peces.",
      "Una vara con punta y gancho para ayudar en el atraque.",
      "Un tipo de nudo.",
      "Una parte del timón."
    ],
    correctAnswer: 1,
    hint: "Es una herramienta esencial para alcanzar el muelle o agarrar cuerdas desde lejos."
  }
];

/**
 * FUNCIÓN PARA SELECCIONAR PREGUNTAS ALEATORIAS
 * 
 * Esta función toma el array completo de 85 preguntas y devuelve
 * 75 preguntas seleccionadas aleatoriamente para cada intento del examen.
 * 
 * @param count - Número de preguntas a seleccionar (default: 75)
 * @returns Array de preguntas aleatorias
 */
export function getRandomQuestions(count: number = 75): ExamQuestion[] {
  // Crear una copia del array original para no modificarlo
  const shuffled = [...examQuestions];
  
  // Algoritmo de Fisher-Yates para mezclar aleatoriamente
  // Este es el método más eficiente y justo de aleatorización
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generar un índice aleatorio entre 0 e i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    
    // Intercambiar elementos en las posiciones i y j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Devolver solo las primeras 'count' preguntas del array mezclado
  return shuffled.slice(0, count);
}
