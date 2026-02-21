package com.example.tiendadeportiva.service;

import com.example.tiendadeportiva.exception.ResourceNotFoundException;
import com.example.tiendadeportiva.model.Categoria;
import com.example.tiendadeportiva.model.Producto;
import com.example.tiendadeportiva.model.Proveedor;
import com.example.tiendadeportiva.repository.CategoriaRepository;
import com.example.tiendadeportiva.repository.ProductoRepository;
import com.example.tiendadeportiva.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProveedorRepository proveedorRepository;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
    }

    @Transactional
    public Producto crear(Producto producto) {
        if (producto.getCategoria() == null || producto.getCategoria().getId() == null) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }
        if (producto.getProveedor() == null || producto.getProveedor().getId() == null) {
            throw new IllegalArgumentException("El proveedor es obligatorio");
        }

        // ✅ Cargar entidades completas desde la BD
        Categoria categoria = categoriaRepository.findById(producto.getCategoria().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        Proveedor proveedor = proveedorRepository.findById(producto.getProveedor().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado"));

        producto.setCategoria(categoria);
        producto.setProveedor(proveedor);

        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(Long id, Producto productoActualizado) {
        Producto productoExistente = obtenerPorId(id);

        validarCategoria(productoActualizado.getCategoria().getId());
        validarProveedor(productoActualizado.getProveedor().getId());

        // ⭐ Actualización correcta con nombres de campos que coinciden con SQL
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setDescripcion(productoActualizado.getDescripcion());
        productoExistente.setPrecio(productoActualizado.getPrecio()); // ⭐ "precio" no "precioUnitario"
        productoExistente.setStock(productoActualizado.getStock());
        productoExistente.setStockMinimo(productoActualizado.getStockMinimo());
        productoExistente.setCategoria(productoActualizado.getCategoria());
        productoExistente.setProveedor(productoActualizado.getProveedor());

        return productoRepository.save(productoExistente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> obtenerPorCategoria(Long categoriaId) {
        validarCategoria(categoriaId);
        return productoRepository.findByCategoria_Id(categoriaId);
    }

    public List<Producto> obtenerPorProveedor(Long proveedorId) {
        validarProveedor(proveedorId);
        return productoRepository.findByProveedor_Id(proveedorId);
    }

    public List<Producto> obtenerProductosConBajoStock() {
        return productoRepository.findProductosConBajoStock();
    }

    @Transactional
    public void actualizarStock(Long id, int nuevaCantidad) {
        Producto producto = obtenerPorId(id);
        producto.setStock(nuevaCantidad);
        productoRepository.save(producto);
    }

    private void validarCategoria(Long categoriaId) {
        if (categoriaId == null || !categoriaRepository.existsById(categoriaId)) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + categoriaId);
        }
    }

    private void validarProveedor(Long proveedorId) {
        if (proveedorId == null || !proveedorRepository.existsById(proveedorId)) {
            throw new ResourceNotFoundException("Proveedor no encontrado con ID: " + proveedorId);
        }
    }
}