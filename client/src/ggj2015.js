
const GAME = window.GAME || {};
window.GAME = GAME;
GAME.width = 0;
GAME.height = 0;
GAME.originalheight = 480;
GAME.aspect = 0;
GAME.phase = 0;

let app;
let shootHandler = function(){};

let addEvent = window.addEventListener ?
	function(element, type, func){ element.addEventListener(type, func, false); } :
	function(element, type, func){ element.attachEvent("on"+type, func); };

function setEnemyGray(gray) {
    GAME.enemy.grayFilter.greyscale(gray, false);
}

function resize(){

    let newwidth  = window.innerWidth  || document.body.clientWidth;
    let newheight = window.innerHeight || document.body.clientHeight;

    GAME.width = newwidth;
    GAME.height = newheight;

    let aspect = newheight/GAME.originalheight;
    GAME.aspect = aspect;

    $("#box").css({
        left: (100*GAME.aspect),
        top: (30*GAME.aspect)
    });

    if (!!GAME.player) {
        GAME.player.sprite.scale.x = GAME.player.sprite.scale.y = GAME.aspect;
    }

    if (!!GAME.enemy) {
        GAME.enemy.sprite.scale.x = GAME.enemy.sprite.scale.y = GAME.aspect;
    }

    if (!!app) {
        app.renderer.resize(newwidth, newheight);
        app.canvas.style.width = newwidth+"px";
        app.canvas.style.height = newheight+"px";
    }
}

window.addEventListener('resize', resize);
window.onorientationchange = resize;

jQuery(function(){
    $(".selec").click(function(){
        $(".selec").each(function(){
            $(this).css({"font-weight":"normal","color":"gray"});
        });
        $(this).css({"font-weight":"bold","color":"white"});
        GAME.selected_text = $(this).text().split('');

        GAME.selected_text_index = 0;
    });
});

let startmenu_phase = function(){

};

let startgame_phase = function(){
    app.render();
    if (GAME.phase === "startgame_phase") {
        requestAnimationFrame(startgame_phase);
        GAME.phase = "game_phase";
    } else if (GAME.phase === "game_phase") {
        requestAnimationFrame(game_phase);
    }

    GAME.player.sprite.x = GAME.aspect * 25;

    GAME.enemy.sprite.x = GAME.width - GAME.enemy.sprite.width - (GAME.aspect * 25);

    shootHandler = function(){
        let index = GAME.selected_text_index;
        let next_bullet = -1;
        for (let i=0; i<GAME.bullet_text.length; i++) {
            if (GAME.bullet_text[i].x >= GAME.width) {
                next_bullet = i;
                break;
            }
        }

        if (next_bullet === -1) { return; }
        if (GAME.selected_text.length <= index ) { return; }
        GAME.bullet_text[next_bullet].text = GAME.selected_text[index];
        let x = GAME.player.sprite.x;
        let y = GAME.player.sprite.y;
        GAME.bullet_text[next_bullet].x = x + GAME.player.sprite.width/2;
        GAME.bullet_text[next_bullet].y = y + GAME.player.sprite.height/2;
        GAME.bullet_text[next_bullet].visible = true;
        GAME.bullet_text[next_bullet].text_id = index;
        GAME.bullet_text[next_bullet].scale.x = GAME.bullet_text[next_bullet].scale.y = GAME.aspect * 2;
    };
};

let game_phase = function(){
    app.render();
    requestAnimationFrame(game_phase);

    GAME.time++;

    GAME.bullet_text.forEach(function(elem){
        elem.x += 10;
        if (elem.scale.x > 1) {
            elem.scale.x -= (GAME.aspect * 0.05);
            elem.scale.y -= (GAME.aspect * 0.05);
        }
        if (!!elem.visible) {
            if (GAME.enemy.sprite.x < (elem.x+elem.width/2)
            && GAME.enemy.sprite.x + GAME.enemy.sprite.width > (elem.x-elem.width/2)
            && GAME.enemy.sprite.y < (elem.y+elem.height/2)
            && GAME.enemy.sprite.y + GAME.enemy.sprite.height > (elem.y-elem.height/2) ) {
                if (elem.text_id === GAME.selected_text_index) {
                    GAME.selected_text_index++;
                    setEnemyGray(1 - (GAME.selected_text_index/GAME.selected_text.length));
                }
                if (GAME.selected_text_index === GAME.selected_text.length) {
                    setTimeout(function _L(){

                        GAME.enemy.sprite.alpha -= 0.1;
                        if (GAME.enemy.sprite.alpha <= 0) {
                            GAME.enemy.sprite.visible = false;
                            GAME.enemy.sprite.alpha = 1;
                            setEnemyGray(1);
                            GAME.enemy.sprite.filters = [GAME.enemy.grayFilter];
                            setTimeout(function(){
                                GAME.enemy.sprite.visible = true;
                            },500);
                        } else {
                            setTimeout(_L,100);
                        }
                    },500);
                }
                elem.visible = false;
            }

            for (let i=0; i<GAME.shield_text.length; i++) {
                if (!!!GAME.shield_text[i].visible) { continue; }
                if (GAME.shield_text[i].x- GAME.shield_text[i].width/2 < (elem.x+elem.width/2)
                && GAME.shield_text[i].x + GAME.shield_text[i].width/2 > (elem.x-elem.width/2)
                && GAME.shield_text[i].y - GAME.shield_text[i].height/2 < (elem.y+elem.height/2)
                && GAME.shield_text[i].y + GAME.shield_text[i].height/2 > (elem.y-elem.height/2) ) {
                    elem.visible = false;
                }
            }
        }
    });

    if (~~(Math.random()*100) === 5) {
        let a = "死ね！".split('').join("\n");
        let sl = ~~(Math.random()*2)==0? 0 : 1;
        if (GAME.shield_text[sl].life < 0) {
            GAME.shield_text[sl].text = a;
            GAME.shield_text[sl].life = 100;

            let m = 50 + ~~(Math.random()*10)-5;
            GAME.shield_text[sl].x = GAME.enemy.sprite.x - (m*GAME.aspect);
            GAME.shield_text[sl].y = GAME.enemy.sprite.y + GAME.enemy.sprite.height/2;
        }
    }

    let player_move = (Math.sin(GAME.time/50) * (GAME.height/2 - GAME.player.sprite.height/2)) + GAME.height/2 - GAME.player.sprite.height/2;
    GAME.player.sprite.y = player_move;

    let enemy_move = (Math.cos(GAME.time/70) * (GAME.height/2 - GAME.enemy.sprite.height/2)) + GAME.height/2 - GAME.enemy.sprite.height/2;
    GAME.enemy.sprite.y = enemy_move;
};

(async function(){
    resize();

    app = new PIXI.Application();
    await app.init({
        background: 0x3f3f3f,
        width: GAME.width,
        height: GAME.height,
        antialias: true,
    });
    app.canvas.style.display = "block";
    app.canvas.id = "des";
    document.body.appendChild(app.canvas);

    await PIXI.Assets.load([
        "img/riaju.png",
        "img/huryo.png"
    ]);

    GAME.time = 0;

    GAME.player = {
        sprite: PIXI.Sprite.from("img/riaju.png")
    };
    GAME.player.sprite.x = -GAME.player.sprite.width;
    app.stage.addChild(GAME.player.sprite);

    GAME.enemy = {
        sprite: PIXI.Sprite.from("img/huryo.png")
    };
    GAME.enemy.grayFilter = new PIXI.ColorMatrixFilter();
    setEnemyGray(1);
    GAME.enemy.sprite.filters = [GAME.enemy.grayFilter];
    app.stage.addChild(GAME.enemy.sprite);

    GAME.bullet_text = [];
    for (let i=0; i<10; i++) {
        GAME.bullet_text[i] = new PIXI.Text({ text: "", style: { fill: 0xffffff } });
        GAME.bullet_text[i].anchor.x = GAME.bullet_text[i].anchor.y = 0.5;
        app.stage.addChild(GAME.bullet_text[i]);
    }

    GAME.shield_text = [];
    for (let i=0; i<2; i++) {
        GAME.shield_text[i] = new PIXI.Text({ text: "", style: { fill: 0xffffff } });
        GAME.shield_text[i].anchor.x = GAME.shield_text[i].anchor.y = 0.5;
        app.stage.addChild(GAME.shield_text[i]);
    }

    GAME.phase = "startgame_phase";
    GAME.selected_text = "";
    GAME.selected_text_index = 0;

    app.stage.eventMode = "static";
    app.stage.on("pointerdown", function(){
        shootHandler();
    });
    addEvent(document, "keydown", function(){
        shootHandler();
    });

    resize();
    requestAnimationFrame(startgame_phase);
})();
