// Configuración de la API
const API_BASE_URL = 'http://localhost:8080/api';

// Estado global
let productos = [];
let categorias = [];
let proveedores = [];
let movimientos = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    showNotification('Cargando datos...', 'info');
    await Promise.all([
        cargarProductos(),
        cargarCategorias(),
        cargarProveedores(),
        cargarMovimientos()
    ]);
    actualizarDashboard();
    hideNotification();
}

function setupEventListeners() {
    // Navegación
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navegarA(page, e);
        });
    });

    // Botones principales
    document.getElementById('btn-refresh')?.addEventListener('click', initializeApp);
    document.getElementById('btn-nuevo-producto')?.addEventListener('click', () => abrirModalProducto());
    document.getElementById('btn-nueva-categoria')?.addEventListener('click', () => abrirModalCategoria());
    document.getElementById('btn-nuevo-proveedor')?.addEventListener('click', () => abrirModalProveedor());
    document.getElementById('btn-nueva-entrada')?.addEventListener('click', () => abrirModalMovimiento('ENTRADA'));
    document.getElementById('btn-nueva-salida')?.addEventListener('click', () => abrirModalMovimiento('SALIDA'));

    // Búsqueda
    document.getElementById('search-productos')?.addEventListener('input', filtrarProductos);
}

// Navegación
function navegarA(page, event) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    if (event) {
        event.target.closest('.menu-item').classList.add('active');
    }

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    document.getElementById(page + '-page').classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'productos': 'Productos',
        'categorias': 'Categorías',
        'proveedores': 'Proveedores',
        'movimientos': 'Movimientos de Inventario',
        'stock-bajo': 'Productos con Stock Bajo'
    };

    document.getElementById('page-title').textContent = titles[page] || 'Dashboard';

    if (page === 'productos') renderProductos();
    if (page === 'categorias') renderCategorias();
    if (page === 'proveedores') renderProveedores();
    if (page === 'movimientos') renderMovimientos();
    if (page === 'stock-bajo') renderStockBajo();
}

// ─── API Calls - Productos ───────────────────────────────────────────────────

async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`);
        productos = await response.json();
        renderProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        showNotification('Error al cargar productos', 'error');
    }
}

async function guardarProducto() {
    const id = document.getElementById('producto-id').value;

    // ✅ FIX: campos correctos que espera el backend de Spring
    // - "precio" en lugar de "precioUnitario"
    // - "stock" en lugar de "stockActual"
    // - categoria y proveedor como objetos { id } en lugar de categoriaId / proveedorId
    const producto = {
        nombre: document.getElementById('producto-nombre').value,
        descripcion: document.getElementById('producto-descripcion').value,
        precio: parseFloat(document.getElementById('producto-precio').value),
        stock: parseInt(document.getElementById('producto-stock-actual').value),
        stockMinimo: parseInt(document.getElementById('producto-stock-minimo').value),
        categoria: { id: parseInt(document.getElementById('producto-categoria').value) },
        proveedor: { id: parseInt(document.getElementById('producto-proveedor').value) }
    };

    try {
        const url = id ? `${API_BASE_URL}/productos/${id}` : `${API_BASE_URL}/productos`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (response.ok) {
            await cargarProductos();
            actualizarDashboard();
            closeModal('modal-producto');
            showNotification(id ? 'Producto actualizado' : 'Producto creado', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error al guardar producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar producto', 'error');
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await cargarProductos();
            actualizarDashboard();
            showNotification('Producto eliminado', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar producto', 'error');
    }
}

// ─── API Calls - Categorías ──────────────────────────────────────────────────

async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        categorias = await response.json();
        renderCategorias();
        cargarCategoriasEnSelect();
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

async function guardarCategoria() {
    const id = document.getElementById('categoria-id').value;
    const categoria = {
        nombre: document.getElementById('categoria-nombre').value,
        descripcion: document.getElementById('categoria-descripcion').value
    };

    try {
        const url = id ? `${API_BASE_URL}/categorias/${id}` : `${API_BASE_URL}/categorias`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoria)
        });

        if (response.ok) {
            await cargarCategorias();
            actualizarDashboard();
            closeModal('modal-categoria');
            showNotification(id ? 'Categoría actualizada' : 'Categoría creada', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar categoría', 'error');
    }
}

async function eliminarCategoria(id) {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await cargarCategorias();
            actualizarDashboard();
            showNotification('Categoría eliminada', 'success');
        } else {
            showNotification('No se puede eliminar: tiene productos asociados', 'error');
        }
    } catch (error) {
        showNotification('No se puede eliminar: tiene productos asociados', 'error');
    }
}

// ─── API Calls - Proveedores ─────────────────────────────────────────────────

async function cargarProveedores() {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`);
        proveedores = await response.json();
        renderProveedores();
        cargarProveedoresEnSelect();
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

async function guardarProveedor() {
    const id = document.getElementById('proveedor-id').value;
    const proveedor = {
        nombre: document.getElementById('proveedor-nombre').value,
        contacto: document.getElementById('proveedor-contacto').value,
        telefono: document.getElementById('proveedor-telefono').value,
        email: document.getElementById('proveedor-email').value,
        direccion: document.getElementById('proveedor-direccion').value
    };

    try {
        const url = id ? `${API_BASE_URL}/proveedores/${id}` : `${API_BASE_URL}/proveedores`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proveedor)
        });

        if (response.ok) {
            await cargarProveedores();
            closeModal('modal-proveedor');
            showNotification(id ? 'Proveedor actualizado' : 'Proveedor creado', 'success');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar proveedor', 'error');
    }
}

async function eliminarProveedor(id) {
    if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await cargarProveedores();
            showNotification('Proveedor eliminado', 'success');
        } else {
            showNotification('No se puede eliminar: tiene productos asociados', 'error');
        }
    } catch (error) {
        showNotification('No se puede eliminar: tiene productos asociados', 'error');
    }
}

// ─── API Calls - Movimientos ─────────────────────────────────────────────────

async function cargarMovimientos() {
    try {
        const response = await fetch(`${API_BASE_URL}/movimientos`);
        movimientos = await response.json();
        renderMovimientos();
    } catch (error) {
        console.error('Error cargando movimientos:', error);
    }
}

async function guardarMovimiento() {
    const tipo = document.getElementById('movimiento-tipo').value;

    // ✅ FIX: el backend espera:
    // - "producto": { id } en lugar de "productoId"
    // - "tipoMovimiento" en lugar de "tipo"
    const movimiento = {
        producto: { id: parseInt(document.getElementById('movimiento-producto').value) },
        tipoMovimiento: tipo,
        cantidad: parseInt(document.getElementById('movimiento-cantidad').value),
        fecha: new Date().toISOString()
    };

    try {
        const url = `${API_BASE_URL}/movimientos/${tipo.toLowerCase()}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimiento)
        });

        if (response.ok) {
            await Promise.all([cargarMovimientos(), cargarProductos()]);
            closeModal('modal-movimiento');
            showNotification('Movimiento registrado', 'success');
            actualizarDashboard();
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error al registrar movimiento', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al registrar movimiento', 'error');
    }
}

// ─── Renders ─────────────────────────────────────────────────────────────────

function renderProductos() {
    const tbody = document.getElementById('productos-tbody');
    if (!tbody) return;

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No hay productos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map(p => {
        // ✅ FIX: p.categoria es el objeto completo devuelto por el backend
        const nombreCategoria = p.categoria ? p.categoria.nombre : 'N/A';
        // ✅ FIX: usar p.stock y p.stockMinimo (no stockActual)
        const stockStatus = p.stock <= p.stockMinimo ? 'badge-danger' : 'badge-success';
        const stockText = p.stock <= p.stockMinimo ? 'Stock Bajo' : 'Stock OK';

        return `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${nombreCategoria}</td>
                <td>$${Number(p.precio).toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>${p.stockMinimo}</td>
                <td><span class="badge ${stockStatus}">${stockText}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarProducto(${p.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderCategorias() {
    const grid = document.getElementById('categorias-grid');
    if (!grid) return;

    if (categorias.length === 0) {
        grid.innerHTML = '<div class="loading">No hay categorías registradas</div>';
        return;
    }

    grid.innerHTML = categorias.map(c => `
        <div class="category-card">
            <h4>${c.nombre}</h4>
            <p>${c.descripcion || 'Sin descripción'}</p>
            <div class="category-actions">
                <button class="btn btn-sm btn-primary" onclick="editarCategoria(${c.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCategoria(${c.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function renderProveedores() {
    const tbody = document.getElementById('proveedores-tbody');
    if (!tbody) return;

    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay proveedores registrados</td></tr>';
        return;
    }

    tbody.innerHTML = proveedores.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><strong>${p.nombre}</strong></td>
            <td>${p.contacto || 'N/A'}</td>
            <td>${p.telefono || 'N/A'}</td>
            <td>${p.email || 'N/A'}</td>
            <td>${p.direccion || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editarProveedor(${p.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${p.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderMovimientos() {
    const tbody = document.getElementById('movimientos-tbody');
    if (!tbody) return;

    if (movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay movimientos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = movimientos.slice(0, 50).map(m => {
        // ✅ FIX: el backend devuelve m.producto (objeto) y m.tipoMovimiento
        const nombreProducto = m.producto ? m.producto.nombre : 'N/A';
        const fecha = new Date(m.fecha).toLocaleString('es-EC');
        const tipo = m.tipoMovimiento;
        const tipoBadge = tipo === 'ENTRADA' ? 'badge-success' : 'badge-danger';

        return `
            <tr>
                <td>${m.id}</td>
                <td>${fecha}</td>
                <td>${nombreProducto}</td>
                <td><span class="badge ${tipoBadge}">${tipo}</span></td>
                <td>${m.cantidad}</td>
                <td>-</td>
            </tr>
        `;
    }).join('');
}

function renderStockBajo() {
    const container = document.getElementById('stock-bajo-list');
    if (!container) return;

    // ✅ FIX: usar p.stock y p.stockMinimo
    const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo);

    if (productosStockBajo.length === 0) {
        container.innerHTML = '<p class="loading">No hay productos con stock bajo</p>';
        return;
    }

    container.innerHTML = productosStockBajo.map(p => {
        // ✅ FIX: p.categoria es el objeto embebido
        const nombreCategoria = p.categoria ? p.categoria.nombre : 'Sin categoría';
        return `
            <div class="stock-alert">
                <div class="stock-alert-info">
                    <h4>${p.nombre}</h4>
                    <p>${nombreCategoria} • Stock mínimo: ${p.stockMinimo}</p>
                </div>
                <div class="stock-alert-stock">
                    <div class="current">${p.stock}</div>
                    <div class="min">unidades</div>
                </div>
            </div>
        `;
    }).join('');
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function actualizarDashboard() {
    const totalProductos = productos.length;

    // ✅ FIX: usar p.precio y p.stock (no precioUnitario / stockActual)
    const valorInventario = productos.reduce((sum, p) => sum + (Number(p.precio) * p.stock), 0);
    const stockBajoCount = productos.filter(p => p.stock <= p.stockMinimo).length;

    document.getElementById('total-productos').textContent = totalProductos;
    document.getElementById('valor-inventario').textContent = `$${valorInventario.toFixed(2)}`;
    document.getElementById('stock-bajo-count').textContent = stockBajoCount;
    document.getElementById('total-categorias').textContent = categorias.length;

    const preview = document.getElementById('stock-bajo-preview');
    if (!preview) return;

    // ✅ FIX: usar p.stock y p.stockMinimo
    const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo).slice(0, 5);

    if (productosStockBajo.length === 0) {
        preview.innerHTML = '<p style="color: var(--secondary-color); padding: 20px; text-align: center;"><i class="fas fa-check-circle"></i> ¡Todos los productos tienen stock suficiente!</p>';
    } else {
        preview.innerHTML = productosStockBajo.map(p => {
            // ✅ FIX: p.categoria es el objeto embebido
            const nombreCategoria = p.categoria ? p.categoria.nombre : 'Sin categoría';
            return `
                <div class="stock-alert">
                    <div class="stock-alert-info">
                        <h4>${p.nombre}</h4>
                        <p>${nombreCategoria}</p>
                    </div>
                    <div class="stock-alert-stock">
                        <div class="current">${p.stock}</div>
                        <div class="min">Min: ${p.stockMinimo}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function abrirModalProducto(id = null) {
    cargarCategoriasEnSelect();
    cargarProveedoresEnSelect();

    if (id) {
        const producto = productos.find(p => p.id === id);
        document.getElementById('modal-producto-title').textContent = 'Editar Producto';
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('producto-nombre').value = producto.nombre;
        document.getElementById('producto-descripcion').value = producto.descripcion || '';
        // ✅ FIX: usar p.precio, p.stock, y el objeto p.categoria / p.proveedor
        document.getElementById('producto-precio').value = producto.precio;
        document.getElementById('producto-stock-actual').value = producto.stock;
        document.getElementById('producto-stock-minimo').value = producto.stockMinimo;
        document.getElementById('producto-categoria').value = producto.categoria ? producto.categoria.id : '';
        document.getElementById('producto-proveedor').value = producto.proveedor ? producto.proveedor.id : '';
    } else {
        document.getElementById('modal-producto-title').textContent = 'Nuevo Producto';
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
    }

    openModal('modal-producto');
}

function abrirModalCategoria(id = null) {
    if (id) {
        const categoria = categorias.find(c => c.id === id);
        document.getElementById('modal-categoria-title').textContent = 'Editar Categoría';
        document.getElementById('categoria-id').value = categoria.id;
        document.getElementById('categoria-nombre').value = categoria.nombre;
        document.getElementById('categoria-descripcion').value = categoria.descripcion || '';
    } else {
        document.getElementById('modal-categoria-title').textContent = 'Nueva Categoría';
        document.getElementById('form-categoria').reset();
        document.getElementById('categoria-id').value = '';
    }

    openModal('modal-categoria');
}

function abrirModalProveedor(id = null) {
    if (id) {
        const proveedor = proveedores.find(p => p.id === id);
        document.getElementById('modal-proveedor-title').textContent = 'Editar Proveedor';
        document.getElementById('proveedor-id').value = proveedor.id;
        document.getElementById('proveedor-nombre').value = proveedor.nombre;
        document.getElementById('proveedor-contacto').value = proveedor.contacto || '';
        document.getElementById('proveedor-telefono').value = proveedor.telefono || '';
        document.getElementById('proveedor-email').value = proveedor.email || '';
        document.getElementById('proveedor-direccion').value = proveedor.direccion || '';
    } else {
        document.getElementById('modal-proveedor-title').textContent = 'Nuevo Proveedor';
        document.getElementById('form-proveedor').reset();
        document.getElementById('proveedor-id').value = '';
    }

    openModal('modal-proveedor');
}

function abrirModalMovimiento(tipo) {
    cargarProductosEnSelect();

    if (tipo === 'ENTRADA') {
        cargarProveedoresEnSelect();
        document.getElementById('modal-movimiento-title').textContent = 'Nueva Entrada de Stock';
        document.getElementById('movimiento-proveedor-group').style.display = 'block';
        document.getElementById('movimiento-motivo-group').style.display = 'none';
    } else {
        document.getElementById('modal-movimiento-title').textContent = 'Nueva Salida de Stock';
        document.getElementById('movimiento-proveedor-group').style.display = 'none';
        document.getElementById('movimiento-motivo-group').style.display = 'block';
    }

    // ✅ Primero reset, LUEGO setear el tipo
    document.getElementById('form-movimiento').reset();
    document.getElementById('movimiento-tipo').value = tipo; // restaurar después del reset

    openModal('modal-movimiento');
}
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function editarProducto(id) {
    abrirModalProducto(id);
}

function editarCategoria(id) {
    abrirModalCategoria(id);
}

function editarProveedor(id) {
    abrirModalProveedor(id);
}

function cargarCategoriasEnSelect() {
    const select = document.getElementById('producto-categoria');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione...</option>' +
        categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

function cargarProveedoresEnSelect() {
    const selects = ['producto-proveedor', 'movimiento-proveedor'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Seleccione...</option>' +
                proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
        }
    });
}

function cargarProductosEnSelect() {
    const select = document.getElementById('movimiento-producto');
    if (!select) return;
    // ✅ FIX: usar p.stock en lugar de p.stockActual
    select.innerHTML = '<option value="">Seleccione...</option>' +
        productos.map(p => `<option value="${p.id}">${p.nombre} (Stock: ${p.stock})</option>`).join('');
}

function filtrarProductos() {
    const searchTerm = document.getElementById('search-productos').value.toLowerCase();
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm))
    );

    const tbody = document.getElementById('productos-tbody');
    if (!tbody) return;

    tbody.innerHTML = productosFiltrados.map(p => {
        // ✅ FIX: usar p.categoria (objeto), p.precio, p.stock, p.stockMinimo
        const nombreCategoria = p.categoria ? p.categoria.nombre : 'N/A';
        const stockStatus = p.stock <= p.stockMinimo ? 'badge-danger' : 'badge-success';
        const stockText = p.stock <= p.stockMinimo ? 'Stock Bajo' : 'Stock OK';

        return `
            <tr>
                <td>${p.id}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${nombreCategoria}</td>
                <td>$${Number(p.precio).toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>${p.stockMinimo}</td>
                <td><span class="badge ${stockStatus}">${stockText}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarProducto(${p.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ─── Notifications ───────────────────────────────────────────────────────────

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');

    text.textContent = message;
    notification.className = 'notification ' + (type === 'error' ? 'error' : '');
    notification.classList.add('active');

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

function hideNotification() {
    document.getElementById('notification').classList.remove('active');
}

// ─── Keyboard & Click-outside ─────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});