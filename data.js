let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [
    { username: 'student1', password: 'password', role: 'student', testHistory: [] },
    { username: 'admin1', password: 'adminpassword', role: 'admin', testHistory: [] }
];

// Definición de pruebas (módulos)
const allTests = [
    { id: 'lectora', name: 'Competencia Lectora', type: 'obligatoria', questionsCount: 65, duration: 150, temario: 'Localizar, Interpretar, Evaluar' }, // 2h 30min
    { id: 'm1', name: 'Competencia Matemática 1 (M1)', type: 'obligatoria', questionsCount: 65, duration: 140, temario: 'Números, Álgebra, Geometría, Estadística' }, // 2h 20min
    { id: 'm2', name: 'Competencia Matemática 2 (M2)', type: 'electiva', questionsCount: 55, duration: 140, temario: 'M1 + Logaritmos, Trigonometría, Probabilidad avanzada' }, // 2h 20min
    { id: 'ciencias', name: 'Ciencias', type: 'electiva', questionsCount: 80, duration: 160, temario: 'Física, Química, Biología, Ciencias de la Tierra' }, // 2h 40min
    { id: 'historia', name: 'Historia y Ciencias Sociales', type: 'electiva', questionsCount: 65, duration: 120, temario: 'Historia, Geografía, Economía, Ciencias Sociales' } // 2h 00min
];

// Definición de preguntas por módulo
// IMPORTANTE: 'correctOption' es el índice (0, 1, 2, 3...) de la respuesta correcta.
const allQuestions = {
    'lectora': [
        {
            question: "¿Cuál es el propósito principal de un texto argumentativo?",
            options: [
                "Narrar una historia.",
                "Describir un lugar.",
                "Persuadir al lector sobre un punto de vista.",
                "Instruir sobre cómo realizar una tarea."
            ],
            correctOption: 2 // Índice de "Persuadir al lector sobre un punto de vista."
        },
        {
            question: "En la frase 'El sol, una bola de fuego, iluminaba el sendero', ¿qué función cumple 'una bola de fuego'?",
            options: [
                "Sujeto.",
                "Predicado.",
                "Aposición.",
                "Objeto directo."
            ],
            correctOption: 2 // Índice de "Aposición."
        },
        {
            question: "¿Qué tipo de texto busca convencer al lector mediante razones y evidencias?",
            options: [
                "Expositivo.",
                "Lírico.",
                "Argumentativo.",
                "Descriptivo."
            ],
            correctOption: 2
        },
        {
            question: "Identifique la figura literaria presente en 'Tus ojos son dos luceros'.",
            options: [
                "Metáfora.",
                "Símil.",
                "Hipérbole.",
                "Personificación."
            ],
            correctOption: 0
        },
        {
            question: "¿Cuál de las siguientes es una característica principal de una noticia periodística?",
            options: [
                "Subjetividad.",
                "Ficción.",
                "Objetividad.",
                "Opinión personal del autor."
            ],
            correctOption: 2
        },
        {
            question: "¿Qué es la coherencia textual?",
            options: [
                "La corrección gramatical de un texto.",
                "La relación lógica entre las ideas de un texto.",
                "El uso de un vocabulario variado.",
                "La ausencia de faltas de ortografía."
            ],
            correctOption: 1
        },
        {
            question: "¿Qué elemento no es esencial en la estructura de un ensayo?",
            options: [
                "Introducción.",
                "Desarrollo.",
                "Clímax.",
                "Conclusión."
            ],
            correctOption: 2
        },
        {
            question: "Si un texto tiene como objetivo informar sobre un tema, ¿qué modalidad discursiva predomina?",
            options: [
                "Narrativa.",
                "Descriptiva.",
                "Expositiva.",
                "Argumentativa."
            ],
            correctOption: 2
        },
        {
            question: "En una carta formal, ¿qué se incluye en el saludo?",
            options: [
                "Una anécdota personal.",
                "La despedida.",
                "El nombre del destinatario y un tratamiento de respeto.",
                "Un resumen del contenido de la carta."
            ],
            correctOption: 2
        },
        {
            question: "¿Cuál es el significado de la palabra 'efímero'?",
            options: [
                "Duradero.",
                "Breve.",
                "Constante.",
                "Eterno."
            ],
            correctOption: 1
        }
        // Puedes duplicar estas 10 preguntas 6 veces para llegar a 60, y añadir 5 más.
        // O generar más preguntas manualmente para mayor variedad.
        // Por ahora, para pruebas, con 10 o 20 es suficiente.
        // Asegúrate de que el número de preguntas aquí coincida con questionsCount en allTests.
    ],
    'm1': [
        {
            question: "Si el punto (a, b) se rota 180° con centro en el origen, ¿cuáles son sus nuevas coordenadas?",
            options: [
                "(b, a)",
                "(-a, -b)",
                "(a, -b)",
                "(-a, b)"
            ],
            correctOption: 1 // Índice de "(-a, -b)"
        },
        {
            question: "¿Cuál es el resultado de (2x + 3)(x - 1)?",
            options: [
                "2x² + x - 3",
                "2x² - x - 3",
                "2x² + 5x - 3",
                "2x² - 5x - 3"
            ],
            correctOption: 0
        },
        {
            question: "Si f(x) = 3x - 2, ¿cuál es el valor de f(4)?",
            options: [
                "8",
                "10",
                "12",
                "14"
            ],
            correctOption: 1
        },
        {
            question: "¿Cuál es el valor de 'x' en la ecuación 2x + 5 = 15?",
            options: [
                "5",
                "10",
                "2.5",
                "7.5"
            ],
            correctOption: 0
        },
        {
            question: "Un triángulo tiene lados de longitud 3, 4 y 5. ¿Qué tipo de triángulo es?",
            options: [
                "Equilátero.",
                "Isósceles.",
                "Rectángulo.",
                "Obtusángulo."
            ],
            correctOption: 2
        }
    ],
    'm2': [
        {
            question: "¿Cuál es la derivada de f(x) = x³ + 2x?",
            options: [
                "3x² + 2",
                "x⁴/4 + x²",
                "3x²",
                "2x + 2"
            ],
            correctOption: 0
        },
        {
            question: "¿Qué es el valor de log₂(8)?",
            options: [
                "2",
                "3",
                "4",
                "8"
            ],
            correctOption: 1
        }
    ],
    'ciencias': [
        {
            question: "¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional?",
            options: [
                "Joule",
                "Watt",
                "Newton",
                "Pascal"
            ],
            correctOption: 2
        },
        {
            question: "¿Qué gas es el más abundante en la atmósfera terrestre?",
            options: [
                "Oxígeno",
                "Dióxido de carbono",
                "Nitrógeno",
                "Argón"
            ],
            correctOption: 2
        }
    ],
    'historia': [
        {
            question: "¿En qué año se firmó la Declaración de Independencia de Chile?",
            options: [
                "1810",
                "1818",
                "1823",
                "1830"
            ],
            correctOption: 1
        },
        {
            question: "¿Cuál fue la causa principal de la Primera Guerra Mundial?",
            options: [
                "La Revolución Industrial",
                "El asesinato del Archiduque Francisco Fernando",
                "La crisis económica de 1929",
                "La Guerra Fría"
            ],
            correctOption: 1
        }
    ]
};

// Función para guardar los datos en localStorage
function saveData() {
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    // No guardamos allTests ni allQuestions en localStorage porque son datos estáticos de la aplicación
    // Si quisieras que el administrador pudiera modificarlos, tendrías que guardarlos también.
}

// Inicializar datos si es la primera vez que se carga la página
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('allUsers')) {
        saveData(); // Guarda los usuarios iniciales si no existen
    }
});