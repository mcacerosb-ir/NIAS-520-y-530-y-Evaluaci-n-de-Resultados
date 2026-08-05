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
        { q: 'Objetivo principal de NIA 520?', o: ['Reemplazar pruebas de detalle', 'Obtener evidencia relevante y confiable', 'Reducir alcance', 'Eliminar pruebas sustantivas'], a: 1 },
        { q: 'Momentos para aplicar procedimientos analiticos?', o: ['Solo planeacion', 'Solo ejecucion', 'Planeacion, ejecucion y finalizacion', 'Solo finalizacion'], a: 2 },
        { q: 'Que son los procedimientos analiticos?', o: ['Pruebas de controles', 'Evaluaciones mediante analisis de relaciones plausibles', 'Calculos estadisticos', 'Entrevistas'], a: 1 },
        { q: 'Que tipo de datos se usan?', o: ['Solo financieros', 'Solo no financieros', 'Financieros y no financieros', 'Solo historicos'], a: 2 },
        { q: 'Que debe investigar el auditor?', o: ['Solo el monto', 'Naturaleza, causa e inconsistencias', 'Nada', 'Solo comparar'], a: 1 }
    ],
    '530': [
        { q: 'Que es el muestreo de auditoria?', o: ['Probar 100%', 'Aplicar procedimientos a <100% de poblacion', 'Seleccionar importantes', 'Metodo obligatorio'], a: 1 },
        { q: 'Que evalua el auditor segun parrafo 15?', o: ['Solo tamano', 'Resultados y base razonable', 'Solo incorrecciones', 'Opinion del cliente'], a: 1 },
        { q: 'Que hacer con desviaciones?', o: ['Ignorar', 'Investigar naturaleza y causa', 'Cerrar auditoria', 'Eliminar muestra'], a: 1 },
        { q: 'Que es una anomalia?', o: ['Error sistematico', 'Hecho aislado no representativo', 'Error siempre ocurre', 'Mejora'], a: 1 },
        { q: 'Con que comparar incorrecciones extrapoladas?', o: ['Presupuesto', 'Incorreccion tolerable', 'Ano anterior', 'Director'], a: 1 }
    ],
    'tema': [
        { q: 'Objetivo de evaluacion de resultados?', o: ['Reducir tiempo', 'Determinar base razonable para conclusion', 'Eliminar muestras', 'Aprobar automaticamente'], a: 1 },
        { q: 'Que hacer primero al encontrar incorrecciones?', o: ['Extrapolar', 'Investigar naturaleza y causa', 'Cerrar auditoria', 'Solicitar ajustes'], a: 1 },
        { q: 'Que pasa si errores superan tolerable?', o: ['Se aprueba', 'Tomar acciones correctivas', 'No hay problema', 'Se cierra'], a: 1 }
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