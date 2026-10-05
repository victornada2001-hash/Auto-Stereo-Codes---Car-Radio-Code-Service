type Props = { language: "en" | "es" };

export default function ExpandedSerialGuide({ language }: Props) {
  const es = language === "es";

  const cards = es
    ? [
        {
          n: "01",
          title: "Radio tradicional: botones 1 + 6",
          text: "En muchos radios Honda y Acura sin navegación, coloca el encendido en ACC u ON y deja el radio apagado. Mantén presionados los botones 1 y 6 y, sin soltarlos, presiona PWR/VOL para encender el equipo. En unidades compatibles, la pantalla mostrará la serie.",
          detail: "La serie puede aparecer en dos grupos (por ejemplo, U4821 y L9037) o como un solo S/N. Anota exactamente todo lo que aparezca en pantalla.",
        },
        {
          n: "02",
          title: "Pantalla táctil y unidades más nuevas",
          text: "Algunas unidades permiten consultar la serie desde un menú de diagnóstico. Dependiendo del equipo, se puede abrir manteniendo una combinación como botón superior + encendido + Menú, Encendido + Expulsar + Inicio, o Encendido + Menú + Día/Noche durante unos segundos.",
          detail: "Si aparece el menú de servicio, busca opciones como Información detallada, Unit Check, HMI Unit o DA Unit. En otros equipos la serie puede estar en Inicio → Información → información del sistema o del dispositivo. Los nombres exactos cambian según modelo y región.",
        },
        {
          n: "03",
          title: "Navegación Honda / Acura de generaciones anteriores",
          text: "En varias unidades de navegación de aproximadamente 2003 a 2012, el menú de diagnóstico puede abrirse con Map/Guide + Menu + Cancel. Después, busca Unit Check y Navi ECU para localizar la serie.",
          detail: "Algunos radios usan combinaciones distintas con SEEK/SKIP, CH/DISC y PWR/VOL. Si tu pantalla no coincide con estas instrucciones, no fuerces botones al azar: usa la etiqueta física o la guía específica de tu unidad.",
        },
        {
          n: "04",
          title: "Etiqueta física en el estéreo",
          text: "Si la serie no aparece en pantalla, puede estar impresa en una etiqueta en la parte superior, lateral o trasera del chasis. Para verla puede ser necesario extraer el radio del tablero.",
          detail: "Las series varían mucho de formato y longitud. Ejemplos ilustrativos: U4821 L9037, S/N 17482635, 9A7GU204, HFB23041871 o SN742061. Introduce la serie exactamente como aparece en tu unidad.",
        },
      ]
    : [
        {
          n: "01",
          title: "Traditional radio: preset 1 + 6",
          text: "On many Honda and Acura radios without navigation, set the ignition to ACC or ON and leave the radio off. Hold preset buttons 1 and 6, then press PWR/VOL while still holding them. On compatible units, the serial number will appear on the display.",
          detail: "The serial may appear as two groups (for example U4821 and L9037) or as a single S/N. Write down everything exactly as it appears.",
        },
        {
          n: "02",
          title: "Touchscreen and newer units",
          text: "Some units can show the serial through a diagnostic menu. Depending on the radio, the service screen may open with combinations such as top radio button + Power + Menu, Power + Eject + Home, or Power + Menu + Day/Night for a few seconds.",
          detail: "If a service menu appears, look for items such as Detailed Information, Unit Check, HMI Unit or DA Unit. Other units may show device information under Home → Information → system/device information. Exact labels vary by model and region.",
        },
        {
          n: "03",
          title: "Earlier Honda / Acura navigation units",
          text: "On several navigation units from roughly 2003–2012, the diagnostic screen can be opened with Map/Guide + Menu + Cancel. Then look for Unit Check and Navi ECU to locate the serial.",
          detail: "Some radios use different combinations involving SEEK/SKIP, CH/DISC and PWR/VOL. If your screen does not match these steps, do not keep trying random combinations; use the physical label or the instructions for your exact unit.",
        },
        {
          n: "04",
          title: "Physical label on the stereo",
          text: "If the serial is not available on screen, it may be printed on a label on the top, side or rear of the radio chassis. The radio may need to be removed from the dashboard to see it.",
          detail: "Serial formats and lengths vary widely. Illustrative formats: U4821 L9037, S/N 17482635, 9A7GU204, HFB23041871 or SN742061. Enter the serial exactly as printed on your unit.",
        },
      ];

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-black uppercase tracking-[0.22em] text-blue-600">
            {es ? "Guía ampliada Honda / Acura" : "Expanded Honda / Acura guide"}
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            {es ? "Más formas de encontrar el número de serie" : "More ways to find the stereo serial number"}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {es
              ? "El método correcto depende del radio instalado, no solamente del año del vehículo. Usa la opción que coincida con tu equipo y anota la serie exactamente como aparece."
              : "The correct method depends on the radio installed, not only the vehicle year. Use the option that matches your unit and record the serial exactly as shown."}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.n} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">{card.n}</div>
                <h3 className="text-xl font-black text-slate-950">{card.title}</h3>
              </div>
              <p className="mt-5 leading-7 text-slate-700">{card.text}</p>
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">{card.detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-950">
            ⚠️ {es
              ? "Si aparece ERR o el radio deja de aceptar entradas, no sigas probando códigos al azar. Los intentos incorrectos pueden provocar un bloqueo temporal. Consulta el manual del vehículo o las instrucciones específicas del radio antes de volver a intentarlo."
              : "If ERR appears or the radio stops accepting input, do not keep trying random codes. Repeated incorrect attempts can cause a temporary lockout. Check the vehicle manual or radio-specific instructions before trying again."}
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-950">
            🔧 {es
              ? "Si necesitas desmontar el estéreo y no tienes experiencia con molduras, conectores o bolsas de aire cercanas, pide ayuda a un instalador o técnico para evitar daños."
              : "If the stereo must be removed and you are not experienced with trim panels, connectors or nearby airbags, ask an installer or technician for help to avoid damage."}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="#request-form" className="inline-flex rounded-xl bg-blue-600 px-7 py-4 font-bold text-white transition hover:bg-blue-500">
            {es ? "Ya tengo mi serie — solicitar código →" : "I have my serial — request my code →"}
          </a>
        </div>
      </div>
    </section>
  );
}
