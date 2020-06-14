import * as Phaser from 'phaser'
import * as Mqtt from 'mqtt'

class ProductionMat {

  public mat: Phaser.Physics.Arcade.Sprite
  public effect: Phaser.Physics.Arcade.Sprite
  public id: string
  /**
   * maxSpeed em m/s
   */
  public maxSpeed: number
  public acceleration: number
  /**
  * Tamanho da esteira em metros.
  * Usado para transformações.
  */
  public meters: number
  constructor(id, mat, effect) {
    this.mat = mat
    this.effect = effect
    this.acceleration = 10
    this.meters = 10
    this.maxSpeed = 8
    this.setAcceleration()
    this.id = id

    this.mat.setInteractive()
    this.mat.on('pointerup', () => {
      let modal = document.getElementById("modal")
      modal.className = `modal ${this.id}`
    })

    let client = Mqtt.connect('mqtt://localhost:1885')
    client.on('connect', function () {
      client.subscribe('presence', function (err) {
        if (!err) {
          client.publish('presence', 'Hello mqtt')
        }
      })
    })
     
    client.on('message', function (topic, message) {
      // message is Buffer
      console.log(message.toString())
      client.end()
    })
  }

  /** 
  * Para de acelerar quando chega na velocidade limite.
  */
  public checkVelocityConstraint() {
    if (Math.abs(this.getVelocity()) >= this.maxSpeed &&
      // Razão > 0 implica que a esteira vai mudar sentido.
      this.acceleration / this.getVelocity() > 0) {
      this.setAcceleration(0)
    }
  }
  /**
  * Define aceleração da esteira. Recebe em m/s². Transforma em px/s²
  */
  public setAcceleration(acceleration?: number) {
    if (acceleration !== undefined) {
      acceleration = (acceleration * this.mat.width) / this.meters
      this.acceleration = acceleration
    }
    this.effect.setAcceleration(this.acceleration, 0)
  }
  /**
  * Retorna velocidade da esteira.
  */
  public getVelocity() {
    return (this.effect.body.velocity.x * this.meters) / this.mat.width
  }

  public getAcceleration(){
    return (this.acceleration * this.meters) / this.mat.width
  }
  /**
  * Para a esteira de vez.
  */
  public stop() {
    this.effect.setVelocity(0, 0)
    this.setAcceleration(0)
  }

  /**
  * Inicia a esteira.
  */
  public start() {
    this.setAcceleration(.15)
    console.log("Start: ",this.acceleration)
  }

  /** 
  * Da o efeito de loop.
  */
  public reset() {
    let offset = this.mat.width / 2 - this.effect.width / 2
    let velocity = this.getVelocity()
    if (velocity < 0 && this.effect.x < this.mat.x - offset) {
      this.effect.x = this.mat.x + offset
    } else if (this.effect.x > this.mat.x + offset) {
      this.effect.x = this.mat.x - offset
    }

  }

  public reverse() {
    if (this.acceleration === 0) {
      // + 1, if right. -1 if left.
      this.acceleration = this.getVelocity() / Math.abs(this.getVelocity())
      this.acceleration *= 10
    }
    // turn to oposite.
    this.acceleration *= -1
    this.setAcceleration()
  }

  /**
   * Um modal tem duas classes específicas que servem como identificadores.
   * A primeira é um número que representa o id da esteira em questão.
   * O segundo é a classe alreadySet que serve para indicar que os elementos
   * não-atualizaveis do modal já foram setados.
   */
  public displayInfo() {
    let modal = document.getElementById("modal")

    if (modal.classList.contains(this.id)) {
      let name = document.getElementById("name")
      name.innerHTML = `
        Esteira ${this.id}
      `
      let velocity = document.getElementById("velocity")
      velocity.innerHTML = `
       Velocidade : ${this.getVelocity().toFixed(2)} m/s <br/>
       Aceleração : ${this.getAcceleration().toFixed(2)} m/s²
      `
      let size = document.getElementById("size")
      size.innerHTML = `
        Tamanho : ${this.meters} m. 
      `

      if (!modal.classList.contains("alreadySet")) {
        let reverse = document.getElementById("reverse")
        let onReverse = this.reverse.bind(this)
        reverse.onclick = onReverse

        let stop = document.getElementById("stop")
        let onStop = this.stop.bind(this)
        stop.onclick = onStop

        let start = document.getElementById("start")
        let onStart = this.start.bind(this)
        start.onclick = onStart

        let acceleration = <HTMLInputElement> document.getElementById("acceleration")
        acceleration.value = this.getAcceleration().toFixed(2).toString()
        acceleration.onkeypress = (e) => {
          let target = <HTMLInputElement>e.target
          this.setAcceleration(parseFloat(target.value))
        }

        modal.classList.add("alreadySet")
      }
    }
  }

  public update() {
    //this.effect.setVelocity(this.speed,0)
    this.checkVelocityConstraint()
    this.reset()
    this.displayInfo()

  }

}

export { ProductionMat }