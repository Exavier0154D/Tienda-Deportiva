package com.example.tiendadeportiva.controller;

import com.example.tiendadeportiva.model.MovimientoInventario;
import com.example.tiendadeportiva.model.MovimientoInventario.TipoMovimiento;
import com.example.tiendadeportiva.service.MovimientoInventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimientoInventarioController {

    private final MovimientoInventarioService movimientoService;

    @GetMapping
    public ResponseEntity<List<MovimientoInventario>> obtenerTodos() {
        return ResponseEntity.ok(movimientoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoInventario> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoService.obtenerPorId(id));
    }

    @PostMapping("/entrada")
    public ResponseEntity<MovimientoInventario> registrarEntrada(
            @Valid @RequestBody MovimientoInventario movimiento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoService.registrarEntrada(movimiento));
    }

    @PostMapping("/salida")
    public ResponseEntity<MovimientoInventario> registrarSalida(
            @Valid @RequestBody MovimientoInventario movimiento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movimientoService.registrarSalida(movimiento));
    }

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MovimientoInventario>> obtenerPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(movimientoService.obtenerPorProducto(productoId));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<MovimientoInventario>> obtenerPorTipo(@PathVariable TipoMovimiento tipo) {
        return ResponseEntity.ok(movimientoService.obtenerPorTipo(tipo));
    }

    @GetMapping("/rango-fechas") // Cambiado para evitar conflictos de ruta
    public ResponseEntity<List<MovimientoInventario>> obtenerPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(movimientoService.obtenerPorRangoFechas(inicio, fin));
    }

    @GetMapping("/producto/{productoId}/fechas")
    public ResponseEntity<List<MovimientoInventario>> obtenerPorProductoYFechas(
            @PathVariable Long productoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(movimientoService.obtenerPorProductoYFechas(productoId, inicio, fin));
    }
}