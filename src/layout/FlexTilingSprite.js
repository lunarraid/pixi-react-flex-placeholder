import { applyDefaultProps, PixiComponent } from '@pixi/react';
import { TilingSprite, Texture } from 'pixi.js';
import LayoutMixin from './LayoutMixin';

const FlexTilingSprite = LayoutMixin(TilingSprite);

export default PixiComponent('FlexTilingSprite', {

  create: (props) => {
    return new FlexTilingSprite(Texture.EMPTY);
  },

  applyProps: (instance, oldProps, newProps) => {
    applyDefaultProps(instance, oldProps, newProps);
  }

});
