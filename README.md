\# Servicio de Base de Datos - Sistema de Inventario Distribuido



\## Descripción del Servicio



Este servicio corresponde a la Máquina 2 del sistema distribuido.



Se encarga de gestionar la base de datos del sistema de inventario, almacenando la información relacionada con:



\- Productos

\- Categorías

\- Proveedores

\- Movimientos de inventario



La base de datos está implementada en PostgreSQL y se ejecuta mediante Docker.



---



\## Arquitectura del Sistema



El sistema está compuesto por tres servicios distribuidos:



\[App Web - Máquina 1]  

&nbsp;       │  

&nbsp;       │ Conexión TCP (Puerto 5433)  

&nbsp;       ▼  

\[Base de Datos - Máquina 2 (PostgreSQL)]  

&nbsp;       │  

&nbsp;       │ Consultas SQL  

&nbsp;       ▼  

\[Servicio de Reportes - Máquina 3]



La base de datos actúa como núcleo central del sistema.



---



\## Modelo de Base de Datos



Tablas principales:



\### productos

\- id (PK)

\- nombre

\- descripcion

\- precio

\- stock

\- stock\_minimo

\- categoria\_id (FK)



\### categorias

\- id (PK)

\- nombre



\### proveedores

\- id (PK)

\- nombre

\- contacto



\### movimientos\_inventario

\- id (PK)

\- producto\_id (FK)

\- proveedor\_id (FK)

\- tipo\_movimiento (entrada | salida)

\- cantidad

\- motivo

\- observacion

\- fecha

\- fecha\_creacion



Relaciones:



\- Un producto pertenece a una categoría

\- Un movimiento pertenece a un producto

\- Un movimiento puede estar asociado a un proveedor



---



\## Tecnologías Utilizadas



\- PostgreSQL 15

\- Docker

\- Docker Compose



---



\## Instrucciones de Despliegue



\### Clonar el repositorio



```bash

git clone https://github.com/USUARIO/NOMBRE\_REPO.git

cd base-datos

