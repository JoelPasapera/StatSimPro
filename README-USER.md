# 📊 StatSim Pro - Manual de Usuario

> Simulador y Analizador Estadístico para Investigación Académica

---

## 🎯 ¿Qué es StatSim Pro?

**StatSim Pro** es una aplicación web gratuita que te ayuda a:

1. **Generar datos simulados** para pruebas psicométricas
2. **Analizar correlaciones** entre variables
3. **Obtener interpretaciones automáticas** en formato APA
4. **Descargar reportes** profesionales

Ideal para estudiantes, investigadores y profesionales que necesitan practicar análisis estadísticos o generar datos de ejemplo.

---

## 🚀 Cómo Empezar

### Paso 1: Abrir la Aplicación

1. Descarga la carpeta del proyecto
2. Abre el archivo `index.html` con un servidor local (ver instrucciones abajo)
3. ¡Listo! La aplicación se abrirá en tu navegador

> ⚠️ **Importante**: No abras el archivo directamente haciendo doble clic. Necesitas un servidor local.

#### Opciones para abrir con servidor local:

**Opción A - VS Code (más fácil):**
1. Instala la extensión "Live Server"
2. Clic derecho en `index.html` → "Open with Live Server"

**Opción B - Python:**
```bash
# En la carpeta del proyecto
python -m http.server 8000
# Abre en navegador: http://localhost:8000
```

**Opción C - Subir a internet:**
- Sube la carpeta a [Netlify](https://netlify.com) (gratis, solo arrastra la carpeta)

---

## 📖 Guía de Uso

### Sección 1: Simulador (Generador de Datos)

El simulador te permite crear bases de datos con valores estadísticamente controlados.

#### Paso a Paso:

1. **Configura el tamaño de muestra**
   - Ingresa cuántos participantes quieres simular (ej: 100)
   - Mínimo: 10, Máximo: 10,000

2. **Agrega pruebas psicométricas**
   
   Haz clic en "➕ Agregar Prueba" y completa:
   
   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | Nombre | Nombre de la prueba | "Escala de Ansiedad" |
   | N° Ítems | Cantidad de preguntas | 20 |
   | Media (μ) | Promedio esperado | 50 |
   | Desv. Est. (σ) | Dispersión | 10 |
   | Mínimo | Valor mínimo posible | 20 |
   | Máximo | Valor máximo posible | 100 |

3. **Agrega variables sociodemográficas** (opcional)
   
   Haz clic en "➕ Agregar Variable":
   
   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | Categoría | Nombre de la variable | "Edad" |
   | Promedio | Valor promedio | 25 |
   | Desv. Est. | Dispersión | 5 |
   | Mínimo | Valor mínimo | 18 |
   | Máximo | Valor máximo | 65 |
   | Decimales | Precisión decimal | 0 |

4. **Genera los datos**
   - Haz clic en "🎲 Generar Base de Datos"
   - Verás una vista previa de los datos generados

5. **Descarga el CSV**
   - Haz clic en "💾 Descargar CSV"
   - El archivo se guardará en tu computadora

#### 💡 Tips del Simulador:

- Puedes **importar/exportar configuraciones** para reutilizarlas
- Los datos siguen una **distribución normal** truncada
- La columna "ID" se genera automáticamente

---

### Sección 2: Analizador (Correlaciones)

El analizador te permite estudiar la relación entre dos variables numéricas.

#### Paso a Paso:

1. **Carga tu archivo CSV**
   - Arrastra el archivo a la zona de carga, o
   - Haz clic en "Seleccionar archivo"
   - El CSV debe tener encabezados en la primera fila

2. **Selecciona las variables**
   - Variable 1: Primera variable a correlacionar
   - Variable 2: Segunda variable a correlacionar
   
   > Solo aparecen columnas con datos numéricos

3. **Completa el contexto** (opcional pero recomendado)
   - **Unidad de análisis**: ¿Quiénes son los participantes? 
     - Ej: "estudiantes universitarios"
   - **Lugar/Contexto**: ¿Dónde se realizó el estudio?
     - Ej: "una universidad privada de Lima"

4. **Ejecuta el análisis**
   - Haz clic en "📊 Ejecutar Análisis"
   - Espera unos segundos mientras se procesan los datos

5. **Revisa los resultados**

   El reporte incluye:
   
   - **Marco Metodológico**: Pregunta, objetivo e hipótesis generados
   - **Pruebas de Normalidad**: Determina qué tipo de correlación usar
   - **Análisis de Correlación**: Coeficiente, p-valor e interpretación
   - **Gráfico de Dispersión**: Visualización con línea de tendencia
   - **Decisión Estadística**: Si se rechaza o no la hipótesis nula
   - **Discusión**: Plantilla editable para tu informe

6. **Descarga el reporte**
   - Haz clic en "📥 Descargar Reporte"
   - Se genera un PDF profesional (o texto si no hay internet)

---

## 📊 Entendiendo los Resultados

### Pruebas de Normalidad

| Si n < 50 | Si n ≥ 50 |
|-----------|-----------|
| Shapiro-Wilk | Kolmogorov-Smirnov |

- **p > 0.05**: Los datos son normales → se usa **Pearson**
- **p ≤ 0.05**: Los datos NO son normales → se usa **Spearman**

### Interpretación del Coeficiente de Correlación

| Valor de r | Interpretación |
|------------|----------------|
| 0.00 - 0.10 | Nula o muy baja |
| 0.10 - 0.30 | Baja |
| 0.30 - 0.50 | Moderada |
| 0.50 - 0.70 | Alta |
| 0.70 - 1.00 | Muy alta |

- **r positivo (+)**: Cuando una variable sube, la otra también
- **r negativo (-)**: Cuando una variable sube, la otra baja

### Decisión Estadística

| p-valor | Decisión |
|---------|----------|
| p < 0.05 | Se RECHAZA H₀ → La correlación ES significativa |
| p ≥ 0.05 | NO se rechaza H₀ → La correlación NO es significativa |

---

## ❓ Preguntas Frecuentes

### ¿Qué formato debe tener mi CSV?

```csv
ID,Variable1,Variable2,Edad
1,45,78,22
2,67,89,25
3,34,56,21
```

- Primera fila: nombres de columnas
- Separador: coma (,)
- Decimales: punto (.)

### ¿Por qué no puedo abrir la aplicación?

Si ves errores al abrir `index.html`:
1. No lo abras haciendo doble clic
2. Usa un servidor local (ver instrucciones arriba)
3. Verifica que todos los archivos estén en su lugar

### ¿Puedo usar mis propios datos?

¡Sí! Solo necesitas un archivo CSV con:
- Encabezados en la primera fila
- Al menos dos columnas numéricas
- Sin celdas vacías en las columnas a analizar

### ¿Los datos se suben a algún servidor?

**No.** Todo el procesamiento ocurre en tu navegador. Tus datos nunca salen de tu computadora.

### ¿Puedo citar esta herramienta?

Sí. Formato sugerido:

> Pasapera, J. (2024). StatSim Pro: Simulador y analizador estadístico [Software]. 

### ¿Cómo reporto un error?

Contacta al desarrollador o abre un issue en el repositorio si está disponible en GitHub.

---

## 🎓 Para Estudiantes

### Usos Recomendados

1. **Practicar análisis estadísticos** sin datos reales
2. **Entender correlaciones** con datos controlados
3. **Generar ejemplos** para presentaciones
4. **Verificar cálculos** hechos a mano

### Advertencias

- Los datos simulados son **ficticios**, no deben usarse como datos reales en investigaciones
- Las interpretaciones son **automáticas** y deben revisarse
- Siempre consulta con tu asesor para decisiones metodológicas

---

## 🔧 Solución de Problemas

| Problema | Solución |
|----------|----------|
| La página está en blanco | Usa un servidor local, no abras directamente |
| No carga mi CSV | Verifica el formato (comas, encabezados) |
| Los gráficos no aparecen | Refresca la página (F5) |
| El PDF no descarga | Verifica tu conexión a internet |
| Variables no aparecen en el selector | Solo se muestran columnas numéricas |

---

## 📱 Compatibilidad

| Navegador | Soportado |
|-----------|-----------|
| Chrome | ✅ Sí |
| Firefox | ✅ Sí |
| Safari | ✅ Sí |
| Edge | ✅ Sí |
| Internet Explorer | ❌ No |

La aplicación también funciona en **tablets** y **celulares**, aunque se recomienda usar una pantalla grande para mejor experiencia.

---

## 📚 Referencias Metodológicas

La aplicación se basa en:

- **Cohen, J. (2013)**. Statistical Power Analysis for the Behavioral Sciences. Routledge.
- **Hernández-Sampieri, R., & Mendoza, C. (2023)**. Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta.

Los umbrales de interpretación siguen los criterios de Cohen para ciencias del comportamiento.

---

## 💡 Tips Finales

1. **Guarda tus configuraciones**: Usa los botones de exportar para reutilizar
2. **Revisa siempre los resultados**: Las interpretaciones automáticas son guías, no verdades absolutas
3. **Usa tamaños de muestra realistas**: n > 30 para mejor precisión
4. **Documenta tu trabajo**: Descarga los reportes para tus registros

---

**¡Gracias por usar StatSim Pro!** 🎉

Si esta herramienta te fue útil, considera compartirla con tus compañeros.

---

*Desarrollado por Joel Pasapera | Versión 1.0*
