# Demo didàctica: Arquitectura `State → Render → Storage`

## Objectiu docent
Aquesta activitat està inspirada en `AsincroniaClient` i `UiStates`, però centrada en **persistència aplicada** i **separació de responsabilitats**:

- Persistir preferències d'usuari (tema, font, motion)
- Persistir últim filtre seleccionat
- Persistir IDs marcats (favorits) amb clau versionada
- Persistir estat de vista (targetes/llista)
- Fer que tots els canvis passin per una porta única: `setState(patch)`

## Regla d'or
- `state` és la veritat de la UI.
- `render()` només pinta.
- `storage` es llegeix a l'arrencada i s'escriu des de `persistState(...)`.
- `render()` **no** llegeix ni escriu `localStorage`.

## Fragment clau
```js
function setState(patch) {
  state = { ...state, ...patch };
  render();
  persistState(patch);
}
```

## Patró robust per IDs
```js
function loadIds() {
  const raw = localStorage.getItem(IDS_KEY);
  if (!raw) return new Set();

  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.filter(Number.isFinite)) : new Set();
  } catch {
    return new Set();
  }
}
```

## Com executar
1. Obre terminal a aquesta carpeta.
2. Llença servidor local:
   - `py -m http.server 5700`
   - o `npx serve .`
3. Obre `http://localhost:5700/index.html`.

## Proves didàctiques suggerides
1. Marca favorits i refresca la pàgina: s'han de mantenir.
2. Escriu un filtre i canvia de vista: en refrescar, s'han de recuperar.
3. Prem **Corrompre IDs (demo)** i després **Recarregar des d'storage**:
   - l'app ha de fer fallback segur (`new Set()`), sense trencar la UI.
4. Prem **Reset complet** per tornar a estat base.
