"use strict"; //エラー防止用

const	FONT			= "48px monospace";	//	使用フォント
const	PLAYER_VEROCITY	= 15;				//	プレイヤーの速度

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

var		cameraCenterX	= 0;				//	カメラの中心座標のx成分
var		cameraCenterY	= 0;				//	カメラの中心座標のy成分

function makeMap() {
	
	//	ブロックIDの書き込み
	for ( let i = 0; i < mapWidth * mapHeight; i++ ) {
		mapArray.push( 0 );
	}
	
}

function initializePlayersParameter() {
	
	for ( let i = 0; i < numberOfPlayer; i++ ) {
		
		const init_x_i	= Math.random() * mapWidth	* mapImgSize * imgScale;
		const init_y_i	= Math.random() * mapHeight	* mapImgSize * imgScale;
		
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

/*
仮想xy空間座標を配列における座標へ変換 ( x成分、y成分ともにこの関数のみで対応 )
*/
function virtual2array( x_or_y ) {
	
	return parseInt( x_or_y / (mapImgSize * imgScale) + 0.5 );
	
}

/*
配列における座標を仮想xy空間座標へ変換 ( x成分、y成分ともにこの関数のみで対応 )
*/
function array2virtual( x_or_y ) {
	
	return x_or_y * mapImgSize * imgScale;
	
}

/*
仮想xy空間座標(x, y)に対応するマップデータ配列のブロックIDを取得
*/
function getBlockId( x, y ) {
	
	const arrayX			= parseInt( x / (mapImgSize * imgScale) );
	const arrayY			= parseInt( y / (mapImgSize * imgScale) );
	
	if ( 0 <= arrayX && arrayX < mapWidth && 0 <= arrayY && arrayY < mapHeight ) {
		
		return mapArray[ arrayX + arrayY * mapWidth ];
		
	}
	
	return 0x01;	//	座標がマップデータの外にある場合ID=0x01のブロックIDを返す
	
}

/*
仮想xy空間座標(x, y)に対応するマップデータ配列のブロックIDを設定
*/
function setBlockId( x, y, id ) {
	
	const arrayX			= parseInt( x / (mapImgSize * imgScale) );
	const arrayY			= parseInt( y / (mapImgSize * imgScale) );
	
	if ( 0 <= arrayX && arrayX < mapWidth && 0 <= arrayY && arrayY < mapHeight ) {
		
		mapArray[ arrayX + arrayY * mapWidth ] = id;
		
	}
	
}

//	プレイヤーのいる場所のブロックを塗る
function paintMap() {
	
	/*
	const bx = parseInt(virtualX2arrayIdX(canvas.width / 2));		//	実際にプレイヤーが描画されているのはcanvasのど真ん中ゆえ
	const by = parseInt(virtualY2arrayIdY(canvas.height / 2));	//	実際にプレイヤーが描画されているのはcanvasのど真ん中ゆえ
	
	if ( 0 <= bx && bx < mapWidth && 0 <= by && by < mapHeight ) {
		
		mapArray[ bx + by * mapWidth ] = 2;
		
	}
	*/
	
	setBlockId(playerX, playerY, 0x02);
	
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
	ctx.drawImage(
		playerImg,
		(canvas.width / 2) - (playerImgSize / 2) * imgScale,
		(canvas.height / 2) - (playerImgSize / 2) * imgScale,
		playerImgSize * imgScale,
		playerImgSize * imgScale
	);
	
}

/*
カメラの中心座標を仮想xy空間の点(x, y)に設定
*/
function setCamera( x, y ) {
	
	cameraCenterX = x;
	cameraCenterY = y;
	
}

/*
仮想xy空間のx座標からカメラ画面内でのx座標へ変換
[in] x	: virtual x
*/
function getPointInCameraX( x ) {
	
	return x - cameraCenterX;
	
}

/*
仮想xy空間のy座標からカメラ画面内でのy座標へ変換
[in] y	: virtual y
*/
function getPointInCameraY( y ) {
	
	return y - cameraCenterY;
	
}

/*
カメラ画面内でのx座標をキャンバスの中心のx座標へ変換
*/
function setCameraX2CanvasCenterX( x ) {
	
	return x + canvas.width / 2;
	
}

/*
カメラ画面内でのy座標をキャンバスの中心のy座標へ変換
*/
function setCameraY2CanvasCenterY( y ) {
	
	return y + canvas.height / 2;
	
}

function drawMap() {
	
	//	前描画データのクリア
	g.clearRect( 0, 0, canvas.width, canvas.height );
	
	/*
	for ( let y = 0; y < mapHeight; y++ ){
		for ( let x = 0; x < mapWidth; x++ ){
			
			const blockId		= mapArray[x + y * mapWidth];	//	(x,y)の位置におけるブロックIDの取得
			
			const xCutBlock		= blockId * mapImgSize;			//	カットする画像の開始点のx座標
			const yCutBlock		= 0;							//	カットする画像の開始点のy座標
			
			const xDrawBlock	= setCameraX2CanvasCenterX( getPointInCameraX( array2virtual(x) ) );
			const yDrawBlock	= setCameraY2CanvasCenterY( getPointInCameraY( array2virtual(y) ) );
			
			g.drawImage(
				mapImg,
				xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
				xDrawBlock, yDrawBlock, mapImgSize * imgScale, mapImgSize * imgScale				//	切り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
			);
			
		}
	}
	*/
	
	//	キャンバス内で描画可能なブロックの数
	const endx = parseInt( ( canvas.width / (mapImgSize * imgScale) ) + 1 + 0.5 );
	const endy = parseInt( ( canvas.height / (mapImgSize * imgScale) ) + 1 + 0.5 );
	
	//	配列座標単位でループ
	for ( let y = 0; y < endy; y++ ) {
		for ( let x = 0; x < endx; x++ ) {
			
			const ax			= x + virtual2array( playerX ) - endx / 2;
			const ay			= y + virtual2array( playerY ) - endy / 2;
			
			var blockId			= 0x01;
			
			if ( 0 <= ax && ax < mapWidth && 0 <= ay && ay < mapHeight ) {
				
				blockId = mapArray[ ax + ay * mapWidth ];
				
			}
			
			const xCutBlock		= blockId * mapImgSize;			//	カットする画像の開始点のx座標
			const yCutBlock		= 0;							//	カットする画像の開始点のy座標
			
			const vx			= array2virtual( ax );
			const vy			= array2virtual( ay );
			
			const xDrawBlock	= setCameraX2CanvasCenterX( getPointInCameraX( vx ) );
			const yDrawBlock	= setCameraY2CanvasCenterY( getPointInCameraY( vy ) );
			
			g.drawImage(
				mapImg,
				xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
				xDrawBlock, yDrawBlock, mapImgSize * imgScale, mapImgSize * imgScale				//	切り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
			);
			
		}
	}
	
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
		setCamera(playerX, playerY);
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
