<?php


	ini_set('max_execution_time', 200); //300 seconds = 5 minutes
	function changeDate($seconds){
		return gmdate("m-d-Y", $seconds);
	}
	//$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	$conn = mysqli_connect("localhost","root","","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$channellist= file_get_contents("../channel.json");
	$userlist= file_get_contents("userlist.json");
	$channellist= json_decode($channellist);
	$users= json_decode($userlist);
	$channel_list= array();
	$user_list= array();
	for($i= 0; $i< count($channellist); $i++){
			$channelid= $channellist[$i]->{'id'};
			$channel_list[$channelid]= $channellist[$i]->{'name'};
	}
	for($i= 0; $i< count($users); $i++){
		$userid= $users[$i]->{'id'};
		$user_list[$userid]= $users[$i]->{'name'};
	}
	while ($channel_user_id = current($channel_list)) {
	 		$channel_id= key($channel_list);

		//    $im_username= $user_list[$im_user_id];
		    $ch = curl_init("https://slack.com/api/channels.history");
		    $data = http_build_query([
		        "token" => "xoxp-194788481267-195648927635-214225767461-936ec8e6bb1a377bcc3211c9193d0d46",
		    	"channel" => $channel_id
		    ]);
		    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		    $result = curl_exec($ch);
		    curl_close($ch);
		    $result= json_decode($result);
		    $chatHistory= $result->{'messages'};
		    if(isset($chatHistory)){
			    for($i= 0; $i< count($chatHistory); $i++){
			    	$mess= $chatHistory[$i];
			    	if(isset($mess->{'user'})&&isset($mess->{'text'})&&($mess->{'type'}=="message")){
				    	$sendUser= $mess->{'user'};
				    	$time= changeDate($mess->{'ts'});
				    	$text= $mess->{'text'};
				    	if(isset($user_list[$sendUser])){
					    	$sendUserName= $user_list[$sendUser];
					    	$ChannelName= $channel_user_id;
					    	if(isset($sendUserName)&&isset($ChannelName)){
					    		$sql= "INSERT INTO channel(username, channelname, message, day) VALUES('$sendUserName', '$ChannelName', '$text','$time')";
					    		mysqli_query($conn, $sql);
					    	}
					    }
			    	}
			    }
			}
	    	next($channel_list);
	}
?>