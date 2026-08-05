// Interactive Mindmap with Pan, Zoom, and Detail Panels
var mmState = {};

function initMindmap(id) {
    var container = document.getElementById('mm-' + id);
    if (!container) return;
    var svg = container.querySelector('svg');
    if (!svg) return;
    mmState[id] = { zoom: 1, panX: 0, panY: 0, dragging: false, startX: 0, startY: 0 };
    var st = mmState[id];
    // Mouse wheel zoom
    svg.addEventListener('wheel', function(e) {
        e.preventDefault();
        var delta = e.deltaY > 0 ? -0.1 : 0.1;
        st.zoom = Math.max(0.3, Math.min(4, st.zoom + delta));
        updateTransform(id);
    });
    // Pan with mouse drag
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
        if (svg) svg.style.cursor = 'grab';
    });
    svg.style.cursor = 'grab';
    // Node click for details
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
                    var data = JSON.parse(info);
                    detail.innerHTML = '<h4 style="color:#9d7cbf;margin-bottom:8px;">' + data.title + '</h4><p style="color:#525252;font-size:0.95rem;line-height:1.6;">' + data.desc + '</p>';
                    detail.style.display = 'block';
                } catch(e) {}
            }
        });
    });
    updateTransform(id);
}

function updateTransform(id) {
    var st = mmState[id];
    var container = document.getElementById('mm-' + id);
    if (!container) return;
    var g = container.querySelector('g');
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
    var detail = document.getElementById('mm-detail-' + id);
    if (detail) detail.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[id^="mm-"]').forEach(function(el) {
        if (el.id.startsWith('mm-detail')) return;
        var id = el.id.replace('mm-', '');
        initMindmap(id);
    });
});
