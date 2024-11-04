"use strict"; //エラー防止用

const	FONT			= "48px monospace";	//	使用フォント
const	PLAYER_VEROCITY	= 0.5;				//	プレイヤーの速度

let		gFrame			= 0;				//	内部カウンタ

var		mouseX			= null;				//	マウスポインタのx座標
var		mouseY			= null;				//	マウスポインタのy座標

var		angle			= 0;				//	中心点からマウスポインタへ向かう傾きから得る偏角

let		canvas;								//	キャンバス
let		g;

const	imgScale		= 3;				//	全画像の拡大率

let		mapImg;								//	マップの画像
var		mapX			= 0;
var		mapY			= 0;

const	mapImgSize		= 12;				//	縦横それぞれ12ピクセルで1ブロック
var		mapArray		= [];
const	mapWidth		= 100;				//	マップの横幅
const	mapHeight		= 100;				//	マップの縦幅

let		playerImg;							//	プレイヤーの画像
var		playerX			= 0;
var		playerY			= 0;

const	playerImgSize	= 20;				//	縦横それぞれ20ピクセル

var		playersCanvas	= [];				//	各プレイヤーのキャンバスの配列

function makeMap() {
	
	//	ブロックIDの書き込み
	for ( let i = 0; i < mapWidth * mapHeight; i++ ) {
		mapArray.push( 0 );
	}
	
}

function mouseMove(e) {
	
	mouseX	= e.pageX;
	mouseY	= e.pageY;
	
	//console.log("mouse point : (" + mouseX + ", " + mouseY + ")");
	
}

function drawMap() {
	
	for ( let y = 0; y < mapHeight; y++ ){
		for ( let x = 0; x < mapWidth; x++ ){
			
			const blockId		= mapArray[x + y * mapWidth];	//	(x,y)の位置におけるブロックIDの取得
			
			const xCutBlock		= blockId * mapImgSize;
			const yCutBlock		= blockId * mapImgSize;
			
			const cx			= -playerX + x;
			const cy			= -playerY + y;
			
			const xDrawBlock	= cx * mapImgSize * imgScale;
			const yDrawBlock	= cy * mapImgSize * imgScale;
			
			g.drawImage(
				mapImg,
				xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
				xDrawBlock, yDrawBlock, mapImgSize * imgScale, mapImgSize * imgScale				//	入り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
			);
			
		}
	}
	
}

function drawPlayer() {
	
	function rot(r) {
		
		ctx.translate( canvas.width / 2, canvas.height / 2 );		//	基準点を中心(w / 2, h / 2)にする
		ctx.rotate( r );											//	回転
		ctx.translate( -canvas.width / 2, -canvas.height / 2 );		//	基準点を原点(0, 0)に戻す
		
	}
	
	let ctx = playersCanvas[0].getContext( "2d" );
	
	rot(-angle);													//	前回の処理によるcanvasの回転角を0に初期化
	
	if (mouseX == null || mouseY == null) {
		angle = Math.PI / 2;
	}
	else {
		angle = Math.atan2( mouseY - canvas.height / 2, mouseX - canvas.width / 2 );
	}
	
	var newx	= playerX + PLAYER_VEROCITY * Math.cos(angle);
	var newy	= playerY + PLAYER_VEROCITY * Math.sin(angle);
	
	console.log("x : " + angle);
	
	playerX		= playerX + PLAYER_VEROCITY * Math.cos(angle);
	playerY		= playerY + PLAYER_VEROCITY * Math.sin(angle);
	
	//	前描画データのクリア
	ctx.clearRect(
		-playerImgSize / 2 * imgScale, -playerImgSize / 2 * imgScale,
		canvas.width, canvas.height
	);
	
	//	偏角がx軸正方向との成す角で用意したプレイヤー画像が上向きゆえPI / 2を足す必要がある
	angle += Math.PI / 2;
	rot(angle);
	
	//	プレイヤー画像の描画
	ctx.drawImage( playerImg, canvas.width / 2 - playerImgSize / 2 * imgScale, canvas.height / 2 - playerImgSize / 2 * imgScale, playerImgSize * imgScale, playerImgSize * imgScale );
	
}

//タイマーイベント発生時の処理
function WmTimer(){
	
	gFrame++;						//内部カウンタを加算
	//console.log(gFrame);
	
	drawPlayer();
	drawMap();
	
	g.fillText("player point : (" + playerX + ", " + playerY + ")", 10, 10);
	
	//console.log("plater point : (x, y) = (" + player.GetX() + ", " + player.GetY() + ")");
	
}

//ブラウザ起動イベント
window.onload = function() {
	
	//console.log("Hello World!!");
	
	canvas	= document.getElementById( "main" );	//	mainキャンバスの要素を取得
	canvas.width	= window.innerWidth;			//	キャンバスの幅をウィンドウの幅へ変更
	canvas.height	= window.innerHeight;			//	キャンバスの高さをウィンドウの高さへ変更
	
	g				= canvas.getContext( "2d" );			//	2D描画コンテキストを取得
	g.imageSmoothingEnabled = g.msImageSmoothingEnabled	= 0;	//	ドットをくっきり表示させる
	
	mapImg			= new Image();
	mapImg.src		= "img/tiles.png";
	
	playersCanvas.push( document.createElement( 'canvas' ) );	//	メインプレイヤー用のキャンバスの作成
	playersCanvas[0].width	= window.innerWidth;
	playersCanvas[0].height	= window.innerHeight;
	playersCanvas[0].id = 'MainPlayer';
	
	playersCanvas[0].style.position = 'absolute';
	playersCanvas[0].style.left = canvas.offsetLeft + 'px';
	playersCanvas[0].style.top = canvas.offsetTop + 'px';
	playersCanvas[0].style.backgroundColor = 'transparent';
	playersCanvas[0].getContext("2d").fillStyle = 'rgba(255, 0, 0, 0.5)';
	
	playersCanvas[0].getContext("2d").imageSmoothingEnabled = g.msImageSmoothingEnabled	= 0;
	
	document.body.appendChild(playersCanvas[0]);
	
	playerImg		= new Image();
	playerImg.src	= "img/player.png";
	
	playerX			= 0;
	playerY			= 0;
	
	makeMap();										//	マップデータの生成
	
	document.body.addEventListener( "mousemove", mouseMove );
	
	setInterval( function(){ WmTimer() }, 33 );		//	33ms間隔でWmTimer()を呼び出すように指示 -> (1000 / 33)fpsなのでおよそ30.3fps
	
}
