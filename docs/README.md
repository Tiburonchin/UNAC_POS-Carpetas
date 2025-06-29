# Sistema de Gestión de Postulantes - Escuela de Posgrado UNAC

[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4?logo=php)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

Sistema web integral para la gestión del proceso de admisión de la Escuela de Posgrado de la Universidad Nacional del Callao (UNAC). Permite la inscripción en línea de postulantes, carga de documentos, validación de requisitos y seguimiento del estado de la postulación, con notificaciones automáticas vía WhatsApp y correo electrónico.

## 📋 Características Principales

- **Inscripción en Línea**: Formulario de postulación intuitivo y responsivo.
- **Gestión de Documentos**: Subida segura de documentos requeridos.
- **Validación Automática**: Verificación de documentos y requisitos en tiempo real.
- **Notificaciones**: Alertas automáticas por WhatsApp y correo electrónico.
- **Panel de Administración**: Gestión integral de postulantes y documentos.
- **Seguridad**: Protección contra inyecciones SQL y XSS, validación de formularios.
- **Reportes**: Generación de reportes en diferentes formatos.

## 🚀 Requisitos del Sistema

- Servidor web (Apache/Nginx)
- PHP 7.4 o superior
- MySQL 8.0 o superior
- Extensión PDO habilitada
- Extensión OpenSSL habilitada
- Espacio en disco: Mínimo 100MB (dependiendo de los documentos)

## 🛠 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd UNAC_POS-Carpetas
   ```

2. **Configurar la base de datos**
   - Importar el archivo `database/database.sql` en tu servidor MySQL
   - Configurar las credenciales en `config/database.php`

3. **Configurar el entorno**
   - Copiar `.env.example` a `.env`
   - Configurar las variables de entorno necesarias

4. **Permisos**
   ```bash
   chmod -R 755 uploads/
   chmod -R 755 cache/
   ```

5. **Acceso**
   - Acceder a la aplicación mediante el navegador web
   - Credenciales por defecto del administrador (cambiar después del primer inicio):
     - Usuario: admin@unac.edu.pe
     - Contraseña: admin123

## 📂 Estructura del Proyecto

```
UNAC_POS-Carpetas/
├── assets/           # Archivos estáticos (CSS, JS, imágenes)
├── config/           # Archivos de configuración
├── controllers/      # Controladores de la aplicación
├── database/         # Esquemas y migraciones
├── includes/         # Archivos de inclusión
├── models/           # Modelos de datos
├── uploads/          # Documentos subidos por los usuarios
├── views/            # Vistas de la aplicación
├── .gitignore        # Archivos ignorados por Git
└── index.php         # Punto de entrada principal
```

## 🔒 Seguridad

- Todas las contraseñas se almacenan con hash bcrypt
- Protección contra CSRF
- Validación de entrada en todos los formularios
- Headers de seguridad HTTP
- Protección contra inyección SQL

## 📧 Configuración de Correo

Para configurar el envío de correos electrónicos, edita el archivo `config/mail.php` con los datos de tu servidor SMTP.

## 📱 Notificaciones por WhatsApp

El sistema utiliza la API de WhatsApp Business. Configura las credenciales en `config/whatsapp.php`.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, lee nuestras [pautas de contribución](CONTRIBUTING.md) antes de enviar un pull request.

## 📞 Soporte

Para soporte técnico, contacta a:
- Soporte Técnico: earamost@unac.edu.pe
- Teléfono: +51 912 594 832

---

Desarrollado por el Departamento de Tecnologías de la Información - UNAC © 2025
