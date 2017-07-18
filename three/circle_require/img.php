<?php
$img = (isset($_GET['img']) && $_GET['img'] != '' ) ? $_GET['img'] : 'lib/img/ninja.png';

$ext = substr($img, -3);
switch ($ext) {
    case 'jpg':
    default:
        header('Content-Type: image/jpeg');
        break;
    case 'png':
    default:
        header('Content-Type: image/png');
        break;
    case 'gif':
    default:
        header('Content-Type: image/gif');
        break;
}
echo file_get_contents($img);
?>