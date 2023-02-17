import { applyDefaultProps, PixiComponent } from '@pixi/react';
import { Graphics } from 'pixi.js';
import LayoutMixin from './LayoutMixin';

const FlexGraphics = LayoutMixin(Graphics);

export default PixiComponent('FlexGraphics', {

  create: (props) => {
    return new FlexGraphics();
  },

  applyProps: (instance, oldProps, newProps) => {
    applyDefaultProps(instance, oldProps, newProps);
  }

});
