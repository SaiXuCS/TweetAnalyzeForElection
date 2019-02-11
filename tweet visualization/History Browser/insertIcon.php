<?php
	$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
	if (mysqli_connect_error()){
	    die("Connect to database error：" . mysqli_connect_error());
	}
	mysqli_query($conn, "set character set 'utf8'");
	mysqli_query($conn, "set names 'utf8'");
		//    $im_username= $user_list[$im_user_id];
    $ch = curl_init("https://slack.com/api/users.list");
    $data = http_build_query([
        "token" => "xoxp-194788481267-195648927635-214225767461-936ec8e6bb1a377bcc3211c9193d0d46"
    ]);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $result = curl_exec($ch);
    curl_close($ch);
    $result= json_decode($result);
    $chatHistory= $result->{'members'};
    if(isset($chatHistory)){
	    for($i= 0; $i< count($chatHistory); $i++){
	    	$mess= $chatHistory[$i];
	    	$url= $mess->{'profile'}->{'image_512'};
	    	$name= $mess->{'name'};
	    	$sql= "INSERT INTO icon(username, url) VALUES('$name', '$url')";
    		mysqli_query($conn, $sql);			    				   	
	    }
	}
?>