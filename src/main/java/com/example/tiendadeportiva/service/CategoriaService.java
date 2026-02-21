package com.example.tiendadeportiva.service;

import com.example.tiendadeportiva.exception.ResourceNotFoundException;
import com.example.tiendadeportiva.model.Categoria;
import com.example.tiendadeportiva.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<Categoria> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    public Categoria obtenerPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
    }

    @Transactional
    public Categoria crear(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Categoria actualizar(Long id, Categoria categoriaRequest) {
        // 1. Buscamos la categoría real en la base de datos
        Categoria categoriaExistente = obtenerPorId(id);

        // 2. Actualizamos solo los campos que vienen en el request
        // Esto evita que perdamos la 'fechaCreacion' o que el ID se desconfigure
        categoriaExistente.setNombre(categoriaRequest.getNombre());
        categoriaExistente.setDescripcion(categoriaRequest.getDescripcion());

        // No es necesario setear el ID ni la fecha de creación,
        // ya están en 'categoriaExistente'.

        return categoriaRepository.save(categoriaExistente);
    }

    @Transactional
    public void eliminar(Long id) {
        // Validación de seguridad para evitar errores de integridad referencial
        if (!categoriaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoría no encontrada con ID: " + id);
        }

        try {
            categoriaRepository.deleteById(id);
        } catch (Exception e) {
            // Esto es común si intentas borrar una categoría que tiene productos asociados
            throw new IllegalStateException("No se puede eliminar la categoría porque tiene productos vinculados.");
        }
    }
}