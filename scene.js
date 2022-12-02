const canvas = document.getElementById("canvas");

let scene, engine, sceneToRender;

const createDefaultEngine = function () {
    return new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true
    });

};

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
    //scene.debugLayer.show();

    //camera
    const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(15.34, 2, 74.81), scene);   //76.8, 2, 50
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.minZ = 0.45;
    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    let music1 = new BABYLON.Sound("Music", "./assets/ambient.wav", scene, null, {
        loop: true,
        autoplay: false,
    });

    //light
    const light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(3.29, 1.50, -12.93), new BABYLON.Vector3(0, -1, 0), 0.8, 2, scene);
    light.diffuse = new BABYLON.Color3(1, 0.8, 0.2588);
    light.intensity = 10;

    const light02 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(126.02, 3, 50), new BABYLON.Vector3(0, -1, 0), 6.283, 2, scene);
    light02.diffuse = new BABYLON.Color3(0.3, 0.63, 1);
    light02.intensity = 10;

    //creating default sky with skybox
    const texture = new BABYLON.CubeTexture("./assets/environment.env", scene);
    texture.disableLighting = true;
    const skybox = scene.createDefaultSkybox(texture, true, 10000);
    skybox.infiniteDistance = true; //This makes the skybox follow our camera's position.

    //creating ground

    let i;

    const ground = new BABYLON.SceneLoader.ImportMesh("","./assets/", "ground.glb", scene, function(allMeshes) {
        for (i in allMeshes) {
            allMeshes[i].checkCollisions = true;
            console.log("GROUND HAS BEEN CREATED");
        }
    });


    //creating fort
    const fort = new BABYLON.SceneLoader.ImportMesh("", "./assets/", "fort.glb", scene, function(allMeshes) {
        for (i in allMeshes) {
            allMeshes[i].checkCollisions = true;
            console.log("FORT HAS BEEN CREATED");
        }
    });

    //creating vegetation
    const vegetation = new BABYLON.SceneLoader.ImportMesh("", "./assets/", "vegetation.glb", scene)
    console.log("FORT HAS BEEN CREATED");

    //cannon
    const cannon = new BABYLON.SceneLoader.ImportMesh("", "./assets/", "cannon.glb", scene)
    console.log("CANNON HAS BEEN CREATED");

    //static models
    const gym     = new BABYLON.SceneLoader.Append("./assets/", "gym05.glb", scene);
    console.log("GYM HAS BEEN CREATED");
    const block01 = new BABYLON.SceneLoader.Append("./assets/", "1915_block.glb", scene);
    console.log("BLOCK01 HAS BEEN CREATED");
    const block02 = new BABYLON.SceneLoader.Append("./assets/", "A_block.glb", scene);
    console.log("BLOCK02 HAS BEEN CREATED");
    const block03 = new BABYLON.SceneLoader.Append("./assets/", "B_block.glb", scene);
    console.log("BLOCK03 HAS BEEN CREATED");
    const hall    = new BABYLON.SceneLoader.Append("./assets/", "hall.glb", scene);
    const hall_window = new BABYLON.SceneLoader.Append("./assets/", "hall_window.glb", scene);
    console.log("HALL HAS BEEN CREATED");

    //active models
    const PBlock = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "punishmentBlock01.glb", scene)
    console.log("PUNISHMENT BLOCK HAS BEEN CREATED");
    //getting the door mesh for manipulations
    const door1 = scene.getMeshByName("door.002");
    //attaching sound to the door
    const doorSound = new BABYLON.Sound("", "./assets/door.mp3", scene, null, {
        loop: false,
    });
    doorSound.attachToMesh(door1);

    //action manager for the door mesh - one for opening animation and one for playing the sound.
    door1.actionManager = new BABYLON.ActionManager(scene);
    let doorActions = function (mesh) {
        door1.actionManager.registerAction(new BABYLON.PlayAnimationAction(BABYLON.ActionManager.OnPickTrigger, door1, 0 , 200, false ))
            .then (new BABYLON.PlayAnimationAction(BABYLON.ActionManager.OnPickTrigger, door1, 201, 400, false));
        door1.actionManager.registerAction(new BABYLON.PlaySoundAction( BABYLON.ActionManager.OnPickTrigger, doorSound));
    };
    doorActions(door1);

    //highlighting the door which will be removed once the user interact with it
    let hl = new BABYLON.HighlightLayer("hl1", scene);
    hl.addMesh(door1, BABYLON.Color3.Yellow());

    scene.onPointerObservable.add(function(evt){
        if (evt.pickInfo.pickedMesh === door1)
            hl.removeMesh(door1);
    }, BABYLON.PointerEventTypes.POINTERPICK);


    //interior of the punishment block
    const PBlock02 = new BABYLON.SceneLoader.ImportMesh("", "./assets/", "punishmentBlock02.glb", scene);
    const cell01 = new BABYLON.SceneLoader.ImportMesh("", "./assets/", "cell01(wall&ground).glb", scene)
    console.log("CELL01 GROUND HAS BEEN CREATED");
    const cell02 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "cell01(bed).glb", scene)
    // const pillow = scene.getMeshByName("pillow");
    console.log("CELL02 BED HAS BEEN CREATED");
    const cell03 = new BABYLON.SceneLoader.ImportMesh("", "./assets/", "cell01(assets).glb", scene)
    console.log("CELL03 ASSETS HAS BEEN CREATED");


    //letter object with audio attached
    const letter = new BABYLON.MeshBuilder.CreatePlane("plane", {height: 0.4, width: 0.3, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    letter.position = new BABYLON.Vector3(3.310, 0.74, -13);
    letter.rotation = new BABYLON.Vector3(1.6369, 0, 0.4);
    letter.scaling = new BABYLON.Vector3(0.8,0.9,1);
    //letter.isPickable = true;
    let mat1 = new BABYLON.StandardMaterial("", scene);
    mat1.diffuseTexture = new BABYLON.Texture("./assets/letter.png", scene);
    letter.material = mat1;
    //audio narration attached to the letter = triggered when picked
    const music = new BABYLON.Sound("music", "./assets/letter.mp3", scene, null, {
        loop: false,
        spatialSound: true,
        maxDistance: 7,
        PanningModel: "HRTF",
    });

    music.attachToMesh(letter);

    //action manager
    letter.actionManager = new BABYLON.ActionManager(scene);
    letter.actionManager.registerAction(new BABYLON.PlaySoundAction( BABYLON.ActionManager.OnPickTrigger, music))
        .then (new BABYLON.StopSoundAction( BABYLON.ActionManager.NothingTrigger, music))

    let letterhl = new BABYLON.HighlightLayer("letterhl", scene);
    letterhl.addMesh(letter, BABYLON.Color3.Yellow());

    //glowing tubelights
    let tubeLight = new BABYLON.GlowLayer("glow", scene, { mainTextureSamples: 4 });
    tubeLight.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
        if (mesh.name === "Cylinder.037_primitive0") {
            result.set(1, 1, 1, 1)
        } else if (mesh.name === "Cylinder.038_primitive0") {
            result.set(1, 1, 1, 1)
        } else {
            result.set(0, 0, 0, 0)
        }
    };

    const cBlock = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "cellC_block.glb", scene)
    console.log("CBLOCK HAS BEEN CREATED");
    const modernCell   = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "cellC01(full&base).glb", scene)
    const outerMesh = scene.getMeshByName("outerPart_primitive0")

    console.log("MODERN CELL HAS BEEN CREATED");
    const modernCell01 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "cellC02(rack&base).glb", scene)
    console.log("MODERN CELL RACK HAS BEEN CREATED");
    const modernCell02 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "cellC03(bed&door).glb", scene)
    console.log("MODERN CELL BED HAS BEEN CREATED");
    const sink = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "sink.glb", scene)

    //action manager for door animation
    const door = scene.getMeshByName("door");
    door.actionManager = new BABYLON.ActionManager(scene);
    door.actionManager.registerAction(new BABYLON.PlayAnimationAction(BABYLON.ActionManager.OnPickTrigger, door, 0 , 200, false ))
    //.then(new BABYLON.PlayAnimationAction(BABYLON.ActionManager.OnPickTrigger, door, 201, 400, false));


    //loading tv and video texturing
    const modernCell03 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "cellC(T&T).glb", scene)
    console.log("MODERN CELL TELEVISION HAS BEEN CREATED");
    let screen = scene.getMeshByName("Screen")
    let mat = new BABYLON.StandardMaterial("mat", scene);

    let videoTexture = new BABYLON.VideoTexture("vidtex", "./assets/spike.mp4", scene, undefined, undefined, undefined, {
        autoPlay: false,
        loop: false,
    });
    mat.diffuseTexture = videoTexture;
    mat.emissiveColor = new BABYLON.Color3.White();
    screen.material = mat;

    let screenHL = new BABYLON.HighlightLayer("SHL", scene);
    screenHL.addMesh(screen, BABYLON.Color3.Yellow());

    let vidAudio = new BABYLON.Sound("Vidaudio", videoTexture.video, scene, null, { spatialSound: true, maxDistance: 8 });
    vidAudio.attachToMesh(screen)

    scene.onPointerObservable.add(function(evt){
        if (evt.pickInfo.pickedMesh === screen)
            if(videoTexture.video.paused) {
                videoTexture.video.play();
                vidAudio.play();
                screenHL.removeMesh(screen);
            } else
                videoTexture.video.pause();
    }, BABYLON.PointerEventTypes.POINTERPICK);


    //loading mirror and applying reflection
    const mirror = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "mirror.glb", scene)
    const glass = scene.getMeshByName("mirror");

    //enabling xr
    const xrHelper = await scene.createDefaultXRExperienceAsync (
        {
            floorMeshes: [scene.getMeshByName("ground."), scene.getMeshByName("ground"), scene.getMeshByName("cell_ground"), scene.getMeshByName("stairs")],
        });
    if (!xrHelper.baseExperience) {
        console.log('WebXR support is unavailable');
    } else {
        console.log('WebXR support is available');
    }

    //SETTING HEIGHT OF THE USER INSIDE VR
    let personHeight = 2;
    let xrCamera = xrHelper.baseExperience.camera;
    xrHelper.baseExperience.onStateChangedObservable.add((state)=>{
        if(state === BABYLON.WebXRState.IN_XR){
            xrCamera.position.y = personHeight;
        }
    });
    xrCamera.onAfterCameraTeleport.add((targetPosition) => {
        xrCamera.position.y = personHeight;
    });

    xrHelper.baseExperience.onStateChangedObservable.add((state)=>{
        if(state === BABYLON.WebXRState.IN_XR){
            music1.play()
            music1.setVolume(2, 3);
        }

    });

    // GUI to teleport to the cells
    //solitary entry button
    const button = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "button.glb", scene)
    const bt1 = scene.getMeshByName("Cube_primitive0")
    //highlight
    let hlbt1 = new BABYLON.HighlightLayer("hl1", scene);
    hlbt1.addMesh(bt1, BABYLON.Color3.Yellow());
    //solitary exit button
    const button2 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "button2.glb", scene)
    const bt2 = scene.getMeshByName("Cube02_primitive0")
    //highlight
    let hlbt2 = new BABYLON.HighlightLayer("hl1", scene);
    hlbt2.addMesh(bt2, BABYLON.Color3.Yellow());
    //modern entry button
    const button3 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "button03.glb", scene)
    const bt3 = scene.getMeshByName("panel02_primitive0")
    //highlight
    let hlbt3 = new BABYLON.HighlightLayer("hl1", scene);
    hlbt3.addMesh(bt3, BABYLON.Color3.Yellow());
    //modern cell exit
    const button4 = await new BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "button04.glb", scene)
    const bt4 = scene.getMeshByName("Cube03_primitive0")
    //highlight
    let hlbt4 = new BABYLON.HighlightLayer("hl1", scene);
    hlbt4.addMesh(bt4, BABYLON.Color3.Yellow());

    //teleporting to solitary cell and exiting from the cell
    scene.onPointerObservable.add(function(evt){
        if (evt.pickInfo.pickedMesh === bt1) {
            xrCamera.position = new BABYLON.Vector3(4, 2, -15.5)
            xrCamera.rotation = new BABYLON.Vector3(1.55, -40, 0.0)
            music1.setVolume(0,4);
        }
        else if (evt.pickInfo.pickedMesh === bt2) {
            xrCamera.position = new BABYLON.Vector3(1, 2, 10)
            xrCamera.rotation = new BABYLON.Vector3(3.893, 30, 0.0)
            xrCamera.setTarget = new BABYLON.Vector3(11.28, -31.38, 0.00)
            music1.setVolume(2,4);
        }
        else if (evt.pickInfo.pickedMesh === bt3) {
            xrCamera.position = new BABYLON.Vector3(124.02, 2, 51.66)
            xrCamera.rotation = new BABYLON.Vector3(7.11, -371.36, 0.00)
            xrCamera.setTarget = new BABYLON.Vector3(106.11, -9.38, 140.83)
            music1.setVolume(0,4);
        }
        else if (evt.pickInfo.pickedMesh === bt4) {
            xrCamera.position = new BABYLON.Vector3(83.52, 2, 56.89)
            xrCamera.rotation = new BABYLON.Vector3(4.03, -454.40, 0.00)
            xrCamera.setTarget = new BABYLON.Vector3(-7.65, -4.46, 49.88)
            music1.setVolume(2,4);
        }
    }, BABYLON.PointerEventTypes.POINTERPICK);

    return scene;
}

//create engine
engine = createDefaultEngine();
if (!engine) {
    throw 'Engine should not be null';
}
//create scene
scene = createScene();
scene.then(function (returnedScene) {
    sceneToRender = returnedScene;
});

//run render loop to render future frames.
engine.runRenderLoop(function () {
    if (sceneToRender) {
        sceneToRender.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
