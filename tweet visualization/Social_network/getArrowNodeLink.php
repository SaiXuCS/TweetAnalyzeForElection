<?php
	$start= $_GET["start"];
	$end= $_GET["end"];
	$channel= $_GET['channel'];
	//$type=$_GET["type"];

	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$sql= "select username, message, day from channel where channelname='$channel' and day >= '$start' and day <= '$end'";
	$result= mysqli_query($conn, $sql);
	$allResponse= array();
	if(mysqli_num_rows($result)>0){
		while($query_result= mysqli_fetch_array($result, MYSQLI_ASSOC)){
			$allResponse[]= $query_result;
		}
	}


	$sql= "select username, count(*) as number from channel where channelname='$channel' and day >= '$start' and day <= '$end' group by username";
	$userNumber= mysqli_query($conn, $sql);
	$nodes= array();
	$messageBetween= array();
	$channelUserName= array();
	while($query_result= mysqli_fetch_array($userNumber, MYSQLI_ASSOC)){
	
		$name= $query_result['username'];
		$number=(int)$query_result['number'];
		$na= array();
		$na['name']=$name;
		$na['weight']= (int)$number;
		$nodes[]=$na;
		$channelUserName[]= $query_result['username'];
	}

	$userNameAndUserId= file_get_contents("userlist.json");
	$users= json_decode($userNameAndUserId);
	$userName_userID= array();
	for($i= 0; $i< count($users); $i++){
		$userid= $users[$i]->{'id'};
		$userName_userID[$userid]= $users[$i]->{'name'};
	}

	
	$weight= array();
	
	
	$lastSender= "";
	$repeatedM= "";
	$lastreceiver= "";

	for($i= 0; $i< count($allResponse);$i++){
		$message= $allResponse[$i]["message"];
		$day= $allResponse[$i]["day"];
		$sender= $allResponse[$i]['username'];
		if(empty($lastSender)){
			$lastSender= $sender;
			continue;
		}
		$pos= strpos($message, '@');
		if($pos!=0){//have @
			$receiverID= substr($message, $pos+1, 9);
			if(isset($userName_userID[$receiverID])){
				$receiver= $userName_userID[$receiverID];//get receiver username
				$mmm= array();
				$mmm["sender"]= $sender;
				$mmm["receiver"]= $receiver;
				$mmm["message"]= $message;
				$mmm["day"]= $day;
				$messageBetween[]= $mmm;

				$repeatedM= $sender." ".$receiver;				
				if(isset($weight[$repeatedM])){
					$weight[$repeatedM]+=1;
				
				}else if(!isset($weight[$repeatedM])){
					$weight[$repeatedM]= 1;
				}
				
			}
		}
		else{
			if($lastSender!= $sender){
				$mmm= array();
				$mmm["sender"]= $sender;
				$mmm["receiver"]= $lastSender;
				$mmm["message"]= $message;
				$mmm["day"]= $day;
				$messageBetween[]= $mmm;

				$lastreceiver= $lastSender;
				$repeatedM= $sender." ".$lastSender;
				if(isset($weight[$repeatedM])){
					$weight[$repeatedM]+=1;
				}else if(!isset($weight[$repeatedM])){
					$weight[$repeatedM]= 1;
				}
			}
			else if($lastSender== $sender){

				$mmm= array();
				$mmm["sender"]= $sender;
				$mmm["receiver"]= $lastreceiver;
				$mmm["message"]= $message;
				$mmm["day"]= $day;
				$messageBetween[]= $mmm;

				$repeatedM= $sender." ".$lastreceiver;

				if(isset($weight[$repeatedM])){
					$weight[$repeatedM]+=1;
				}
				else{
					$weight[$repeatedM]=1;
				}
			}
		}
		$lastSender= $sender;
	}
	//}
	$links= array();
	while ($weightNumber = current($weight)) {
		$talkTo= key($weight);
		$users= explode(" ", $talkTo);
		$send= $users[0];
		$rece= $users[1];
		$index_s= array_search($send, $channelUserName);
		$index_r= array_search($rece, $channelUserName);
		$li= array();
		if($index_r&& $index_s){
			//echo $send.$index_s."\n".$rece.$index_r."\n".$weightNumber."\n\n";
			$li['source']= $index_s;
			$li['target']= $index_r;
			$li['weight']= $weightNumber;
			$links[]= $li;
		}
		next($weight);
	}
	$res= array();
	$res['nodes']= $nodes;
	$res['links']= $links;
	$res['messages']= $messageBetween;
	echo json_encode($res);
?>