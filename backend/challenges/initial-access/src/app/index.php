<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if(isset($_POST['submit'])) {
    $file = $_POST['file'];
    if(isset($file)) {
        // Vulnérabilité LFI intentionnelle
        include($file);
    }
}
?>
<html>
<head>
    <title>Document Viewer</title>
</head>
<body>
    <h1>Secure Document Viewer</h1>
    <form method="POST">
        <input type="text" name="file" placeholder="Enter document path">
        <input type="submit" name="submit" value="View">
    </form>
    <!-- Debug info -->
    <div>
    <?php
        echo "Request Method: " . $_SERVER['REQUEST_METHOD'] . "<br>";
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            echo "POST data: <pre>";
            print_r($_POST);
            echo "</pre>";
        }
    ?>
    </div>
</body>
</html>