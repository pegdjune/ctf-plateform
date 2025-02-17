<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Visualisation des Logs (Vulnérable)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        .log-viewer { border: 1px solid #ccc; padding: 10px; margin-top: 20px; }
        pre { background-color: #f9f9f9; padding: 10px; border: 1px solid #eee; }
    </style>
</head>
<body>
    <h1>Visualisation des Logs (Vulnérable)</h1>

    <h2>Fichiers logs disponibles :</h2>
    <ul>
        <?php
        $logDir = __DIR__ . '/logs/';
        $files = scandir($logDir);

        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                echo "<li>$file</li>";
            }
        }
        ?>
    </ul>

    <form method="post">
        <label for="filename">Entrez le nom du fichier log :</label>
        <input type="text" name="filename" id="filename" placeholder="Nom du fichier">
        <input type="submit" value="Afficher">
    </form>

    <div class="log-viewer">
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['filename'])) {
            $filename = $_POST['filename']; // Vulnérabilité d'injection
            $output = shell_exec("cat $logDir$filename"); // Pas d'échappement ni de validation
            echo "<h2>Contenu de $filename :</h2>";
            echo '<pre>' . htmlspecialchars($output) . '</pre>';
        }
        ?>
    </div>
</body>
</html>