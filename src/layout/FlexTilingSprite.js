import { PixiComponent } from '@pixi/react';
import { TilingSprite, Texture } from 'pixi.js';
import LayoutMixin from './LayoutMixin';
import { applyDefaultTextureProps } from './PropsUtils';

class FlexTilingSprite extends LayoutMixin(TilingSprite) {

  _onLayout (x, y, width, height) {
    this.height = height;
    this.width = width;
  }

}

export default PixiComponent('FlexTilingSprite', {

  create (props) {
    return new FlexTilingSprite(Texture.EMPTY);
  },

  applyProps: applyDefaultTextureProps

});
