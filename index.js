"use strict"; //エラー防止用

const	FONT			= "48px monospace";	//	使用フォント
const	PLAYER_VEROCITY	= 0.5;				//	プレイヤーの速度

var		isStop			= false;			//	画面の停止フラグ(デバッグ用)

var		imgScale		= 3;				//	全画像の拡大率

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

var		numberOfPlayer	= 2;				//	プレイヤーの数
var		playersColor	= [];				//	各プレイヤーの色の配列
var		player1X		= 0;				//	プレイヤー1のx座標
var		player1Y		= 0;				//	プレイヤー1のy座標

const	playerImgSize	= 20;				//	縦横それぞれ20ピクセル

var		playersCanvas	= [];				//	各プレイヤーのキャンバスの配列

function makeMap() {
	
	//	ブロックIDの書き込み
	for ( let i = 0; i < mapWidth * mapHeight; i++ ) {
		mapArray.push( 0 );
	}
	
}

function initializePlayersParameter() {
	
	for ( let i = 0; i < numberOfPlayer; i++ ) {
		
		const init_x_i	= Math.random() * mapWidth;
		const init_y_i	= Math.random() * mapHeight;
		
		console.log( "[player " + i + "] initialize = (" + init_x_i + ", " + init_y_i + ")" );
		
		if ( i == 0 ) {
			
			playerX			= init_x_i;
			playerY			= init_y_i;
			
		}
		else {
			
			player1X		= init_x_i;
			player1Y		= init_y_i;
			
		}
		
	}
	
}

function mouseMove(e) {
	
	mouseX	= e.pageX;
	mouseY	= e.pageY;
	
	//console.log("mouse point : (" + mouseX + ", " + mouseY + ")");
	
}

function arrayIdX2virtualX( x ) {
	
	const cx			= x - playerX;					//	プレイヤーの位置へ座標変換
	return cx * mapImgSize * imgScale  - ( playerX - ( canvas.width / 2 ) ) - mapImgSize * imgScale / 2;
	
}
function arrayIdY2virtualY( y ) {
	
	const cy			= y - playerY;					//	プレイヤーの位置へ座標変換
	return cy * mapImgSize * imgScale  - ( playerY - ( canvas.height / 2 ) ) - mapImgSize * imgScale / 2;
	
}

function virtualX2arrayIdX( x ) {
	
	return ( ( 2 * ( x + playerX ) - canvas.width ) / ( 2 * mapImgSize * imgScale ) ) + ( 1 / 2 ) + playerX;
	
}
function virtualY2arrayIdY( y ) {
	
	return ( ( 2 * ( y + playerY ) - canvas.height ) / ( 2 * mapImgSize * imgScale ) ) + ( 1 / 2 ) + playerY;
	
}

//	プレイヤーのいる場所のブロックを塗る
function paintMap() {
	
	const bx = parseInt(virtualX2arrayIdX(canvas.width / 2));		//	実際にプレイヤーが描画されているのはcanvasのど真ん中ゆえ
	const by = parseInt(virtualY2arrayIdY(canvas.height / 2));	//	実際にプレイヤーが描画されているのはcanvasのど真ん中ゆえ
	
	if ( 0 <= bx && bx < mapWidth && 0 <= by && by < mapHeight ) {
		
		mapArray[ bx + by * mapWidth ] = 2;
		
	}
	
	/*
	if ( 0 <= playerX && playerX < mapWidth * mapImgSize * imgScale && 0 <= playerY && playerY < mapHeight * mapImgSize * imgScale ) {
		
		
		
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
	
	//	マップ外に出られないようにする
	/*
	if ( 0 <= newx && newx < mapWidth * mapImgSize ) {
		
		playerX	= newx;
		
	}
	if ( 0 <= newy && newy < mapHeight * mapImgSize * imgScale ) {
		
		playerY	= newy;
		
	}
	*/
	playerX	= newx;
	playerY	= newy;
	
	//	前描画データのクリア
	ctx.clearRect(
		-playerImgSize / 2 * imgScale, -playerImgSize / 2 * imgScale,
		canvas.width, canvas.height
	);
	
	//	偏角がx軸正方向との成す角で用意したプレイヤー画像が上向きゆえPI / 2を足す必要がある
	angle += Math.PI / 2;
	rot(angle);
	
	//	プレイヤー画像の描画
	ctx.drawImage( playerImg, (canvas.width / 2) - (playerImgSize / 2) * imgScale, (canvas.height / 2) - (playerImgSize / 2) * imgScale, playerImgSize * imgScale, playerImgSize * imgScale );
	
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
				xDrawBlock, yDrawBlock, mapImgSize * imgScale, mapImgSize * imgScale				//	切り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
			);
			
		}
	}
	
	/*
	const startX	= playerX - (canvas.width / 2);
	const startY	= playerY - (canvas.height / 2);
	
	const endX		= ( canvas.width / (mapImgSize * imgScale) ) + 1;
	const endY		= ( canvas.height / (mapImgSize * imgScale) ) + 1;
	
	for ( let y = startY; y < endY; y++ ) {
		for ( let x = startX; x < endX; x++ ) {
			
			const bx = parseInt(virtualX2arrayIdX(x));
			const by = parseInt(virtualY2arrayIdY(y));
			
			if ( 0 <= bx && bx < mapWidth * mapImgSize * imgScale && 0 <= by && by < mapHeight * mapImgSize * imgScale ) {
				
console.log("(bx, by) = (" + bx + ", " + by + ")");
				
				const blockId		= mapArray[ bx + by * mapWidth ];
				
				const xCutBlock		= blockId * mapImgSize;			//	カットする画像の開始点のx座標
				const yCutBlock		= 0;							//	カットする画像の開始点のy座標
				
				const qx = x / (mapImgSize * imgScale);
				const qy = y / (mapImgSize * imgScale);
				
				const dx			= x * mapImgSize * imgScale - playerX;//arrayIdX2virtualX(bx);
				const dy			= y * mapImgSize * imgScale - playerY;//arrayIdY2virtualY(by);
				
				g.drawImage(
					mapImg,
					xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
					dx, dy, mapImgSize * imgScale, mapImgSize * imgScale				//	切り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
				);
				
			}
			
		}
	}
	*/
	
}

function drawMiniMap() {
	
	const RANGE_AVARAGE		= (canvas.width + canvas.height) / 2;
	
	const SPACE				= RANGE_AVARAGE / 100;
	const MINIMAP_RANGE		= RANGE_AVARAGE / 8;
	const ONE_BLOCK_SIZE	= ( MINIMAP_RANGE - (SPACE * 2) ) / mapWidth;
	
	const RECT_LEFT			= canvas.width - SPACE - MINIMAP_RANGE;
	const RECT_TOP			= canvas.height - SPACE - MINIMAP_RANGE;
	
	g.fillStyle				= "#1C1C1C";
	g.globalAlpha			= 0.5;										//	不透明度を設定
	g.fillRect( RECT_LEFT, RECT_TOP, MINIMAP_RANGE, MINIMAP_RANGE );
	
	for ( let y = 0; y < mapHeight; y++ ) {
		for ( let x = 0; x < mapWidth; x++ ) {
			
			switch ( mapArray[ x + y * mapWidth ] ) {
				
				case 0x00:
					g.fillStyle = "#1C1C1C";
					break;
					
				case 0x02:
					g.fillStyle = "pink";
				
			}
			
			g.fillRect( RECT_LEFT + SPACE + x * ONE_BLOCK_SIZE, RECT_TOP + SPACE + y * ONE_BLOCK_SIZE, ONE_BLOCK_SIZE, ONE_BLOCK_SIZE );
			
		}
	}
	
	g.globalAlpha			= 1.0;										//	不透明度をリセット
	
}

//タイマーイベント発生時の処理
function WmTimer(){
	
	if (isStop == false) {
		
		gFrame++;						//内部カウンタを加算
		//console.log(gFrame);
		
		drawPlayer();
		paintMap();
		drawMap();
		
		drawMiniMap();
		
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
	initializePlayersParameter();					//	全プレイヤーのパラメータを設定
	
	document.body.addEventListener( "mousemove", mouseMove );
	
	setInterval( function(){ WmTimer() }, 33 );		//	33ms間隔でWmTimer()を呼び出すように指示 -> (1000 / 33)fpsなのでおよそ30.3fps
	
}
