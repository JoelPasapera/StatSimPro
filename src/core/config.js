/**
 * @fileoverview Configuraciones globales de la aplicación StatSim Pro
 * Centraliza constantes, configuraciones y opciones que pueden ser modificadas
 * sin alterar la lógica de negocio.
 * 
 * @module core/config
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

/**
 * Configuración de la aplicación
 * @constant {Object}
 */
export const CONFIG = Object.freeze({
    /**
     * Información de la aplicación
     */
    APP: {
        NOMBRE: 'StatSim Pro',
        VERSION: '2.0.0',
        AUTOR: 'Joel Pasapera',
        DESCRIPCION: 'Simulador y Analizador Estadístico Profesional'
    },
    
    /**
     * Configuración del generador de datos
     */
    GENERADOR: {
        TAMANO_MUESTRA_MIN: 2,
        TAMANO_MUESTRA_MAX: 100000,
        TAMANO_MUESTRA_DEFAULT: 100,
        ITEMS_MIN: 1,
        ITEMS_MAX: 500,
        DECIMALES_MIN: 0,
        DECIMALES_MAX: 4,
        DECIMALES_DEFAULT: 2
    },
    
    /**
     * Configuración del analizador estadístico
     */
    ANALIZADOR: {
        NIVEL_SIGNIFICANCIA_DEFAULT: 0.05,
        OBSERVACIONES_MIN: 3,
        UMBRAL_SHAPIRO_WILK: 50,
        TIPOS_PRUEBA: ['bilateral', 'unilateral'],
        TIPO_PRUEBA_DEFAULT: 'bilateral'
    },
    
    /**
     * Configuración estadística general
     */
    ESTADISTICA: {
        ALPHA: 0.05,
        UMBRALES: {
            NULA: 0.1,
            DEBIL: 0.3,
            MODERADA: 0.5,
            FUERTE: 0.7,
            MUY_FUERTE: 0.9
        }
    },
    
    /**
     * Configuración de interfaz de usuario
     */
    UI: {
        TOAST_DURACION: 3000,
        PREVIEW_MAX_FILAS: 10,
        ANIMACION_DURACION: 300,
        DEBOUNCE_INPUT: 300
    },
    
    /**
     * Configuración de exportación
     */
    EXPORTACION: {
        DELIMITADOR_CSV: ',',
        ENCODING: 'utf-8',
        NOMBRE_ARCHIVO_DATOS: 'base_datos_simulada.csv',
        NOMBRE_ARCHIVO_RESULTADOS: 'resultados_analisis.txt'
    }
});

/**
 * Umbrales para interpretación de correlaciones (Cohen, 2013)
 * @constant {Object}
 */
export const UMBRALES_CORRELACION = Object.freeze({
    NULA: 0.1,
    DEBIL: 0.3,
    MODERADA: 0.5,
    FUERTE: 0.7,
    MUY_FUERTE: 0.9
});

/**
 * Mensajes de error estandarizados
 * @constant {Object}
 */
export const MENSAJES_ERROR = Object.freeze({
    DATOS_VACIOS: 'No hay datos para analizar',
    DATOS_INSUFICIENTES: 'Se necesitan al menos 3 observaciones',
    VARIABLES_NO_SELECCIONADAS: 'Por favor selecciona ambas variables',
    VARIABLES_IGUALES: 'Las variables deben ser diferentes',
    COLUMNAS_DIFERENTES: 'Las columnas deben tener el mismo número de valores',
    TAMANO_MUESTRAL_INVALIDO: 'El tamaño muestral debe ser al menos 2',
    PRUEBA_REQUERIDA: 'Debe agregar al menos una prueba',
    SOCIO_REQUERIDO: 'Debe agregar al menos una variable sociodemográfica',
    ARCHIVO_INVALIDO: 'Por favor selecciona un archivo CSV válido',
    CSV_FORMATO_INVALIDO: 'El archivo CSV debe tener al menos encabezados y una fila de datos',
    DESVIACION_INVALIDA: 'La desviación estándar debe ser mayor a 0',
    RANGO_INVALIDO: 'El mínimo debe ser menor que el máximo'
});

/**
 * Mensajes de éxito estandarizados
 * @constant {Object}
 */
export const MENSAJES_EXITO = Object.freeze({
    DATOS_GENERADOS: '¡Base de datos generada exitosamente!',
    CSV_DESCARGADO: 'CSV descargado exitosamente',
    DATOS_CARGADOS: 'Datos cargados exitosamente',
    ANALISIS_COMPLETADO: 'Análisis completado exitosamente',
    FILA_AGREGADA: 'Fila agregada',
    FILA_ELIMINADA: 'Fila eliminada',
    CONFIG_IMPORTADA: 'Configuración importada exitosamente',
    CONFIG_EXPORTADA: 'Configuración exportada exitosamente'
});

/**
 * Selectores DOM centralizados
 * Facilita mantenimiento si cambian los IDs/clases
 * @constant {Object}
 */
export const SELECTORES = Object.freeze({
    // Navegación
    NAV_LINKS: '.nav-link',
    SECCIONES: '.section',
    
    // Generador
    TAMANO_MUESTRA: '#tamanoMuestra',
    BODY_PRUEBAS: '#bodyPruebas',
    BODY_SOCIO: '#bodySocio',
    BTN_AGREGAR_PRUEBA: '#btnAgregarPrueba',
    BTN_AGREGAR_SOCIO: '#btnAgregarSocio',
    BTN_GENERAR: '#btnGenerar',
    BTN_DESCARGAR_CSV: '#btnDescargarCSV',
    PREVIEW_CONTAINER: '#previewContainer',
    PREVIEW_HEAD: '#previewHead',
    PREVIEW_BODY: '#previewBody',
    
    // Analizador
    FILE_INPUT: '#fileInput',
    BTN_USAR_GENERADOS: '#btnUsarGenerados',
    VARIABLE_1: '#variable1',
    VARIABLE_2: '#variable2',
    UNIDAD_ANALISIS: '#unidadAnalisis',
    LUGAR_CONTEXTO: '#lugarContexto',
    BTN_ANALIZAR: '#btnAnalizar',
    DATOS_CONTAINER: '#datosContainer',
    SELECCION_CONTAINER: '#seleccionContainer',
    
    // Resultados
    MARCO_METODOLOGICO_CONTAINER: '#marcoMetodologicoContainer',
    PRUEBAS_NORMALIDAD_CONTAINER: '#pruebasNormalidadContainer',
    RESULTADOS_CORRELACION: '#resultadosCorrelacion',
    RESULTADOS_DECISION: '#resultadosDecision',
    RESULTADOS_DISCUSION: '#resultadosDiscusion',
    RESULTADOS_CONTAINER: '#resultadosContainer',
    
    // UI general
    TOAST: '#toast',
    
    // Clases
    FILA_PRUEBA: '.fila-prueba',
    FILA_SOCIO: '.fila-socio',
    BTN_DELETE: '.btn-delete',
    ACTIVE: '.active'
});

/**
 * Mensajes unificados para la aplicación
 * @constant {Object}
 */
export const MENSAJES = Object.freeze({
    ERRORES: MENSAJES_ERROR,
    EXITO: MENSAJES_EXITO
});

/**
 * Textos de la interfaz (internacionalización futura)
 * @constant {Object}
 */
export const TEXTOS = Object.freeze({
    TITULO_SIMULADOR: 'Generador de Base de Datos',
    SUBTITULO_SIMULADOR: 'Simula datos estadísticos controlados para tu investigación',
    TITULO_ANALIZADOR: 'Analizador Estadístico',
    SUBTITULO_ANALIZADOR: 'Análisis de normalidad y correlación al estilo SPSS',
    
    // Etiquetas de estadísticas
    PARTICIPANTES: 'Participantes',
    VARIABLES: 'Variables',
    PRUEBAS: 'Pruebas',
    
    // Interpretaciones
    CORRELACION_NULA: 'nula o muy débil',
    CORRELACION_DEBIL: 'débil',
    CORRELACION_MODERADA: 'moderada',
    CORRELACION_FUERTE: 'fuerte',
    CORRELACION_MUY_FUERTE: 'muy fuerte',
    
    DIRECCION_POSITIVA: 'positiva',
    DIRECCION_NEGATIVA: 'negativa',
    
    SIGNIFICANCIA_ALTA: 'altamente significativa (p < .001)',
    SIGNIFICANCIA_MUY: 'muy significativa (p < .01)',
    SIGNIFICANCIA_SI: 'significativa (p < .05)',
    SIGNIFICANCIA_NO: 'no significativa (p ≥ .05)',
    
    // Metodología - Textos explicativos
    METODOLOGIA_NORMALIDAD: 'Hernández-Sampieri & Mendoza (2023) establecen que el tamaño muestral es el criterio decisivo para elegir la prueba de normalidad adecuada, porque cada una tiene sensibilidad diferente según el volumen de datos. Shapiro-Wilk es la prueba más potente para muestras pequeñas (n < 50), mientras que Kolmogorov-Smirnov es recomendable para muestras mayores (n ≥ 50).',
    
    METODOLOGIA_CORRELACION: 'El análisis de correlación permite medir la fuerza y dirección de la relación entre dos variables cuantitativas. Según Hernández, Fernández & Baptista (2010), el coeficiente de Pearson es adecuado cuando ambas variables siguen una distribución normal, mientras que Spearman es preferible cuando al menos una variable no cumple con la normalidad.',
    
    METODOLOGIA_HIPOTESIS: 'Según Taherdoost (2022), la prueba de hipótesis es un procedimiento estadístico que permite evaluar afirmaciones sobre parámetros poblacionales basándose en datos muestrales. El proceso implica formular H₀ y H₁, seleccionar un nivel de significancia (α), calcular un estadístico de prueba y determinar el p-valor asociado.',
    
    // Referencias bibliográficas
    REFERENCIAS: [
        {
            autor: 'Hernández-Sampieri, R., & Mendoza, C.',
            anio: '2023',
            titulo: 'Metodología de la investigación: las rutas cuantitativa, cualitativa y mixta',
            url: 'https://apiperiodico.jalisco.gob.mx/api/sites/periodicooficial.jalisco.gob.mx/files/metodologia_de_la_investigacion_-_roberto_hernandez_sampieri.pdf'
        },
        {
            autor: 'Hernández, D., Fernández, C., & Baptista, M. D. P.',
            anio: '2010',
            titulo: 'Metodología de la investigación 5ta Edición Sampieri',
            url: 'https://www.academia.edu/download/46694261/Metodologia_de_la_investigacion_5ta_Edicion_Sampieri___Dulce_Hernandez_-_Academia.edu.pdf'
        },
        {
            autor: 'Taherdoost, H.',
            anio: '2022',
            titulo: 'What are different research approaches? Comprehensive review of qualitative, quantitative, and mixed method research. Journal of Management Science & Engineering Research, 5(1), 53-63',
            url: 'https://hal.science/hal-03741840/document'
        },
        {
            autor: 'Cohen, J.',
            anio: '2013',
            titulo: 'Statistical power analysis for the behavioral sciences. Routledge',
            url: 'https://www.taylorfrancis.com/books/mono/10.4324/9780203771587/statistical-power-analysis-behavioral-sciences-jacob-cohen'
        }
    ]
});

/**
 * Referencias bibliográficas
 * @constant {Array<Object>}
 */
export const REFERENCIAS = Object.freeze([
    {
        id: 1,
        texto: 'Hernández-Sampieri, R., & Mendoza, C. (2023). Metodología de la investigación: las rutas cuantitativa, cualitativa y mixta.',
        url: 'https://apiperiodico.jalisco.gob.mx/api/sites/periodicooficial.jalisco.gob.mx/files/metodologia_de_la_investigacion_-_roberto_hernandez_sampieri.pdf'
    },
    {
        id: 2,
        texto: 'Hernández, D., Fernández, C., & Baptista, M. D. P. (2010). Metodología de la investigación 5ta Edición Sampieri.',
        url: 'https://www.academia.edu/download/46694261/Metodologia_de_la_investigacion_5ta_Edicion_Sampieri___Dulce_Hernandez_-_Academia.edu.pdf'
    },
    {
        id: 3,
        texto: 'Taherdoost, H. (2022). What are different research approaches? Comprehensive review of qualitative, quantitative, and mixed method research. Journal of Management Science & Engineering Research, 5(1), 53-63.',
        url: 'https://hal.science/hal-03741840/document'
    },
    {
        id: 4,
        texto: 'Cohen, J. (2013). Statistical power analysis for the behavioral sciences. Routledge.',
        url: 'https://www.taylorfrancis.com/books/mono/10.4324/9780203771587/statistical-power-analysis-behavioral-sciences-jacob-cohen'
    }
]);

export default {
    CONFIG,
    UMBRALES_CORRELACION,
    MENSAJES_ERROR,
    MENSAJES_EXITO,
    MENSAJES,
    SELECTORES,
    TEXTOS,
    REFERENCIAS
};
