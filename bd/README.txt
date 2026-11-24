SALUDVIDA - ENTREGA DE BASE DE DATOS
====================================

SGBD requerido: MySQL 8 o superior.
Modelo: relacional, normalizado hasta tercera forma normal (3FN).

ARCHIVOS
--------
1. 01_creacion.sql
   Crea la base de datos saludvida, sus 8 tablas, claves primarias y foráneas,
   índices, restricciones de unicidad y validación del rango horario.

2. 02_datos_prueba.sql
   Inserta datos completamente sintéticos para la demostración. Las cuentas
   usan un hash bcrypt válido y la contraseña de prueba saludvida123.

3. MER_SaludVida.pdf
   Modelo entidad-relación con cardinalidades y claves principales.

ORDEN DE EJECUCIÓN
------------------
mysql -u USUARIO -p < 01_creacion.sql
mysql -u USUARIO -p saludvida < 02_datos_prueba.sql

También se pueden abrir ambos scripts en MySQL Workbench y ejecutarlos en el
orden indicado. El usuario debe contar con permiso para crear bases de datos.

RELACIONES PRINCIPALES
----------------------
- Un usuario corresponde a un paciente o a un médico, según su perfil.
- Una especialidad agrupa a varios médicos.
- Un médico publica muchos horarios disponibles.
- Un paciente realiza reservas; cada horario admite como máximo una reserva.
- Una reserva puede originar una atención clínica.
- Una atención puede contener varias recetas.

INTEGRIDAD Y SEGURIDAD
---------------------
- Las claves foráneas mantienen la integridad referencial.
- Los correos y RUT son únicos.
- horario_id es único en reservas y evita la doble asignación de un bloque.
- Las contraseñas no se almacenan en texto plano.
- Los datos son ficticios y se destinan exclusivamente a pruebas académicas.
