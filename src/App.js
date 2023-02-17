import { Component } from 'react';
import { Stage, Container, Sprite, Text } from '@pixi/react';
import { BlurFilter } from 'pixi.js';
import { FlexSprite, FlexNineSlicePlane } from './layout';

import ImageFrame from './assets/frame.png';

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

    const bunnyStyle = { texture: 'https://pixijs.io/pixi-react/img/bunny.png', margin: 16, height: 50 };

    return (
      <Stage
        onMount={ this.onMount }
        onUnmount={ this.onUnmount }
        options={ stageOptions }
        height={ height }
        width={ width }
      >
        <FlexSprite style={{ width, height }} interactive click={ () => console.log('CLICK STAGE') }>
          <FlexNineSlicePlane style={{ texture: ImageFrame, tint: 0x006600, flexDirection: 'row', padding: 32, flexWrap: 'wrap' }}>
            <FlexNineSlicePlane style={{ texture: ImageFrame, flex: 1, tint: 0x990000, minWidth: 400, alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', padding: 32 }}>
              { Array.from({ length: 20 }, (_, index) => <FlexSprite key={ index } style={ bunnyStyle } />) }
            </FlexNineSlicePlane>
            <FlexNineSlicePlane style={{ texture: ImageFrame, flex: 2, tint: 0x99aacc, minWidth: 300, alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', padding: 32 }}>
              { Array.from({ length: 20 }, (_, index) => <FlexSprite interactive click={ (event) => event.stopPropagation() || console.log(index, event) } key={ index } style={ bunnyStyle } />) }
            </FlexNineSlicePlane>
          </FlexNineSlicePlane>
        </FlexSprite>

      </Stage>
    );
  }

}

