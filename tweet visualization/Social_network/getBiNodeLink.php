<?php
	//$start= $_GET["start"];
	//$end= $_GET["end"];
	//$channel= $_GET['channel'];
	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$sql= "select username, channelname, count(*) as number from channel group by concat(username,'-',channelname) limit 2000";
	$result= mysqli_query($conn, $sql);
	$response= array();
	if(mysqli_num_rows($result)>0){
		while($query_result= mysqli_fetch_array($result, MYSQLI_ASSOC)){
			$response[]= $query_result;
		}
	}
	$node= array();
	$nodeC= array();
	$links= array();
	for($i= 0; $i< count($response); $i++){
		$sendName= $response[$i]['username'];
		$channelName= $response[$i]['channelname'];
		if(!in_array($sendName, $node)){
			$node[]= $sendName;
			
		}
		if(!in_array($channelName, $nodeC)){
			$nodeC[]= $channelName;
		}
		$li= array();
		$li['source']= $sendName;
		$li['target']= $channelName;
		$li['weight']= $response[$i]['number'];
		$links[]= $li;
	}
	
	for($i= 0; $i< count($node); $i++){
		$na= array();
		$na['name']=$node[$i];
		$na['group']='tuple';
		$nodes[]=$na;
	}
	for($i= 0; $i< count($nodeC); $i++){
		$na= array();
		$na['name']=$nodeC[$i];
		$na['group']='pattern';
		$nodes[]=$na;
	}
	$number= count($node);
	for($i= 0; $i< count($links); $i++){
		$link= $links[$i];
		$send= $link['source'];
		$rece= $link['target'];
		$index_s= array_search($send, $node);
		$index_r= array_search($rece, $nodeC)+ $number;
		$links[$i]['source']= $index_s;
		$links[$i]['target']= $index_r;
	}
	$res= array();
	$res['nodes']= $nodes;
	$res['links']= $links;
	echo json_encode($res);
	
?>