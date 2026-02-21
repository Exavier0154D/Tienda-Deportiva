package com.example.tiendadeportiva.service;

import com.example.tiendadeportiva.exception.ResourceNotFoundException;
import com.example.tiendadeportiva.exception.StockInsuficienteException;
import com.example.tiendadeportiva.model.MovimientoInventario;
import com.example.tiendadeportiva.model.MovimientoInventario.TipoMovimiento;
import com.example.tiendadeportiva.model.Producto;
import com.example.tiendadeportiva.repository.MovimientoInventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoService productoService;

    public List<MovimientoInventario> obtenerTodos() {
        return movimientoRepository.findAll();
    }

    public MovimientoInventario obtenerPorId(Long id) {
        return movimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con ID: " + id));
    }

    @Transactional
    public MovimientoInventario registrarEntrada(MovimientoInventario movimiento) {
        if (movimiento.getTipoMovimiento() != TipoMovimiento.ENTRADA) {
            throw new IllegalArgumentException("Este método solo permite registrar ENTRADAS");
        }

        Producto producto = productoService.obtenerPorId(movimiento.getProducto().getId());

        // Actualizar y guardar el stock
        int nuevoStock = producto.getStock() + movimiento.getCantidad();
        productoService.actualizarStock(producto.getId(), nuevoStock);

        movimiento.setProducto(producto);
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

    @Transactional
    public MovimientoInventario registrarSalida(MovimientoInventario movimiento) {
        if (movimiento.getTipoMovimiento() != TipoMovimiento.SALIDA) {
            throw new IllegalArgumentException("Este método solo permite registrar SALIDAS");
        }

        Producto producto = productoService.obtenerPorId(movimiento.getProducto().getId());

        if (producto.getStock() < movimiento.getCantidad()) {
            throw new StockInsuficienteException(
                    String.format("Stock insuficiente para '%s'. Stock actual: %d",
                            producto.getNombre(), producto.getStock())
            );
        }

        // Actualizar y guardar el stock
        int nuevoStock = producto.getStock() - movimiento.getCantidad();
        productoService.actualizarStock(producto.getId(), nuevoStock);

        movimiento.setProducto(producto);
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

    public List<MovimientoInventario> obtenerPorProducto(Long productoId) {
        return movimientoRepository.findByProducto_IdOrderByFechaDesc(productoId);
    }

    public List<MovimientoInventario> obtenerPorTipo(TipoMovimiento tipo) {
        return movimientoRepository.findByTipoMovimientoOrderByFechaDesc(tipo);
    }

    public List<MovimientoInventario> obtenerPorRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
        if (inicio.isAfter(fin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        return movimientoRepository.findByFechaBetween(inicio, fin);
    }

    public List<MovimientoInventario> obtenerPorProductoYFechas(Long productoId, LocalDateTime inicio, LocalDateTime fin) {
        if (inicio.isAfter(fin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }
        return movimientoRepository.findByProducto_IdAndFechaBetween(productoId, inicio, fin);
    }
}