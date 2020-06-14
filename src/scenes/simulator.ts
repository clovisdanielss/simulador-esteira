import * as Phaser from 'phaser';
import { getGameWidth, getGameHeight } from '../helpers';
import { ProductionMat } from '../entities/productionmat.ts';
import { MenuButton } from '../ui/menu-button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class Simulator extends Phaser.Scene {

  productionMats: Array<ProductionMat> = []
  objects: Array<Phaser.Physics.Arcade.Sprite> = []

  constructor() {
    super(sceneConfig);
  }

  public create() {

    new MenuButton(this, 100, 100, 'Insert', () => {
      this.pushProductionMat()
    });

    new MenuButton(this, 100, 200, 'Remove', () => {
      this.popProductionMat()
    });


    //this.textVelocity = this.add.text(100, 50, 'Velocity: 0 m/s', { fill: '#000000' }).setFontSize(18);
    //this.textSizeMatMeters = this.add.text(100, 75, 'Meters: 10', { fill: '#000000' }).setFontSize(18);

  }

  public update() {
    //this.textVelocity.setText('Velocity: ' + this.productionMat.getVelocity().toFixed(2) + 'm/s')
    this.productionMats.map((mat) => {
      mat.update()
    })
  }

  public pushProductionMat() {
    let mat = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'mat')

    let effect = this.physics.add.sprite(getGameWidth(this) / 2, getGameHeight(this) / 2, 'mat_effect')
    effect.y -= effect.height / 4

    let productionMat = new ProductionMat(this.productionMats.length, mat, effect)

    this.productionMats.push(productionMat)

    this.redraw()
  }

  public popProductionMat() {
    let pmat = this.productionMats.pop()
    pmat.mat.destroy()
    pmat.effect.destroy()
    this.redraw()
  }

  public redraw() {
    let totalMats = this.productionMats.length
    /**
     * Agora, é necessário descobrir os N centros.
     * Em cada centro será desenhado uma esteira.
     */
    let heightOffset = getGameHeight(this) / totalMats
    let height = 0.0
    this.productionMats.map((pmat) => {
      pmat.mat.y = (height + heightOffset) / 2
      pmat.effect.y = (height + heightOffset) / 2
      pmat.effect.y -= pmat.effect.height / 4
      height += heightOffset
    })
  }
}
