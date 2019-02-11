<?php


	ini_set('max_execution_time', 60); //300 seconds = 5 minutes
	function changeDate($seconds){
		return gmdate("m-d-Y", $seconds);
	}
	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	$imlist= file_get_contents("imlist.json");
	$userlist= file_get_contents("userlist.json");
	$im= json_decode($imlist)->{'ims'};
	$users= json_decode($userlist);
	$im_list= array();
	$user_list= array();
	for($i= 0; $i< count($im); $i++){
		if($im[$i]->{'user'}!= 'USLACKBOT'){
			$imid= $im[$i]->{'id'};
			$im_list[$imid]= $im[$i]->{'user'};
		}
	}
	for($i= 0; $i< count($users); $i++){
		$userid= $users[$i]->{'id'};
		$user_list[$userid]= $users[$i]->{'name'};
	}

	
	while ($im_user_id = current($im_list)) {
	    $im_id= key($im_list);
	    if(isset($user_list[$im_user_id])){
		    $im_username= $user_list[$im_user_id];
		    $ch = curl_init("https://slack.com/api/im.history");
		    $data = http_build_query([
		        "token" => "xoxp-194788481267-195648927635-214225767461-936ec8e6bb1a377bcc3211c9193d0d46",
		    	"channel" => $im_id
		    ]);
		    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
		    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
		    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		    $result = curl_exec($ch);
		    curl_close($ch);
		    $result= json_decode($result);
		    $chatHistory= $result->{'messages'};
		    for($i= 0; $i< count($chatHistory); $i++){
		    	$mess= $chatHistory[$i];
		    	if(isset($mess->{'user'})&&isset($mess->{'ts'})&&isset($mess->{'text'})&&($mess->{'type'}=="message")){
			    	$sendUser= $mess->{'user'};
			    	$time= changeDate($mess->{'ts'});
			    	$text= $mess->{'text'};
			    	$sendUserName= $user_list[$sendUser];
			    	$imOwnerName= $user_list[$im_user_id];
			    	$sql= "INSERT INTO chat(sendUser, imId, message, day, imOwnerId,sendUserName, imOwnerName) VALUES('$sendUser', '$im_id', '$text','$time','$im_user_id','$sendUserName','$imOwnerName')";
			    	mysqli_query($conn, $sql);
		    	}
		    }
	    	next($im_list);
	    }
	}
?>