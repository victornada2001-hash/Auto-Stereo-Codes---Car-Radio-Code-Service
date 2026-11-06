# TJSDATES — perfiles de demostración con IA

La aplicación incluye 100 perfiles ficticios de ejemplo (80 mujeres y 20 hombres), almacenados únicamente en el código cliente y **no** en la tabla de usuarios reales de Supabase. Sus nombres, edades, ubicaciones, intereses, biografías y ocupaciones son datos de prueba, no datos de personas reales.

## Retratos
Los rostros de demostración se muestran como recortes individuales de tres láminas con retratos sintéticos publicadas en el proyecto **Synthetic Faces High Quality — Text-to-Image (SFHQ-T2I)** de David Beniaguev. Todos los rostros son generados por modelos de imágenes, no fotografías de usuarios. Referencia: https://github.com/SelfishGene/SFHQ-T2I-dataset

Archivos usados como fuentes externas:
- textual_search_2_Hair Style x Sex_top_10_matches.jpg (60 ejemplos femeninos)
- textual_search_2_Makeup_top_9_matches.jpg (20 ejemplos femeninos)
- textual_search_2_Facial Hair_top_10_matches.jpg (20 ejemplos masculinos)

Licencia reportada por el repositorio: MIT. La calidad visual queda limitada por la resolución de las láminas utilizadas; para un lanzamiento comercial conviene reemplazarlas por retratos sintéticos individuales a mayor resolución, almacenados localmente en el proyecto, y comprobar los derechos de distribución de todos los archivos.

## Honestidad con los visitantes
Los perfiles se marcan como **demostración**. No se envían a tablas de likes/matches, no son usuarios activos, no tienen verificación oficial, no aparecen online y no deben usarse para representar una comunidad real existente.

## Uso
Este conjunto es solo una vista previa de producto; los perfiles auténticos se cargan desde Supabase y se someten a sus mecanismos de moderación y permisos.
