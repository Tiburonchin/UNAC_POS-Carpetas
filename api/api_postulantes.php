<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'form_postulantes.php'; // Solo funciones y carga de datos

$action = $_POST['action'] ?? $_GET['action'] ?? '';

try {
    switch ($action) {
        // Buscar postulante por DNI y programa
        case 'buscar':
            $dni = trim($_POST['dni'] ?? '');
            $programa = trim($_POST['programa'] ?? '');
            if ($dni === '' || $programa === '') {
                throw new Exception('Datos incompletos');
            }
            foreach ($inscripciones as $fila) {
                if (isset($fila[2], $fila[7]) && $fila[2] === $dni && $fila[7] === $programa) {
                    // Buscar el token en la hoja de registros
                    $token = '';
                    foreach ($registros as $reg) {
                        if (isset($reg[1], $reg[5]) && $reg[1] === $dni) {
                            $token = $reg[5];
                            break;
                        }
                    }
                    echo json_encode([
                        'encontrado' => true,
                        'dni' => $fila[2],
                        'nombres' => $fila[3] ?? '',
                        'apellidos' => $fila[4] ?? '',
                        'correo' => $fila[1] ?? '',
                        'facultad' => $fila[5] ?? '',
                        'programa' => $fila[7] ?? '',
                    ]);
                    exit;
                }
            }
            echo json_encode(['encontrado' => false, 'mensaje' => 'No se encontró el postulante.']);
            exit;

        // Consultar estado por token
        case 'consultar_token':
            $token = trim($_POST['token'] ?? '');
            if ($token === '') {
                throw new Exception('Por favor ingresa un token.');
            }
            foreach ($registros as $fila) {
                if (isset($fila[5]) && $fila[5] === $token) {
                    echo json_encode([
                        'encontrado' => true,
                        'fecha' => $fila[0] ?? '',
                        'dni' => $fila[1] ?? '',
                        'nombre' => $fila[2] ?? '',
                        'correo' => $fila[3] ?? '',
                        'carpeta' => $fila[4] ?? '#',
                        'estado' => $fila[6] ?? 'Pendiente',
                        'mensaje_estado' => $fila[7] ?? ''
                    ]);
                    exit;
                }
            }
            echo json_encode(['encontrado' => false, 'mensaje' => 'No se encontró el token ingresado.']);
            exit;

        // Subida de archivos (ejemplo, si lo implementas por AJAX)
        case 'subir_archivos':
            $dni = trim($_POST['dni'] ?? '');
            $nombre = trim($_POST['nombre'] ?? '');
            $correo = trim($_POST['correo'] ?? '');
            $pdf = $_FILES['archivoPdf'] ?? null;
            $img = $_FILES['imagen'] ?? null;
            $facultad = trim($_POST['facultad'] ?? '');   // <-- AGREGA ESTA LÍNEA
            $programa = trim($_POST['programa'] ?? '');   // <-- Y ESTA LÍNEA
            $recaptcha = $_POST['g-recaptcha-response'] ?? '';

            // Validar reCAPTCHA
            if (!$recaptcha) {
                echo json_encode(['ok' => false, 'mensaje' => 'Por favor completa el captcha.']);
                exit;
            }
            $secret = '6Lc6ZGorAAAAAHoajZuOGiZyCMTcM8gGA7IRfxrV';
            $verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secret&response=$recaptcha");
            $captcha_success = json_decode($verify);

            if (empty($captcha_success->success) || !$captcha_success->success) {
                echo json_encode(['ok' => false, 'mensaje' => 'Captcha inválido, inténtalo de nuevo.']);
                exit;
            }

            // Validar campos
            if (!$dni || !$nombre || !$correo || !$pdf || !$img || !$facultad || !$programa) {
                echo json_encode(['ok' => false, 'mensaje' => 'Faltan datos o archivos.']);
                exit;
            }

            // 1. Busca o crea la carpeta de la facultad dentro de tu carpeta raíz
            $facultadCarpetaNombre = $facultad . ' - CARPETA DE POSTULANTES';
            $facultadFolderId = find_or_create_folder($facultadCarpetaNombre, $access_token, $folderId);

            // 2. Busca o crea la carpeta del programa dentro de la facultad
            $programaFolderId = find_or_create_folder($programa, $access_token, $facultadFolderId);

            // 3. Crea la carpeta del postulante dentro del programa
            $carpetaNombre = $dni . '_' . str_replace(' ', '_', $nombre);
            $carpetaId = create_folder($carpetaNombre, $access_token, $programaFolderId);

            // 4. Sube los archivos
            upload_file_to_drive($pdf['tmp_name'], $pdf['name'], $pdf['type'], $access_token, $carpetaId);
            upload_file_to_drive($img['tmp_name'], $img['name'], $img['type'], $access_token, $carpetaId);

            // 5. Registrar en la hoja
            $token = bin2hex(random_bytes(6));
            $registro = [
                date('Y-m-d H:i:s'),
                $dni,
                $nombre,
                $correo,
                "https://drive.google.com/drive/folders/$carpetaId",
                $token
            ];
            add_row_to_sheet($access_token, $spreadsheetId, $registro);

            echo json_encode([
                'ok' => true,
                'mensaje' => "✅ ¡Archivos subidos y registro guardado! Tu token es: <b>$token</b>"
            ]);
            exit;

        default:
            throw new Exception('Acción no válida');
    }
} catch (Exception $e) {
    echo json_encode(['error' => true, 'mensaje' => $e->getMessage()]);
    exit;
}
?>


<!-- Formulario principal -->
<?php include 'form_postulante_dni.php'; ?>

<!-- Formulario adicional para consultar el estado por token -->
<h2>🔎 Consultar estado por token de seguimiento:</h2>
<form method="post" style="margin-top:20px;">
    <input type="text" name="token_seguimiento" placeholder="Ingresa tu token..." required>
    <button type="submit" name="consultar_token">Consultar</button>
</form>

<?= $datos_token ?>