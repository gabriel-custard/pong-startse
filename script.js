var directions = {
	IDLE: 0,
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
};

var rounds = [5, 5, 3, 3, 2];
// criação do objeto bola
var ball = {
	new: function (incrementedSpeed) {
		return {
			width: 18,
			height: 18,
			x: (this.canvas.width / 2) - 9,
			y: (this.canvas.height / 2) - 9,
			moveX: directions.IDLE,
			moveY: directions.IDLE,
			speed: incrementedSpeed || 9
		};
	}
};

// criação do objeto raquete
var bat = {
	new: function (side) {
		return {
			width: 18,
			height: 70,
			x: side === 'left' ? 150 : this.canvas.width - 150,
			y: (this.canvas.height / 2) - 35,
			score: 0,
			move: directions.IDLE,
			speed: 10
		};
	}
};

var game = {
	initialize: function () {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');

		this.canvas.width = screen.width;
		this.canvas.height = screen.height;

		this.canvas.style.width = (this.canvas.width - 30) + 'px';
		this.canvas.style.height = (this.canvas.height - 20) + 'px';

		this.player = bat.new.call(this, 'left');
		this.bat = bat.new.call(this, 'right');
		this.ball = ball.new.call(this);

		this.bat.speed = 8;
		this.running = this.over = false;
		this.turn = this.bat;
		this.timer = this.round = 0;
		this.color = '#000000';

		pong.menu();
		pong.listen();
	},

    // Desenha os objetos ao canvas
	draw: function () {
		// Limpa o canvas
		this.context.clearRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		// Coloca a cor de preenchimento preta
		this.context.fillStyle = this.color;

		// Desenha o plano de fundo
		this.context.fillRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);

		// Coloca a cor de preenchimento verde
		this.context.fillStyle = '#43d545';

		// Desenha o jogador
		this.context.fillRect(
			this.player.x,
			this.player.y,
			this.player.width,
			this.player.height
		);

		// Desenha a raquete
		this.context.fillRect(
			this.bat.x,
			this.bat.y,
			this.bat.width,
			this.bat.height
		);

		// Desenha a bola
		if (pong._turnDelayIsOver.call(this)) {
			this.context.fillRect(
				this.ball.x,
				this.ball.y,
				this.ball.width,
				this.ball.height
			);
		}

		// Desenha a rede
		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
		this.context.lineTo((this.canvas.width / 2), 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = '#43d545';
		this.context.stroke();

		// Coloca a fonte padrao do jogo no centro da tela
		this.context.font = '100px Courier New';
		this.context.textAlign = 'center';

		// Desenha o score do jogador
		this.context.fillText(
			this.player.score.toString(),
			(this.canvas.width / 2) - 300,
			200
		);

		// Desenha o score do
		this.context.fillText(
			this.bat.score.toString(),
			(this.canvas.width / 2) + 300,
			200
		);

		// Altera o tamanho da fonte do score
		this.context.font = '30px Courier New';

		// Desenha o score vencedor
		this.context.fillText(
			'Round ' + (pong.round + 1),
			(this.canvas.width / 2),
			35
		);

		// Altera o tamanho da fonte do score vencedor
		this.context.font = '40px Courier';

		// Desenha o numero do round atual
		this.context.fillText(
			rounds[pong.round] ? rounds[pong.round] : rounds[pong.round - 1],
			(this.canvas.width / 2),
			100
		);
	},


	menu: function () {
		// Desenha o estagio inicial de todos objetos do jogo
		pong.draw();

		// Altera a cor e estilo de fonte do canvas
		this.context.font = '50px Courier New';
		this.context.fillStyle = this.color;

		// Desenha o retangulo atras do texto 'Press any key to begin'.
		this.context.fillRect(
			this.canvas.width / 2 - 350,
			this.canvas.height / 2 - 48,
			700,
			100
		);

		// Altera a cor de preenchimento do canvas;
		this.context.fillStyle = '#ffffff';

		// Desenha o texto 'press any key to begin'
		this.context.fillText('Press any key to begin',
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);
	},

    endgameMenu: function (text) {
		// Altera cor e tamanho da fonte
		pong.context.font = '50px Courier New';
		pong.context.fillStyle = this.color;

		// Desenha o retangulo atras do texto 'Press any key to begin'.
		pong.context.fillRect(
			pong.canvas.width / 2 - 350,
			pong.canvas.height / 2 - 48,
			700,
			100
		);

		// Altera a cor do preenchimento da fonte;
		pong.context.fillStyle = '#43d545';

		// Desenha os textos ('game Over' e 'Winner')
		pong.context.fillText(text,
			pong.canvas.width / 2,
			pong.canvas.height / 2 + 15
		);

		setTimeout(function () {
			pong = Object.assign({}, game);
			pong.initialize();
		}, 3000);
	},

	//Atualiza o estado dos objetos
	update: function () {
		if (!this.over) {
			// Se a bola tocar no limite do canvas, reinicia as coordenadas
			if (this.ball.x <= 0) pong._resetTurn.call(this, this.bat, this.player);
			if (this.ball.x >= this.canvas.width - this.ball.width) pong._resetTurn.call(this, this.player, this.bat);
			if (this.ball.y <= 0) this.ball.moveY = directions.DOWN;
			if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = directions.UP;

			// Movimenta o jogador caso haja input do teclado
			if (this.player.move === directions.UP) this.player.y -= this.player.speed;
			else if (this.player.move === directions.DOWN) this.player.y += this.player.speed;

			// No saque inicia a bola do lado correto
			// E deixa o rebote aleatório
			if (pong._turnDelayIsOver.call(this) && this.turn) {
				this.ball.moveX = this.turn === this.player ? directions.LEFT : directions.RIGHT;
				this.ball.moveY = [directions.UP, directions.DOWN][Math.round(Math.random())];
				this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
				this.turn = null;
			}

			// Se o jogador colide com o limites da tela,  corrige as coordenadas
			if (this.player.y <= 0) this.player.y = 0;
			else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

			// Movimenta a bola para as coordenadas desejadas a depender da posiçao do player
			if (this.ball.moveY === directions.UP) this.ball.y -= (this.ball.speed / 1.5);
			else if (this.ball.moveY === directions.DOWN) this.ball.y += (this.ball.speed / 1.5);
			if (this.ball.moveX === directions.LEFT) this.ball.x -= this.ball.speed;
			else if (this.ball.moveX === directions.RIGHT) this.ball.x += this.ball.speed;

			// Controla o movimento da raquete do computador
			if (this.bat.y > this.ball.y - (this.bat.height / 2)) {
				if (this.ball.moveX === directions.RIGHT) this.bat.y -= this.bat.speed / 1.5;
				else this.bat.y -= this.bat.speed / 4;
			}
			if (this.bat.y < this.ball.y - (this.bat.height / 2)) {
				if (this.ball.moveX === directions.RIGHT) this.bat.y += this.bat.speed / 1.5;
				else this.bat.y += this.bat.speed / 4;
			}

			// controla a colisao do computador
			if (this.bat.y >= this.canvas.height - this.bat.height) this.bat.y = this.canvas.height - this.bat.height;
			else if (this.bat.y <= 0) this.bat.y = 0;

			// controla as colisoes do jogador com a bola
			if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
				if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
					this.ball.x = (this.player.x + this.ball.width);
					this.ball.moveX = directions.RIGHT;

					beep1.play();
				}
			}

			// controla a colisao da bola com a raquete
			if (this.ball.x - this.ball.width <= this.bat.x && this.ball.x >= this.bat.x - this.bat.width) {
				if (this.ball.y <= this.bat.y + this.bat.height && this.ball.y + this.ball.height >= this.bat.y) {
					this.ball.x = (this.bat.x - this.ball.width);
					this.ball.moveX = directions.LEFT;

					beep1.play();
				}
			}
		}

		// Controla o final de cada round
		// Verifica se o jogador ganhou o round.
		if (this.player.score === rounds[this.round]) {
			// Verifica se ha mais round para ser jogados para anunciar ou nao a vitoria do jogador
			if (!rounds[this.round + 1]) {
				this.over = true;
				setTimeout(function () { pong.endgameMenu('Winner!'); }, 1000);
			} else {
				// Se ha um novo round, reseta os valores e incrementa o numero do round
				this.player.score = this.bat.score = 0;
				this.player.speed += 0.5;
				this.bat.speed += 1;
				this.ball.speed += 1;
				this.round += 1;

				beep3.play();
			}
		}
		// Verifica se o computador ganhou o round
		else if (this.bat.score === rounds[this.round]) {
			this.over = true;
			setTimeout(function () { pong.endgameMenu('Game Over!'); }, 1000);
		}
	},


	loop: function () {
		pong.update();
		pong.draw();

		// Se o game no acabou, desenha o proximo frame
		if (!pong.over) requestAnimationFrame(pong.loop);
	},

	listen: function () {
		document.addEventListener('keydown', function (key) {
			// Controla o input para iniciar o game
			if (pong.running === false) {
				pong.running = true;
				window.requestAnimationFrame(pong.loop);
			}

			// controla os enventos de input para cima e W
			if (key.keyCode === 38 || key.keyCode === 87) pong.player.move = directions.UP;

			// controla os eventos de input para baixo e S
			if (key.keyCode === 40 || key.keyCode === 83) pong.player.move = directions.DOWN;
		});

		// Para o jogador de se mover quando nao ha input
		document.addEventListener('keyup', function (key) { pong.player.move = directions.IDLE; });
	},

	// Reseta o local da bola e jogadores
	_resetTurn: function(winner, loser) {
		this.ball = ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = (new Date()).getTime();

		winner.score++;
		beep2.play();
	},

	// Espera um tempo antes de iniciar o proximo round
	_turnDelayIsOver: function() {
		return ((new Date()).getTime() - this.timer >= 1000);
	},

	
};

var pong = Object.assign({}, game);
pong.initialize();