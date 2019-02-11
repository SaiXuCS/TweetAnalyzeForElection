<?php
    
    $channel= $_GET["channel"];

    $messages= array();
    $conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
    if (mysqli_connect_error()){
        die("Connect to database error：" . mysqli_connect_error());
    }
    $sql= "select * from channel where channelname='$channel'";
    $query_result= mysqli_query($conn, $sql);
    while($result= mysqli_fetch_array($query_result)){
        $messages[]= $result;
    }
    
    echo json_encode($messages);
?>