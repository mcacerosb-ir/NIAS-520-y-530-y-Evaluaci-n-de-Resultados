// ===== AUDIO FUNCTIONS =====
var synth = window.speechSynthesis;
var currentUtterance = null;

function speak(textId) {
    var textEl = document.getElementById(textId);
    if (!textEl) { alert('No se encontro el texto para reproducir'); return; }
    var text = textEl.textContent || textEl.innerText;
    if (!text || text.trim() === '') { alert('El texto esta vacio'); return; }
    if (synth.speaking) { synth.cancel(); }
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'es-ES';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    var statusEl = document.getElementById('audio-status');
    var progressEl = document.getElementById('audio-progress');
    if (statusEl) statusEl.textContent = 'Reproduciendo...';
    currentUtterance.onend = function() {
        if (statusEl) statusEl.textContent = 'Audio finalizado';
        if (progressEl) progressEl.style.width = '100%';
    };
    currentUtterance.onboundary = function(event) {
        if (progressEl && text.length > 0) {
            var pct = Math.round((event.charIndex / text.length) * 100);
            progressEl.style.width = pct + '%';
        }
    };
    synth.speak(currentUtterance);
}

function stopSpeech() {
    if (synth.speaking) synth.cancel();
    var s = document.getElementById('audio-status');
    var p = document.getElementById('audio-progress');
    if (s) s.textContent = 'Detenido';
    if (p) p.style.width = '0%';
}

// ===== MINDMAP FUNCTIONS =====
var mmState = {};

function initMindmap(id) {
    var c = document.getElementById('mm-' + id);
    if (!c) return;
    var svg = c.querySelector('svg');
    if (!svg) return;
    mmState[id] = { zoom: 1, panX: 0, panY: 0, dragging: false, startX: 0, startY: 0 };
    var st = mmState[id];

    svg.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        st.zoom = Math.max(0.3, Math.min(4, st.zoom + delta));
        updateTransform(id);
    });

    svg.addEventListener('mousedown', function(e) {
        st.dragging = true;
        st.startX = e.clientX - st.panX;
        st.startY = e.clientY - st.panY;
        svg.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
        if (!st.dragging) return;
        st.panX = e.clientX - st.startX;
        st.panY = e.clientY - st.startY;
        updateTransform(id);
    });

    document.addEventListener('mouseup', function() {
        st.dragging = false;
        svg.style.cursor = 'grab';
    });

    svg.style.cursor = 'grab';

    svg.querySelectorAll('.mm-node').forEach(function(node) {
        node.style.cursor = 'pointer';
        node.addEventListener('click', function(e) {
            e.stopPropagation();
            svg.querySelectorAll('.mm-node').forEach(function(n) { n.classList.remove('active'); });
            node.classList.add('active');
            var info = node.getAttribute('data-info');
            var detail = document.getElementById('mm-detail-' + id);
            if (detail && info) {
                try {
                    var d = JSON.parse(info);
                    detail.innerHTML = '<h4 style="color:#9d7cbf;margin-bottom:8px;">' + d.title + '</h4><p style="color:#525252;font-size:0.95rem;line-height:1.6;">' + d.desc + '</p>';
                    detail.style.display = 'block';
                } catch(ex) {}
            }
        });
    });

    updateTransform(id);
}

function updateTransform(id) {
    var st = mmState[id];
    var c = document.getElementById('mm-' + id);
    if (!c) return;
    var g = c.querySelector('g');
    if (g) {
        g.setAttribute('transform', 'translate(' + st.panX + ',' + st.panY + ') scale(' + st.zoom + ')');
    }
}

function mmZoom(id, delta) {
    if (!mmState[id]) mmState[id] = { zoom: 1, panX: 0, panY: 0 };
    mmState[id].zoom = Math.max(0.3, Math.min(4, mmState[id].zoom + delta));
    updateTransform(id);
}

function mmReset(id) {
    if (!mmState[id]) mmState[id] = { zoom: 1, panX: 0, panY: 0 };
    mmState[id].zoom = 1;
    mmState[id].panX = 0;
    mmState[id].panY = 0;
    updateTransform(id);
    var d = document.getElementById('mm-detail-' + id);
    if (d) d.style.display = 'none';
}

// ===== QUIZ FUNCTIONS =====
var qs = {
    '520': [
        { q: '¿Cuál es el objetivo principal de los procedimientos analíticos según la NIA 520?', o: ['Reemplazar las pruebas de detalle', 'Obtener evidencia de auditoría relevante y confiable', 'Reducir el alcance de la auditoría', 'Eliminar la necesidad de pruebas sustantivas'], a: 1 },
        { q: '¿En qué momentos se aplican procedimientos analíticos según la NIA 520?', o: ['Solo en la planeación', 'Solo en la ejecución', 'En la planeación, ejecución y finalización', 'Solo en la finalización'], a: 2 },
        { q: '¿Qué son los procedimientos analíticos?', o: ['Pruebas de controles internos', 'Evaluaciones de información financiera mediante análisis de relaciones plausibles', 'Cálculos estadísticos complejos', 'Entrevistas con la dirección'], a: 1 },
        { q: '¿Qué tipo de datos se utilizan en los procedimientos analíticos?', o: ['Solo datos financieros', 'Solo datos no financieros', 'Datos financieros y no financieros', 'Solo datos históricos'], a: 2 },
        { q: '¿Qué debe investigar el auditor ante fluctuaciones significativas?', o: ['Solo el monto', 'La naturaleza, causa y consistencia con otra información', 'Nada, son normales', 'Solo comparar con el año anterior'], a: 1 },
        { q: '¿En qué fase se usan los procedimientos analíticos para identificar áreas de riesgo?', o: ['Finalización', 'Planeación (evaluación de riesgo)', 'Ejecución', 'Reporte'], a: 1 },
        { q: '¿Qué busca confirmar el auditor en la finalización de la auditoría?', o: ['Que no hay errores', 'Que los estados financieros guardan coherencia lógica', 'Que la empresa tiene ganancias', 'Que se cumplen todas las normas'], a: 1 },
        { q: '¿Cuál es un ejemplo de procedimiento analítico sustantivo?', o: ['Observar el conteo de inventario', 'Multiplicar unidades vendidas por el precio promedio', 'Solicitar confirmaciones de saldos', 'Revisar políticas contables'], a: 1 },
        { q: '¿De qué depende la fiabilidad de los datos utilizados en un procedimiento analítico?', o: ['Del tamaño de la empresa', 'De su fuente, disponibilidad y relevancia', 'Del número de empleados', 'Del año fiscal'], a: 1 },
        { q: '¿Qué deben considerar los procedimientos analíticos sustantivos según la NIA 520?', o: ['Solo el costo del procedimiento', 'El carácter apropiado, la fiabilidad de los datos y el desarrollo de expectativas', 'Solo la opinión de la dirección', 'El tamaño de la muestra únicamente'], a: 1 }
    ],
    '530': [
        { q: '¿Qué es el muestreo de auditoría?', o: ['Probar el 100% de los elementos', 'Aplicar procedimientos a menos del 100% de una población relevante', 'Seleccionar solo los elementos más importantes', 'Un método estadístico obligatorio'], a: 1 },
        { q: '¿Qué debe evaluar el auditor según el párrafo 15 de la NIA 530?', o: ['Solo el tamaño de la muestra', 'Los resultados de la muestra y si proporcionan una base razonable', 'Solo las incorrecciones', 'La opinión del cliente'], a: 1 },
        { q: '¿Qué debe hacer el auditor con las desviaciones detectadas en pruebas de control?', o: ['Ignorarlas si son pequeñas', 'Investigar su naturaleza y causa', 'Cerrar la auditoría', 'Eliminar la muestra'], a: 1 },
        { q: '¿Qué es una anomalía en el muestreo de auditoría?', o: ['Un error sistemático', 'Un hecho aislado no representativo de la población', 'Un error que siempre ocurre', 'Una mejora en los controles'], a: 1 },
        { q: '¿Qué debe hacer el auditor con las incorrecciones encontradas en pruebas de detalle?', o: ['Reportarlas sin más análisis', 'Extrapolarlas a toda la población', 'Ignorarlas si son pequeñas', 'Solo documentarlas'], a: 1 },
        { q: '¿Con qué debe compararse la incorrección extrapolada?', o: ['Con el presupuesto de la empresa', 'Con la incorrección tolerable del diseño', 'Con los resultados del año anterior', 'Con la opinión del director'], a: 1 },
        { q: '¿Qué sucede si los errores encontrados superan la incorrección tolerable?', o: ['Se aprueba la auditoría sin cambios', 'Se deben solicitar ajustes o modificar los procedimientos', 'No hay ningún problema', 'Se cierra el caso'], a: 1 },
        { q: '¿Cuáles son ejemplos de acciones correctivas ante errores significativos?', o: ['Solo modificar la opinión de auditoría', 'Solicitar ajustes o modificar la naturaleza, momento y extensión de los procedimientos', 'No hacer nada', 'Eliminar la muestra'], a: 1 },
        { q: '¿Qué tipo de muestreo permite aplicar la NIA 530?', o: ['Solo estadístico', 'Solo no estadístico', 'Estadístico o no estadístico', 'Ninguno'], a: 2 },
        { q: '¿Cuál es la primera etapa del proceso de muestreo?', o: ['Extrapolar los errores', 'Diseñar y seleccionar la muestra', 'Cerrar la auditoría', 'Solicitar ajustes'], a: 1 }
    ]
};

function renderQuiz(n) {
    var c = document.getElementById('quiz-' + n);
    if (!c) return;
    var q = qs[n];
    if (!q) return;
    var h = '';
    q.forEach(function(d, i) {
        h += '<div class="quiz-question" style="margin-bottom:24px;">';
        h += '<p class="question-text"><strong>Pregunta ' + (i + 1) + ':</strong> ' + d.q + '</p>';
        h += '<div class="quiz-options">';
        d.o.forEach(function(o, j) {
            h += '<label class="quiz-option" style="display:block;padding:12px 16px;margin:6px 0;background:#fff;border:2px solid #e5e5e5;border-radius:10px;cursor:pointer;transition:all 0.2s;">';
            h += '<input type="radio" name="q' + n + '_' + i + '" value="' + j + '" style="margin-right:10px;"> ' + o;
            h += '</label>';
        });
        h += '</div></div>';
    });
    h += '<button onclick="checkQuiz(\'' + n + '\')" style="background:#9d7cbf;color:#fff;padding:14px 32px;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:16px;">Verificar Respuestas</button>';
    h += '<div id="result-' + n + '" style="margin-top:20px;padding:16px;border-radius:10px;font-weight:600;display:none;"></div>';
    c.innerHTML = h;
}

function checkQuiz(n) {
    var q = qs[n];
    var c = 0;
    q.forEach(function(d, i) {
        var s = document.querySelector('input[name="q' + n + '_' + i + '"]:checked');
        if (s && parseInt(s.value) === d.a) c++;
        document.querySelectorAll('input[name="q' + n + '_' + i + '"]').forEach(function(inp) {
            var l = inp.parentElement;
            if (parseInt(inp.value) === d.a) {
                l.style.borderColor = '#10b981';
                l.style.background = '#ecfdf5';
            }
            if (inp.checked && parseInt(inp.value) !== d.a) {
                l.style.borderColor = '#ef4444';
                l.style.background = '#fef2f2';
            }
            inp.disabled = true;
        });
    });
    var p = Math.round(c / q.length * 100);
    var r = document.getElementById('result-' + n);
    r.style.display = 'block';
    if (p >= 70) {
        r.style.background = '#ecfdf5';
        r.style.color = '#065f46';
        r.innerHTML = 'Felicidades! Obtuviste ' + c + '/' + q.length + ' (' + p + '%) - Aprobado!';
    } else {
        r.style.background = '#fef2f2';
        r.style.color = '#991b1b';
        r.innerHTML = 'Obtuviste ' + c + '/' + q.length + ' (' + p + '%) - Necesitas al menos 70%.';
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[id^="mm-"]').forEach(function(el) {
        if (el.id.indexOf('mm-detail') === 0) return;
        var id = el.id.replace('mm-', '');
        initMindmap(id);
    });
    if (document.getElementById('quiz-520')) renderQuiz('520');
    if (document.getElementById('quiz-530')) renderQuiz('530');
    if (document.getElementById('quiz-tema')) renderQuiz('tema');
});
