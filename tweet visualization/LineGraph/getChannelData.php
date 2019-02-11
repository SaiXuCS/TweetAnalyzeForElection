<?php
	$channelName= $_GET["channel"];
	include("../DB/DB.php");
	$sql= "select count(*) as number, day from ".$channelName." group by day";
	$query_result= mysqli_query($conn, $sql);
	$response= array();
	while($result= mysqli_fetch_array($query_result, MYSQLI_ASSOC)){
		$response[]= $result;
	}
	echo json_encode($response);
?>