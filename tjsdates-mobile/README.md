# TJSDATES para iOS y Android

La app móvil empaqueta la interfaz de `../tjsdates` y usa las cuentas y los servicios de TJSDATES. El proyecto de prueba usa Capacitor 8, la versión 0.1.0 y el identificador provisional `com.tjsdates.app` en ambas plataformas. Confirma ese identificador antes de registrar la app en las tiendas.

## Compilar

Ejecuta los comandos desde `tjsdates-mobile` con Node.js 22 o superior.

```sh
npm ci
npm run prepare:android
npm run open:android
```

Android Studio usa el SDK de Android 36. Para compilar por terminal con JDK 21 y el SDK configurado, ejecuta `./gradlew :app:assembleDebug :app:bundleRelease` desde `android/`. El APK de depuración sirve para pruebas. El AAB de publicación requiere la firma de carga de Google Play.

```sh
npm run prepare:ios
npm run open:ios
```

En macOS con Xcode 26 o superior, selecciona el simulador para probar o el equipo de Apple Developer para firmar y archivar la app. El proyecto usa Swift Package Manager. Las carpetas nativas se generan con los comandos `prepare`. Si ya existen, se sincronizan para conservar la configuración local de firma.

## Alcance de la primera prueba

- Prueba inicio de sesión, registro 18+, foto de rostro, perfiles en Descubrir, matches, reportes y bloqueo con cuentas de prueba. La verificación manual corresponde al perfil completo.
- La ubicación se solicita al usar la función de cercanía. Android pide ubicación aproximada y el botón Atrás cierra la vista de opciones o vuelve a Descubrir. La confirmación y recuperación enviadas por correo abren la web de TJSDATES para completar el paso.
- Los cobros digitales siguen pendientes. La prueba incluye el flujo gratuito. Las notificaciones nativas quedan pendientes de configurar con Apple y Google.

## Antes de enviar a revisión

- Firma los builds con las cuentas de desarrollador. Usa TestFlight para iOS y una pista de pruebas de Play Console para Android.
- Comprueba la moderación, el canal de contacto y la eliminación completa de cuenta y datos. Para Google Play prepara también la página pública donde se puede iniciar la solicitud de eliminación.
- Configura el bloqueo de menores en Play Console y publica los estándares de seguridad infantil y su canal de reporte. Completa los formularios de edad, privacidad y seguridad de datos.
- Prepara una cuenta de revisión y un recorrido que demuestre las funciones de citas locales de Tijuana y San Diego. Si se activan membresías, Boosts o Super Likes de pago, resuelve el cobro para cada tienda antes de enviarlos.
