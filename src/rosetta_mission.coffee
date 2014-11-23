class RosettaMission
  ROSETTA_DISTANCE: 20
  ORBIT_RADIUS:     100

  constructor: ->
    @show_orbits = false
    @shownOrbits()    # Preconfigure all orbit axis

    @initThreeJs()
    @initModels()

    @animationLoop()

    @printInstructions()

  printInstructions: ->
    instructions = """
                    %cYou can toggle a few debugging options to see just how crappy the orbiting model is :), namely:
                      rosetta_mission.toggleGrid()    - Shows an overlayed grid
                      rosetta_mission.toggleAxis()    - Shows the world axis to get your bearings
                      rosetta_mission.toggleOrbits()  - Draw the lines representing the object's movements
                      rosetta_mission.shownOrbits(x = true, y = true, z = true)
                                                        Controls what planes you would like the movement
                                                        of the objects to be shown, for instance you can remove the
                                                        up and down movement by disabling the Y axis
                   """
    console.log instructions, "color: blue;"

  toggleGrid: ->
    if @grid_helper.visible
      @scene.remove(@grid_helper.object)
      @grid_helper.visible = false
    else
      @scene.add(@grid_helper.object)
      @grid_helper.visible = true

  toggleAxis: ->
    if @axis_helper.visible
      @scene.remove(@axis_helper.object)
      @axis_helper.visible = false
    else
      @scene.add(@axis_helper.object)
      @axis_helper.visible = true

  shownOrbits: (x = true, y = true, z = true) =>
    @shown_orbits = {
      x: x,
      y: y,
      z: z
    }

  toggleOrbits: =>
    @show_orbits = !@show_orbits

    # Cleanup lines if needed
    if !@show_orbits
      objects = []
      @scene.traverse (obj) =>
        objects.push obj if obj instanceof THREE.Line

      @scene.remove obj for obj in objects

  initThreeJs: ->
    @initThreeJsScene()
    @initThreeJsCamera()
    @initThreeJsRenderer()
    @initThreeJsSceneLights()
    @installResizeHandler()

    # Helpers
    @axis_helper = { object: new THREE.AxisHelper(100), visible: false }
    @grid_helper = { object: new THREE.GridHelper(100,10), visible : false }

    @clock = new THREE.Clock(true)

  installResizeHandler: =>
    window.addEventListener 'resize', =>
      @renderer.setSize(@targetElementWidth(), @targetElementHeight())
      @camera.updateProjectionMatrix()

  initModels: ->
    @objects = {}
    @textures = {}

    @loadTextures()
    @loadObjects()

  targetElement: ->
    document.getElementById('rosetta')

  targetElementWidth: ->
    @targetElement().offsetWidth

  targetElementHeight: ->
    @targetElement().offsetHeight

  initThreeJsScene: =>
    @scene = new THREE.Scene()

  initThreeJsRenderer: =>
    @renderer = new THREE.WebGLRenderer(alpha: true) # transparent background
    @renderer.setSize(@targetElementWidth(), @targetElementHeight())

    @targetElement().appendChild( @renderer.domElement )

  initThreeJsCamera: =>
    @camera = new THREE.PerspectiveCamera(
      50,   # Vertical field of view
      @targetElementWidth() / @targetElementHeight(), # aspect ratio
      0.1,  # Near plane
      1000  # Far plane
    )

    # Initial position of the camera
    @camera.position.x = -150
    @camera.position.y = 25

    # Point the camera to the origin
    @camera.lookAt( @scene.position )

  initThreeJsSceneLights: =>
    @scene.add( new THREE.AmbientLight( 0xffffff ) )

  loadTextures: =>
    @textures = {
      rosetta: new THREE.MeshBasicMaterial(color: 0x111111),
      comet: new THREE.Texture(),
      orbits: new THREE.LineBasicMaterial(color: 0xff00)
    }

    new THREE.ImageLoader().load 'assets/comet-texture.jpg', (image) =>
      @textures.comet.image = image
      @textures.comet.needsUpdate = true

  loadObjects: =>
    loader = new THREE.OBJLoader()

    # Comet
    loader.load "assets/comet_67P.obj", @createComet
    loader.load "assets/rosetta_low_poly.obj", @createRosetta

  animationLoop: =>
    requestAnimationFrame( @animationLoop )
    if @objects.comet && @objects.rosetta
      @renderSceneOrbit()

  renderSceneOrbit: =>
    time = @clock.getElapsedTime() / 8

    @calculateCometPosition(time)
    @calculateRosettaPosition(time)

    # Rotate objects
    @objects.rosetta.rotation.z = @objects.comet.rotation.z += 0.01
    @objects.rosetta.rotation.x = @objects.comet.rotation.x -= 0.01

    @renderer.render(@scene, @camera)

  calculateCometPosition: (time) ->
    # Orbits
    if @show_orbits
      geometry = new THREE.Geometry()
      geometry.vertices.push(
        new THREE.Vector3(
          if @shown_orbits.x then @objects.comet.position.x else 0,
          if @shown_orbits.y then @objects.comet.position.y else 0,
          if @shown_orbits.z then @objects.comet.position.z else 0
        ),
        new THREE.Vector3(
          if @shown_orbits.x then Math.sin(time) * @ORBIT_RADIUS else 0,
          0,
          if @shown_orbits.z then Math.cos(time) * @ORBIT_RADIUS else 0
        )
      )

      @scene.add new THREE.Line(geometry, @textures.orbits)

    @objects.comet.position.x = Math.sin(time) * @ORBIT_RADIUS
    @objects.comet.position.z = Math.cos(time) * @ORBIT_RADIUS

  calculateRosettaPosition: (time) ->
    # Calculate Rosetta Position

    # 1. Translation vector
    position = new THREE.Vector3(
      Math.cos(time * 5) * @ROSETTA_DISTANCE,
      Math.sin(time * 5) * @ROSETTA_DISTANCE,
      0
    )

    # 2. Rotate vector based on Comet position
    position.applyAxisAngle(
      new THREE.Vector3(0,1,0),
      Math.atan2(@objects.comet.position.z, @objects.comet.position.x)
    )

    # 3. Add comet position vector
    position.add(@objects.comet.position)

    # 3.1 - Orbits
    if @show_orbits
      geometry = new THREE.Geometry()
      geometry.vertices.push(
        new THREE.Vector3(
          if @shown_orbits.x then @objects.rosetta.position.x else 0,
          if @shown_orbits.x then @objects.rosetta.position.y else 0,
          if @shown_orbits.x then @objects.rosetta.position.z else 0
        ),
        new THREE.Vector3(
          if @shown_orbits.x then position.x else 0,
          if @shown_orbits.x then position.y else 0,
          if @shown_orbits.x then position.z else 0)
      )
      @scene.add new THREE.Line(geometry, @textures.orbits)

    # 4. Set Rosetta's position
    @objects.rosetta.position.x = position.x
    @objects.rosetta.position.y = position.y
    @objects.rosetta.position.z = position.z

  createComet: (object) =>
    # create our mesh with the loaded geometry and materials
    object.traverse (child) =>
      child.material.map = @textures.comet if child instanceof THREE.Mesh

    @objects.comet = object
    @objects.comet.scale.set(2, 2, 2)
    @scene.add(@objects.comet)

  createRosetta: (object) =>
    # create our mesh with the loaded geometry and materials
    object.traverse (child) =>
      child.material = @textures.rosetta if child instanceof THREE.Mesh

    @objects.rosetta = object
    @objects.rosetta.scale.set( 0.25, 0.25, 0.25 )
    @objects.rosetta.position.x = @ROSETTA_DISTANCE

    @objects.rosetta.matrixAutoUpdate = true
    @objects.rosetta.rotationAutoUpdate = true

    @scene.add(@objects.rosetta)
