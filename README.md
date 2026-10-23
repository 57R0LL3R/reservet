# Reservet

**Español** · [English](README.en.md) · [Русский](README.ru.md)

Proyecto educativo: gestión de mesas y reservas de un restaurante.

Lee también [cómo contribuir](CONTRIBUTING.md) y las
[convenciones de arquitectura](docs/ARQUITECTURA.md). Antes de entregar un cambio,
ejecuta `npm run check` (lint, formato, tipos, pruebas y compilación).

Empieza por [la guía del junior](docs/GUIA_JUNIOR.md). Contiene instalación,
arquitectura, migraciones, ejercicios y criterios de entrega.

## Inicio rápido (PowerShell)

Requisitos: Node.js 22.13 o superior, npm y Docker Desktop abierto con contenedores Linux.

```powershell
cd E:\reservet
npm ci
# Solo la primera vez, si no existe .env:
Copy-Item .env.example .env
npm run db:up
npm run db:migrate
npm run dev
```

Abre **http://localhost:3000** para ver el salón. La interfaz funciona de inmediato
en modo **Demostración**, incluso sin PostgreSQL: permite crear mesas, buscar,
filtrar y cambiar estados. Esos cambios se pierden al recargar.

Selecciona **Mi API local** para probar los endpoints que implemente el junior.
Ese modo muestra errores reales y no recurre a datos de ejemplo.
No se incluye login: queda como ejercicio futuro.

La interfaz está disponible en **español, inglés y ruso**. Cambia el idioma desde
el selector de la cabecera; la preferencia se conserva en el navegador. Las
traducciones están en `public/i18n.js`; los nombres reales introducidos por el
usuario y el contrato de la API no se traducen.

En otra terminal: `Invoke-RestMethod http://localhost:3000/health/db`.

Incluido: servidor, comprobaciones de salud, PostgreSQL en Compose, ejecutor de
migraciones, esquema inicial de mesas e interfaz conectable. Los endpoints de negocio
son ejercicios pendientes. SQS se incorpora en una etapa posterior.

`npm run typecheck` verifica tipos; `npm run build` compila;
`npm start` ejecuta la compilación; `npm run db:down` detiene PostgreSQL
conservando los datos. Las credenciales incluidas son exclusivamente de desarrollo local.
