import mergeStyles from './mergeStyles';
import applyLayoutProperties from './applyLayoutProperties';
import { Config, Node } from 'typeflex';

const nodeConfig = Config.create();
nodeConfig.setPointScaleFactor(0);

const NO_STYLE = {};
const MAX_LAYOUT_ATTEMPTS = 3;

export default function LayoutMixin (BaseClass) {
  const result = class LayoutMixin extends BaseClass {

    constructor (...args) {
      super(...args);

      this._sortedChildren = null;

      this.anchorX = 0.5;
      this.anchorY = 0.5;
      this.offsetX = 0;
      this.offsetY = 0;

      this.layoutNode = Node.create(nodeConfig);
      this._layoutDirty = true;
      this._needsGraphUpdate = false;
      this.onLayout = null;

      this.layoutCallbackViews = [];
      this.callbackCount = 0;
      this.layoutAttemptCount = 0;

      this.cachedLayout = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };

      this.style = NO_STYLE;

      this._isMeasureFunctionSet = false;
      this.updateMeasureFunction(false);
    }

    addToCallbackPool (view) {
      this.layoutCallbackViews[this.callbackCount] = view;
      this.callbackCount++;
    }

    removeFromCallbackPool (view) {
      const views = this.layoutCallbackViews;

      for (let i = 0; i < this.callbackCount; i++) {
        if (views[i] === view) {
          views[i] = null;
        }
      }
    }

    applyLayout () {
      const newLayout = this.layoutNode.getComputedLayout();
      const cached = this.cachedLayout;

      const boundsDirty = newLayout.left !== cached.x || newLayout.top !== cached.y ||
        newLayout.width !== cached.width || newLayout.height !== cached.height;

      if (boundsDirty) {
        cached.x = newLayout.left;
        cached.y = newLayout.top;
        cached.width = newLayout.width;
        cached.height = newLayout.height;
      }

      if (this._layoutDirty || boundsDirty) {

        const anchorOffsetX = this.anchorX * cached.width;
        const anchorOffsetY = this.anchorY * cached.height;

        this.position.set(
          cached.x + anchorOffsetX + this.offsetX,
          cached.y + anchorOffsetY + this.offsetY
        );

        this.pivot.set(cached.width * this.anchorX, cached.height * this.anchorY);

        this._onLayout(cached.x, cached.y, cached.width, cached.height);

        if (boundsDirty && this.onLayout) {
          this._getLayoutRoot().addToCallbackPool(this);
        }

        this.layoutDirty = false;
      }

      const childCount = this.children.length;

      for (let i = 0; i < childCount; i++) {
        const child = this.children[i];
        child.__isLayoutNode && child.applyLayout();
      }
    }

    render (renderer) {
      if (this._needsGraphUpdate) {
        this.updateLayoutGraph();
      }

      if (!this.sortableChildren) {
        return super.render(renderer);
      }

      const { children } = this;

      if (!this._sortedChildren) {
        this._sortedChildren = children.slice();
      }

      this.children = this._sortedChildren;
      super.render(renderer);
      this.children = children;
    }

    measure (node, width, widthMode, height, heightMode) {
    }

    updateLayoutGraph () {

      this._needsGraphUpdate = false;

      if (this._layoutDirty) {

        this.layoutAttemptCount++;
        this.layoutNode.calculateLayout();
        this.applyLayout();

        for (let i = 0; i < this.callbackCount; i++) {
          const view = this.layoutCallbackViews[i];

          if (view) {
            const { x, y, width, height } = view.cachedLayout;
            this.layoutCallbackViews[i].onLayout(x, y, width, height);
            this.layoutCallbackViews[i] = null;
          }
        }

        this.callbackCount = 0;

        if (this._layoutDirty && this.layoutAttemptCount <= MAX_LAYOUT_ATTEMPTS) {
          this.updateLayout();
        }

        this.layoutAttemptCount--;
      }
    }

    _onLayout (x, y, width, height) {
    }

    onChildrenChange (_length) {
      super.onChildrenChange(_length);

      const n = this.layoutNode;
      const childCount = this.children.length;
      const layoutChildCount = n.getChildCount();

      this.updateMeasureFunction(childCount > 0);

      let childIndex = -1;

      for (let i = 0; i < childCount; i++) {
        const child = this.children[i];

        if (!child.__isLayoutNode) {
          continue;
        }

        childIndex++;

        const childNode = child.layoutNode;
        const currentNodeAtIndex = i < layoutChildCount ? n.getChild(childIndex) : null;

        if (childNode === currentNodeAtIndex) {
          continue;
        }

        if (childNode.getParent() === n) {
          n.removeChild(childNode);
        }

        n.insertChild(childNode, childIndex);
      }

      while (childIndex < layoutChildCount) {
        const node = n.getChild(childIndex++);
        node.getParent().removeChild(node);
      }

      if (this._sortedChildren) {
        this._sortedChildren = this.children.slice();
      }
    }

    _getLayoutRoot () {
      let layoutRoot = this;

      while (layoutRoot.parent?.__isLayoutNode) {
        layoutRoot = layoutRoot.parent;
      }

      return layoutRoot;
    }

    updateMeasureFunction (hasChildren) {
      if (this._isMeasureFunctionSet && hasChildren) {
        this._isMeasureFunctionSet = false;
        this.layoutNode.setMeasureFunc(null);
      } else if (!this._isMeasureFunctionSet && !hasChildren) {
        this._isMeasureFunctionSet = true;
        this.layoutNode.setMeasureFunc(
          (node, width, widthMode, height, heightMode) =>
            this.measure(node, width, widthMode, height, heightMode)
        );
      }
    }

    destroy (options) {
      if (this.onLayout) {
        this._getLayoutRoot().removeFromCallbackPool(this);
      }

      this.layoutNode.free();
      this.layoutNode = null;

      super.destroy(options);
    }

    get layoutDirty () {
      return this._layoutDirty;
    }

    set layoutDirty (value) {

      if (value === this._layoutDirty) {
        return;
      }

      this._layoutDirty = value;

      if (!value || !this.parent) {
        return;
      }

      const root = this._getLayoutRoot();

      if (root === this) {
        this._needsGraphUpdate = true;
      } else {
        root.layoutDirty = true;
      }
    }

    get style () {
      return this._style;
    }

    set style (value) {
      if (this._style === value) {
        return;
      }

      const oldStyle = this._style || NO_STYLE;
      this._style = value ? mergeStyles(value) : NO_STYLE;
      this.layoutDirty = applyLayoutProperties(this.layoutNode, oldStyle, value);

      const {
        blendMode = this.blendMode,
        filters = this.filters,
        rotation = this.rotation,
        visible = this.visible,
        tint = this.tint,
        zIndex = this.zIndex
      } = this._style;

      this.blendMode = blendMode;
      this.filters = filters;
      this.rotation = rotation;
      this.visible = visible;
      this.tint = tint;
      this.zIndex = zIndex;
    }

  };

  result.prototype.__isLayoutNode = true;

  return result;
}
