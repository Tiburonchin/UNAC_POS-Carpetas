document.addEventListener('DOMContentLoaded', function () {
    // Elementos principales
    const facultadSelect = document.getElementById('facultad');
    const programaSelect = document.getElementById('programa');
    const tiposProgramaDiv = document.getElementById('tiposPrograma');
    const programaContainer = document.getElementById('programaContainer');
    const subidaSection = document.getElementById('subidaSection');
    let facultadesData = {};

    // Cargar programas.json y poblar facultades
    fetch('config/programas_detalle_programa.json')
        .then(response => response.json())
        .then(data => {
            facultadesData = data;
            facultadSelect.innerHTML = '<option value="">Seleccione una facultad</option>';
            Object.keys(facultadesData).forEach(facultad => {
                const option = document.createElement('option');
                option.value = facultad;
                option.textContent = facultad;
                facultadSelect.appendChild(option);
            });
        })
        .catch(() => {
            facultadSelect.innerHTML = '<option value="">Error al cargar facultades</option>';
        });

    // Al cambiar facultad, mostrar botones de tipo de programa y limpiar selects
    facultadSelect.addEventListener('change', function () {
        tiposProgramaDiv.innerHTML = '';
        programaSelect.innerHTML = '<option value="">Seleccione un programa</option>';
        programaContainer.style.display = 'none';

        const tipos = facultadesData[this.value];
        const tiposOrden = ['Maestría', 'Doctorado', 'Especialidad'];

        tiposOrden.forEach(tipo => {
            const tieneProgramas = tipos && Array.isArray(tipos[tipo]) && tipos[tipo].length > 0;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn me-2 mb-2 ' + (tieneProgramas ? 'btn-outline-primary' : 'btn-outline-secondary disabled');
            btn.textContent = tipo;
            btn.disabled = !tieneProgramas;
            btn.onclick = function () {
                if (!tieneProgramas) return;
                // Quitar la clase activa de todos los botones
                Array.from(tiposProgramaDiv.querySelectorAll('button')).forEach(b => b.classList.remove('active-programa'));
                // Marcar este como activo
                btn.classList.add('active-programa');
                // Llenar el select de programas específicos
                programaSelect.innerHTML = '<option value="">Seleccione un programa</option>';
                tipos[tipo].forEach(prog => {
                    const option = document.createElement('option');
                    option.value = prog;
                    option.textContent = prog;
                    programaSelect.appendChild(option);
                });
                programaContainer.style.display = '';
            };
            tiposProgramaDiv.appendChild(btn);
        });
    });

    // Buscar postulante por DNI, facultad y programa
    document.getElementById('buscarForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const dni = document.getElementById('dni').value.trim();
        const programa = programaSelect.value;
        const respuestaDiv = document.getElementById('respuesta');
        const buscarBtn = this.querySelector('button[type="submit"]');
        const spinnerBuscar = document.getElementById('spinnerBuscar');
        if (buscarBtn) buscarBtn.disabled = true;
        if (spinnerBuscar) spinnerBuscar.classList.remove('d-none');

        if (!dni.match(/^\d{8}$/)) {
            respuestaDiv.innerHTML = '<span class="text-danger">Ingrese un DNI válido de 8 dígitos.</span>';
            if (buscarBtn) buscarBtn.disabled = false;
            if (spinnerBuscar) spinnerBuscar.classList.add('d-none');
            return;
        }
        if (!programa) {
            respuestaDiv.innerHTML = '<span class="text-danger">Seleccione un programa.</span>';
            if (buscarBtn) buscarBtn.disabled = false;
            if (spinnerBuscar) spinnerBuscar.classList.add('d-none');
            return;
        }

        // Buscar postulante
        fetch(`api/api_postulantes.php?dni=${dni}&facultad=${encodeURIComponent(facultadSelect.value)}&programa=${encodeURIComponent(programa)}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.encontrado) {
                    respuestaDiv.innerHTML = `
                        <div>
                            <strong>DNI:</strong> ${data.dni}<br>
                            <strong>Nombre:</strong> ${data.nombres} ${data.apellidos}<br>
                            <strong>Correo:</strong> ${data.correo}<br>
                            <strong>Facultad:</strong> ${data.facultad}<br>
                            <strong>Programa:</strong> ${data.programa}<br>
                            <span class="text-success">¡Postulante encontrado!</span>
                            ${data.token ? `<span class="ms-3 badge bg-info text-dark">Token: <b>${data.token}</b></span>` : ''}
                        </div>
                    `;
                    // Mostrar sección de subida
                    document.getElementById('subidaDocumentos').classList.remove('d-none');
                    document.getElementById('subidaSection').classList.remove('d-none');
                    // Rellenar los campos ocultos del formulario de subida
                    document.getElementById('dniSubida').value = data.dni;
                    document.getElementById('nombreSubida').value = data.nombres + ' ' + data.apellidos;
                    document.getElementById('correoSubida').value = data.correo;
                    document.getElementById('nombrePostulante').textContent = data.nombres;
                    document.getElementById('apellidoPostulante').textContent = data.apellidos;
                    document.getElementById('facultadSubida').value = data.facultad; // data.facultad viene de la búsqueda
                    document.getElementById('programaSubida').value = data.programa; // data.programa viene de la búsqueda
                } else {
                    respuestaDiv.innerHTML = `<span class="text-danger">${data.mensaje}</span>`;
                    document.getElementById('subidaDocumentos').classList.add('d-none');
                    document.getElementById('subidaSection').classList.add('d-none');
                }
            })
            .catch((err) => {
                respuestaDiv.innerHTML = '<span class="text-danger">Error en la consulta: ' + err + '</span>';
                subidaSection.classList.add('d-none');
            })
            .finally(() => {
                if (buscarBtn) buscarBtn.disabled = false;
                if (spinnerBuscar) spinnerBuscar.classList.add('d-none');
            });
    });

    // Simulación de subida de archivos
    const formSubida = document.getElementById('formSubida');
    if (formSubida) {
        formSubida.addEventListener('submit', function (e) {
            e.preventDefault();
            const mensaje = document.getElementById('mensajeSubida');
            mensaje.textContent = '';
            mensaje.className = '';

            // Deshabilitar el botón de subir archivos
            const submitBtn = formSubida.querySelector('button[type="submit"]');
            const spinner = document.getElementById('spinnerSubida');
            if (submitBtn) submitBtn.disabled = true;
            if (spinner) spinner.classList.remove('d-none'); // Mostrar spinner

            const formData = new FormData(formSubida);
            formData.set('action', 'subir_archivos');

            fetch('api/form_postulantes.php', {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        mensaje.innerHTML = `
                            <div class="alert alert-success mt-3">
                                ${data.mensaje}
                            </div>
                        `;
                        formSubida.reset();
                    } else {
                        mensaje.textContent = data.mensaje || 'Error al subir archivos.';
                        mensaje.className = "alert alert-danger mt-3";
                    }
                })
                .catch(() => {
                    mensaje.textContent = 'Error de red al subir archivos.';
                    mensaje.className = "alert alert-danger mt-3";
                })
                .finally(() => {
                    // Habilitar el botón y ocultar el spinner después de la respuesta
                    if (submitBtn) submitBtn.disabled = false;
                    if (spinner) spinner.classList.add('d-none'); // Ocultar spinner
                });
        });
    }

    // Consulta por token y muestra tabla de resultados
    const formToken = document.getElementById('formToken');
    if (formToken) {
        formToken.addEventListener('submit', function (e) {
            e.preventDefault();
            const token = document.getElementById('tokenInput').value.trim();
            const mensaje = document.getElementById('tokenMensaje');
            const tabla = document.getElementById('tablaToken');
            const tbody = document.getElementById('tablaTokenBody');
            mensaje.innerHTML = '';
            tabla.style.display = 'none';
            tbody.innerHTML = '';

            if (!token) {
                mensaje.innerHTML = '<div class="alert alert-warning">Debe ingresar un token.</div>';
                return;
            }

            // Consultar token
            fetch('api/form_postulantes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `action=consultar_token&token=${encodeURIComponent(token)}`
            })
                .then(res => res.json())
                .then(data => {
                    if (data.encontrado) {
                        mensaje.innerHTML = `
                            <div class="mb-2">
                                <strong class="text-primary">Token de acceso:</strong>
                                <span class="fw-bold">${token}</span>
                            </div>
                        `;
                        tbody.innerHTML = `
                            <tr>
                                <td>${data.dni}</td>
                                <td>${data.nombre}</td>
                                <td>${data.correo}</td>
                                <td><a href="${data.carpeta}" target="_blank">Ver carpeta</a></td>
                                <td>${data.estado}</td>
                                <td>${data.mensaje_estado}</td>
                            </tr>
                        `;
                        tabla.style.display = '';
                    } else {
                        mensaje.innerHTML = `<div class="alert alert-danger">${data.mensaje}</div>`;
                        tabla.style.display = 'none';
                    }
                })
                .catch(() => {
                    mensaje.innerHTML = '<div class="alert alert-danger">Error al consultar el token.</div>';
                if (data.encontrado) {
                    mensaje.innerHTML = `
                        <div class="mb-2">
                            <strong class="text-primary">Token de acceso:</strong>
                            <span class="fw-bold">${token}</span>
                        </div>
                    `;
                    tbody.innerHTML = `
                        <tr>
                            <td>${data.dni}</td>
                            <td>${data.nombre}</td>
                            <td>${data.correo}</td>
                            <td><a href="${data.carpeta}" target="_blank">Ver carpeta</a></td>
                            <td>${data.estado}</td>
                            <td>${data.mensaje_estado}</td>
                        </tr>
                    `;
                    tabla.style.display = '';
                } else {
                    mensaje.innerHTML = `<div class="alert alert-danger">${data.mensaje}</div>`;
                    tabla.style.display = 'none';
                }
            })
            .catch(() => {
                mensaje.innerHTML = '<div class="alert alert-danger">Error al consultar el token.</div>';
                tabla.style.display = 'none';
            });
        });
    }

    // Cargar programas_detalle_programa.json y poblar el select
    fetch('config/programas_detalle_programa.json')
        .then(response => response.json())
        .then(data => {
            facultadesData = data;
            facultadSelect.innerHTML = '<option value="">Seleccione una facultad</option>';
            Object.keys(facultadesData).forEach(facultad => {
                const option = document.createElement('option');
                option.value = facultad;
                option.textContent = facultad;
                facultadSelect.appendChild(option);
            });
        })
        .catch(() => {
            facultadSelect.innerHTML = '<option value="">Error al cargar facultades</option>';
        });
});