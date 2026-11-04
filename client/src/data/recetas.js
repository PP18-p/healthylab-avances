/* ===== DATOS DE LAS RECETAS =====
   Única fuente de verdad: la usan la página de recetas y (después) el panel de administración.
   Cantidades para "porciones" personas; nutrición por porción (valores aproximados). */

export const RECETAS = [
    {
        id: 0, titulo: "Ensalada de Pollo", categoria: "almuerzo", imagen: "resources/imgs/ensaldapollo.webp",
        porciones: 2, minutos: 20,
        nutricion: { calorias: 320, proteinas: 32, carbohidratos: 14, grasas: 14 },
        ingredientes: [
            { nombre: "pechuga de pollo", cantidad: 300, unidad: "g" },
            { nombre: "lechuga", cantidad: 1, unidad: "" },
            { nombre: "tomate", cantidad: 2, unidad: "" },
            { nombre: "pepino", cantidad: 1, unidad: "" },
            { nombre: "aceite de oliva", cantidad: 2, unidad: "cda" },
            { nombre: "limón", cantidad: 1, unidad: "" }
        ],
        pasos: [
            { texto: "Cocina el pollo a la plancha con sal y pimienta", minutos: 10 },
            { texto: "Deja reposar el pollo y córtalo en tiras", minutos: 3 },
            { texto: "Pica las verduras y mézclalas en un bol", minutos: 0 },
            { texto: "Agrega el pollo, el aceite y el jugo de limón y sirve", minutos: 0 }
        ]
    },
    {
        id: 1, titulo: "Avena con Frutas", categoria: "desayuno", imagen: "resources/imgs/avenafrutos.jpg",
        porciones: 2, minutos: 10,
        nutricion: { calorias: 290, proteinas: 9, carbohidratos: 48, grasas: 7 },
        ingredientes: [
            { nombre: "avena en hojuelas", cantidad: 80, unidad: "g" },
            { nombre: "leche", cantidad: 400, unidad: "ml" },
            { nombre: "plátano", cantidad: 1, unidad: "" },
            { nombre: "fresas", cantidad: 100, unidad: "g" },
            { nombre: "miel", cantidad: 1, unidad: "cda" }
        ],
        pasos: [
            { texto: "Calienta la leche con la avena a fuego medio", minutos: 6 },
            { texto: "Revuelve hasta que espese", minutos: 0 },
            { texto: "Sirve y corona con la fruta picada y la miel", minutos: 0 }
        ]
    },
    {
        id: 2, titulo: "Batido de Frutas", categoria: "desayuno", imagen: "resources/imgs/batidofrutas.jpg",
        porciones: 2, minutos: 5,
        nutricion: { calorias: 180, proteinas: 6, carbohidratos: 36, grasas: 2 },
        ingredientes: [
            { nombre: "plátano", cantidad: 2, unidad: "" },
            { nombre: "fresas", cantidad: 150, unidad: "g" },
            { nombre: "yogur natural", cantidad: 200, unidad: "g" },
            { nombre: "leche", cantidad: 200, unidad: "ml" }
        ],
        pasos: [
            { texto: "Pon todos los ingredientes en la licuadora", minutos: 0 },
            { texto: "Licúa hasta que quede cremoso", minutos: 1 },
            { texto: "Sirve bien frío", minutos: 0 }
        ]
    },
    {
        id: 3, titulo: "Salteado de Verduras", categoria: "almuerzo", imagen: "resources/imgs/salteado.jpg",
        porciones: 2, minutos: 15,
        nutricion: { calorias: 210, proteinas: 6, carbohidratos: 22, grasas: 11 },
        ingredientes: [
            { nombre: "brócoli", cantidad: 200, unidad: "g" },
            { nombre: "zanahoria", cantidad: 2, unidad: "" },
            { nombre: "pimiento", cantidad: 1, unidad: "" },
            { nombre: "ajo", cantidad: 2, unidad: "diente" },
            { nombre: "salsa de soja", cantidad: 2, unidad: "cda" },
            { nombre: "aceite de oliva", cantidad: 1, unidad: "cda" }
        ],
        pasos: [
            { texto: "Corta las verduras en tiras", minutos: 0 },
            { texto: "Saltea el ajo en el aceite", minutos: 1 },
            { texto: "Añade las verduras y cocina a fuego alto", minutos: 7 },
            { texto: "Agrega la salsa de soja y mezcla", minutos: 1 }
        ]
    },
    {
        id: 4, titulo: "Arroz con Pollo", categoria: "almuerzo", imagen: "resources/imgs/arrozypollo.jpg",
        porciones: 4, minutos: 40,
        nutricion: { calorias: 450, proteinas: 30, carbohidratos: 55, grasas: 10 },
        ingredientes: [
            { nombre: "arroz", cantidad: 300, unidad: "g" },
            { nombre: "pechuga de pollo", cantidad: 400, unidad: "g" },
            { nombre: "zanahoria", cantidad: 2, unidad: "" },
            { nombre: "arvejas", cantidad: 100, unidad: "g" },
            { nombre: "cebolla", cantidad: 1, unidad: "" },
            { nombre: "caldo de pollo", cantidad: 600, unidad: "ml" }
        ],
        pasos: [
            { texto: "Dora el pollo en cubos con la cebolla", minutos: 8 },
            { texto: "Añade el arroz, las verduras y el caldo", minutos: 0 },
            { texto: "Tapa y cocina a fuego bajo", minutos: 20 },
            { texto: "Deja reposar tapado", minutos: 5 }
        ]
    },
    {
        id: 5, titulo: "Tortilla de Verduras", categoria: "cena", imagen: "resources/imgs/tortilla.jpg",
        porciones: 2, minutos: 15,
        nutricion: { calorias: 240, proteinas: 15, carbohidratos: 8, grasas: 16 },
        ingredientes: [
            { nombre: "huevos", cantidad: 4, unidad: "" },
            { nombre: "espinaca", cantidad: 100, unidad: "g" },
            { nombre: "cebolla", cantidad: 0.5, unidad: "" },
            { nombre: "tomate", cantidad: 1, unidad: "" },
            { nombre: "aceite de oliva", cantidad: 1, unidad: "cda" }
        ],
        pasos: [
            { texto: "Saltea la cebolla y la espinaca", minutos: 4 },
            { texto: "Bate los huevos con sal y viértelos en la sartén", minutos: 0 },
            { texto: "Cocina a fuego bajo por un lado", minutos: 4 },
            { texto: "Voltea la tortilla y cocina el otro lado", minutos: 2 }
        ]
    },
    {
        id: 6, titulo: "Yogur con Frutas", categoria: "desayuno", imagen: "resources/imgs/yogur.jpg",
        porciones: 1, minutos: 5,
        nutricion: { calorias: 210, proteinas: 10, carbohidratos: 32, grasas: 5 },
        ingredientes: [
            { nombre: "yogur natural", cantidad: 200, unidad: "g" },
            { nombre: "frutas picadas", cantidad: 100, unidad: "g" },
            { nombre: "granola", cantidad: 30, unidad: "g" },
            { nombre: "miel", cantidad: 1, unidad: "cdta" }
        ],
        pasos: [
            { texto: "Sirve el yogur en un vaso", minutos: 0 },
            { texto: "Agrega la fruta y la granola", minutos: 0 },
            { texto: "Termina con un hilo de miel", minutos: 0 }
        ]
    },
    {
        id: 7, titulo: "Pescado al Horno", categoria: "cena", imagen: "resources/imgs/pescadoh.jpg",
        porciones: 2, minutos: 30,
        nutricion: { calorias: 280, proteinas: 34, carbohidratos: 6, grasas: 13 },
        ingredientes: [
            { nombre: "filete de pescado blanco", cantidad: 400, unidad: "g" },
            { nombre: "limón", cantidad: 1, unidad: "" },
            { nombre: "ajo", cantidad: 2, unidad: "diente" },
            { nombre: "aceite de oliva", cantidad: 1, unidad: "cda" },
            { nombre: "perejil", cantidad: 1, unidad: "cda" }
        ],
        pasos: [
            { texto: "Precalienta el horno a 200 °C", minutos: 10 },
            { texto: "Coloca el pescado en una bandeja con ajo, limón, aceite y sal", minutos: 0 },
            { texto: "Hornea hasta que se desmenuce fácil", minutos: 15 },
            { texto: "Sirve con perejil picado", minutos: 0 }
        ]
    },
    {
        id: 8, titulo: "Ensalada de Quinoa", categoria: "almuerzo", imagen: "resources/imgs/ensaladaquinoa.jpg",
        porciones: 2, minutos: 25,
        nutricion: { calorias: 340, proteinas: 12, carbohidratos: 48, grasas: 11 },
        ingredientes: [
            { nombre: "quinoa", cantidad: 150, unidad: "g" },
            { nombre: "tomate", cantidad: 2, unidad: "" },
            { nombre: "pepino", cantidad: 1, unidad: "" },
            { nombre: "aguacate", cantidad: 1, unidad: "" },
            { nombre: "limón", cantidad: 1, unidad: "" }
        ],
        pasos: [
            { texto: "Enjuaga bien la quinoa", minutos: 0 },
            { texto: "Cocínala en el doble de agua", minutos: 15 },
            { texto: "Deja enfriar", minutos: 5 },
            { texto: "Mezcla con las verduras picadas y el jugo de limón", minutos: 0 }
        ]
    },
    {
        id: 9, titulo: "Panqueques de Avena", categoria: "desayuno", imagen: "resources/imgs/pancakes.jpeg",
        porciones: 2, minutos: 20,
        nutricion: { calorias: 310, proteinas: 12, carbohidratos: 40, grasas: 10 },
        ingredientes: [
            { nombre: "avena en hojuelas", cantidad: 100, unidad: "g" },
            { nombre: "huevos", cantidad: 2, unidad: "" },
            { nombre: "plátano", cantidad: 1, unidad: "" },
            { nombre: "leche", cantidad: 100, unidad: "ml" },
            { nombre: "miel", cantidad: 1, unidad: "cdta" }
        ],
        pasos: [
            { texto: "Licúa todos los ingredientes", minutos: 0 },
            { texto: "Calienta una sartén antiadherente", minutos: 0 },
            { texto: "Cocina cada panqueque 2 minutos por lado", minutos: 4 },
            { texto: "Sirve con fruta", minutos: 0 }
        ]
    },
    {
        id: 10, titulo: "Sopa de Verduras", categoria: "cena", imagen: "resources/imgs/sopaverduras.jpg",
        porciones: 4, minutos: 35,
        nutricion: { calorias: 150, proteinas: 5, carbohidratos: 24, grasas: 4 },
        ingredientes: [
            { nombre: "zanahoria", cantidad: 2, unidad: "" },
            { nombre: "papa", cantidad: 2, unidad: "" },
            { nombre: "apio", cantidad: 2, unidad: "tallo" },
            { nombre: "cebolla", cantidad: 1, unidad: "" },
            { nombre: "calabacín", cantidad: 1, unidad: "" },
            { nombre: "caldo de verduras", cantidad: 1000, unidad: "ml" }
        ],
        pasos: [
            { texto: "Pica todas las verduras", minutos: 0 },
            { texto: "Sofríe la cebolla y el apio", minutos: 5 },
            { texto: "Agrega el caldo y el resto de verduras", minutos: 0 },
            { texto: "Hierve a fuego medio", minutos: 20 },
            { texto: "Ajusta la sal y sirve caliente", minutos: 0 }
        ]
    },
    {
        id: 11, titulo: "Wrap de Pollo", categoria: "almuerzo", imagen: "resources/imgs/wrappollo.png",
        porciones: 2, minutos: 15,
        nutricion: { calorias: 380, proteinas: 28, carbohidratos: 35, grasas: 13 },
        ingredientes: [
            { nombre: "tortillas integrales", cantidad: 2, unidad: "" },
            { nombre: "pechuga de pollo", cantidad: 200, unidad: "g" },
            { nombre: "lechuga", cantidad: 4, unidad: "hoja" },
            { nombre: "tomate", cantidad: 1, unidad: "" },
            { nombre: "yogur natural", cantidad: 2, unidad: "cda" }
        ],
        pasos: [
            { texto: "Cocina el pollo a la plancha", minutos: 8 },
            { texto: "Córtalo en tiras", minutos: 0 },
            { texto: "Unta yogur sobre la tortilla y rellena con el pollo y las verduras", minutos: 0 },
            { texto: "Enrolla y sirve", minutos: 0 }
        ]
    },
    {
        id: 12, titulo: "Omelette Saludable", categoria: "desayuno", imagen: "resources/imgs/omelette.jpg",
        porciones: 1, minutos: 10,
        nutricion: { calorias: 260, proteinas: 19, carbohidratos: 5, grasas: 18 },
        ingredientes: [
            { nombre: "huevos", cantidad: 3, unidad: "" },
            { nombre: "espinaca", cantidad: 50, unidad: "g" },
            { nombre: "tomate", cantidad: 0.5, unidad: "" },
            { nombre: "queso fresco", cantidad: 30, unidad: "g" }
        ],
        pasos: [
            { texto: "Bate los huevos con una pizca de sal", minutos: 0 },
            { texto: "Cocina en la sartén a fuego medio", minutos: 3 },
            { texto: "Agrega el relleno y dobla el omelette", minutos: 2 }
        ]
    },
    {
        id: 13, titulo: "Salmón con Vegetales", categoria: "cena", imagen: "resources/imgs/salmon.jpg",
        porciones: 2, minutos: 25,
        nutricion: { calorias: 420, proteinas: 35, carbohidratos: 12, grasas: 26 },
        ingredientes: [
            { nombre: "filete de salmón", cantidad: 300, unidad: "g" },
            { nombre: "brócoli", cantidad: 200, unidad: "g" },
            { nombre: "zanahoria", cantidad: 1, unidad: "" },
            { nombre: "aceite de oliva", cantidad: 1, unidad: "cda" },
            { nombre: "limón", cantidad: 1, unidad: "" }
        ],
        pasos: [
            { texto: "Precalienta el horno a 190 °C", minutos: 10 },
            { texto: "Coloca el salmón y las verduras en una bandeja con aceite y sal", minutos: 0 },
            { texto: "Hornea", minutos: 15 },
            { texto: "Sirve con limón", minutos: 0 }
        ]
    },
    {
        id: 14, titulo: "Ensalada de Frutas", categoria: "desayuno", imagen: "resources/imgs/ensaladafrutas.jpg",
        porciones: 2, minutos: 10,
        nutricion: { calorias: 160, proteinas: 2, carbohidratos: 40, grasas: 1 },
        ingredientes: [
            { nombre: "manzana", cantidad: 1, unidad: "" },
            { nombre: "naranja", cantidad: 1, unidad: "" },
            { nombre: "fresas", cantidad: 100, unidad: "g" },
            { nombre: "uvas", cantidad: 100, unidad: "g" },
            { nombre: "miel", cantidad: 1, unidad: "cdta" }
        ],
        pasos: [
            { texto: "Lava y corta toda la fruta", minutos: 0 },
            { texto: "Mézclala en un bol con la miel y el jugo de la naranja", minutos: 0 },
            { texto: "Refrigera antes de servir", minutos: 10 }
        ]
    },
    {
        id: 15, titulo: "Hamburguesa Saludable", categoria: "almuerzo", imagen: "resources/imgs/hamburguesa.jpeg",
        porciones: 2, minutos: 25,
        nutricion: { calorias: 390, proteinas: 30, carbohidratos: 30, grasas: 16 },
        ingredientes: [
            { nombre: "carne molida magra", cantidad: 300, unidad: "g" },
            { nombre: "avena en hojuelas", cantidad: 2, unidad: "cda" },
            { nombre: "cebolla", cantidad: 0.5, unidad: "" },
            { nombre: "pan integral", cantidad: 2, unidad: "" },
            { nombre: "lechuga", cantidad: 2, unidad: "hoja" },
            { nombre: "tomate", cantidad: 1, unidad: "" }
        ],
        pasos: [
            { texto: "Mezcla la carne con la avena, la cebolla, sal y pimienta", minutos: 0 },
            { texto: "Forma dos hamburguesas", minutos: 0 },
            { texto: "Cocínalas a la plancha", minutos: 10 },
            { texto: "Arma con el pan, la lechuga y el tomate", minutos: 0 }
        ]
    }
];

/* Sustituciones de ingredientes: si el nombre del ingrediente contiene la clave, se ofrece la alternativa */
export const SUSTITUCIONES = {
    "pechuga de pollo": "pavo, tofu firme o garbanzos",
    "leche": "bebida de avena, almendra o soja",
    "yogur natural": "yogur vegetal sin azúcar o queso fresco batido",
    "miel": "sirope de agave o dátiles triturados",
    "huevos": "tofu revuelto, o 1 cda de linaza molida con 3 cdas de agua por huevo",
    "arroz": "quinoa o arroz integral",
    "carne molida": "lentejas cocidas o pavo molido",
    "salmón": "trucha o atún fresco",
    "pescado": "otro pescado blanco o pollo",
    "aceite de oliva": "aceite de aguacate o de canola",
    "salsa de soja": "tamari o aminos de coco",
    "avena": "copos de quinoa o salvado de trigo",
    "queso fresco": "tofu o requesón",
    "tortillas": "hojas grandes de lechuga",
    "quinoa": "cuscús integral o arroz integral",
    "mantequilla": "aceite de oliva"
};

const quitarTildes = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function buscarSustituto(nombre) {
    const clave = Object.keys(SUSTITUCIONES).find(k => quitarTildes(nombre).includes(quitarTildes(k)));
    return clave ? SUSTITUCIONES[clave] : "";
}
