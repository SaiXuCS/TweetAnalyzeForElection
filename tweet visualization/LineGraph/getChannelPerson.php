<?php
	$channelName= $_GET["channel"];
	$userName= $_GET['username'];
	include("../DB/DB.php");
	$sql= "select  user, count(*) as number, day from ".$channelName." where user='$userName' group by day";
	$query_result= mysqli_query($conn, $sql);
	$response= array();
	while($result= mysqli_fetch_array($query_result, MYSQLI_ASSOC)){
		$response[]= $result;
	}
	echo json_encode($response);
?>