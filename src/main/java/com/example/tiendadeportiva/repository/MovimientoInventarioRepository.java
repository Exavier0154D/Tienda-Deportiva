package com.example.tiendadeportiva.repository;

import com.example.tiendadeportiva.model.MovimientoInventario;
import com.example.tiendadeportiva.model.MovimientoInventario.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    // ⭐ CORREGIDO: producto_Id (navegación al objeto)
    List<MovimientoInventario> findByProducto_IdOrderByFechaDesc(Long productoId);

    List<MovimientoInventario> findByTipoMovimientoOrderByFechaDesc(TipoMovimiento tipo);

    @Query("SELECT m FROM MovimientoInventario m WHERE m.fecha >= :inicio AND m.fecha <= :fin ORDER BY m.fecha DESC")
    List<MovimientoInventario> findByFechaBetween(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);

    // ⭐ CORREGIDO: producto_Id
    List<MovimientoInventario> findByProducto_IdAndFechaBetween(Long productoId, LocalDateTime inicio, LocalDateTime fin);
}