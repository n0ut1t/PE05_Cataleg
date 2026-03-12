# Demo didàctica: Events, patrons i delegació

## Objectiu docent
Activitat inspirada en les diapositives per treballar tres idees clau:

1. **Quin event quan**
   - `input`: molt freqüent (cada tecla)
   - `change`: quan l'usuari confirma (més econòmic)
   - `submit`: processar formularis sense recarregar
2. **Porta única d'actualització**
   - tots els canvis passen per `setState(patch)`
3. **Delegació d'events**
   - evitar l'error típic de listeners “perduts” després d'un re-render

## Com executar
1. Obre terminal a aquesta carpeta.
2. Llença servidor local:
   - `py -m http.server 5800`
   - o `npx serve .`
3. Obre `http://localhost:5800/index.html`.

## Què mostra la demo

### 1) Bloc “Quin event quan?”
- Selector per decidir si el camp de nom persisteix amb `input` o amb `change`.
- Comptador d'escriptures a `localStorage` per veure cost real.
- Exemple de `change` en un `select` (tema preferit).
- Exemple de `submit` per afegir elements a la llista.

### 2) Bloc “Delegació d'events”
- **Mode delegació (recomanat):** un únic listener al contenidor.
- **Mode directe fràgil:** listeners als botons renderitzats.
- Botó “Forçar re-render” per observar el problema de listeners perduts en el mode fràgil.
- Botó “Reactivar listeners directes” per demostrar que cal re-enllaçar si no uses delegació.

## Missatge didàctic final
- Tria l'event segons el cost: `change` per persistir preferències és habitualment millor que `input`.
- Mantén el flux clar amb una porta única (`setState`).
- Si la UI re-renderitza llistes, la delegació és el patró estable i recomanat.
