"use strict"; //エラー防止用

const	FONT			= "48px monospace";	//	使用フォント

let		gFrame			= 0;				//	内部カウンタ

let		canvas;								//	キャンバス
let		g;

const	imgScale		= 3;				//	全画像の拡大率

//let		mapImg;								//	マップの画像
let		map;

const	mapImgSize		= 12;				//	縦横それぞれ12ピクセルで1ブロック
var		mapArray		= [];
const	mapWidth		= 100;				//	マップの横幅
const	mapHeight		= 100;				//	マップの縦幅

//let		playerImg;							//	プレイヤーの画像
let		player;

//let		playerX			= 0;				//	プレイヤーのx座標
//let		playerY			= 0;				//	プレイヤーのy座標

const	playerImgSize	= 20;				//	縦横それぞれ20ピクセル

class imgBase {
	
	//	画像
	#img;
	
	//	位置
	#x;
	#y;
	
	//	画像の縦横幅
	#width;
	#height;

	/*
		[in]	src	:	画像ファイルのファイルパス
		[in]	w	:	画像の横幅
		[in]	h	:	画像の縦幅
	*/
	constructor(src, w, h) {
		
		this.img		= new Image();
		this.img.src	= src;
		
		this.x			= 0;
		this.y			= 0;
		
		this.width		= w;
		this.height		= h;
		
	}
	
	GetImg() {
		
		return this.img;
		
	}
	
	GetX() {
		
		return this.x + this.width / 2;
		
	}
	GetY() {
		
		return this.y + this.height / 2;
		
	}
	
	GetWidth() {
		
		return this.width;
		
	}
	GetHeight() {
		
		return this.height;
		
	}
	
	SetX(_x) {
		
		this.x = _x - this.width / 2;
		
	}
	SetY(_y) {
		
		this.y = _y - this.height / 2;
		
	}
	
}

class Map extends imgBase {
	
	
	
}

class Player extends imgBase {
	
	
	
}

function makeMap() {
	
	//	ブロックIDの書き込み
	for ( let i = 0; i < mapWidth * mapHeight; i++ ) {
		mapArray.push( 0 );
	}
	
}

function drawMap() {
	
	for ( let y = 0; y < mapHeight; y++ ){
		for ( let x = 0; x < mapWidth; x++ ){
			
			const blockId		= mapArray[x + y * mapWidth];	//	(x,y)の位置におけるブロックIDの取得
			
			const xCutBlock		= blockId * mapImgSize;
			const yCutBlock		= blockId * mapImgSize;
			
			const xDrawBlock	= x * mapImgSize * imgScale;
			const yDrawBlock	= y * mapImgSize * imgScale;
			
			g.drawImage(
				map.GetImg(),
				xCutBlock, yCutBlock, mapImgSize, mapImgSize,	//	元画像の		(blockId * mapImgSize, blockId * mapImgSize)の位置から	mapImgSize * mapImgSize	の範囲を切り取る
				xDrawBlock, yDrawBlock, mapImgSize * imgScale, mapImgSize * imgScale				//	入り取った画像を(x * mapImgSize, y * mapImgSize)			の位置から	mapImgSize * mapImgSize	の範囲で描画する
			);
			
		}
	}
	
}

function drawPlayer() {
	
	//g.drawImage( player.GetImg(), playerX, playerY, playerImgSize * imgScale, playerImgSize * imgScale );
	g.drawImage(
		player.GetImg(),
		player.GetX(), player.GetY(),
		playerImgSize * imgScale, playerImgSize * imgScale
	);
	
	//g.rotate( 45 * Math.PI / 180 );
	
}

//タイマーイベント発生時の処理
function WmTimer(){
	
	gFrame++;						//内部カウンタを加算
	//console.log(gFrame);
	
	g.imageSmoothingEnabled = g.msImageSmoothingEnabled	= 0;	//	ドットをくっきり表示させる
	
	g.font	= FONT;											//	文字フォントを設定
	g.fillText( "Hello World!!", 0, 64 );
	
	drawMap();
	drawPlayer();
	
	//console.log("plater point : (x, y) = (" + player.GetX() + ", " + player.GetY() + ")");
	
}

//ブラウザ起動イベント
window.onload = function() {
	
	//console.log("Hello World!!");
	
	canvas	= document.getElementById( "main" );	//	mainキャンバスの要素を取得
	canvas.width	= window.innerWidth;			//	キャンバスの幅をウィンドウの幅へ変更
	canvas.height	= window.innerHeight;			//	キャンバスの高さをウィンドウの高さへ変更
	
	g				= canvas.getContext( "2d" );			//	2D描画コンテキストを取得
	
	//	画像クラスの作成
	//mapImg			= new Image();
	//playerImg		= new Image();
	
	/*
	mapImg.src		= "img/tiles.png";					//	マップ画像読み込み
	playerImg.src	= "img/player.png";					//	プレイヤー画像読み込み
	*/
	map				= new Map("img/tiles.png", mapImgSize, mapImgSize);
	player			= new Player("img/player.png", playerImgSize, playerImgSize);
	
	makeMap();										//	マップデータの生成
	
	setInterval( function(){ WmTimer() }, 33 );		//	33ms間隔でWmTimer()を呼び出すように指示 -> 1000 / 33fpsなのでおよそ30.3fps
	
}
