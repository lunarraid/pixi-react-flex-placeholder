import { Component } from 'react';
import { Stage } from '@pixi/react';
import { FlexSprite, FlexNineSlicePlane, FlexTilingSprite } from './layout';

import ImageFrame from './assets/frame.png';

const { min } = Math;

const stageOptions = {
  autoDensity: true,
  resizeTo: window,
  resolution: min(window.devicePixelRatio, 2)
};

export default class App extends Component {

  state = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  app = null;

  onMount = (app) => {
    this.app = app;
    app.renderer.on('resize', this.onResize, this);
  };

  onUnmount = () => {
    this.app.renderer.removeListener('resize', this.onResize, this);
    this.app = null;
  };

  onResize = (width, height) => {
    this.setState({ width, height });
  };

  render () {
    const { width, height } = this.state;

    const bunnyStyle = { image: 'https://pixijs.io/pixi-react/img/bunny.png', margin: 16, height: 50 };

    return (
      <Stage
        onMount={ this.onMount }
        onUnmount={ this.onUnmount }
        options={ stageOptions }
        height={ height }
        width={ width }
      >
        <FlexTilingSprite style={{ image: 'https://pixijs.io/pixi-react/img/bunny.png', width, height, padding: 100 }} interactive click={ () => console.log('CLICK STAGE') }>
          <FlexNineSlicePlane style={{ image: ImageFrame, tint: 0x006600, flexDirection: 'row', padding: 32, flexWrap: 'wrap' }}>
            <FlexNineSlicePlane style={{ image: ImageFrame, flex: 1, tint: 0x990000, minWidth: 400, alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', padding: 32 }}>
              { Array.from({ length: 20 }, (_, index) => <FlexSprite key={ index } style={ bunnyStyle } />) }
            </FlexNineSlicePlane>
            <FlexNineSlicePlane style={{ image: ImageFrame, flex: 2, tint: 0x99aacc, minWidth: 300, alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', padding: 32 }}>
              { Array.from({ length: 20 }, (_, index) => <FlexSprite interactive click={ (event) => event.stopPropagation() || console.log(index, event) } key={ index } style={ bunnyStyle } />) }
            </FlexNineSlicePlane>
          </FlexNineSlicePlane>
        </FlexTilingSprite>

      </Stage>
    );
  }

}

