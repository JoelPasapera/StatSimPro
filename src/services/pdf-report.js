/**
 * @fileoverview Módulo de Generación de Reportes PDF
 * Genera reportes profesionales en formato PDF con los resultados
 * del análisis estadístico.
 * 
 * Usa jsPDF cargado dinámicamente desde CDN.
 * 
 * @module services/pdf-report
 * @author Joel Pasapera - Arquitectura empresarial
 */

import { CONFIG, TEXTOS } from '../core/config.js';
import { formatearNumero } from '../utils/helpers.js';

/**
 * URL del CDN de jsPDF
 */
const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

/**
 * Instancia cargada de jsPDF
 * @type {any}
 */
let jsPDF = null;

/**
 * Carga jsPDF dinámicamente desde CDN
 * @returns {Promise<any>} Promesa con la clase jsPDF
 */
async function cargarJsPDF() {
    if (jsPDF) return jsPDF;
    
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado globalmente
        if (window.jspdf?.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
            resolve(jsPDF);
            return;
        }
        
        const script = document.createElement('script');
        script.src = JSPDF_CDN;
        script.async = true;
        
        script.onload = () => {
            if (window.jspdf?.jsPDF) {
                jsPDF = window.jspdf.jsPDF;
                resolve(jsPDF);
            } else {
                reject(new Error('jsPDF no se cargó correctamente'));
            }
        };
        
        script.onerror = () => reject(new Error('Error al cargar jsPDF desde CDN'));
        
        document.head.appendChild(script);
    });
}

/**
 * @typedef {Object} DatosReporte
 * @property {string} var1 - Nombre variable 1
 * @property {string} var2 - Nombre variable 2
 * @property {Object} correlacion - Resultados de correlación
 * @property {Object} marco - Marco metodológico
 * @property {string} unidadAnalisis - Unidad de análisis
 * @property {string} lugarContexto - Lugar/contexto
 */

/**
 * Genera un reporte PDF completo con los resultados del análisis
 * @param {DatosReporte} datos - Datos del análisis
 * @returns {Promise<Blob>} Blob del PDF generado
 */
export async function generarReportePDF(datos) {
    const PDF = await cargarJsPDF();
    
    const doc = new PDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;
    
    // Colores del tema
    const colores = {
        primario: [30, 64, 175],      // #1e40af
        secundario: [245, 158, 11],   // #f59e0b
        texto: [30, 41, 59],          // #1e293b
        gris: [100, 116, 139],        // #64748b
        linea: [226, 232, 240]        // #e2e8f0
    };
    
    /**
     * Agrega el encabezado del documento
     */
    function agregarEncabezado() {
        // Línea decorativa superior
        doc.setFillColor(...colores.primario);
        doc.rect(0, 0, pageWidth, 8, 'F');
        
        // Título principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(...colores.primario);
        doc.text('Reporte de Análisis Estadístico', pageWidth / 2, 25, { align: 'center' });
        
        // Subtítulo
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(...colores.gris);
        doc.text(`Generado por ${CONFIG.APP.NOMBRE} v${CONFIG.APP.VERSION}`, pageWidth / 2, 33, { align: 'center' });
        
        // Fecha
        const fecha = new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Fecha: ${fecha}`, pageWidth / 2, 40, { align: 'center' });
        
        // Línea separadora
        doc.setDrawColor(...colores.linea);
        doc.setLineWidth(0.5);
        doc.line(margin, 45, pageWidth - margin, 45);
        
        cursorY = 55;
    }
    
    /**
     * Agrega un título de sección
     */
    function agregarTituloSeccion(titulo, icono = '') {
        verificarEspacioPagina(20);
        
        doc.setFillColor(...colores.primario);
        doc.roundedRect(margin, cursorY, contentWidth, 10, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`${icono} ${titulo}`.trim(), margin + 5, cursorY + 7);
        
        cursorY += 15;
    }
    
    /**
     * Agrega un párrafo de texto
     */
    function agregarParrafo(texto, opciones = {}) {
        const fontSize = opciones.fontSize || 10;
        const bold = opciones.bold || false;
        const indent = opciones.indent || 0;
        
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(fontSize);
        doc.setTextColor(...colores.texto);
        
        const lines = doc.splitTextToSize(texto, contentWidth - indent);
        const lineHeight = fontSize * 0.4;
        
        verificarEspacioPagina(lines.length * lineHeight + 5);
        
        lines.forEach(line => {
            doc.text(line, margin + indent, cursorY);
            cursorY += lineHeight;
        });
        
        cursorY += 3;
    }
    
    /**
     * Agrega una tabla simple
     */
    function agregarTabla(filas, opciones = {}) {
        const anchoCol1 = opciones.anchoCol1 || contentWidth * 0.5;
        const anchoCol2 = contentWidth - anchoCol1;
        
        filas.forEach(([etiqueta, valor], index) => {
            verificarEspacioPagina(8);
            
            // Fondo alternado
            if (index % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(margin, cursorY - 4, contentWidth, 8, 'F');
            }
            
            // Etiqueta
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...colores.gris);
            doc.text(etiqueta, margin + 3, cursorY);
            
            // Valor
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colores.texto);
            doc.text(String(valor), margin + anchoCol1 + 5, cursorY);
            
            cursorY += 8;
        });
        
        cursorY += 5;
    }
    
    /**
     * Agrega una caja destacada
     */
    function agregarCajaDestacada(titulo, contenido, tipo = 'info') {
        const coloresCaja = {
            info: [219, 234, 254],      // azul claro
            success: [220, 252, 231],   // verde claro
            warning: [254, 243, 199],   // amarillo claro
            error: [254, 226, 226]      // rojo claro
        };
        
        const bordesCaja = {
            info: [59, 130, 246],
            success: [34, 197, 94],
            warning: [245, 158, 11],
            error: [239, 68, 68]
        };
        
        const lines = doc.splitTextToSize(contenido, contentWidth - 15);
        const alturaContenido = lines.length * 5 + 15;
        
        verificarEspacioPagina(alturaContenido + 10);
        
        // Fondo
        doc.setFillColor(...(coloresCaja[tipo] || coloresCaja.info));
        doc.roundedRect(margin, cursorY, contentWidth, alturaContenido, 3, 3, 'F');
        
        // Borde izquierdo
        doc.setFillColor(...(bordesCaja[tipo] || bordesCaja.info));
        doc.rect(margin, cursorY, 3, alturaContenido, 'F');
        
        // Título de la caja
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...(bordesCaja[tipo] || bordesCaja.info));
        doc.text(titulo, margin + 8, cursorY + 8);
        
        // Contenido
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colores.texto);
        
        let yTexto = cursorY + 15;
        lines.forEach(line => {
            doc.text(line, margin + 8, yTexto);
            yTexto += 5;
        });
        
        cursorY += alturaContenido + 8;
    }
    
    /**
     * Verifica si hay espacio suficiente, si no, agrega nueva página
     */
    function verificarEspacioPagina(espacioNecesario) {
        if (cursorY + espacioNecesario > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
            
            // Mini encabezado en páginas siguientes
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(...colores.gris);
            doc.text(`${CONFIG.APP.NOMBRE} - Reporte de Análisis`, margin, 10);
            doc.text(`Página ${doc.getNumberOfPages()}`, pageWidth - margin, 10, { align: 'right' });
            
            doc.setDrawColor(...colores.linea);
            doc.line(margin, 13, pageWidth - margin, 13);
            
            cursorY = 20;
        }
    }
    
    /**
     * Agrega el pie de página a todas las páginas
     */
    function agregarPiePaginas() {
        const totalPages = doc.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // Línea
            doc.setDrawColor(...colores.linea);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            
            // Texto
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...colores.gris);
            doc.text(
                'Generado automáticamente - Para uso académico',
                margin,
                pageHeight - 10
            );
            doc.text(
                `Página ${i} de ${totalPages}`,
                pageWidth - margin,
                pageHeight - 10,
                { align: 'right' }
            );
        }
    }
    
    // ========================================
    // CONSTRUCCIÓN DEL DOCUMENTO
    // ========================================
    
    // 1. Encabezado
    agregarEncabezado();
    
    // 2. Variables analizadas
    agregarTituloSeccion('Variables del Estudio');
    agregarTabla([
        ['Variable 1:', datos.var1],
        ['Variable 2:', datos.var2],
        ['Unidad de análisis:', datos.unidadAnalisis || 'No especificada'],
        ['Contexto:', datos.lugarContexto || 'No especificado']
    ]);
    
    // 3. Marco Metodológico
    if (datos.marco) {
        agregarTituloSeccion('Marco Metodológico');
        
        agregarParrafo('Pregunta de investigación:', { bold: true });
        agregarParrafo(datos.marco.preguntaInvestigacion, { indent: 5 });
        
        agregarParrafo('Objetivo general:', { bold: true });
        agregarParrafo(datos.marco.objetivoGeneral, { indent: 5 });
        
        agregarParrafo('Hipótesis del investigador (H₁):', { bold: true });
        agregarParrafo(datos.marco.hipotesis.hipotesisInvestigador, { indent: 5 });
        
        agregarParrafo('Hipótesis nula (H₀):', { bold: true });
        agregarParrafo(datos.marco.hipotesis.hipotesisNula, { indent: 5 });
    }
    
    // 4. Pruebas de Normalidad
    if (datos.correlacion?.normalidad1 && datos.correlacion?.normalidad2) {
        agregarTituloSeccion('Pruebas de Normalidad');
        
        const n1 = datos.correlacion.normalidad1;
        const n2 = datos.correlacion.normalidad2;
        
        agregarTabla([
            ['Variable', 'Prueba', 'Estadístico', 'p-valor', 'Distribución'],
            [datos.var1, n1.prueba, formatearNumero(n1.estadistico, 4), formatearNumero(n1.pValor, 4), n1.esNormal ? 'Normal' : 'No normal'],
            [datos.var2, n2.prueba, formatearNumero(n2.estadistico, 4), formatearNumero(n2.pValor, 4), n2.esNormal ? 'Normal' : 'No normal']
        ]);
        
        const metodoSeleccionado = n1.esNormal && n2.esNormal ? 'Pearson' : 'Spearman';
        agregarCajaDestacada(
            'Interpretación',
            `Basándose en los resultados de normalidad, se utilizó el coeficiente de correlación de ${metodoSeleccionado}. ${
                metodoSeleccionado === 'Pearson' 
                    ? 'Ambas variables presentan distribución normal (p > 0.05).'
                    : 'Al menos una variable no presenta distribución normal (p < 0.05), por lo que se optó por una prueba no paramétrica.'
            }`,
            'info'
        );
    }
    
    // 5. Análisis de Correlación
    if (datos.correlacion) {
        agregarTituloSeccion('Análisis de Correlación');
        
        const corr = datos.correlacion;
        
        agregarTabla([
            ['Tipo de correlación:', corr.tipoCorrelacion],
            ['Coeficiente (r):', formatearNumero(corr.coeficiente, 4)],
            ['Coeficiente de determinación (r²):', formatearNumero(Math.pow(corr.coeficiente, 2), 4)],
            ['p-valor:', formatearNumero(corr.pValor, 4)],
            ['Tamaño del efecto:', corr.interpretacion?.magnitud || 'No disponible'],
            ['Dirección:', corr.coeficiente > 0 ? 'Positiva (directa)' : 'Negativa (inversa)']
        ]);
        
        if (corr.interpretacion?.texto) {
            agregarCajaDestacada(
                'Interpretación del Coeficiente',
                corr.interpretacion.texto,
                'success'
            );
        }
    }
    
    // 6. Decisión Estadística
    if (datos.correlacion?.pValor !== undefined) {
        agregarTituloSeccion('Decisión Estadística');
        
        const alpha = CONFIG.ESTADISTICA?.ALPHA || 0.05;
        const decision = datos.correlacion.pValor < alpha;
        
        agregarTabla([
            ['Nivel de significancia (α):', alpha],
            ['p-valor obtenido:', formatearNumero(datos.correlacion.pValor, 4)],
            ['Comparación:', `${formatearNumero(datos.correlacion.pValor, 4)} ${decision ? '<' : '≥'} ${alpha}`],
            ['Decisión:', decision ? 'SE RECHAZA H₀' : 'NO SE RECHAZA H₀']
        ]);
        
        const textoDecision = decision
            ? `Con un nivel de significancia de ${alpha}, se rechaza la hipótesis nula. Existe evidencia estadística suficiente para afirmar que existe una relación significativa entre ${datos.var1} y ${datos.var2}.`
            : `Con un nivel de significancia de ${alpha}, no se rechaza la hipótesis nula. No existe evidencia estadística suficiente para afirmar que existe una relación significativa entre ${datos.var1} y ${datos.var2}.`;
        
        agregarCajaDestacada(
            'Conclusión',
            textoDecision,
            decision ? 'success' : 'warning'
        );
    }
    
    // 7. Referencias
    agregarTituloSeccion('Referencias Bibliográficas');
    
    if (TEXTOS?.REFERENCIAS) {
        TEXTOS.REFERENCIAS.forEach((ref, index) => {
            agregarParrafo(
                `${index + 1}. ${ref.autor} (${ref.anio}). ${ref.titulo}. ${ref.url}`,
                { fontSize: 9 }
            );
        });
    } else {
        agregarParrafo(
            'Cohen, J. (2013). Statistical Power Analysis for the Behavioral Sciences. Routledge.',
            { fontSize: 9 }
        );
        agregarParrafo(
            'Hernández-Sampieri, R., & Mendoza, C. (2023). Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta.',
            { fontSize: 9 }
        );
    }
    
    // Agregar pies de página
    agregarPiePaginas();
    
    // Retornar como Blob
    return doc.output('blob');
}

/**
 * Descarga el reporte PDF directamente
 * @param {DatosReporte} datos - Datos del análisis
 * @param {string} [nombreArchivo] - Nombre del archivo
 */
export async function descargarReportePDF(datos, nombreArchivo = 'reporte_estadistico') {
    try {
        const PDF = await cargarJsPDF();
        const blob = await generarReportePDF(datos);
        
        // Crear URL y descargar
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return { exito: true };
    } catch (error) {
        console.error('Error al generar PDF:', error);
        return { 
            exito: false, 
            error: error.message || 'Error desconocido al generar el PDF'
        };
    }
}

/**
 * Verifica si jsPDF está disponible
 * @returns {Promise<boolean>}
 */
export async function verificarDisponibilidadPDF() {
    try {
        await cargarJsPDF();
        return true;
    } catch {
        return false;
    }
}

export default {
    generarReportePDF,
    descargarReportePDF,
    verificarDisponibilidadPDF
};
