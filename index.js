"use strict"; //エラー防止用

const	FONT	= "48px monospace";	//	使用フォント

let		gFrame	= 0;				//	内部カウンタ

let		gImg;

//タイマーイベント発生時の処理
function WmTimer(){
	
	gFrame++;						//内部カウンタを加算
	//console.log(gFrame);
	
	
	const	canvas	= document.getElementById( "main" );	//	mainキャンバスの要素を取得
	canvas.width	= window.innerWidth;					//	キャンバスの幅をウィンドウの幅へ変更
	canvas.height	= window.innerHeight;					//	キャンバスの高さをウィンドウの高さへ変更
	
	const	g		= canvas.getContext( "2d" );			//	2D描画コンテキストを取得
	
	g.font	= FONT;											//	文字フォントを設定
	g.fillText( "Hello World!!", 0, 64 );
	
	for ( let y = 0; y < 12; y++ ){
		for ( let x = 0; x < 108; x++ ){
			
			g.drawImage( gImg, x * 12, y * 108 );
			
		}
	}
	
}

//ブラウザ起動イベント
window.onload = function() {
	
	//console.log("Hello World!!");
	
	gImg = new Image();
	gImg.src = "img/tiles.png";								//	マップ画像読み込み
	
	setInterval( function(){ WmTimer() }, 33 );				//	33ms間隔でWmTimer()を呼び出すように指示 -> 1000 / 33fpsなのでおよそ30.3fps
	
}
