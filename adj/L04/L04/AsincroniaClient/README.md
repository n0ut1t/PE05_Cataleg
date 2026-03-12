# Mini demo: asincronia al client amb `fetch`

## Objectiu docent
Exemple curt per practicar:
- `async/await`
- estat de càrrega a la UI
- control d'errors HTTP (`response.ok`)
- error de parseig JSON
- error de xarxa

## Com executar
1. Obre una terminal a aquesta carpeta.
2. Llança un servidor local (qualsevol opció):
   - Python: `py -m http.server 5500`
   - Node (si tens npx): `npx serve .`
3. Obre `http://localhost:5500/index.html` (o el port que correspongui).

> Nota: si obres el fitxer amb `file://` alguns `fetch` poden fallar per polítiques del navegador.

## Escenaris que inclou
- **Èxit**: carrega `data-ok.json`.
- **Error HTTP**: demana un fitxer inexistent (404).
- **JSON mal format**: carrega `data-bad.txt` (parseig falla).
- **Error xarxa**: demana un domini invàlid.

## Idea clau
No n'hi ha prou amb `await fetch(...)`: també cal validar `response.ok` i usar `try/catch` per evitar UI buida i donar feedback útil a l’usuari.

## Què està passant en aquest programa (pas a pas)
1. **L’usuari fa clic** en un botó d’escenari (`ok`, `http`, `json`, `network`).
2. Es crida `loadScenario(...)` i la UI passa a **estat loading**:
    - Missatge: “Carregant dades...”
    - Resultat netejat (buit)
3. Dins del `try`, s’executa `fetchJson(url)`:
    - Es fa `await fetch(url)` (operació asíncrona, no bloqueja la UI)
    - Es comprova `response.ok`
    - Si `ok` és `false`, es fa `throw new Error(...)` amb l’HTTP
    - Si `ok` és `true`, es fa `await response.json()`
4. Si tot va bé:
    - Estat UI = **success**
    - Es mostra el JSON formatat al panell de resultat
5. Si hi ha qualsevol error:
    - El `catch` captura l’error
    - Estat UI = **error** amb missatge llegible per usuari
    - `console.error(...)` mostra detall tècnic a DevTools

## Per què és educatiu
- Mostra que **`fetch` no falla automàticament en 404/500**: resol la promesa igualment i cal revisar `response.ok`.
- Mostra que el parseig (`response.json()`) pot fallar tot i tenir HTTP 200.
- Mostra la importància de tenir **estats de UI** (loading/success/error) per no deixar pantalla en blanc.
- Separa dos nivells de missatge:
   - **Usuari**: missatge curt i clar
   - **Desenvolupador**: detall tècnic a consola

## Lectura dels 4 escenaris
- **1) Èxit**
   - URL vàlida i JSON correcte
   - Resultat: dades renderitzades
- **2) Error HTTP (404)**
   - URL de fitxer inexistent
   - Resultat: `response.ok === false`, es llença excepció controlada
- **3) JSON mal format**
   - El servidor respon, però el cos no és JSON vàlid
   - Resultat: falla `response.json()` (error de parseig)
- **4) Error de xarxa**
   - Domini invàlid/no resolt
   - Resultat: `fetch` rebutja la promesa per problema de connexió

## Error típic que s’evita aquí
Sense `try/catch`, una excepció pot “trencar” el flux i deixar la UI sense informació. Aquest exemple ensenya el patró professional bàsic:
- `try` per camí feliç
- `catch` per error controlat
- feedback visible a la interfície
