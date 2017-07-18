<?php
header('Access-Control-Allow-Origin: *');
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Three.js webgl | Circle</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		
		<link href='http://fonts.googleapis.com/css?family=Roboto+Condensed:400,700' rel='stylesheet' type='text/css'>
		<link href='http://fonts.googleapis.com/css?family=Monda:400,700' rel='stylesheet' type='text/css'>
		<link href="lib/css/screen.css" rel="stylesheet">
        
        <script data-main="js/main" src="js/libs/require/require.js"></script>
        <script src="https://apis.google.com/js/client.js?onload=googleApiClientReady"></script>
	</head>
	<body id="body">
		<div id="scroll">
				<div id="trail">
					<div id="buttons"></div>
			</div>
		</div>
		
		<div class="sidebar">
			<div class="bio section">
				<h2>Bio</h2>
				<div class="content"></div>
			</div>
			<div class="video section">
				<h2>Video</h2>
				<div class="content"></div>
			</div>
		</div>

		<div id="container"></div>
		<div id="background"></div>
		
		<div class="templates">
			<div class="video">
				<div class="title">Kutmuziek</div>
				<img src="http://i.ytimg.com/vi/RBumgq5yVrA/hqdefault.jpg" alt="" />
			</div>

			<img src="" id="artist_image" />
		</div>


	</body>
</html>
