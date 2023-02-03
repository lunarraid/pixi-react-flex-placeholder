import { Component } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import { BlurFilter } from 'pixi.js';
import { FlexSprite } from './layout';

const { min } = Math;

const blur = [ new BlurFilter(4) ];

const stageOptions = {
  autoDensity: true,
  resizeTo: window,
  resolution: min(window.devicePixelRatio, 2)
};

export default class App extends Component {

  state = {
    width: window.innerWidth,
    height: window.innerHeight,
    isVisible: true
  };

  app = null;

  onRef = (ref) => {
    console.log(ref);
  };

  onMount = (app) => {
    console.log('mount');
    this.app = app;
    app.renderer.on('resize', this.onResize, this);
    // console.log(app.stage);
    // setTimeout(() => this.setState({ isVisible: false }), 2000);
  };

  onUnmount = () => {
    console.log('unmount');
    this.app.renderer.removeListener('resize', this.onResize, this);
    this.app = null;
  };

  onResize = (width, height) => {
    this.setState({ width, height });
  };

  render () {
    const { width, height, isVisible } = this.state;

    return (
      <Stage
        onMount={ this.onMount }
        onUnmount={ this.onUnmount }
        options={ stageOptions }
        height={ window.innerHeight }
        width={ window.innerWidth }
      >
        <FlexSprite style={{ width, height, tint: 0x333333, padding: 100 }} ref={ this.onRef }>
          { isVisible ? <FlexSprite style={{ texture: 'https://pixijs.io/pixi-react/img/bunny.png' }} /> : null }
        </FlexSprite>
      </Stage>
    );
  }

}

