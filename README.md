-- IDEA PRINCIPAL
mi idea es hacer un menu de inventario jrpg rollo PERSONA. ya que los menus de persona se basan mucho en el arte, lo voy a hacer desde un punto mas de vista de estructura y orden.
como no tengo esa capacidad de arte, como ahora estoy jugando mewgenics y tiene una gesiton de inventario con un estilo interesante tipo caja alomejor cojo algo de hay.

-- PUNTOS OBLIGATORIOS
    -1 Datos, json y fetch
        Ya que estoy haciendo un inventario/menu es facil, los datos van a ser objetos, personajes, ... cosas tipicas de un jrpg
    -2 UI estates
        puedo simular estados como antes de entrar al menu, que haya una animacion como si estubiera cargando, mensajes de errores si pongo un buscador de items y eso, hay tambien puedo         simular un tiempo de respuesta
    -3 Interaccions
        - almenos 1 input text
        - 1 select o toggle (categoria,rareza,estado,orden)
        - 1 accion para elementos (poner en favorito, completar mision, romper)
        - 1 formulario o mini formulario
    
    -4 Persistencia
        En el localstorage hay que tener como minimo preferencia de UI (tema,fontsize,reducemotion), Coleccion de ID(favoritos, completadas,recientes)
        _NORMAS
            - keys versionadas  
            - JSON.stringify/JSON.parse
            - gestionar null
            - gestionar json corrupto con fallback
            - no de puede usar clear() solo removeItem para las keys del ls
        __
--COMO VOY A ORDENARME

    1. creacion datos simple para probar
    2. diagrama flux (para  saber como voy a querer ordenar el menu y las opciones)
    3. simulacion de carga inicial con fetch y asincoria (async/await)
    4. mostrar despues de la carga una configuracion de ui es decir theme, fontsize, reduce motions y guardar en ls (esto solo se muestra si no esta en ls, es decir nunca a entrado)
    5. demo funcional de el menu (botones o enlaces que me llevan a donde dice, no pestanyas nueva, solo cambio dinamico con js)
    6. creacion de datos completos(items con rarezas, niveles, nivel req, ..., estats, info personajes del tema)
    7. intento de css con un poco de arte i responsive
        
