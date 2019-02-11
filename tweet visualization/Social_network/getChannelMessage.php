<?php
	$channel= $_GET["channel"];
	$start= $_GET["start"];
	$end= $_GET["end"];
	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$response= array();
	$sql= "select * from channel where channelname='$channel' and day >= '$start' and day <= '$end'";
	$query_result= mysqli_query($conn, $sql);
	while($result= mysqli_fetch_array($query_result)){
		$response[]= $result;
	}
	echo json_encode($response);
?>