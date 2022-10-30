/**
 * Constants
 */
const TWO_PI = Math.PI * 2;
const ALLOWED_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Simple settings objects so we can easily mutate these values using dat.gui
 * @type {{spawnMass: number, pauseWhileAiming: boolean, amountOfPredictions: number}}
 */
const settings = {
    spawnMass: 25,
    pauseWhileAiming: false,
    amountOfPredictions: 200
};

/**
 * Application Class
 * The heart of the application and responsible for initializing all objects and updating/rendering them
 */
class Application {
    /**
     * Application constructor
     */
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.solarSystem = new SolarSystem();
        this.planetLauncher = new PlanetLauncher(this.canvas, this.solarSystem);

        //Resize listener for the canvas to fill the browser window dynamically
        window.addEventListener('resize', () => this.resizeCanvas(), false);
    }

    /**
     * Simple resize function. Reinitializing everything on the canvas while changing the width/height
     * @return {void}
     */
    resizeCanvas() {
        //Recalculate the width and height of the canvas and thus the center of the canvas as well
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };

        this.reset();
    }

    /**
     * Updates the application and every child of the application
     * @return {void}
     */
    update() {
        if (settings.pauseWhileAiming === false) {
            this.solarSystem.update();
        } else if (settings.pauseWhileAiming === true && this.planetLauncher.isMouseDown === false) {
            this.solarSystem.update();
        }

        this.planetLauncher.update();
    }

    /**
     * Renders the application and every child of the application
     * @return {void}
     */
    render() {
        //Clear the entire canvas to make it empty for the new render loop
        this.context.clearRect(0, 0, this.width, this.height);

        this.solarSystem.render(this.context);
        this.planetLauncher.render(this.context);
    }

    /**
     * Update and render the application at least 60 times a second
     * @return {void}
     */
    loop() {
        this.update();
        this.render();

        window.requestAnimationFrame(() => this.loop());
    }

    /**
     * Throw all planets away and initialize a whole new array of planets
     * @return {void}
     */
    reset() {
        this.solarSystem.planets = [];
        this.solarSystem.initializePlanets(this.center);
    }
}

/**
 * SolarSystem class
 * Is responsible for maintaining and updating all of it's planets
 */
class SolarSystem {
    /**
     * SolarSystem constructor
     */
    constructor() {
        this.planets = [];
    }

    /**
     * Initialize the planets container by filling it with Planet objects
     * @param center - An object containing the x and y variables that describe the center of the canvas
     * @return {void}
     */
    initializePlanets(center) {
        this.planets.push(new Planet(center.x, center.y, 0, 0, 200));
        this.planets.push(new Planet(center.x, center.y - 150, 1.1, 0, 25));
        this.planets.push(new Planet(center.x + 70, center.y - 90, 1.45, Math.PI, 25));
        this.planets.push(new Planet(center.x - 180, center.y + 160, 1, Math.PI / 1.4, 25));
        this.planets.push(new Planet(center.x - 150, center.y + 100, 1.1, Math.PI * 2.4, 75));
    }

    /**
     * Updates the application and every child of the application
     * @return {void}
     */
    update() {
        //Keep an array of all destroyed planets, because we don't want to mutate the planets array while calculating all values
        let destroyedPlanets = [];

        for (let i = 0; i < this.planets.length; i++) {
            //If the planet collides with another planet, don't bother continuing the gravity calculations for this planet
            if (SolarSystem.collidesWithAnotherPlanet(this.planets[i], this.planets) === true) {
                destroyedPlanets.push(i);
                continue;
            }

            //Calculate the total gravitational pull from all the other planets in the solar system
            let gravitationalPull = SolarSystem.gravitationalPullFromOtherPlanets(this.planets[i], this.planets);

            //Update the current planet by changing it's position based on it's velocity
            this.planets[i].accelerate(gravitationalPull);
            this.planets[i].update();
        }

        //Remove all planets that should be destroyed, because they've hit something during this update loop
        for (let i = 0; i < destroyedPlanets.length; i++) {
            this.planets.splice(destroyedPlanets[i], 1);
        }
    }

    /**
     * Renders the SolarSystem and every child of the application
     * @param context - The context of the canvas that the application is being rendered on
     * @return {void}
     */
    render(context) {
        for (let i = 0; i < this.planets.length; i++) {
            this.planets[i].render(context);
        }
    }

    /**
     * Check whether one planet collides with another planet
     * @param {Planet} planet
     * @param {Array} planets
     * @return {boolean}
     */
    static collidesWithAnotherPlanet(planet, planets) {
        for (let i = 0; i < planets.length; i++) {
            //We don't want to check for collision with the same planet. A planet can't hit itself
            if (planet.name === planets[i].name) {
                continue;
            }

            //If the other planet is bigger than the current planet, don't bother checking for collisions
            if (planets[i].mass <= planet.mass) {
                continue;
            }

            //Check if the current planet hits the other planet
            if (SolarSystem.hasCollisionBetween(planet, planets[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate the gravitational pull on one planet based on distance to other planets
     * @param {Planet} planet
     * @param {Array} planets
     * @returns {Vector2D}
     */
    static gravitationalPullFromOtherPlanets(planet, planets) {
        let totalGravitationalPull = new Vector2D(0, 0);

        for (let i = 0; i < planets.length; i++) {
            //We don't want to check for gravitational pull on the same planet, neither should a planet collide with itself
            if (planet.name === planets[i].name) {
                continue;
            }

            //If the other planet's mass is smaller than the current planets mass, don't bother to check for gravity changes.
            //A bigger planet shouldn't be affected by a very small planet, as this isn't a scientifically accurate representation of the galaxy.
            if (planets[i].mass <= planet.mass) {
                continue;
            }

            //Calculate the gravitationalPull on the current planet
            totalGravitationalPull.addTo(SolarSystem.gravitationalPull(planet, planets[i]));
        }

        return totalGravitationalPull;
    }

    /**
     * If the current planet hits a bigger planet, it should be destroyed by impact
     * I calculate this by doing a simple check on the distance and the radii of both planets
     * @param {Planet} currentPlanet
     * @param {Planet} otherPlanet
     */
    static hasCollisionBetween(currentPlanet, otherPlanet) {
        let distanceTo = SolarSystem.distanceBetween(currentPlanet, otherPlanet);

        //If the current planet hits a bigger planet, it should be destroyed by impact
        //I calculate this by doing a simple check on the distance and the radii of both planets
        return (distanceTo <= (otherPlanet.radius + currentPlanet.radius));
    }

    /**
     * Calculate the gravitational pull on the current planet based on the other planet's mass and distance between the two planets
     * @param {Planet} currentPlanet
     * @param {Planet} otherPlanet
     */
    static gravitationalPull(currentPlanet, otherPlanet) {
        //Calculate the angle and distance between the current planet and the current other planet
        let angle = SolarSystem.angleBetween(currentPlanet, otherPlanet);
        let distanceTo = SolarSystem.distanceBetween(currentPlanet, otherPlanet);

        //Create a new gravity Vector2D that will affect the current planet's velocity
        //Set the angle and length of the gravity vector. The length is based on the mass of the other planet and the distance between the current planet and that planet.
        let gravity = new Vector2D(0, 0);
        gravity.setLength(otherPlanet.mass / (distanceTo * distanceTo));
        gravity.setAngle(angle);

        //Return the gravitational pull that is applied the current planet by the other planet
        return gravity;
    }

    /**
     * Calculate the distance between the current planet and the current other planet
     * @param {Planet} currentPlanet
     * @param {Planet} otherPlanet
     * @returns {number}
     */
    static distanceBetween(currentPlanet, otherPlanet) {
        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = otherPlanet.position.getX() - currentPlanet.position.getX();
        let dy = otherPlanet.position.getY() - currentPlanet.position.getY();

        //Calculate the distance between the current planet and the current other planet
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate the angle between the current planet and the current other planet
     * @param {Planet} currentPlanet
     * @param {Planet} otherPlanet
     * @returns {number}
     */
    static angleBetween(currentPlanet, otherPlanet) {
        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = otherPlanet.position.getX() - currentPlanet.position.getX();
        let dy = otherPlanet.position.getY() - currentPlanet.position.getY();

        return Math.atan2(dy, dx);
    }
}

/**
 * Planet Class
 */
class Planet {
    /**
     * Planet constructor
     * @param {number} x - The horizontal position of the planet
     * @param {number} y - The vertical position of the planet
     * @param {number} speed - The initial speed of the planet
     * @param {number} direction - The initial direction in which the planet moves
     * @param {number} mass - The mass and thus size of the planet
     */
    constructor(x, y, speed, direction, mass) {
        this.name = Utils.randomString(10);
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.velocity.setLength(speed);
        this.velocity.setAngle(direction);
        this.mass = mass;

        this.radius = mass / 5;
        this.sunlitRadius = mass / 6;
        this.radialDifference = this.radius - this.sunlitRadius;
        this.color = Utils.getRandomInt(0, 360);
    }

    /**
     * Update the planet by changing it's position based on it's velocity
     * @return {void}
     */
    update() {
        this.position.addTo(this.velocity);
    }

    /**
     * Renders the planet
     * @param context - The context of the canvas that the application is being rendered on
     * @return {void}
     */
    render(context) {
        //Draw the unlit part of the planet
        context.fillStyle = 'hsla(' + this.color + ', 70%, 51%, 1)';
        context.beginPath();
        context.arc(this.position.getX(), this.position.getY(), this.radius, 0, TWO_PI);
        context.fill();

        //Draw the lit part of the planet
        context.fillStyle = 'hsla(' + this.color + ', 100%, 63%, 1)';
        context.beginPath();
        context.arc(this.position.getX() - (this.radialDifference / 2), this.position.getY() - (this.radialDifference / 2), this.sunlitRadius, 0, TWO_PI);
        context.fill();
    }

    /**
     * Add a Vector2D to the current planet's velocity
     * @param {Vector2D} acceleration
     * @return {void}
     */
    accelerate(acceleration) {
        this.velocity.addTo(acceleration);
    }
}

/**
 * PlanetLauncher class
 * Is responsible for the user interaction and spawning new planets
 */
class PlanetLauncher {
    /**
     * PlanetLauncher constructor
     */
    constructor(canvas, solarSystem) {
        this.solarSystem = solarSystem;

        //Set an initial mouse position that is certainly off screen
        this.mousePosition = {
            x: -100,
            y: -100
        };
        this.isMouseDown = false;
        this.mouseDownPosition = null;
        this.pathLocations = [];

        //Attach all event listeners needed for the PlanetLauncher
        window.addEventListener('mousemove', (e) => this.mouseMove(e), false);
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e), false);
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e), false);
        canvas.addEventListener("touchstart", (e) => this.touchStart(e), false);
        canvas.addEventListener("touchend", (e) => this.touchEnd(e), false);
        canvas.addEventListener("touchmove", (e) => this.touchMove(e), false);
    }

    /**
     * Checks whether the user holds his mouse down (or touches the screen). If so, initialises the path predictions so they can be rendered
     * @return {void}
     */
    update() {
        //If the user isn't holding it's mouse down we don't have to bother predicting the planets positions
        if (this.isMouseDown === false) {
            return;
        }

        //Define the pathLocations array which will hold all the future positions for each planet
        this.pathLocations = [];

        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = this.mouseDownPosition.x - this.mousePosition.x;
        let dy = this.mouseDownPosition.y - this.mousePosition.y;

        //Create a temporary planet object that we can insert in the solar system to perform our calculations
        this.solarSystem.planets.push(new Planet(
            this.mouseDownPosition.x,
            this.mouseDownPosition.y,
            Math.sqrt(dx * dx + dy * dy) / 100,
            Math.atan2(dy, dx),
            settings.spawnMass
        ));

        //Define the positions and velocities array so we can restore these values later on on the planets
        let positions = [];
        let velocities = [];

        //Loop through each planet and backup their position and velocity
        for (let i = 0; i < this.solarSystem.planets.length; i++) {
            positions[i] = this.solarSystem.planets[i].position.add(new Vector2D(0, 0));
            velocities[i] = this.solarSystem.planets[i].velocity.add(new Vector2D(0, 0));
        }

        //Keep an array of all destroyed planets, because we don't want to mutate the planets array while calculating all values
        let destroyedPlanets = [];

        //Loop as many times as we want to predict the future path of our planets
        for (let c = 0; c < settings.amountOfPredictions; c++) {
            //For every check we have to loop through each planet and check them against the other planets
            for (let i = 0; i < this.solarSystem.planets.length; i++) {
                //Make sure the pathLocations array is always initialized with a new empty array
                //because we are going to push predicted locations in a separate array for each planet
                if (typeof this.pathLocations[i] === 'undefined') {
                    this.pathLocations[i] = [];
                }

                //If this planet is already predicted to be destroyed by a previous run, don't bother checking again
                if (destroyedPlanets.indexOf(i) !== -1) {
                    continue;
                }

                //If the planet collides with another planet, don't bother continuing the gravity calculations for this planet
                if (SolarSystem.collidesWithAnotherPlanet(this.solarSystem.planets[i], this.solarSystem.planets) === true) {
                    destroyedPlanets.push(i);
                    continue;
                }

                //Calculate the total gravitational pull from all the other planets in the solar system
                let gravitationalPull = SolarSystem.gravitationalPullFromOtherPlanets(this.solarSystem.planets[i], this.solarSystem.planets);

                //Update the current planet by changing it's position based on it's velocity
                this.solarSystem.planets[i].accelerate(gravitationalPull);
                this.solarSystem.planets[i].update();

                //Store the newly predicted position in an array for this specific planet, so we can render it in the render function
                this.pathLocations[i].push({
                    x: this.solarSystem.planets[i].position.getX(),
                    y: this.solarSystem.planets[i].position.getY(),
                    color: this.solarSystem.planets[i].color
                });
            }
        }

        //Restore the original positions and velocities of each planet
        for (let i = 0; i < this.solarSystem.planets.length; i++) {
            this.solarSystem.planets[i].position = positions[i];
            this.solarSystem.planets[i].velocity = velocities[i];
        }

        //Remove our temporary planet from the solar system
        this.solarSystem.planets.splice(this.solarSystem.planets.length - 1, 1);
    }

    /**
     * Renders the application and every child of the application
     * @param context - The context of the canvas that the application is being rendered on
     * @return {void}
     */
    render(context) {
        if (this.isMouseDown === false) {
            context.strokeStyle = 'hsla(0, 100%, 100%, 0.5)';
            context.beginPath();
            context.arc(this.mousePosition.x, this.mousePosition.y, settings.spawnMass / 5, 0, TWO_PI);
            context.stroke();
        } else {
            context.strokeStyle = 'hsla(0, 100%, 100%, 1)';
            context.beginPath();
            context.arc(this.mouseDownPosition.x, this.mouseDownPosition.y, settings.spawnMass / 5, 0, TWO_PI);
            context.stroke();

            context.beginPath();
            context.moveTo(this.mousePosition.x, this.mousePosition.y);
            context.lineTo(this.mouseDownPosition.x, this.mouseDownPosition.y);
            context.closePath();
            context.stroke();

            for (let i = 0; i < this.pathLocations.length; i++) {
                for (let j = 1; j < this.pathLocations[i].length; j += 1) {
                    if (i === this.pathLocations.length - 1) {
                        context.strokeStyle = 'hsla(0, 100%, 100%, 0.5)';
                        context.lineWidth = 3;
                    } else {
                        context.strokeStyle = 'hsla(' + this.pathLocations[i][j].color + ', 100%, 63%, 0.2)';
                        context.lineWidth = 1;
                    }

                    context.beginPath();
                    context.moveTo(this.pathLocations[i][j - 1].x, this.pathLocations[i][j - 1].y);
                    context.lineTo(this.pathLocations[i][j].x, this.pathLocations[i][j].y);
                    context.closePath();
                    context.stroke();
                }

                if (this.pathLocations[i].length < settings.amountOfPredictions && this.pathLocations[i].length > 0) {
                    context.beginPath();
                    context.moveTo(this.pathLocations[i][this.pathLocations[i].length - 1].x - 5, this.pathLocations[i][this.pathLocations[i].length - 1].y - 5);
                    context.lineTo(this.pathLocations[i][this.pathLocations[i].length - 1].x + 5, this.pathLocations[i][this.pathLocations[i].length - 1].y + 5);
                    context.closePath();
                    context.stroke();

                    context.beginPath();
                    context.moveTo(this.pathLocations[i][this.pathLocations[i].length - 1].x + 5, this.pathLocations[i][this.pathLocations[i].length - 1].y - 5);
                    context.lineTo(this.pathLocations[i][this.pathLocations[i].length - 1].x - 5, this.pathLocations[i][this.pathLocations[i].length - 1].y + 5);
                    context.closePath();
                    context.stroke();
                }
            }
        }
    }

    /**
     * @param event - The browsers touchStart event object
     * @return {void}
     */
    touchStart(event) {
        //Keep the browser from continuing to process the touch event (this also prevents a mouse event from also being delivered)
        event.preventDefault();

        if (this.isMouseDown) {
            return;
        }

        this.isMouseDown = true;
        this.mousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        this.mouseDownPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    /**
     * @param event - The browsers touchMove event object
     * @return {void}
     */
    touchMove(event) {
        //Keep the browser from continuing to process the touch event (this also prevents a mouse event from also being delivered)
        event.preventDefault();

        this.mousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    /**
     * @param event - The browsers mousemove event object
     * @return {void}
     */
    mouseMove(event) {
        event.preventDefault();

        this.mousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    /**
     * @param event - The browsers mousemove event object
     * @return {void}
     */
    mouseDown(event) {
        event.preventDefault();

        if (this.isMouseDown) {
            return;
        }

        this.isMouseDown = true;
        this.mouseDownPosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    /**
     * @param event - The browsers mouseUp event object
     * @return {void}
     */
    mouseUp(event) {
        event.preventDefault();

        this.isMouseDown = false;

        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = this.mouseDownPosition.x - this.mousePosition.x;
        let dy = this.mouseDownPosition.y - this.mousePosition.y;

        //Insert our new planet in the solar system based on the calculated speed and angle
        this.solarSystem.planets.push(new Planet(
            this.mouseDownPosition.x,
            this.mouseDownPosition.y,
            Math.sqrt(dx * dx + dy * dy) / 100,
            Math.atan2(dy, dx),
            settings.spawnMass
        ));

        //GA
        sendGA();
    }

    /**
     * @param event - The browsers touchEnd event object
     * @return {void}
     */
    touchEnd(event) {
        this.isMouseDown = false;

        //Calculate the difference in position for the horizontal and the vertical axis
        let dx = this.mouseDownPosition.x - this.mousePosition.x;
        let dy = this.mouseDownPosition.y - this.mousePosition.y;

        //Insert our new planet in the solar system based on the calculated speed and angle
        this.solarSystem.planets.push(new Planet(
            this.mouseDownPosition.x,
            this.mouseDownPosition.y,
            Math.sqrt(dx * dx + dy * dy) / 100,
            Math.atan2(dy, dx),
            settings.spawnMass
        ));

        //GA
        sendGA();

        //Make sure the mouse position is offscreen again so the user doesn't see the aim pointer on mobile
        this.mousePosition = {
            x: -100,
            y: -100
        };
    }
}

/**
 * Vector2D class
 */
class Vector2D {
    /**
     * Vector constructor
     */
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    /**
     * @param {number} x
     * @return {void}
     */
    setX(x) {
        this._x = x;
    }

    /**
     * @param {number} y
     * @return {void}
     */
    setY(y) {
        this._y = y;
    }

    /**
     * @return {number}
     */
    getX() {
        return this._x;
    }

    /**
     * @return {number}
     */
    getY() {
        return this._y;
    }

    /**
     * @param {number} angle
     * @return {void}
     */
    setAngle(angle) {
        let length = this.getLength();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
    }

    /**
     * @return {number}
     */
    getAngle() {
        return Math.atan2(this._y, this._x);
    }

    /**
     * @param {number} length
     * @return {void}
     */
    setLength(length) {
        let angle = this.getAngle();
        this._x = Math.cos(angle) * length;
        this._y = Math.sin(angle) * length;
    }

    /**
     * @return {number}
     */
    getLength() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    /**
     * @param {Vector2D} v2
     * @return {Vector2D}
     */
    add(v2) {
        return new Vector2D(this._x + v2.getX(), this._y + v2.getY());
    }

    /**
     * @param {Vector2D} v2
     * @return {Vector2D}
     */
    subtract(v2) {
        return new Vector2D(this._x - v2.getX(), this._y - v2.getY());
    }

    /**
     * @param {number} value
     * @return {Vector2D}
     */
    multiply(value) {
        return new Vector2D(this._x * value, this._y * value);
    }

    /**
     * @param {number} value
     * @return {Vector2D}
     */
    divide(value) {
        return new Vector2D(this._x / value, this._y / value);
    }

    /**
     * @param {Vector2D} v2
     * @return {void}
     */
    addTo(v2) {
        this._x += v2.getX();
        this._y += v2.getY();
    }

    /**
     * @param {Vector2D} v2
     * @return {void}
     */
    subtractFrom(v2) {
        this._x -= v2.getX();
        this._y -= v2.getY();
    }

    /**
     * @param {number} value
     * @return {void}
     */
    multiplyBy(value) {
        this._x *= value;
        this._y *= value;
    }

    /**
     * @param {number} value
     * @return {void}
     */
    divideBy(value) {
        this._x /= value;
        this._y /= value;
    }
}

/**
 * Utilities Class has some functions that are needed throughout the entire application
 */
class Utils {
    /**
     * Returns a random integer between a given minimum and maximum value
     * @param {number} min - The minimum value, can be negative
     * @param {number} max - The maximum value, can be negative
     * @return {number}
     */
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Create a random string
     * @param {number} length - The length of the random string
     * @returns {string}
     */
    static randomString(length) {
        let text = "";

        for (let i = 0; i < length; i++) {
            text += ALLOWED_CHARACTERS.charAt(Math.floor(Math.random() * ALLOWED_CHARACTERS.length));
        }

        return text;
    }
}

/**
 * Onload function is executed whenever the page is done loading, initializes the application
 * @return {void}
 */
window.onload = function () {
    //Create a new instance of the application
    const application = new Application();

    //Initialize all planets for the first time
    application.solarSystem.initializePlanets(application.center);

    //Initialize the dat.GUI object and assign the variables that the user can adjust
    const gui = new dat.GUI({autoPlace: false});
    gui.domElement.id = 'gui';
    gui_container.appendChild(gui.domElement);
    gui.add(settings, 'spawnMass', 5, 200);
    gui.add(settings, 'amountOfPredictions', 50, 500);
    gui.add(settings, 'pauseWhileAiming');
    gui.add(application, 'reset');
    gui.close();

    //Start the initial loop function for the first time
    application.loop();
};


for (let i = 2; i <= 10; i++) {
    setTimeout(function () {
        gtag('event', 'ping', {'event_category': 'ping', 'event_label': 15 * i});
    }, 15000 * i);
}

let count = 0;

function sendGA() {
    if (count++ < 10) {
        gtag('event', 'click', {'event_category': 'planets', 'event_label': count});
    } else if (!(count++ % 5)) {
        gtag('event', 'click', {'event_category': 'planets', 'event_label': count});
    }
}

console.log("%cIf you see this, you're talented and we want you. Join our team at https://qcac.hk/#recruitment :D",
    "background: #140533; color: #FFCC00; font-size: 24px; font-weight: 700;");
console.log("Eat a Ba" + +"a" + "a la!");