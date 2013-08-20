<?php
	
	

	
	sleep(1);

    $div= array(
                '<div>这仅仅时个测试而已放开手打了;犯贱的开始那么懒得说你了是个了多少个路口的伤感</div>',
                '<div>撒离开吗快乐方面考虑是多么浪漫个快乐我们过了闷热看过美国的离开父母更快乐的反革命日哦额几热了发达国家的父母孤苦伶仃分开了人诶就突然诶哦就</div>',
                '<div><p>都是快乐是大哥</p></div>'
        );

    $k = mt_rand(0,2);
	
	$images = array();
	for($i = 1; $i<21;$i++){
		$images[] = '<span><img src="images/'.$i.'.jpg" />'.$div[2].'</span>';
	}
	
	$return = '';
	foreach($images as $k=>$v){
		//if($k >= $start && $k<($limit+$start)){
			$return .= $v;
		//}
	}
	
	echo  $return;
?>