package com.example.tiendadeportiva.repository;

import com.example.tiendadeportiva.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Busca productos por nombre ignorando mayúsculas/minúsculas
    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // Usamos el guion bajo (_) para indicar a Spring que navegue dentro del objeto Categoria hasta su ID
    List<Producto> findByCategoria_Id(Long categoriaId);

    // Navegación explícita para el objeto Proveedor
    List<Producto> findByProveedor_Id(Long proveedorId);

    // Corregido: Usamos 'p.stock' y 'p.stockMinimo'.
    // Asegúrate de que estos nombres existan EXACTAMENTE así en tu clase Producto.java
    @Query("SELECT p FROM Producto p WHERE p.stock <= p.stockMinimo")
    List<Producto> findProductosConBajoStock();
}