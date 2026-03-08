document.addEventListener("DOMContentLoaded", () => {

    const ramos = document.querySelectorAll(".ramo");
    const botonReset = document.getElementById("resetear");
    const barra = document.getElementById("barra-progreso");
    const texto = document.getElementById("texto-progreso");

    let aprobados = JSON.parse(localStorage.getItem("ramosAprobados")) || [];

    // Mapa id → nombre del ramo
    const mapaRamos = {};

    ramos.forEach(ramo => {
        mapaRamos[ramo.id] = ramo.textContent.trim();
    });

    // -------------------------
    // DESBLOQUEO DE RAMOS
    // -------------------------

    function verificarDesbloqueo(){

        ramos.forEach(ramo => {

            const prereq = ramo.dataset.prereq;

            // Si no tiene prerequisitos
            if(!prereq){

                if(!ramo.classList.contains("aprobado")){
                    ramo.classList.remove("bloqueado");
                    ramo.classList.add("disponible");
                }

                ramo.dataset.tooltip = "";
                return;
            }

            const requisitos = prereq.split(",").map(r => r.trim());

            const faltantes = requisitos.filter(req => !aprobados.includes(req));

            if(faltantes.length === 0){

                if(!ramo.classList.contains("aprobado")){
                    ramo.classList.remove("bloqueado");
                    ramo.classList.add("disponible");
                }

                ramo.dataset.tooltip = "";

            }else{

                ramo.classList.remove("disponible");
                ramo.classList.add("bloqueado");

                const nombres = faltantes.map(id => mapaRamos[id] || id);

                ramo.dataset.tooltip = "Falta aprobar: " + nombres.join(", ");

            }

        });

    }

    // -------------------------
    // PROGRESO
    // -------------------------

    function actualizarProgreso(){

        const total = ramos.length;
        const completados = aprobados.length;

        const porcentaje = Math.round((completados / total) * 100);

        if(barra){
            barra.style.width = porcentaje + "%";
        }

        if(texto){
            texto.textContent =
                completados + " de " + total +
                " ramos aprobados (" + porcentaje + "%)";
        }

    }

    // -------------------------
    // CARGAR ESTADO GUARDADO
    // -------------------------

    ramos.forEach(ramo => {

        if(aprobados.includes(ramo.id)){
            ramo.classList.add("aprobado");
        }

    });

    verificarDesbloqueo();
    actualizarProgreso();

    // -------------------------
    // CLICK EN RAMOS
    // -------------------------

    ramos.forEach(ramo => {

        ramo.addEventListener("click", () => {

            if(ramo.classList.contains("bloqueado")) return;

            if(ramo.classList.contains("aprobado")){

                ramo.classList.remove("aprobado");
                aprobados = aprobados.filter(id => id !== ramo.id);

            }else{

                ramo.classList.add("aprobado");

                if(!aprobados.includes(ramo.id)){
                    aprobados.push(ramo.id);
                }

            }

            localStorage.setItem(
                "ramosAprobados",
                JSON.stringify(aprobados)
            );

            verificarDesbloqueo();
            actualizarProgreso();

        });

    });

    // -------------------------
    // BOTON RESET
    // -------------------------

    if(botonReset){

        botonReset.addEventListener("click", () => {

            if(confirm("¿Quieres reiniciar toda la malla?")){

                localStorage.removeItem("ramosAprobados");

                ramos.forEach(r => {
                    r.classList.remove("aprobado");
                });

                aprobados = [];

                verificarDesbloqueo();
                actualizarProgreso();

            }

        });

    }

});