export default class View{
    constructor(){
        const pixiConfiguration = {
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: window.devicePixelRatio,
            autoresize: true,
            antialias: true,
            backgroundColor: 0,
            powerPreference: "high-performance"
        }
        this.application = new PIXI.Application(pixiConfiguration);
        const canvas = this.application.view;
        document.body.appendChild(canvas);
        canvas.focus();
        window.addEventListener('resize', () => this.resize(this));
        this.loadGraphics();
    }

    loadGraphics(){
        const urls = [
            "graphics/map/greentile.png"
        ];
        const loader = PIXI.Loader.shared.add(urls);
        const callback = () => this.loadGraphicsCompleted(this);
        loader.load(callback);
    }

    // Callback
    loadGraphicsCompleted(view) {
        const tileWidth = 128;
        const tileHeight = 64;
        const tileWidthHalf = tileWidth / 2;
        const tileHeightHalf = tileHeight / 2;
        const stage = view.application.stage;
        const url = "graphics/map/greentile.png";

        for(let x = 0; x<100; x++){
            for(let y = 0; y<100; y++){
                const screenX = (x-y) * tileWidthHalf;
                const screenY = (x+y) * tileHeightHalf;
                this.addSprite(view, url, screenX, screenY);
            }
        }

        const tile = view.createSprite("graphics/map/greentile.png");
        view.application.stage.addChild(tile);
    }

    addSprite(view, url, x, y){
        const sprite = view.createSprite(url);
        sprite.position.set(x, y);
        view.application.stage.addChild(sprite);
    }

    createSprite(url){
        const texture = PIXI.Loader.shared.resources[url].texture;
        return new PIXI.Sprite(texture);
    }

    // Callback
    resize(view) {
        view.application.renderer.resize(window.innerWidth, window.innerHeight);
    }

    requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}