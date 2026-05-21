-- =============================================================
-- MIGRACION V10: Actualizar las 75 preguntas de exam_questions
--               con la version revisada (acentos correctos)
-- =============================================================
-- Proposito:
--   Actualizar question, option_a..d, correct_index y hint en las 75
--   preguntas existentes (ids 1..75). NO modifica image_url.
--
-- Como ejecutar:
--   Supabase Dashboard -> SQL Editor -> pegar este archivo -> Run
--
-- Notas:
--   * Idempotente: puede ejecutarse mas de una vez sin dano.
--   * Usa UPDATE (no DELETE+INSERT) para preservar los ids y no
--     romper los registros historicos en exam_attempt_answers.
--   * Usa dollar-quoting ($q$...$q$) para evitar escapar comillas,
--     apostrofes y acentos.
--   * No se toca la columna image_url.
-- =============================================================

BEGIN;

UPDATE exam_questions SET
  question = $q$Como se comportaria un bote si se cargara por encima o mas alla de la capacidad especificada o estipulada en la placa de capacidad?$q$,
  option_a = $q$este navegar mejor$q$,
  option_b = $q$este será mas fácil de detener$q$,
  option_c = $q$este será más difcil de controlar.$q$,
  option_d = $q$este sera mucho más rápido$q$,
  correct_index = 2,
  hint = $q$La carga excesiva complica el manejo.$q$
WHERE id = 1;

UPDATE exam_questions SET
  question = $q$Ponerse el salvavidas cuando se esta en el agua:$q$,
  option_a = $q$es más fácil ya que el salvavidas flota$q$,
  option_b = $q$es mas fácil ya que los tirantes del salvavidas estan mojados y flexibles$q$,
  option_c = $q$es más difícil de ponerselo rapido ya que los salvavidas tienen una fuerza boyante considerable$q$,
  option_d = $q$es mas difícil ya que estos todavía deben estar en su empaque original envueltos en celofán$q$,
  correct_index = 2,
  hint = $q$La flotacion hace mas lento ponerselo.$q$
WHERE id = 2;

UPDATE exam_questions SET
  question = $q$Cual es una característica de un chaleco salvavidas Tipo III?$q$,
  option_a = $q$esta diseñado para ser usado como un objeto que se puede lanzar$q$,
  option_b = $q$este sea considerado como un buen chaleco salvavidas para aguas turbulentas (mar picado) en alta mar$q$,
  option_c = $q$este tiene una fuerza boyante o flotabilidad mayor que todos los demás chalecos$q$,
  option_d = $q$este no volteará boca arriba a la mayoria de las personas inconscientes que lo esten usando$q$,
  correct_index = 3,
  hint = $q$Piensa en lo que no hace con una persona inconsciente.$q$
WHERE id = 3;

UPDATE exam_questions SET
  question = $q$Que debes buscar cuando seleccionas un salvavidas?$q$,
  option_a = $q$uso, tipo y tamao$q$,
  option_b = $q$estilo y costo$q$,
  option_c = $q$habilidad de nadar del usuario o persona$q$,
  option_d = $q$el tipo de bote donde lo vas a usar$q$,
  correct_index = 0,
  hint = $q$La respuesta combina criterios básicos de elección.$q$
WHERE id = 4;

UPDATE exam_questions SET
  question = $q$Cual precaución de seguridad debe tomarse primero, por el operador de un bote, cuando este navegando en aguas tormentosas, o aguas picadas, o con mal tiempo?$q$,
  option_a = $q$cerrar todas las escotillas$q$,
  option_b = $q$enviar mensaje por radio VHS de socorro "MAYDAY"$q$,
  option_c = $q$asegurarse que todos abordo tengan puesto un chaleco salvavidas aprobado por la Guardia Costanera de los Estados Unidos (USCG)$q$,
  option_d = $q$pedir ayuda inmediatamente a la Guardia Costanera$q$,
  correct_index = 2,
  hint = $q$Primero protege a las personas a bordo.$q$
WHERE id = 5;

UPDATE exam_questions SET
  question = $q$Después de haber usado un salvavidas inflable, que paso debes seguir para asegurarte que este sera funcional en el futuro?$q$,
  option_a = $q$rellenar el cartucho o cilindro de CO2$q$,
  option_b = $q$usas la valvula oral de inflar para rellenar el salvavidas$q$,
  option_c = $q$lo envías al USCG para inspección$q$,
  option_d = $q$reemplaza el cilindro o cartucho de CO2 y lo ensamblas o re-armas de nuevo$q$,
  correct_index = 3,
  hint = $q$Hay que dejar el equipo listo para usarse otra vez.$q$
WHERE id = 6;

UPDATE exam_questions SET
  question = $q$Que factor determina el numero y tamano de los extintores de fuegos que debes llevar abordo de un bote recreacional?$q$,
  option_a = $q$el calado del bote$q$,
  option_b = $q$el largo del bote$q$,
  option_c = $q$el tipo del material del casco$q$,
  option_d = $q$el número de pasajeros$q$,
  correct_index = 1,
  hint = $q$La medida del bote define ese requisito.$q$
WHERE id = 7;

UPDATE exam_questions SET
  question = $q$Señales de bengala marinos son senales populares de pirotecnia visual para pedir socorro o notificar el estar en apuros. Estos estan marcados con una fecha de expiracion:$q$,
  option_a = $q$que puede ignorarse ya que usted usualmente tiene algunas señales adicionales como reserva o reemplazo$q$,
  option_b = $q$que es de 10 años después de la fecha de fabricacin$q$,
  option_c = $q$que es igual a la fecha de registracion del bote$q$,
  option_d = $q$que significa la fecha limite en que cumplen con los requisitos de la Guardia Costera ("Coast Guard")$q$,
  correct_index = 3,
  hint = $q$La fecha indica hasta cuando cumplen la norma.$q$
WHERE id = 8;

UPDATE exam_questions SET
  question = $q$Los conocimientos de navegación, cabotaje o pilotaje ("Piloting") le dara dos habilidades invaluables de seguridad: 1) la habilidad de determinar tu posicion en cualquier momento, y 2) la habilidad de:$q$,
  option_a = $q$seleccionar la ruta mas segura y eficiente de un lugar a otro$q$,
  option_b = $q$determinar la localizacion de los mejores sitios o lugares para pescar$q$,
  option_c = $q$determinar la localizacion de todos los tocones y troncos de arbol sumergidos en tu area o vecindad$q$,
  option_d = $q$pronosticar el tiempo$q$,
  correct_index = 0,
  hint = $q$La otra destreza tiene que ver con el recorrido.$q$
WHERE id = 9;

UPDATE exam_questions SET
  question = $q$Que luces de navegacion deben ser visibles en la proa de un bote de motor de 19 pies que este navegando de noche?$q$,
  option_a = $q$roja sobre verde, montadas o apiladas verticalmente$q$,
  option_b = $q$verde sobre roja, montadas o apiladas verticalmente$q$,
  option_c = $q$roja en el lado de babor, verde en el lado de estribor$q$,
  option_d = $q$verde en el lado de babor, roja en el lado de estribor$q$,
  correct_index = 2,
  hint = $q$Recuerda el color de cada costado.$q$
WHERE id = 10;

UPDATE exam_questions SET
  question = $q$Un operador o capitán de embarcacion que es consciente de la seguridad, nunca prende el motor de un bote antes de:$q$,
  option_a = $q$oler o usar el olfato para detectar vapores de combustible en el compartimiento del motor y el combustible$q$,
  option_b = $q$que todos los pasajeros esten confortablemente sentados en la cabina, borda o espejo$q$,
  option_c = $q$haber chequeado de que hay bastante alcohol y aditivos en el combustible$q$,
  option_d = $q$haber chequeado o leido el informe climatologico en el periódico del domingo$q$,
  correct_index = 0,
  hint = $q$Antes de arrancar, verifica si hay vapores.$q$
WHERE id = 11;

UPDATE exam_questions SET
  question = $q$Para evitar quedarse sin combustible, usted debe estimar o determinar la capacidad usable de su tanque de combustible y el rendimiento de consumo, y entonces:$q$,
  option_a = $q$traes combustible adicional en envases faciles de usar como lo es una jarra o galón plástico de leche$q$,
  option_b = $q$planificas tener suficiente combustible para llegar a la proxima marina con estacion de combustible (gasolinera)$q$,
  option_c = $q$planificas en usar 1/2 tanque para llegar a tu destino, y 1/2 tanque para llegar al hogar$q$,
  option_d = $q$planificas en usar 1/3 de tanque para llegar a tu destino, un 1/3 de tanque para llegar a tu hogar, y 1/3 para emergencias$q$,
  correct_index = 3,
  hint = $q$Una parte del combustible se reserva para imprevistos.$q$
WHERE id = 12;

UPDATE exam_questions SET
  question = $q$Cual es una señal típica de que se aproxima mal tiempo?$q$,
  option_a = $q$no hay cambios en la velocidad y direccion del viento por un periodo largo de tiempo$q$,
  option_b = $q$nubes amontonandose, oscureciendo, y aumentando en tamaño$q$,
  option_c = $q$corrientes marinas cambiando de dirección$q$,
  option_d = $q$un aumento en la presion barométrica$q$,
  correct_index = 1,
  hint = $q$Mira el desarrollo de las nubes.$q$
WHERE id = 13;

UPDATE exam_questions SET
  question = $q$Como deberia ser manejado un bote cuando es atrapado en ventiscas o ventarrones y aguas turbulentas o mar picado?$q$,
  option_a = $q$girar el bote de tal forma que las olas las tomaras de lado ("broadside")$q$,
  option_b = $q$reduzca la velocidad y dirjase hacia las olas con un angulo leve$q$,
  option_c = $q$aumente la velocidad y suavice el comportamiento de la embarcacion$q$,
  option_d = $q$gire el bote hacia aguas mas profundas$q$,
  correct_index = 1,
  hint = $q$La proa no debe quedar totalmente de lado a las olas.$q$
WHERE id = 14;

UPDATE exam_questions SET
  question = $q$Cuando llegamos a un muelle o giramos para entrar en un espacio estrecho, la persona que esta al timón debe entender como varía el punto de pivote del bote. Donde esta el punto de pivote típico cuando marchas hacia atrás?$q$,
  option_a = $q$causa que el bote avance en circulos$q$,
  option_b = $q$aproximadamente a 1/3 del largo del bote desde la popa$q$,
  option_c = $q$afecta el consumo de combustible del bote$q$,
  option_d = $q$es similar al radio de giro de un carro$q$,
  correct_index = 1,
  hint = $q$El punto de giro se desplaza hacia atras.$q$
WHERE id = 15;

UPDATE exam_questions SET
  question = $q$Que cotejo de mantenimiento rutinario debes hacer antes de encender el motor de tu bote?$q$,
  option_a = $q$pulir las superficies brillosas de tal forma que sean resbaladizas cuando te le pares encima$q$,
  option_b = $q$escuchar el informe del tiempo en el radio VHF$q$,
  option_c = $q$verificar o chequear la fecha de expiración de la pistola de bengálas ("flare gun")$q$,
  option_d = $q$chequear que las mangas del motor esten firmes y libres de goteo$q$,
  correct_index = 3,
  hint = $q$Busca firmeza y ausencia de fugas.$q$
WHERE id = 16;

UPDATE exam_questions SET
  question = $q$Como deberian usarse las cadenas de seguridad con el enganche del arrastre?$q$,
  option_a = $q$cruzados sobre la lanza (poste de enganche) del carretón o remolque$q$,
  option_b = $q$cruzado debajo de la lanza o lengueta del carretón o remolque$q$,
  option_c = $q$amarrado al parachoques ("bumper") del vehículo que remolca$q$,
  option_d = $q$amarrado a la winche (malacate) del carreton o arrastre$q$,
  correct_index = 1,
  hint = $q$La posicion correcta crea soporte bajo la lanza.$q$
WHERE id = 17;

UPDATE exam_questions SET
  question = $q$Que condiciones afectan el juicio de una persona, hacen que la persona no piense claramente, reduce la habilidad del operador del bote para sobrevivir en el agua, y es la causa mayor que contribuye en los accidentes del bote?$q$,
  option_a = $q$indigestion$q$,
  option_b = $q$mareo$q$,
  option_c = $q$el uso de alcohol y drogas$q$,
  option_d = $q$fatiga por el calor$q$,
  correct_index = 2,
  hint = $q$Piensa en el factor que altera juicio y reaccion.$q$
WHERE id = 18;

UPDATE exam_questions SET
  question = $q$Que debes hacerle al bote antes de echarle combustible?$q$,
  option_a = $q$abrir todas las puertas$q$,
  option_b = $q$abrir todas las escotillas delanteras$q$,
  option_c = $q$cerrar todas las puertas y escotillas$q$,
  option_d = $q$cerrar todas las escotillas a favor del viento y abrir todas las escotillas en contra del viento$q$,
  correct_index = 2,
  hint = $q$Antes de llenar, evita que entren vapores al interior.$q$
WHERE id = 19;

UPDATE exam_questions SET
  question = $q$En un bote de recreo o placer, la localizacion del equipo de emergencia (chalecos salvavidas, extintores de fuego, señales visuales de emergencia, radio, etc.), debe verificarse antes de partir. Quienes deben participar para verificar o revisar la localizacion?$q$,
  option_a = $q$todos abordo$q$,
  option_b = $q$la tripulacion con paga de la embarcacin$q$,
  option_c = $q$todos los que no saben nadar$q$,
  option_d = $q$adultos con la edad de 21 y mayores$q$,
  correct_index = 0,
  hint = $q$Todos deben saber donde esta el equipo.$q$
WHERE id = 20;

UPDATE exam_questions SET
  question = $q$Para que se usa un "float plan"?$q$,
  option_a = $q$para informar a un amigo responsable sobre tu plan de viaje en bote$q$,
  option_b = $q$para describir las areas de una marina$q$,
  option_c = $q$para definir las reparaciones que se haran a tu bote$q$,
  option_d = $q$para identificar cualquier dispositivo de flotacion fijo en tu bote$q$,
  correct_index = 0,
  hint = $q$Se comparte con alguien responsable antes de salir.$q$
WHERE id = 21;

UPDATE exam_questions SET
  question = $q$El uso de alcohol y drogas es un problema significativo en el agua. De acuerdo a las estadisticas del "USCG", el 50% de todos los accidentes fatales envuelven el haber ingerido alcohol. El alcohol:$q$,
  option_a = $q$no tiene ningun efecto en la habilidad para sobrevivir si cayeras al agua$q$,
  option_b = $q$no tiene ningun efecto en tu juicio o habilidad de pensar claramente$q$,
  option_c = $q$aumenta los efectos de fatiga del operador del bote$q$,
  option_d = $q$aumenta tu flexibilidad y mejora tu balance cuando estas parado sobre el borde de los lados del casco$q$,
  correct_index = 2,
  hint = $q$Su efecto se suma al cansancio.$q$
WHERE id = 22;

UPDATE exam_questions SET
  question = $q$Cuando operas o manejas un bote cerca de otros botes, o cuando entras a un area congestionada, por que debes estar atento a la ola que tu generas o produces?$q$,
  option_a = $q$esta puede usarse para juzgar distancia contra otros$q$,
  option_b = $q$esta no debe ser mayor de tres pulgadas de alto$q$,
  option_c = $q$esta puede causar lesion personal o daño$q$,
  option_d = $q$esta puede usarse para estimar la velocidad del bote$q$,
  correct_index = 2,
  hint = $q$La estela puede afectar a otros.$q$
WHERE id = 23;

UPDATE exam_questions SET
  question = $q$Como el uso de alcohol afecta a los operadores de bote o a los pasajeros?$q$,
  option_a = $q$las reacciones fisicas se tornan mas lentas$q$,
  option_b = $q$la habilidad de razonar se torna mas rapida$q$,
  option_c = $q$la percepcion de profundidad se agudiza$q$,
  option_d = $q$el balance y sentido de direccion mejora$q$,
  correct_index = 0,
  hint = $q$Piensa en el efecto sobre el tiempo de reaccion.$q$
WHERE id = 24;

UPDATE exam_questions SET
  question = $q$Cuando es que tu puedes obviar, desviar o ignorar una Regla de la Guardia Costanera de los EUA?$q$,
  option_a = $q$cuando otro bote que viene detras te esta pasando para irse al frente$q$,
  option_b = $q$cuando todavia estas dentro de una marina$q$,
  option_c = $q$cuando tu estas operando una embarcacion menor de 14 pies de largo$q$,
  option_d = $q$cuando es necesario para evitar una colisión o choque$q$,
  correct_index = 3,
  hint = $q$La excepción existe solo para evitar un peligro mayor.$q$
WHERE id = 25;

UPDATE exam_questions SET
  question = $q$Durante que horario aplica a los botes que esten navegando, la responsabilidad de mantener vigilancia humana, por via visual y auditiva?$q$,
  option_a = $q$puesta del sol hasta el amanecer$q$,
  option_b = $q$amanecer hasta puesta del sol$q$,
  option_c = $q$en todo momento$q$,
  option_d = $q$durante lluvia o neblina$q$,
  correct_index = 2,
  hint = $q$No depende de la hora del dia.$q$
WHERE id = 26;

UPDATE exam_questions SET
  question = $q$De acuerdo a las Reglas de Navegacion, que factor se toma en cuenta para determinar una velocidad segura?$q$,
  option_a = $q$las condiciones de visibilidad$q$,
  option_b = $q$la velocidad maxima del bote$q$,
  option_c = $q$el numero de pasajeros$q$,
  option_d = $q$la capacidad indicada en la placa del bote$q$,
  correct_index = 0,
  hint = $q$La velocidad segura cambia con lo que puedes ver.$q$
WHERE id = 27;

UPDATE exam_questions SET
  question = $q$En la situacion de botes de motor mostrada arriba, que se deberia esperar que hiciera el bote "B" para aminorar las posibilidades de un choque o colision con el bote "A"?$q$,
  option_a = $q$bajar la velocidad y/o virar a babor$q$,
  option_b = $q$bajar la velocidad y mantener el curso$q$,
  option_c = $q$aumentar la velocidad y/o virar a estribor$q$,
  option_d = $q$mantener el curso y velocidad actual$q$,
  correct_index = 3,
  hint = $q$Usa la opción que marcaste en la imagen$q$
WHERE id = 28;

UPDATE exam_questions SET
  question = $q$Cuando esta navegando se requiere que usted proceda a una velocidad segura y mantenga vigilancia o atencion en todo momento. La atencion y vision o vigilancia adecuada son factores mayores en:$q$,
  option_a = $q$encontrar lineas de demarcacion$q$,
  option_b = $q$evita una colisión o choque$q$,
  option_c = $q$medir la temperatura del agua para determinar las aguas mas calmadas$q$,
  option_d = $q$determinar la precisión de la direccion de la brújula$q$,
  correct_index = 1,
  hint = $q$La funcion principal es prevenir incidentes.$q$
WHERE id = 29;

UPDATE exam_questions SET
  question = $q$Cuando te encuentras de frente con otro bote de motor, este emite un bocinazo o pito corto. Que te esta comunicando o diciendo el operador de la otra embarcacion?$q$,
  option_a = $q$su intencin de mantener curso y velocidad$q$,
  option_b = $q$que mi timón esta a la izquierda y piensa cambiar su curso a babor$q$,
  option_c = $q$que se apresta a cambiar curso hacia estribor para pasar babor con babor$q$,
  option_d = $q$que se prepara a anclar en un minuto para permitir que el trafico pase$q$,
  correct_index = 2,
  hint = $q$Un sonido corto indica un cambio simple de rumbo.$q$
WHERE id = 30;

UPDATE exam_questions SET
  question = $q$Cuando dejas la marina y te encaminas hacia alta mar y ves una boya roja, como tu deberias actuar o proceder:$q$,
  option_a = $q$quedarme no menos de 20 yardas alejado de la boya$q$,
  option_b = $q$quedarme totalmente alejado de la boya$q$,
  option_c = $q$mantener la boya a mi lado de estribor$q$,
  option_d = $q$mantener la boya a mi lado de babor$q$,
  correct_index = 3,
  hint = $q$Piensa en la regla al salir hacia mar abierto.$q$
WHERE id = 31;

UPDATE exam_questions SET
  question = $q$Marcadores (rotulos) de Regulaciones e Informacion son faciles de identificar a traves de que rasgos o caractersticas?$q$,
  option_a = $q$lineas verticales negras y blancas$q$,
  option_b = $q$forma triangular y letras rojas$q$,
  option_c = $q$color blanco con formas geométricas de naranja$q$,
  option_d = $q$símbolo amarillo cuadrado o triangular$q$,
  correct_index = 2,
  hint = $q$Se reconocen por el fondo y las figuras.$q$
WHERE id = 32;

UPDATE exam_questions SET
  question = $q$Cual es el factor principal a considerarse cuando planeas acercarte con tu embarcacion al muelle donde te vas a amarrar?$q$,
  option_a = $q$el informe o pronóstico del tiempo para esa noche$q$,
  option_b = $q$el largo de los cabos de amarre de la embarcacion$q$,
  option_c = $q$la capacidad de poder parar de tu embarcacion$q$,
  option_d = $q$la fuerza del viento o la corriente$q$,
  correct_index = 3,
  hint = $q$Piensa en lo que mas afecta la maniobra al acercarte.$q$
WHERE id = 33;

UPDATE exam_questions SET
  question = $q$Cul es la tecnica adecuada para anclarse?$q$,
  option_a = $q$desde la borda de estribor$q$,
  option_b = $q$sobre el lado de babor$q$,
  option_c = $q$sobre el espejo o popa$q$,
  option_d = $q$desde la proa$q$,
  correct_index = 3,
  hint = $q$El ancla se maneja desde el extremo delantero.$q$
WHERE id = 34;

UPDATE exam_questions SET
  question = $q$Cual es la mejor precaucion contra el envenenamiento por monóxido de carbono?$q$,
  option_a = $q$mantenga aire fluyendo através de la embarcacin$q$,
  option_b = $q$prenda el ventilador (extractor de aire) del motor cuando este navegando$q$,
  option_c = $q$instalar una alarma de humo en la cabina delantera$q$,
  option_d = $q$quedarse en la parte de la popa cuando la embarcación este navegando$q$,
  correct_index = 0,
  hint = $q$La circulación de aire es clave.$q$
WHERE id = 35;

UPDATE exam_questions SET
  question = $q$Cual es la primera accion requerida de un operador de bote que haya presenciado un accidente de bote?$q$,
  option_a = $q$mantengase alejado o fuera del camino$q$,
  option_b = $q$provea asistencia o ayuda si es posible$q$,
  option_c = $q$escriba un reporte del incidente$q$,
  option_d = $q$espere a que llegue personal de rescate$q$,
  correct_index = 1,
  hint = $q$Primero ayuda, si puedes hacerlo con seguridad.$q$
WHERE id = 36;

UPDATE exam_questions SET
  question = $q$Si su embarcacion se vuelca cuando usted esta lejos de la orilla, cual seria la acción mas segura a seguir?$q$,
  option_a = $q$nadar hacia la orilla mas cercana$q$,
  option_b = $q$nadar hacia la embarcacion mas cercana$q$,
  option_c = $q$quedarse con el bote y subirse o treparse encíma si es posible$q$,
  option_d = $q$quedarse en el agua al lado del bote y mantenerse en movimiento en el agua$q$,
  correct_index = 2,
  hint = $q$La embarcación sigue siendo tu mejor apoyo.$q$
WHERE id = 37;

UPDATE exam_questions SET
  question = $q$Cuando es que un bote es menos estable y propenso a volcarse boca abajo?$q$,
  option_a = $q$cuando el peso o la carga esta distribuida uniformemente$q$,
  option_b = $q$cuando los tanques de combustible estan medio vacios$q$,
  option_c = $q$cuando se esta en aguas profundas$q$,
  option_d = $q$cuando se esta con sobrepeso o sobre cargado$q$,
  correct_index = 3,
  hint = $q$La carga excesiva reduce estabilidad.$q$
WHERE id = 38;

UPDATE exam_questions SET
  question = $q$Cul es la forma recomendada de moverse o caminar dentro de un bote pequeño?$q$,
  option_a = $q$limtese a moverse en la mitad delantera del bote$q$,
  option_b = $q$mantengase agachado y muevase cerca de la linea del centro del bote$q$,
  option_c = $q$mantengase erguido o derecho con los pies separados para mejor balance$q$,
  option_d = $q$acomode las personas en un lado y muevase a traves del lado opuesto$q$,
  correct_index = 1,
  hint = $q$Conviene mantenerse bajo y centrado.$q$
WHERE id = 39;

UPDATE exam_questions SET
  question = $q$Cuál es la accin recomendable al encontrarse con visibilidad limitada de cualquier tipo:$q$,
  option_a = $q$pongase el equipo para mal tiempo para protegerse del frio y de mojarse$q$,
  option_b = $q$determine su posicin tan precisa como sea posible mientras haya visibilidad para hacerlo$q$,
  option_c = $q$toque o timbre la campana del barco un timbre corto cada segundo para avisarle a otras embarcaciones de su presencia$q$,
  option_d = $q$use su transmisor cada tres minutos para anunciar que usted se esta moviendo o navegando y le pide a las demas embarcaciones que se mantengan fuera de su camino$q$,
  correct_index = 1,
  hint = $q$Hubícate bien antes de perder referencia visual.$q$
WHERE id = 40;

UPDATE exam_questions SET
  question = $q$Cuando estas solo, abandonado o aislado en agua fria, y tienes puesto tu salvavidas aprobado por el USCG, que debes hacer para evitar perder calor corporal?$q$,
  option_a = $q$mantener el cuerpo en movimiento en el agua$q$,
  option_b = $q$nade con brazadas de pecho en círculos grande$q$,
  option_c = $q$contraiga las rodillas y brazos hacia el pecho$q$,
  option_d = $q$flote boca arriba con sus brazos y piernas extendidas$q$,
  correct_index = 2,
  hint = $q$La postura debe conservar calor, no gastarlo.$q$
WHERE id = 41;

UPDATE exam_questions SET
  question = $q$Para evitar una lesion grave causada por la hélice de tu motor, como tu deberias acercartele a un bañista o nadador en un area designada como area de baistas o para nadar?$q$,
  option_a = $q$solamente cuando el salvavidas no este trabajando.$q$,
  option_b = $q$solamente cuando el salvavidas este trabajando$q$,
  option_c = $q$núnca se le acerque a un bañista que este en un area designada como area para bañistas$q$,
  option_d = $q$desde viento abajo del bañista y dentro de las sogas$q$,
  correct_index = 2,
  hint = $q$La zona marcada excluye esa aproximación.$q$
WHERE id = 42;

UPDATE exam_questions SET
  question = $q$A que parte del fuego tu debes apuntar cuando usas un extintor de fuegos?$q$,
  option_a = $q$al tope$q$,
  option_b = $q$a un lado$q$,
  option_c = $q$a la base$q$,
  option_d = $q$al medio$q$,
  correct_index = 2,
  hint = $q$El punto eficaz esta donde comienza el fuego.$q$
WHERE id = 43;

UPDATE exam_questions SET
  question = $q$Cuál es el primer paso o accin que se debe seguir o tomar, cuando una embarcacion encalla o se vara?$q$,
  option_a = $q$llamar a la Guardia Costanera$q$,
  option_b = $q$buscar infiltraciones o goteras de agua$q$,
  option_c = $q$averiguar la profundidad del agua$q$,
  option_d = $q$poner el motor en reversa o marcha hacia atras$q$,
  correct_index = 1,
  hint = $q$Primero verifica si hubo entrada de agua.$q$
WHERE id = 44;

UPDATE exam_questions SET
  question = $q$Operadores de canoa o remeros estan particularmente en riesgo de una situacion peligrosa llamada:$q$,
  option_a = $q$fatiga de los boteros$q$,
  option_b = $q$a la deriva$q$,
  option_c = $q$entrampamiento$q$,
  option_d = $q$fatiga por agua fría$q$,
  correct_index = 3,
  hint = $q$La respuesta menciona un efecto del agua.$q$
WHERE id = 45;

UPDATE exam_questions SET
  question = $q$Que accion pudiera causar la perdida de la habilidad de guiar en una motora acuática o PWC?$q$,
  option_a = $q$poner el control de la gasolina al máximo$q$,
  option_b = $q$soltar el control de la gasolina$q$,
  option_c = $q$no girar el guia lo suficiente$q$,
  option_d = $q$girar el guia en exceso o demasiado$q$,
  correct_index = 1,
  hint = $q$En PWC, el giro depende del empuje.$q$
WHERE id = 46;

UPDATE exam_questions SET
  question = $q$Que Regla(s) de Navegacion aplica(n) a un bote propulsado por chorro de agua (PWC)?$q$,
  option_a = $q$un PWC debe mostrar sus luces de navegacion cuando se usa despues de anochecer$q$,
  option_b = $q$normalmente un PWC tiene prioridad de movimiento en situaciones de encuentro o cruce$q$,
  option_c = $q$un PWC esta exento de todas las reglas y regulaciones que aplican para botes$q$,
  option_d = $q$operadores se tienen que adherir a muchas de las mismas reglas y regulaciones que aplican a botes grandes$q$,
  correct_index = 3,
  hint = $q$No esta exento por ser pequeño o distinto.$q$
WHERE id = 47;

UPDATE exam_questions SET
  question = $q$Debido a las diferentes caracteristicas de operar, algunos estados consideran las motoras acuaticas (PWC) como una clase especial de bote y tienen regulaciones especiales para estos. Como operador de una motora acuatica (PWC), usted tiene que:$q$,
  option_a = $q$llevar abordo una copia de las reglas de la Comision de Reglas Especiales para PWC$q$,
  option_b = $q$estar consciente de/y proceder de acuerdo a todas las leyes que gobiernan o regulan el uso de motoras acuáticas en su area$q$,
  option_c = $q$conocer las Reglas Especiales de la Navegacion que aplican unicamente a los PWCs$q$,
  option_d = $q$seguir las reglas establecidas por la Asociacion Nacional de Navegacion$q$,
  correct_index = 1,
  hint = $q$La clave es conocer y seguír la ley local aplicable.$q$
WHERE id = 48;

UPDATE exam_questions SET
  question = $q$Remolcar a esquiadores en el agua, tablas para las olas generadas por el bote, y tubos es muy popular y divertido. Se requieren procedimientos especiales para la seguridad de todas las personas envueltas que incluyen:$q$,
  option_a = $q$remolcar lo mas cerca posible y justamente despues de la puesta del sol, porque es cuando el agua es normalmente mas calmada$q$,
  option_b = $q$remolcar en aguas profundas, canales estrechos para asegurarse de que el agua sea lo suficientemente profunda$q$,
  option_c = $q$mantener la mayor distancia posible de los barcos, muelles y casa-botes con un minimo de 200 pies de ancho para el paso del esquiador$q$,
  option_d = $q$estar cerca de otros botes recreacionales de tal forma que ellos puedan ayudar en recoger personas cuando estas se caen$q$,
  correct_index = 2,
  hint = $q$Busca espacio amplio y separación.$q$
WHERE id = 49;

UPDATE exam_questions SET
  question = $q$Que reglas de navegacion aplican a operadores envueltos en la pesca recreacional?$q$,
  option_a = $q$solamente aquellas reglas de navegacion que son especificamente para deportistas$q$,
  option_b = $q$reglas del Servicio Nacional de Pesca y Vida Silvestre ("US Fish and Wildlife Service")$q$,
  option_c = $q$las mismas reglas que aplican a todos los operadores de embarcacion$q$,
  option_d = $q$reglas de navegacion para cuando es de dia$q$,
  correct_index = 2,
  hint = $q$Pescar no elimina las reglas generales.$q$
WHERE id = 50;

UPDATE exam_questions SET
  question = $q$Las areas azules en una carta indican:$q$,
  option_a = $q$agua profunda y segura$q$,
  option_b = $q$areas sujetas a la fluctuacion de la marea$q$,
  option_c = $q$agua relativamente llana$q$,
  option_d = $q$tierra seca$q$,
  correct_index = 2,
  hint = $q$No se refiere a tierra ni a gran profundidad.$q$
WHERE id = 51;

UPDATE exam_questions SET
  question = $q$Las cartas, para areas sujetas o expuestas a la marea, siempre muestran el espacio libre vertical hacia los objetos altos en:$q$,
  option_a = $q$mitad de la marea$q$,
  option_b = $q$marea baja$q$,
  option_c = $q$un plano de referencia escogido por las autoridades del pueblo$q$,
  option_d = $q$el promedio de la marea alta$q$,
  correct_index = 1,
  hint = $q$La referencia es la condicion de menor nivel.$q$
WHERE id = 52;

UPDATE exam_questions SET
  question = $q$En el sistema cuadriculado que hace posible identificar cualquier punto en la superficie de la tierra, lineas laterales imaginarias o paralelos de latitud:$q$,
  option_a = $q$corren hacia el este y oeste$q$,
  option_b = $q$corren norte y sur$q$,
  option_c = $q$son numeradas de 0 a 180$q$,
  option_d = $q$corren a traves de los polos geográficos$q$,
  correct_index = 0,
  hint = $q$Los paralelos rodean la tierra de lado a lado.$q$
WHERE id = 53;

UPDATE exam_questions SET
  question = $q$Una forma precisa de determinar donde te encuentras en el agua es:$q$,
  option_a = $q$mirando la brújula o compás.$q$,
  option_b = $q$encontrando tu posición en los ("Local Notice to Mariners") Comunicados Locales para Marineros$q$,
  option_c = $q$encontrando tu posicion relativa a un objeto o ayuda a la navegacion que este identificado en la carta$q$,
  option_d = $q$preguntandole al operador de un bote que pase cerca$q$,
  correct_index = 2,
  hint = $q$Relaciona tu posición con una referencia en la carta.$q$
WHERE id = 54;

UPDATE exam_questions SET
  question = $q$La dirección verdadera en una carta es medida desde 000 hasta 359 en direccion a favor de las manecillas del reloj desde:$q$,
  option_a = $q$el rumbo o direccion de la brújula$q$,
  option_b = $q$el norte geográfico verdadero$q$,
  option_c = $q$el sur geográfico verdadero$q$,
  option_d = $q$desde la Linea de Lubber ("Lubber's Line")$q$,
  correct_index = 1,
  hint = $q$La medida parte del norte correcto de la carta.$q$
WHERE id = 55;

UPDATE exam_questions SET
  question = $q$La Rosa Nautica y _________ te indicaran el norte verdadero y te dara la direccion norte- sur en las cartas.$q$,
  option_a = $q$los meridianos de longitud$q$,
  option_b = $q$el bloque del título de la carta$q$,
  option_c = $q$los paralelos de latitud$q$,
  option_d = $q$la escala de las millas nauticas$q$,
  correct_index = 0,
  hint = $q$La otra referencia corre de norte a sur.$q$
WHERE id = 56;

UPDATE exam_questions SET
  question = $q$El máximo de caballaje permitido por ley para operar una embarcacion en lagos es de:$q$,
  option_a = $q$10 caballos de fuerza$q$,
  option_b = $q$20 caballos de fuerza$q$,
  option_c = $q$30 caballos de fuerza$q$,
  option_d = $q$40 caballos de fuerza$q$,
  correct_index = 3,
  hint = $q$Es la cifra mayor entre las opciones.$q$
WHERE id = 57;

UPDATE exam_questions SET
  question = $q$Si una brújula o compás esta debidamente instalada y la desviacion es cero, los numeros en la tarjeta del compás cuando se lee la Linea de Lubber ("Lubber's Line"), esta estara indicando la direccion o rumbo hacia donde se dirige el bote, con referencia a:$q$,
  option_a = $q$el norte magnético$q$,
  option_b = $q$la estrella polar$q$,
  option_c = $q$el norte verdadero$q$,
  option_d = $q$la linea de centro del bote$q$,
  correct_index = 0,
  hint = $q$Sin desviacion, la referencia sigue siendo magnética.$q$
WHERE id = 58;

UPDATE exam_questions SET
  question = $q$Instale una brujula o compas de tal forma que:$q$,
  option_a = $q$la tarjeta del compás se pueda ver desde cualquier parte del bote$q$,
  option_b = $q$este lo mas cerca posible de tu radio VHF$q$,
  option_c = $q$no este en el camino--en cualquier lugar que puedas encontrarle un lugar$q$,
  option_d = $q$una linea que atraviesa el "Lubber's Line" y el centro del compas tambien este paralelo a la quilla$q$,
  correct_index = 3,
  hint = $q$Debe quedar alineado con el eje del bote.$q$
WHERE id = 59;

UPDATE exam_questions SET
  question = $q$Cuantas horas tiene usted para informar a cualquier agente del orden público cuando ocurre un accidente donde hay daos a la propiedad que excedan los $100.00?$q$,
  option_a = $q$12 horas$q$,
  option_b = $q$24 horas$q$,
  option_c = $q$48 horas$q$,
  option_d = $q$72 horas$q$,
  correct_index = 1,
  hint = $q$La notificación se hace dentro de un dia.$q$
WHERE id = 60;

UPDATE exam_questions SET
  question = $q$Una milla nutica es:$q$,
  option_a = $q$mas pequeña que una milla terrestre o estatuaria$q$,
  option_b = $q$igual a un minuto de longitud$q$,
  option_c = $q$igual a un minuto de latitud$q$,
  option_d = $q$usado a lo largo de rutas o pistas costeras$q$,
  correct_index = 2,
  hint = $q$Se relaciona con una medida angulár sobre la tierra.$q$
WHERE id = 61;

UPDATE exam_questions SET
  question = $q$Un nudo se define como:$q$,
  option_a = $q$algo que usted no deberia hacer$q$,
  option_b = $q$una milla nutica por hora$q$,
  option_c = $q$la velocidad de un bote cuando no es afectado por la corriente$q$,
  option_d = $q$una milla terrestre o estatuaria por hora$q$,
  correct_index = 1,
  hint = $q$Es una unidad de velocidad nautica.$q$
WHERE id = 62;

UPDATE exam_questions SET
  question = $q$El proposito principal de la Ley 430 es:$q$,
  option_a = $q$garantizar a la ciudadania el disfrute de playas, lagos y lagunas, dentro de un marco de seguridad$q$,
  option_b = $q$fijar derechos a pagar por la numeracion e inscripcion de las embarcaciones de motor$q$,
  option_c = $q$fijar los derechos a pagar por el uso de vehiculos de campo traviesa$q$,
  option_d = $q$penalizar a toda persona que incurra en un delito menos grave segun lo establece la Ley 430$q$,
  correct_index = 0,
  hint = $q$La ley combina acceso y seguridad.$q$
WHERE id = 63;

UPDATE exam_questions SET
  question = $q$Que velocidad maxima debe mantener una embarcacion cuando navega dentro de los 150 pies paralelos a la costa u orilla en area NO demarcada para bañistas?$q$,
  option_a = $q$5 mph$q$,
  option_b = $q$10 mph$q$,
  option_c = $q$25 mph$q$,
  option_d = $q$no hay limite de velocidad establecido$q$,
  correct_index = 1,
  hint = $q$La opción correcta es el limite intermedio.$q$
WHERE id = 64;

UPDATE exam_questions SET
  question = $q$Las profundidades en una carta pueden estar en pies, metros, o brazas. La unidad de medida se puede determinar de:$q$,
  option_a = $q$Comunicado a los Marineros ("Notice to Mariners")$q$,
  option_b = $q$Almanaque Náutico ("Nautical Almanac")$q$,
  option_c = $q$el bloque donde esta el título de la carta$q$,
  option_d = $q$lectura del medidor o metro de brazas ("Fathometer Readings")$q$,
  correct_index = 2,
  hint = $q$Ese dato aparece en la informacion principal de la carta.$q$
WHERE id = 65;

UPDATE exam_questions SET
  question = $q$Los conocimientos de navegacion o pilotaje o cabotaje te daran DOS destrezas importantes: 1) la habilidad de seleccionar la ruta mas segura de un sitio a otro, y 2) la habilidad de:$q$,
  option_a = $q$encontrar el sitio mas cercano para abastecerse de combustible$q$,
  option_b = $q$determinar las condiciones del tiempo para el dia en el mar$q$,
  option_c = $q$determinar tu posicion en cualquier momento$q$,
  option_d = $q$predecir el consumo de combustible$q$,
  correct_index = 2,
  hint = $q$La otra destreza es saber hubicarse.$q$
WHERE id = 66;

UPDATE exam_questions SET
  question = $q$Cuando descansas o confias en tu GPS para darte la posicion actual, es importante:$q$,
  option_a = $q$mantener una velocidad constante$q$,
  option_b = $q$comparar lo que ves alrededor tuyo con tu carta para estar seguro donde te encuentras y para verificar tu GPS$q$,
  option_c = $q$limpiar las conexiones electricas para prevenir la corrosión$q$,
  option_d = $q$girar usando los rumbos magnéticos$q$,
  correct_index = 1,
  hint = $q$Conviene confirmar el GPS con referencias externas.$q$
WHERE id = 67;

UPDATE exam_questions SET
  question = $q$En la navegacion de una canoa, kayak u otro bote de remo, tu debes:$q$,
  option_a = $q$quedarte en el centro del canal porque tu tienes el derecho de paso$q$,
  option_b = $q$quedarte alejado de la costa cuando hallan rocas o escombros$q$,
  option_c = $q$estar consciente de que puede que no seas visible para el capitan o tripulacion de una embarcacion de mayor tamaño$q$,
  option_d = $q$amarrar tu salvavidas al bote, de forma segura, de tal forma que este no se extravie o se pierda$q$,
  correct_index = 2,
  hint = $q$Piensa en como te ven los botes grandes.$q$
WHERE id = 68;

UPDATE exam_questions SET
  question = $q$Ves una bandera ondeando desde una boya flotando en el agua. La bandera es roja con una linea o franja diagonal blanca. Esto indica:$q$,
  option_a = $q$agua segura en el lado sur de la boya$q$,
  option_b = $q$un buen sitio para anclar$q$,
  option_c = $q$un buzo bajo el agua$q$,
  option_d = $q$el centro del canal con agua segura a todo su alrededor$q$,
  correct_index = 2,
  hint = $q$La bandera advierte actividad bajo la superficie.$q$
WHERE id = 69;

UPDATE exam_questions SET
  question = $q$Operar una embarcacion con o más de __________ de alcohol en la sangre se considera una violacion a la Ley 430, según enmendada.$q$,
  option_a = $q$0.05%$q$,
  option_b = $q$0.08%$q$,
  option_c = $q$0.10%$q$,
  option_d = $q$0.15%$q$,
  correct_index = 1,
  hint = $q$La cifra coincide con el limite legal común.$q$
WHERE id = 70;

UPDATE exam_questions SET
  question = $q$Se considera una actividad prohibida según lo establece la Ley de Navegacion y Seguridad Acutica de Puerto Rico (Ley 430):$q$,
  option_a = $q$nadar en un area demarcada para bañistas$q$,
  option_b = $q$amarrar una embarcacion a las boyas del area demarcada para bañistas$q$,
  option_c = $q$operar una embarcacion en estado de embriaguez$q$,
  option_d = $q$alternativas b y c son correctas$q$,
  correct_index = 3,
  hint = $q$La clave es identificar que dos opciones aplican.$q$
WHERE id = 71;

UPDATE exam_questions SET
  question = $q$Cualquier agente del orden publico podra detener y abordar cualquier embarcación, nave, vehiculo de navegacin o vehiculo de campo traviesa, asi como poner bajo arresto a su operador cuando:$q$,
  option_a = $q$tuviese motivo fundado para creer que el mismo esta siendo utilizado en violacion a las disposiciones de ley$q$,
  option_b = $q$tuviese motivo fundado para creer que su operador esta manejando bajo los efectos de bebidas embriagantes o sustancias controladas$q$,
  option_c = $q$las alternativas a y b son correctas$q$,
  option_d = $q$ninguna de las alternativas son correctas$q$,
  correct_index = 2,
  hint = $q$La opción correcta une dos condiciones validas.$q$
WHERE id = 72;

UPDATE exam_questions SET
  question = $q$Las areas reservadas para bañistas son aquellas:$q$,
  option_a = $q$delimitadas exclusivamente para el baño y areas aledañas$q$,
  option_b = $q$donde se observan personas nadando$q$,
  option_c = $q$donde se permite anclar embarcaciones$q$,
  option_d = $q$todas las alternativas son correctas$q$,
  correct_index = 0,
  hint = $q$La definicion depende de su delimitacion.$q$
WHERE id = 73;

UPDATE exam_questions SET
  question = $q$El anclaje de una embarcacion se debe observar a:$q$,
  option_a = $q$13 pies paralelos a la linea de la costa u orilla$q$,
  option_b = $q$14 pies paralelos a la linea de la costa u orilla$q$,
  option_c = $q$15 pies paralelos a la costa u orilla$q$,
  option_d = $q$20 pies paralelos de la costa u orilla$q$,
  correct_index = 2,
  hint = $q$La distancia correcta es la opcion central mayor.$q$
WHERE id = 74;

UPDATE exam_questions SET
  question = $q$El operador y los pasajeros de una motora acuatica tienen que:$q$,
  option_a = $q$vestir un salvavidas si nacio despus del 1ro. de julio de 1972$q$,
  option_b = $q$vestir un salvavidas si es menor de 12 anos$q$,
  option_c = $q$no tienen que vestir salvavidas$q$,
  option_d = $q$vestir un salvavidas mientras la motora acuatica se encuentre en movimiento$q$,
  correct_index = 3,
  hint = $q$La exigencia aplica mientras esta operando.$q$
WHERE id = 75;

COMMIT;

-- -------------------------------------------------------------
-- Verificaciones (deben imprimir 75 y 1)
-- -------------------------------------------------------------
SELECT COUNT(*) AS total_preguntas FROM exam_questions;
SELECT COUNT(*) AS preguntas_con_imagen FROM exam_questions WHERE image_url <> '';
