package com.example.tiendadeportiva.service;

import com.example.tiendadeportiva.exception.ResourceNotFoundException;
import com.example.tiendadeportiva.model.Proveedor;
import com.example.tiendadeportiva.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public List<Proveedor> obtenerTodos() {
        return proveedorRepository.findAll();
    }

    public Proveedor obtenerPorId(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
    }

    @Transactional
    public Proveedor crear(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public Proveedor actualizar(Long id, Proveedor proveedorActualizado) {
        Proveedor proveedorExistente = obtenerPorId(id);

        proveedorActualizado.setId(id);
        proveedorActualizado.setFechaCreacion(proveedorExistente.getFechaCreacion());

        return proveedorRepository.save(proveedorActualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!proveedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Proveedor no encontrado con ID: " + id);
        }
        proveedorRepository.deleteById(id);
    }
}