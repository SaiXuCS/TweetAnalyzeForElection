<?php
$conn = mysqli_connect("47.90.245.161","xusai@localhost","199499","slack_network");
if (mysqli_connect_error()){
    die("Connect to database error：" . mysqli_connect_error());
}
mysqli_query($conn, "set character set 'utf8'");
mysqli_query($conn, "set names 'utf8'");
?>