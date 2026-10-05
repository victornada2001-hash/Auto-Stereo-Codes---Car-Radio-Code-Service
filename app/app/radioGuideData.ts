export type GuideMethod = {
  title: string;
  kicker: string;
  appliesTo: string;
  steps: string[];
  examples?: string[];
  warning?: string;
};

export type BrandGuide = {
  slug: string;
  name: string;
  monogram: string;
  models: string[];
  families: string[];
  serialExamples: string[];
  summary: string;
  note: string;
  methods: GuideMethod[];
};

const labelMethod = (appliesTo: string, examples: string[] = []): GuideMethod => ({
  title: "Busca la etiqueta del estéreo",
  kicker: "ETIQUETA FÍSICA",
  appliesTo,
  steps: [
    "Apaga el vehículo y trabaja con cuidado alrededor de molduras, cableado y bolsas de aire.",
    "Libera el estéreo con las llaves de extracción o desmonta únicamente la moldura necesaria para deslizar la unidad hacia delante.",
    "Busca una etiqueta en la parte superior, lateral o trasera de la carcasa. Copia el número marcado como Serial, S/N o el prefijo propio de la familia del radio.",
    "No confundas el número de parte, modelo o código de barras con la serie. Si aparecen varios números, conserva una foto de toda la etiqueta.",
  ],
  examples,
  warning: "Si no tienes experiencia desmontando interiores, pide ayuda a un instalador. No es necesario desconectar cables solo para leer muchas etiquetas.",
});

const modelDependent = (appliesTo: string): GuideMethod => ({
  title: "Primero identifica el fabricante del radio",
  kicker: "MODELO DEPENDIENTE",
  appliesTo,
  steps: [
    "Revisa la pantalla de información, ajustes o sistema por si muestra Serial, Device ID o Unit Information.",
    "Si el número no aparece en pantalla, localiza la etiqueta física de la unidad y anota fabricante, modelo y serie completos.",
    "Con esos datos podemos distinguir si el equipo es Blaupunkt, Bosch, Clarion, Continental, Becker, Alpine, Visteon u otra familia antes de procesar el pedido.",
  ],
  warning: "No pruebes combinaciones de códigos al azar. Varios intentos incorrectos pueden activar SAFE, WAIT, ERR o un bloqueo temporal.",
});

export const radioGuides: BrandGuide[] = [
  {
    slug:"acura", name:"Acura", monogram:"A", models:["TL","TSX","MDX","RDX","Integra"], families:["Honda/Acura U/L","S/N","Navigation"], serialExamples:["U2154 L2135","S/N 2602353","975GU294"],
    summary:"Acura comparte varias familias de radio con Honda. En unidades antiguas la serie puede mostrarse con los botones 1 y 6; en pantallas y navegación el procedimiento cambia según la generación.",
    note:"VIN y número de serie del estéreo no son lo mismo.",
    methods:[
      {title:"Radio tradicional: 1 + 6 + PWR/VOL",kicker:"RADIO SIN NAVEGACIÓN",appliesTo:"Muchas unidades Honda/Acura antiguas",steps:["Pon el contacto en ACC u ON y deja el radio apagado.","Mantén presionados al mismo tiempo los botones de memoria 1 y 6.","Sin soltarlos, presiona PWR/VOL. Anota todos los grupos que aparezcan en pantalla.","Si ves un grupo U y otro L, conserva ambos y escríbelos juntos."],examples:["U2154 L2135","S/N 2602353"]},
      {title:"Pantalla táctil o navegación",kicker:"MENÚ DE SERVICIO",appliesTo:"Unidades con pantalla, navegación o menú de diagnóstico",steps:["Abre Información del sistema o el menú de servicio disponible para tu unidad.","Busca Serial Number, Unit Check, Navi ECU, HMI Unit, DA Unit o Device Information.","Copia la serie completa exactamente como aparece. Si el menú de tu equipo no coincide, no adivines combinaciones de botones."],examples:["975GU294","HFB22016680"]},
      labelMethod("Radios donde la serie no aparece en pantalla",["954LR052","SN500074"]),
    ]
  },
  {
    slug:"alfa-romeo", name:"Alfa Romeo", monogram:"AR", models:["Giulietta","Giulia","Stelvio","147","156","159"], families:["Blaupunkt BP","Bosch 815CM","Continental A2C"], serialExamples:["BP…","815CM…","A2C…"],
    summary:"Alfa Romeo utilizó varias unidades Blaupunkt, Bosch y Continental. La serie normalmente está en la etiqueta del radio y el prefijo permite identificar la familia.", note:"Guarda también el modelo y cualquier número de parte visible en la etiqueta.",
    methods:[labelMethod("Blaupunkt: busca una serie que empiece con BP",["BP…"]),labelMethod("Bosch: busca 815CM/CM; Continental: busca A2C/A3C",["815CM…","A2C…"]) ]
  },
  {
    slug:"alpine", name:"Alpine", monogram:"AL", models:["MF2910","MF2199","OEM Alpine"], families:["AL-series","MF-series","TQ/TC/TD/TH","JA"], serialExamples:["AL2910 30863308","MF2910","TQ…"],
    summary:"Las unidades Alpine OEM suelen exigir leer la etiqueta de la carcasa. El prefijo cambia según el fabricante del vehículo.", note:"AL, TQ, TC, TD, TH y JA son ejemplos de familias utilizadas en distintos vehículos.",
    methods:[labelMethod("Alpine estándar y unidades OEM",["AL2910 30863308","TQ…","JA…"]),labelMethod("MF2910 / MF2199 y variantes Mercedes",["MF2910","MF2199"]) ]
  },
  {
    slug:"audi", name:"Audi", monogram:"AUDI", models:["A1","A3","A4","A6","TT"], families:["AUZ","Chorus","Concert","Symphony","RNS-E"], serialExamples:["AUZ1Z1F6412082"],
    summary:"En muchas unidades Audi la serie empieza con AUZ. Chorus, Concert y Symphony suelen requerir leer la etiqueta; algunas RNS-E pueden mostrar datos de la unidad en pantalla.", note:"La serie AUZ identifica el radio; no es el VIN.",
    methods:[labelMethod("Chorus, Concert, Symphony y otras unidades con etiqueta AUZ",["AUZ1Z1F6412082"]),{title:"Comprueba la información del RNS-E",kicker:"NAVEGACIÓN",appliesTo:"Algunas unidades RNS-E",steps:["Enciende la unidad y revisa la pantalla de información/versión del sistema.","Si aparece una serie AUZ, anótala completa.","Si no aparece, utiliza la etiqueta física del equipo; no confundas el número de pieza con la serie AUZ."],examples:["AUZ…"]}]
  },
  {
    slug:"becker", name:"Becker", monogram:"BE", models:["Becker OEM","Mercedes Becker","Porsche Becker"], families:["BE-series"], serialExamples:["BE171023001234","BE4356 17234567"],
    summary:"Becker suministró radios a Mercedes-Benz, Porsche, Chrysler y Jeep. La serie se encuentra normalmente en la etiqueta de la unidad.", note:"Copia el prefijo BE y todos los dígitos; el modelo y la serie forman parte de la identificación.",
    methods:[labelMethod("Radios Becker",["BE171023001234","BE4356 17234567"]) ]
  },
  {
    slug:"blaupunkt", name:"Blaupunkt", monogram:"BP", models:["Blaupunkt OEM","TravelPilot"], families:["BP","C7","VWZ","AUZ","SKZ","SEZ"], serialExamples:["BP237534082298","C73F0961 C 0536857"],
    summary:"Blaupunkt fabricó radios para numerosas marcas. La serie suele estar en la etiqueta y el prefijo puede cambiar según el fabricante del vehículo.", note:"BP identifica muchas unidades Blaupunkt; C7 aparece en TravelPilot y VWZ/AUZ/SKZ/SEZ son familias del Grupo VW.",
    methods:[labelMethod("Blaupunkt estándar",["BP237534082298"]),labelMethod("TravelPilot y unidades específicas de fabricante",["C73F0961 C 0536857","VWZ…","AUZ…","SKZ…","SEZ…"]) ]
  },
  {
    slug:"bmw", name:"BMW", monogram:"BMW", models:["Business CD","Professional","Bavaria","Reverse"], families:["Blaupunkt","Becker","Philips","Alpine"], serialExamples:["BP0296123456","BE…","AL…"],
    summary:"BMW utilizó distintos fabricantes de radios. Algunas unidades Business/Professional tienen menú de servicio; otras requieren leer la etiqueta. Los sistemas iDrive modernos normalmente no usan un código de radio de 4 dígitos tradicional.", note:"Primero identifica el fabricante de la unidad antes de pedir un código.",
    methods:[{title:"Prueba el menú de servicio",kicker:"BUSINESS / PROFESSIONAL",appliesTo:"Algunas unidades BMW Business y Professional",steps:["Enciende el radio y abre el menú de ajustes/servicio disponible en tu modelo.","Busca Serial, SN o datos de la unidad y anota la serie completa.","Si tu unidad no ofrece ese menú, utiliza la etiqueta de la carcasa."],examples:["BP…","BE…","AL…"]},labelMethod("Bavaria, Reverse y unidades sin serie visible")]
  },
  {
    slug:"bosch", name:"Bosch", monogram:"BOSCH", models:["Bosch OEM","CD/MP3","Screen/Connect"], families:["815CM","905CM","217CM","CM"], serialExamples:["815CM8583A9207566","905CM0408G1197184"],
    summary:"Bosch aparece en varias marcas europeas. Muchas unidades se identifican por series CM en la etiqueta; ciertas pantallas muestran datos de serial/dispositivo cuando ya están en una pantalla de bloqueo o información.", note:"Evita provocar un bloqueo intencionalmente: si la pantalla ya muestra Serial/Device/Date, anota los tres.",
    methods:[labelMethod("Bosch estándar",["815CM8583A9207566","905CM0408G1197184"]),{title:"Pantalla de información o bloqueo",kicker:"SCREEN / CONNECT",appliesTo:"Unidades que ya muestran información técnica",steps:["Si la pantalla ya muestra Serial Number, Device Number y Date, anota los tres valores.","No introduzcas códigos incorrectos deliberadamente para forzar esa pantalla.","Si los datos no están visibles, consulta la etiqueta física de la unidad."],examples:["Serial 3143720","Device 7612830076"]}]
  },
  {
    slug:"chrysler", name:"Chrysler", monogram:"C", models:["200","300","Town & Country","Voyager"], families:["Uconnect T-series","Continental A2C"], serialExamples:["T00AM0052T0922","T19QN…","A2C…"],
    summary:"Chrysler comparte varias radios con Jeep y Dodge. Las series T y A2C normalmente están impresas en la carcasa.", note:"La misma familia puede aparecer en más de una marca Stellantis/FCA.",
    methods:[labelMethod("Uconnect / T-series",["T00AM0052T0922","T00BE…","T19QN…","TVPQN…","TZ1AA…"]),labelMethod("Continental VDO",["A2C1670890200008394"]) ]
  },
  {
    slug:"citroen", name:"Citroën", monogram:"CIT", models:["C3","C4","C5","Berlingo","Nemo","Jumper"], families:["Blaupunkt BP","Bosch 815CM","Continental A2C","Becker RNEG","Daiichi"], serialExamples:["BP…","815CM…","A2C…","BE…"],
    summary:"Citroën utilizó varias familias compartidas con Peugeot y Fiat. En unidades antiguas la serie se lee en la etiqueta; RD4/RD45/RT6 modernas pueden estar emparejadas al VIN en lugar de usar un código escrito tradicional.", note:"Si el radio emite pitidos tras un cambio de unidad, puede necesitar programación de VIN y no un código de desbloqueo.",
    methods:[labelMethod("Blaupunkt, Bosch, Continental y Becker",["BP…","815CM…","A2C…","BE…"]),{title:"RD4 / RD45 / RT6",kicker:"UNIDAD EMPAREJADA AL VEHÍCULO",appliesTo:"Varias unidades PSA modernas",steps:["Revisa el modelo exacto de la unidad y la etiqueta.","Estas unidades pueden usar emparejamiento con el VIN en vez de un código de radio clásico.","Si el problema es un pitido periódico después de sustituir el radio, normalmente se requiere codificación/diagnóstico del VIN."],warning:"No compres un código de 4 dígitos si tu problema es emparejamiento VIN."}]
  },
  {
    slug:"clarion", name:"Clarion", monogram:"CL", models:["Clarion OEM","Nissan Clarion","Peugeot Clarion"], families:["CL","PP","PN"], serialExamples:["CL052950166112","PP3001…","PN3001…"],
    summary:"Clarion fabricó radios para Nissan y Peugeot, entre otros. La etiqueta suele incluir la serie y, en algunas unidades, también se necesita el modelo o referencia de código de barras.", note:"Conserva una foto completa de ambas etiquetas si tu radio tiene más de una.",
    methods:[labelMethod("Clarion CL / PP / PN",["CL052950166112","PP3001…","PN3001…"]) ]
  },
  {
    slug:"dacia", name:"Dacia", monogram:"D", models:["Sandero","Duster","Logan","Lodgy"], families:["Renault/Dacia VIN","Precode","2811/8200/7700"], serialExamples:["17-character VIN","A123","2811…"],
    summary:"Dacia comparte arquitectura de radio con Renault. En muchas unidades originales el VIN permite identificar el código; radios reemplazados pueden requerir la serie de la unidad.", note:"Si el estéreo fue cambiado por otro usado, el VIN del vehículo puede no corresponder al radio instalado.",
    methods:[{title:"VIN del vehículo original",kicker:"MÉTODO RÁPIDO",appliesTo:"Muchas unidades Dacia originales",steps:["Localiza el VIN de 17 caracteres en la base del parabrisas, marco de la puerta o documentación.","Úsalo solo si el radio es el original del vehículo.","Si la unidad fue reemplazada, pasa al método de etiqueta del radio."],examples:["VIN de 17 caracteres"]},labelMethod("Radios Renault/Dacia reemplazados o unidades antiguas",["A123","2811…","8200…","7700…"]) ]
  },
  {
    slug:"daewoo", name:"Daewoo", monogram:"DW", models:["Nissan/Daewoo OEM","Older Daewoo units"], families:["DW","DS","HP","HY","HG"], serialExamples:["DW25N12345"],
    summary:"La categoría Daewoo incluye unidades utilizadas en varios Nissan antiguos y otras radios OEM. Cuando la pantalla ya ofrece información técnica, conserva serie y número de parte; de lo contrario utiliza la etiqueta.", note:"No recomendamos provocar un bloqueo mediante intentos incorrectos.",
    methods:[{title:"Pantalla con datos técnicos",kicker:"SI YA ESTÁ DISPONIBLE",appliesTo:"Unidades que muestran Serial/Part/Date",steps:["Si la pantalla ya muestra Serial Number, Part Number y Date, copia los tres valores.","No fuerces la pantalla introduciendo códigos falsos.","Si la información no está disponible, retira la unidad lo suficiente para leer la etiqueta."],examples:["DW25N12345"]},labelMethod("Unidades Daewoo sin información en pantalla",["DW…","DS…","HP…","HY…","HG…"]) ]
  },
  {
    slug:"daiichi", name:"Daiichi", monogram:"DAI", models:["Fiat Fiorino","Fiat Qubo","Fiat Punto","Peugeot Boxer/Bipper","Citroën Nemo/Jumper","Lancia Ypsilon"], families:["Daiichi short serial"], serialExamples:["04081","50231"],
    summary:"Algunas unidades Daiichi montadas en vehículos Fiat/Peugeot/Citroën/Lancia usan una serie corta en una etiqueta de la carcasa.", note:"No confundas una unidad Daiichi con Continental A2C/A3C o Blaupunkt BP.",
    methods:[labelMethod("Daiichi compacto",["04081","50231"]) ]
  },
  {
    slug:"dodge", name:"Dodge", monogram:"D", models:["Journey","Nitro","Caliber","Charger","Durango","Caravan"], families:["Uconnect T-series","Continental A2C"], serialExamples:["T00AM0052T0922","TQN…","A2C…"],
    summary:"Dodge comparte plataformas de radio con Chrysler y Jeep. La serie suele estar en la etiqueta lateral/trasera.", note:"Anota el prefijo completo: T00AM, T00BE, T19QN, TQN, TVPQN, TZ1AA u otros similares.",
    methods:[labelMethod("Uconnect / T-series",["T00AM0052T0922","T00BE…","T19QN…","TQN…","TVPQN…","TZ1AA…"]),labelMethod("Continental VDO",["A2C…"]) ]
  },
  {
    slug:"fiat", name:"Fiat", monogram:"FIAT", models:["500","Panda","Tipo","Punto","Ducato","Fiorino","Qubo"], families:["Blaupunkt BP","Bosch 815CM","Continental A2C/A3C","Daiichi"], serialExamples:["BP…","815CM…","A2C…","04081"],
    summary:"Fiat ha usado varias familias Blaupunkt, Bosch, Continental y Daiichi. El prefijo de la etiqueta es la forma más útil de escoger el procedimiento correcto.", note:"Conserva también el modelo del radio, especialmente en unidades Bosch o Continental.",
    methods:[labelMethod("Blaupunkt y Bosch",["BP…","815CM…"]),labelMethod("Continental / VDO",["A2C…","A3C…","BE…"]),labelMethod("Daiichi",["04081","50231"]) ]
  },
  {
    slug:"ford", name:"Ford", monogram:"FORD", models:["Fiesta","Focus","Mondeo","Transit","Kuga","C-Max","S-Max"], families:["V-series","M-series","Sony","TravelPilot C7/BP","Z/A-series"], serialExamples:["V062049","M123456","C7…"],
    summary:"Ford tiene varias familias de radio. Muchas V/M/Sony muestran la serie en pantalla; TravelPilot y otras versiones requieren etiqueta física.", note:"Si un método de pantalla no responde tras uno o dos intentos, no sigas pulsando combinaciones al azar.",
    methods:[{title:"V-series: 1 + 6",kicker:"SERIE EN PANTALLA",appliesTo:"Muchas radios Ford V-series",steps:["Enciende contacto y radio.","Mantén presionados 1 y 6 durante unos dos segundos.","Cuando la pantalla recorra información, busca una serie V seguida de 6 dígitos.","Si tu unidad no responde, algunas variantes usan 2 + 6; no continúes si no coincide con tu radio."],examples:["V062049"]},{title:"M-series / algunas Sony",kicker:"SERIE EN PANTALLA",appliesTo:"Algunas unidades M-series y Sony OEM",steps:["Enciende el radio.","Prueba 2 + 6 en unidades M compatibles; algunas Sony usan 1 + 6.","Anota la serie completa que aparezca. Sony puede mostrar prefijos SN o SOCD."],examples:["M123456","SN…","SOCD…"]},labelMethod("TravelPilot C7/BP, CD132 y unidades que no muestran serie",["C7…","BP…","V…","M…"]) ]
  },
  {
    slug:"grundig", name:"Grundig", monogram:"GR", models:["Grundig OEM"], families:["GR","SEZ","SKZ","AUZ"], serialExamples:["GR0981X0124996","SEZ…","SKZ…"],
    summary:"Grundig fabricó radios OEM para distintas marcas europeas. La serie suele encontrarse en la etiqueta trasera o lateral.", note:"Incluye cualquier prefijo de fabricante, porque puede indicar la marca del vehículo.",
    methods:[labelMethod("Grundig OEM",["GR0981X0124996","SEZ…","SKZ…","AUZ…"]) ]
  },
  {
    slug:"honda", name:"Honda", monogram:"H", models:["Civic","CR-V","Accord","Fit/Jazz","Pilot","Odyssey"], families:["U/L","S/N","Touchscreen","Navigation","Mitsubishi accessory"], serialExamples:["U2154 L2135","S/N 15517841","975GU294","HFB22016680"],
    summary:"Honda usa varios procedimientos según la generación: 1+6 en radios tradicionales, menús de servicio en pantallas y etiqueta física cuando la serie no se muestra.", note:"Anota exactamente todos los caracteres. VIN y serie del radio son datos diferentes.",
    methods:[{title:"Radio tradicional: 1 + 6 + PWR/VOL",kicker:"RADIOS SIN NAVEGACIÓN",appliesTo:"Muchas unidades Honda antiguas",steps:["Pon el contacto en ACC u ON y apaga el radio.","Mantén presionados 1 y 6.","Sin soltarlos, presiona PWR/VOL y espera a que aparezca la serie.","Anota ambos grupos si aparecen U y L, o la serie S/N completa."],examples:["U2154 L2135","S/N 15517841"]},{title:"Pantalla táctil",kicker:"2013+ / SEGÚN MODELO",appliesTo:"Algunas pantallas táctiles y unidades de audio/display",steps:["Entra al menú de servicio/diagnóstico específico de tu unidad.","Busca Detailed Information, Unit Check, HMI Unit, DA Unit o System/Device Information.","Anota la serie mostrada. La combinación de acceso cambia según modelo y año, por eso no uses secuencias al azar."],examples:["975GU294"]},{title:"Navegación anterior",kicker:"UNIDADES DE NAVEGACIÓN",appliesTo:"Varias generaciones antiguas de navegación",steps:["En unidades compatibles, el menú de servicio puede abrirse con Map/Guide + Menu + Cancel.","Busca Unit Check o Navi ECU y abre la información de la unidad.","Anota la serie completa. Si tu pantalla no coincide, usa la etiqueta física en vez de probar combinaciones desconocidas."],examples:["HFB22016680"]},labelMethod("Honda donde la serie no aparece en pantalla",["954LR052","SN500074"]) ]
  },
  {
    slug:"iveco", name:"Iveco", monogram:"IVECO", models:["Daily","S-Way","Stralis","Eurocargo","Trakker"], families:["Blaupunkt BP","Bosch 815CM","Aptiv T0BYD","Continental pre-code","Daiichi"], serialExamples:["BP700562953492","815CM0096F1179171","T0BYD294110168","L124"],
    summary:"Iveco montó varias radios Blaupunkt, Bosch, Aptiv, Continental y Daiichi. La serie normalmente se obtiene de la etiqueta del equipo.", note:"En Aptiv moderno busca específicamente T0BYD; un S/N corto secundario puede no ser el identificador útil.",
    methods:[labelMethod("Blaupunkt y Bosch",["BP700562953492","815CM0096F1179171"]),labelMethod("Aptiv touchscreen y Continental",["T0BYD294110168","L124","C985"]),labelMethod("Daiichi",["50231"]) ]
  },
  {
    slug:"jaguar", name:"Jaguar", monogram:"J", models:["X-Type","S-Type","XJ","XK8"], families:["JA-series","Visteon M-series"], serialExamples:["JACC4051022450","M007108"],
    summary:"En muchos Jaguar antiguos la serie JA está grabada directamente en la carcasa. Algunas unidades Visteon pueden mostrar una M-series en pantalla.", note:"La etiqueta impresa puede ser solo un número de parte; busca también un grabado JA en el metal.",
    methods:[{title:"Visteon: prueba 1 + 6",kicker:"SERIE EN PANTALLA",appliesTo:"Algunas unidades Jaguar Visteon",steps:["Enciende el radio.","Mantén 1 y 6 hasta que aparezca información de la unidad.","Si muestra una serie M seguida de seis dígitos, anótala completa.","Si no aparece, pasa al método de carcasa."],examples:["M007108"]},labelMethod("Jaguar JA-series grabada en la carcasa",["JACC4051022450","JA…"]) ]
  },
  {
    slug:"jeep", name:"Jeep", monogram:"JEEP", models:["Wrangler","Cherokee","Grand Cherokee","Compass","Renegade"], families:["Uconnect T-series","Continental A2C","Becker BE"], serialExamples:["T00AM0052T0922","T19QN…","A2C…","BE…"],
    summary:"Jeep comparte varias unidades con Chrysler y Dodge. La identificación se hace normalmente desde la etiqueta de la carcasa.", note:"Una misma serie T/A2C puede corresponder a varias marcas; confirma Jeep y el modelo del radio antes de pagar.",
    methods:[labelMethod("Uconnect / T-series",["T00AM0052T0922","T00BE…","TM9…","T19QN…","TQN…","TVPQN…","TZ1AA…","TH1AA…"]),labelMethod("Continental A2C o Becker",["A2C…","BE…"]) ]
  },
  {
    slug:"lancia", name:"Lancia", monogram:"L", models:["Ypsilon","Musa","Delta"], families:["Blaupunkt","Bosch","Continental","Daiichi"], serialExamples:["BP…","815CM…","A2C…","04081"],
    summary:"Lancia comparte muchas familias de radio con Fiat. La etiqueta permite distinguir Blaupunkt, Bosch, Continental o Daiichi.", note:"Guarda foto completa de la etiqueta si no sabes cuál número es la serie.",
    methods:[labelMethod("Blaupunkt/Bosch/Continental",["BP…","815CM…","A2C…"]),labelMethod("Daiichi",["04081"]) ]
  },
  {
    slug:"land-rover", name:"Land Rover", monogram:"LR", models:["Freelander","Discovery","Defender"], families:["Visteon M-series","Philips M-series","Becker"], serialExamples:["M018610","0009463"],
    summary:"En varios Land Rover 1997–2006 la Visteon M-series se puede mostrar en pantalla; Philips y Becker suelen requerir acceso a la etiqueta.", note:"El procedimiento depende mucho de la generación. Esta guía se centra en las unidades antiguas que usan código escrito.",
    methods:[{title:"Visteon: 2 + 6",kicker:"SERIE EN PANTALLA",appliesTo:"Varias unidades Visteon antiguas",steps:["Enciende la unidad.","Mantén los botones 2 y 6 hasta que aparezca la serie.","Busca M seguida de seis dígitos y anótala completa.","Si no aparece o tu radio es Philips/Becker, utiliza la etiqueta."],examples:["M018610"]},labelMethod("Visteon/Philips M-series y Becker",["M018610","0009463"]) ]
  },
  {
    slug:"mercedes", name:"Mercedes-Benz", monogram:"MB", models:["Audio 10","Audio 20","COMAND","Citan"], families:["Alpine AL/MF","Becker BE","Renault-family Citan"], serialExamples:["AL…","MF…","BE…","2811…"],
    summary:"Mercedes utilizó Alpine y Becker en varias generaciones antiguas. Audio 20/COMAND modernos pueden requerir diagnóstico o emparejamiento antirrobo en vez de un código clásico.", note:"Citan puede llevar unidades de la familia Renault.",
    methods:[labelMethod("Audio antiguo Alpine / Becker",["AL…","MF…","BE…"]),labelMethod("Citan con radio Renault-family",["2811…","8200…"]),{title:"Audio 20 / COMAND moderno",kicker:"DIAGNÓSTICO",appliesTo:"Sistemas modernos integrados",steps:["Identifica el modelo exacto y conserva VIN, número de parte y serie de la unidad.","Estos sistemas pueden usar un PIN antirrobo/programación por diagnóstico en lugar de un código de botones.","No compres un código genérico de cuatro dígitos sin confirmar la familia."],warning:"Puede requerirse herramienta de diagnóstico o programación especializada."}]
  },
  {
    slug:"nissan", name:"Nissan", monogram:"N", models:["Qashqai","Juke","Micra","Navara","X-Trail","Almera","Primera"], families:["Connect","Clarion CL/PP/PN","Blaupunkt BP","Daewoo DW","Visteon"], serialExamples:["CL094090001747","BP538471207649","DW32N13024","42VAH9C0068"],
    summary:"Nissan tiene muchas familias y a veces necesita más de un dato: serie, Device/Part Number y, en determinadas unidades, fecha de la pantalla.", note:"No fuerces un bloqueo introduciendo códigos incorrectos. Si la pantalla ya ofrece los datos, anótalos; si no, usa la etiqueta.",
    methods:[{title:"Nissan Connect / pantalla de información",kicker:"SERIE + DEVICE",appliesTo:"Unidades Connect que ya muestran datos técnicos",steps:["Si la pantalla de seguridad o información ya muestra Serial, Device Number y Date, anota los tres exactamente.","No introduzcas códigos falsos para provocar el bloqueo.","Si los datos no aparecen, identifica la unidad por etiqueta o modelo antes de continuar."],examples:["Serial 0158493","Device 7 612 830 076"]},labelMethod("Clarion CL / PP / PN",["CL094090001747","PP3001…","PN3001…"]),labelMethod("Blaupunkt BP, Daewoo DW/DS y Visteon",["BP538471207649","DW32N13024","42VAH9C0068"]) ]
  },
  {
    slug:"peugeot", name:"Peugeot", monogram:"P", models:["208","308","3008","Boxer","Bipper"], families:["Blaupunkt","Bosch","Continental","Clarion","Becker RNEG","Daiichi"], serialExamples:["815BP…","815CM…","A2C…","CL…","BE…"],
    summary:"Peugeot comparte distintas familias con Citroën y Fiat. En unidades antiguas la serie aparece en la etiqueta; RD4/RD45/RT6 modernas pueden estar vinculadas al VIN.", note:"Clarion puede requerir serie, modelo y referencia de código de barras.",
    methods:[labelMethod("Blaupunkt/Bosch/Continental",["815BP…","815CM…","A2C…"]),labelMethod("Clarion o Becker RNEG",["CL…","PP…","PN…","BE…"]),{title:"RD4 / RD45 / RT6",kicker:"VIN / PROGRAMACIÓN",appliesTo:"Varias unidades PSA modernas",steps:["Lee el modelo exacto de la unidad y su etiqueta.","Si el problema es un pitido tras instalar otro radio, puede ser emparejamiento de VIN y no falta de código.","Solicita diagnóstico/programación adecuada antes de comprar un código tradicional."],warning:"No todas las unidades Peugeot utilizan un código de desbloqueo manual."}]
  },
  {
    slug:"porsche", name:"Porsche", monogram:"POR", models:["911","Boxster","Cayenne","Panamera"], families:["Becker BE","Blaupunkt BP"], serialExamples:["BE4720 15093945","BP…"],
    summary:"Muchos Porsche antiguos montan Becker o Blaupunkt. El prefijo BE o BP está en la etiqueta de la unidad.", note:"Lee la serie completa incluida la identificación de modelo Becker.",
    methods:[labelMethod("Becker y Blaupunkt Porsche",["BE4720 15093945","BP…"]) ]
  },
  {
    slug:"renault", name:"Renault", monogram:"R", models:["Clio","Megane","Scenic","Kangoo","Trafic","Master"], families:["Precode","2811","8200","7700","Visteon"], serialExamples:["A123","2811…","8200…","7700…"],
    summary:"Renault puede usar VIN en el radio original, un precode corto o series largas en la etiqueta. Trafic/Master tienen además variantes Visteon y otras unidades compartidas.", note:"Si el radio fue sustituido, usa la serie del equipo instalado y no asumas que el VIN recuperará el código correcto.",
    methods:[{title:"Precode corto",kicker:"UNIDADES ANTIGUAS",appliesTo:"Radios Renault/Dacia con precode",steps:["Revisa la etiqueta o la información del radio.","Busca un precode de una letra y tres dígitos.","Anótalo exactamente junto con cualquier modelo/número de parte visible."],examples:["A123","H758"]},labelMethod("Etiquetas 2811 / 8200 / 7700",["2811…","8200…","7700…"]),{title:"VIN del radio original",kicker:"UNIDAD ORIGINAL",appliesTo:"Algunas unidades Renault originales",steps:["Localiza el VIN de 17 caracteres.","Úsalo solo si el radio sigue siendo el equipo original asociado al vehículo.","Si el radio fue cambiado, identifica la serie de la unidad instalada."],examples:["VIN de 17 caracteres"]}]
  },
  {
    slug:"seat", name:"SEAT", monogram:"SEAT", models:["Ibiza","Leon","Ateca","Aura","Alana"], families:["SEZ"], serialExamples:["SEZ1Z2K4657819","SEZAZ2L1958512"],
    summary:"Las radios SEAT de varias generaciones usan series SEZ en la etiqueta. Aura, Alana y distintas unidades de Ibiza/Leon siguen esta familia.", note:"La I mayúscula y el número 1 pueden verse parecidos; revisa cada carácter.",
    methods:[labelMethod("Aura, Alana, Ibiza, Leon y otras unidades SEZ",["SEZ1Z2K4657819","SEZAZ2L1958512"]) ]
  },
  {
    slug:"skoda", name:"Škoda", monogram:"SK", models:["Octavia","Superb","Fabia","Bolero","Dance","Swing"], families:["SKZ"], serialExamples:["SKZAZ5L1562150","SKZ1Z7G1254658"],
    summary:"En Bolero, Dance, Swing, Blues y Stream de varias generaciones la serie SKZ está en la etiqueta de la carcasa.", note:"Copia los 14 caracteres completos cuando tu unidad use formato SKZ.",
    methods:[labelMethod("Bolero, Dance, Swing, Blues y Stream",["SKZAZ5L1562150","SKZ1Z7G1254658"]) ]
  },
  {
    slug:"sony", name:"Sony", monogram:"SONY", models:["Ford Sony MP3","Sony CD132"], families:["SN/SOCD","V-series"], serialExamples:["SN…","SOCD…","V123456"],
    summary:"Las radios Sony OEM de Ford tienen dos rutas comunes: algunas muestran información con 1+6; CD132 normalmente requiere leer la etiqueta.", note:"Confirma el modelo del frontal antes de escoger el método.",
    methods:[{title:"Ford Sony MP3: 1 + 6",kicker:"SERIE EN PANTALLA",appliesTo:"Varias Sony MP3 OEM Ford",steps:["Enciende contacto y radio.","Mantén 1 y 6 durante unos dos segundos.","Busca una serie SN o SOCD en la información mostrada y anótala completa."],examples:["SN…","SOCD…"]},labelMethod("Sony CD132 y unidades sin serie visible",["V123456"]) ]
  },
  {
    slug:"suzuki", name:"Suzuki", monogram:"S", models:["Swift","Vitara","Jimny"], families:["Suzuki OEM label"], serialExamples:["368112587643063510"],
    summary:"En muchas radios Suzuki la serie no se muestra en pantalla y es necesario leer la etiqueta de la unidad.", note:"Conserva todos los dígitos del identificador largo y una foto de la etiqueta completa.",
    methods:[labelMethod("Radios Suzuki OEM",["368112587643063510"]) ]
  },
  {
    slug:"toyota", name:"Toyota", monogram:"TOY", models:["Prius","Aqua","Vitz","JDM Navigation"], families:["ERC 16-character","NSZT/NSCN/NSCP/NSZN"], serialExamples:["ERC de 16 caracteres"],
    summary:"Algunas unidades japonesas Toyota/Lexus usan un ERC de 16 caracteres accesible desde un menú de servicio. Muchas radios Toyota de otros mercados no utilizan un código manual tradicional.", note:"Solo uses el procedimiento ERC si tu unidad muestra explícitamente ERC/Security Release Code.",
    methods:[{title:"ERC desde menú de servicio",kicker:"JDM NAVIGATION",appliesTo:"Algunas NSZT/NSCN/NSCP/NSZN y navegación japonesa",steps:["Enciende la unidad y abre la pantalla de información/imagen o el menú de servicio de tu modelo.","En unidades compatibles, el menú oculto puede abrirse mediante la secuencia de esquinas de la pantalla indicada para esa generación o mediante el control de mapa mientras se ciclan las luces.","Abre Service Information / Security Release Code y anota el ERC de 16 caracteres.","Si tu pantalla no coincide exactamente, no pruebes secuencias al azar; identifica primero el modelo de la unidad."],examples:["ERC de 16 caracteres"],warning:"Este método no es universal para todos los Toyota; depende del modelo de navegación y mercado."},modelDependent("Radios Toyota no JDM o sin menú ERC")]
  },
  {
    slug:"vauxhall", name:"Vauxhall / Opel", monogram:"VX", models:["Astra","Corsa","Insignia","Vivaro","Movano"], families:["Blaupunkt/Delco","Connect/Sat Nav","Renault Anatel"], serialExamples:["3143720","31500847","281157844RTC109"],
    summary:"Vauxhall/Opel utiliza radios estándar, navegación Connect y unidades Renault/Anatel en ciertos comerciales. El dato requerido cambia por familia.", note:"Si una pantalla ya muestra Serial, Device Number y Date, conserva los tres. No recomendamos provocar un bloqueo introduciendo códigos falsos.",
    methods:[{title:"Connect / Sat Nav",kicker:"DATOS EN PANTALLA",appliesTo:"Unidades que ya muestran información técnica",steps:["Si la pantalla ya está en modo de seguridad y muestra Serial Number, Device Number y Date, anótalos todos.","No introduzcas códigos incorrectos deliberadamente para forzar esa pantalla.","Si no aparecen, identifica la unidad por etiqueta/modelo."],examples:["Serial 31500847"]},labelMethod("Radio estándar Blaupunkt/Delco",["3143720"]),labelMethod("Movano/Vivaro Renault-Anatel",["281157844RTC109","8200…","7700…"]) ]
  },
  {
    slug:"volkswagen", name:"Volkswagen", monogram:"VW", models:["Golf","Polo","Passat","RCD 300","RCD 500","RNS 510"], families:["VWZ"], serialExamples:["VWZ2Z2F1394291"],
    summary:"En numerosas radios Volkswagen la serie comienza con VWZ y está impresa en la etiqueta de la unidad. RCD/RNS de distintas generaciones comparten esta familia.", note:"La serie VWZ no es el código de desbloqueo. Se utiliza para consultar la unidad en una base de datos.",
    methods:[labelMethod("RCD, RNS y otras unidades Volkswagen",["VWZ2Z2F1394291"]) ]
  },
];

export function getRadioGuide(slug: string) {
  return radioGuides.find((guide) => guide.slug === slug);
}
