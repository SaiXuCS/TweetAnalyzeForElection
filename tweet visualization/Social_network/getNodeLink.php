<?php
	$start= $_GET["start"];
	$end= $_GET["end"];
	$channel= $_GET['channel'];
	$type=$_GET["type"];

	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$sql= "select username, message from channel where channelname='$channel' and day >= '$start' and day <= '$end'";
	$result= mysqli_query($conn, $sql);
	$allResponse= array();
	if(mysqli_num_rows($result)>0){
		while($query_result= mysqli_fetch_array($result, MYSQLI_ASSOC)){
			$allResponse[]= $query_result;
		}
	}
	$sql= "select username from channel where channelname='$channel' and day >= '$start' and day <= '$end' group by username";
	$resultUser= mysqli_query($conn, $sql);
	$nodes= array();
	$channelUserName= array();
	if(mysqli_num_rows($resultUser)>0){
		while($query_result= mysqli_fetch_array($resultUser, MYSQLI_ASSOC)){
			$channelUserName[]= $query_result['username'];

			$na= array();
			$na['name']=$query_result['username'];
			$nodes[]=$na;
		}
	}
	$userNameAndUserId= file_get_contents("userlist.json");
	$users= json_decode($userNameAndUserId);
	$userName_userID= array();
	for($i= 0; $i< count($users); $i++){
		$userid= $users[$i]->{'id'};
		$userName_userID[$userid]= $users[$i]->{'name'};
	}

	
	$weight= array();
	if($type=='explicit'){
		for($i= 0; $i< count($allResponse);$i++){
			$message= $allResponse[$i]["message"];
			$sender= $allResponse[$i]['username'];
			$pos= strpos($message, '@');
			if($pos!=0){//have @
				$receiverID= substr($message, $pos+1, 9);
				if(isset($userName_userID[$receiverID])){
					$receiver= $userName_userID[$receiverID];//get receiver username
					if($sender!= $receiver){
						$combine1= $sender." ".$receiver;
						$combine2= $receiver." ".$sender;
						if(!isset($weight[$combine1])&&!isset($weight[$combine2])){
							$weight[$combine1]= 1;
						}
						else{
							if(isset($weight[$combine1])){
								$weight[$combine1]+=1;
							}
							else if(isset($weight[$combine2])){
								$weight[$combine2]+=1;
							}
						}
					}
				}
			}
		}
	}
	else if($type=="implicit"){
		$lastSender= "";
		$repeatedM= 0;
		for($i= 0; $i< count($allResponse);$i++){
			$message= $allResponse[$i]["message"];
			$sender= $allResponse[$i]['username'];
			if(empty($lastSender)){
				$lastSender= $sender;
			}
			$pos= strpos($message, '@');
			if($pos!=0){//have @
				$receiverID= substr($message, $pos+1, 9);
				if(isset($userName_userID[$receiverID])){
					$receiver= $userName_userID[$receiverID];//get receiver username
					if($sender!= $receiver){
						$combine1= $sender." ".$receiver;
						$combine2= $receiver." ".$sender;
						if(!isset($weight[$combine1])&&!isset($weight[$combine2])){
							$weight[$combine1]= 1;
						}
						else{
							if(isset($weight[$combine1])){
								$weight[$combine1]+=1;
							}
							else if(isset($weight[$combine2])){
								$weight[$combine2]+=1;
							}
						}
					}
				}
			}
			else{
				if($lastSender== $sender){
					$repeatedM+=1;
				}
				else{
					$combine1= $sender." ".$lastSender;
					$combine2= $lastSender." ".$sender;
					if(!isset($weight[$combine1])&&!isset($weight[$combine2])){
						$weight[$combine1]= 1+$repeatedM;
						$repeatedM= 0;
					}
					else{
						if(isset($weight[$combine1])){
							$weight[$combine1]+=1;
							$weight[$combine1]+=$repeatedM;
							$repeatedM= 0;
						}
						else if(isset($weight[$combine2])){
							$weight[$combine2]+=1;
							$weight[$combine2]+=$repeatedM;
							$repeatedM= 0;
						}
					}
				}
			}
		}
	}
	$links= array();
	while ($weightNumber = current($weight)) {
		$talkTo= key($weight);
		$users= explode(" ", $talkTo);
		$send= $users[0];
		$rece= $users[1];
		$index_s= array_search($send, $channelUserName);
		$index_r= array_search($rece, $channelUserName);
		$li= array();
		if($index_s&&$index_r){
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
	echo json_encode($res);
	

?>