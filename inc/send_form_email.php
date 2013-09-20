<?php
	
if ( isset( $_POST['emailAddress'] ) ) {

	function died($error) {
		echo '{"success":"no","msg":"' . $error .' "}';
		die();
	}
	
	if(!isset($_POST['name']) || !isset($_POST['emailAddress']) || !isset($_POST['message'])) {
		died('There appears to be a problem with the form submitted.');
	}
	
	$name = $_POST['name']; // required
	$email_from = $_POST['emailAddress']; // required
	$telephone = $_POST['telephoneNumber']; // not required
	$message = $_POST['message']; // required
	$email_to = "storyclubmn@gmail.com";
	$email_subject = "Story Club site email from " . $name . " -- " . $email_from;
	
	$error_message = "";
	$email_exp = '/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/';
	
	if(!preg_match($email_exp,$email_from)) {
	$error_message .= 'The Email Address you entered does not appear to be valid.';
	}
	
	$string_exp = "/^[A-Za-z .'-]+$/";

	if(!preg_match($string_exp,$name)) {
		$error_message .= 'The First Name you entered does not appear to be valid.';
	}
	if(strlen($message) < 2) {
		$error_message .= 'The Comments you entered do not appear to be valid.';
	}
	
	if(strlen($error_message) > 0) {
		died($error_message);
	}
	
	$email_message = "Story Club Minneapolis Site Contact Information: \n\n";
	
	function clean_string($string) {
	$bad = array("content-type","bcc:","to:","cc:","href");
		return str_replace($bad,"",$string);
	}
	
	$email_message .= "Name: ".clean_string($name)."\n";
	$email_message .= "Email: ".clean_string($email_from)."\n";
	$email_message .= "Telephone: ".clean_string($telephone)."\n";
	$email_message .= "Message: \n";
	$email_message .= "============================================ \n";
	$email_message .= clean_string($message)."\n";
	$email_message .= "============================================ \n";
	
// create email headers
$headers = 'From: '.$name."\r\n".
'Reply-To: '.$email_from."\r\n" .
'X-Mailer: PHP/' . phpversion();
@mail($email_to, $email_subject, $email_message, $headers);
	echo '{"success":"yes","msg":"Your email has been sent! <br>We\'ll get back to you as soon as we can."}';
}
?>