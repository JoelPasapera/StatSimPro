/**
 * @fileoverview Servicio de manejo de archivos
 * Proporciona funciones para cargar, descargar y gestionar archivos.
 * 
 * @module services/file-handler
 * @author Joel Pasapera - Refactorizado para arquitectura empresarial
 */

import { parsearCSV, generarCSV } from './csv-parser.js';

/**
 * @typedef {Object} OpcionesDescarga
 * @property {string} [tipo='text/plain'] - Tipo MIME del archivo
 * @property {string} [charset='utf-8'] - Codificación
 */

/**
 * @typedef {Object} ResultadoCarga
 * @property {boolean} exito - Si la carga fue exitosa
 * @property {string} contenido - Contenido del archivo
 * @property {string} nombre - Nombre del archivo
 * @property {number} tamano - Tamaño en bytes
 * @property {string} [error] - Mensaje de error si falló
 */

/**
 * Lee un archivo de texto usando FileReader
 * @param {File} archivo - Archivo a leer
 * @param {string} [encoding='utf-8'] - Codificación
 * @returns {Promise<ResultadoCarga>} Resultado de la lectura
 */
export function leerArchivoTexto(archivo, encoding = 'utf-8') {
    return new Promise((resolve) => {
        if (!archivo) {
            resolve({
                exito: false,
                contenido: '',
                nombre: '',
                tamano: 0,
                error: 'No se proporcionó archivo'
            });
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (evento) => {
            resolve({
                exito: true,
                contenido: evento.target.result,
                nombre: archivo.name,
                tamano: archivo.size
            });
        };
        
        reader.onerror = () => {
            resolve({
                exito: false,
                contenido: '',
                nombre: archivo.name,
                tamano: archivo.size,
                error: 'Error al leer el archivo'
            });
        };
        
        reader.readAsText(archivo, encoding);
    });
}

/**
 * Lee un archivo CSV y lo parsea automáticamente
 * @param {File} archivo - Archivo CSV
 * @param {Object} [opcionesParser] - Opciones para el parser CSV
 * @returns {Promise<Object>} Resultado del parseo con datos
 */
export async function cargarArchivoCSV(archivo, opcionesParser = {}) {
    // Validar extensión
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
        return {
            exito: false,
            datos: [],
            columnas: [],
            errores: ['El archivo debe tener extensión .csv']
        };
    }
    
    // Leer contenido
    const resultadoLectura = await leerArchivoTexto(archivo);
    
    if (!resultadoLectura.exito) {
        return {
            exito: false,
            datos: [],
            columnas: [],
            errores: [resultadoLectura.error]
        };
    }
    
    // Parsear CSV
    return parsearCSV(resultadoLectura.contenido, opcionesParser);
}

/**
 * Descarga contenido como archivo
 * @param {string} contenido - Contenido del archivo
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {OpcionesDescarga} [opciones] - Opciones de descarga
 */
export function descargarArchivo(contenido, nombreArchivo, opciones = {}) {
    const {
        tipo = 'text/plain',
        charset = 'utf-8'
    } = opciones;
    
    const blob = new Blob([contenido], { 
        type: `${tipo};charset=${charset}` 
    });
    
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nombreArchivo);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar memoria
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
        // Fallback para navegadores antiguos
        window.open(`data:${tipo};charset=${charset},${encodeURIComponent(contenido)}`);
    }
}

/**
 * Descarga datos como archivo CSV
 * @param {Object[]} datos - Datos a exportar
 * @param {string} nombreArchivo - Nombre del archivo (sin extensión)
 * @param {Object} [opciones] - Opciones de generación CSV
 */
export function descargarCSV(datos, nombreArchivo, opciones = {}) {
    const contenidoCSV = generarCSV(datos, opciones);
    const nombreConExtension = nombreArchivo.endsWith('.csv') 
        ? nombreArchivo 
        : `${nombreArchivo}.csv`;
        
    descargarArchivo(contenidoCSV, nombreConExtension, {
        tipo: 'text/csv'
    });
}

/**
 * Descarga datos como archivo de texto plano
 * @param {string} contenido - Contenido del archivo
 * @param {string} nombreArchivo - Nombre del archivo
 */
export function descargarTexto(contenido, nombreArchivo) {
    const nombreConExtension = nombreArchivo.endsWith('.txt')
        ? nombreArchivo
        : `${nombreArchivo}.txt`;
        
    descargarArchivo(contenido, nombreConExtension, {
        tipo: 'text/plain'
    });
}

/**
 * Descarga un objeto como archivo JSON
 * @param {Object} datos - Datos a exportar
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {boolean} [formatear=true] - Si formatear el JSON con indentación
 */
export function descargarJSON(datos, nombreArchivo, formatear = true) {
    const contenido = formatear 
        ? JSON.stringify(datos, null, 2)
        : JSON.stringify(datos);
        
    const nombreConExtension = nombreArchivo.endsWith('.json')
        ? nombreArchivo
        : `${nombreArchivo}.json`;
        
    descargarArchivo(contenido, nombreConExtension, {
        tipo: 'application/json'
    });
}

/**
 * Valida el tamaño de un archivo
 * @param {File} archivo - Archivo a validar
 * @param {number} maxMB - Tamaño máximo en MB
 * @returns {Object} {valido, mensaje}
 */
export function validarTamanoArchivo(archivo, maxMB = 10) {
    if (!archivo) {
        return { valido: false, mensaje: 'No se proporcionó archivo' };
    }
    
    const maxBytes = maxMB * 1024 * 1024;
    
    if (archivo.size > maxBytes) {
        return {
            valido: false,
            mensaje: `El archivo excede el tamaño máximo de ${maxMB}MB`
        };
    }
    
    return { valido: true, mensaje: '' };
}

/**
 * Valida la extensión de un archivo
 * @param {File} archivo - Archivo a validar
 * @param {string[]} extensionesPermitidas - Extensiones permitidas (ej: ['.csv', '.txt'])
 * @returns {Object} {valido, mensaje}
 */
export function validarExtensionArchivo(archivo, extensionesPermitidas) {
    if (!archivo) {
        return { valido: false, mensaje: 'No se proporcionó archivo' };
    }
    
    const nombreLower = archivo.name.toLowerCase();
    const extensionValida = extensionesPermitidas.some(ext => 
        nombreLower.endsWith(ext.toLowerCase())
    );
    
    if (!extensionValida) {
        return {
            valido: false,
            mensaje: `Extensión no permitida. Extensiones válidas: ${extensionesPermitidas.join(', ')}`
        };
    }
    
    return { valido: true, mensaje: '' };
}

/**
 * Crea un input de archivo programáticamente y dispara la selección
 * @param {Object} opciones - Opciones del input
 * @param {string} [opciones.accept] - Tipos de archivo aceptados
 * @param {boolean} [opciones.multiple=false] - Permitir múltiples archivos
 * @returns {Promise<File[]>} Archivos seleccionados
 */
export function seleccionarArchivos(opciones = {}) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        
        if (opciones.accept) {
            input.accept = opciones.accept;
        }
        
        if (opciones.multiple) {
            input.multiple = true;
        }
        
        input.addEventListener('change', () => {
            const archivos = Array.from(input.files || []);
            document.body.removeChild(input);
            resolve(archivos);
        });
        
        input.addEventListener('cancel', () => {
            document.body.removeChild(input);
            resolve([]);
        });
        
        document.body.appendChild(input);
        input.click();
    });
}

/**
 * Lee múltiples archivos de texto
 * @param {File[]} archivos - Array de archivos
 * @returns {Promise<ResultadoCarga[]>} Resultados de lectura
 */
export async function leerMultiplesArchivos(archivos) {
    const promesas = archivos.map(archivo => leerArchivoTexto(archivo));
    return Promise.all(promesas);
}

/**
 * Formatea un tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado (ej: "1.5 MB")
 */
export function formatearTamanoArchivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const unidades = ['Bytes', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + unidades[i];
}

export default {
    leerArchivoTexto,
    cargarArchivoCSV,
    descargarArchivo,
    descargarCSV,
    descargarTexto,
    descargarJSON,
    validarTamanoArchivo,
    validarExtensionArchivo,
    seleccionarArchivos,
    leerMultiplesArchivos,
    formatearTamanoArchivo
};
