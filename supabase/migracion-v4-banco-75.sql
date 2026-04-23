-- =============================================================
-- MIGRACION V4: Banco de 75 preguntas nuevas, soporte de imagenes
-- y eliminacion de persistencia del examen de practica
-- =============================================================
-- Proposito:
--   1) Limpiar datos historicos de "examen de practica" (ya no se guardan)
--   2) Prohibir a nivel de schema futuros inserts con exam_type='practica'
--   3) Anadir columna image_url a exam_questions
--   4) Reemplazar las 85 preguntas anteriores por las 75 nuevas del CSV
--   5) Crear bucket de imagenes 'exam-images' con policies de acceso
--
-- Como ejecutar:
--   Supabase Dashboard -> SQL Editor -> pegar este archivo -> Run
--
-- Este script es IDEMPOTENTE: puede ejecutarse mas de una vez sin danar
-- los datos (usa IF NOT EXISTS, ON CONFLICT, DROP CONSTRAINT IF EXISTS).
-- =============================================================

-- -------------------------------------------------------------
-- PASO 1: Limpieza y bloqueo de intentos de practica
-- -------------------------------------------------------------
-- Borra todos los intentos historicos del examen de practica.
-- Las respuestas individuales se borran automaticamente por el
-- ON DELETE CASCADE que ya existe en exam_attempt_answers.
DELETE FROM exam_attempts WHERE exam_type = 'practica';

-- Prohibe nuevos inserts con exam_type='practica' a nivel de schema.
-- Esto es "defensa en profundidad": aunque el codigo ya no inserta
-- practicas, si algun codigo antiguo o error lo intentara, la base
-- de datos lo rechazaria.
ALTER TABLE exam_attempts
  DROP CONSTRAINT IF EXISTS exam_attempts_no_practica;

ALTER TABLE exam_attempts
  ADD CONSTRAINT exam_attempts_no_practica
  CHECK (exam_type <> 'practica');

-- -------------------------------------------------------------
-- PASO 2: Anadir columna image_url a exam_questions
-- -------------------------------------------------------------
ALTER TABLE exam_questions
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';

-- -------------------------------------------------------------
-- PASO 3: Borrar las preguntas viejas (85) y reiniciar la secuencia
-- -------------------------------------------------------------
DELETE FROM exam_questions;
ALTER SEQUENCE exam_questions_id_seq RESTART WITH 1;

-- -------------------------------------------------------------
-- PASO 4: Insertar las 75 preguntas nuevas con IDs explicitos 1..75
-- -------------------------------------------------------------
-- Solo la pregunta #28 trae image_url = '/exam-images/boat-q28.png'.
-- El resto queda con cadena vacia (no se renderiza nada en pantalla).
INSERT INTO exam_questions
  (id, question, option_a, option_b, option_c, option_d, correct_index, hint, image_url)
VALUES
  (1, 'Como se comportaria un bote si se cargara por encima o mas alla de la capacidad especificada o estipulada en la placa de capacidad?', 'este navegara mejor', 'este sera mas facil de detener', 'este sera dificil de controlar', 'este sera mucho mas rapido', 2, 'La carga excesiva complica el manejo.', ''),
  (2, 'Ponerse el salvavidas cuando se esta en el agua:', 'es mas facil ya que el salvavidas flota', 'es mas facil ya que los tirantes del salvavidas estan mojados y flexibles', 'es mas dificil de ponerselo rapido ya que los salvavidas tienen una fuerza boyante considerable', 'es mas dificil ya que estos todavia deben estar en su empaque original envueltos en celofan', 2, 'La flotacion hace mas lento ponerselo.', ''),
  (3, 'Cual es una caracteristica de un chaleco salvavidas Tipo III?', 'esta disenado para ser usado como un objeto que se puede lanzar', 'este sea considerado como un buen chaleco salvavidas para aguas turbulentas (mar picado) en alta mar', 'este tiene una fuerza boyante o flotabilidad mayor que todos los demas chalecos', 'este no volteara boca arriba a la mayoria de las personas inconscientes que lo esten usando', 3, 'Piensa en lo que no hace con una persona inconsciente.', ''),
  (4, 'Que debes buscar cuando seleccionas un salvavidas?', 'uso, tipo y tamano', 'estilo y costo', 'habilidad de nadar del usuario o persona', 'el tipo de bote donde lo vas a usar', 0, 'La respuesta combina criterios basicos de eleccion.', ''),
  (5, 'Cual precaucion de seguridad debe tomarse primero, por el operador de un bote, cuando este navegando en aguas tormentosas, o aguas picadas, o con mal tiempo?', 'cerrar todas las escotillas', 'enviar mensaje por radiotelefono de socorro "MAYDAY"', 'asegurarse que todos abordo tengan puesto un chaleco salvavidas aprobado por la Guardia Costanera de los Estados Unidos (USCG)', 'pedir ayuda inmediatamente a la Guardia Costanera', 2, 'Primero protege a las personas a bordo.', ''),
  (6, 'Despues de haber usado un salvavidas inflable, que paso debes seguir para asegurarte que este sera funcional en el futuro?', 'rellenar el cartucho o cilindro de CO2', 'usas la valvula oral de inflar para rellenar el salvavidas', 'lo envias al USCG para inspeccion', 'reemplaza el cilindro o cartucho de CO2 y lo ensamblas o re-armas de nuevo', 3, 'Hay que dejar el equipo listo para usarse otra vez.', ''),
  (7, 'Que factor determina el numero y tamano de los extintores de fuegos que debes llevar abordo de un bote recreacional?', 'el calado del bote', 'el largo del bote', 'el tipo del material del casco', 'el numero de pasajeros', 1, 'La medida del bote define ese requisito.', ''),
  (8, 'Senales de bengala marinos son senales populares de pirotecnia visual para pedir socorro o notificar el estar en apuros. Estos estan marcados con una fecha de expiracion:', 'que puede ignorarse ya que usted usualmente tiene algunas senales adicionales como reserva o reemplazo', 'que es de 10 anos despues de la fecha de fabricacion', 'que es igual a la fecha de registracion del bote', 'que significa la fecha limite en que cumplen con los requisitos de la Guardia Costera ("Coast Guard")', 3, 'La fecha indica hasta cuando cumplen la norma.', ''),
  (9, 'Los conocimientos de navegacion, cabotaje o pilotaje ("Piloting") le dara dos habilidades invaluables de seguridad: 1) la habilidad de determinar tu posicion en cualquier momento, y 2) la habilidad de:', 'seleccionar la ruta mas segura y eficiente de un lugar a otro', 'determinar la localizacion de los mejores sitios o lugares para pescar', 'determinar la localizacion de todos los tocones y troncos de arbol sumergidos en tu area o vecindad', 'pronosticar el tiempo', 0, 'La otra destreza tiene que ver con el recorrido.', ''),
  (10, 'Que luces de navegacion deben ser visibles en la proa de un bote de motor de 19 pies que este navegando de noche?', 'roja sobre verde, montadas o apiladas verticalmente', 'verde sobre roja, montadas o apiladas verticalmente', 'roja en el lado de babor, verde en el lado de estribor', 'verde en el lado de babor, roja en el lado de estribor', 2, 'Recuerda el color de cada costado.', ''),
  (11, 'Un operador o capitan de embarcacion que es consciente de la seguridad, nunca prende el motor de un bote antes de:', 'oler o usar el olfato para detectar vapores de combustible en el compartimiento del motor y el combustible', 'que todos los pasajeros esten confortablemente sentados en la cabina, borda o espejo', 'haber chequeado de que hay bastante alcohol y aditivos en el combustible', 'haber chequeado o leido el informe climatologico en el periodico del domingo', 0, 'Antes de arrancar, verifica si hay vapores.', ''),
  (12, 'Para evitar quedarse sin combustible, usted debe estimar o determinar la capacidad usable de su tanque de combustible y el rendimiento de consumo, y entonces:', 'traes combustible adicional en envases faciles de usar como lo es una jarra o galon plastico de leche', 'planificas tener suficiente combustible para llegar a la proxima marina con estacion de combustible (gasolinera)', 'planificas en usar 1/2 tanque para llegar a tu destino, y 1/2 tanque para llegar al hogar', 'planificas en usar 1/3 de tanque para llegar a tu destino, un 1/3 de tanque para llegar a tu hogar, y 1/3 para emergencias', 3, 'Una parte del combustible se reserva para imprevistos.', ''),
  (13, 'Cual es una senal tipica de que se aproxima mal tiempo?', 'no hay cambios en la velocidad y direccion del viento por un periodo largo de tiempo', 'nubes amontonandose, oscureciendo, y aumentando en tamano', 'corrientes marinas cambiando de direccion', 'un aumento en la presion barometrica', 1, 'Mira el desarrollo de las nubes.', ''),
  (14, 'Como deberia ser manejado un bote cuando es atrapado en ventiscas o ventarrones y aguas turbulentas o mar picado?', 'girar el bote de tal forma que las olas las tomaras de lado ("broadside")', 'reduzca la velocidad y dirijase hacia las olas con un angulo leve', 'aumente la velocidad y suavice el comportamiento de la embarcacion', 'gire el bote hacia aguas mas profundas', 1, 'La proa no debe quedar totalmente de lado a las olas.', ''),
  (15, 'Cuando llegamos a un muelle o giramos para entrar en un espacio estrecho, la persona que esta al timon debe entender como varia el punto de pivote del bote. Donde esta el punto de pivote tipico cuando marchas hacia atras?', 'causa que el bote avance en circulos', 'aproximadamente a 1/3 del largo del bote desde la popa', 'afecta el consumo de combustible del bote', 'es similar al radio de giro de un carro', 1, 'El punto de giro se desplaza hacia atras.', ''),
  (16, 'Que cotejo de mantenimiento rutinario debes hacer antes de encender el motor de tu bote?', 'pulir las superficies brillosas de tal forma que sean resbaladizas cuando te le pares encima', 'escuchar el informe del tiempo en el radio VHF', 'verificar o chequear la fecha de expiracion de la pistola de bengalas ("flare gun")', 'chequear que las mangas del motor esten firmes y libres de goteo', 3, 'Busca firmeza y ausencia de fugas.', ''),
  (17, 'Como deberian usarse las cadenas de seguridad con el enganche del arrastre?', 'cruzados sobre la lanza (poste de enganche) del carreton o remolque', 'cruzado debajo de la lanza o lengueta del carreton o remolque', 'amarrado al parachoques ("bumper") del vehiculo que remolca', 'amarrado a la winche (malacate) del carreton o arrastre', 1, 'La posicion correcta crea soporte bajo la lanza.', ''),
  (18, 'Que condiciones afectan el juicio de una persona, hacen que la persona no piense claramente, reduce la habilidad del operador del bote para sobrevivir en el agua, y es la causa mayor que contribuye en los accidentes del bote?', 'indigestion', 'mareo', 'el uso de alcohol y drogas', 'fatiga por el calor', 2, 'Piensa en el factor que altera juicio y reaccion.', ''),
  (19, 'Que debes hacerle al bote antes de echarle combustible?', 'abrir todas las puertas', 'abrir todas las escotillas delanteras', 'cerrar todas las puertas y escotillas', 'cerrar todas las escotillas a favor del viento y abrir todas las escotillas en contra del viento', 2, 'Antes de llenar, evita que entren vapores al interior.', ''),
  (20, 'En un bote de recreo o placer, la localizacion del equipo de emergencia (chalecos salvavidas, extintores de fuego, senales visuales de emergencia, radio, etc.), debe verificarse antes de partir. Quienes deben participar para verificar o revisar la localizacion?', 'todos abordo', 'la tripulacion con paga de la embarcacion', 'todos los que no saben nadar', 'adultos con la edad de 21 y mayores', 0, 'Todos deben saber donde esta el equipo.', ''),
  (21, 'Para que se usa un "float plan"?', 'para informar a un amigo responsable sobre tu plan de viaje en bote', 'para describir las areas de una marina', 'para definir las reparaciones que se haran a tu bote', 'para identificar cualquier dispositivo de flotacion fijo en tu bote', 0, 'Se comparte con alguien responsable antes de salir.', ''),
  (22, 'El uso de alcohol y drogas es un problema significativo en el agua. De acuerdo a las estadisticas del "USCG", el 50% de todos los accidentes fatales envuelven el haber ingerido alcohol. El alcohol:', 'no tiene ningun efecto en la habilidad para sobrevivir si cayeras al agua', 'no tiene ningun efecto en tu juicio o habilidad de pensar claramente', 'aumenta los efectos de fatiga del operador del bote', 'aumenta tu flexibilidad y mejora tu balance cuando estas parado sobre el borde de los lados del casco', 2, 'Su efecto se suma al cansancio.', ''),
  (23, 'Cuando operas o manejas un bote cerca de otros botes, o cuando entras a un area congestionada, por que debes atento a la ola que tu generas o produces?', 'esta puede usarse para juzgar distancia contra otros', 'esta no debe ser mayor de tres pulgadas de alto', 'esta puede causar lesion personal o dano', 'esta puede usarse para estimar la velocidad del bote', 2, 'La estela puede afectar a otros.', ''),
  (24, 'Como el uso de alcohol afecta a los operadores de bote o a los pasajeros?', 'las reacciones fisicas se tornan mas lentas', 'la habilidad de razonar se torna mas rapida', 'la percepcion de profundidad se agudiza', 'el balance y sentido de direccion mejora', 0, 'Piensa en el efecto sobre el tiempo de reaccion.', ''),
  (25, 'Cuando es que tu puedes obviar, desviar o ignorar una Regla de la Guardia Costanera de los EUA?', 'cuando otro bote que viene detras te esta pasando para irse al frente', 'cuando todavia estas dentro de una marina', 'cuando tu estas operando una embarcacion menor de 14 pies de largo', 'cuando es necesario para evitar una colision o choque', 3, 'La excepcion existe solo para evitar un peligro mayor.', ''),
  (26, 'Durante que horario aplica a los botes que esten navegando, la responsabilidad de mantener vigilancia humana, por via visual y auditiva?', 'puesta del sol hasta el amanecer', 'amanecer hasta puesta del sol', 'en todo momento', 'durante lluvia o neblina', 2, 'No depende de la hora del dia.', ''),
  (27, 'De acuerdo a las Reglas de Navegacion, que factor se toma en cuenta para determinar una velocidad segura?', 'las condiciones de visibilidad', 'la velocidad maxima del bote', 'el numero de pasajeros', 'la capacidad indicada en la placa del bote', 0, 'La velocidad segura cambia con lo que puedes ver.', ''),
  (28, 'En la situacion de botes de motor mostrada arriba, que se deberia esperar que hiciera el bote "B" para aminorar las posibilidades de un choque o colision con el bote "A"?', 'bajar la velocidad y/o virar a babor', 'bajar la velocidad y mantener el curso', 'aumentar la velocidad y/o virar a estribor', 'mantener el curso y velocidad actual', 3, 'Usa la opcion que marcaste en la imagen.', '/exam-images/boat-q28.png'),
  (29, 'Cuando esta navegando se requiere que usted proceda a una velocidad segura y mantenga vigilancia o atencion en todo momento. La atencion y vision o vigilancia adecuada son factores mayores en:', 'encontrar lineas de demarcacion', 'evita una colision o choque', 'medir la temperatura del agua para determinar las aguas mas calmadas', 'determinar la precision de la direccion de la brujula', 1, 'La funcion principal es prevenir incidentes.', ''),
  (30, 'Cuando te encuentras de frente con otro bote de motor, este emite un bocinazo o pito corto. Que te esta comunicando o diciendo el operador de la otra embarcacion?', 'su intencion de mantener curso y velocidad', 'que mi timon esta a la izquierda y piensa cambiar su curso a babor', 'que se apresta a cambiar curso hacia estribor para pasar babor con babor', 'que se prepara a anclar en un minuto para permitir que el trafico pase', 2, 'Un sonido corto indica un cambio simple de rumbo.', ''),
  (31, 'Cuando dejas la marina y te encaminas hacia alta mar y ves una boya roja, como tu deberias actuar o proceder:', 'quedarme no menos de 20 yardas alejado de la boya', 'quedarme totalmente alejado de la boya', 'mantener la boya a mi lado de estribor', 'mantener la boya a mi lado de babor', 3, 'Piensa en la regla al salir hacia mar abierto.', ''),
  (32, 'Marcadores (rotulos) de Regulaciones e Informacion son faciles de identificar a traves de que rasgos o caracteristicas?', 'lineas verticales negras y blancas', 'forma triangular y letras rojas', 'color blanco con formas geometricas de naranja', 'simbolo amarillo cuadrado o triangular', 2, 'Se reconocen por el fondo y las figuras.', ''),
  (33, 'Cual es el factor principal a considerarse cuando planeas acercarte con tu embarcacion al muelle donde te vas a amarrar?', 'el informe o pronostico del tiempo para esa noche', 'el largo de los cabos de amarre de la embarcacion', 'la capacidad de poder parar de tu embarcacion', 'la fuerza del viento o la corriente', 3, 'Piensa en lo que mas afecta la maniobra al acercarte.', ''),
  (34, 'Cual es la tecnica adecuada para anclarse?', 'desde la borda de estribor', 'sobre el lado de babor', 'sobre el espejo o popa', 'desde la proa', 3, 'El ancla se maneja desde el extremo delantero.', ''),
  (35, 'Cual es la mejor precaucion contra el envenenamiento por monoxido de carbono?', 'mantenga aire fluyendo a traves de la embarcacion', 'prenda el ventilador (extractor de aire) del motor cuando este navegando', 'instalar una alarma de humo en la cabina delantera', 'quedarse en la parte de la popa cuando la embarcacion este navegando', 0, 'La circulacion de aire es clave.', ''),
  (36, 'Cual es la primera accion requerida de un operador de bote que haya presenciado un accidente de bote?', 'mantengase alejado o fuera del camino', 'provea asistencia o ayuda si es posible', 'escriba un reporte del incidente', 'espere a que llegue personal de rescate', 1, 'Primero ayuda, si puedes hacerlo con seguridad.', ''),
  (37, 'Si su embarcacion se vuelca cuando usted esta lejos de la orilla, cual seria la accion mas segura a seguir?', 'nadar hacia la orilla mas cercana', 'nadar hacia la embarcacion mas cercana', 'quedarse con el bote y subirse o treparse encima si es posible', 'quedarse en el agua al lado del bote y mantenerse en movimiento en el agua', 2, 'La embarcacion sigue siendo tu mejor apoyo.', ''),
  (38, 'Cuando es que un bote es menos estable y propenso a volcarse boca abajo?', 'cuando el peso o la carga esta distribuida uniformemente', 'cuando los tanques de combustible estan medio vacios', 'cuando se esta en aguas profundas', 'cuando se esta con sobrepeso o sobre cargado', 3, 'La carga excesiva reduce estabilidad.', ''),
  (39, 'Cual es la forma recomendada de moverse o caminar dentro de un bote pequeno?', 'limitese a moverse en la mitad delantera del bote', 'mantengase agachado y muevase cerca de la linea del centro del bote', 'mantengase erguido o derecho con los pies separados para mejor balance', 'acomode las personas en un lado y muevase a traves del lado opuesto', 1, 'Conviene mantenerse bajo y centrado.', ''),
  (40, 'Cual es la accion recomendable al encontrarse con visibilidad limitada de cualquier tipo:', 'pongase el equipo para mal tiempo para protegerse del frio y de mojarse', 'determine su posicion tan precisa como sea posible mientras haya visibilidad para hacerlo', 'toque o timbre la campana del barco un timbre corto cada segundo para avisarle a otras embarcaciones de su presencia', 'use su transmisor cada tres minutos para anunciar que usted se esta moviendo o navegando y le pide a las demas embarcaciones que se mantengan fuera de su camino', 1, 'Ubicate bien antes de perder referencia visual.', ''),
  (41, 'Cuando estas solo, abandonado o aislado en agua fria, y tienes puesto tu salvavidas aprobado por el USCG, que debes hacer para evitar perder calor corporal?', 'mantener el cuerpo en movimiento en el agua', 'nade con brazadas de pecho en circulos grande', 'contraiga las rodillas y brazos hacia el pecho', 'flote boca arriba con sus brazos y piernas extendidas', 2, 'La postura debe conservar calor, no gastarlo.', ''),
  (42, 'Para evitar una lesion grave causada por la helice de tu motor, como tu deberias acercartele a un banista o nadador en un area designada como area de banistas o para nadar?', 'solamente cuando el salvavidas no este trabajando.', 'solamente cuando el salvavidas este trabajando', 'nunca se le acerque a un banista que este en un area designada como area para banistas', 'desde viento abajo del banista y dentro de las sogas', 2, 'La zona marcada excluye esa aproximacion.', ''),
  (43, 'A que parte del fuego tu debes apuntar cuando usas un extintor de fuegos?', 'al tope', 'a un lado', 'a la base', 'al medio', 2, 'El punto eficaz esta donde comienza el fuego.', ''),
  (44, 'Cual es el primer paso o accion que se debe seguir o tomar, cuando una embarcacion encalla o se vara?', 'llamar a la Guardia Costanera', 'buscar infiltraciones o goteras de agua', 'averiguar la profundidad del agua', 'poner el motor en reversa o marcha hacia atras', 1, 'Primero verifica si hubo entrada de agua.', ''),
  (45, 'Operadores de canoa o remeros estan particularmente en riesgo de una situacion peligrosa llamada:', 'fatiga de los boteros', 'a la deriva', 'entrampamiento', 'fatiga por agua fria', 3, 'La respuesta menciona un efecto del agua.', ''),
  (46, 'Que accion pudiera causar la perdida de la habilidad de guiar en una motora acuatica o PWC?', 'poner el control de la gasolina al maximo', 'soltar el control de la gasolina', 'no girar el guia lo suficiente', 'girar el guia en exceso o demasiado', 1, 'En PWC, el giro depende del empuje.', ''),
  (47, 'Que Regla(s) de Navegacion aplica(n) a un bote propulsado por chorro de agua (PWC)?', 'un PWC debe mostrar sus luces de navegacion cuando se usa despues de anochecer', 'normalmente un PWC tiene prioridad de movimiento en situaciones de encuentro o cruce', 'un PWC esta exento de todas las reglas y regulaciones que aplican para botes', 'operadores se tienen que adherir a muchas de las mismas reglas y regulaciones que aplican a botes grandes', 3, 'No esta exento por ser pequeno o distinto.', ''),
  (48, 'Debido a las diferentes caracteristicas de operar, algunos estados consideran las motoras acuaticas (PWC) como una clase especial de bote y tienen regulaciones especiales para estos. Como operador de una motora acuatica (PWC), usted tiene que:', 'llevar abordo una copia de las reglas de la Comision de Reglas Especiales para PWC', 'estar consciente de/y proceder de acuerdo a todas las leyes que gobiernan o regulan el uso de motoras acuaticas en su area', 'conocer las Reglas Especiales de la Navegacion que aplican unicamente a los PWCs', 'seguir las reglas establecidas por la Asociacion Nacional de Navegacion', 1, 'La clave es conocer y seguir la ley local aplicable.', ''),
  (49, 'Remolcar a esquiadores en el agua, tablas para las olas generadas por el bote, y tubos es muy popular y divertido. Se requieren procedimientos especiales para la seguridad de todas las personas envueltas que incluyen:', 'remolcar lo mas cerca posible y justamente despues de la puesta del sol, porque es cuando el agua es normalmente mas calmada', 'remolcar en aguas profundas, canales estrechos para asegurarse de que el agua sea lo suficientemente profunda', 'mantener la mayor distancia posible de los barcos, muelles y casa-botes con un minimo de 200 pies de ancho para el paso del esquiador', 'estar cerca de otros botes recreacionales de tal forma que ellos puedan ayudar en recoger personas cuando estas se caen', 2, 'Busca espacio amplio y separacion.', ''),
  (50, 'Que reglas de navegacion aplican a operadores envueltos en la pesca recreacional?', 'solamente aquellas reglas de navegacion que son especificamente para deportistas', 'reglas del Servicio Nacional de Pesca y Vida Silvestre ("US Fish and Wildlife Service")', 'las mismas reglas que aplican a todos los operadores de embarcacion', 'reglas de navegacion para cuando es de dia', 2, 'Pescar no elimina las reglas generales.', ''),
  (51, 'Las areas azules en una carta indican:', 'agua profunda y segura', 'areas sujetas a la fluctuacion de la marea', 'agua relativamente llana', 'tierra seca', 2, 'No se refiere a tierra ni a gran profundidad.', ''),
  (52, 'Las cartas, para areas sujetas o expuestas a la marea, siempre muestran el espacio libre vertical hacia los objetos altos en:', 'mitad de la marea', 'marea baja', 'un plano de referencia escogido por las autoridades del pueblo', 'el promedio de la marea alta', 1, 'La referencia es la condicion de menor nivel.', ''),
  (53, 'En el sistema cuadriculado que hace posible identificar cualquier punto en la superficie de la tierra, lineas laterales imaginarias o paralelos de latitud:', 'corren hacia el este y oeste', 'corren norte y sur', 'son numeradas de 0 a 180', 'corren a traves de los polos geograficos', 0, 'Los paralelos rodean la tierra de lado a lado.', ''),
  (54, 'Una forma precisa de determinar donde te encuentras en el agua es:', 'mirando la brujula o compas', 'encontrando tu posicion en los ("Local Notice to Mariners") Comunicados Locales para Marineros', 'encontrando tu posicion relativa a un objeto o ayuda a la navegacion que este identificado en la carta', 'preguntandole al operador de un bote que pase cerca', 2, 'Relaciona tu posicion con una referencia en la carta.', ''),
  (55, 'La direccion verdadera en una carta es medida desde 000 hasta 359 en direccion a favor de las manecillas del reloj desde:', 'el rumbo o direccion de la brujula', 'el norte geografico verdadero', 'el sur geografico verdadero', 'desde la Linea de Lubber ("Lubber''s Line")', 1, 'La medida parte del norte correcto de la carta.', ''),
  (56, 'La Rosa Nautica y _________ te indicaran el norte verdadero y te dara la direccion norte- sur en las cartas.', 'los meridianos de longitud', 'el bloque del titulo de la carta', 'los paralelos de latitud', 'la escala de las millas nauticas', 0, 'La otra referencia corre de norte a sur.', ''),
  (57, 'El maximo de caballaje permitido por ley para operar una embarcacion en lagos es de:', '10 caballos de fuerza', '20 caballos de fuerza', '30 caballos de fuerza', '40 caballos de fuerza', 3, 'Es la cifra mayor entre las opciones.', ''),
  (58, 'Si una brujula o compas esta debidamente instalada y la desviacion es cero, los numeros en la tarjeta del compas cuando se lee la Linea de Lubber ("Lubber''s Line"), esta estara indicando la direccion o rumbo hacia donde se dirige el bote, con referencia a:', 'el norte magnetico', 'la estrella polar', 'el norte verdadero', 'la linea de centro del bote', 0, 'Sin desviacion, la referencia sigue siendo magnetica.', ''),
  (59, 'Instale una brujula o compas de tal forma que:', 'la tarjeta del compas se pueda ver desde cualquier parte del bote', 'este lo mas cerca posible de tu radio VHF', 'no este en el camino--en cualquier lugar que puedas encontrarle un lugar', 'una linea que atraviesa el "Lubber''s Line" y el centro del compas tambien este paralelo a la quilla', 3, 'Debe quedar alineado con el eje del bote.', ''),
  (60, 'Cuantas horas tiene usted para informar a cualquier agente del orden publico cuando ocurre un accidente donde hay danos a la propiedad que excedan los $100.00?', '12 horas', '24 horas', '48 horas', '72 horas', 1, 'La notificacion se hace dentro de un dia.', ''),
  (61, 'Una milla nautica es:', 'mas pequena que una milla terrestre o estatuaria', 'igual a un minuto de longitud', 'igual a un minuto de latitud', 'usado a lo largo de rutas o pistas costeras', 2, 'Se relaciona con una medida angular sobre la tierra.', ''),
  (62, 'Un nudo se define como:', 'algo que usted no deberia hacer', 'una milla nautica por hora', 'la velocidad de un bote cuando no es afectado por la corriente', 'una milla terrestre o estatuaria por hora', 1, 'Es una unidad de velocidad nautica.', ''),
  (63, 'El proposito principal de la Ley 430 es:', 'garantizar a la ciudadania el disfrute de playas, lagos y lagunas, dentro de un marco de seguridad', 'fijar derechos a pagar por la numeracion e inscripcion de las embarcaciones de motor', 'fijar los derechos a pagar por el uso de vehiculos de campo traviesa', 'penalizar a toda persona que incurra en un delito menos grave segun lo establece la Ley 430', 0, 'La ley combina acceso y seguridad.', ''),
  (64, 'Que velocidad maxima debe mantener una embarcacion cuando navega dentro de los 150 pies paralelos a la costa u orilla en area NO demarcada para banistas?', '5 mph', '10 mph', '25 mph', 'no hay limite de velocidad establecido', 1, 'La opcion correcta es el limite intermedio.', ''),
  (65, 'Las profundidades en una carta pueden estar en pies, metros, o brazas. La unidad de medida se puede determinar de:', 'Comunicado a los Marineros ("Notice to Mariners")', 'Almanaque Nautico ("Nautical Almanac")', 'el bloque donde esta el titulo de la carta', 'lectura del medidor o metro de brazas ("Fathometer Readings")', 2, 'Ese dato aparece en la informacion principal de la carta.', ''),
  (66, 'Los conocimientos de navegacion o pilotaje o cabotaje te daran DOS destrezas importantes: 1) la habilidad de seleccionar la ruta mas segura de un sitio a otro, y 2) la habilidad de:', 'encontrar el sitio mas cercano para abastecerse de combustible', 'determinar las condiciones del tiempo para el dia en el mar', 'determinar tu posicion en cualquier momento', 'predecir el consumo de combustible', 2, 'La otra destreza es saber ubicarse.', ''),
  (67, 'Cuando descansas o confias en tu GPS para darte la posicion actual, es importante:', 'mantener una velocidad constante', 'comparar lo que ves alrededor tuyo con tu carta para estar seguro donde te encuentras y para verificar tu GPS', 'limpiar las conexiones electricas para prevenir la corrosion', 'girar usando los rumbos magneticos', 1, 'Conviene confirmar el GPS con referencias externas.', ''),
  (68, 'En la navegacion de una canoa, kayak u otro bote de remo, tu debes:', 'quedarte en el centro del canal porque tu tienes el derecho de paso', 'quedarte alejado de la costa cuando hallan rocas o escombros', 'estar consciente de que puede que no seas visible para el capitan o tripulacion de una embarcacion de mayor tamano', 'amarrar tu salvavidas al bote, de forma segura, de tal forma que este no se extravie o se pierda', 2, 'Piensa en como te ven los botes grandes.', ''),
  (69, 'Ves una bandera ondeando desde una boya flotando en el agua. La bandera es roja con una linea o franja diagonal blanca. Esto indica:', 'agua segura en el lado sur de la boya', 'un buen sitio para anclar', 'un buzo bajo el agua', 'el centro del canal con agua segura a todo su alrededor', 2, 'La bandera advierte actividad bajo la superficie.', ''),
  (70, 'Operar una embarcacion bajo __________ de alcohol en la sangre se considera una violacion a la Ley 430, segun enmendada.', '0.05%', '0.08%', '0.10%', '0.15%', 1, 'La cifra coincide con el limite legal comun.', ''),
  (71, 'Se considera una actividad prohibida segun lo establece la Ley de Navegacion y Seguridad Acuatica de Puerto Rico (Ley 430):', 'nadar en un area demarcada para banistas', 'amarrar una embarcacion a las boyas del area demarcada para banistas', 'operar una embarcacion en estado de embriaguez', 'alternativas b y c son correctas', 3, 'La clave es identificar que dos opciones aplican.', ''),
  (72, 'Cualquier agente del orden publico podra detener y abordar cualquier embarcacion, nave, vehiculo de navegacion o vehiculo de campo traviesa, asi como poner bajo arresto a su operador cuando:', 'tuviese motivo fundado para creer que el mismo esta siendo utilizado en violacion a las disposiciones de ley', 'tuviese motivo fundado para creer que su operador esta manejando bajo los efectos de bebidas embriagantes o sustancias controladas', 'las alternativas a y b son correctas', 'ninguna de las alternativas son correctas', 2, 'La opcion correcta une dos condiciones validas.', ''),
  (73, 'Las areas reservadas para banistas son aquellas:', 'delimitadas exclusivamente para el bano y areas aledanas', 'donde se observan personas nadando', 'donde se permite anclar embarcaciones', 'todas las alternativas son correctas', 0, 'La definicion depende de su delimitacion.', ''),
  (74, 'El anclaje de una embarcacion se debe observar a:', '13 pies paralelos a la linea de la costa u orilla', '14 pies paralelos a la linea de la costa u orilla', '15 pies paralelos a la costa u orilla', '20 pies paralelos de la costa u orilla', 2, 'La distancia correcta es la opcion central mayor.', ''),
  (75, 'El operador y los pasajeros de una motora acuatica tienen que:', 'vestir un salvavidas si nacio despues del 1ro. de julio de 1972', 'vestir un salvavidas si es menor de 12 anos', 'no tienen que vestir salvavidas', 'vestir un salvavidas mientras la motora acuatica se encuentre en movimiento', 3, 'La exigencia aplica mientras esta operando.', '');

-- Ajusta la secuencia para que el proximo id asignado sea 76
-- si algun dia se anade una pregunta nueva desde el admin.
SELECT setval('exam_questions_id_seq', 75, true);

-- -------------------------------------------------------------
-- PASO 5: Bucket de imagenes 'exam-images'
-- -------------------------------------------------------------
-- Bucket publico (lectura abierta) porque las imagenes se sirven
-- durante el examen sin autenticacion. La escritura queda
-- restringida al service_role desde el API admin.
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-images', 'exam-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Policy: lectura publica
DROP POLICY IF EXISTS "public read exam-images" ON storage.objects;
CREATE POLICY "public read exam-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exam-images');

-- Policy: escritura solo service_role (usada por el API admin)
DROP POLICY IF EXISTS "service write exam-images" ON storage.objects;
CREATE POLICY "service write exam-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'exam-images' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "service update exam-images" ON storage.objects;
CREATE POLICY "service update exam-images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'exam-images' AND auth.role() = 'service_role');

DROP POLICY IF EXISTS "service delete exam-images" ON storage.objects;
CREATE POLICY "service delete exam-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'exam-images' AND auth.role() = 'service_role');

-- -------------------------------------------------------------
-- PASO 6: Confirmacion inmediata en el SQL Editor
-- -------------------------------------------------------------
-- Deberia mostrar 75 filas y confirmar que Q28 tiene imagen.
SELECT COUNT(*) AS total_preguntas FROM exam_questions;
SELECT id, LEFT(question, 60) AS pregunta, image_url
  FROM exam_questions
  WHERE id = 28;
