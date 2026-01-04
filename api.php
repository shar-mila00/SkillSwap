<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = 'localhost';
$db   = 'skillswap_pro';
$user = 'root';
$pass = ''; // Leave empty for XAMPP default
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

switch ($action) {
    case 'init':
        $users = $pdo->query("SELECT * FROM users")->fetchAll();
        foreach ($users as &$u) {
            $stmt = $pdo->prepare("SELECT s.* FROM skills s JOIN user_skills_offered uo ON s.id = uo.skill_id WHERE uo.user_id = ?");
            $stmt->execute([$u['id']]);
            $u['skillsOffered'] = $stmt->fetchAll();

            $stmt = $pdo->prepare("SELECT s.* FROM skills s JOIN user_skills_requested ur ON s.id = ur.skill_id WHERE ur.user_id = ?");
            $stmt->execute([$u['id']]);
            $u['skillsRequested'] = $stmt->fetchAll();
        }
        echo json_encode([
            'users' => $users,
            'skills' => $pdo->query("SELECT * FROM skills")->fetchAll(),
            'sessions' => $pdo->query("SELECT * FROM sessions")->fetchAll(),
            'messages' => $pdo->query("SELECT * FROM messages")->fetchAll()
        ]);
        break;

    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
        $stmt->execute([$data['email'], $data['password']]);
        $user = $stmt->fetch();
        if ($user) {
            // Fetch skills for this user
            $stmt = $pdo->prepare("SELECT s.* FROM skills s JOIN user_skills_offered uo ON s.id = uo.skill_id WHERE uo.user_id = ?");
            $stmt->execute([$user['id']]);
            $user['skillsOffered'] = $stmt->fetchAll();
            $stmt = $pdo->prepare("SELECT s.* FROM skills s JOIN user_skills_requested ur ON s.id = ur.skill_id WHERE ur.user_id = ?");
            $stmt->execute([$user['id']]);
            $user['skillsRequested'] = $stmt->fetchAll();
            echo json_encode($user);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
        break;

    case 'register':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO users (id, name, email, password, bio, role) VALUES (?, ?, ?, ?, ?, 'user')");

        $stmt->execute([$data['id'],$data['name'],$data['email'],$data['password'],$data['bio']]);
        echo json_encode($data);
        break;
    
    case 'save_review':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare(
            "INSERT INTO reviews (id, sessionId, fromUserId, toUserId, rating, comment, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['id'],
            $data['sessionId'],
            $data['fromUserId'],
            $data['toUserId'],
            $data['rating'],
            $data['comment'],
            $data['timestamp']
        ]);
        echo json_encode(['success' => true]);
        break;
    
    case 'update_profile':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare(
            "UPDATE users SET name=?, bio=?, location=? WHERE id=?"
        );
        $stmt->execute([
            $data['name'],
            $data['bio'],
            $data['location'],
            $data['id']
        ]);
        echo json_encode(['success' => true]);
        break;

    case 'add_skill':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO skills (id, name) VALUES (?, ?)");
        $stmt->execute([$data['id'], $data['name']]);
        echo json_encode(['success' => true]);
        break;

    case 'save_session':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO sessions (id, requesterId, providerId, skillId, date, time, endTime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['id'], $data['requesterId'], $data['providerId'], $data['skillId'], $data['date'], $data['time'], $data['endTime'], $data['status']]);
        echo json_encode(['success' => true]);
        break;

    case 'send_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO messages (id, sessionId, senderId, text, timestamp) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['id'], $data['sessionId'], $data['senderId'], $data['text'], $data['timestamp']]);
        echo json_encode(['success' => true]);
        break;

    case 'update_session_status':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("UPDATE sessions SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}