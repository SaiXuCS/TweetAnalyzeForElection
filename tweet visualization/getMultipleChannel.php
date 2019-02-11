<?php
	$channel1= "project-fieldexp";
	$channel2= "project-ipairfac";

	$min="06-11-2017";
	$max="10-29-2017";

	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$response= array();
	$sql= "select * from (select channelname, day, count(*) as number from channel where channelname = '$channel1' group by day UNION select channelname, day, count(*) as number from channel where channelname = '$channel2' group by day) as O order by day";
	$query_result= mysqli_query($conn, $sql);
	while($result= mysqli_fetch_array($query_result)){
		$response[]= $result;
	}
	$return= array();
	$day_channel= array();
	for($i= 0; $i< count($response); $i++){
		$mess= $response[$i];
		$date= $mess["day"];
		$chann= $mess["channelname"];
		if(!isset($day_channel[$date])){
			$day_channel[$date]= count($return);
			$row["date"]= $date;
			$row[$chann]= $mess["number"];
			if($chann== "project-fieldexp"){
				$row["project-ipairfac"]= 0;
			}else if($chann=="project-ipairfac"){
				$row["project-fieldexp"]= 0;
			}
			$return[]= $row;
		}
		else{
			$index= $day_channel[$date];
			$return[$index][$chann]= $mess["number"];
		}

	}
	echo json_encode($return);
?>	