# Demo didàctica: Fulles d'estil CSS (2/3)

## Objectiu docent
Aquesta demo està pensada per consolidar **consistència** (no “disseny lliure”) amb 5 checks clars:

1. Variables d'espaiat `--s-1/2/3`
2. Layout coherent amb `.container` + `gap` i `grid`
3. Variants de botó (`.btn-primary`, `.btn-secondary`, `.btn-danger`)
4. Focus visible en controls interactius
5. Responsive mínim perquè no “rebenti” en mòbil

## Com executar
1. Obre terminal a aquesta carpeta.
2. Llença servidor local:
   - `py -m http.server 5900`
   - o `npx serve .`
3. Obre `http://localhost:5900/index.html`.

## Què practicar a classe
- Canviar l'escala d'espaiat (base/compacta/ampla) i observar com el layout es manté ordenat.
- Inspeccionar les classes base i variants de botó per entendre reutilització.
- Navegar amb teclat (Tab) per comprovar focus visible.
- Provar amplada petita de pantalla i veure el comportament responsive.

## Missatge clau
El CSS professional no és acumular regles; és crear un sistema petit, coherent i mantenible.
