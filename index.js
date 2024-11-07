"use strict"; //エラー防止用

const	FONT			= "48px monospace";	//	使用フォント
const	PLAYER_VEROCITY	= 0.5;				//	プレイヤーの速度
const	IMG_SCALE		= 3;				//	全画像の拡大率

var		isStop			= false;			//	画面の停止フラグ(デバッグ用)

let		gFrame			= 0;				//	内部カウンタ

var		mouseX			= null;				//	マウスポインタのx座標
var		mouseY			= null;				//	マウスポインタのy座標

var		angle			= 0;				//	中心点からマウスポインタへ向かう傾きから得る偏角

let		canvas;								//	キャンバス
let		g;

let		mapImg;								//	マップの画像
var		mapX			= 0;
var		mapY			= 0;

const	mapImgSize		= 12;				//	縦横それぞれ12ピクセルで1ブロック
var		mapArray		= [];				//	マップデータ
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

function arrayIdX2virtualX( x ) {
	
	const cx			= x - playerX;					//	プレイヤーの位置へ座標変換
	return cx * mapImgSize * IMG_SCALE  - ( playerX - ( canvas.width / 2 ) ) - mapImgSize * IMG_SCALE / 2;
	
}
function arrayIdY2virtualY( y ) {
	
	const cy			= y - playerY;					//	プレイヤーの位置へ座標変換
	return cy * mapImgSize * IMG_SCALE  - ( playerY - ( canvas.height / 2 ) ) - mapImgSize * IMG_SCALE / 2;
	
}

function virtualX2arrayIdX( x ) {
	
	return ( ( 2 * ( x + playerX ) - canvas.width ) / ( 2 * mapImgSize * IMG_SCALE ) ) + ( 1 / 2 ) + playerX;
	
}
function virtualY2arrayIdY( y ) {
	
	return ( ( 2 * ( y + playerY ) - canvas.height ) / ( 2 * mapImgSize * IMG_SCALE ) ) + ( 1 / 2 ) + playerY;
	
}

//	プレイヤーのいる場所のブロックを塗る
function paintMap() {
	
	const bx = virtualX2arrayIdX(canvas.width / 2);		//	実際にプレイヤーが描画されているのはcanvasのど真ん中ゆえ
	const by = virtualY2arrayIdY(canvas.height / 2);	//	実際にプレイヤーが描画されているのはcanvasのど真ん中ゆえ
	
	mapArray[ parseInt(bx) + parseInt(by) * mapWidth ] = 2;
	
	/*
	if ( 0 <= playerX && playerX < mapWidth * mapImgSize * IMG_SCALE && 0 <= playerY && playerY < mapHeight * mapImgSize * IMG_SCALE ) {
		
		
		
console.log( "(bx, by) = " + parseInt(bx + 0.5, 10) + ", " + parseInt(by + 0.5, 10) );
		mapArray[ parseInt(bx + 0.5, 10) + parseInt(by + 0.5, 10) * mapWidth ] = 2;
		
		//g.fillRect( xDrawBlock - 1, yDrawBlock - 1, xDrawBlock + 1, yDrawBlock + 1 );
		
	}
	*/
	
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
	
	playerX		= playerX + PLAYER_VEROCITY * Math.cos(angle);
	playerY		= playerY + PLAYER_VEROCITY * Math.sin(angle);
	
	//	前描画データのクリア
	ctx.clearRect(
		-playerImgSize / 2 * IMG_SCALE, -playerImgSize / 2 * IMG_SCALE,
		canvas.width, canvas.height
	);
	
	//	偏角がx軸正方向との成す角で用意したプレイヤー画像が上向きゆえPI / 2を足す必要がある
	angle += Math.PI / 2;
	rot(angle);
	
	//	プレイヤー画像の描画
	ctx.drawImage( playerImg, (canvas.width / 2) - (playerImgSize / 2) * IMG_SCALE, (canvas.height / 2) - (playerImgSize / 2) * IMG_SCALE, playerImgSize * IMG_SCALE, playerImgSize * IMG_SCALE );
	
}

function drawMap() {
	
	//	前描画データのクリア
	g.clearRect( 0, 0, canvas.width, canvas.height );
	
	
	
	for ( let y = 0; y < mapHeight; y++ ){
		for ( let x = 0; x < mapWidth; x++ ){
			
			const blockId		= mapArray[x + y * mapWidth];	//	(x,y)の位置におけるブロックIDの取得
			
			const xCutBlock		= blockId * mapImgSize;			//	カットする画像の開始点のx座標
			const yCutBlock		= 0;							//	カットする画像の開始点のy座標
			
			const xDrawBlock	= arrayIdX2virtualX(x);
			const yDrawBlock	= arrayIdY2virtualY(y);
			
			g.drawImage(
				mapImg,
				xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
				xDrawBlock, yDrawBlock, mapImgSize * IMG_SCALE, mapImgSize * IMG_SCALE				//	入り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
			);
			
		}
	}
	
	/*
	const startX = playerX - canvas.width / 2;
	const startY = playerY - canvas.height / 2;
	
	for ( let y = startY; y < startY + canvas.height / (mapImgSize * IMG_SCALE) + 1; y++ ){
		for ( let x = startX; x < startX + canvas.width / (mapImgSize * IMG_SCALE) + 1; x++ ){
			
			if ( 0 <= x && x < mapWidth && 0 <= y && y < mapHeight ) {
				
				const blockId		= mapArray[x + y * mapWidth];	//	(x,y)の位置におけるブロックIDの取得
				
				const xCutBlock		= blockId * mapImgSize;
				const yCutBlock		= blockId * mapImgSize;
				
				const cx			= x - startX;
				const cy			= y - startY;
				
				const xDrawBlock	= cx * mapImgSize * IMG_SCALE;
				const yDrawBlock	= cy * mapImgSize * IMG_SCALE;
				
				g.drawImage(
					mapImg,
					xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
					xDrawBlock, yDrawBlock, mapImgSize * IMG_SCALE, mapImgSize * IMG_SCALE				//	入り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
				);
				
			}
			
		}
	}
	*/
	
}

//タイマーイベント発生時の処理
function WmTimer(){
	
	if (isStop == false) {
		
		gFrame++;						//内部カウンタを加算
		//console.log(gFrame);
		
		drawPlayer();
		paintMap();
		drawMap();
		
		g.fillText("player point : (" + playerX + ", " + playerY + ")", 10, 10);
		
		//console.log("plater point : (x, y) = (" + player.GetX() + ", " + player.GetY() + ")");
		
	}
	
}

window.onclick = function(e) {
	
	isStop = !isStop;
	
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
