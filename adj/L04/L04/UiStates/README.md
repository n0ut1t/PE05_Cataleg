# Mini demo: UI States

## Objectiu docent
Aquesta demo reforça la idea de les diapositives:
- l'estat governa la UI
- no tot és "resultats": també hi ha `idle`, `loading`, `empty` i `error`
- el render ha d'estar centralitzat segons `status`

## Model d'estat mínim
```js
const state = {
  status: "idle", // "idle" | "loading" | "ready" | "empty" | "error"
  data: null,
  errorMessage: ""
};
```

## Què passa al flux
1. L'usuari tria un escenari.
2. La UI entra en `loading` abans de fer la petició.
3. Si `fetch` + `json` funciona:
   - si no hi ha dades -> `empty`
   - si hi ha dades -> `ready`
4. Si falla (HTTP, parseig o xarxa) -> `error`.
5. El `render()` decideix una vista segons `state.status`.

## Escenaris inclosos
- **ready**: `data-ready.json`
- **empty**: `data-empty.json`
- **http**: fitxer inexistent (404)
- **json**: resposta no JSON (`data-bad.txt`)
- **network**: domini invàlid

## Error típic #2 que evitem
"UI en blanc" quan hi ha càrrega o error.

Aquest exemple ho evita perquè:
- sempre hi ha un `status`
- sempre hi ha una funció de render per cada estat
- el `catch` converteix error tècnic en missatge útil per l'usuari

## Com executar
1. Obre terminal a aquesta carpeta.
2. Llença servidor local:
   - `py -m http.server 5600`
   - o `npx serve .`
3. Obre `http://localhost:5600/index.html`.

> Si obres amb `file://`, alguns `fetch` poden fallar per polítiques del navegador.
