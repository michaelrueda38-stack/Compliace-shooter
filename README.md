# Compliance Shooter 2.0 · versión en línea

Servidor Node (sin dependencias, Node 18+) que sirve el juego y gestiona la sala, las rondas y el ranking en tiempo real. Cualquier persona con el enlace puede jugar y competir, sin cuenta.

## Probar en tu computador
    npm start
Abre http://localhost:3000. La consola imprime el **enlace del anfitrión** (`/?host=CLAVE`).

## Publicarlo en internet (ejemplo con Render, plan gratuito)
1. Sube esta carpeta a un repositorio de GitHub.
2. En render.com: New > Web Service > elige el repositorio.
3. Runtime: Node. Build Command: (vacío). Start Command: `npm start`.
4. En Environment agrega `ADMIN_KEY` con una clave larga que solo conozcas.
5. Al terminar tendrás una URL pública con HTTPS, por ejemplo `https://tu-juego.onrender.com`.
Funciona igual en Railway, Fly.io o cualquier hosting que ejecute Node.

## Cómo se usa en una actividad
- **Participantes:** entran a la URL, escriben su nombre y esperan en la sala.
- **Anfitrión:** entra a `https://tu-url/?host=TU_CLAVE`, escribe su nombre y pulsa INICIAR RONDA cuando todos estén dentro. Al terminar, CERRAR RONDA Y MOSTRAR PODIO fija el resultado final.
- Todos ven el ranking en vivo durante la partida y el top 3 al final.

## Límites
- Los datos viven en memoria: si el servidor se reinicia o se duerme (plan gratuito), se pierde el ranking. Para una sesión larga usa un plan que no duerma.
- Pensado para grupos de decenas a un par de centenares de personas.
- El puntaje lo calcula el navegador; el servidor solo valida rangos. No es a prueba de tramposos decididos.
- No uses la clave de anfitrión en pantallas compartidas.
