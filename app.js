// app.js
// Aquí irá la lógica de la aplicación de gestión de proyectos Access Park 

document.addEventListener('DOMContentLoaded', () => {
    // Elementos principales
    const btnNuevoProyecto = document.getElementById('nuevoProyecto');
    const modalProyecto = document.getElementById('modalProyecto');
    const cerrarModal = document.getElementById('cerrarModal');
    const formProyecto = document.getElementById('formProyecto');
    const proyectosContainer = document.getElementById('proyectosContainer');

    // Mostrar modal
    btnNuevoProyecto.addEventListener('click', () => {
        modalProyecto.classList.remove('oculto');
        modalProyecto.style.display = 'flex';
        formProyecto.reset();
    });

    // Cerrar modal
    cerrarModal.addEventListener('click', () => {
        modalProyecto.classList.add('oculto');
        modalProyecto.style.display = 'none';
    });

    // --- GESTIÓN DE PROYECTOS EN LOCALSTORAGE Y FOTOS ---
    let proyectos = JSON.parse(localStorage.getItem('proyectosAccessPark') || '[]');
    let proyectosFinalizados = JSON.parse(localStorage.getItem('proyectosFinalizadosAccessPark') || '[]');

    function guardarProyectos() {
        localStorage.setItem('proyectosAccessPark', JSON.stringify(proyectos));
    }

    function guardarFinalizados() {
        localStorage.setItem('proyectosFinalizadosAccessPark', JSON.stringify(proyectosFinalizados));
    }

    function renderizarProyectos() {
        proyectosContainer.innerHTML = '';
        // --- ACTUALIZAR CONTADORES ---
        const total = proyectos.length;
        let enEjecucion = 0, completados = 0, atrasados = 0;
        const hoy = new Date();
        proyectos.forEach(proy => {
            // Calcular progreso total
            let suma = 0, totalItems = 0;
            proy.categorias.forEach(cat => {
                cat.items.forEach(item => {
                    suma += Number(item.porcentaje);
                    totalItems++;
                });
            });
            const porcentaje = totalItems ? Math.round((suma / (totalItems * 100)) * 100) : 0;
            const fechaEntrega = new Date(proy.fechaEntrega);
            if (porcentaje === 100) {
                completados++;
            } else if (fechaEntrega < hoy) {
                atrasados++;
            } else {
                enEjecucion++;
            }
        });
        document.getElementById('totalProyectos').textContent = total;
        document.getElementById('enEjecucion').textContent = enEjecucion;
        document.getElementById('completados').textContent = completados;
        document.getElementById('atrasados').textContent = atrasados;
        document.getElementById('finalizados').textContent = proyectosFinalizados.length;
        // --- FIN CONTADORES ---
        proyectos.forEach((proy, idx) => {
            const card = document.createElement('div');
            card.className = 'proyecto-card';

            // ALERTAS DE ENTREGA
            let alerta = '';
            const fechaEntrega = new Date(proy.fechaEntrega);
            const diffDias = Math.ceil((fechaEntrega - hoy) / (1000 * 60 * 60 * 24));
            if (diffDias < 0) {
                alerta = `<div class='alerta alerta-roja'>¡Proyecto vencido hace ${-diffDias} días!</div>`;
            } else if (diffDias <= 7) {
                alerta = `<div class='alerta alerta-amarilla'>¡Entrega en ${diffDias} días!</div>`;
            }

            // Renderizar categorías e ítems
            let htmlCategorias = '';
            proy.categorias.forEach((cat, idxCat) => {
                htmlCategorias += `<div class=\"categoria categoria-acordeon\">
                    <div class=\"acordeon-header\" data-cat="${idxCat}">${cat.nombre} <span class='acordeon-icon'>▼</span></div>
                    <div class=\"acordeon-body\" style=\"display:none\"><ul>`;
                cat.items.forEach((item, idxItem) => {
                    htmlCategorias += `
                        <li>
                            <span>${item.nombre}</span>
                            <input type=\"number\" min=\"0\" max=\"100\" value=\"${item.porcentaje}\" data-cat=\"${idxCat}\" data-item=\"${idxItem}\" class=\"input-porcentaje\" style=\"width:60px;\"> %
                            <input type=\"text\" placeholder=\"Nota\" data-cat=\"${idxCat}\" data-item=\"${idxItem}\" class=\"input-nota\" style=\"width:120px;\" value=\"${item.nota || ''}\">
                        </li>`;
                });
                htmlCategorias += '</ul></div></div>';
            });

            // Fotos
            let fotosHtml = '';
            ['fotoProyecto','fotoProceso','fotoActa'].forEach(tipo => {
                if (proy[tipo]) {
                    fotosHtml += `<div class=\"foto-miniatura\">
                        <img src=\"${proy[tipo]}\" alt=\"${tipo}\" />
                        <button class=\"eliminar-foto\" data-tipo=\"${tipo}\" data-idx=\"${idx}\">✖</button>
                    </div>`;
                }
            });

            // Botones editar/eliminar y subir fotos
            let botones = `<div class='acciones-proyecto'>
                <button class='btn-editar' data-idx='${idx}'>Editar</button>
                <button class='btn-eliminar' data-idx='${idx}'>Eliminar</button>
                <label class='btn-foto'>📷 Proyecto <input type='file' class='input-foto' data-tipo='fotoProyecto' data-idx='${idx}' accept='image/*' hidden></label>
                <label class='btn-foto'>📷 Proceso <input type='file' class='input-foto' data-tipo='fotoProceso' data-idx='${idx}' accept='image/*' hidden></label>
                <label class='btn-foto'>📷 Acta <input type='file' class='input-foto' data-tipo='fotoActa' data-idx='${idx}' accept='image/*' hidden></label>
            </div>`;

            card.innerHTML = `
                ${alerta}
                <h3>${proy.nombre}</h3>
                <p><b>Responsable:</b> ${proy.responsable}</p>
                <p><b>Ejecutor:</b> ${proy.ejecutor}</p>
                <p><b>Vendedor:</b> ${proy.vendedor}</p>
                <p><b>Fecha de Inicio:</b> ${proy.fechaInicio}</p>
                <p><b>Fecha de Entrega:</b> ${proy.fechaEntrega}</p>
                <p><b>Descripción:</b> ${proy.descripcion}</p>
                <p><b>Nota:</b> ${proy.nota}</p>
                <p><b>Última modificación:</b> ${proy.modificadoPor ? proy.modificadoPor : ''} ${proy.fechaModificacion ? ('el ' + proy.fechaModificacion) : ''}</p>
                <div class=\"fotos-proyecto\">${fotosHtml}</div>
                <div class=\"progreso-total\">
                    <div class=\"donut\">
                        <svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">
                            <circle class=\"donut-bg\" cx=\"40\" cy=\"40\" r=\"35\" stroke-width=\"10\" fill=\"none\" />
                            <circle class=\"donut-bar\" cx=\"40\" cy=\"40\" r=\"35\" stroke-width=\"10\" fill=\"none\" stroke-dasharray=\"220\" stroke-dashoffset=\"220\" />
                        </svg>
                        <span class=\"porcentaje-total\">0%</span>
                    </div>
                </div>
                <div class=\"categorias\">${htmlCategorias}</div>
                ${botones}
            `;
            proyectosContainer.appendChild(card);

            // Actualizar progreso y gráfico
            function actualizarProgreso() {
                let suma = 0;
                let total = 0;
                card.querySelectorAll('.input-porcentaje').forEach(input => {
                    suma += Number(input.value);
                    total++;
                });
                const porcentaje = total ? Math.round((suma / (total * 100)) * 100) : 0;
                card.querySelector('.porcentaje-total').textContent = porcentaje + '%';
                // Actualizar gráfico donut
                const donutBar = card.querySelector('.donut-bar');
                const circ = 2 * Math.PI * 35;
                const offset = circ - (circ * porcentaje / 100);
                donutBar.setAttribute('stroke-dasharray', circ);
                donutBar.setAttribute('stroke-dashoffset', offset);
            }
            card.querySelectorAll('.input-porcentaje').forEach(input => {
                input.addEventListener('input', e => {
                    const cat = input.getAttribute('data-cat');
                    const item = input.getAttribute('data-item');
                    proy.categorias[cat].items[item].porcentaje = Number(input.value);
                    guardarProyectos();
                    actualizarProgreso();
                });
            });
            card.querySelectorAll('.input-nota').forEach(input => {
                input.addEventListener('input', e => {
                    const cat = input.getAttribute('data-cat');
                    const item = input.getAttribute('data-item');
                    proy.categorias[cat].items[item].nota = input.value;
                    guardarProyectos();
                });
            });
            actualizarProgreso();

            // Eliminar foto
            card.querySelectorAll('.eliminar-foto').forEach(btn => {
                btn.addEventListener('click', e => {
                    const tipo = btn.getAttribute('data-tipo');
                    const idxP = btn.getAttribute('data-idx');
                    proyectos[idxP][tipo] = '';
                    guardarProyectos();
                    renderizarProyectos();
                });
            });

            // Eliminar proyecto
            card.querySelector('.btn-eliminar').addEventListener('click', () => {
                if (confirm('¿Seguro que deseas eliminar este proyecto?')) {
                    proyectos.splice(idx, 1);
                    guardarProyectos();
                    renderizarProyectos();
                }
            });

            // Editar proyecto
            card.querySelector('.btn-editar').addEventListener('click', () => {
                // Cargar datos en el formulario
                document.getElementById('nombreProyecto').value = proy.nombre;
                document.getElementById('responsableProyecto').value = proy.responsable;
                document.getElementById('ejecutorProyecto').value = proy.ejecutor;
                document.getElementById('vendedorProyecto').value = proy.vendedor;
                document.getElementById('fechaInicio').value = proy.fechaInicio;
                document.getElementById('fechaEntrega').value = proy.fechaEntrega;
                document.getElementById('descripcionProyecto').value = proy.descripcion;
                document.getElementById('notaProyecto').value = proy.nota;
                document.getElementById('modificadoPor').value = proy.modificadoPor || '';
                // No se cargan fotos por seguridad/navegador
                // Guardar índice de edición
                formProyecto.setAttribute('data-edit', idx);
                document.getElementById('tituloModal').textContent = 'Editar Proyecto';
                modalProyecto.classList.remove('oculto');
                modalProyecto.style.display = 'flex';
            });

            // Subida de fotos desde la tarjeta
            card.querySelectorAll('.input-foto').forEach(input => {
                input.addEventListener('change', async (e) => {
                    const tipo = input.getAttribute('data-tipo');
                    const idxP = input.getAttribute('data-idx');
                    const file = input.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = evt => {
                        proyectos[idxP][tipo] = evt.target.result;
                        guardarProyectos();
                        renderizarProyectos();
                    };
                    reader.readAsDataURL(file);
                });
            });

            // Lógica acordeón para todas las categorías
            card.querySelectorAll('.acordeon-header').forEach(header => {
                header.addEventListener('click', () => {
                    const body = header.nextElementSibling;
                    if (body.style.display === 'none') {
                        body.style.display = 'block';
                        header.querySelector('.acordeon-icon').textContent = '▲';
                    } else {
                        body.style.display = 'none';
                        header.querySelector('.acordeon-icon').textContent = '▼';
                    }
                });
            });
        });
        detectarFinalizados();
    }

    // Mostrar/ocultar proyectos finalizados
    const btnVerFinalizados = document.getElementById('verFinalizados');
    const finalizadosContainer = document.getElementById('finalizadosContainer');
    btnVerFinalizados.addEventListener('click', () => {
        if (finalizadosContainer.style.display === 'none') {
            finalizadosContainer.style.display = 'flex';
            proyectosContainer.style.display = 'none';
            renderizarFinalizados();
            btnVerFinalizados.textContent = 'Ver Proyectos Activos';
        } else {
            finalizadosContainer.style.display = 'none';
            proyectosContainer.style.display = 'flex';
            btnVerFinalizados.textContent = 'Ver Proyectos Finalizados';
        }
    });

    function renderizarFinalizados() {
        finalizadosContainer.innerHTML = '';
        document.getElementById('finalizados').textContent = proyectosFinalizados.length;
        if (proyectosFinalizados.length === 0) {
            finalizadosContainer.innerHTML = '<p style="color:#888">No hay proyectos finalizados.</p>';
            return;
        }
        proyectosFinalizados.forEach((proy, idx) => {
            const card = document.createElement('div');
            card.className = 'proyecto-card';
            // ... alertas, fotos, botones ...
            let fotosHtml = '';
            ['fotoProyecto','fotoProceso','fotoActa'].forEach(tipo => {
                if (proy[tipo]) {
                    fotosHtml += `<div class=\"foto-miniatura\">
                        <img src=\"${proy[tipo]}\" alt=\"${tipo}\" />
                    </div>`;
                }
            });
            let htmlCategorias = '';
            proy.categorias.forEach((cat) => {
                htmlCategorias += `<div class=\"categoria\">
                    <h4>${cat.nombre}</h4>
                    <ul>`;
                cat.items.forEach((item) => {
                    htmlCategorias += `
                        <li>
                            <span>${item.nombre}</span>
                            <span style=\"margin-left:10px\">${item.porcentaje}%</span>
                            <span style=\"margin-left:10px;color:#888\">${item.nota || ''}</span>
                        </li>`;
                });
                htmlCategorias += '</ul></div>';
            });
            card.innerHTML = `
                <h3>${proy.nombre}</h3>
                <p><b>Responsable:</b> ${proy.responsable}</p>
                <p><b>Ejecutor:</b> ${proy.ejecutor}</p>
                <p><b>Vendedor:</b> ${proy.vendedor}</p>
                <p><b>Fecha de Inicio:</b> ${proy.fechaInicio}</p>
                <p><b>Fecha de Entrega:</b> ${proy.fechaEntrega}</p>
                <p><b>Descripción:</b> ${proy.descripcion}</p>
                <p><b>Nota:</b> ${proy.nota}</p>
                <p><b>Última modificación:</b> ${proy.modificadoPor ? proy.modificadoPor : ''} ${proy.fechaModificacion ? ('el ' + proy.fechaModificacion) : ''}</p>
                <div class=\"fotos-proyecto\">${fotosHtml}</div>
                <div class=\"progreso-total\">
                    <div class=\"donut\">
                        <svg width=\"80\" height=\"80\" viewBox=\"0 0 80 80\">
                            <circle class=\"donut-bg\" cx=\"40\" cy=\"40\" r=\"35\" stroke-width=\"10\" fill=\"none\" />
                            <circle class=\"donut-bar\" cx=\"40\" cy=\"40\" r=\"35\" stroke-width=\"10\" fill=\"none\" stroke-dasharray=\"220\" stroke-dashoffset=\"0\" />
                        </svg>
                        <span class=\"porcentaje-total\">100%</span>
                    </div>
                </div>
                <div class=\"categorias\">${htmlCategorias}</div>
                <button class='btn-eliminar-finalizado' data-idx='${idx}'>Eliminar</button>
            `;
            finalizadosContainer.appendChild(card);
            // Evento eliminar
            card.querySelector('.btn-eliminar-finalizado').addEventListener('click', () => {
                if (confirm('¿Seguro que deseas eliminar este proyecto finalizado?')) {
                    proyectosFinalizados.splice(idx, 1);
                    guardarFinalizados();
                    renderizarFinalizados();
                }
            });
        });
    }

    // Detectar y mover proyectos finalizados
    function detectarFinalizados() {
        proyectos.forEach((proy, idx) => {
            let suma = 0, totalItems = 0;
            proy.categorias.forEach(cat => {
                cat.items.forEach(item => {
                    suma += Number(item.porcentaje);
                    totalItems++;
                });
            });
            const porcentaje = totalItems ? Math.round((suma / (totalItems * 100)) * 100) : 0;
            if (porcentaje === 100 && !proy.finalizado) {
                proy.finalizado = true;
                proyectosFinalizados.push(JSON.parse(JSON.stringify(proy)));
                guardarFinalizados();
            }
        });
    }

    // Al abrir modal, limpiar fotos
    btnNuevoProyecto.addEventListener('click', () => {
        document.getElementById('fotoProyecto').value = '';
        document.getElementById('fotoProceso').value = '';
        document.getElementById('fotoActa').value = '';
    });

    // Guardar proyecto (con historial de modificación)
    formProyecto.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Obtén los valores de los campos
        const nombre = document.getElementById('nombreProyecto').value;
        const responsable = document.getElementById('responsableProyecto').value;
        const ejecutor = document.getElementById('ejecutorProyecto').value;
        const vendedor = document.getElementById('vendedorProyecto').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaEntrega = document.getElementById('fechaEntrega').value;
        const descripcion = document.getElementById('descripcionProyecto').value;
        const nota = document.getElementById('notaProyecto').value;
        const modificadoPor = document.getElementById('modificadoPor').value;
        const fechaModificacion = new Date().toLocaleString();

        const editIdx = formProyecto.getAttribute('data-edit');
        if (editIdx !== null) {
            // Editar proyecto existente: solo actualizar campos principales
            proyectos[editIdx].nombre = nombre;
            proyectos[editIdx].responsable = responsable;
            proyectos[editIdx].ejecutor = ejecutor;
            proyectos[editIdx].vendedor = vendedor;
            proyectos[editIdx].fechaInicio = fechaInicio;
            proyectos[editIdx].fechaEntrega = fechaEntrega;
            proyectos[editIdx].descripcion = descripcion;
            proyectos[editIdx].nota = nota;
            proyectos[editIdx].modificadoPor = modificadoPor;
            proyectos[editIdx].fechaModificacion = fechaModificacion;
            formProyecto.removeAttribute('data-edit');
            document.getElementById('tituloModal').textContent = 'Nuevo Proyecto';
        } else {
            // Validar duplicado por nombre
            const existe = proyectos.some(p => p.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
            if (existe) {
                alert('Ya existe un proyecto activo con ese nombre. Usa otro nombre.');
                return;
            }
            // Nuevo proyecto: crear con categorías e ítems base
            const categorias = [
                {
                    nombre: 'Compras',
                    items: [
                        { nombre: 'Gabinetes', nota: '', porcentaje: 0 },
                        { nombre: 'Insumos de Ensamble', nota: '', porcentaje: 0 },
                        { nombre: 'Servidor PC Pitty', nota: '', porcentaje: 0 },
                        { nombre: 'Smart Android v25s', nota: '', porcentaje: 0 },
                        { nombre: 'Postes LPR con brazo', nota: '', porcentaje: 0 },
                        { nombre: 'Punto de pago Access Park Edge manual', nota: '', porcentaje: 0 },
                        { nombre: 'Cámaras LPR', nota: '', porcentaje: 0 },
                        { nombre: 'NVR Cámaras', nota: '', porcentaje: 0 },
                    ]
                },
                {
                    nombre: 'Producción/Ensamble',
                    items: [
                        { nombre: 'Kiosko pago electrónico', nota: '', porcentaje: 0 },
                        { nombre: 'Cajero 1030', nota: '', porcentaje: 0 },
                        { nombre: 'Cajero 2030', nota: '', porcentaje: 0 },
                        { nombre: 'Validador 1030AP', nota: '', porcentaje: 0 },
                        { nombre: 'Barrera Ditec', nota: '', porcentaje: 0 },
                        { nombre: 'Barrera Hikvision', nota: '', porcentaje: 0 },
                        { nombre: 'Barrera electrónica AccessPark', nota: '', porcentaje: 0 },
                        { nombre: 'Dispensador 1030', nota: '', porcentaje: 0 },
                        { nombre: 'Verificador 1030Q', nota: '', porcentaje: 0 },
                        { nombre: 'Totem visualización 0535 LPR', nota: '', porcentaje: 0 },
                        { nombre: 'Casilleros', nota: '', porcentaje: 0 },
                    ]
                },
                {
                    nombre: 'Proveedores',
                    items: [
                        { nombre: 'Vidrios', nota: '', porcentaje: 0 },
                        { nombre: 'Metalmecánica', nota: '', porcentaje: 0 },
                        { nombre: 'Impresión de vinilo', nota: '', porcentaje: 0 },
                    ]
                },
                {
                    nombre: 'Desarrollo',
                    items: [
                        { nombre: 'Tarjeta casillero', nota: '', porcentaje: 0 },
                        { nombre: 'Tarjeta ver 6', nota: '', porcentaje: 0 },
                        { nombre: 'Tarjeta caja ver 6', nota: '', porcentaje: 0 },
                        { nombre: 'Tarjeta con Wisnet', nota: '', porcentaje: 0 },
                    ]
                },
                {
                    nombre: 'Soporte Técnico',
                    items: [
                        { nombre: 'Pruebas', nota: '', porcentaje: 0 },
                        { nombre: 'Estado', nota: '', porcentaje: 0 },
                        { nombre: 'Funcionamiento', nota: '', porcentaje: 0 },
                        { nombre: 'Máquina en línea', nota: '', porcentaje: 0 },
                        { nombre: 'Dispensar QR/Tarjeta', nota: '', porcentaje: 0 },
                        { nombre: 'Lectura de QR/Tarjeta', nota: '', porcentaje: 0 },
                        { nombre: 'Funcionamiento de barrera', nota: '', porcentaje: 0 },
                    ]
                },
                {
                    nombre: 'Instalación en campo',
                    items: [
                        { nombre: 'Equipos instalados', nota: '', porcentaje: 0 },
                    ]
                },
                {
                    nombre: 'Embalaje y envío',
                    items: [
                        { nombre: 'Fecha llegada', nota: '', porcentaje: 0 },
                        { nombre: 'Fecha envío', nota: '', porcentaje: 0 },
                    ]
                },
            ];
            proyectos.push({
                nombre, responsable, ejecutor, vendedor, fechaInicio, fechaEntrega, descripcion, nota,
                fotoProyecto: '', fotoProceso: '', fotoActa: '', categorias,
                modificadoPor, fechaModificacion
            });
        }
        guardarProyectos();
        renderizarProyectos();
        document.getElementById('modalProyecto').classList.add('oculto');
        document.getElementById('modalProyecto').style.display = 'none';
    });

    // Al cargar la página, renderizar proyectos y finalizados
    renderizarProyectos();
    renderizarFinalizados();

    // --- EXPORTAR A EXCEL ---
    document.getElementById('exportarExcel').addEventListener('click', () => {
        if (proyectos.length === 0) {
            alert('No hay proyectos para exportar.');
            return;
        }
        const data = [];
        const resumen = [['Proyecto', 'Porcentaje de avance']];
        proyectos.forEach(proy => {
            let suma = 0, totalItems = 0;
            proy.categorias.forEach(cat => {
                cat.items.forEach(item => {
                    suma += Number(item.porcentaje);
                    totalItems++;
                    data.push({
                        'Proyecto': proy.nombre,
                        'Responsable': proy.responsable,
                        'Ejecutor': proy.ejecutor,
                        'Vendedor': proy.vendedor,
                        'Fecha Inicio': proy.fechaInicio,
                        'Fecha Entrega': proy.fechaEntrega,
                        'Descripción': proy.descripcion,
                        'Nota Proyecto': proy.nota,
                        'Categoría': cat.nombre,
                        'Ítem': item.nombre,
                        'Porcentaje': item.porcentaje,
                        'Nota Ítem': item.nota || '',
                        'Modificado por': proy.modificadoPor || '',
                        'Fecha modificación': proy.fechaModificacion || '',
                    });
                });
            });
            const porcentaje = totalItems ? Math.round((suma / (totalItems * 100)) * 100) : 0;
            resumen.push([proy.nombre, porcentaje]);
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Proyectos');
        // Hoja de resumen para gráfico
        const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
        XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
        XLSX.writeFile(wb, 'proyectos_access_park.xlsx');
    });

    // --- EXPORTAR A PDF CON GRÁFICO ---
    document.getElementById('exportarPDF').addEventListener('click', async () => {
        if (proyectos.length === 0) {
            alert('No hay proyectos para exportar.');
            return;
        }
        // Crear canvas para gráfico
        let chartContainer = document.createElement('div');
        chartContainer.style.width = '600px';
        chartContainer.style.height = '350px';
        let canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);
        document.body.appendChild(chartContainer);
        // Datos para el gráfico
        const labels = proyectos.map(p => p.nombre);
        const dataAvance = proyectos.map(proy => {
            let suma = 0, totalItems = 0;
            proy.categorias.forEach(cat => {
                cat.items.forEach(item => {
                    suma += Number(item.porcentaje);
                    totalItems++;
                });
            });
            return totalItems ? Math.round((suma / (totalItems * 100)) * 100) : 0;
        });
        // Crear gráfico
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avance (%)',
                    data: dataAvance,
                    backgroundColor: '#1abc9c',
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Avance de Proyectos', font: { size: 16 } }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { font: { size: 12 } } },
                    x: { ticks: { font: { size: 12 } } }
                }
            }
        });
        // Esperar a que el gráfico se dibuje
        await new Promise(res => setTimeout(res, 1000)); // Aumentar el tiempo de espera
        const chartCanvas = await html2canvas(chartContainer, { scale: 3 }); // Aumentar la escala
        const chartImg = chartCanvas.toDataURL('image/jpeg');
        // Limpiar
        chart.destroy();
        document.body.removeChild(chartContainer);
        // PDF
        const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        // Agregar gráfico
        const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
        const pdfHeight = 300;
        pdf.addImage(chartImg, 'JPEG', 20, 40, pdfWidth, pdfHeight);
        let y = 40 + pdfHeight + 20;
        // Prueba con una imagen estática
        const staticImgData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAkAAAAMAAAABAAEAAEAA...'; // Truncated base64 data
        pdf.addImage(staticImgData, 'JPEG', 20, 40, pdfWidth, pdfHeight);
        pdf.save('proyectos_access_park_test.pdf');
        return; // Terminate early for testing

        // Agregar tarjetas de proyectos
        const cards = document.querySelectorAll('.proyecto-card');
        for (let i = 0; i < cards.length; i++) {
            // Asegúrate de que el contenido esté visible
            cards[i].style.display = 'block';
            const canvas = await html2canvas(cards[i], {
                scale: 3, // Aumentar la escala para mejorar la calidad
                useCORS: true, // Permitir CORS si es necesario
                logging: true // Habilitar el registro para depuración
            });
            const imgData = canvas.toDataURL('image/jpeg');
            console.log('Image Data:', imgData);
            const imgProps = pdf.getImageProperties(imgData);
            if (!imgProps || !imgProps.width || !imgProps.height) {
                console.error('Invalid image properties:', imgProps);
                continue; // Skip this image if properties are invalid
            }
            const cardPdfWidth = pdf.internal.pageSize.getWidth() - 40;
            const cardPdfHeight = (imgProps.height * cardPdfWidth) / imgProps.width;
            if (y + cardPdfHeight > pdf.internal.pageSize.getHeight() - 40) {
                pdf.addPage();
                y = 40;
            }
            pdf.addImage(imgData, 'JPEG', 20, y, cardPdfWidth, cardPdfHeight);
            y += cardPdfHeight + 20;
        }
    });

    // --- GUARDAR LOCALMENTE (descargar JSON) ---
    document.getElementById('guardarLocal').addEventListener('click', () => {
        const dataStr = JSON.stringify(proyectos, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proyectos_access_park.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- CARGAR DATOS DESDE JSON ---
    document.getElementById('cargarDatos').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = evt => {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (Array.isArray(data)) {
                        proyectos = data;
                        guardarProyectos();
                        renderizarProyectos();
                        alert('Datos cargados correctamente.');
                    } else {
                        alert('El archivo no tiene el formato correcto.');
                    }
                } catch (err) {
                    alert('Error al leer el archivo.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Permitir descargar proyectos finalizados en ZIP con carpetas e imágenes
    document.getElementById('descargarFinalizados').addEventListener('click', async () => {
        if (proyectosFinalizados.length === 0) {
            alert('No hay proyectos finalizados para exportar.');
            return;
        }
        const zip = new JSZip();
        for (const proy of proyectosFinalizados) {
            const folder = zip.folder(proy.nombre.replace(/[^a-zA-Z0-9_\- ]/g, '_'));
            // Guardar imágenes si existen
            if (proy.fotoProyecto) {
                folder.file('fotoProyecto.png', proy.fotoProyecto.split(',')[1], {base64: true});
            }
            if (proy.fotoProceso) {
                folder.file('fotoProceso.png', proy.fotoProceso.split(',')[1], {base64: true});
            }
            if (proy.fotoActa) {
                folder.file('fotoActa.png', proy.fotoActa.split(',')[1], {base64: true});
            }
            // Guardar info del proyecto
            let info = `Nombre: ${proy.nombre}\nResponsable: ${proy.responsable}\nEjecutor: ${proy.ejecutor}\nVendedor: ${proy.vendedor}\nFecha de Inicio: ${proy.fechaInicio}\nFecha de Entrega: ${proy.fechaEntrega}\nDescripción: ${proy.descripcion}\nNota: ${proy.nota}\nModificado por: ${proy.modificadoPor || ''}\nFecha modificación: ${proy.fechaModificacion || ''}\n`;
            info += '\nCATEGORÍAS E ÍTEMS:\n';
            proy.categorias.forEach(cat => {
                info += `\n${cat.nombre}:\n`;
                cat.items.forEach(item => {
                    info += `  - ${item.nombre}: ${item.porcentaje}% Nota: ${item.nota || ''}\n`;
                });
            });
            folder.file('info.txt', info);
        }
        const content = await zip.generateAsync({type: 'blob'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'proyectos_finalizados_access_park.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}); 