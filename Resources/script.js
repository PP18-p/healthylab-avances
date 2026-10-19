const boton = document.getElementById("modo-oscuro");

boton.addEventListener("click", function () {
    document.body.classList.toggle("oscuro");
});

const formulario = document.querySelector("form");

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    alert("Gracias por escribirnos. Pronto nos pondremos en contacto contigo.");
    formulario.reset();
});
