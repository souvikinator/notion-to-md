(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@popperjs/core/lib/index.js
  var lib_exports = {};
  __export(lib_exports, {
    afterMain: () => afterMain,
    afterRead: () => afterRead,
    afterWrite: () => afterWrite,
    applyStyles: () => applyStyles_default,
    arrow: () => arrow_default,
    auto: () => auto,
    basePlacements: () => basePlacements,
    beforeMain: () => beforeMain,
    beforeRead: () => beforeRead,
    beforeWrite: () => beforeWrite,
    bottom: () => bottom,
    clippingParents: () => clippingParents,
    computeStyles: () => computeStyles_default,
    createPopper: () => createPopper3,
    createPopperBase: () => createPopper,
    createPopperLite: () => createPopper2,
    detectOverflow: () => detectOverflow,
    end: () => end,
    eventListeners: () => eventListeners_default,
    flip: () => flip_default,
    hide: () => hide_default,
    left: () => left,
    main: () => main,
    modifierPhases: () => modifierPhases,
    offset: () => offset_default,
    placements: () => placements,
    popper: () => popper,
    popperGenerator: () => popperGenerator,
    popperOffsets: () => popperOffsets_default,
    preventOverflow: () => preventOverflow_default,
    read: () => read,
    reference: () => reference,
    right: () => right,
    start: () => start,
    top: () => top,
    variationPlacements: () => variationPlacements,
    viewport: () => viewport,
    write: () => write
  });

  // node_modules/@popperjs/core/lib/enums.js
  var top = "top";
  var bottom = "bottom";
  var right = "right";
  var left = "left";
  var auto = "auto";
  var basePlacements = [top, bottom, right, left];
  var start = "start";
  var end = "end";
  var clippingParents = "clippingParents";
  var viewport = "viewport";
  var popper = "popper";
  var reference = "reference";
  var variationPlacements = /* @__PURE__ */ basePlacements.reduce(function(acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /* @__PURE__ */ [].concat(basePlacements, [auto]).reduce(function(acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []);
  var beforeRead = "beforeRead";
  var read = "read";
  var afterRead = "afterRead";
  var beforeMain = "beforeMain";
  var main = "main";
  var afterMain = "afterMain";
  var beforeWrite = "beforeWrite";
  var write = "write";
  var afterWrite = "afterWrite";
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  // node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
  function getNodeName(element) {
    return element ? (element.nodeName || "").toLowerCase() : null;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindow.js
  function getWindow(node) {
    if (node == null) {
      return window;
    }
    if (node.toString() !== "[object Window]") {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }
    return node;
  }

  // node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }
  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // node_modules/@popperjs/core/lib/modifiers/applyStyles.js
  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function(name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name];
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(name2) {
        var value = attributes[name2];
        if (value === false) {
          element.removeAttribute(name2);
        } else {
          element.setAttribute(name2, value === true ? "" : value);
        }
      });
    });
  }
  function effect(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: "0",
        top: "0",
        margin: "0"
      },
      arrow: {
        position: "absolute"
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;
    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }
    return function() {
      Object.keys(state.elements).forEach(function(name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
        var style = styleProperties.reduce(function(style2, property) {
          style2[property] = "";
          return style2;
        }, {});
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function(attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  }
  var applyStyles_default = {
    name: "applyStyles",
    enabled: true,
    phase: "write",
    fn: applyStyles,
    effect,
    requires: ["computeStyles"]
  };

  // node_modules/@popperjs/core/lib/utils/getBasePlacement.js
  function getBasePlacement(placement) {
    return placement.split("-")[0];
  }

  // node_modules/@popperjs/core/lib/utils/math.js
  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  // node_modules/@popperjs/core/lib/utils/userAgent.js
  function getUAString() {
    var uaData = navigator.userAgentData;
    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function(item) {
        return item.brand + "/" + item.version;
      }).join(" ");
    }
    return navigator.userAgent;
  }

  // node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }

  // node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;
    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }
    var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element);
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }
    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }
    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width,
      height
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/contains.js
  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode();
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;
      do {
        if (next && parent.isSameNode(next)) {
          return true;
        }
        next = next.parentNode || next.host;
      } while (next);
    }
    return false;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
  function getComputedStyle2(element) {
    return getWindow(element).getComputedStyle(element);
  }

  // node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
  function isTableElement(element) {
    return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
  function getDocumentElement(element) {
    return ((isElement(element) ? element.ownerDocument : (
      // $FlowFixMe[prop-missing]
      element.document
    )) || window.document).documentElement;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
  function getParentNode(element) {
    if (getNodeName(element) === "html") {
      return element;
    }
    return (
      // this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || // DOM Element detected
      (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element)
    );
  }

  // node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle2(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());
    if (isIE && isHTMLElement(element)) {
      var elementCss = getComputedStyle2(element);
      if (elementCss.position === "fixed") {
        return null;
      }
    }
    var currentNode = getParentNode(element);
    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle2(currentNode);
      if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    var window2 = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }

  // node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
  }

  // node_modules/@popperjs/core/lib/utils/within.js
  function within(min2, value, max2) {
    return max(min2, min(value, max2));
  }
  function withinMaxClamp(min2, value, max2) {
    var v = within(min2, value, max2);
    return v > max2 ? max2 : v;
  }

  // node_modules/@popperjs/core/lib/utils/getFreshSideObject.js
  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  // node_modules/@popperjs/core/lib/utils/mergePaddingObject.js
  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  // node_modules/@popperjs/core/lib/utils/expandToHashMap.js
  function expandToHashMap(value, keys) {
    return keys.reduce(function(hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  // node_modules/@popperjs/core/lib/modifiers/arrow.js
  var toPaddingObject = function toPaddingObject2(padding, state) {
    padding = typeof padding === "function" ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
  };
  function arrow(_ref) {
    var _state$modifiersData$;
    var state = _ref.state, name = _ref.name, options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? "height" : "width";
    if (!arrowElement || !popperOffsets2) {
      return;
    }
    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === "y" ? top : left;
    var maxProp = axis === "y" ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets2[axis] - state.rects.popper[len];
    var startDiff = popperOffsets2[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === "y" ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2;
    var min2 = paddingObject[minProp];
    var max2 = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset2 = within(min2, center, max2);
    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset2, _state$modifiersData$.centerOffset = offset2 - center, _state$modifiersData$);
  }
  function effect2(_ref2) {
    var state = _ref2.state, options = _ref2.options;
    var _options$element = options.element, arrowElement = _options$element === void 0 ? "[data-popper-arrow]" : _options$element;
    if (arrowElement == null) {
      return;
    }
    if (typeof arrowElement === "string") {
      arrowElement = state.elements.popper.querySelector(arrowElement);
      if (!arrowElement) {
        return;
      }
    }
    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }
    state.elements.arrow = arrowElement;
  }
  var arrow_default = {
    name: "arrow",
    enabled: true,
    phase: "main",
    fn: arrow,
    effect: effect2,
    requires: ["popperOffsets"],
    requiresIfExists: ["preventOverflow"]
  };

  // node_modules/@popperjs/core/lib/utils/getVariation.js
  function getVariation(placement) {
    return placement.split("-")[1];
  }

  // node_modules/@popperjs/core/lib/modifiers/computeStyles.js
  var unsetSides = {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto"
  };
  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x, y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }
  function mapToStyles(_ref2) {
    var _Object$assign2;
    var popper2 = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
    var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
      x,
      y
    }) : {
      x,
      y
    };
    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty("x");
    var hasY = offsets.hasOwnProperty("y");
    var sideX = left;
    var sideY = top;
    var win = window;
    if (adaptive) {
      var offsetParent = getOffsetParent(popper2);
      var heightProp = "clientHeight";
      var widthProp = "clientWidth";
      if (offsetParent === getWindow(popper2)) {
        offsetParent = getDocumentElement(popper2);
        if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
          heightProp = "scrollHeight";
          widthProp = "scrollWidth";
        }
      }
      offsetParent = offsetParent;
      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
          // $FlowFixMe[prop-missing]
          offsetParent[heightProp]
        );
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }
      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
          // $FlowFixMe[prop-missing]
          offsetParent[widthProp]
        );
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }
    var commonStyles = Object.assign({
      position
    }, adaptive && unsetSides);
    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x,
      y
    }, getWindow(popper2)) : {
      x,
      y
    };
    x = _ref4.x;
    y = _ref4.y;
    if (gpuAcceleration) {
      var _Object$assign;
      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }
    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
  }
  function computeStyles(_ref5) {
    var state = _ref5.state, options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration,
      isFixed: state.options.strategy === "fixed"
    };
    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })));
    }
    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: "absolute",
        adaptive: false,
        roundOffsets
      })));
    }
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-placement": state.placement
    });
  }
  var computeStyles_default = {
    name: "computeStyles",
    enabled: true,
    phase: "beforeWrite",
    fn: computeStyles,
    data: {}
  };

  // node_modules/@popperjs/core/lib/modifiers/eventListeners.js
  var passive = {
    passive: true
  };
  function effect3(_ref) {
    var state = _ref.state, instance = _ref.instance, options = _ref.options;
    var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
    var window2 = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.addEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.addEventListener("resize", instance.update, passive);
    }
    return function() {
      if (scroll) {
        scrollParents.forEach(function(scrollParent) {
          scrollParent.removeEventListener("scroll", instance.update, passive);
        });
      }
      if (resize) {
        window2.removeEventListener("resize", instance.update, passive);
      }
    };
  }
  var eventListeners_default = {
    name: "eventListeners",
    enabled: true,
    phase: "write",
    fn: function fn() {
    },
    effect: effect3,
    data: {}
  };

  // node_modules/@popperjs/core/lib/utils/getOppositePlacement.js
  var hash = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function(matched) {
      return hash[matched];
    });
  }

  // node_modules/@popperjs/core/lib/utils/getOppositeVariationPlacement.js
  var hash2 = {
    start: "end",
    end: "start"
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function(matched) {
      return hash2[matched];
    });
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft,
      scrollTop
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  // node_modules/@popperjs/core/lib/dom-utils/getViewportRect.js
  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x: x + getWindowScrollBarX(element),
      y
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getDocumentRect.js
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;
    if (getComputedStyle2(body || html).direction === "rtl") {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
  function isScrollParent(element) {
    var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  // node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
  function getScrollParent(node) {
    if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }
    return getScrollParent(getParentNode(node));
  }

  // node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
  function listScrollParents(element, list) {
    var _element$ownerDocumen;
    if (list === void 0) {
      list = [];
    }
    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : (
      // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)))
    );
  }

  // node_modules/@popperjs/core/lib/utils/rectToClientRect.js
  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  // node_modules/@popperjs/core/lib/dom-utils/getClippingRect.js
  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === "fixed");
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingParents(element) {
    var clippingParents2 = listScrollParents(getParentNode(element));
    var canEscapeClipping = ["absolute", "fixed"].indexOf(getComputedStyle2(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
    if (!isElement(clipperElement)) {
      return [];
    }
    return clippingParents2.filter(function(clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== "body";
    });
  }
  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === "clippingParents" ? getClippingParents(element) : [].concat(boundary);
    var clippingParents2 = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents2[0];
    var clippingRect = clippingParents2.reduce(function(accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  // node_modules/@popperjs/core/lib/utils/computeOffsets.js
  function computeOffsets(_ref) {
    var reference2 = _ref.reference, element = _ref.element, placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference2.x + reference2.width / 2 - element.width / 2;
    var commonY = reference2.y + reference2.height / 2 - element.height / 2;
    var offsets;
    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference2.y - element.height
        };
        break;
      case bottom:
        offsets = {
          x: commonX,
          y: reference2.y + reference2.height
        };
        break;
      case right:
        offsets = {
          x: reference2.x + reference2.width,
          y: commonY
        };
        break;
      case left:
        offsets = {
          x: reference2.x - element.width,
          y: commonY
        };
        break;
      default:
        offsets = {
          x: reference2.x,
          y: reference2.y
        };
    }
    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
    if (mainAxis != null) {
      var len = mainAxis === "y" ? "height" : "width";
      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference2[len] / 2 - element[len] / 2);
          break;
        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference2[len] / 2 - element[len] / 2);
          break;
        default:
      }
    }
    return offsets;
  }

  // node_modules/@popperjs/core/lib/utils/detectOverflow.js
  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, _options$placement = _options.placement, placement = _options$placement === void 0 ? state.placement : _options$placement, _options$strategy = _options.strategy, strategy = _options$strategy === void 0 ? state.strategy : _options$strategy, _options$boundary = _options.boundary, boundary = _options$boundary === void 0 ? clippingParents : _options$boundary, _options$rootBoundary = _options.rootBoundary, rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary, _options$elementConte = _options.elementContext, elementContext = _options$elementConte === void 0 ? popper : _options$elementConte, _options$altBoundary = _options.altBoundary, altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary, _options$padding = _options.padding, padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== "number" ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets2 = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      strategy: "absolute",
      placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets2));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset;
    if (elementContext === popper && offsetData) {
      var offset2 = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function(key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? "y" : "x";
        overflowOffsets[key] += offset2[axis] * multiply;
      });
    }
    return overflowOffsets;
  }

  // node_modules/@popperjs/core/lib/utils/computeAutoPlacement.js
  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, placement = _options.placement, boundary = _options.boundary, rootBoundary = _options.rootBoundary, padding = _options.padding, flipVariations = _options.flipVariations, _options$allowedAutoP = _options.allowedAutoPlacements, allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements2 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function(placement2) {
      return getVariation(placement2) === variation;
    }) : basePlacements;
    var allowedPlacements = placements2.filter(function(placement2) {
      return allowedAutoPlacements.indexOf(placement2) >= 0;
    });
    if (allowedPlacements.length === 0) {
      allowedPlacements = placements2;
    }
    var overflows = allowedPlacements.reduce(function(acc, placement2) {
      acc[placement2] = detectOverflow(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding
      })[getBasePlacement(placement2)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function(a, b) {
      return overflows[a] - overflows[b];
    });
  }

  // node_modules/@popperjs/core/lib/modifiers/flip.js
  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }
    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }
  function flip(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    if (state.modifiersData[name]._skip) {
      return;
    }
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis, specifiedFallbackPlacements = options.fallbackPlacements, padding = options.padding, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, _options$flipVariatio = options.flipVariations, flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio, allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements2 = [preferredPlacement].concat(fallbackPlacements).reduce(function(acc, placement2) {
      return acc.concat(getBasePlacement(placement2) === auto ? computeAutoPlacement(state, {
        placement: placement2,
        boundary,
        rootBoundary,
        padding,
        flipVariations,
        allowedAutoPlacements
      }) : placement2);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = /* @__PURE__ */ new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements2[0];
    for (var i = 0; i < placements2.length; i++) {
      var placement = placements2[i];
      var _basePlacement = getBasePlacement(placement);
      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? "width" : "height";
      var overflow = detectOverflow(state, {
        placement,
        boundary,
        rootBoundary,
        altBoundary,
        padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }
      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];
      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }
      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }
      if (checks.every(function(check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }
      checksMap.set(placement, checks);
    }
    if (makeFallbackChecks) {
      var numberOfChecks = flipVariations ? 3 : 1;
      var _loop = function _loop2(_i2) {
        var fittingPlacement = placements2.find(function(placement2) {
          var checks2 = checksMap.get(placement2);
          if (checks2) {
            return checks2.slice(0, _i2).every(function(check) {
              return check;
            });
          }
        });
        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };
      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);
        if (_ret === "break") break;
      }
    }
    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  }
  var flip_default = {
    name: "flip",
    enabled: true,
    phase: "main",
    fn: flip,
    requiresIfExists: ["offset"],
    data: {
      _skip: false
    }
  };

  // node_modules/@popperjs/core/lib/modifiers/hide.js
  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }
    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }
  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function(side) {
      return overflow[side] >= 0;
    });
  }
  function hide(_ref) {
    var state = _ref.state, name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: "reference"
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets,
      popperEscapeOffsets,
      isReferenceHidden,
      hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      "data-popper-reference-hidden": isReferenceHidden,
      "data-popper-escaped": hasPopperEscaped
    });
  }
  var hide_default = {
    name: "hide",
    enabled: true,
    phase: "main",
    requiresIfExists: ["preventOverflow"],
    fn: hide
  };

  // node_modules/@popperjs/core/lib/modifiers/offset.js
  function distanceAndSkiddingToXY(placement, rects, offset2) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
    var _ref = typeof offset2 === "function" ? offset2(Object.assign({}, rects, {
      placement
    })) : offset2, skidding = _ref[0], distance = _ref[1];
    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }
  function offset(_ref2) {
    var state = _ref2.state, options = _ref2.options, name = _ref2.name;
    var _options$offset = options.offset, offset2 = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function(acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset2);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement], x = _data$state$placement.x, y = _data$state$placement.y;
    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }
    state.modifiersData[name] = data;
  }
  var offset_default = {
    name: "offset",
    enabled: true,
    phase: "main",
    requires: ["popperOffsets"],
    fn: offset
  };

  // node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
  function popperOffsets(_ref) {
    var state = _ref.state, name = _ref.name;
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      strategy: "absolute",
      placement: state.placement
    });
  }
  var popperOffsets_default = {
    name: "popperOffsets",
    enabled: true,
    phase: "read",
    fn: popperOffsets,
    data: {}
  };

  // node_modules/@popperjs/core/lib/utils/getAltAxis.js
  function getAltAxis(axis) {
    return axis === "x" ? "y" : "x";
  }

  // node_modules/@popperjs/core/lib/modifiers/preventOverflow.js
  function preventOverflow(_ref) {
    var state = _ref.state, options = _ref.options, name = _ref.name;
    var _options$mainAxis = options.mainAxis, checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis, _options$altAxis = options.altAxis, checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis, boundary = options.boundary, rootBoundary = options.rootBoundary, altBoundary = options.altBoundary, padding = options.padding, _options$tether = options.tether, tether = _options$tether === void 0 ? true : _options$tether, _options$tetherOffset = options.tetherOffset, tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary,
      rootBoundary,
      padding,
      altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets2 = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === "function" ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === "number" ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };
    if (!popperOffsets2) {
      return;
    }
    if (checkMainAxis) {
      var _offsetModifierState$;
      var mainSide = mainAxis === "y" ? top : left;
      var altSide = mainAxis === "y" ? bottom : right;
      var len = mainAxis === "y" ? "height" : "width";
      var offset2 = popperOffsets2[mainAxis];
      var min2 = offset2 + overflow[mainSide];
      var max2 = offset2 - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData["arrow#persistent"] ? state.modifiersData["arrow#persistent"].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide];
      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === "y" ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset2 + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset2 + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min2, tetherMin) : min2, offset2, tether ? max(max2, tetherMax) : max2);
      popperOffsets2[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset2;
    }
    if (checkAltAxis) {
      var _offsetModifierState$2;
      var _mainSide = mainAxis === "x" ? top : left;
      var _altSide = mainAxis === "x" ? bottom : right;
      var _offset = popperOffsets2[altAxis];
      var _len = altAxis === "y" ? "height" : "width";
      var _min = _offset + overflow[_mainSide];
      var _max = _offset - overflow[_altSide];
      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
      popperOffsets2[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }
    state.modifiersData[name] = data;
  }
  var preventOverflow_default = {
    name: "preventOverflow",
    enabled: true,
    phase: "main",
    fn: preventOverflow,
    requiresIfExists: ["offset"]
  };

  // node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  // node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  // node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  }
  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }
    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  // node_modules/@popperjs/core/lib/utils/orderModifiers.js
  function order(modifiers) {
    var map = /* @__PURE__ */ new Map();
    var visited = /* @__PURE__ */ new Set();
    var result = [];
    modifiers.forEach(function(modifier) {
      map.set(modifier.name, modifier);
    });
    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function(dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);
          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }
    modifiers.forEach(function(modifier) {
      if (!visited.has(modifier.name)) {
        sort(modifier);
      }
    });
    return result;
  }
  function orderModifiers(modifiers) {
    var orderedModifiers = order(modifiers);
    return modifierPhases.reduce(function(acc, phase) {
      return acc.concat(orderedModifiers.filter(function(modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  // node_modules/@popperjs/core/lib/utils/debounce.js
  function debounce(fn2) {
    var pending;
    return function() {
      if (!pending) {
        pending = new Promise(function(resolve) {
          Promise.resolve().then(function() {
            pending = void 0;
            resolve(fn2());
          });
        });
      }
      return pending;
    };
  }

  // node_modules/@popperjs/core/lib/utils/mergeByName.js
  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function(merged2, current) {
      var existing = merged2[current.name];
      merged2[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged2;
    }, {});
    return Object.keys(merged).map(function(key) {
      return merged[key];
    });
  }

  // node_modules/@popperjs/core/lib/createPopper.js
  var DEFAULT_OPTIONS = {
    placement: "bottom",
    modifiers: [],
    strategy: "absolute"
  };
  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return !args.some(function(element) {
      return !(element && typeof element.getBoundingClientRect === "function");
    });
  }
  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }
    var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers3 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper4(reference2, popper2, options) {
      if (options === void 0) {
        options = defaultOptions;
      }
      var state = {
        placement: "bottom",
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference2,
          popper: popper2
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state,
        setOptions: function setOptions(setOptionsAction) {
          var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options2);
          state.scrollParents = {
            reference: isElement(reference2) ? listScrollParents(reference2) : reference2.contextElement ? listScrollParents(reference2.contextElement) : [],
            popper: listScrollParents(popper2)
          };
          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers3, state.options.modifiers)));
          state.orderedModifiers = orderedModifiers.filter(function(m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }
          var _state$elements = state.elements, reference3 = _state$elements.reference, popper3 = _state$elements.popper;
          if (!areValidElements(reference3, popper3)) {
            return;
          }
          state.rects = {
            reference: getCompositeRect(reference3, getOffsetParent(popper3), state.options.strategy === "fixed"),
            popper: getLayoutRect(popper3)
          };
          state.reset = false;
          state.placement = state.options.placement;
          state.orderedModifiers.forEach(function(modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });
          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }
            var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
            if (typeof fn2 === "function") {
              state = fn2({
                state,
                options: _options,
                name,
                instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function() {
          return new Promise(function(resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };
      if (!areValidElements(reference2, popper2)) {
        return instance;
      }
      instance.setOptions(options).then(function(state2) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state2);
        }
      });
      function runModifierEffects() {
        state.orderedModifiers.forEach(function(_ref) {
          var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect4 = _ref.effect;
          if (typeof effect4 === "function") {
            var cleanupFn = effect4({
              state,
              name,
              instance,
              options: options2
            });
            var noopFn = function noopFn2() {
            };
            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }
      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function(fn2) {
          return fn2();
        });
        effectCleanupFns = [];
      }
      return instance;
    };
  }
  var createPopper = /* @__PURE__ */ popperGenerator();

  // node_modules/@popperjs/core/lib/popper-lite.js
  var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default];
  var createPopper2 = /* @__PURE__ */ popperGenerator({
    defaultModifiers
  });

  // node_modules/@popperjs/core/lib/popper.js
  var defaultModifiers2 = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default, offset_default, flip_default, preventOverflow_default, arrow_default, hide_default];
  var createPopper3 = /* @__PURE__ */ popperGenerator({
    defaultModifiers: defaultModifiers2
  });

  // node_modules/bootstrap/dist/js/bootstrap.esm.js
  var elementMap = /* @__PURE__ */ new Map();
  var Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, /* @__PURE__ */ new Map());
      }
      const instanceMap = elementMap.get(element);
      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }
      instanceMap.set(key, instance);
    },
    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }
      return null;
    },
    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }
      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);
      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };
  var MAX_UID = 1e6;
  var MILLISECONDS_MULTIPLIER = 1e3;
  var TRANSITION_END = "transitionend";
  var parseSelector = (selector) => {
    if (selector && window.CSS && window.CSS.escape) {
      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    }
    return selector;
  };
  var toType = (object) => {
    if (object === null || object === void 0) {
      return `${object}`;
    }
    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };
  var getUID = (prefix) => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  var getTransitionDurationFromElement = (element) => {
    if (!element) {
      return 0;
    }
    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }
    transitionDuration = transitionDuration.split(",")[0];
    transitionDelay = transitionDelay.split(",")[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };
  var triggerTransitionEnd = (element) => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  var isElement2 = (object) => {
    if (!object || typeof object !== "object") {
      return false;
    }
    if (typeof object.jquery !== "undefined") {
      object = object[0];
    }
    return typeof object.nodeType !== "undefined";
  };
  var getElement = (object) => {
    if (isElement2(object)) {
      return object.jquery ? object[0] : object;
    }
    if (typeof object === "string" && object.length > 0) {
      return document.querySelector(parseSelector(object));
    }
    return null;
  };
  var isVisible = (element) => {
    if (!isElement2(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
    const closedDetails = element.closest("details:not([open])");
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest("summary");
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  var isDisabled = (element) => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains("disabled")) {
      return true;
    }
    if (typeof element.disabled !== "undefined") {
      return element.disabled;
    }
    return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
  };
  var findShadowRoot = (element) => {
    if (!document.documentElement.attachShadow) {
      return null;
    }
    if (typeof element.getRootNode === "function") {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }
    if (element instanceof ShadowRoot) {
      return element;
    }
    if (!element.parentNode) {
      return null;
    }
    return findShadowRoot(element.parentNode);
  };
  var noop = () => {
  };
  var reflow = (element) => {
    element.offsetHeight;
  };
  var getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
      return window.jQuery;
    }
    return null;
  };
  var DOMContentLoadedCallbacks = [];
  var onDOMContentLoaded = (callback) => {
    if (document.readyState === "loading") {
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener("DOMContentLoaded", () => {
          for (const callback2 of DOMContentLoadedCallbacks) {
            callback2();
          }
        });
      }
      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  var isRTL = () => document.documentElement.dir === "rtl";
  var defineJQueryPlugin = (plugin) => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;
        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  var execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    return typeof possibleCallback === "function" ? possibleCallback(...args) : defaultValue;
  };
  var executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };
  var getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement);
    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }
    index += shouldGetNext ? 1 : -1;
    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }
    return list[Math.max(0, Math.min(index, listLength - 1))];
  };
  var namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  var stripNameRegex = /\..*/;
  var stripUidRegex = /::\d+$/;
  var eventRegistry = {};
  var uidEvent = 1;
  var customEvents = {
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  };
  var nativeEvents = /* @__PURE__ */ new Set(["click", "dblclick", "mouseup", "mousedown", "contextmenu", "mousewheel", "DOMMouseScroll", "mouseover", "mouseout", "mousemove", "selectstart", "selectend", "keydown", "keypress", "keyup", "orientationchange", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointercancel", "gesturestart", "gesturechange", "gestureend", "focus", "blur", "change", "reset", "select", "submit", "focusin", "focusout", "load", "unload", "beforeunload", "resize", "move", "DOMContentLoaded", "readystatechange", "error", "abort", "scroll"]);
  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }
  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn2) {
    return function handler(event) {
      hydrateObj(event, {
        delegateTarget: element
      });
      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn2);
      }
      return fn2.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn2) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }
          hydrateObj(event, {
            delegateTarget: target
          });
          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn2);
          }
          return fn2.apply(target, [event]);
        }
      }
    };
  }
  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
  }
  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === "string";
    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);
    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }
    return [isDelegated, callable, typeEvent];
  }
  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== "string" || !element) {
      return;
    }
    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
    if (originalTypeEvent in customEvents) {
      const wrapFunction = (fn3) => {
        return function(event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn3.call(this, event);
          }
        };
      };
      callable = wrapFunction(callable);
    }
    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }
    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
    const fn2 = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn2.delegationSelector = isDelegated ? handler : null;
    fn2.callable = callable;
    fn2.oneOff = oneOff;
    fn2.uidEvent = uid;
    handlers[uid] = fn2;
    element.addEventListener(typeEvent, fn2, isDelegated);
  }
  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn2 = findHandler(events[typeEvent], handler, delegationSelector);
    if (!fn2) {
      return;
    }
    element.removeEventListener(typeEvent, fn2, Boolean(delegationSelector));
    delete events[typeEvent][fn2.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }
  function getTypeEvent(event) {
    event = event.replace(stripNameRegex, "");
    return customEvents[event] || event;
  }
  var EventHandler = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },
    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },
    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== "string" || !element) {
        return;
      }
      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith(".");
      if (typeof callable !== "undefined") {
        if (!Object.keys(storeElementEvent).length) {
          return;
        }
        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }
      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }
      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, "");
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },
    trigger(element, event, args) {
      if (typeof event !== "string" || !element) {
        return null;
      }
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
      const evt = hydrateObj(new Event(event, {
        bubbles,
        cancelable: true
      }), args);
      if (defaultPrevented) {
        evt.preventDefault();
      }
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }
      return evt;
    }
  };
  function hydrateObj(obj, meta = {}) {
    for (const [key, value] of Object.entries(meta)) {
      try {
        obj[key] = value;
      } catch (_unused) {
        Object.defineProperty(obj, key, {
          configurable: true,
          get() {
            return value;
          }
        });
      }
    }
    return obj;
  }
  function normalizeData(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === "" || value === "null") {
      return null;
    }
    if (typeof value !== "string") {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
  }
  var Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, "");
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }
  };
  var Config = class {
    // Getters
    static get Default() {
      return {};
    }
    static get DefaultType() {
      return {};
    }
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      return config;
    }
    _mergeConfigObj(config, element) {
      const jsonConfig = isElement2(element) ? Manipulator.getDataAttribute(element, "config") : {};
      return __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, this.constructor.Default), typeof jsonConfig === "object" ? jsonConfig : {}), isElement2(element) ? Manipulator.getDataAttributes(element) : {}), typeof config === "object" ? config : {});
    }
    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
      for (const [property, expectedTypes] of Object.entries(configTypes)) {
        const value = config[property];
        const valueType = isElement2(value) ? "element" : toType(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
        }
      }
    }
  };
  var VERSION = "5.3.3";
  var BaseComponent = class extends Config {
    constructor(element, config) {
      super();
      element = getElement(element);
      if (!element) {
        return;
      }
      this._element = element;
      this._config = this._getConfig(config);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }
    // Public
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config, this._element);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    // Static
    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
    }
    static get VERSION() {
      return VERSION;
    }
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }
  };
  var getSelector = (element) => {
    let selector = element.getAttribute("data-bs-target");
    if (!selector || selector === "#") {
      let hrefAttribute = element.getAttribute("href");
      if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
        return null;
      }
      if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
        hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
      }
      selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
    }
    return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
  };
  var SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },
    children(element, selector) {
      return [].concat(...element.children).filter((child) => child.matches(selector));
    },
    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);
      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }
      return parents;
    },
    prev(element, selector) {
      let previous = element.previousElementSibling;
      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }
        previous = previous.previousElementSibling;
      }
      return [];
    },
    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling;
      while (next) {
        if (next.matches(selector)) {
          return [next];
        }
        next = next.nextElementSibling;
      }
      return [];
    },
    focusableChildren(element) {
      const focusables = ["a", "button", "input", "textarea", "select", "details", "[tabindex]", '[contenteditable="true"]'].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
      return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
    },
    getSelectorFromElement(element) {
      const selector = getSelector(element);
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null;
      }
      return null;
    },
    getElementFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.findOne(selector) : null;
    },
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.find(selector) : [];
    }
  };
  var enableDismissTrigger = (component, method = "hide") => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
      if (["A", "AREA"].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target);
      instance[method]();
    });
  };
  var NAME$f = "alert";
  var DATA_KEY$a = "bs.alert";
  var EVENT_KEY$b = `.${DATA_KEY$a}`;
  var EVENT_CLOSE = `close${EVENT_KEY$b}`;
  var EVENT_CLOSED = `closed${EVENT_KEY$b}`;
  var CLASS_NAME_FADE$5 = "fade";
  var CLASS_NAME_SHOW$8 = "show";
  var Alert = class _Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$f;
    }
    // Public
    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
      if (closeEvent.defaultPrevented) {
        return;
      }
      this._element.classList.remove(CLASS_NAME_SHOW$8);
      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    }
    // Private
    _destroyElement() {
      this._element.remove();
      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Alert.getOrCreateInstance(this);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  };
  enableDismissTrigger(Alert, "close");
  defineJQueryPlugin(Alert);
  var NAME$e = "button";
  var DATA_KEY$9 = "bs.button";
  var EVENT_KEY$a = `.${DATA_KEY$9}`;
  var DATA_API_KEY$6 = ".data-api";
  var CLASS_NAME_ACTIVE$3 = "active";
  var SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  var EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
  var Button = class _Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$e;
    }
    // Public
    toggle() {
      this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Button.getOrCreateInstance(this);
        if (config === "toggle") {
          data[config]();
        }
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, (event) => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });
  defineJQueryPlugin(Button);
  var NAME$d = "swipe";
  var EVENT_KEY$9 = ".bs.swipe";
  var EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
  var EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
  var EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
  var EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
  var EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
  var POINTER_TYPE_TOUCH = "touch";
  var POINTER_TYPE_PEN = "pen";
  var CLASS_NAME_POINTER_EVENT = "pointer-event";
  var SWIPE_THRESHOLD = 40;
  var Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  var DefaultType$c = {
    endCallback: "(function|null)",
    leftCallback: "(function|null)",
    rightCallback: "(function|null)"
  };
  var Swipe = class _Swipe extends Config {
    constructor(element, config) {
      super();
      this._element = element;
      if (!element || !_Swipe.isSupported()) {
        return;
      }
      this._config = this._getConfig(config);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);
      this._initEvents();
    }
    // Getters
    static get Default() {
      return Default$c;
    }
    static get DefaultType() {
      return DefaultType$c;
    }
    static get NAME() {
      return NAME$d;
    }
    // Public
    dispose() {
      EventHandler.off(this._element, EVENT_KEY$9);
    }
    // Private
    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }
    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }
      this._handleSwipe();
      execute(this._config.endCallback);
    }
    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }
    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);
      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }
      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;
      if (!direction) {
        return;
      }
      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }
    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
      }
    }
    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    }
    // Static
    static isSupported() {
      return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
    }
  };
  var NAME$c = "carousel";
  var DATA_KEY$8 = "bs.carousel";
  var EVENT_KEY$8 = `.${DATA_KEY$8}`;
  var DATA_API_KEY$5 = ".data-api";
  var ARROW_LEFT_KEY$1 = "ArrowLeft";
  var ARROW_RIGHT_KEY$1 = "ArrowRight";
  var TOUCHEVENT_COMPAT_WAIT = 500;
  var ORDER_NEXT = "next";
  var ORDER_PREV = "prev";
  var DIRECTION_LEFT = "left";
  var DIRECTION_RIGHT = "right";
  var EVENT_SLIDE = `slide${EVENT_KEY$8}`;
  var EVENT_SLID = `slid${EVENT_KEY$8}`;
  var EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
  var EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
  var EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
  var EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
  var EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  var EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  var CLASS_NAME_CAROUSEL = "carousel";
  var CLASS_NAME_ACTIVE$2 = "active";
  var CLASS_NAME_SLIDE = "slide";
  var CLASS_NAME_END = "carousel-item-end";
  var CLASS_NAME_START = "carousel-item-start";
  var CLASS_NAME_NEXT = "carousel-item-next";
  var CLASS_NAME_PREV = "carousel-item-prev";
  var SELECTOR_ACTIVE = ".active";
  var SELECTOR_ITEM = ".carousel-item";
  var SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  var SELECTOR_ITEM_IMG = ".carousel-item img";
  var SELECTOR_INDICATORS = ".carousel-indicators";
  var SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
  var SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  var KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  var Default$b = {
    interval: 5e3,
    keyboard: true,
    pause: "hover",
    ride: false,
    touch: true,
    wrap: true
  };
  var DefaultType$b = {
    interval: "(number|boolean)",
    // TODO:v6 remove boolean support
    keyboard: "boolean",
    pause: "(string|boolean)",
    ride: "(boolean|string)",
    touch: "boolean",
    wrap: "boolean"
  };
  var Carousel = class _Carousel extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._addEventListeners();
      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    }
    // Getters
    static get Default() {
      return Default$b;
    }
    static get DefaultType() {
      return DefaultType$b;
    }
    static get NAME() {
      return NAME$c;
    }
    // Public
    next() {
      this._slide(ORDER_NEXT);
    }
    nextWhenVisible() {
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }
    prev() {
      this._slide(ORDER_PREV);
    }
    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }
      this._clearInterval();
    }
    cycle() {
      this._clearInterval();
      this._updateInterval();
      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }
    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }
      this.cycle();
    }
    to(index) {
      const items = this._getItems();
      if (index > items.length - 1 || index < 0) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }
      const activeIndex = this._getItemIndex(this._getActive());
      if (activeIndex === index) {
        return;
      }
      const order2 = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
      this._slide(order2, items[index]);
    }
    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }
      super.dispose();
    }
    // Private
    _configAfterMerge(config) {
      config.defaultInterval = config.interval;
      return config;
    }
    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, (event) => this._keydown(event));
      }
      if (this._config.pause === "hover") {
        EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }
      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }
    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler.on(img, EVENT_DRAG_START, (event) => event.preventDefault());
      }
      const endCallBack = () => {
        if (this._config.pause !== "hover") {
          return;
        }
        this.pause();
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }
        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };
      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }
    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        this._slide(this._directionToOrder(direction));
      }
    }
    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }
    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }
      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute("aria-current");
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute("aria-current", "true");
      }
    }
    _updateInterval() {
      const element = this._activeElement || this._getActive();
      if (!element) {
        return;
      }
      const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }
    _slide(order2, element = null) {
      if (this._isSliding) {
        return;
      }
      const activeElement = this._getActive();
      const isNext = order2 === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
      if (nextElement === activeElement) {
        return;
      }
      const nextElementIndex = this._getItemIndex(nextElement);
      const triggerEvent = (eventName) => {
        return EventHandler.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order2),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };
      const slideEvent = triggerEvent(EVENT_SLIDE);
      if (slideEvent.defaultPrevented) {
        return;
      }
      if (!activeElement || !nextElement) {
        return;
      }
      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;
      this._setActiveIndicatorElement(nextElementIndex);
      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };
      this._queueCallback(completeCallBack, activeElement, this._isAnimated());
      if (isCycling) {
        this.cycle();
      }
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }
    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }
    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }
    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }
    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }
      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }
    _orderToDirection(order2) {
      if (isRTL()) {
        return order2 === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return order2 === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Carousel.getOrCreateInstance(this, config);
        if (typeof config === "number") {
          data.to(config);
          return;
        }
        if (typeof config === "string") {
          if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }
    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute("data-bs-slide-to");
    if (slideIndex) {
      carousel.to(slideIndex);
      carousel._maybeEnableCycle();
      return;
    }
    if (Manipulator.getDataAttribute(this, "slide") === "next") {
      carousel.next();
      carousel._maybeEnableCycle();
      return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
      Carousel.getOrCreateInstance(carousel);
    }
  });
  defineJQueryPlugin(Carousel);
  var NAME$b = "collapse";
  var DATA_KEY$7 = "bs.collapse";
  var EVENT_KEY$7 = `.${DATA_KEY$7}`;
  var DATA_API_KEY$4 = ".data-api";
  var EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
  var EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
  var EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
  var EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
  var EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  var CLASS_NAME_SHOW$7 = "show";
  var CLASS_NAME_COLLAPSE = "collapse";
  var CLASS_NAME_COLLAPSING = "collapsing";
  var CLASS_NAME_COLLAPSED = "collapsed";
  var CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  var CLASS_NAME_HORIZONTAL = "collapse-horizontal";
  var WIDTH = "width";
  var HEIGHT = "height";
  var SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
  var SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  var Default$a = {
    parent: null,
    toggle: true
  };
  var DefaultType$a = {
    parent: "(null|element)",
    toggle: "boolean"
  };
  var Collapse = class _Collapse extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
      for (const elem of toggleList) {
        const selector = SelectorEngine.getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter((foundElement) => foundElement === this._element);
        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }
      this._initializeChildren();
      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }
      if (this._config.toggle) {
        this.toggle();
      }
    }
    // Getters
    static get Default() {
      return Default$a;
    }
    static get DefaultType() {
      return DefaultType$a;
    }
    static get NAME() {
      return NAME$b;
    }
    // Public
    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }
      let activeChildren = [];
      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element).map((element) => _Collapse.getOrCreateInstance(element, {
          toggle: false
        }));
      }
      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }
      const dimension = this._getDimension();
      this._element.classList.remove(CLASS_NAME_COLLAPSE);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;
      this._addAriaAndCollapsedClass(this._triggerArray, true);
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        this._element.style[dimension] = "";
        EventHandler.trigger(this._element, EVENT_SHOWN$6);
      };
      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;
      this._queueCallback(complete, this._element, true);
      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }
    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      const dimension = this._getDimension();
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      for (const trigger of this._triggerArray) {
        const element = SelectorEngine.getElementFromSelector(trigger);
        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE);
        EventHandler.trigger(this._element, EVENT_HIDDEN$6);
      };
      this._element.style[dimension] = "";
      this._queueCallback(complete, this._element, true);
    }
    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    }
    // Private
    _configAfterMerge(config) {
      config.toggle = Boolean(config.toggle);
      config.parent = getElement(config.parent);
      return config;
    }
    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }
    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }
      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
      for (const element of children) {
        const selected = SelectorEngine.getElementFromSelector(element);
        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }
    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      return SelectorEngine.find(selector, this._config.parent).filter((element) => !children.includes(element));
    }
    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }
      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute("aria-expanded", isOpen);
      }
    }
    // Static
    static jQueryInterface(config) {
      const _config = {};
      if (typeof config === "string" && /show|hide/.test(config)) {
        _config.toggle = false;
      }
      return this.each(function() {
        const data = _Collapse.getOrCreateInstance(this, _config);
        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function(event) {
    if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
      event.preventDefault();
    }
    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    }
  });
  defineJQueryPlugin(Collapse);
  var NAME$a = "dropdown";
  var DATA_KEY$6 = "bs.dropdown";
  var EVENT_KEY$6 = `.${DATA_KEY$6}`;
  var DATA_API_KEY$3 = ".data-api";
  var ESCAPE_KEY$2 = "Escape";
  var TAB_KEY$1 = "Tab";
  var ARROW_UP_KEY$1 = "ArrowUp";
  var ARROW_DOWN_KEY$1 = "ArrowDown";
  var RIGHT_MOUSE_BUTTON = 2;
  var EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  var EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  var EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  var EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  var EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  var EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
  var EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
  var CLASS_NAME_SHOW$6 = "show";
  var CLASS_NAME_DROPUP = "dropup";
  var CLASS_NAME_DROPEND = "dropend";
  var CLASS_NAME_DROPSTART = "dropstart";
  var CLASS_NAME_DROPUP_CENTER = "dropup-center";
  var CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
  var SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  var SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
  var SELECTOR_MENU = ".dropdown-menu";
  var SELECTOR_NAVBAR = ".navbar";
  var SELECTOR_NAVBAR_NAV = ".navbar-nav";
  var SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
  var PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
  var PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
  var PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
  var PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
  var PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
  var PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
  var PLACEMENT_TOPCENTER = "top";
  var PLACEMENT_BOTTOMCENTER = "bottom";
  var Default$9 = {
    autoClose: true,
    boundary: "clippingParents",
    display: "dynamic",
    offset: [0, 2],
    popperConfig: null,
    reference: "toggle"
  };
  var DefaultType$9 = {
    autoClose: "(boolean|string)",
    boundary: "(string|element)",
    display: "string",
    offset: "(array|string|function)",
    popperConfig: "(null|object|function)",
    reference: "(string|element|object)"
  };
  var Dropdown = class _Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._popper = null;
      this._parent = this._element.parentNode;
      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    }
    // Getters
    static get Default() {
      return Default$9;
    }
    static get DefaultType() {
      return DefaultType$9;
    }
    static get NAME() {
      return NAME$a;
    }
    // Public
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._createPopper();
      if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, "mouseover", noop);
        }
      }
      this._element.focus();
      this._element.setAttribute("aria-expanded", true);
      this._menu.classList.add(CLASS_NAME_SHOW$6);
      this._element.classList.add(CLASS_NAME_SHOW$6);
      EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
    }
    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      this._completeHide(relatedTarget);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper) {
        this._popper.update();
      }
    }
    // Private
    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
      if (hideEvent.defaultPrevented) {
        return;
      }
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, "mouseover", noop);
        }
      }
      if (this._popper) {
        this._popper.destroy();
      }
      this._menu.classList.remove(CLASS_NAME_SHOW$6);
      this._element.classList.remove(CLASS_NAME_SHOW$6);
      this._element.setAttribute("aria-expanded", "false");
      Manipulator.removeDataAttribute(this._menu, "popper");
      EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
    }
    _getConfig(config) {
      config = super._getConfig(config);
      if (typeof config.reference === "object" && !isElement2(config.reference) && typeof config.reference.getBoundingClientRect !== "function") {
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }
      return config;
    }
    _createPopper() {
      if (typeof lib_exports === "undefined") {
        throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org)");
      }
      let referenceElement = this._element;
      if (this._config.reference === "parent") {
        referenceElement = this._parent;
      } else if (isElement2(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === "object") {
        referenceElement = this._config.reference;
      }
      const popperConfig = this._getPopperConfig();
      this._popper = createPopper3(referenceElement, this._menu, popperConfig);
    }
    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }
    _getPlacement() {
      const parentDropdown = this._parent;
      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      }
      const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }
      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }
    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }
    _getOffset() {
      const {
        offset: offset2
      } = this._config;
      if (typeof offset2 === "string") {
        return offset2.split(",").map((value) => Number.parseInt(value, 10));
      }
      if (typeof offset2 === "function") {
        return (popperData) => offset2(popperData, this._element);
      }
      return offset2;
    }
    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: "preventOverflow",
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: "offset",
          options: {
            offset: this._getOffset()
          }
        }]
      };
      if (this._inNavbar || this._config.display === "static") {
        Manipulator.setDataAttribute(this._menu, "popper", "static");
        defaultBsPopperConfig.modifiers = [{
          name: "applyStyles",
          enabled: false
        }];
      }
      return __spreadValues(__spreadValues({}, defaultBsPopperConfig), execute(this._config.popperConfig, [defaultBsPopperConfig]));
    }
    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
      if (!items.length) {
        return;
      }
      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Dropdown.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY$1) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = _Dropdown.getInstance(toggle);
        if (!context || context._config.autoClose === false) {
          continue;
        }
        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);
        if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
          continue;
        }
        if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }
        const relatedTarget = {
          relatedTarget: context._element
        };
        if (event.type === "click") {
          relatedTarget.clickEvent = event;
        }
        context._completeHide(relatedTarget);
      }
    }
    static dataApiKeydownHandler(event) {
      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }
      if (isInput && !isEscapeEvent) {
        return;
      }
      event.preventDefault();
      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
      const instance = _Dropdown.getOrCreateInstance(getToggleButton);
      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();
        instance._selectMenuItem(event);
        return;
      }
      if (instance._isShown()) {
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }
  };
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function(event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });
  defineJQueryPlugin(Dropdown);
  var NAME$9 = "backdrop";
  var CLASS_NAME_FADE$4 = "fade";
  var CLASS_NAME_SHOW$5 = "show";
  var EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  var Default$8 = {
    className: "modal-backdrop",
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    rootElement: "body"
    // give the choice to place backdrop under different elements
  };
  var DefaultType$8 = {
    className: "string",
    clickCallback: "(function|null)",
    isAnimated: "boolean",
    isVisible: "boolean",
    rootElement: "(element|string)"
  };
  var Backdrop = class extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }
    // Getters
    static get Default() {
      return Default$8;
    }
    static get DefaultType() {
      return DefaultType$8;
    }
    static get NAME() {
      return NAME$9;
    }
    // Public
    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._append();
      const element = this._getElement();
      if (this._config.isAnimated) {
        reflow(element);
      }
      element.classList.add(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        execute(callback);
      });
    }
    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._getElement().classList.remove(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }
    dispose() {
      if (!this._isAppended) {
        return;
      }
      EventHandler.off(this._element, EVENT_MOUSEDOWN);
      this._element.remove();
      this._isAppended = false;
    }
    // Private
    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement("div");
        backdrop.className = this._config.className;
        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }
        this._element = backdrop;
      }
      return this._element;
    }
    _configAfterMerge(config) {
      config.rootElement = getElement(config.rootElement);
      return config;
    }
    _append() {
      if (this._isAppended) {
        return;
      }
      const element = this._getElement();
      this._config.rootElement.append(element);
      EventHandler.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }
    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }
  };
  var NAME$8 = "focustrap";
  var DATA_KEY$5 = "bs.focustrap";
  var EVENT_KEY$5 = `.${DATA_KEY$5}`;
  var EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
  var EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
  var TAB_KEY = "Tab";
  var TAB_NAV_FORWARD = "forward";
  var TAB_NAV_BACKWARD = "backward";
  var Default$7 = {
    autofocus: true,
    trapElement: null
    // The element to trap focus inside of
  };
  var DefaultType$7 = {
    autofocus: "boolean",
    trapElement: "element"
  };
  var FocusTrap = class extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }
    // Getters
    static get Default() {
      return Default$7;
    }
    static get DefaultType() {
      return DefaultType$7;
    }
    static get NAME() {
      return NAME$8;
    }
    // Public
    activate() {
      if (this._isActive) {
        return;
      }
      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }
      EventHandler.off(document, EVENT_KEY$5);
      EventHandler.on(document, EVENT_FOCUSIN$2, (event) => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
      this._isActive = true;
    }
    deactivate() {
      if (!this._isActive) {
        return;
      }
      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$5);
    }
    // Private
    _handleFocusin(event) {
      const {
        trapElement
      } = this._config;
      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }
      const elements = SelectorEngine.focusableChildren(trapElement);
      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }
    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }
      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }
  };
  var SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
  var SELECTOR_STICKY_CONTENT = ".sticky-top";
  var PROPERTY_PADDING = "padding-right";
  var PROPERTY_MARGIN = "margin-right";
  var ScrollBarHelper = class {
    constructor() {
      this._element = document.body;
    }
    // Public
    getWidth() {
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }
    hide() {
      const width = this.getWidth();
      this._disableOverFlow();
      this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
    }
    reset() {
      this._resetElementAttributes(this._element, "overflow");
      this._resetElementAttributes(this._element, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }
    isOverflowing() {
      return this.getWidth() > 0;
    }
    // Private
    _disableOverFlow() {
      this._saveInitialAttribute(this._element, "overflow");
      this._element.style.overflow = "hidden";
    }
    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();
      const manipulationCallBack = (element) => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }
        this._saveInitialAttribute(element, styleProperty);
        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);
      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }
    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = (element) => {
        const value = Manipulator.getDataAttribute(element, styleProperty);
        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }
        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _applyManipulationCallback(selector, callBack) {
      if (isElement2(selector)) {
        callBack(selector);
        return;
      }
      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }
  };
  var NAME$7 = "modal";
  var DATA_KEY$4 = "bs.modal";
  var EVENT_KEY$4 = `.${DATA_KEY$4}`;
  var DATA_API_KEY$2 = ".data-api";
  var ESCAPE_KEY$1 = "Escape";
  var EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
  var EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
  var EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
  var EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
  var EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
  var EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
  var EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
  var EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
  var EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
  var EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
  var CLASS_NAME_OPEN = "modal-open";
  var CLASS_NAME_FADE$3 = "fade";
  var CLASS_NAME_SHOW$4 = "show";
  var CLASS_NAME_STATIC = "modal-static";
  var OPEN_SELECTOR$1 = ".modal.show";
  var SELECTOR_DIALOG = ".modal-dialog";
  var SELECTOR_MODAL_BODY = ".modal-body";
  var SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  var Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  var DefaultType$6 = {
    backdrop: "(boolean|string)",
    focus: "boolean",
    keyboard: "boolean"
  };
  var Modal = class _Modal extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
      this._addEventListeners();
    }
    // Getters
    static get Default() {
      return Default$6;
    }
    static get DefaultType() {
      return DefaultType$6;
    }
    static get NAME() {
      return NAME$7;
    }
    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW$4);
      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }
    dispose() {
      EventHandler.off(window, EVENT_KEY$4);
      EventHandler.off(this._dialog, EVENT_KEY$4);
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    handleUpdate() {
      this._adjustDialog();
    }
    // Private
    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value,
        isAnimated: this._isAnimated()
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _showElement(relatedTarget) {
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }
      this._element.style.display = "block";
      this._element.removeAttribute("aria-hidden");
      this._element.setAttribute("aria-modal", true);
      this._element.setAttribute("role", "dialog");
      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW$4);
      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }
        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$4, {
          relatedTarget
        });
      };
      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, (event) => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        this._triggerBackdropTransition();
      });
      EventHandler.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
        EventHandler.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }
          if (this._config.backdrop === "static") {
            this._triggerBackdropTransition();
            return;
          }
          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }
    _hideModal() {
      this._element.style.display = "none";
      this._element.setAttribute("aria-hidden", true);
      this._element.removeAttribute("aria-modal");
      this._element.removeAttribute("role");
      this._isTransitioning = false;
      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);
        this._resetAdjustments();
        this._scrollBar.reset();
        EventHandler.trigger(this._element, EVENT_HIDDEN$4);
      });
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }
    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY;
      if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }
      if (!isModalOverflowing) {
        this._element.style.overflowY = "hidden";
      }
      this._element.classList.add(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);
      this._element.focus();
    }
    /**
     * The following methods are used to handle overflowing modals
     */
    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const scrollbarWidth = this._scrollBar.getWidth();
      const isBodyOverflowing = scrollbarWidth > 0;
      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? "paddingLeft" : "paddingRight";
        this._element.style[property] = `${scrollbarWidth}px`;
      }
      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? "paddingRight" : "paddingLeft";
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }
    _resetAdjustments() {
      this._element.style.paddingLeft = "";
      this._element.style.paddingRight = "";
    }
    // Static
    static jQueryInterface(config, relatedTarget) {
      return this.each(function() {
        const data = _Modal.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    EventHandler.one(target, EVENT_SHOW$4, (showEvent) => {
      if (showEvent.defaultPrevented) {
        return;
      }
      EventHandler.one(target, EVENT_HIDDEN$4, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
    if (alreadyOpen) {
      Modal.getInstance(alreadyOpen).hide();
    }
    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);
  defineJQueryPlugin(Modal);
  var NAME$6 = "offcanvas";
  var DATA_KEY$3 = "bs.offcanvas";
  var EVENT_KEY$3 = `.${DATA_KEY$3}`;
  var DATA_API_KEY$1 = ".data-api";
  var EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
  var ESCAPE_KEY = "Escape";
  var CLASS_NAME_SHOW$3 = "show";
  var CLASS_NAME_SHOWING$1 = "showing";
  var CLASS_NAME_HIDING = "hiding";
  var CLASS_NAME_BACKDROP = "offcanvas-backdrop";
  var OPEN_SELECTOR = ".offcanvas.show";
  var EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
  var EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
  var EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
  var EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
  var EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
  var EVENT_RESIZE = `resize${EVENT_KEY$3}`;
  var EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
  var EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
  var SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  var Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  var DefaultType$5 = {
    backdrop: "(boolean|string)",
    keyboard: "boolean",
    scroll: "boolean"
  };
  var Offcanvas = class _Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._addEventListeners();
    }
    // Getters
    static get Default() {
      return Default$5;
    }
    static get DefaultType() {
      return DefaultType$5;
    }
    static get NAME() {
      return NAME$6;
    }
    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._backdrop.show();
      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }
      this._element.setAttribute("aria-modal", true);
      this._element.setAttribute("role", "dialog");
      this._element.classList.add(CLASS_NAME_SHOWING$1);
      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }
        this._element.classList.add(CLASS_NAME_SHOW$3);
        this._element.classList.remove(CLASS_NAME_SHOWING$1);
        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };
      this._queueCallback(completeCallBack, this._element, true);
    }
    hide() {
      if (!this._isShown) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.add(CLASS_NAME_HIDING);
      this._backdrop.hide();
      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
        this._element.removeAttribute("aria-modal");
        this._element.removeAttribute("role");
        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }
        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };
      this._queueCallback(completeCallback, this._element, true);
    }
    dispose() {
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    // Private
    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === "static") {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }
        this.hide();
      };
      const isVisible2 = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible: isVisible2,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible2 ? clickCallback : null
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
      });
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Offcanvas.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function(event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      if (isVisible(this)) {
        this.focus();
      }
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas.getInstance(alreadyOpen).hide();
    }
    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas.getOrCreateInstance(selector).show();
    }
  });
  EventHandler.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find("[aria-modal][class*=show][class*=offcanvas-]")) {
      if (getComputedStyle(element).position !== "fixed") {
        Offcanvas.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas);
  defineJQueryPlugin(Offcanvas);
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
    a: ["target", "href", "title", "rel"],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ["src", "srcset", "alt", "title", "width", "height"],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  var uriAttributes = /* @__PURE__ */ new Set(["background", "cite", "href", "itemtype", "longdesc", "poster", "src", "xlink:href"]);
  var SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
  var allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();
    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
      }
      return true;
    }
    return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }
    if (sanitizeFunction && typeof sanitizeFunction === "function") {
      return sanitizeFunction(unsafeHtml);
    }
    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
    const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();
      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }
      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }
  var NAME$5 = "TemplateFactory";
  var Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    // { selector : text ,  selector2 : text2 , }
    extraClass: "",
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: "<div></div>"
  };
  var DefaultType$4 = {
    allowList: "object",
    content: "object",
    extraClass: "(string|function)",
    html: "boolean",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    template: "string"
  };
  var DefaultContentType = {
    entry: "(string|element|function|null)",
    selector: "(string|element)"
  };
  var TemplateFactory = class extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
    }
    // Getters
    static get Default() {
      return Default$4;
    }
    static get DefaultType() {
      return DefaultType$4;
    }
    static get NAME() {
      return NAME$5;
    }
    // Public
    getContent() {
      return Object.values(this._config.content).map((config) => this._resolvePossibleFunction(config)).filter(Boolean);
    }
    hasContent() {
      return this.getContent().length > 0;
    }
    changeContent(content) {
      this._checkContent(content);
      this._config.content = __spreadValues(__spreadValues({}, this._config.content), content);
      return this;
    }
    toHtml() {
      const templateWrapper = document.createElement("div");
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }
      const template = templateWrapper.children[0];
      const extraClass = this._resolvePossibleFunction(this._config.extraClass);
      if (extraClass) {
        template.classList.add(...extraClass.split(" "));
      }
      return template;
    }
    // Private
    _typeCheckConfig(config) {
      super._typeCheckConfig(config);
      this._checkContent(config.content);
    }
    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({
          selector,
          entry: content
        }, DefaultContentType);
      }
    }
    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);
      if (!templateElement) {
        return;
      }
      content = this._resolvePossibleFunction(content);
      if (!content) {
        templateElement.remove();
        return;
      }
      if (isElement2(content)) {
        this._putElementInTemplate(getElement(content), templateElement);
        return;
      }
      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }
      templateElement.textContent = content;
    }
    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this]);
    }
    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = "";
        templateElement.append(element);
        return;
      }
      templateElement.textContent = element.textContent;
    }
  };
  var NAME$4 = "tooltip";
  var DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
  var CLASS_NAME_FADE$2 = "fade";
  var CLASS_NAME_MODAL = "modal";
  var CLASS_NAME_SHOW$2 = "show";
  var SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
  var SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  var EVENT_MODAL_HIDE = "hide.bs.modal";
  var TRIGGER_HOVER = "hover";
  var TRIGGER_FOCUS = "focus";
  var TRIGGER_CLICK = "click";
  var TRIGGER_MANUAL = "manual";
  var EVENT_HIDE$2 = "hide";
  var EVENT_HIDDEN$2 = "hidden";
  var EVENT_SHOW$2 = "show";
  var EVENT_SHOWN$2 = "shown";
  var EVENT_INSERTED = "inserted";
  var EVENT_CLICK$1 = "click";
  var EVENT_FOCUSIN$1 = "focusin";
  var EVENT_FOCUSOUT$1 = "focusout";
  var EVENT_MOUSEENTER = "mouseenter";
  var EVENT_MOUSELEAVE = "mouseleave";
  var AttachmentMap = {
    AUTO: "auto",
    TOP: "top",
    RIGHT: isRTL() ? "left" : "right",
    BOTTOM: "bottom",
    LEFT: isRTL() ? "right" : "left"
  };
  var Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: "clippingParents",
    container: false,
    customClass: "",
    delay: 0,
    fallbackPlacements: ["top", "right", "bottom", "left"],
    html: false,
    offset: [0, 6],
    placement: "top",
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    title: "",
    trigger: "hover focus"
  };
  var DefaultType$3 = {
    allowList: "object",
    animation: "boolean",
    boundary: "(string|element)",
    container: "(string|element|boolean)",
    customClass: "(string|function)",
    delay: "(number|object)",
    fallbackPlacements: "array",
    html: "boolean",
    offset: "(array|string|function)",
    placement: "(string|function)",
    popperConfig: "(null|object|function)",
    sanitize: "boolean",
    sanitizeFn: "(null|function)",
    selector: "(string|boolean)",
    template: "string",
    title: "(string|element|function)",
    trigger: "string"
  };
  var Tooltip = class _Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof lib_exports === "undefined") {
        throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org)");
      }
      super(element, config);
      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null;
      this.tip = null;
      this._setListeners();
      if (!this._config.selector) {
        this._fixTitle();
      }
    }
    // Getters
    static get Default() {
      return Default$3;
    }
    static get DefaultType() {
      return DefaultType$3;
    }
    static get NAME() {
      return NAME$4;
    }
    // Public
    enable() {
      this._isEnabled = true;
    }
    disable() {
      this._isEnabled = false;
    }
    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }
    toggle() {
      if (!this._isEnabled) {
        return;
      }
      this._activeTrigger.click = !this._activeTrigger.click;
      if (this._isShown()) {
        this._leave();
        return;
      }
      this._enter();
    }
    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      if (this._element.getAttribute("data-bs-original-title")) {
        this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
      }
      this._disposePopper();
      super.dispose();
    }
    show() {
      if (this._element.style.display === "none") {
        throw new Error("Please use show on visible elements");
      }
      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }
      this._disposePopper();
      const tip = this._getTipElement();
      this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
      const {
        container
      } = this._config;
      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }
      this._popper = this._createPopper(tip);
      tip.classList.add(CLASS_NAME_SHOW$2);
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, "mouseover", noop);
        }
      }
      const complete = () => {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
        if (this._isHovered === false) {
          this._leave();
        }
        this._isHovered = false;
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    hide() {
      if (!this._isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
      if (hideEvent.defaultPrevented) {
        return;
      }
      const tip = this._getTipElement();
      tip.classList.remove(CLASS_NAME_SHOW$2);
      if ("ontouchstart" in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, "mouseover", noop);
        }
      }
      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null;
      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }
        if (!this._isHovered) {
          this._disposePopper();
        }
        this._element.removeAttribute("aria-describedby");
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    update() {
      if (this._popper) {
        this._popper.update();
      }
    }
    // Protected
    _isWithContent() {
      return Boolean(this._getTitle());
    }
    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }
      return this.tip;
    }
    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml();
      if (!tip) {
        return null;
      }
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute("id", tipId);
      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }
      return tip;
    }
    setContent(content) {
      this._newContent = content;
      if (this._isShown()) {
        this._disposePopper();
        this.show();
      }
    }
    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory(__spreadProps(__spreadValues({}, this._config), {
          // the `content` var has to be after `this._config`
          // to override config.content in case of popover
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        }));
      }
      return this._templateFactory;
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }
    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
    }
    // Private
    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }
    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }
    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }
    _createPopper(tip) {
      const placement = execute(this._config.placement, [this, tip, this._element]);
      const attachment = AttachmentMap[placement.toUpperCase()];
      return createPopper3(this._element, tip, this._getPopperConfig(attachment));
    }
    _getOffset() {
      const {
        offset: offset2
      } = this._config;
      if (typeof offset2 === "string") {
        return offset2.split(",").map((value) => Number.parseInt(value, 10));
      }
      if (typeof offset2 === "function") {
        return (popperData) => offset2(popperData, this._element);
      }
      return offset2;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this._element]);
    }
    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: "flip",
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: "offset",
          options: {
            offset: this._getOffset()
          }
        }, {
          name: "preventOverflow",
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: "arrow",
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: "preSetPlacement",
          enabled: true,
          phase: "beforeMain",
          fn: (data) => {
            this._getTipElement().setAttribute("data-popper-placement", data.state.placement);
          }
        }]
      };
      return __spreadValues(__spreadValues({}, defaultBsPopperConfig), execute(this._config.popperConfig, [defaultBsPopperConfig]));
    }
    _setListeners() {
      const triggers = this._config.trigger.split(" ");
      for (const trigger of triggers) {
        if (trigger === "click") {
          EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler.on(this._element, eventIn, this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            context._enter();
          });
          EventHandler.on(this._element, eventOut, this._config.selector, (event) => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
            context._leave();
          });
        }
      }
      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };
      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }
    _fixTitle() {
      const title = this._element.getAttribute("title");
      if (!title) {
        return;
      }
      if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
        this._element.setAttribute("aria-label", title);
      }
      this._element.setAttribute("data-bs-original-title", title);
      this._element.removeAttribute("title");
    }
    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }
      this._isHovered = true;
      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }
    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }
      this._isHovered = false;
      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }
    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }
    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }
    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }
      config = __spreadValues(__spreadValues({}, dataAttributes), typeof config === "object" && config ? config : {});
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      config.container = config.container === false ? document.body : getElement(config.container);
      if (typeof config.delay === "number") {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }
      if (typeof config.title === "number") {
        config.title = config.title.toString();
      }
      if (typeof config.content === "number") {
        config.content = config.content.toString();
      }
      return config;
    }
    _getDelegateConfig() {
      const config = {};
      for (const [key, value] of Object.entries(this._config)) {
        if (this.constructor.Default[key] !== value) {
          config[key] = value;
        }
      }
      config.selector = false;
      config.trigger = "manual";
      return config;
    }
    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();
        this._popper = null;
      }
      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Tooltip.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  defineJQueryPlugin(Tooltip);
  var NAME$3 = "popover";
  var SELECTOR_TITLE = ".popover-header";
  var SELECTOR_CONTENT = ".popover-body";
  var Default$2 = __spreadProps(__spreadValues({}, Tooltip.Default), {
    content: "",
    offset: [0, 8],
    placement: "right",
    template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
    trigger: "click"
  });
  var DefaultType$2 = __spreadProps(__spreadValues({}, Tooltip.DefaultType), {
    content: "(null|string|element|function)"
  });
  var Popover = class _Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$2;
    }
    static get DefaultType() {
      return DefaultType$2;
    }
    static get NAME() {
      return NAME$3;
    }
    // Overrides
    _isWithContent() {
      return this._getTitle() || this._getContent();
    }
    // Private
    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }
    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Popover.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  defineJQueryPlugin(Popover);
  var NAME$2 = "scrollspy";
  var DATA_KEY$2 = "bs.scrollspy";
  var EVENT_KEY$2 = `.${DATA_KEY$2}`;
  var DATA_API_KEY = ".data-api";
  var EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  var EVENT_CLICK = `click${EVENT_KEY$2}`;
  var EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
  var CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
  var CLASS_NAME_ACTIVE$1 = "active";
  var SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  var SELECTOR_TARGET_LINKS = "[href]";
  var SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
  var SELECTOR_NAV_LINKS = ".nav-link";
  var SELECTOR_NAV_ITEMS = ".nav-item";
  var SELECTOR_LIST_ITEMS = ".list-group-item";
  var SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  var SELECTOR_DROPDOWN = ".dropdown";
  var SELECTOR_DROPDOWN_TOGGLE$1 = ".dropdown-toggle";
  var Default$1 = {
    offset: null,
    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: "0px 0px -25%",
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  var DefaultType$1 = {
    offset: "(number|null)",
    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: "string",
    smoothScroll: "boolean",
    target: "element",
    threshold: "array"
  };
  var ScrollSpy = class _ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._targetLinks = /* @__PURE__ */ new Map();
      this._observableSections = /* @__PURE__ */ new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh();
    }
    // Getters
    static get Default() {
      return Default$1;
    }
    static get DefaultType() {
      return DefaultType$1;
    }
    static get NAME() {
      return NAME$2;
    }
    // Public
    refresh() {
      this._initializeTargetsAndObservables();
      this._maybeEnableSmoothScroll();
      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }
      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }
    dispose() {
      this._observer.disconnect();
      super.dispose();
    }
    // Private
    _configAfterMerge(config) {
      config.target = getElement(config.target) || document.body;
      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
      if (typeof config.threshold === "string") {
        config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
      }
      return config;
    }
    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      }
      EventHandler.off(this._config.target, EVENT_CLICK);
      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, (event) => {
        const observableSection = this._observableSections.get(event.target.hash);
        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;
          if (root.scrollTo) {
            root.scrollTo({
              top: height,
              behavior: "smooth"
            });
            return;
          }
          root.scrollTop = height;
        }
      });
    }
    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver((entries) => this._observerCallback(entries), options);
    }
    // The logic of selection
    _observerCallback(entries) {
      const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
      const activate = (entry) => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
        this._process(targetElement(entry));
      };
      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;
          this._clearActiveClass(targetElement(entry));
          continue;
        }
        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry);
          if (!parentScrollTop) {
            return;
          }
          continue;
        }
        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }
    _initializeTargetsAndObservables() {
      this._targetLinks = /* @__PURE__ */ new Map();
      this._observableSections = /* @__PURE__ */ new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
      for (const anchor of targetLinks) {
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }
        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);
        if (isVisible(observableSection)) {
          this._targetLinks.set(decodeURI(anchor.hash), anchor);
          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }
    _process(target) {
      if (this._activeTarget === target) {
        return;
      }
      this._clearActiveClass(this._config.target);
      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);
      this._activateParents(target);
      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }
    _activateParents(target) {
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }
      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }
    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _ScrollSpy.getOrCreateInstance(this, config);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });
  defineJQueryPlugin(ScrollSpy);
  var NAME$1 = "tab";
  var DATA_KEY$1 = "bs.tab";
  var EVENT_KEY$1 = `.${DATA_KEY$1}`;
  var EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  var EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  var EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  var EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  var EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
  var EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
  var EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
  var ARROW_LEFT_KEY = "ArrowLeft";
  var ARROW_RIGHT_KEY = "ArrowRight";
  var ARROW_UP_KEY = "ArrowUp";
  var ARROW_DOWN_KEY = "ArrowDown";
  var HOME_KEY = "Home";
  var END_KEY = "End";
  var CLASS_NAME_ACTIVE = "active";
  var CLASS_NAME_FADE$1 = "fade";
  var CLASS_NAME_SHOW$1 = "show";
  var CLASS_DROPDOWN = "dropdown";
  var SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
  var SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
  var NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
  var SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  var SELECTOR_OUTER = ".nav-item, .list-group-item";
  var SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  var SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
  var SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
  var SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
  var Tab = class _Tab extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);
      if (!this._parent) {
        return;
      }
      this._setInitialAttributes(this._parent, this._getChildren());
      EventHandler.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
    }
    // Getters
    static get NAME() {
      return NAME$1;
    }
    // Public
    show() {
      const innerElem = this._element;
      if (this._elemIsActive(innerElem)) {
        return;
      }
      const active = this._getActiveElem();
      const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
        relatedTarget: innerElem
      }) : null;
      const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
        relatedTarget: active
      });
      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }
      this._deactivate(active, innerElem);
      this._activate(innerElem, active);
    }
    // Private
    _activate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.add(CLASS_NAME_ACTIVE);
      this._activate(SelectorEngine.getElementFromSelector(element));
      const complete = () => {
        if (element.getAttribute("role") !== "tab") {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }
        element.removeAttribute("tabindex");
        element.setAttribute("aria-selected", true);
        this._toggleDropDown(element, true);
        EventHandler.trigger(element, EVENT_SHOWN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();
      this._deactivate(SelectorEngine.getElementFromSelector(element));
      const complete = () => {
        if (element.getAttribute("role") !== "tab") {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }
        element.setAttribute("aria-selected", false);
        element.setAttribute("tabindex", "-1");
        this._toggleDropDown(element, false);
        EventHandler.trigger(element, EVENT_HIDDEN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const children = this._getChildren().filter((element) => !isDisabled(element));
      let nextActiveElement;
      if ([HOME_KEY, END_KEY].includes(event.key)) {
        nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
      } else {
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
      }
      if (nextActiveElement) {
        nextActiveElement.focus({
          preventScroll: true
        });
        _Tab.getOrCreateInstance(nextActiveElement).show();
      }
    }
    _getChildren() {
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }
    _getActiveElem() {
      return this._getChildren().find((child) => this._elemIsActive(child)) || null;
    }
    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, "role", "tablist");
      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }
    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);
      const isActive = this._elemIsActive(child);
      const outerElem = this._getOuterElement(child);
      child.setAttribute("aria-selected", isActive);
      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, "role", "presentation");
      }
      if (!isActive) {
        child.setAttribute("tabindex", "-1");
      }
      this._setAttributeIfNotExists(child, "role", "tab");
      this._setInitialAttributesOnTargetPanel(child);
    }
    _setInitialAttributesOnTargetPanel(child) {
      const target = SelectorEngine.getElementFromSelector(child);
      if (!target) {
        return;
      }
      this._setAttributeIfNotExists(target, "role", "tabpanel");
      if (child.id) {
        this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
      }
    }
    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);
      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }
      const toggle = (selector, className) => {
        const element2 = SelectorEngine.findOne(selector, outerElem);
        if (element2) {
          element2.classList.toggle(className, open);
        }
      };
      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute("aria-expanded", open);
    }
    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }
    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    }
    // Try to get the inner element (usually the .nav-link)
    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    }
    // Try to get the outer element (usually the .nav-item)
    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Tab.getOrCreateInstance(this);
        if (typeof config !== "string") {
          return;
        }
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  };
  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function(event) {
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    Tab.getOrCreateInstance(this).show();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab.getOrCreateInstance(element);
    }
  });
  defineJQueryPlugin(Tab);
  var NAME = "toast";
  var DATA_KEY = "bs.toast";
  var EVENT_KEY = `.${DATA_KEY}`;
  var EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  var EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  var EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  var EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  var EVENT_HIDE = `hide${EVENT_KEY}`;
  var EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  var EVENT_SHOW = `show${EVENT_KEY}`;
  var EVENT_SHOWN = `shown${EVENT_KEY}`;
  var CLASS_NAME_FADE = "fade";
  var CLASS_NAME_HIDE = "hide";
  var CLASS_NAME_SHOW = "show";
  var CLASS_NAME_SHOWING = "showing";
  var DefaultType = {
    animation: "boolean",
    autohide: "boolean",
    delay: "number"
  };
  var Default = {
    animation: true,
    autohide: true,
    delay: 5e3
  };
  var Toast = class _Toast extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;
      this._setListeners();
    }
    // Getters
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }
    // Public
    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._clearTimeout();
      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }
      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);
        EventHandler.trigger(this._element, EVENT_SHOWN);
        this._maybeScheduleHide();
      };
      this._element.classList.remove(CLASS_NAME_HIDE);
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    hide() {
      if (!this.isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE);
        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };
      this._element.classList.add(CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    dispose() {
      this._clearTimeout();
      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }
      super.dispose();
    }
    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    }
    // Private
    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }
      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }
      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case "mouseover":
        case "mouseout": {
          this._hasMouseInteraction = isInteracting;
          break;
        }
        case "focusin":
        case "focusout": {
          this._hasKeyboardInteraction = isInteracting;
          break;
        }
      }
      if (isInteracting) {
        this._clearTimeout();
        return;
      }
      const nextElement = event.relatedTarget;
      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }
      this._maybeScheduleHide();
    }
    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, (event) => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, (event) => this._onInteraction(event, false));
    }
    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    // Static
    static jQueryInterface(config) {
      return this.each(function() {
        const data = _Toast.getOrCreateInstance(this, config);
        if (typeof config === "string") {
          if (typeof data[config] === "undefined") {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        }
      });
    }
  };
  enableDismissTrigger(Toast);
  defineJQueryPlugin(Toast);

  // <stdin>
  (() => {
    "use strict";
    const searchToggleMobile = document.getElementById("searchToggleMobile");
    const searchToggleDesktop = document.getElementById("searchToggleDesktop");
    const searchModal = document.getElementById("searchModal");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("query");
    const searchResults = document.getElementById("searchResults");
    const flexSearchModal = new Modal(searchModal, {
      focus: true
    });
    searchToggleMobile.addEventListener("click", showModalOnClick);
    searchToggleDesktop.addEventListener("click", showModalOnClick);
    function showModalOnClick() {
      flexSearchModal.toggle();
      document.querySelector(".search-no-recent").classList.remove("d-none");
    }
    document.addEventListener("keydown", onKeyDownHandler);
    function onKeyDownHandler(event) {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        flexSearchModal.show();
        searchForm.reset();
        searchResults.textContent = "";
        document.querySelector(".search-no-recent").classList.remove("d-none");
      }
      if (event.key === "Escape") {
        searchForm.reset();
        searchResults.textContent = "";
        if (searchResultSelected) {
          removeClass(searchResultSelected, "selected");
          index = -1;
        }
        document.querySelector(".search-no-results").classList.add("d-none");
      }
    }
    document.addEventListener("click", function(event) {
      var modalElement = searchModal.contains(event.target);
      if (!modalElement) {
        searchForm.reset();
        searchResults.textContent = "";
        document.querySelector(".search-no-results").classList.add("d-none");
      }
      if (searchResultSelected) {
        removeClass(searchResultSelected, "selected");
        index = -1;
      }
    });
    searchModal.addEventListener("shown.bs.modal", () => {
      searchInput.focus();
    });
    var searchResultSelected;
    var index = -1;
    document.addEventListener(
      "keydown",
      function(event) {
        var len = searchResults.getElementsByTagName("article").length - 1;
        if (event.key === "ArrowDown") {
          index++;
          if (searchResultSelected) {
            removeClass(searchResultSelected, "selected");
            const next = searchResults.getElementsByTagName("article")[index];
            if (typeof next !== "undefined" && index <= len) {
              searchResultSelected = next;
            } else {
              index = 0;
              searchResultSelected = searchResults.getElementsByTagName("article")[0];
            }
            addClass(searchResultSelected, "selected");
          } else {
            index = 0;
            searchResultSelected = searchResults.getElementsByTagName("article")[0];
            addClass(searchResultSelected, "selected");
          }
        } else if (event.key === "ArrowUp") {
          if (searchResultSelected) {
            removeClass(searchResultSelected, "selected");
            index--;
            const next = searchResults.getElementsByTagName("article")[index];
            if (typeof next !== "undefined" && index >= 0) {
              searchResultSelected = next;
            } else {
              index = len;
              searchResultSelected = searchResults.getElementsByTagName("article")[len];
            }
            addClass(searchResultSelected, "selected");
          } else {
            index = 0;
            searchResultSelected = searchResults.getElementsByTagName("article")[len];
            addClass(searchResultSelected, "selected");
          }
        }
      },
      false
    );
    function removeClass(el, className) {
      if (el.classList) {
        el.classList.remove(className);
      } else {
        el.className = el.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
      }
      searchResultSelected.querySelector("a").blur();
    }
    function addClass(el, className) {
      if (el.classList) {
        el.classList.add(className);
      } else {
        el.className += " " + className;
      }
      searchResultSelected.querySelector("a").focus();
    }
    searchResults.addEventListener(
      "mouseover",
      () => {
        if (searchResultSelected) {
          removeClass(searchResultSelected, "selected");
        }
      },
      false
    );
  })();
})();
/*!
 * Search modal for Bootstrap based Thulite sites
 * Copyright 2021-2024 Thulite
 * Licensed under the MIT License
 */
/*! Bundled license information:

bootstrap/dist/js/bootstrap.esm.js:
  (*!
    * Bootstrap v5.3.3 (https://getbootstrap.com/)
    * Copyright 2011-2024 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
    * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
    *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9pbmRleC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2VudW1zLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldE5vZGVOYW1lLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldFdpbmRvdy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9pbnN0YW5jZU9mLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvbW9kaWZpZXJzL2FwcGx5U3R5bGVzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvZ2V0QmFzZVBsYWNlbWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL21hdGguanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi91dGlscy91c2VyQWdlbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvaXNMYXlvdXRWaWV3cG9ydC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRCb3VuZGluZ0NsaWVudFJlY3QuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0TGF5b3V0UmVjdC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9jb250YWlucy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRDb21wdXRlZFN0eWxlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2lzVGFibGVFbGVtZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldERvY3VtZW50RWxlbWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRQYXJlbnROb2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldE9mZnNldFBhcmVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2dldE1haW5BeGlzRnJvbVBsYWNlbWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL3dpdGhpbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2dldEZyZXNoU2lkZU9iamVjdC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL21lcmdlUGFkZGluZ09iamVjdC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2V4cGFuZFRvSGFzaE1hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL21vZGlmaWVycy9hcnJvdy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2dldFZhcmlhdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL21vZGlmaWVycy9jb21wdXRlU3R5bGVzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvbW9kaWZpZXJzL2V2ZW50TGlzdGVuZXJzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvZ2V0T3Bwb3NpdGVQbGFjZW1lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi91dGlscy9nZXRPcHBvc2l0ZVZhcmlhdGlvblBsYWNlbWVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRXaW5kb3dTY3JvbGwuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0V2luZG93U2Nyb2xsQmFyWC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRWaWV3cG9ydFJlY3QuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0RG9jdW1lbnRSZWN0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2lzU2Nyb2xsUGFyZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldFNjcm9sbFBhcmVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9saXN0U2Nyb2xsUGFyZW50cy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL3JlY3RUb0NsaWVudFJlY3QuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0Q2xpcHBpbmdSZWN0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvY29tcHV0ZU9mZnNldHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi91dGlscy9kZXRlY3RPdmVyZmxvdy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2NvbXB1dGVBdXRvUGxhY2VtZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvbW9kaWZpZXJzL2ZsaXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9tb2RpZmllcnMvaGlkZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL21vZGlmaWVycy9vZmZzZXQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9tb2RpZmllcnMvcG9wcGVyT2Zmc2V0cy5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2dldEFsdEF4aXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9tb2RpZmllcnMvcHJldmVudE92ZXJmbG93LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldEhUTUxFbGVtZW50U2Nyb2xsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldE5vZGVTY3JvbGwuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0Q29tcG9zaXRlUmVjdC5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL29yZGVyTW9kaWZpZXJzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvZGVib3VuY2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi91dGlscy9tZXJnZUJ5TmFtZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2NyZWF0ZVBvcHBlci5qcyIsICIuLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3BvcHBlci1saXRlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvcG9wcGVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2RvbS9kYXRhLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3V0aWwvaW5kZXguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvZG9tL2V2ZW50LWhhbmRsZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvZG9tL21hbmlwdWxhdG9yLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3V0aWwvY29uZmlnLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2Jhc2UtY29tcG9uZW50LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2RvbS9zZWxlY3Rvci1lbmdpbmUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvdXRpbC9jb21wb25lbnQtZnVuY3Rpb25zLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2FsZXJ0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2J1dHRvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvYm9vdHN0cmFwL2pzL3NyYy91dGlsL3N3aXBlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2Nhcm91c2VsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2NvbGxhcHNlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL2Ryb3Bkb3duLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3V0aWwvYmFja2Ryb3AuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvdXRpbC9mb2N1c3RyYXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvdXRpbC9zY3JvbGxiYXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvbW9kYWwuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvb2ZmY2FudmFzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3V0aWwvc2FuaXRpemVyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3V0aWwvdGVtcGxhdGUtZmFjdG9yeS5qcyIsICIuLi9ub2RlX21vZHVsZXMvYm9vdHN0cmFwL2pzL3NyYy90b29sdGlwLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3BvcG92ZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2Jvb3RzdHJhcC9qcy9zcmMvc2Nyb2xsc3B5LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9ib290c3RyYXAvanMvc3JjL3RhYi5qcyIsICIuLi9ub2RlX21vZHVsZXMvYm9vdHN0cmFwL2pzL3NyYy90b2FzdC5qcyIsICI8c3RkaW4+Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgKiBmcm9tIFwiLi9lbnVtcy5qc1wiO1xuZXhwb3J0ICogZnJvbSBcIi4vbW9kaWZpZXJzL2luZGV4LmpzXCI7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuZXhwb3J0IHsgcG9wcGVyR2VuZXJhdG9yLCBkZXRlY3RPdmVyZmxvdywgY3JlYXRlUG9wcGVyIGFzIGNyZWF0ZVBvcHBlckJhc2UgfSBmcm9tIFwiLi9jcmVhdGVQb3BwZXIuanNcIjsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5leHBvcnQgeyBjcmVhdGVQb3BwZXIgfSBmcm9tIFwiLi9wb3BwZXIuanNcIjsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5leHBvcnQgeyBjcmVhdGVQb3BwZXIgYXMgY3JlYXRlUG9wcGVyTGl0ZSB9IGZyb20gXCIuL3BvcHBlci1saXRlLmpzXCI7IiwgImV4cG9ydCB2YXIgdG9wID0gJ3RvcCc7XG5leHBvcnQgdmFyIGJvdHRvbSA9ICdib3R0b20nO1xuZXhwb3J0IHZhciByaWdodCA9ICdyaWdodCc7XG5leHBvcnQgdmFyIGxlZnQgPSAnbGVmdCc7XG5leHBvcnQgdmFyIGF1dG8gPSAnYXV0byc7XG5leHBvcnQgdmFyIGJhc2VQbGFjZW1lbnRzID0gW3RvcCwgYm90dG9tLCByaWdodCwgbGVmdF07XG5leHBvcnQgdmFyIHN0YXJ0ID0gJ3N0YXJ0JztcbmV4cG9ydCB2YXIgZW5kID0gJ2VuZCc7XG5leHBvcnQgdmFyIGNsaXBwaW5nUGFyZW50cyA9ICdjbGlwcGluZ1BhcmVudHMnO1xuZXhwb3J0IHZhciB2aWV3cG9ydCA9ICd2aWV3cG9ydCc7XG5leHBvcnQgdmFyIHBvcHBlciA9ICdwb3BwZXInO1xuZXhwb3J0IHZhciByZWZlcmVuY2UgPSAncmVmZXJlbmNlJztcbmV4cG9ydCB2YXIgdmFyaWF0aW9uUGxhY2VtZW50cyA9IC8qI19fUFVSRV9fKi9iYXNlUGxhY2VtZW50cy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gIHJldHVybiBhY2MuY29uY2F0KFtwbGFjZW1lbnQgKyBcIi1cIiArIHN0YXJ0LCBwbGFjZW1lbnQgKyBcIi1cIiArIGVuZF0pO1xufSwgW10pO1xuZXhwb3J0IHZhciBwbGFjZW1lbnRzID0gLyojX19QVVJFX18qL1tdLmNvbmNhdChiYXNlUGxhY2VtZW50cywgW2F1dG9dKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gIHJldHVybiBhY2MuY29uY2F0KFtwbGFjZW1lbnQsIHBsYWNlbWVudCArIFwiLVwiICsgc3RhcnQsIHBsYWNlbWVudCArIFwiLVwiICsgZW5kXSk7XG59LCBbXSk7IC8vIG1vZGlmaWVycyB0aGF0IG5lZWQgdG8gcmVhZCB0aGUgRE9NXG5cbmV4cG9ydCB2YXIgYmVmb3JlUmVhZCA9ICdiZWZvcmVSZWFkJztcbmV4cG9ydCB2YXIgcmVhZCA9ICdyZWFkJztcbmV4cG9ydCB2YXIgYWZ0ZXJSZWFkID0gJ2FmdGVyUmVhZCc7IC8vIHB1cmUtbG9naWMgbW9kaWZpZXJzXG5cbmV4cG9ydCB2YXIgYmVmb3JlTWFpbiA9ICdiZWZvcmVNYWluJztcbmV4cG9ydCB2YXIgbWFpbiA9ICdtYWluJztcbmV4cG9ydCB2YXIgYWZ0ZXJNYWluID0gJ2FmdGVyTWFpbic7IC8vIG1vZGlmaWVyIHdpdGggdGhlIHB1cnBvc2UgdG8gd3JpdGUgdG8gdGhlIERPTSAob3Igd3JpdGUgaW50byBhIGZyYW1ld29yayBzdGF0ZSlcblxuZXhwb3J0IHZhciBiZWZvcmVXcml0ZSA9ICdiZWZvcmVXcml0ZSc7XG5leHBvcnQgdmFyIHdyaXRlID0gJ3dyaXRlJztcbmV4cG9ydCB2YXIgYWZ0ZXJXcml0ZSA9ICdhZnRlcldyaXRlJztcbmV4cG9ydCB2YXIgbW9kaWZpZXJQaGFzZXMgPSBbYmVmb3JlUmVhZCwgcmVhZCwgYWZ0ZXJSZWFkLCBiZWZvcmVNYWluLCBtYWluLCBhZnRlck1haW4sIGJlZm9yZVdyaXRlLCB3cml0ZSwgYWZ0ZXJXcml0ZV07IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldE5vZGVOYW1lKGVsZW1lbnQpIHtcbiAgcmV0dXJuIGVsZW1lbnQgPyAoZWxlbWVudC5ub2RlTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSA6IG51bGw7XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFdpbmRvdyhub2RlKSB7XG4gIGlmIChub2RlID09IG51bGwpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9XG5cbiAgaWYgKG5vZGUudG9TdHJpbmcoKSAhPT0gJ1tvYmplY3QgV2luZG93XScpIHtcbiAgICB2YXIgb3duZXJEb2N1bWVudCA9IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICByZXR1cm4gb3duZXJEb2N1bWVudCA/IG93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93IDogd2luZG93O1xuICB9XG5cbiAgcmV0dXJuIG5vZGU7XG59IiwgImltcG9ydCBnZXRXaW5kb3cgZnJvbSBcIi4vZ2V0V2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIGlzRWxlbWVudChub2RlKSB7XG4gIHZhciBPd25FbGVtZW50ID0gZ2V0V2luZG93KG5vZGUpLkVsZW1lbnQ7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgT3duRWxlbWVudCB8fCBub2RlIGluc3RhbmNlb2YgRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gaXNIVE1MRWxlbWVudChub2RlKSB7XG4gIHZhciBPd25FbGVtZW50ID0gZ2V0V2luZG93KG5vZGUpLkhUTUxFbGVtZW50O1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIE93bkVsZW1lbnQgfHwgbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBpc1NoYWRvd1Jvb3Qobm9kZSkge1xuICAvLyBJRSAxMSBoYXMgbm8gU2hhZG93Um9vdFxuICBpZiAodHlwZW9mIFNoYWRvd1Jvb3QgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIE93bkVsZW1lbnQgPSBnZXRXaW5kb3cobm9kZSkuU2hhZG93Um9vdDtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBPd25FbGVtZW50IHx8IG5vZGUgaW5zdGFuY2VvZiBTaGFkb3dSb290O1xufVxuXG5leHBvcnQgeyBpc0VsZW1lbnQsIGlzSFRNTEVsZW1lbnQsIGlzU2hhZG93Um9vdCB9OyIsICJpbXBvcnQgZ2V0Tm9kZU5hbWUgZnJvbSBcIi4uL2RvbS11dGlscy9nZXROb2RlTmFtZS5qc1wiO1xuaW1wb3J0IHsgaXNIVE1MRWxlbWVudCB9IGZyb20gXCIuLi9kb20tdXRpbHMvaW5zdGFuY2VPZi5qc1wiOyAvLyBUaGlzIG1vZGlmaWVyIHRha2VzIHRoZSBzdHlsZXMgcHJlcGFyZWQgYnkgdGhlIGBjb21wdXRlU3R5bGVzYCBtb2RpZmllclxuLy8gYW5kIGFwcGxpZXMgdGhlbSB0byB0aGUgSFRNTEVsZW1lbnRzIHN1Y2ggYXMgcG9wcGVyIGFuZCBhcnJvd1xuXG5mdW5jdGlvbiBhcHBseVN0eWxlcyhfcmVmKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYuc3RhdGU7XG4gIE9iamVjdC5rZXlzKHN0YXRlLmVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIHN0eWxlID0gc3RhdGUuc3R5bGVzW25hbWVdIHx8IHt9O1xuICAgIHZhciBhdHRyaWJ1dGVzID0gc3RhdGUuYXR0cmlidXRlc1tuYW1lXSB8fCB7fTtcbiAgICB2YXIgZWxlbWVudCA9IHN0YXRlLmVsZW1lbnRzW25hbWVdOyAvLyBhcnJvdyBpcyBvcHRpb25hbCArIHZpcnR1YWwgZWxlbWVudHNcblxuICAgIGlmICghaXNIVE1MRWxlbWVudChlbGVtZW50KSB8fCAhZ2V0Tm9kZU5hbWUoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIEZsb3cgZG9lc24ndCBzdXBwb3J0IHRvIGV4dGVuZCB0aGlzIHByb3BlcnR5LCBidXQgaXQncyB0aGUgbW9zdFxuICAgIC8vIGVmZmVjdGl2ZSB3YXkgdG8gYXBwbHkgc3R5bGVzIHRvIGFuIEhUTUxFbGVtZW50XG4gICAgLy8gJEZsb3dGaXhNZVtjYW5ub3Qtd3JpdGVdXG5cblxuICAgIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgc3R5bGUpO1xuICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGF0dHJpYnV0ZXNbbmFtZV07XG5cbiAgICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSA9PT0gdHJ1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZWZmZWN0KF9yZWYyKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYyLnN0YXRlO1xuICB2YXIgaW5pdGlhbFN0eWxlcyA9IHtcbiAgICBwb3BwZXI6IHtcbiAgICAgIHBvc2l0aW9uOiBzdGF0ZS5vcHRpb25zLnN0cmF0ZWd5LFxuICAgICAgbGVmdDogJzAnLFxuICAgICAgdG9wOiAnMCcsXG4gICAgICBtYXJnaW46ICcwJ1xuICAgIH0sXG4gICAgYXJyb3c6IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgfSxcbiAgICByZWZlcmVuY2U6IHt9XG4gIH07XG4gIE9iamVjdC5hc3NpZ24oc3RhdGUuZWxlbWVudHMucG9wcGVyLnN0eWxlLCBpbml0aWFsU3R5bGVzLnBvcHBlcik7XG4gIHN0YXRlLnN0eWxlcyA9IGluaXRpYWxTdHlsZXM7XG5cbiAgaWYgKHN0YXRlLmVsZW1lbnRzLmFycm93KSB7XG4gICAgT2JqZWN0LmFzc2lnbihzdGF0ZS5lbGVtZW50cy5hcnJvdy5zdHlsZSwgaW5pdGlhbFN0eWxlcy5hcnJvdyk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIE9iamVjdC5rZXlzKHN0YXRlLmVsZW1lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IHN0YXRlLmVsZW1lbnRzW25hbWVdO1xuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSBzdGF0ZS5hdHRyaWJ1dGVzW25hbWVdIHx8IHt9O1xuICAgICAgdmFyIHN0eWxlUHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHN0YXRlLnN0eWxlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSA/IHN0YXRlLnN0eWxlc1tuYW1lXSA6IGluaXRpYWxTdHlsZXNbbmFtZV0pOyAvLyBTZXQgYWxsIHZhbHVlcyB0byBhbiBlbXB0eSBzdHJpbmcgdG8gdW5zZXQgdGhlbVxuXG4gICAgICB2YXIgc3R5bGUgPSBzdHlsZVByb3BlcnRpZXMucmVkdWNlKGZ1bmN0aW9uIChzdHlsZSwgcHJvcGVydHkpIHtcbiAgICAgICAgc3R5bGVbcHJvcGVydHldID0gJyc7XG4gICAgICAgIHJldHVybiBzdHlsZTtcbiAgICAgIH0sIHt9KTsgLy8gYXJyb3cgaXMgb3B0aW9uYWwgKyB2aXJ0dWFsIGVsZW1lbnRzXG5cbiAgICAgIGlmICghaXNIVE1MRWxlbWVudChlbGVtZW50KSB8fCAhZ2V0Tm9kZU5hbWUoZWxlbWVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHN0eWxlKTtcbiAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGF0dHJpYnV0ZSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdhcHBseVN0eWxlcycsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnd3JpdGUnLFxuICBmbjogYXBwbHlTdHlsZXMsXG4gIGVmZmVjdDogZWZmZWN0LFxuICByZXF1aXJlczogWydjb21wdXRlU3R5bGVzJ11cbn07IiwgImltcG9ydCB7IGF1dG8gfSBmcm9tIFwiLi4vZW51bXMuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEJhc2VQbGFjZW1lbnQocGxhY2VtZW50KSB7XG4gIHJldHVybiBwbGFjZW1lbnQuc3BsaXQoJy0nKVswXTtcbn0iLCAiZXhwb3J0IHZhciBtYXggPSBNYXRoLm1heDtcbmV4cG9ydCB2YXIgbWluID0gTWF0aC5taW47XG5leHBvcnQgdmFyIHJvdW5kID0gTWF0aC5yb3VuZDsiLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0VUFTdHJpbmcoKSB7XG4gIHZhciB1YURhdGEgPSBuYXZpZ2F0b3IudXNlckFnZW50RGF0YTtcblxuICBpZiAodWFEYXRhICE9IG51bGwgJiYgdWFEYXRhLmJyYW5kcyAmJiBBcnJheS5pc0FycmF5KHVhRGF0YS5icmFuZHMpKSB7XG4gICAgcmV0dXJuIHVhRGF0YS5icmFuZHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5icmFuZCArIFwiL1wiICsgaXRlbS52ZXJzaW9uO1xuICAgIH0pLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50O1xufSIsICJpbXBvcnQgZ2V0VUFTdHJpbmcgZnJvbSBcIi4uL3V0aWxzL3VzZXJBZ2VudC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNMYXlvdXRWaWV3cG9ydCgpIHtcbiAgcmV0dXJuICEvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KGdldFVBU3RyaW5nKCkpO1xufSIsICJpbXBvcnQgeyBpc0VsZW1lbnQsIGlzSFRNTEVsZW1lbnQgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5pbXBvcnQgeyByb3VuZCB9IGZyb20gXCIuLi91dGlscy9tYXRoLmpzXCI7XG5pbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IGlzTGF5b3V0Vmlld3BvcnQgZnJvbSBcIi4vaXNMYXlvdXRWaWV3cG9ydC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsZW1lbnQsIGluY2x1ZGVTY2FsZSwgaXNGaXhlZFN0cmF0ZWd5KSB7XG4gIGlmIChpbmNsdWRlU2NhbGUgPT09IHZvaWQgMCkge1xuICAgIGluY2x1ZGVTY2FsZSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKGlzRml4ZWRTdHJhdGVneSA9PT0gdm9pZCAwKSB7XG4gICAgaXNGaXhlZFN0cmF0ZWd5ID0gZmFsc2U7XG4gIH1cblxuICB2YXIgY2xpZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBzY2FsZVggPSAxO1xuICB2YXIgc2NhbGVZID0gMTtcblxuICBpZiAoaW5jbHVkZVNjYWxlICYmIGlzSFRNTEVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICBzY2FsZVggPSBlbGVtZW50Lm9mZnNldFdpZHRoID4gMCA/IHJvdW5kKGNsaWVudFJlY3Qud2lkdGgpIC8gZWxlbWVudC5vZmZzZXRXaWR0aCB8fCAxIDogMTtcbiAgICBzY2FsZVkgPSBlbGVtZW50Lm9mZnNldEhlaWdodCA+IDAgPyByb3VuZChjbGllbnRSZWN0LmhlaWdodCkgLyBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCAxIDogMTtcbiAgfVxuXG4gIHZhciBfcmVmID0gaXNFbGVtZW50KGVsZW1lbnQpID8gZ2V0V2luZG93KGVsZW1lbnQpIDogd2luZG93LFxuICAgICAgdmlzdWFsVmlld3BvcnQgPSBfcmVmLnZpc3VhbFZpZXdwb3J0O1xuXG4gIHZhciBhZGRWaXN1YWxPZmZzZXRzID0gIWlzTGF5b3V0Vmlld3BvcnQoKSAmJiBpc0ZpeGVkU3RyYXRlZ3k7XG4gIHZhciB4ID0gKGNsaWVudFJlY3QubGVmdCArIChhZGRWaXN1YWxPZmZzZXRzICYmIHZpc3VhbFZpZXdwb3J0ID8gdmlzdWFsVmlld3BvcnQub2Zmc2V0TGVmdCA6IDApKSAvIHNjYWxlWDtcbiAgdmFyIHkgPSAoY2xpZW50UmVjdC50b3AgKyAoYWRkVmlzdWFsT2Zmc2V0cyAmJiB2aXN1YWxWaWV3cG9ydCA/IHZpc3VhbFZpZXdwb3J0Lm9mZnNldFRvcCA6IDApKSAvIHNjYWxlWTtcbiAgdmFyIHdpZHRoID0gY2xpZW50UmVjdC53aWR0aCAvIHNjYWxlWDtcbiAgdmFyIGhlaWdodCA9IGNsaWVudFJlY3QuaGVpZ2h0IC8gc2NhbGVZO1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB0b3A6IHksXG4gICAgcmlnaHQ6IHggKyB3aWR0aCxcbiAgICBib3R0b206IHkgKyBoZWlnaHQsXG4gICAgbGVmdDogeCxcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfTtcbn0iLCAiaW1wb3J0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCBmcm9tIFwiLi9nZXRCb3VuZGluZ0NsaWVudFJlY3QuanNcIjsgLy8gUmV0dXJucyB0aGUgbGF5b3V0IHJlY3Qgb2YgYW4gZWxlbWVudCByZWxhdGl2ZSB0byBpdHMgb2Zmc2V0UGFyZW50LiBMYXlvdXRcbi8vIG1lYW5zIGl0IGRvZXNuJ3QgdGFrZSBpbnRvIGFjY291bnQgdHJhbnNmb3Jtcy5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TGF5b3V0UmVjdChlbGVtZW50KSB7XG4gIHZhciBjbGllbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsZW1lbnQpOyAvLyBVc2UgdGhlIGNsaWVudFJlY3Qgc2l6ZXMgaWYgaXQncyBub3QgYmVlbiB0cmFuc2Zvcm1lZC5cbiAgLy8gRml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL3BvcHBlcmpzL3BvcHBlci1jb3JlL2lzc3Vlcy8xMjIzXG5cbiAgdmFyIHdpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgdmFyIGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gIGlmIChNYXRoLmFicyhjbGllbnRSZWN0LndpZHRoIC0gd2lkdGgpIDw9IDEpIHtcbiAgICB3aWR0aCA9IGNsaWVudFJlY3Qud2lkdGg7XG4gIH1cblxuICBpZiAoTWF0aC5hYnMoY2xpZW50UmVjdC5oZWlnaHQgLSBoZWlnaHQpIDw9IDEpIHtcbiAgICBoZWlnaHQgPSBjbGllbnRSZWN0LmhlaWdodDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeDogZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgIHk6IGVsZW1lbnQub2Zmc2V0VG9wLFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9O1xufSIsICJpbXBvcnQgeyBpc1NoYWRvd1Jvb3QgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb250YWlucyhwYXJlbnQsIGNoaWxkKSB7XG4gIHZhciByb290Tm9kZSA9IGNoaWxkLmdldFJvb3ROb2RlICYmIGNoaWxkLmdldFJvb3ROb2RlKCk7IC8vIEZpcnN0LCBhdHRlbXB0IHdpdGggZmFzdGVyIG5hdGl2ZSBtZXRob2RcblxuICBpZiAocGFyZW50LmNvbnRhaW5zKGNoaWxkKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIHRoZW4gZmFsbGJhY2sgdG8gY3VzdG9tIGltcGxlbWVudGF0aW9uIHdpdGggU2hhZG93IERPTSBzdXBwb3J0XG4gIGVsc2UgaWYgKHJvb3ROb2RlICYmIGlzU2hhZG93Um9vdChyb290Tm9kZSkpIHtcbiAgICAgIHZhciBuZXh0ID0gY2hpbGQ7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKG5leHQgJiYgcGFyZW50LmlzU2FtZU5vZGUobmV4dCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSAvLyAkRmxvd0ZpeE1lW3Byb3AtbWlzc2luZ106IG5lZWQgYSBiZXR0ZXIgd2F5IHRvIGhhbmRsZSB0aGlzLi4uXG5cblxuICAgICAgICBuZXh0ID0gbmV4dC5wYXJlbnROb2RlIHx8IG5leHQuaG9zdDtcbiAgICAgIH0gd2hpbGUgKG5leHQpO1xuICAgIH0gLy8gR2l2ZSB1cCwgdGhlIHJlc3VsdCBpcyBmYWxzZVxuXG5cbiAgcmV0dXJuIGZhbHNlO1xufSIsICJpbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSB7XG4gIHJldHVybiBnZXRXaW5kb3coZWxlbWVudCkuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbn0iLCAiaW1wb3J0IGdldE5vZGVOYW1lIGZyb20gXCIuL2dldE5vZGVOYW1lLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc1RhYmxlRWxlbWVudChlbGVtZW50KSB7XG4gIHJldHVybiBbJ3RhYmxlJywgJ3RkJywgJ3RoJ10uaW5kZXhPZihnZXROb2RlTmFtZShlbGVtZW50KSkgPj0gMDtcbn0iLCAiaW1wb3J0IHsgaXNFbGVtZW50IH0gZnJvbSBcIi4vaW5zdGFuY2VPZi5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpIHtcbiAgLy8gJEZsb3dGaXhNZVtpbmNvbXBhdGlibGUtcmV0dXJuXTogYXNzdW1lIGJvZHkgaXMgYWx3YXlzIGF2YWlsYWJsZVxuICByZXR1cm4gKChpc0VsZW1lbnQoZWxlbWVudCkgPyBlbGVtZW50Lm93bmVyRG9jdW1lbnQgOiAvLyAkRmxvd0ZpeE1lW3Byb3AtbWlzc2luZ11cbiAgZWxlbWVudC5kb2N1bWVudCkgfHwgd2luZG93LmRvY3VtZW50KS5kb2N1bWVudEVsZW1lbnQ7XG59IiwgImltcG9ydCBnZXROb2RlTmFtZSBmcm9tIFwiLi9nZXROb2RlTmFtZS5qc1wiO1xuaW1wb3J0IGdldERvY3VtZW50RWxlbWVudCBmcm9tIFwiLi9nZXREb2N1bWVudEVsZW1lbnQuanNcIjtcbmltcG9ydCB7IGlzU2hhZG93Um9vdCB9IGZyb20gXCIuL2luc3RhbmNlT2YuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFBhcmVudE5vZGUoZWxlbWVudCkge1xuICBpZiAoZ2V0Tm9kZU5hbWUoZWxlbWVudCkgPT09ICdodG1sJykge1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuICgvLyB0aGlzIGlzIGEgcXVpY2tlciAoYnV0IGxlc3MgdHlwZSBzYWZlKSB3YXkgdG8gc2F2ZSBxdWl0ZSBzb21lIGJ5dGVzIGZyb20gdGhlIGJ1bmRsZVxuICAgIC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLXJldHVybl1cbiAgICAvLyAkRmxvd0ZpeE1lW3Byb3AtbWlzc2luZ11cbiAgICBlbGVtZW50LmFzc2lnbmVkU2xvdCB8fCAvLyBzdGVwIGludG8gdGhlIHNoYWRvdyBET00gb2YgdGhlIHBhcmVudCBvZiBhIHNsb3R0ZWQgbm9kZVxuICAgIGVsZW1lbnQucGFyZW50Tm9kZSB8fCAoIC8vIERPTSBFbGVtZW50IGRldGVjdGVkXG4gICAgaXNTaGFkb3dSb290KGVsZW1lbnQpID8gZWxlbWVudC5ob3N0IDogbnVsbCkgfHwgLy8gU2hhZG93Um9vdCBkZXRlY3RlZFxuICAgIC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLWNhbGxdOiBIVE1MRWxlbWVudCBpcyBhIE5vZGVcbiAgICBnZXREb2N1bWVudEVsZW1lbnQoZWxlbWVudCkgLy8gZmFsbGJhY2tcblxuICApO1xufSIsICJpbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IGdldE5vZGVOYW1lIGZyb20gXCIuL2dldE5vZGVOYW1lLmpzXCI7XG5pbXBvcnQgZ2V0Q29tcHV0ZWRTdHlsZSBmcm9tIFwiLi9nZXRDb21wdXRlZFN0eWxlLmpzXCI7XG5pbXBvcnQgeyBpc0hUTUxFbGVtZW50LCBpc1NoYWRvd1Jvb3QgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5pbXBvcnQgaXNUYWJsZUVsZW1lbnQgZnJvbSBcIi4vaXNUYWJsZUVsZW1lbnQuanNcIjtcbmltcG9ydCBnZXRQYXJlbnROb2RlIGZyb20gXCIuL2dldFBhcmVudE5vZGUuanNcIjtcbmltcG9ydCBnZXRVQVN0cmluZyBmcm9tIFwiLi4vdXRpbHMvdXNlckFnZW50LmpzXCI7XG5cbmZ1bmN0aW9uIGdldFRydWVPZmZzZXRQYXJlbnQoZWxlbWVudCkge1xuICBpZiAoIWlzSFRNTEVsZW1lbnQoZWxlbWVudCkgfHwgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BvcHBlcmpzL3BvcHBlci1jb3JlL2lzc3Vlcy84MzdcbiAgZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0UGFyZW50O1xufSAvLyBgLm9mZnNldFBhcmVudGAgcmVwb3J0cyBgbnVsbGAgZm9yIGZpeGVkIGVsZW1lbnRzLCB3aGlsZSBhYnNvbHV0ZSBlbGVtZW50c1xuLy8gcmV0dXJuIHRoZSBjb250YWluaW5nIGJsb2NrXG5cblxuZnVuY3Rpb24gZ2V0Q29udGFpbmluZ0Jsb2NrKGVsZW1lbnQpIHtcbiAgdmFyIGlzRmlyZWZveCA9IC9maXJlZm94L2kudGVzdChnZXRVQVN0cmluZygpKTtcbiAgdmFyIGlzSUUgPSAvVHJpZGVudC9pLnRlc3QoZ2V0VUFTdHJpbmcoKSk7XG5cbiAgaWYgKGlzSUUgJiYgaXNIVE1MRWxlbWVudChlbGVtZW50KSkge1xuICAgIC8vIEluIElFIDksIDEwIGFuZCAxMSBmaXhlZCBlbGVtZW50cyBjb250YWluaW5nIGJsb2NrIGlzIGFsd2F5cyBlc3RhYmxpc2hlZCBieSB0aGUgdmlld3BvcnRcbiAgICB2YXIgZWxlbWVudENzcyA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG5cbiAgICBpZiAoZWxlbWVudENzcy5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgdmFyIGN1cnJlbnROb2RlID0gZ2V0UGFyZW50Tm9kZShlbGVtZW50KTtcblxuICBpZiAoaXNTaGFkb3dSb290KGN1cnJlbnROb2RlKSkge1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUuaG9zdDtcbiAgfVxuXG4gIHdoaWxlIChpc0hUTUxFbGVtZW50KGN1cnJlbnROb2RlKSAmJiBbJ2h0bWwnLCAnYm9keSddLmluZGV4T2YoZ2V0Tm9kZU5hbWUoY3VycmVudE5vZGUpKSA8IDApIHtcbiAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShjdXJyZW50Tm9kZSk7IC8vIFRoaXMgaXMgbm9uLWV4aGF1c3RpdmUgYnV0IGNvdmVycyB0aGUgbW9zdCBjb21tb24gQ1NTIHByb3BlcnRpZXMgdGhhdFxuICAgIC8vIGNyZWF0ZSBhIGNvbnRhaW5pbmcgYmxvY2suXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NvbnRhaW5pbmdfYmxvY2sjaWRlbnRpZnlpbmdfdGhlX2NvbnRhaW5pbmdfYmxvY2tcblxuICAgIGlmIChjc3MudHJhbnNmb3JtICE9PSAnbm9uZScgfHwgY3NzLnBlcnNwZWN0aXZlICE9PSAnbm9uZScgfHwgY3NzLmNvbnRhaW4gPT09ICdwYWludCcgfHwgWyd0cmFuc2Zvcm0nLCAncGVyc3BlY3RpdmUnXS5pbmRleE9mKGNzcy53aWxsQ2hhbmdlKSAhPT0gLTEgfHwgaXNGaXJlZm94ICYmIGNzcy53aWxsQ2hhbmdlID09PSAnZmlsdGVyJyB8fCBpc0ZpcmVmb3ggJiYgY3NzLmZpbHRlciAmJiBjc3MuZmlsdGVyICE9PSAnbm9uZScpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufSAvLyBHZXRzIHRoZSBjbG9zZXN0IGFuY2VzdG9yIHBvc2l0aW9uZWQgZWxlbWVudC4gSGFuZGxlcyBzb21lIGVkZ2UgY2FzZXMsXG4vLyBzdWNoIGFzIHRhYmxlIGFuY2VzdG9ycyBhbmQgY3Jvc3MgYnJvd3NlciBidWdzLlxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldE9mZnNldFBhcmVudChlbGVtZW50KSB7XG4gIHZhciB3aW5kb3cgPSBnZXRXaW5kb3coZWxlbWVudCk7XG4gIHZhciBvZmZzZXRQYXJlbnQgPSBnZXRUcnVlT2Zmc2V0UGFyZW50KGVsZW1lbnQpO1xuXG4gIHdoaWxlIChvZmZzZXRQYXJlbnQgJiYgaXNUYWJsZUVsZW1lbnQob2Zmc2V0UGFyZW50KSAmJiBnZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCkucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgb2Zmc2V0UGFyZW50ID0gZ2V0VHJ1ZU9mZnNldFBhcmVudChvZmZzZXRQYXJlbnQpO1xuICB9XG5cbiAgaWYgKG9mZnNldFBhcmVudCAmJiAoZ2V0Tm9kZU5hbWUob2Zmc2V0UGFyZW50KSA9PT0gJ2h0bWwnIHx8IGdldE5vZGVOYW1lKG9mZnNldFBhcmVudCkgPT09ICdib2R5JyAmJiBnZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCkucG9zaXRpb24gPT09ICdzdGF0aWMnKSkge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cblxuICByZXR1cm4gb2Zmc2V0UGFyZW50IHx8IGdldENvbnRhaW5pbmdCbG9jayhlbGVtZW50KSB8fCB3aW5kb3c7XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChwbGFjZW1lbnQpIHtcbiAgcmV0dXJuIFsndG9wJywgJ2JvdHRvbSddLmluZGV4T2YocGxhY2VtZW50KSA+PSAwID8gJ3gnIDogJ3knO1xufSIsICJpbXBvcnQgeyBtYXggYXMgbWF0aE1heCwgbWluIGFzIG1hdGhNaW4gfSBmcm9tIFwiLi9tYXRoLmpzXCI7XG5leHBvcnQgZnVuY3Rpb24gd2l0aGluKG1pbiwgdmFsdWUsIG1heCkge1xuICByZXR1cm4gbWF0aE1heChtaW4sIG1hdGhNaW4odmFsdWUsIG1heCkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHdpdGhpbk1heENsYW1wKG1pbiwgdmFsdWUsIG1heCkge1xuICB2YXIgdiA9IHdpdGhpbihtaW4sIHZhbHVlLCBtYXgpO1xuICByZXR1cm4gdiA+IG1heCA/IG1heCA6IHY7XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldEZyZXNoU2lkZU9iamVjdCgpIHtcbiAgcmV0dXJuIHtcbiAgICB0b3A6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIGxlZnQ6IDBcbiAgfTtcbn0iLCAiaW1wb3J0IGdldEZyZXNoU2lkZU9iamVjdCBmcm9tIFwiLi9nZXRGcmVzaFNpZGVPYmplY3QuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1lcmdlUGFkZGluZ09iamVjdChwYWRkaW5nT2JqZWN0KSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBnZXRGcmVzaFNpZGVPYmplY3QoKSwgcGFkZGluZ09iamVjdCk7XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4cGFuZFRvSGFzaE1hcCh2YWx1ZSwga2V5cykge1xuICByZXR1cm4ga2V5cy5yZWR1Y2UoZnVuY3Rpb24gKGhhc2hNYXAsIGtleSkge1xuICAgIGhhc2hNYXBba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiBoYXNoTWFwO1xuICB9LCB7fSk7XG59IiwgImltcG9ydCBnZXRCYXNlUGxhY2VtZW50IGZyb20gXCIuLi91dGlscy9nZXRCYXNlUGxhY2VtZW50LmpzXCI7XG5pbXBvcnQgZ2V0TGF5b3V0UmVjdCBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldExheW91dFJlY3QuanNcIjtcbmltcG9ydCBjb250YWlucyBmcm9tIFwiLi4vZG9tLXV0aWxzL2NvbnRhaW5zLmpzXCI7XG5pbXBvcnQgZ2V0T2Zmc2V0UGFyZW50IGZyb20gXCIuLi9kb20tdXRpbHMvZ2V0T2Zmc2V0UGFyZW50LmpzXCI7XG5pbXBvcnQgZ2V0TWFpbkF4aXNGcm9tUGxhY2VtZW50IGZyb20gXCIuLi91dGlscy9nZXRNYWluQXhpc0Zyb21QbGFjZW1lbnQuanNcIjtcbmltcG9ydCB7IHdpdGhpbiB9IGZyb20gXCIuLi91dGlscy93aXRoaW4uanNcIjtcbmltcG9ydCBtZXJnZVBhZGRpbmdPYmplY3QgZnJvbSBcIi4uL3V0aWxzL21lcmdlUGFkZGluZ09iamVjdC5qc1wiO1xuaW1wb3J0IGV4cGFuZFRvSGFzaE1hcCBmcm9tIFwiLi4vdXRpbHMvZXhwYW5kVG9IYXNoTWFwLmpzXCI7XG5pbXBvcnQgeyBsZWZ0LCByaWdodCwgYmFzZVBsYWNlbWVudHMsIHRvcCwgYm90dG9tIH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxudmFyIHRvUGFkZGluZ09iamVjdCA9IGZ1bmN0aW9uIHRvUGFkZGluZ09iamVjdChwYWRkaW5nLCBzdGF0ZSkge1xuICBwYWRkaW5nID0gdHlwZW9mIHBhZGRpbmcgPT09ICdmdW5jdGlvbicgPyBwYWRkaW5nKE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLnJlY3RzLCB7XG4gICAgcGxhY2VtZW50OiBzdGF0ZS5wbGFjZW1lbnRcbiAgfSkpIDogcGFkZGluZztcbiAgcmV0dXJuIG1lcmdlUGFkZGluZ09iamVjdCh0eXBlb2YgcGFkZGluZyAhPT0gJ251bWJlcicgPyBwYWRkaW5nIDogZXhwYW5kVG9IYXNoTWFwKHBhZGRpbmcsIGJhc2VQbGFjZW1lbnRzKSk7XG59O1xuXG5mdW5jdGlvbiBhcnJvdyhfcmVmKSB7XG4gIHZhciBfc3RhdGUkbW9kaWZpZXJzRGF0YSQ7XG5cbiAgdmFyIHN0YXRlID0gX3JlZi5zdGF0ZSxcbiAgICAgIG5hbWUgPSBfcmVmLm5hbWUsXG4gICAgICBvcHRpb25zID0gX3JlZi5vcHRpb25zO1xuICB2YXIgYXJyb3dFbGVtZW50ID0gc3RhdGUuZWxlbWVudHMuYXJyb3c7XG4gIHZhciBwb3BwZXJPZmZzZXRzID0gc3RhdGUubW9kaWZpZXJzRGF0YS5wb3BwZXJPZmZzZXRzO1xuICB2YXIgYmFzZVBsYWNlbWVudCA9IGdldEJhc2VQbGFjZW1lbnQoc3RhdGUucGxhY2VtZW50KTtcbiAgdmFyIGF4aXMgPSBnZXRNYWluQXhpc0Zyb21QbGFjZW1lbnQoYmFzZVBsYWNlbWVudCk7XG4gIHZhciBpc1ZlcnRpY2FsID0gW2xlZnQsIHJpZ2h0XS5pbmRleE9mKGJhc2VQbGFjZW1lbnQpID49IDA7XG4gIHZhciBsZW4gPSBpc1ZlcnRpY2FsID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuXG4gIGlmICghYXJyb3dFbGVtZW50IHx8ICFwb3BwZXJPZmZzZXRzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHBhZGRpbmdPYmplY3QgPSB0b1BhZGRpbmdPYmplY3Qob3B0aW9ucy5wYWRkaW5nLCBzdGF0ZSk7XG4gIHZhciBhcnJvd1JlY3QgPSBnZXRMYXlvdXRSZWN0KGFycm93RWxlbWVudCk7XG4gIHZhciBtaW5Qcm9wID0gYXhpcyA9PT0gJ3knID8gdG9wIDogbGVmdDtcbiAgdmFyIG1heFByb3AgPSBheGlzID09PSAneScgPyBib3R0b20gOiByaWdodDtcbiAgdmFyIGVuZERpZmYgPSBzdGF0ZS5yZWN0cy5yZWZlcmVuY2VbbGVuXSArIHN0YXRlLnJlY3RzLnJlZmVyZW5jZVtheGlzXSAtIHBvcHBlck9mZnNldHNbYXhpc10gLSBzdGF0ZS5yZWN0cy5wb3BwZXJbbGVuXTtcbiAgdmFyIHN0YXJ0RGlmZiA9IHBvcHBlck9mZnNldHNbYXhpc10gLSBzdGF0ZS5yZWN0cy5yZWZlcmVuY2VbYXhpc107XG4gIHZhciBhcnJvd09mZnNldFBhcmVudCA9IGdldE9mZnNldFBhcmVudChhcnJvd0VsZW1lbnQpO1xuICB2YXIgY2xpZW50U2l6ZSA9IGFycm93T2Zmc2V0UGFyZW50ID8gYXhpcyA9PT0gJ3knID8gYXJyb3dPZmZzZXRQYXJlbnQuY2xpZW50SGVpZ2h0IHx8IDAgOiBhcnJvd09mZnNldFBhcmVudC5jbGllbnRXaWR0aCB8fCAwIDogMDtcbiAgdmFyIGNlbnRlclRvUmVmZXJlbmNlID0gZW5kRGlmZiAvIDIgLSBzdGFydERpZmYgLyAyOyAvLyBNYWtlIHN1cmUgdGhlIGFycm93IGRvZXNuJ3Qgb3ZlcmZsb3cgdGhlIHBvcHBlciBpZiB0aGUgY2VudGVyIHBvaW50IGlzXG4gIC8vIG91dHNpZGUgb2YgdGhlIHBvcHBlciBib3VuZHNcblxuICB2YXIgbWluID0gcGFkZGluZ09iamVjdFttaW5Qcm9wXTtcbiAgdmFyIG1heCA9IGNsaWVudFNpemUgLSBhcnJvd1JlY3RbbGVuXSAtIHBhZGRpbmdPYmplY3RbbWF4UHJvcF07XG4gIHZhciBjZW50ZXIgPSBjbGllbnRTaXplIC8gMiAtIGFycm93UmVjdFtsZW5dIC8gMiArIGNlbnRlclRvUmVmZXJlbmNlO1xuICB2YXIgb2Zmc2V0ID0gd2l0aGluKG1pbiwgY2VudGVyLCBtYXgpOyAvLyBQcmV2ZW50cyBicmVha2luZyBzeW50YXggaGlnaGxpZ2h0aW5nLi4uXG5cbiAgdmFyIGF4aXNQcm9wID0gYXhpcztcbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IChfc3RhdGUkbW9kaWZpZXJzRGF0YSQgPSB7fSwgX3N0YXRlJG1vZGlmaWVyc0RhdGEkW2F4aXNQcm9wXSA9IG9mZnNldCwgX3N0YXRlJG1vZGlmaWVyc0RhdGEkLmNlbnRlck9mZnNldCA9IG9mZnNldCAtIGNlbnRlciwgX3N0YXRlJG1vZGlmaWVyc0RhdGEkKTtcbn1cblxuZnVuY3Rpb24gZWZmZWN0KF9yZWYyKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYyLnN0YXRlLFxuICAgICAgb3B0aW9ucyA9IF9yZWYyLm9wdGlvbnM7XG4gIHZhciBfb3B0aW9ucyRlbGVtZW50ID0gb3B0aW9ucy5lbGVtZW50LFxuICAgICAgYXJyb3dFbGVtZW50ID0gX29wdGlvbnMkZWxlbWVudCA9PT0gdm9pZCAwID8gJ1tkYXRhLXBvcHBlci1hcnJvd10nIDogX29wdGlvbnMkZWxlbWVudDtcblxuICBpZiAoYXJyb3dFbGVtZW50ID09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH0gLy8gQ1NTIHNlbGVjdG9yXG5cblxuICBpZiAodHlwZW9mIGFycm93RWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICBhcnJvd0VsZW1lbnQgPSBzdGF0ZS5lbGVtZW50cy5wb3BwZXIucXVlcnlTZWxlY3RvcihhcnJvd0VsZW1lbnQpO1xuXG4gICAgaWYgKCFhcnJvd0VsZW1lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbnRhaW5zKHN0YXRlLmVsZW1lbnRzLnBvcHBlciwgYXJyb3dFbGVtZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHN0YXRlLmVsZW1lbnRzLmFycm93ID0gYXJyb3dFbGVtZW50O1xufSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnYXJyb3cnLFxuICBlbmFibGVkOiB0cnVlLFxuICBwaGFzZTogJ21haW4nLFxuICBmbjogYXJyb3csXG4gIGVmZmVjdDogZWZmZWN0LFxuICByZXF1aXJlczogWydwb3BwZXJPZmZzZXRzJ10sXG4gIHJlcXVpcmVzSWZFeGlzdHM6IFsncHJldmVudE92ZXJmbG93J11cbn07IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFZhcmlhdGlvbihwbGFjZW1lbnQpIHtcbiAgcmV0dXJuIHBsYWNlbWVudC5zcGxpdCgnLScpWzFdO1xufSIsICJpbXBvcnQgeyB0b3AsIGxlZnQsIHJpZ2h0LCBib3R0b20sIGVuZCB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuaW1wb3J0IGdldE9mZnNldFBhcmVudCBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldE9mZnNldFBhcmVudC5qc1wiO1xuaW1wb3J0IGdldFdpbmRvdyBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IGdldERvY3VtZW50RWxlbWVudCBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldERvY3VtZW50RWxlbWVudC5qc1wiO1xuaW1wb3J0IGdldENvbXB1dGVkU3R5bGUgZnJvbSBcIi4uL2RvbS11dGlscy9nZXRDb21wdXRlZFN0eWxlLmpzXCI7XG5pbXBvcnQgZ2V0QmFzZVBsYWNlbWVudCBmcm9tIFwiLi4vdXRpbHMvZ2V0QmFzZVBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IGdldFZhcmlhdGlvbiBmcm9tIFwiLi4vdXRpbHMvZ2V0VmFyaWF0aW9uLmpzXCI7XG5pbXBvcnQgeyByb3VuZCB9IGZyb20gXCIuLi91dGlscy9tYXRoLmpzXCI7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxudmFyIHVuc2V0U2lkZXMgPSB7XG4gIHRvcDogJ2F1dG8nLFxuICByaWdodDogJ2F1dG8nLFxuICBib3R0b206ICdhdXRvJyxcbiAgbGVmdDogJ2F1dG8nXG59OyAvLyBSb3VuZCB0aGUgb2Zmc2V0cyB0byB0aGUgbmVhcmVzdCBzdWl0YWJsZSBzdWJwaXhlbCBiYXNlZCBvbiB0aGUgRFBSLlxuLy8gWm9vbWluZyBjYW4gY2hhbmdlIHRoZSBEUFIsIGJ1dCBpdCBzZWVtcyB0byByZXBvcnQgYSB2YWx1ZSB0aGF0IHdpbGxcbi8vIGNsZWFubHkgZGl2aWRlIHRoZSB2YWx1ZXMgaW50byB0aGUgYXBwcm9wcmlhdGUgc3VicGl4ZWxzLlxuXG5mdW5jdGlvbiByb3VuZE9mZnNldHNCeURQUihfcmVmLCB3aW4pIHtcbiAgdmFyIHggPSBfcmVmLngsXG4gICAgICB5ID0gX3JlZi55O1xuICB2YXIgZHByID0gd2luLmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgcmV0dXJuIHtcbiAgICB4OiByb3VuZCh4ICogZHByKSAvIGRwciB8fCAwLFxuICAgIHk6IHJvdW5kKHkgKiBkcHIpIC8gZHByIHx8IDBcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvU3R5bGVzKF9yZWYyKSB7XG4gIHZhciBfT2JqZWN0JGFzc2lnbjI7XG5cbiAgdmFyIHBvcHBlciA9IF9yZWYyLnBvcHBlcixcbiAgICAgIHBvcHBlclJlY3QgPSBfcmVmMi5wb3BwZXJSZWN0LFxuICAgICAgcGxhY2VtZW50ID0gX3JlZjIucGxhY2VtZW50LFxuICAgICAgdmFyaWF0aW9uID0gX3JlZjIudmFyaWF0aW9uLFxuICAgICAgb2Zmc2V0cyA9IF9yZWYyLm9mZnNldHMsXG4gICAgICBwb3NpdGlvbiA9IF9yZWYyLnBvc2l0aW9uLFxuICAgICAgZ3B1QWNjZWxlcmF0aW9uID0gX3JlZjIuZ3B1QWNjZWxlcmF0aW9uLFxuICAgICAgYWRhcHRpdmUgPSBfcmVmMi5hZGFwdGl2ZSxcbiAgICAgIHJvdW5kT2Zmc2V0cyA9IF9yZWYyLnJvdW5kT2Zmc2V0cyxcbiAgICAgIGlzRml4ZWQgPSBfcmVmMi5pc0ZpeGVkO1xuICB2YXIgX29mZnNldHMkeCA9IG9mZnNldHMueCxcbiAgICAgIHggPSBfb2Zmc2V0cyR4ID09PSB2b2lkIDAgPyAwIDogX29mZnNldHMkeCxcbiAgICAgIF9vZmZzZXRzJHkgPSBvZmZzZXRzLnksXG4gICAgICB5ID0gX29mZnNldHMkeSA9PT0gdm9pZCAwID8gMCA6IF9vZmZzZXRzJHk7XG5cbiAgdmFyIF9yZWYzID0gdHlwZW9mIHJvdW5kT2Zmc2V0cyA9PT0gJ2Z1bmN0aW9uJyA/IHJvdW5kT2Zmc2V0cyh7XG4gICAgeDogeCxcbiAgICB5OiB5XG4gIH0pIDoge1xuICAgIHg6IHgsXG4gICAgeTogeVxuICB9O1xuXG4gIHggPSBfcmVmMy54O1xuICB5ID0gX3JlZjMueTtcbiAgdmFyIGhhc1ggPSBvZmZzZXRzLmhhc093blByb3BlcnR5KCd4Jyk7XG4gIHZhciBoYXNZID0gb2Zmc2V0cy5oYXNPd25Qcm9wZXJ0eSgneScpO1xuICB2YXIgc2lkZVggPSBsZWZ0O1xuICB2YXIgc2lkZVkgPSB0b3A7XG4gIHZhciB3aW4gPSB3aW5kb3c7XG5cbiAgaWYgKGFkYXB0aXZlKSB7XG4gICAgdmFyIG9mZnNldFBhcmVudCA9IGdldE9mZnNldFBhcmVudChwb3BwZXIpO1xuICAgIHZhciBoZWlnaHRQcm9wID0gJ2NsaWVudEhlaWdodCc7XG4gICAgdmFyIHdpZHRoUHJvcCA9ICdjbGllbnRXaWR0aCc7XG5cbiAgICBpZiAob2Zmc2V0UGFyZW50ID09PSBnZXRXaW5kb3cocG9wcGVyKSkge1xuICAgICAgb2Zmc2V0UGFyZW50ID0gZ2V0RG9jdW1lbnRFbGVtZW50KHBvcHBlcik7XG5cbiAgICAgIGlmIChnZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCkucG9zaXRpb24gIT09ICdzdGF0aWMnICYmIHBvc2l0aW9uID09PSAnYWJzb2x1dGUnKSB7XG4gICAgICAgIGhlaWdodFByb3AgPSAnc2Nyb2xsSGVpZ2h0JztcbiAgICAgICAgd2lkdGhQcm9wID0gJ3Njcm9sbFdpZHRoJztcbiAgICAgIH1cbiAgICB9IC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLWNhc3RdOiBmb3JjZSB0eXBlIHJlZmluZW1lbnQsIHdlIGNvbXBhcmUgb2Zmc2V0UGFyZW50IHdpdGggd2luZG93IGFib3ZlLCBidXQgRmxvdyBkb2Vzbid0IGRldGVjdCBpdFxuXG5cbiAgICBvZmZzZXRQYXJlbnQgPSBvZmZzZXRQYXJlbnQ7XG5cbiAgICBpZiAocGxhY2VtZW50ID09PSB0b3AgfHwgKHBsYWNlbWVudCA9PT0gbGVmdCB8fCBwbGFjZW1lbnQgPT09IHJpZ2h0KSAmJiB2YXJpYXRpb24gPT09IGVuZCkge1xuICAgICAgc2lkZVkgPSBib3R0b207XG4gICAgICB2YXIgb2Zmc2V0WSA9IGlzRml4ZWQgJiYgb2Zmc2V0UGFyZW50ID09PSB3aW4gJiYgd2luLnZpc3VhbFZpZXdwb3J0ID8gd2luLnZpc3VhbFZpZXdwb3J0LmhlaWdodCA6IC8vICRGbG93Rml4TWVbcHJvcC1taXNzaW5nXVxuICAgICAgb2Zmc2V0UGFyZW50W2hlaWdodFByb3BdO1xuICAgICAgeSAtPSBvZmZzZXRZIC0gcG9wcGVyUmVjdC5oZWlnaHQ7XG4gICAgICB5ICo9IGdwdUFjY2VsZXJhdGlvbiA/IDEgOiAtMTtcbiAgICB9XG5cbiAgICBpZiAocGxhY2VtZW50ID09PSBsZWZ0IHx8IChwbGFjZW1lbnQgPT09IHRvcCB8fCBwbGFjZW1lbnQgPT09IGJvdHRvbSkgJiYgdmFyaWF0aW9uID09PSBlbmQpIHtcbiAgICAgIHNpZGVYID0gcmlnaHQ7XG4gICAgICB2YXIgb2Zmc2V0WCA9IGlzRml4ZWQgJiYgb2Zmc2V0UGFyZW50ID09PSB3aW4gJiYgd2luLnZpc3VhbFZpZXdwb3J0ID8gd2luLnZpc3VhbFZpZXdwb3J0LndpZHRoIDogLy8gJEZsb3dGaXhNZVtwcm9wLW1pc3NpbmddXG4gICAgICBvZmZzZXRQYXJlbnRbd2lkdGhQcm9wXTtcbiAgICAgIHggLT0gb2Zmc2V0WCAtIHBvcHBlclJlY3Qud2lkdGg7XG4gICAgICB4ICo9IGdwdUFjY2VsZXJhdGlvbiA/IDEgOiAtMTtcbiAgICB9XG4gIH1cblxuICB2YXIgY29tbW9uU3R5bGVzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgcG9zaXRpb246IHBvc2l0aW9uXG4gIH0sIGFkYXB0aXZlICYmIHVuc2V0U2lkZXMpO1xuXG4gIHZhciBfcmVmNCA9IHJvdW5kT2Zmc2V0cyA9PT0gdHJ1ZSA/IHJvdW5kT2Zmc2V0c0J5RFBSKHtcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfSwgZ2V0V2luZG93KHBvcHBlcikpIDoge1xuICAgIHg6IHgsXG4gICAgeTogeVxuICB9O1xuXG4gIHggPSBfcmVmNC54O1xuICB5ID0gX3JlZjQueTtcblxuICBpZiAoZ3B1QWNjZWxlcmF0aW9uKSB7XG4gICAgdmFyIF9PYmplY3QkYXNzaWduO1xuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGNvbW1vblN0eWxlcywgKF9PYmplY3QkYXNzaWduID0ge30sIF9PYmplY3QkYXNzaWduW3NpZGVZXSA9IGhhc1kgPyAnMCcgOiAnJywgX09iamVjdCRhc3NpZ25bc2lkZVhdID0gaGFzWCA/ICcwJyA6ICcnLCBfT2JqZWN0JGFzc2lnbi50cmFuc2Zvcm0gPSAod2luLmRldmljZVBpeGVsUmF0aW8gfHwgMSkgPD0gMSA/IFwidHJhbnNsYXRlKFwiICsgeCArIFwicHgsIFwiICsgeSArIFwicHgpXCIgOiBcInRyYW5zbGF0ZTNkKFwiICsgeCArIFwicHgsIFwiICsgeSArIFwicHgsIDApXCIsIF9PYmplY3QkYXNzaWduKSk7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgY29tbW9uU3R5bGVzLCAoX09iamVjdCRhc3NpZ24yID0ge30sIF9PYmplY3QkYXNzaWduMltzaWRlWV0gPSBoYXNZID8geSArIFwicHhcIiA6ICcnLCBfT2JqZWN0JGFzc2lnbjJbc2lkZVhdID0gaGFzWCA/IHggKyBcInB4XCIgOiAnJywgX09iamVjdCRhc3NpZ24yLnRyYW5zZm9ybSA9ICcnLCBfT2JqZWN0JGFzc2lnbjIpKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVN0eWxlcyhfcmVmNSkge1xuICB2YXIgc3RhdGUgPSBfcmVmNS5zdGF0ZSxcbiAgICAgIG9wdGlvbnMgPSBfcmVmNS5vcHRpb25zO1xuICB2YXIgX29wdGlvbnMkZ3B1QWNjZWxlcmF0ID0gb3B0aW9ucy5ncHVBY2NlbGVyYXRpb24sXG4gICAgICBncHVBY2NlbGVyYXRpb24gPSBfb3B0aW9ucyRncHVBY2NlbGVyYXQgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRncHVBY2NlbGVyYXQsXG4gICAgICBfb3B0aW9ucyRhZGFwdGl2ZSA9IG9wdGlvbnMuYWRhcHRpdmUsXG4gICAgICBhZGFwdGl2ZSA9IF9vcHRpb25zJGFkYXB0aXZlID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkYWRhcHRpdmUsXG4gICAgICBfb3B0aW9ucyRyb3VuZE9mZnNldHMgPSBvcHRpb25zLnJvdW5kT2Zmc2V0cyxcbiAgICAgIHJvdW5kT2Zmc2V0cyA9IF9vcHRpb25zJHJvdW5kT2Zmc2V0cyA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJHJvdW5kT2Zmc2V0cztcbiAgdmFyIGNvbW1vblN0eWxlcyA9IHtcbiAgICBwbGFjZW1lbnQ6IGdldEJhc2VQbGFjZW1lbnQoc3RhdGUucGxhY2VtZW50KSxcbiAgICB2YXJpYXRpb246IGdldFZhcmlhdGlvbihzdGF0ZS5wbGFjZW1lbnQpLFxuICAgIHBvcHBlcjogc3RhdGUuZWxlbWVudHMucG9wcGVyLFxuICAgIHBvcHBlclJlY3Q6IHN0YXRlLnJlY3RzLnBvcHBlcixcbiAgICBncHVBY2NlbGVyYXRpb246IGdwdUFjY2VsZXJhdGlvbixcbiAgICBpc0ZpeGVkOiBzdGF0ZS5vcHRpb25zLnN0cmF0ZWd5ID09PSAnZml4ZWQnXG4gIH07XG5cbiAgaWYgKHN0YXRlLm1vZGlmaWVyc0RhdGEucG9wcGVyT2Zmc2V0cyAhPSBudWxsKSB7XG4gICAgc3RhdGUuc3R5bGVzLnBvcHBlciA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLnN0eWxlcy5wb3BwZXIsIG1hcFRvU3R5bGVzKE9iamVjdC5hc3NpZ24oe30sIGNvbW1vblN0eWxlcywge1xuICAgICAgb2Zmc2V0czogc3RhdGUubW9kaWZpZXJzRGF0YS5wb3BwZXJPZmZzZXRzLFxuICAgICAgcG9zaXRpb246IHN0YXRlLm9wdGlvbnMuc3RyYXRlZ3ksXG4gICAgICBhZGFwdGl2ZTogYWRhcHRpdmUsXG4gICAgICByb3VuZE9mZnNldHM6IHJvdW5kT2Zmc2V0c1xuICAgIH0pKSk7XG4gIH1cblxuICBpZiAoc3RhdGUubW9kaWZpZXJzRGF0YS5hcnJvdyAhPSBudWxsKSB7XG4gICAgc3RhdGUuc3R5bGVzLmFycm93ID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc3R5bGVzLmFycm93LCBtYXBUb1N0eWxlcyhPYmplY3QuYXNzaWduKHt9LCBjb21tb25TdHlsZXMsIHtcbiAgICAgIG9mZnNldHM6IHN0YXRlLm1vZGlmaWVyc0RhdGEuYXJyb3csXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGFkYXB0aXZlOiBmYWxzZSxcbiAgICAgIHJvdW5kT2Zmc2V0czogcm91bmRPZmZzZXRzXG4gICAgfSkpKTtcbiAgfVxuXG4gIHN0YXRlLmF0dHJpYnV0ZXMucG9wcGVyID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuYXR0cmlidXRlcy5wb3BwZXIsIHtcbiAgICAnZGF0YS1wb3BwZXItcGxhY2VtZW50Jzogc3RhdGUucGxhY2VtZW50XG4gIH0pO1xufSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnY29tcHV0ZVN0eWxlcycsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnYmVmb3JlV3JpdGUnLFxuICBmbjogY29tcHV0ZVN0eWxlcyxcbiAgZGF0YToge31cbn07IiwgImltcG9ydCBnZXRXaW5kb3cgZnJvbSBcIi4uL2RvbS11dGlscy9nZXRXaW5kb3cuanNcIjsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG52YXIgcGFzc2l2ZSA9IHtcbiAgcGFzc2l2ZTogdHJ1ZVxufTtcblxuZnVuY3Rpb24gZWZmZWN0KF9yZWYpIHtcbiAgdmFyIHN0YXRlID0gX3JlZi5zdGF0ZSxcbiAgICAgIGluc3RhbmNlID0gX3JlZi5pbnN0YW5jZSxcbiAgICAgIG9wdGlvbnMgPSBfcmVmLm9wdGlvbnM7XG4gIHZhciBfb3B0aW9ucyRzY3JvbGwgPSBvcHRpb25zLnNjcm9sbCxcbiAgICAgIHNjcm9sbCA9IF9vcHRpb25zJHNjcm9sbCA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJHNjcm9sbCxcbiAgICAgIF9vcHRpb25zJHJlc2l6ZSA9IG9wdGlvbnMucmVzaXplLFxuICAgICAgcmVzaXplID0gX29wdGlvbnMkcmVzaXplID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkcmVzaXplO1xuICB2YXIgd2luZG93ID0gZ2V0V2luZG93KHN0YXRlLmVsZW1lbnRzLnBvcHBlcik7XG4gIHZhciBzY3JvbGxQYXJlbnRzID0gW10uY29uY2F0KHN0YXRlLnNjcm9sbFBhcmVudHMucmVmZXJlbmNlLCBzdGF0ZS5zY3JvbGxQYXJlbnRzLnBvcHBlcik7XG5cbiAgaWYgKHNjcm9sbCkge1xuICAgIHNjcm9sbFBhcmVudHMuZm9yRWFjaChmdW5jdGlvbiAoc2Nyb2xsUGFyZW50KSB7XG4gICAgICBzY3JvbGxQYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaW5zdGFuY2UudXBkYXRlLCBwYXNzaXZlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChyZXNpemUpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaW5zdGFuY2UudXBkYXRlLCBwYXNzaXZlKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHNjcm9sbCkge1xuICAgICAgc2Nyb2xsUGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChzY3JvbGxQYXJlbnQpIHtcbiAgICAgICAgc2Nyb2xsUGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGluc3RhbmNlLnVwZGF0ZSwgcGFzc2l2ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAocmVzaXplKSB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaW5zdGFuY2UudXBkYXRlLCBwYXNzaXZlKTtcbiAgICB9XG4gIH07XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdldmVudExpc3RlbmVycycsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnd3JpdGUnLFxuICBmbjogZnVuY3Rpb24gZm4oKSB7fSxcbiAgZWZmZWN0OiBlZmZlY3QsXG4gIGRhdGE6IHt9XG59OyIsICJ2YXIgaGFzaCA9IHtcbiAgbGVmdDogJ3JpZ2h0JyxcbiAgcmlnaHQ6ICdsZWZ0JyxcbiAgYm90dG9tOiAndG9wJyxcbiAgdG9wOiAnYm90dG9tJ1xufTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldE9wcG9zaXRlUGxhY2VtZW50KHBsYWNlbWVudCkge1xuICByZXR1cm4gcGxhY2VtZW50LnJlcGxhY2UoL2xlZnR8cmlnaHR8Ym90dG9tfHRvcC9nLCBmdW5jdGlvbiAobWF0Y2hlZCkge1xuICAgIHJldHVybiBoYXNoW21hdGNoZWRdO1xuICB9KTtcbn0iLCAidmFyIGhhc2ggPSB7XG4gIHN0YXJ0OiAnZW5kJyxcbiAgZW5kOiAnc3RhcnQnXG59O1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0T3Bwb3NpdGVWYXJpYXRpb25QbGFjZW1lbnQocGxhY2VtZW50KSB7XG4gIHJldHVybiBwbGFjZW1lbnQucmVwbGFjZSgvc3RhcnR8ZW5kL2csIGZ1bmN0aW9uIChtYXRjaGVkKSB7XG4gICAgcmV0dXJuIGhhc2hbbWF0Y2hlZF07XG4gIH0pO1xufSIsICJpbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0V2luZG93U2Nyb2xsKG5vZGUpIHtcbiAgdmFyIHdpbiA9IGdldFdpbmRvdyhub2RlKTtcbiAgdmFyIHNjcm9sbExlZnQgPSB3aW4ucGFnZVhPZmZzZXQ7XG4gIHZhciBzY3JvbGxUb3AgPSB3aW4ucGFnZVlPZmZzZXQ7XG4gIHJldHVybiB7XG4gICAgc2Nyb2xsTGVmdDogc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3A6IHNjcm9sbFRvcFxuICB9O1xufSIsICJpbXBvcnQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGZyb20gXCIuL2dldEJvdW5kaW5nQ2xpZW50UmVjdC5qc1wiO1xuaW1wb3J0IGdldERvY3VtZW50RWxlbWVudCBmcm9tIFwiLi9nZXREb2N1bWVudEVsZW1lbnQuanNcIjtcbmltcG9ydCBnZXRXaW5kb3dTY3JvbGwgZnJvbSBcIi4vZ2V0V2luZG93U2Nyb2xsLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRXaW5kb3dTY3JvbGxCYXJYKGVsZW1lbnQpIHtcbiAgLy8gSWYgPGh0bWw+IGhhcyBhIENTUyB3aWR0aCBncmVhdGVyIHRoYW4gdGhlIHZpZXdwb3J0LCB0aGVuIHRoaXMgd2lsbCBiZVxuICAvLyBpbmNvcnJlY3QgZm9yIFJUTC5cbiAgLy8gUG9wcGVyIDEgaXMgYnJva2VuIGluIHRoaXMgY2FzZSBhbmQgbmV2ZXIgaGFkIGEgYnVnIHJlcG9ydCBzbyBsZXQncyBhc3N1bWVcbiAgLy8gaXQncyBub3QgYW4gaXNzdWUuIEkgZG9uJ3QgdGhpbmsgYW55b25lIGV2ZXIgc3BlY2lmaWVzIHdpZHRoIG9uIDxodG1sPlxuICAvLyBhbnl3YXkuXG4gIC8vIEJyb3dzZXJzIHdoZXJlIHRoZSBsZWZ0IHNjcm9sbGJhciBkb2Vzbid0IGNhdXNlIGFuIGlzc3VlIHJlcG9ydCBgMGAgZm9yXG4gIC8vIHRoaXMgKGUuZy4gRWRnZSAyMDE5LCBJRTExLCBTYWZhcmkpXG4gIHJldHVybiBnZXRCb3VuZGluZ0NsaWVudFJlY3QoZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpKS5sZWZ0ICsgZ2V0V2luZG93U2Nyb2xsKGVsZW1lbnQpLnNjcm9sbExlZnQ7XG59IiwgImltcG9ydCBnZXRXaW5kb3cgZnJvbSBcIi4vZ2V0V2luZG93LmpzXCI7XG5pbXBvcnQgZ2V0RG9jdW1lbnRFbGVtZW50IGZyb20gXCIuL2dldERvY3VtZW50RWxlbWVudC5qc1wiO1xuaW1wb3J0IGdldFdpbmRvd1Njcm9sbEJhclggZnJvbSBcIi4vZ2V0V2luZG93U2Nyb2xsQmFyWC5qc1wiO1xuaW1wb3J0IGlzTGF5b3V0Vmlld3BvcnQgZnJvbSBcIi4vaXNMYXlvdXRWaWV3cG9ydC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Vmlld3BvcnRSZWN0KGVsZW1lbnQsIHN0cmF0ZWd5KSB7XG4gIHZhciB3aW4gPSBnZXRXaW5kb3coZWxlbWVudCk7XG4gIHZhciBodG1sID0gZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpO1xuICB2YXIgdmlzdWFsVmlld3BvcnQgPSB3aW4udmlzdWFsVmlld3BvcnQ7XG4gIHZhciB3aWR0aCA9IGh0bWwuY2xpZW50V2lkdGg7XG4gIHZhciBoZWlnaHQgPSBodG1sLmNsaWVudEhlaWdodDtcbiAgdmFyIHggPSAwO1xuICB2YXIgeSA9IDA7XG5cbiAgaWYgKHZpc3VhbFZpZXdwb3J0KSB7XG4gICAgd2lkdGggPSB2aXN1YWxWaWV3cG9ydC53aWR0aDtcbiAgICBoZWlnaHQgPSB2aXN1YWxWaWV3cG9ydC5oZWlnaHQ7XG4gICAgdmFyIGxheW91dFZpZXdwb3J0ID0gaXNMYXlvdXRWaWV3cG9ydCgpO1xuXG4gICAgaWYgKGxheW91dFZpZXdwb3J0IHx8ICFsYXlvdXRWaWV3cG9ydCAmJiBzdHJhdGVneSA9PT0gJ2ZpeGVkJykge1xuICAgICAgeCA9IHZpc3VhbFZpZXdwb3J0Lm9mZnNldExlZnQ7XG4gICAgICB5ID0gdmlzdWFsVmlld3BvcnQub2Zmc2V0VG9wO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIHg6IHggKyBnZXRXaW5kb3dTY3JvbGxCYXJYKGVsZW1lbnQpLFxuICAgIHk6IHlcbiAgfTtcbn0iLCAiaW1wb3J0IGdldERvY3VtZW50RWxlbWVudCBmcm9tIFwiLi9nZXREb2N1bWVudEVsZW1lbnQuanNcIjtcbmltcG9ydCBnZXRDb21wdXRlZFN0eWxlIGZyb20gXCIuL2dldENvbXB1dGVkU3R5bGUuanNcIjtcbmltcG9ydCBnZXRXaW5kb3dTY3JvbGxCYXJYIGZyb20gXCIuL2dldFdpbmRvd1Njcm9sbEJhclguanNcIjtcbmltcG9ydCBnZXRXaW5kb3dTY3JvbGwgZnJvbSBcIi4vZ2V0V2luZG93U2Nyb2xsLmpzXCI7XG5pbXBvcnQgeyBtYXggfSBmcm9tIFwiLi4vdXRpbHMvbWF0aC5qc1wiOyAvLyBHZXRzIHRoZSBlbnRpcmUgc2l6ZSBvZiB0aGUgc2Nyb2xsYWJsZSBkb2N1bWVudCBhcmVhLCBldmVuIGV4dGVuZGluZyBvdXRzaWRlXG4vLyBvZiB0aGUgYDxodG1sPmAgYW5kIGA8Ym9keT5gIHJlY3QgYm91bmRzIGlmIGhvcml6b250YWxseSBzY3JvbGxhYmxlXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldERvY3VtZW50UmVjdChlbGVtZW50KSB7XG4gIHZhciBfZWxlbWVudCRvd25lckRvY3VtZW47XG5cbiAgdmFyIGh0bWwgPSBnZXREb2N1bWVudEVsZW1lbnQoZWxlbWVudCk7XG4gIHZhciB3aW5TY3JvbGwgPSBnZXRXaW5kb3dTY3JvbGwoZWxlbWVudCk7XG4gIHZhciBib2R5ID0gKF9lbGVtZW50JG93bmVyRG9jdW1lbiA9IGVsZW1lbnQub3duZXJEb2N1bWVudCkgPT0gbnVsbCA/IHZvaWQgMCA6IF9lbGVtZW50JG93bmVyRG9jdW1lbi5ib2R5O1xuICB2YXIgd2lkdGggPSBtYXgoaHRtbC5zY3JvbGxXaWR0aCwgaHRtbC5jbGllbnRXaWR0aCwgYm9keSA/IGJvZHkuc2Nyb2xsV2lkdGggOiAwLCBib2R5ID8gYm9keS5jbGllbnRXaWR0aCA6IDApO1xuICB2YXIgaGVpZ2h0ID0gbWF4KGh0bWwuc2Nyb2xsSGVpZ2h0LCBodG1sLmNsaWVudEhlaWdodCwgYm9keSA/IGJvZHkuc2Nyb2xsSGVpZ2h0IDogMCwgYm9keSA/IGJvZHkuY2xpZW50SGVpZ2h0IDogMCk7XG4gIHZhciB4ID0gLXdpblNjcm9sbC5zY3JvbGxMZWZ0ICsgZ2V0V2luZG93U2Nyb2xsQmFyWChlbGVtZW50KTtcbiAgdmFyIHkgPSAtd2luU2Nyb2xsLnNjcm9sbFRvcDtcblxuICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZShib2R5IHx8IGh0bWwpLmRpcmVjdGlvbiA9PT0gJ3J0bCcpIHtcbiAgICB4ICs9IG1heChodG1sLmNsaWVudFdpZHRoLCBib2R5ID8gYm9keS5jbGllbnRXaWR0aCA6IDApIC0gd2lkdGg7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfTtcbn0iLCAiaW1wb3J0IGdldENvbXB1dGVkU3R5bGUgZnJvbSBcIi4vZ2V0Q29tcHV0ZWRTdHlsZS5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNTY3JvbGxQYXJlbnQoZWxlbWVudCkge1xuICAvLyBGaXJlZm94IHdhbnRzIHVzIHRvIGNoZWNrIGAteGAgYW5kIGAteWAgdmFyaWF0aW9ucyBhcyB3ZWxsXG4gIHZhciBfZ2V0Q29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICBvdmVyZmxvdyA9IF9nZXRDb21wdXRlZFN0eWxlLm92ZXJmbG93LFxuICAgICAgb3ZlcmZsb3dYID0gX2dldENvbXB1dGVkU3R5bGUub3ZlcmZsb3dYLFxuICAgICAgb3ZlcmZsb3dZID0gX2dldENvbXB1dGVkU3R5bGUub3ZlcmZsb3dZO1xuXG4gIHJldHVybiAvYXV0b3xzY3JvbGx8b3ZlcmxheXxoaWRkZW4vLnRlc3Qob3ZlcmZsb3cgKyBvdmVyZmxvd1kgKyBvdmVyZmxvd1gpO1xufSIsICJpbXBvcnQgZ2V0UGFyZW50Tm9kZSBmcm9tIFwiLi9nZXRQYXJlbnROb2RlLmpzXCI7XG5pbXBvcnQgaXNTY3JvbGxQYXJlbnQgZnJvbSBcIi4vaXNTY3JvbGxQYXJlbnQuanNcIjtcbmltcG9ydCBnZXROb2RlTmFtZSBmcm9tIFwiLi9nZXROb2RlTmFtZS5qc1wiO1xuaW1wb3J0IHsgaXNIVE1MRWxlbWVudCB9IGZyb20gXCIuL2luc3RhbmNlT2YuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFNjcm9sbFBhcmVudChub2RlKSB7XG4gIGlmIChbJ2h0bWwnLCAnYm9keScsICcjZG9jdW1lbnQnXS5pbmRleE9mKGdldE5vZGVOYW1lKG5vZGUpKSA+PSAwKSB7XG4gICAgLy8gJEZsb3dGaXhNZVtpbmNvbXBhdGlibGUtcmV0dXJuXTogYXNzdW1lIGJvZHkgaXMgYWx3YXlzIGF2YWlsYWJsZVxuICAgIHJldHVybiBub2RlLm93bmVyRG9jdW1lbnQuYm9keTtcbiAgfVxuXG4gIGlmIChpc0hUTUxFbGVtZW50KG5vZGUpICYmIGlzU2Nyb2xsUGFyZW50KG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICByZXR1cm4gZ2V0U2Nyb2xsUGFyZW50KGdldFBhcmVudE5vZGUobm9kZSkpO1xufSIsICJpbXBvcnQgZ2V0U2Nyb2xsUGFyZW50IGZyb20gXCIuL2dldFNjcm9sbFBhcmVudC5qc1wiO1xuaW1wb3J0IGdldFBhcmVudE5vZGUgZnJvbSBcIi4vZ2V0UGFyZW50Tm9kZS5qc1wiO1xuaW1wb3J0IGdldFdpbmRvdyBmcm9tIFwiLi9nZXRXaW5kb3cuanNcIjtcbmltcG9ydCBpc1Njcm9sbFBhcmVudCBmcm9tIFwiLi9pc1Njcm9sbFBhcmVudC5qc1wiO1xuLypcbmdpdmVuIGEgRE9NIGVsZW1lbnQsIHJldHVybiB0aGUgbGlzdCBvZiBhbGwgc2Nyb2xsIHBhcmVudHMsIHVwIHRoZSBsaXN0IG9mIGFuY2Vzb3JzXG51bnRpbCB3ZSBnZXQgdG8gdGhlIHRvcCB3aW5kb3cgb2JqZWN0LiBUaGlzIGxpc3QgaXMgd2hhdCB3ZSBhdHRhY2ggc2Nyb2xsIGxpc3RlbmVyc1xudG8sIGJlY2F1c2UgaWYgYW55IG9mIHRoZXNlIHBhcmVudCBlbGVtZW50cyBzY3JvbGwsIHdlJ2xsIG5lZWQgdG8gcmUtY2FsY3VsYXRlIHRoZVxucmVmZXJlbmNlIGVsZW1lbnQncyBwb3NpdGlvbi5cbiovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxpc3RTY3JvbGxQYXJlbnRzKGVsZW1lbnQsIGxpc3QpIHtcbiAgdmFyIF9lbGVtZW50JG93bmVyRG9jdW1lbjtcblxuICBpZiAobGlzdCA9PT0gdm9pZCAwKSB7XG4gICAgbGlzdCA9IFtdO1xuICB9XG5cbiAgdmFyIHNjcm9sbFBhcmVudCA9IGdldFNjcm9sbFBhcmVudChlbGVtZW50KTtcbiAgdmFyIGlzQm9keSA9IHNjcm9sbFBhcmVudCA9PT0gKChfZWxlbWVudCRvd25lckRvY3VtZW4gPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQpID09IG51bGwgPyB2b2lkIDAgOiBfZWxlbWVudCRvd25lckRvY3VtZW4uYm9keSk7XG4gIHZhciB3aW4gPSBnZXRXaW5kb3coc2Nyb2xsUGFyZW50KTtcbiAgdmFyIHRhcmdldCA9IGlzQm9keSA/IFt3aW5dLmNvbmNhdCh3aW4udmlzdWFsVmlld3BvcnQgfHwgW10sIGlzU2Nyb2xsUGFyZW50KHNjcm9sbFBhcmVudCkgPyBzY3JvbGxQYXJlbnQgOiBbXSkgOiBzY3JvbGxQYXJlbnQ7XG4gIHZhciB1cGRhdGVkTGlzdCA9IGxpc3QuY29uY2F0KHRhcmdldCk7XG4gIHJldHVybiBpc0JvZHkgPyB1cGRhdGVkTGlzdCA6IC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLWNhbGxdOiBpc0JvZHkgdGVsbHMgdXMgdGFyZ2V0IHdpbGwgYmUgYW4gSFRNTEVsZW1lbnQgaGVyZVxuICB1cGRhdGVkTGlzdC5jb25jYXQobGlzdFNjcm9sbFBhcmVudHMoZ2V0UGFyZW50Tm9kZSh0YXJnZXQpKSk7XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlY3RUb0NsaWVudFJlY3QocmVjdCkge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgcmVjdCwge1xuICAgIGxlZnQ6IHJlY3QueCxcbiAgICB0b3A6IHJlY3QueSxcbiAgICByaWdodDogcmVjdC54ICsgcmVjdC53aWR0aCxcbiAgICBib3R0b206IHJlY3QueSArIHJlY3QuaGVpZ2h0XG4gIH0pO1xufSIsICJpbXBvcnQgeyB2aWV3cG9ydCB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuaW1wb3J0IGdldFZpZXdwb3J0UmVjdCBmcm9tIFwiLi9nZXRWaWV3cG9ydFJlY3QuanNcIjtcbmltcG9ydCBnZXREb2N1bWVudFJlY3QgZnJvbSBcIi4vZ2V0RG9jdW1lbnRSZWN0LmpzXCI7XG5pbXBvcnQgbGlzdFNjcm9sbFBhcmVudHMgZnJvbSBcIi4vbGlzdFNjcm9sbFBhcmVudHMuanNcIjtcbmltcG9ydCBnZXRPZmZzZXRQYXJlbnQgZnJvbSBcIi4vZ2V0T2Zmc2V0UGFyZW50LmpzXCI7XG5pbXBvcnQgZ2V0RG9jdW1lbnRFbGVtZW50IGZyb20gXCIuL2dldERvY3VtZW50RWxlbWVudC5qc1wiO1xuaW1wb3J0IGdldENvbXB1dGVkU3R5bGUgZnJvbSBcIi4vZ2V0Q29tcHV0ZWRTdHlsZS5qc1wiO1xuaW1wb3J0IHsgaXNFbGVtZW50LCBpc0hUTUxFbGVtZW50IH0gZnJvbSBcIi4vaW5zdGFuY2VPZi5qc1wiO1xuaW1wb3J0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCBmcm9tIFwiLi9nZXRCb3VuZGluZ0NsaWVudFJlY3QuanNcIjtcbmltcG9ydCBnZXRQYXJlbnROb2RlIGZyb20gXCIuL2dldFBhcmVudE5vZGUuanNcIjtcbmltcG9ydCBjb250YWlucyBmcm9tIFwiLi9jb250YWlucy5qc1wiO1xuaW1wb3J0IGdldE5vZGVOYW1lIGZyb20gXCIuL2dldE5vZGVOYW1lLmpzXCI7XG5pbXBvcnQgcmVjdFRvQ2xpZW50UmVjdCBmcm9tIFwiLi4vdXRpbHMvcmVjdFRvQ2xpZW50UmVjdC5qc1wiO1xuaW1wb3J0IHsgbWF4LCBtaW4gfSBmcm9tIFwiLi4vdXRpbHMvbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBnZXRJbm5lckJvdW5kaW5nQ2xpZW50UmVjdChlbGVtZW50LCBzdHJhdGVneSkge1xuICB2YXIgcmVjdCA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbGVtZW50LCBmYWxzZSwgc3RyYXRlZ3kgPT09ICdmaXhlZCcpO1xuICByZWN0LnRvcCA9IHJlY3QudG9wICsgZWxlbWVudC5jbGllbnRUb3A7XG4gIHJlY3QubGVmdCA9IHJlY3QubGVmdCArIGVsZW1lbnQuY2xpZW50TGVmdDtcbiAgcmVjdC5ib3R0b20gPSByZWN0LnRvcCArIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZWN0LnJpZ2h0ID0gcmVjdC5sZWZ0ICsgZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgcmVjdC53aWR0aCA9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gIHJlY3QueCA9IHJlY3QubGVmdDtcbiAgcmVjdC55ID0gcmVjdC50b3A7XG4gIHJldHVybiByZWN0O1xufVxuXG5mdW5jdGlvbiBnZXRDbGllbnRSZWN0RnJvbU1peGVkVHlwZShlbGVtZW50LCBjbGlwcGluZ1BhcmVudCwgc3RyYXRlZ3kpIHtcbiAgcmV0dXJuIGNsaXBwaW5nUGFyZW50ID09PSB2aWV3cG9ydCA/IHJlY3RUb0NsaWVudFJlY3QoZ2V0Vmlld3BvcnRSZWN0KGVsZW1lbnQsIHN0cmF0ZWd5KSkgOiBpc0VsZW1lbnQoY2xpcHBpbmdQYXJlbnQpID8gZ2V0SW5uZXJCb3VuZGluZ0NsaWVudFJlY3QoY2xpcHBpbmdQYXJlbnQsIHN0cmF0ZWd5KSA6IHJlY3RUb0NsaWVudFJlY3QoZ2V0RG9jdW1lbnRSZWN0KGdldERvY3VtZW50RWxlbWVudChlbGVtZW50KSkpO1xufSAvLyBBIFwiY2xpcHBpbmcgcGFyZW50XCIgaXMgYW4gb3ZlcmZsb3dhYmxlIGNvbnRhaW5lciB3aXRoIHRoZSBjaGFyYWN0ZXJpc3RpYyBvZlxuLy8gY2xpcHBpbmcgKG9yIGhpZGluZykgb3ZlcmZsb3dpbmcgZWxlbWVudHMgd2l0aCBhIHBvc2l0aW9uIGRpZmZlcmVudCBmcm9tXG4vLyBgaW5pdGlhbGBcblxuXG5mdW5jdGlvbiBnZXRDbGlwcGluZ1BhcmVudHMoZWxlbWVudCkge1xuICB2YXIgY2xpcHBpbmdQYXJlbnRzID0gbGlzdFNjcm9sbFBhcmVudHMoZ2V0UGFyZW50Tm9kZShlbGVtZW50KSk7XG4gIHZhciBjYW5Fc2NhcGVDbGlwcGluZyA9IFsnYWJzb2x1dGUnLCAnZml4ZWQnXS5pbmRleE9mKGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkucG9zaXRpb24pID49IDA7XG4gIHZhciBjbGlwcGVyRWxlbWVudCA9IGNhbkVzY2FwZUNsaXBwaW5nICYmIGlzSFRNTEVsZW1lbnQoZWxlbWVudCkgPyBnZXRPZmZzZXRQYXJlbnQoZWxlbWVudCkgOiBlbGVtZW50O1xuXG4gIGlmICghaXNFbGVtZW50KGNsaXBwZXJFbGVtZW50KSkge1xuICAgIHJldHVybiBbXTtcbiAgfSAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1yZXR1cm5dOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMTQxNFxuXG5cbiAgcmV0dXJuIGNsaXBwaW5nUGFyZW50cy5maWx0ZXIoZnVuY3Rpb24gKGNsaXBwaW5nUGFyZW50KSB7XG4gICAgcmV0dXJuIGlzRWxlbWVudChjbGlwcGluZ1BhcmVudCkgJiYgY29udGFpbnMoY2xpcHBpbmdQYXJlbnQsIGNsaXBwZXJFbGVtZW50KSAmJiBnZXROb2RlTmFtZShjbGlwcGluZ1BhcmVudCkgIT09ICdib2R5JztcbiAgfSk7XG59IC8vIEdldHMgdGhlIG1heGltdW0gYXJlYSB0aGF0IHRoZSBlbGVtZW50IGlzIHZpc2libGUgaW4gZHVlIHRvIGFueSBudW1iZXIgb2Zcbi8vIGNsaXBwaW5nIHBhcmVudHNcblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRDbGlwcGluZ1JlY3QoZWxlbWVudCwgYm91bmRhcnksIHJvb3RCb3VuZGFyeSwgc3RyYXRlZ3kpIHtcbiAgdmFyIG1haW5DbGlwcGluZ1BhcmVudHMgPSBib3VuZGFyeSA9PT0gJ2NsaXBwaW5nUGFyZW50cycgPyBnZXRDbGlwcGluZ1BhcmVudHMoZWxlbWVudCkgOiBbXS5jb25jYXQoYm91bmRhcnkpO1xuICB2YXIgY2xpcHBpbmdQYXJlbnRzID0gW10uY29uY2F0KG1haW5DbGlwcGluZ1BhcmVudHMsIFtyb290Qm91bmRhcnldKTtcbiAgdmFyIGZpcnN0Q2xpcHBpbmdQYXJlbnQgPSBjbGlwcGluZ1BhcmVudHNbMF07XG4gIHZhciBjbGlwcGluZ1JlY3QgPSBjbGlwcGluZ1BhcmVudHMucmVkdWNlKGZ1bmN0aW9uIChhY2NSZWN0LCBjbGlwcGluZ1BhcmVudCkge1xuICAgIHZhciByZWN0ID0gZ2V0Q2xpZW50UmVjdEZyb21NaXhlZFR5cGUoZWxlbWVudCwgY2xpcHBpbmdQYXJlbnQsIHN0cmF0ZWd5KTtcbiAgICBhY2NSZWN0LnRvcCA9IG1heChyZWN0LnRvcCwgYWNjUmVjdC50b3ApO1xuICAgIGFjY1JlY3QucmlnaHQgPSBtaW4ocmVjdC5yaWdodCwgYWNjUmVjdC5yaWdodCk7XG4gICAgYWNjUmVjdC5ib3R0b20gPSBtaW4ocmVjdC5ib3R0b20sIGFjY1JlY3QuYm90dG9tKTtcbiAgICBhY2NSZWN0LmxlZnQgPSBtYXgocmVjdC5sZWZ0LCBhY2NSZWN0LmxlZnQpO1xuICAgIHJldHVybiBhY2NSZWN0O1xuICB9LCBnZXRDbGllbnRSZWN0RnJvbU1peGVkVHlwZShlbGVtZW50LCBmaXJzdENsaXBwaW5nUGFyZW50LCBzdHJhdGVneSkpO1xuICBjbGlwcGluZ1JlY3Qud2lkdGggPSBjbGlwcGluZ1JlY3QucmlnaHQgLSBjbGlwcGluZ1JlY3QubGVmdDtcbiAgY2xpcHBpbmdSZWN0LmhlaWdodCA9IGNsaXBwaW5nUmVjdC5ib3R0b20gLSBjbGlwcGluZ1JlY3QudG9wO1xuICBjbGlwcGluZ1JlY3QueCA9IGNsaXBwaW5nUmVjdC5sZWZ0O1xuICBjbGlwcGluZ1JlY3QueSA9IGNsaXBwaW5nUmVjdC50b3A7XG4gIHJldHVybiBjbGlwcGluZ1JlY3Q7XG59IiwgImltcG9ydCBnZXRCYXNlUGxhY2VtZW50IGZyb20gXCIuL2dldEJhc2VQbGFjZW1lbnQuanNcIjtcbmltcG9ydCBnZXRWYXJpYXRpb24gZnJvbSBcIi4vZ2V0VmFyaWF0aW9uLmpzXCI7XG5pbXBvcnQgZ2V0TWFpbkF4aXNGcm9tUGxhY2VtZW50IGZyb20gXCIuL2dldE1haW5BeGlzRnJvbVBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0LCBzdGFydCwgZW5kIH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21wdXRlT2Zmc2V0cyhfcmVmKSB7XG4gIHZhciByZWZlcmVuY2UgPSBfcmVmLnJlZmVyZW5jZSxcbiAgICAgIGVsZW1lbnQgPSBfcmVmLmVsZW1lbnQsXG4gICAgICBwbGFjZW1lbnQgPSBfcmVmLnBsYWNlbWVudDtcbiAgdmFyIGJhc2VQbGFjZW1lbnQgPSBwbGFjZW1lbnQgPyBnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCkgOiBudWxsO1xuICB2YXIgdmFyaWF0aW9uID0gcGxhY2VtZW50ID8gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCkgOiBudWxsO1xuICB2YXIgY29tbW9uWCA9IHJlZmVyZW5jZS54ICsgcmVmZXJlbmNlLndpZHRoIC8gMiAtIGVsZW1lbnQud2lkdGggLyAyO1xuICB2YXIgY29tbW9uWSA9IHJlZmVyZW5jZS55ICsgcmVmZXJlbmNlLmhlaWdodCAvIDIgLSBlbGVtZW50LmhlaWdodCAvIDI7XG4gIHZhciBvZmZzZXRzO1xuXG4gIHN3aXRjaCAoYmFzZVBsYWNlbWVudCkge1xuICAgIGNhc2UgdG9wOlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogY29tbW9uWCxcbiAgICAgICAgeTogcmVmZXJlbmNlLnkgLSBlbGVtZW50LmhlaWdodFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBib3R0b206XG4gICAgICBvZmZzZXRzID0ge1xuICAgICAgICB4OiBjb21tb25YLFxuICAgICAgICB5OiByZWZlcmVuY2UueSArIHJlZmVyZW5jZS5oZWlnaHRcbiAgICAgIH07XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcmlnaHQ6XG4gICAgICBvZmZzZXRzID0ge1xuICAgICAgICB4OiByZWZlcmVuY2UueCArIHJlZmVyZW5jZS53aWR0aCxcbiAgICAgICAgeTogY29tbW9uWVxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBsZWZ0OlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogcmVmZXJlbmNlLnggLSBlbGVtZW50LndpZHRoLFxuICAgICAgICB5OiBjb21tb25ZXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogcmVmZXJlbmNlLngsXG4gICAgICAgIHk6IHJlZmVyZW5jZS55XG4gICAgICB9O1xuICB9XG5cbiAgdmFyIG1haW5BeGlzID0gYmFzZVBsYWNlbWVudCA/IGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChiYXNlUGxhY2VtZW50KSA6IG51bGw7XG5cbiAgaWYgKG1haW5BeGlzICE9IG51bGwpIHtcbiAgICB2YXIgbGVuID0gbWFpbkF4aXMgPT09ICd5JyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcblxuICAgIHN3aXRjaCAodmFyaWF0aW9uKSB7XG4gICAgICBjYXNlIHN0YXJ0OlxuICAgICAgICBvZmZzZXRzW21haW5BeGlzXSA9IG9mZnNldHNbbWFpbkF4aXNdIC0gKHJlZmVyZW5jZVtsZW5dIC8gMiAtIGVsZW1lbnRbbGVuXSAvIDIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBlbmQ6XG4gICAgICAgIG9mZnNldHNbbWFpbkF4aXNdID0gb2Zmc2V0c1ttYWluQXhpc10gKyAocmVmZXJlbmNlW2xlbl0gLyAyIC0gZWxlbWVudFtsZW5dIC8gMik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvZmZzZXRzO1xufSIsICJpbXBvcnQgZ2V0Q2xpcHBpbmdSZWN0IGZyb20gXCIuLi9kb20tdXRpbHMvZ2V0Q2xpcHBpbmdSZWN0LmpzXCI7XG5pbXBvcnQgZ2V0RG9jdW1lbnRFbGVtZW50IGZyb20gXCIuLi9kb20tdXRpbHMvZ2V0RG9jdW1lbnRFbGVtZW50LmpzXCI7XG5pbXBvcnQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGZyb20gXCIuLi9kb20tdXRpbHMvZ2V0Qm91bmRpbmdDbGllbnRSZWN0LmpzXCI7XG5pbXBvcnQgY29tcHV0ZU9mZnNldHMgZnJvbSBcIi4vY29tcHV0ZU9mZnNldHMuanNcIjtcbmltcG9ydCByZWN0VG9DbGllbnRSZWN0IGZyb20gXCIuL3JlY3RUb0NsaWVudFJlY3QuanNcIjtcbmltcG9ydCB7IGNsaXBwaW5nUGFyZW50cywgcmVmZXJlbmNlLCBwb3BwZXIsIGJvdHRvbSwgdG9wLCByaWdodCwgYmFzZVBsYWNlbWVudHMsIHZpZXdwb3J0IH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7XG5pbXBvcnQgeyBpc0VsZW1lbnQgfSBmcm9tIFwiLi4vZG9tLXV0aWxzL2luc3RhbmNlT2YuanNcIjtcbmltcG9ydCBtZXJnZVBhZGRpbmdPYmplY3QgZnJvbSBcIi4vbWVyZ2VQYWRkaW5nT2JqZWN0LmpzXCI7XG5pbXBvcnQgZXhwYW5kVG9IYXNoTWFwIGZyb20gXCIuL2V4cGFuZFRvSGFzaE1hcC5qc1wiOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRldGVjdE92ZXJmbG93KHN0YXRlLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICB2YXIgX29wdGlvbnMgPSBvcHRpb25zLFxuICAgICAgX29wdGlvbnMkcGxhY2VtZW50ID0gX29wdGlvbnMucGxhY2VtZW50LFxuICAgICAgcGxhY2VtZW50ID0gX29wdGlvbnMkcGxhY2VtZW50ID09PSB2b2lkIDAgPyBzdGF0ZS5wbGFjZW1lbnQgOiBfb3B0aW9ucyRwbGFjZW1lbnQsXG4gICAgICBfb3B0aW9ucyRzdHJhdGVneSA9IF9vcHRpb25zLnN0cmF0ZWd5LFxuICAgICAgc3RyYXRlZ3kgPSBfb3B0aW9ucyRzdHJhdGVneSA9PT0gdm9pZCAwID8gc3RhdGUuc3RyYXRlZ3kgOiBfb3B0aW9ucyRzdHJhdGVneSxcbiAgICAgIF9vcHRpb25zJGJvdW5kYXJ5ID0gX29wdGlvbnMuYm91bmRhcnksXG4gICAgICBib3VuZGFyeSA9IF9vcHRpb25zJGJvdW5kYXJ5ID09PSB2b2lkIDAgPyBjbGlwcGluZ1BhcmVudHMgOiBfb3B0aW9ucyRib3VuZGFyeSxcbiAgICAgIF9vcHRpb25zJHJvb3RCb3VuZGFyeSA9IF9vcHRpb25zLnJvb3RCb3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeSA9IF9vcHRpb25zJHJvb3RCb3VuZGFyeSA9PT0gdm9pZCAwID8gdmlld3BvcnQgOiBfb3B0aW9ucyRyb290Qm91bmRhcnksXG4gICAgICBfb3B0aW9ucyRlbGVtZW50Q29udGUgPSBfb3B0aW9ucy5lbGVtZW50Q29udGV4dCxcbiAgICAgIGVsZW1lbnRDb250ZXh0ID0gX29wdGlvbnMkZWxlbWVudENvbnRlID09PSB2b2lkIDAgPyBwb3BwZXIgOiBfb3B0aW9ucyRlbGVtZW50Q29udGUsXG4gICAgICBfb3B0aW9ucyRhbHRCb3VuZGFyeSA9IF9vcHRpb25zLmFsdEJvdW5kYXJ5LFxuICAgICAgYWx0Qm91bmRhcnkgPSBfb3B0aW9ucyRhbHRCb3VuZGFyeSA9PT0gdm9pZCAwID8gZmFsc2UgOiBfb3B0aW9ucyRhbHRCb3VuZGFyeSxcbiAgICAgIF9vcHRpb25zJHBhZGRpbmcgPSBfb3B0aW9ucy5wYWRkaW5nLFxuICAgICAgcGFkZGluZyA9IF9vcHRpb25zJHBhZGRpbmcgPT09IHZvaWQgMCA/IDAgOiBfb3B0aW9ucyRwYWRkaW5nO1xuICB2YXIgcGFkZGluZ09iamVjdCA9IG1lcmdlUGFkZGluZ09iamVjdCh0eXBlb2YgcGFkZGluZyAhPT0gJ251bWJlcicgPyBwYWRkaW5nIDogZXhwYW5kVG9IYXNoTWFwKHBhZGRpbmcsIGJhc2VQbGFjZW1lbnRzKSk7XG4gIHZhciBhbHRDb250ZXh0ID0gZWxlbWVudENvbnRleHQgPT09IHBvcHBlciA/IHJlZmVyZW5jZSA6IHBvcHBlcjtcbiAgdmFyIHBvcHBlclJlY3QgPSBzdGF0ZS5yZWN0cy5wb3BwZXI7XG4gIHZhciBlbGVtZW50ID0gc3RhdGUuZWxlbWVudHNbYWx0Qm91bmRhcnkgPyBhbHRDb250ZXh0IDogZWxlbWVudENvbnRleHRdO1xuICB2YXIgY2xpcHBpbmdDbGllbnRSZWN0ID0gZ2V0Q2xpcHBpbmdSZWN0KGlzRWxlbWVudChlbGVtZW50KSA/IGVsZW1lbnQgOiBlbGVtZW50LmNvbnRleHRFbGVtZW50IHx8IGdldERvY3VtZW50RWxlbWVudChzdGF0ZS5lbGVtZW50cy5wb3BwZXIpLCBib3VuZGFyeSwgcm9vdEJvdW5kYXJ5LCBzdHJhdGVneSk7XG4gIHZhciByZWZlcmVuY2VDbGllbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KHN0YXRlLmVsZW1lbnRzLnJlZmVyZW5jZSk7XG4gIHZhciBwb3BwZXJPZmZzZXRzID0gY29tcHV0ZU9mZnNldHMoe1xuICAgIHJlZmVyZW5jZTogcmVmZXJlbmNlQ2xpZW50UmVjdCxcbiAgICBlbGVtZW50OiBwb3BwZXJSZWN0LFxuICAgIHN0cmF0ZWd5OiAnYWJzb2x1dGUnLFxuICAgIHBsYWNlbWVudDogcGxhY2VtZW50XG4gIH0pO1xuICB2YXIgcG9wcGVyQ2xpZW50UmVjdCA9IHJlY3RUb0NsaWVudFJlY3QoT2JqZWN0LmFzc2lnbih7fSwgcG9wcGVyUmVjdCwgcG9wcGVyT2Zmc2V0cykpO1xuICB2YXIgZWxlbWVudENsaWVudFJlY3QgPSBlbGVtZW50Q29udGV4dCA9PT0gcG9wcGVyID8gcG9wcGVyQ2xpZW50UmVjdCA6IHJlZmVyZW5jZUNsaWVudFJlY3Q7IC8vIHBvc2l0aXZlID0gb3ZlcmZsb3dpbmcgdGhlIGNsaXBwaW5nIHJlY3RcbiAgLy8gMCBvciBuZWdhdGl2ZSA9IHdpdGhpbiB0aGUgY2xpcHBpbmcgcmVjdFxuXG4gIHZhciBvdmVyZmxvd09mZnNldHMgPSB7XG4gICAgdG9wOiBjbGlwcGluZ0NsaWVudFJlY3QudG9wIC0gZWxlbWVudENsaWVudFJlY3QudG9wICsgcGFkZGluZ09iamVjdC50b3AsXG4gICAgYm90dG9tOiBlbGVtZW50Q2xpZW50UmVjdC5ib3R0b20gLSBjbGlwcGluZ0NsaWVudFJlY3QuYm90dG9tICsgcGFkZGluZ09iamVjdC5ib3R0b20sXG4gICAgbGVmdDogY2xpcHBpbmdDbGllbnRSZWN0LmxlZnQgLSBlbGVtZW50Q2xpZW50UmVjdC5sZWZ0ICsgcGFkZGluZ09iamVjdC5sZWZ0LFxuICAgIHJpZ2h0OiBlbGVtZW50Q2xpZW50UmVjdC5yaWdodCAtIGNsaXBwaW5nQ2xpZW50UmVjdC5yaWdodCArIHBhZGRpbmdPYmplY3QucmlnaHRcbiAgfTtcbiAgdmFyIG9mZnNldERhdGEgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLm9mZnNldDsgLy8gT2Zmc2V0cyBjYW4gYmUgYXBwbGllZCBvbmx5IHRvIHRoZSBwb3BwZXIgZWxlbWVudFxuXG4gIGlmIChlbGVtZW50Q29udGV4dCA9PT0gcG9wcGVyICYmIG9mZnNldERhdGEpIHtcbiAgICB2YXIgb2Zmc2V0ID0gb2Zmc2V0RGF0YVtwbGFjZW1lbnRdO1xuICAgIE9iamVjdC5rZXlzKG92ZXJmbG93T2Zmc2V0cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgbXVsdGlwbHkgPSBbcmlnaHQsIGJvdHRvbV0uaW5kZXhPZihrZXkpID49IDAgPyAxIDogLTE7XG4gICAgICB2YXIgYXhpcyA9IFt0b3AsIGJvdHRvbV0uaW5kZXhPZihrZXkpID49IDAgPyAneScgOiAneCc7XG4gICAgICBvdmVyZmxvd09mZnNldHNba2V5XSArPSBvZmZzZXRbYXhpc10gKiBtdWx0aXBseTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBvdmVyZmxvd09mZnNldHM7XG59IiwgImltcG9ydCBnZXRWYXJpYXRpb24gZnJvbSBcIi4vZ2V0VmFyaWF0aW9uLmpzXCI7XG5pbXBvcnQgeyB2YXJpYXRpb25QbGFjZW1lbnRzLCBiYXNlUGxhY2VtZW50cywgcGxhY2VtZW50cyBhcyBhbGxQbGFjZW1lbnRzIH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7XG5pbXBvcnQgZGV0ZWN0T3ZlcmZsb3cgZnJvbSBcIi4vZGV0ZWN0T3ZlcmZsb3cuanNcIjtcbmltcG9ydCBnZXRCYXNlUGxhY2VtZW50IGZyb20gXCIuL2dldEJhc2VQbGFjZW1lbnQuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbXB1dGVBdXRvUGxhY2VtZW50KHN0YXRlLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICB2YXIgX29wdGlvbnMgPSBvcHRpb25zLFxuICAgICAgcGxhY2VtZW50ID0gX29wdGlvbnMucGxhY2VtZW50LFxuICAgICAgYm91bmRhcnkgPSBfb3B0aW9ucy5ib3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeSA9IF9vcHRpb25zLnJvb3RCb3VuZGFyeSxcbiAgICAgIHBhZGRpbmcgPSBfb3B0aW9ucy5wYWRkaW5nLFxuICAgICAgZmxpcFZhcmlhdGlvbnMgPSBfb3B0aW9ucy5mbGlwVmFyaWF0aW9ucyxcbiAgICAgIF9vcHRpb25zJGFsbG93ZWRBdXRvUCA9IF9vcHRpb25zLmFsbG93ZWRBdXRvUGxhY2VtZW50cyxcbiAgICAgIGFsbG93ZWRBdXRvUGxhY2VtZW50cyA9IF9vcHRpb25zJGFsbG93ZWRBdXRvUCA9PT0gdm9pZCAwID8gYWxsUGxhY2VtZW50cyA6IF9vcHRpb25zJGFsbG93ZWRBdXRvUDtcbiAgdmFyIHZhcmlhdGlvbiA9IGdldFZhcmlhdGlvbihwbGFjZW1lbnQpO1xuICB2YXIgcGxhY2VtZW50cyA9IHZhcmlhdGlvbiA/IGZsaXBWYXJpYXRpb25zID8gdmFyaWF0aW9uUGxhY2VtZW50cyA6IHZhcmlhdGlvblBsYWNlbWVudHMuZmlsdGVyKGZ1bmN0aW9uIChwbGFjZW1lbnQpIHtcbiAgICByZXR1cm4gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCkgPT09IHZhcmlhdGlvbjtcbiAgfSkgOiBiYXNlUGxhY2VtZW50cztcbiAgdmFyIGFsbG93ZWRQbGFjZW1lbnRzID0gcGxhY2VtZW50cy5maWx0ZXIoZnVuY3Rpb24gKHBsYWNlbWVudCkge1xuICAgIHJldHVybiBhbGxvd2VkQXV0b1BsYWNlbWVudHMuaW5kZXhPZihwbGFjZW1lbnQpID49IDA7XG4gIH0pO1xuXG4gIGlmIChhbGxvd2VkUGxhY2VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBhbGxvd2VkUGxhY2VtZW50cyA9IHBsYWNlbWVudHM7XG4gIH0gLy8gJEZsb3dGaXhNZVtpbmNvbXBhdGlibGUtdHlwZV06IEZsb3cgc2VlbXMgdG8gaGF2ZSBwcm9ibGVtcyB3aXRoIHR3byBhcnJheSB1bmlvbnMuLi5cblxuXG4gIHZhciBvdmVyZmxvd3MgPSBhbGxvd2VkUGxhY2VtZW50cy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gICAgYWNjW3BsYWNlbWVudF0gPSBkZXRlY3RPdmVyZmxvdyhzdGF0ZSwge1xuICAgICAgcGxhY2VtZW50OiBwbGFjZW1lbnQsXG4gICAgICBib3VuZGFyeTogYm91bmRhcnksXG4gICAgICByb290Qm91bmRhcnk6IHJvb3RCb3VuZGFyeSxcbiAgICAgIHBhZGRpbmc6IHBhZGRpbmdcbiAgICB9KVtnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCldO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG92ZXJmbG93cykuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBvdmVyZmxvd3NbYV0gLSBvdmVyZmxvd3NbYl07XG4gIH0pO1xufSIsICJpbXBvcnQgZ2V0T3Bwb3NpdGVQbGFjZW1lbnQgZnJvbSBcIi4uL3V0aWxzL2dldE9wcG9zaXRlUGxhY2VtZW50LmpzXCI7XG5pbXBvcnQgZ2V0QmFzZVBsYWNlbWVudCBmcm9tIFwiLi4vdXRpbHMvZ2V0QmFzZVBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IGdldE9wcG9zaXRlVmFyaWF0aW9uUGxhY2VtZW50IGZyb20gXCIuLi91dGlscy9nZXRPcHBvc2l0ZVZhcmlhdGlvblBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IGRldGVjdE92ZXJmbG93IGZyb20gXCIuLi91dGlscy9kZXRlY3RPdmVyZmxvdy5qc1wiO1xuaW1wb3J0IGNvbXB1dGVBdXRvUGxhY2VtZW50IGZyb20gXCIuLi91dGlscy9jb21wdXRlQXV0b1BsYWNlbWVudC5qc1wiO1xuaW1wb3J0IHsgYm90dG9tLCB0b3AsIHN0YXJ0LCByaWdodCwgbGVmdCwgYXV0byB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuaW1wb3J0IGdldFZhcmlhdGlvbiBmcm9tIFwiLi4vdXRpbHMvZ2V0VmFyaWF0aW9uLmpzXCI7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuZnVuY3Rpb24gZ2V0RXhwYW5kZWRGYWxsYmFja1BsYWNlbWVudHMocGxhY2VtZW50KSB7XG4gIGlmIChnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCkgPT09IGF1dG8pIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgb3Bwb3NpdGVQbGFjZW1lbnQgPSBnZXRPcHBvc2l0ZVBsYWNlbWVudChwbGFjZW1lbnQpO1xuICByZXR1cm4gW2dldE9wcG9zaXRlVmFyaWF0aW9uUGxhY2VtZW50KHBsYWNlbWVudCksIG9wcG9zaXRlUGxhY2VtZW50LCBnZXRPcHBvc2l0ZVZhcmlhdGlvblBsYWNlbWVudChvcHBvc2l0ZVBsYWNlbWVudCldO1xufVxuXG5mdW5jdGlvbiBmbGlwKF9yZWYpIHtcbiAgdmFyIHN0YXRlID0gX3JlZi5zdGF0ZSxcbiAgICAgIG9wdGlvbnMgPSBfcmVmLm9wdGlvbnMsXG4gICAgICBuYW1lID0gX3JlZi5uYW1lO1xuXG4gIGlmIChzdGF0ZS5tb2RpZmllcnNEYXRhW25hbWVdLl9za2lwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIF9vcHRpb25zJG1haW5BeGlzID0gb3B0aW9ucy5tYWluQXhpcyxcbiAgICAgIGNoZWNrTWFpbkF4aXMgPSBfb3B0aW9ucyRtYWluQXhpcyA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJG1haW5BeGlzLFxuICAgICAgX29wdGlvbnMkYWx0QXhpcyA9IG9wdGlvbnMuYWx0QXhpcyxcbiAgICAgIGNoZWNrQWx0QXhpcyA9IF9vcHRpb25zJGFsdEF4aXMgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRhbHRBeGlzLFxuICAgICAgc3BlY2lmaWVkRmFsbGJhY2tQbGFjZW1lbnRzID0gb3B0aW9ucy5mYWxsYmFja1BsYWNlbWVudHMsXG4gICAgICBwYWRkaW5nID0gb3B0aW9ucy5wYWRkaW5nLFxuICAgICAgYm91bmRhcnkgPSBvcHRpb25zLmJvdW5kYXJ5LFxuICAgICAgcm9vdEJvdW5kYXJ5ID0gb3B0aW9ucy5yb290Qm91bmRhcnksXG4gICAgICBhbHRCb3VuZGFyeSA9IG9wdGlvbnMuYWx0Qm91bmRhcnksXG4gICAgICBfb3B0aW9ucyRmbGlwVmFyaWF0aW8gPSBvcHRpb25zLmZsaXBWYXJpYXRpb25zLFxuICAgICAgZmxpcFZhcmlhdGlvbnMgPSBfb3B0aW9ucyRmbGlwVmFyaWF0aW8gPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRmbGlwVmFyaWF0aW8sXG4gICAgICBhbGxvd2VkQXV0b1BsYWNlbWVudHMgPSBvcHRpb25zLmFsbG93ZWRBdXRvUGxhY2VtZW50cztcbiAgdmFyIHByZWZlcnJlZFBsYWNlbWVudCA9IHN0YXRlLm9wdGlvbnMucGxhY2VtZW50O1xuICB2YXIgYmFzZVBsYWNlbWVudCA9IGdldEJhc2VQbGFjZW1lbnQocHJlZmVycmVkUGxhY2VtZW50KTtcbiAgdmFyIGlzQmFzZVBsYWNlbWVudCA9IGJhc2VQbGFjZW1lbnQgPT09IHByZWZlcnJlZFBsYWNlbWVudDtcbiAgdmFyIGZhbGxiYWNrUGxhY2VtZW50cyA9IHNwZWNpZmllZEZhbGxiYWNrUGxhY2VtZW50cyB8fCAoaXNCYXNlUGxhY2VtZW50IHx8ICFmbGlwVmFyaWF0aW9ucyA/IFtnZXRPcHBvc2l0ZVBsYWNlbWVudChwcmVmZXJyZWRQbGFjZW1lbnQpXSA6IGdldEV4cGFuZGVkRmFsbGJhY2tQbGFjZW1lbnRzKHByZWZlcnJlZFBsYWNlbWVudCkpO1xuICB2YXIgcGxhY2VtZW50cyA9IFtwcmVmZXJyZWRQbGFjZW1lbnRdLmNvbmNhdChmYWxsYmFja1BsYWNlbWVudHMpLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBwbGFjZW1lbnQpIHtcbiAgICByZXR1cm4gYWNjLmNvbmNhdChnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCkgPT09IGF1dG8gPyBjb21wdXRlQXV0b1BsYWNlbWVudChzdGF0ZSwge1xuICAgICAgcGxhY2VtZW50OiBwbGFjZW1lbnQsXG4gICAgICBib3VuZGFyeTogYm91bmRhcnksXG4gICAgICByb290Qm91bmRhcnk6IHJvb3RCb3VuZGFyeSxcbiAgICAgIHBhZGRpbmc6IHBhZGRpbmcsXG4gICAgICBmbGlwVmFyaWF0aW9uczogZmxpcFZhcmlhdGlvbnMsXG4gICAgICBhbGxvd2VkQXV0b1BsYWNlbWVudHM6IGFsbG93ZWRBdXRvUGxhY2VtZW50c1xuICAgIH0pIDogcGxhY2VtZW50KTtcbiAgfSwgW10pO1xuICB2YXIgcmVmZXJlbmNlUmVjdCA9IHN0YXRlLnJlY3RzLnJlZmVyZW5jZTtcbiAgdmFyIHBvcHBlclJlY3QgPSBzdGF0ZS5yZWN0cy5wb3BwZXI7XG4gIHZhciBjaGVja3NNYXAgPSBuZXcgTWFwKCk7XG4gIHZhciBtYWtlRmFsbGJhY2tDaGVja3MgPSB0cnVlO1xuICB2YXIgZmlyc3RGaXR0aW5nUGxhY2VtZW50ID0gcGxhY2VtZW50c1swXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBsYWNlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGxhY2VtZW50ID0gcGxhY2VtZW50c1tpXTtcblxuICAgIHZhciBfYmFzZVBsYWNlbWVudCA9IGdldEJhc2VQbGFjZW1lbnQocGxhY2VtZW50KTtcblxuICAgIHZhciBpc1N0YXJ0VmFyaWF0aW9uID0gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCkgPT09IHN0YXJ0O1xuICAgIHZhciBpc1ZlcnRpY2FsID0gW3RvcCwgYm90dG9tXS5pbmRleE9mKF9iYXNlUGxhY2VtZW50KSA+PSAwO1xuICAgIHZhciBsZW4gPSBpc1ZlcnRpY2FsID8gJ3dpZHRoJyA6ICdoZWlnaHQnO1xuICAgIHZhciBvdmVyZmxvdyA9IGRldGVjdE92ZXJmbG93KHN0YXRlLCB7XG4gICAgICBwbGFjZW1lbnQ6IHBsYWNlbWVudCxcbiAgICAgIGJvdW5kYXJ5OiBib3VuZGFyeSxcbiAgICAgIHJvb3RCb3VuZGFyeTogcm9vdEJvdW5kYXJ5LFxuICAgICAgYWx0Qm91bmRhcnk6IGFsdEJvdW5kYXJ5LFxuICAgICAgcGFkZGluZzogcGFkZGluZ1xuICAgIH0pO1xuICAgIHZhciBtYWluVmFyaWF0aW9uU2lkZSA9IGlzVmVydGljYWwgPyBpc1N0YXJ0VmFyaWF0aW9uID8gcmlnaHQgOiBsZWZ0IDogaXNTdGFydFZhcmlhdGlvbiA/IGJvdHRvbSA6IHRvcDtcblxuICAgIGlmIChyZWZlcmVuY2VSZWN0W2xlbl0gPiBwb3BwZXJSZWN0W2xlbl0pIHtcbiAgICAgIG1haW5WYXJpYXRpb25TaWRlID0gZ2V0T3Bwb3NpdGVQbGFjZW1lbnQobWFpblZhcmlhdGlvblNpZGUpO1xuICAgIH1cblxuICAgIHZhciBhbHRWYXJpYXRpb25TaWRlID0gZ2V0T3Bwb3NpdGVQbGFjZW1lbnQobWFpblZhcmlhdGlvblNpZGUpO1xuICAgIHZhciBjaGVja3MgPSBbXTtcblxuICAgIGlmIChjaGVja01haW5BeGlzKSB7XG4gICAgICBjaGVja3MucHVzaChvdmVyZmxvd1tfYmFzZVBsYWNlbWVudF0gPD0gMCk7XG4gICAgfVxuXG4gICAgaWYgKGNoZWNrQWx0QXhpcykge1xuICAgICAgY2hlY2tzLnB1c2gob3ZlcmZsb3dbbWFpblZhcmlhdGlvblNpZGVdIDw9IDAsIG92ZXJmbG93W2FsdFZhcmlhdGlvblNpZGVdIDw9IDApO1xuICAgIH1cblxuICAgIGlmIChjaGVja3MuZXZlcnkoZnVuY3Rpb24gKGNoZWNrKSB7XG4gICAgICByZXR1cm4gY2hlY2s7XG4gICAgfSkpIHtcbiAgICAgIGZpcnN0Rml0dGluZ1BsYWNlbWVudCA9IHBsYWNlbWVudDtcbiAgICAgIG1ha2VGYWxsYmFja0NoZWNrcyA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY2hlY2tzTWFwLnNldChwbGFjZW1lbnQsIGNoZWNrcyk7XG4gIH1cblxuICBpZiAobWFrZUZhbGxiYWNrQ2hlY2tzKSB7XG4gICAgLy8gYDJgIG1heSBiZSBkZXNpcmVkIGluIHNvbWUgY2FzZXMgXHUyMDEzIHJlc2VhcmNoIGxhdGVyXG4gICAgdmFyIG51bWJlck9mQ2hlY2tzID0gZmxpcFZhcmlhdGlvbnMgPyAzIDogMTtcblxuICAgIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKF9pKSB7XG4gICAgICB2YXIgZml0dGluZ1BsYWNlbWVudCA9IHBsYWNlbWVudHMuZmluZChmdW5jdGlvbiAocGxhY2VtZW50KSB7XG4gICAgICAgIHZhciBjaGVja3MgPSBjaGVja3NNYXAuZ2V0KHBsYWNlbWVudCk7XG5cbiAgICAgICAgaWYgKGNoZWNrcykge1xuICAgICAgICAgIHJldHVybiBjaGVja3Muc2xpY2UoMCwgX2kpLmV2ZXJ5KGZ1bmN0aW9uIChjaGVjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNoZWNrO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZpdHRpbmdQbGFjZW1lbnQpIHtcbiAgICAgICAgZmlyc3RGaXR0aW5nUGxhY2VtZW50ID0gZml0dGluZ1BsYWNlbWVudDtcbiAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9yICh2YXIgX2kgPSBudW1iZXJPZkNoZWNrczsgX2kgPiAwOyBfaS0tKSB7XG4gICAgICB2YXIgX3JldCA9IF9sb29wKF9pKTtcblxuICAgICAgaWYgKF9yZXQgPT09IFwiYnJlYWtcIikgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKHN0YXRlLnBsYWNlbWVudCAhPT0gZmlyc3RGaXR0aW5nUGxhY2VtZW50KSB7XG4gICAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXS5fc2tpcCA9IHRydWU7XG4gICAgc3RhdGUucGxhY2VtZW50ID0gZmlyc3RGaXR0aW5nUGxhY2VtZW50O1xuICAgIHN0YXRlLnJlc2V0ID0gdHJ1ZTtcbiAgfVxufSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnZmxpcCcsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnbWFpbicsXG4gIGZuOiBmbGlwLFxuICByZXF1aXJlc0lmRXhpc3RzOiBbJ29mZnNldCddLFxuICBkYXRhOiB7XG4gICAgX3NraXA6IGZhbHNlXG4gIH1cbn07IiwgImltcG9ydCB7IHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodCB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuaW1wb3J0IGRldGVjdE92ZXJmbG93IGZyb20gXCIuLi91dGlscy9kZXRlY3RPdmVyZmxvdy5qc1wiO1xuXG5mdW5jdGlvbiBnZXRTaWRlT2Zmc2V0cyhvdmVyZmxvdywgcmVjdCwgcHJldmVudGVkT2Zmc2V0cykge1xuICBpZiAocHJldmVudGVkT2Zmc2V0cyA9PT0gdm9pZCAwKSB7XG4gICAgcHJldmVudGVkT2Zmc2V0cyA9IHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdG9wOiBvdmVyZmxvdy50b3AgLSByZWN0LmhlaWdodCAtIHByZXZlbnRlZE9mZnNldHMueSxcbiAgICByaWdodDogb3ZlcmZsb3cucmlnaHQgLSByZWN0LndpZHRoICsgcHJldmVudGVkT2Zmc2V0cy54LFxuICAgIGJvdHRvbTogb3ZlcmZsb3cuYm90dG9tIC0gcmVjdC5oZWlnaHQgKyBwcmV2ZW50ZWRPZmZzZXRzLnksXG4gICAgbGVmdDogb3ZlcmZsb3cubGVmdCAtIHJlY3Qud2lkdGggLSBwcmV2ZW50ZWRPZmZzZXRzLnhcbiAgfTtcbn1cblxuZnVuY3Rpb24gaXNBbnlTaWRlRnVsbHlDbGlwcGVkKG92ZXJmbG93KSB7XG4gIHJldHVybiBbdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XS5zb21lKGZ1bmN0aW9uIChzaWRlKSB7XG4gICAgcmV0dXJuIG92ZXJmbG93W3NpZGVdID49IDA7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoaWRlKF9yZWYpIHtcbiAgdmFyIHN0YXRlID0gX3JlZi5zdGF0ZSxcbiAgICAgIG5hbWUgPSBfcmVmLm5hbWU7XG4gIHZhciByZWZlcmVuY2VSZWN0ID0gc3RhdGUucmVjdHMucmVmZXJlbmNlO1xuICB2YXIgcG9wcGVyUmVjdCA9IHN0YXRlLnJlY3RzLnBvcHBlcjtcbiAgdmFyIHByZXZlbnRlZE9mZnNldHMgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLnByZXZlbnRPdmVyZmxvdztcbiAgdmFyIHJlZmVyZW5jZU92ZXJmbG93ID0gZGV0ZWN0T3ZlcmZsb3coc3RhdGUsIHtcbiAgICBlbGVtZW50Q29udGV4dDogJ3JlZmVyZW5jZSdcbiAgfSk7XG4gIHZhciBwb3BwZXJBbHRPdmVyZmxvdyA9IGRldGVjdE92ZXJmbG93KHN0YXRlLCB7XG4gICAgYWx0Qm91bmRhcnk6IHRydWVcbiAgfSk7XG4gIHZhciByZWZlcmVuY2VDbGlwcGluZ09mZnNldHMgPSBnZXRTaWRlT2Zmc2V0cyhyZWZlcmVuY2VPdmVyZmxvdywgcmVmZXJlbmNlUmVjdCk7XG4gIHZhciBwb3BwZXJFc2NhcGVPZmZzZXRzID0gZ2V0U2lkZU9mZnNldHMocG9wcGVyQWx0T3ZlcmZsb3csIHBvcHBlclJlY3QsIHByZXZlbnRlZE9mZnNldHMpO1xuICB2YXIgaXNSZWZlcmVuY2VIaWRkZW4gPSBpc0FueVNpZGVGdWxseUNsaXBwZWQocmVmZXJlbmNlQ2xpcHBpbmdPZmZzZXRzKTtcbiAgdmFyIGhhc1BvcHBlckVzY2FwZWQgPSBpc0FueVNpZGVGdWxseUNsaXBwZWQocG9wcGVyRXNjYXBlT2Zmc2V0cyk7XG4gIHN0YXRlLm1vZGlmaWVyc0RhdGFbbmFtZV0gPSB7XG4gICAgcmVmZXJlbmNlQ2xpcHBpbmdPZmZzZXRzOiByZWZlcmVuY2VDbGlwcGluZ09mZnNldHMsXG4gICAgcG9wcGVyRXNjYXBlT2Zmc2V0czogcG9wcGVyRXNjYXBlT2Zmc2V0cyxcbiAgICBpc1JlZmVyZW5jZUhpZGRlbjogaXNSZWZlcmVuY2VIaWRkZW4sXG4gICAgaGFzUG9wcGVyRXNjYXBlZDogaGFzUG9wcGVyRXNjYXBlZFxuICB9O1xuICBzdGF0ZS5hdHRyaWJ1dGVzLnBvcHBlciA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmF0dHJpYnV0ZXMucG9wcGVyLCB7XG4gICAgJ2RhdGEtcG9wcGVyLXJlZmVyZW5jZS1oaWRkZW4nOiBpc1JlZmVyZW5jZUhpZGRlbixcbiAgICAnZGF0YS1wb3BwZXItZXNjYXBlZCc6IGhhc1BvcHBlckVzY2FwZWRcbiAgfSk7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdoaWRlJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICdtYWluJyxcbiAgcmVxdWlyZXNJZkV4aXN0czogWydwcmV2ZW50T3ZlcmZsb3cnXSxcbiAgZm46IGhpZGVcbn07IiwgImltcG9ydCBnZXRCYXNlUGxhY2VtZW50IGZyb20gXCIuLi91dGlscy9nZXRCYXNlUGxhY2VtZW50LmpzXCI7XG5pbXBvcnQgeyB0b3AsIGxlZnQsIHJpZ2h0LCBwbGFjZW1lbnRzIH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlQW5kU2tpZGRpbmdUb1hZKHBsYWNlbWVudCwgcmVjdHMsIG9mZnNldCkge1xuICB2YXIgYmFzZVBsYWNlbWVudCA9IGdldEJhc2VQbGFjZW1lbnQocGxhY2VtZW50KTtcbiAgdmFyIGludmVydERpc3RhbmNlID0gW2xlZnQsIHRvcF0uaW5kZXhPZihiYXNlUGxhY2VtZW50KSA+PSAwID8gLTEgOiAxO1xuXG4gIHZhciBfcmVmID0gdHlwZW9mIG9mZnNldCA9PT0gJ2Z1bmN0aW9uJyA/IG9mZnNldChPYmplY3QuYXNzaWduKHt9LCByZWN0cywge1xuICAgIHBsYWNlbWVudDogcGxhY2VtZW50XG4gIH0pKSA6IG9mZnNldCxcbiAgICAgIHNraWRkaW5nID0gX3JlZlswXSxcbiAgICAgIGRpc3RhbmNlID0gX3JlZlsxXTtcblxuICBza2lkZGluZyA9IHNraWRkaW5nIHx8IDA7XG4gIGRpc3RhbmNlID0gKGRpc3RhbmNlIHx8IDApICogaW52ZXJ0RGlzdGFuY2U7XG4gIHJldHVybiBbbGVmdCwgcmlnaHRdLmluZGV4T2YoYmFzZVBsYWNlbWVudCkgPj0gMCA/IHtcbiAgICB4OiBkaXN0YW5jZSxcbiAgICB5OiBza2lkZGluZ1xuICB9IDoge1xuICAgIHg6IHNraWRkaW5nLFxuICAgIHk6IGRpc3RhbmNlXG4gIH07XG59XG5cbmZ1bmN0aW9uIG9mZnNldChfcmVmMikge1xuICB2YXIgc3RhdGUgPSBfcmVmMi5zdGF0ZSxcbiAgICAgIG9wdGlvbnMgPSBfcmVmMi5vcHRpb25zLFxuICAgICAgbmFtZSA9IF9yZWYyLm5hbWU7XG4gIHZhciBfb3B0aW9ucyRvZmZzZXQgPSBvcHRpb25zLm9mZnNldCxcbiAgICAgIG9mZnNldCA9IF9vcHRpb25zJG9mZnNldCA9PT0gdm9pZCAwID8gWzAsIDBdIDogX29wdGlvbnMkb2Zmc2V0O1xuICB2YXIgZGF0YSA9IHBsYWNlbWVudHMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHBsYWNlbWVudCkge1xuICAgIGFjY1twbGFjZW1lbnRdID0gZGlzdGFuY2VBbmRTa2lkZGluZ1RvWFkocGxhY2VtZW50LCBzdGF0ZS5yZWN0cywgb2Zmc2V0KTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG4gIHZhciBfZGF0YSRzdGF0ZSRwbGFjZW1lbnQgPSBkYXRhW3N0YXRlLnBsYWNlbWVudF0sXG4gICAgICB4ID0gX2RhdGEkc3RhdGUkcGxhY2VtZW50LngsXG4gICAgICB5ID0gX2RhdGEkc3RhdGUkcGxhY2VtZW50Lnk7XG5cbiAgaWYgKHN0YXRlLm1vZGlmaWVyc0RhdGEucG9wcGVyT2Zmc2V0cyAhPSBudWxsKSB7XG4gICAgc3RhdGUubW9kaWZpZXJzRGF0YS5wb3BwZXJPZmZzZXRzLnggKz0geDtcbiAgICBzdGF0ZS5tb2RpZmllcnNEYXRhLnBvcHBlck9mZnNldHMueSArPSB5O1xuICB9XG5cbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IGRhdGE7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdvZmZzZXQnLFxuICBlbmFibGVkOiB0cnVlLFxuICBwaGFzZTogJ21haW4nLFxuICByZXF1aXJlczogWydwb3BwZXJPZmZzZXRzJ10sXG4gIGZuOiBvZmZzZXRcbn07IiwgImltcG9ydCBjb21wdXRlT2Zmc2V0cyBmcm9tIFwiLi4vdXRpbHMvY29tcHV0ZU9mZnNldHMuanNcIjtcblxuZnVuY3Rpb24gcG9wcGVyT2Zmc2V0cyhfcmVmKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYuc3RhdGUsXG4gICAgICBuYW1lID0gX3JlZi5uYW1lO1xuICAvLyBPZmZzZXRzIGFyZSB0aGUgYWN0dWFsIHBvc2l0aW9uIHRoZSBwb3BwZXIgbmVlZHMgdG8gaGF2ZSB0byBiZVxuICAvLyBwcm9wZXJseSBwb3NpdGlvbmVkIG5lYXIgaXRzIHJlZmVyZW5jZSBlbGVtZW50XG4gIC8vIFRoaXMgaXMgdGhlIG1vc3QgYmFzaWMgcGxhY2VtZW50LCBhbmQgd2lsbCBiZSBhZGp1c3RlZCBieVxuICAvLyB0aGUgbW9kaWZpZXJzIGluIHRoZSBuZXh0IHN0ZXBcbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IGNvbXB1dGVPZmZzZXRzKHtcbiAgICByZWZlcmVuY2U6IHN0YXRlLnJlY3RzLnJlZmVyZW5jZSxcbiAgICBlbGVtZW50OiBzdGF0ZS5yZWN0cy5wb3BwZXIsXG4gICAgc3RyYXRlZ3k6ICdhYnNvbHV0ZScsXG4gICAgcGxhY2VtZW50OiBzdGF0ZS5wbGFjZW1lbnRcbiAgfSk7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdwb3BwZXJPZmZzZXRzJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICdyZWFkJyxcbiAgZm46IHBvcHBlck9mZnNldHMsXG4gIGRhdGE6IHt9XG59OyIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRBbHRBeGlzKGF4aXMpIHtcbiAgcmV0dXJuIGF4aXMgPT09ICd4JyA/ICd5JyA6ICd4Jztcbn0iLCAiaW1wb3J0IHsgdG9wLCBsZWZ0LCByaWdodCwgYm90dG9tLCBzdGFydCB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuaW1wb3J0IGdldEJhc2VQbGFjZW1lbnQgZnJvbSBcIi4uL3V0aWxzL2dldEJhc2VQbGFjZW1lbnQuanNcIjtcbmltcG9ydCBnZXRNYWluQXhpc0Zyb21QbGFjZW1lbnQgZnJvbSBcIi4uL3V0aWxzL2dldE1haW5BeGlzRnJvbVBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IGdldEFsdEF4aXMgZnJvbSBcIi4uL3V0aWxzL2dldEFsdEF4aXMuanNcIjtcbmltcG9ydCB7IHdpdGhpbiwgd2l0aGluTWF4Q2xhbXAgfSBmcm9tIFwiLi4vdXRpbHMvd2l0aGluLmpzXCI7XG5pbXBvcnQgZ2V0TGF5b3V0UmVjdCBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldExheW91dFJlY3QuanNcIjtcbmltcG9ydCBnZXRPZmZzZXRQYXJlbnQgZnJvbSBcIi4uL2RvbS11dGlscy9nZXRPZmZzZXRQYXJlbnQuanNcIjtcbmltcG9ydCBkZXRlY3RPdmVyZmxvdyBmcm9tIFwiLi4vdXRpbHMvZGV0ZWN0T3ZlcmZsb3cuanNcIjtcbmltcG9ydCBnZXRWYXJpYXRpb24gZnJvbSBcIi4uL3V0aWxzL2dldFZhcmlhdGlvbi5qc1wiO1xuaW1wb3J0IGdldEZyZXNoU2lkZU9iamVjdCBmcm9tIFwiLi4vdXRpbHMvZ2V0RnJlc2hTaWRlT2JqZWN0LmpzXCI7XG5pbXBvcnQgeyBtaW4gYXMgbWF0aE1pbiwgbWF4IGFzIG1hdGhNYXggfSBmcm9tIFwiLi4vdXRpbHMvbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBwcmV2ZW50T3ZlcmZsb3coX3JlZikge1xuICB2YXIgc3RhdGUgPSBfcmVmLnN0YXRlLFxuICAgICAgb3B0aW9ucyA9IF9yZWYub3B0aW9ucyxcbiAgICAgIG5hbWUgPSBfcmVmLm5hbWU7XG4gIHZhciBfb3B0aW9ucyRtYWluQXhpcyA9IG9wdGlvbnMubWFpbkF4aXMsXG4gICAgICBjaGVja01haW5BeGlzID0gX29wdGlvbnMkbWFpbkF4aXMgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRtYWluQXhpcyxcbiAgICAgIF9vcHRpb25zJGFsdEF4aXMgPSBvcHRpb25zLmFsdEF4aXMsXG4gICAgICBjaGVja0FsdEF4aXMgPSBfb3B0aW9ucyRhbHRBeGlzID09PSB2b2lkIDAgPyBmYWxzZSA6IF9vcHRpb25zJGFsdEF4aXMsXG4gICAgICBib3VuZGFyeSA9IG9wdGlvbnMuYm91bmRhcnksXG4gICAgICByb290Qm91bmRhcnkgPSBvcHRpb25zLnJvb3RCb3VuZGFyeSxcbiAgICAgIGFsdEJvdW5kYXJ5ID0gb3B0aW9ucy5hbHRCb3VuZGFyeSxcbiAgICAgIHBhZGRpbmcgPSBvcHRpb25zLnBhZGRpbmcsXG4gICAgICBfb3B0aW9ucyR0ZXRoZXIgPSBvcHRpb25zLnRldGhlcixcbiAgICAgIHRldGhlciA9IF9vcHRpb25zJHRldGhlciA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJHRldGhlcixcbiAgICAgIF9vcHRpb25zJHRldGhlck9mZnNldCA9IG9wdGlvbnMudGV0aGVyT2Zmc2V0LFxuICAgICAgdGV0aGVyT2Zmc2V0ID0gX29wdGlvbnMkdGV0aGVyT2Zmc2V0ID09PSB2b2lkIDAgPyAwIDogX29wdGlvbnMkdGV0aGVyT2Zmc2V0O1xuICB2YXIgb3ZlcmZsb3cgPSBkZXRlY3RPdmVyZmxvdyhzdGF0ZSwge1xuICAgIGJvdW5kYXJ5OiBib3VuZGFyeSxcbiAgICByb290Qm91bmRhcnk6IHJvb3RCb3VuZGFyeSxcbiAgICBwYWRkaW5nOiBwYWRkaW5nLFxuICAgIGFsdEJvdW5kYXJ5OiBhbHRCb3VuZGFyeVxuICB9KTtcbiAgdmFyIGJhc2VQbGFjZW1lbnQgPSBnZXRCYXNlUGxhY2VtZW50KHN0YXRlLnBsYWNlbWVudCk7XG4gIHZhciB2YXJpYXRpb24gPSBnZXRWYXJpYXRpb24oc3RhdGUucGxhY2VtZW50KTtcbiAgdmFyIGlzQmFzZVBsYWNlbWVudCA9ICF2YXJpYXRpb247XG4gIHZhciBtYWluQXhpcyA9IGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChiYXNlUGxhY2VtZW50KTtcbiAgdmFyIGFsdEF4aXMgPSBnZXRBbHRBeGlzKG1haW5BeGlzKTtcbiAgdmFyIHBvcHBlck9mZnNldHMgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLnBvcHBlck9mZnNldHM7XG4gIHZhciByZWZlcmVuY2VSZWN0ID0gc3RhdGUucmVjdHMucmVmZXJlbmNlO1xuICB2YXIgcG9wcGVyUmVjdCA9IHN0YXRlLnJlY3RzLnBvcHBlcjtcbiAgdmFyIHRldGhlck9mZnNldFZhbHVlID0gdHlwZW9mIHRldGhlck9mZnNldCA9PT0gJ2Z1bmN0aW9uJyA/IHRldGhlck9mZnNldChPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5yZWN0cywge1xuICAgIHBsYWNlbWVudDogc3RhdGUucGxhY2VtZW50XG4gIH0pKSA6IHRldGhlck9mZnNldDtcbiAgdmFyIG5vcm1hbGl6ZWRUZXRoZXJPZmZzZXRWYWx1ZSA9IHR5cGVvZiB0ZXRoZXJPZmZzZXRWYWx1ZSA9PT0gJ251bWJlcicgPyB7XG4gICAgbWFpbkF4aXM6IHRldGhlck9mZnNldFZhbHVlLFxuICAgIGFsdEF4aXM6IHRldGhlck9mZnNldFZhbHVlXG4gIH0gOiBPYmplY3QuYXNzaWduKHtcbiAgICBtYWluQXhpczogMCxcbiAgICBhbHRBeGlzOiAwXG4gIH0sIHRldGhlck9mZnNldFZhbHVlKTtcbiAgdmFyIG9mZnNldE1vZGlmaWVyU3RhdGUgPSBzdGF0ZS5tb2RpZmllcnNEYXRhLm9mZnNldCA/IHN0YXRlLm1vZGlmaWVyc0RhdGEub2Zmc2V0W3N0YXRlLnBsYWNlbWVudF0gOiBudWxsO1xuICB2YXIgZGF0YSA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcblxuICBpZiAoIXBvcHBlck9mZnNldHMpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoY2hlY2tNYWluQXhpcykge1xuICAgIHZhciBfb2Zmc2V0TW9kaWZpZXJTdGF0ZSQ7XG5cbiAgICB2YXIgbWFpblNpZGUgPSBtYWluQXhpcyA9PT0gJ3knID8gdG9wIDogbGVmdDtcbiAgICB2YXIgYWx0U2lkZSA9IG1haW5BeGlzID09PSAneScgPyBib3R0b20gOiByaWdodDtcbiAgICB2YXIgbGVuID0gbWFpbkF4aXMgPT09ICd5JyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcbiAgICB2YXIgb2Zmc2V0ID0gcG9wcGVyT2Zmc2V0c1ttYWluQXhpc107XG4gICAgdmFyIG1pbiA9IG9mZnNldCArIG92ZXJmbG93W21haW5TaWRlXTtcbiAgICB2YXIgbWF4ID0gb2Zmc2V0IC0gb3ZlcmZsb3dbYWx0U2lkZV07XG4gICAgdmFyIGFkZGl0aXZlID0gdGV0aGVyID8gLXBvcHBlclJlY3RbbGVuXSAvIDIgOiAwO1xuICAgIHZhciBtaW5MZW4gPSB2YXJpYXRpb24gPT09IHN0YXJ0ID8gcmVmZXJlbmNlUmVjdFtsZW5dIDogcG9wcGVyUmVjdFtsZW5dO1xuICAgIHZhciBtYXhMZW4gPSB2YXJpYXRpb24gPT09IHN0YXJ0ID8gLXBvcHBlclJlY3RbbGVuXSA6IC1yZWZlcmVuY2VSZWN0W2xlbl07IC8vIFdlIG5lZWQgdG8gaW5jbHVkZSB0aGUgYXJyb3cgaW4gdGhlIGNhbGN1bGF0aW9uIHNvIHRoZSBhcnJvdyBkb2Vzbid0IGdvXG4gICAgLy8gb3V0c2lkZSB0aGUgcmVmZXJlbmNlIGJvdW5kc1xuXG4gICAgdmFyIGFycm93RWxlbWVudCA9IHN0YXRlLmVsZW1lbnRzLmFycm93O1xuICAgIHZhciBhcnJvd1JlY3QgPSB0ZXRoZXIgJiYgYXJyb3dFbGVtZW50ID8gZ2V0TGF5b3V0UmVjdChhcnJvd0VsZW1lbnQpIDoge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIHZhciBhcnJvd1BhZGRpbmdPYmplY3QgPSBzdGF0ZS5tb2RpZmllcnNEYXRhWydhcnJvdyNwZXJzaXN0ZW50J10gPyBzdGF0ZS5tb2RpZmllcnNEYXRhWydhcnJvdyNwZXJzaXN0ZW50J10ucGFkZGluZyA6IGdldEZyZXNoU2lkZU9iamVjdCgpO1xuICAgIHZhciBhcnJvd1BhZGRpbmdNaW4gPSBhcnJvd1BhZGRpbmdPYmplY3RbbWFpblNpZGVdO1xuICAgIHZhciBhcnJvd1BhZGRpbmdNYXggPSBhcnJvd1BhZGRpbmdPYmplY3RbYWx0U2lkZV07IC8vIElmIHRoZSByZWZlcmVuY2UgbGVuZ3RoIGlzIHNtYWxsZXIgdGhhbiB0aGUgYXJyb3cgbGVuZ3RoLCB3ZSBkb24ndCB3YW50XG4gICAgLy8gdG8gaW5jbHVkZSBpdHMgZnVsbCBzaXplIGluIHRoZSBjYWxjdWxhdGlvbi4gSWYgdGhlIHJlZmVyZW5jZSBpcyBzbWFsbFxuICAgIC8vIGFuZCBuZWFyIHRoZSBlZGdlIG9mIGEgYm91bmRhcnksIHRoZSBwb3BwZXIgY2FuIG92ZXJmbG93IGV2ZW4gaWYgdGhlXG4gICAgLy8gcmVmZXJlbmNlIGlzIG5vdCBvdmVyZmxvd2luZyBhcyB3ZWxsIChlLmcuIHZpcnR1YWwgZWxlbWVudHMgd2l0aCBub1xuICAgIC8vIHdpZHRoIG9yIGhlaWdodClcblxuICAgIHZhciBhcnJvd0xlbiA9IHdpdGhpbigwLCByZWZlcmVuY2VSZWN0W2xlbl0sIGFycm93UmVjdFtsZW5dKTtcbiAgICB2YXIgbWluT2Zmc2V0ID0gaXNCYXNlUGxhY2VtZW50ID8gcmVmZXJlbmNlUmVjdFtsZW5dIC8gMiAtIGFkZGl0aXZlIC0gYXJyb3dMZW4gLSBhcnJvd1BhZGRpbmdNaW4gLSBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUubWFpbkF4aXMgOiBtaW5MZW4gLSBhcnJvd0xlbiAtIGFycm93UGFkZGluZ01pbiAtIG5vcm1hbGl6ZWRUZXRoZXJPZmZzZXRWYWx1ZS5tYWluQXhpcztcbiAgICB2YXIgbWF4T2Zmc2V0ID0gaXNCYXNlUGxhY2VtZW50ID8gLXJlZmVyZW5jZVJlY3RbbGVuXSAvIDIgKyBhZGRpdGl2ZSArIGFycm93TGVuICsgYXJyb3dQYWRkaW5nTWF4ICsgbm9ybWFsaXplZFRldGhlck9mZnNldFZhbHVlLm1haW5BeGlzIDogbWF4TGVuICsgYXJyb3dMZW4gKyBhcnJvd1BhZGRpbmdNYXggKyBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUubWFpbkF4aXM7XG4gICAgdmFyIGFycm93T2Zmc2V0UGFyZW50ID0gc3RhdGUuZWxlbWVudHMuYXJyb3cgJiYgZ2V0T2Zmc2V0UGFyZW50KHN0YXRlLmVsZW1lbnRzLmFycm93KTtcbiAgICB2YXIgY2xpZW50T2Zmc2V0ID0gYXJyb3dPZmZzZXRQYXJlbnQgPyBtYWluQXhpcyA9PT0gJ3knID8gYXJyb3dPZmZzZXRQYXJlbnQuY2xpZW50VG9wIHx8IDAgOiBhcnJvd09mZnNldFBhcmVudC5jbGllbnRMZWZ0IHx8IDAgOiAwO1xuICAgIHZhciBvZmZzZXRNb2RpZmllclZhbHVlID0gKF9vZmZzZXRNb2RpZmllclN0YXRlJCA9IG9mZnNldE1vZGlmaWVyU3RhdGUgPT0gbnVsbCA/IHZvaWQgMCA6IG9mZnNldE1vZGlmaWVyU3RhdGVbbWFpbkF4aXNdKSAhPSBudWxsID8gX29mZnNldE1vZGlmaWVyU3RhdGUkIDogMDtcbiAgICB2YXIgdGV0aGVyTWluID0gb2Zmc2V0ICsgbWluT2Zmc2V0IC0gb2Zmc2V0TW9kaWZpZXJWYWx1ZSAtIGNsaWVudE9mZnNldDtcbiAgICB2YXIgdGV0aGVyTWF4ID0gb2Zmc2V0ICsgbWF4T2Zmc2V0IC0gb2Zmc2V0TW9kaWZpZXJWYWx1ZTtcbiAgICB2YXIgcHJldmVudGVkT2Zmc2V0ID0gd2l0aGluKHRldGhlciA/IG1hdGhNaW4obWluLCB0ZXRoZXJNaW4pIDogbWluLCBvZmZzZXQsIHRldGhlciA/IG1hdGhNYXgobWF4LCB0ZXRoZXJNYXgpIDogbWF4KTtcbiAgICBwb3BwZXJPZmZzZXRzW21haW5BeGlzXSA9IHByZXZlbnRlZE9mZnNldDtcbiAgICBkYXRhW21haW5BeGlzXSA9IHByZXZlbnRlZE9mZnNldCAtIG9mZnNldDtcbiAgfVxuXG4gIGlmIChjaGVja0FsdEF4aXMpIHtcbiAgICB2YXIgX29mZnNldE1vZGlmaWVyU3RhdGUkMjtcblxuICAgIHZhciBfbWFpblNpZGUgPSBtYWluQXhpcyA9PT0gJ3gnID8gdG9wIDogbGVmdDtcblxuICAgIHZhciBfYWx0U2lkZSA9IG1haW5BeGlzID09PSAneCcgPyBib3R0b20gOiByaWdodDtcblxuICAgIHZhciBfb2Zmc2V0ID0gcG9wcGVyT2Zmc2V0c1thbHRBeGlzXTtcblxuICAgIHZhciBfbGVuID0gYWx0QXhpcyA9PT0gJ3knID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuXG4gICAgdmFyIF9taW4gPSBfb2Zmc2V0ICsgb3ZlcmZsb3dbX21haW5TaWRlXTtcblxuICAgIHZhciBfbWF4ID0gX29mZnNldCAtIG92ZXJmbG93W19hbHRTaWRlXTtcblxuICAgIHZhciBpc09yaWdpblNpZGUgPSBbdG9wLCBsZWZ0XS5pbmRleE9mKGJhc2VQbGFjZW1lbnQpICE9PSAtMTtcblxuICAgIHZhciBfb2Zmc2V0TW9kaWZpZXJWYWx1ZSA9IChfb2Zmc2V0TW9kaWZpZXJTdGF0ZSQyID0gb2Zmc2V0TW9kaWZpZXJTdGF0ZSA9PSBudWxsID8gdm9pZCAwIDogb2Zmc2V0TW9kaWZpZXJTdGF0ZVthbHRBeGlzXSkgIT0gbnVsbCA/IF9vZmZzZXRNb2RpZmllclN0YXRlJDIgOiAwO1xuXG4gICAgdmFyIF90ZXRoZXJNaW4gPSBpc09yaWdpblNpZGUgPyBfbWluIDogX29mZnNldCAtIHJlZmVyZW5jZVJlY3RbX2xlbl0gLSBwb3BwZXJSZWN0W19sZW5dIC0gX29mZnNldE1vZGlmaWVyVmFsdWUgKyBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUuYWx0QXhpcztcblxuICAgIHZhciBfdGV0aGVyTWF4ID0gaXNPcmlnaW5TaWRlID8gX29mZnNldCArIHJlZmVyZW5jZVJlY3RbX2xlbl0gKyBwb3BwZXJSZWN0W19sZW5dIC0gX29mZnNldE1vZGlmaWVyVmFsdWUgLSBub3JtYWxpemVkVGV0aGVyT2Zmc2V0VmFsdWUuYWx0QXhpcyA6IF9tYXg7XG5cbiAgICB2YXIgX3ByZXZlbnRlZE9mZnNldCA9IHRldGhlciAmJiBpc09yaWdpblNpZGUgPyB3aXRoaW5NYXhDbGFtcChfdGV0aGVyTWluLCBfb2Zmc2V0LCBfdGV0aGVyTWF4KSA6IHdpdGhpbih0ZXRoZXIgPyBfdGV0aGVyTWluIDogX21pbiwgX29mZnNldCwgdGV0aGVyID8gX3RldGhlck1heCA6IF9tYXgpO1xuXG4gICAgcG9wcGVyT2Zmc2V0c1thbHRBeGlzXSA9IF9wcmV2ZW50ZWRPZmZzZXQ7XG4gICAgZGF0YVthbHRBeGlzXSA9IF9wcmV2ZW50ZWRPZmZzZXQgLSBfb2Zmc2V0O1xuICB9XG5cbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IGRhdGE7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdwcmV2ZW50T3ZlcmZsb3cnLFxuICBlbmFibGVkOiB0cnVlLFxuICBwaGFzZTogJ21haW4nLFxuICBmbjogcHJldmVudE92ZXJmbG93LFxuICByZXF1aXJlc0lmRXhpc3RzOiBbJ29mZnNldCddXG59OyIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRIVE1MRWxlbWVudFNjcm9sbChlbGVtZW50KSB7XG4gIHJldHVybiB7XG4gICAgc2Nyb2xsTGVmdDogZWxlbWVudC5zY3JvbGxMZWZ0LFxuICAgIHNjcm9sbFRvcDogZWxlbWVudC5zY3JvbGxUb3BcbiAgfTtcbn0iLCAiaW1wb3J0IGdldFdpbmRvd1Njcm9sbCBmcm9tIFwiLi9nZXRXaW5kb3dTY3JvbGwuanNcIjtcbmltcG9ydCBnZXRXaW5kb3cgZnJvbSBcIi4vZ2V0V2luZG93LmpzXCI7XG5pbXBvcnQgeyBpc0hUTUxFbGVtZW50IH0gZnJvbSBcIi4vaW5zdGFuY2VPZi5qc1wiO1xuaW1wb3J0IGdldEhUTUxFbGVtZW50U2Nyb2xsIGZyb20gXCIuL2dldEhUTUxFbGVtZW50U2Nyb2xsLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXROb2RlU2Nyb2xsKG5vZGUpIHtcbiAgaWYgKG5vZGUgPT09IGdldFdpbmRvdyhub2RlKSB8fCAhaXNIVE1MRWxlbWVudChub2RlKSkge1xuICAgIHJldHVybiBnZXRXaW5kb3dTY3JvbGwobm9kZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGdldEhUTUxFbGVtZW50U2Nyb2xsKG5vZGUpO1xuICB9XG59IiwgImltcG9ydCBnZXRCb3VuZGluZ0NsaWVudFJlY3QgZnJvbSBcIi4vZ2V0Qm91bmRpbmdDbGllbnRSZWN0LmpzXCI7XG5pbXBvcnQgZ2V0Tm9kZVNjcm9sbCBmcm9tIFwiLi9nZXROb2RlU2Nyb2xsLmpzXCI7XG5pbXBvcnQgZ2V0Tm9kZU5hbWUgZnJvbSBcIi4vZ2V0Tm9kZU5hbWUuanNcIjtcbmltcG9ydCB7IGlzSFRNTEVsZW1lbnQgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5pbXBvcnQgZ2V0V2luZG93U2Nyb2xsQmFyWCBmcm9tIFwiLi9nZXRXaW5kb3dTY3JvbGxCYXJYLmpzXCI7XG5pbXBvcnQgZ2V0RG9jdW1lbnRFbGVtZW50IGZyb20gXCIuL2dldERvY3VtZW50RWxlbWVudC5qc1wiO1xuaW1wb3J0IGlzU2Nyb2xsUGFyZW50IGZyb20gXCIuL2lzU2Nyb2xsUGFyZW50LmpzXCI7XG5pbXBvcnQgeyByb3VuZCB9IGZyb20gXCIuLi91dGlscy9tYXRoLmpzXCI7XG5cbmZ1bmN0aW9uIGlzRWxlbWVudFNjYWxlZChlbGVtZW50KSB7XG4gIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHNjYWxlWCA9IHJvdW5kKHJlY3Qud2lkdGgpIC8gZWxlbWVudC5vZmZzZXRXaWR0aCB8fCAxO1xuICB2YXIgc2NhbGVZID0gcm91bmQocmVjdC5oZWlnaHQpIC8gZWxlbWVudC5vZmZzZXRIZWlnaHQgfHwgMTtcbiAgcmV0dXJuIHNjYWxlWCAhPT0gMSB8fCBzY2FsZVkgIT09IDE7XG59IC8vIFJldHVybnMgdGhlIGNvbXBvc2l0ZSByZWN0IG9mIGFuIGVsZW1lbnQgcmVsYXRpdmUgdG8gaXRzIG9mZnNldFBhcmVudC5cbi8vIENvbXBvc2l0ZSBtZWFucyBpdCB0YWtlcyBpbnRvIGFjY291bnQgdHJhbnNmb3JtcyBhcyB3ZWxsIGFzIGxheW91dC5cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRDb21wb3NpdGVSZWN0KGVsZW1lbnRPclZpcnR1YWxFbGVtZW50LCBvZmZzZXRQYXJlbnQsIGlzRml4ZWQpIHtcbiAgaWYgKGlzRml4ZWQgPT09IHZvaWQgMCkge1xuICAgIGlzRml4ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHZhciBpc09mZnNldFBhcmVudEFuRWxlbWVudCA9IGlzSFRNTEVsZW1lbnQob2Zmc2V0UGFyZW50KTtcbiAgdmFyIG9mZnNldFBhcmVudElzU2NhbGVkID0gaXNIVE1MRWxlbWVudChvZmZzZXRQYXJlbnQpICYmIGlzRWxlbWVudFNjYWxlZChvZmZzZXRQYXJlbnQpO1xuICB2YXIgZG9jdW1lbnRFbGVtZW50ID0gZ2V0RG9jdW1lbnRFbGVtZW50KG9mZnNldFBhcmVudCk7XG4gIHZhciByZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsZW1lbnRPclZpcnR1YWxFbGVtZW50LCBvZmZzZXRQYXJlbnRJc1NjYWxlZCwgaXNGaXhlZCk7XG4gIHZhciBzY3JvbGwgPSB7XG4gICAgc2Nyb2xsTGVmdDogMCxcbiAgICBzY3JvbGxUb3A6IDBcbiAgfTtcbiAgdmFyIG9mZnNldHMgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwXG4gIH07XG5cbiAgaWYgKGlzT2Zmc2V0UGFyZW50QW5FbGVtZW50IHx8ICFpc09mZnNldFBhcmVudEFuRWxlbWVudCAmJiAhaXNGaXhlZCkge1xuICAgIGlmIChnZXROb2RlTmFtZShvZmZzZXRQYXJlbnQpICE9PSAnYm9keScgfHwgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BvcHBlcmpzL3BvcHBlci1jb3JlL2lzc3Vlcy8xMDc4XG4gICAgaXNTY3JvbGxQYXJlbnQoZG9jdW1lbnRFbGVtZW50KSkge1xuICAgICAgc2Nyb2xsID0gZ2V0Tm9kZVNjcm9sbChvZmZzZXRQYXJlbnQpO1xuICAgIH1cblxuICAgIGlmIChpc0hUTUxFbGVtZW50KG9mZnNldFBhcmVudCkpIHtcbiAgICAgIG9mZnNldHMgPSBnZXRCb3VuZGluZ0NsaWVudFJlY3Qob2Zmc2V0UGFyZW50LCB0cnVlKTtcbiAgICAgIG9mZnNldHMueCArPSBvZmZzZXRQYXJlbnQuY2xpZW50TGVmdDtcbiAgICAgIG9mZnNldHMueSArPSBvZmZzZXRQYXJlbnQuY2xpZW50VG9wO1xuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICBvZmZzZXRzLnggPSBnZXRXaW5kb3dTY3JvbGxCYXJYKGRvY3VtZW50RWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB4OiByZWN0LmxlZnQgKyBzY3JvbGwuc2Nyb2xsTGVmdCAtIG9mZnNldHMueCxcbiAgICB5OiByZWN0LnRvcCArIHNjcm9sbC5zY3JvbGxUb3AgLSBvZmZzZXRzLnksXG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodFxuICB9O1xufSIsICJpbXBvcnQgeyBtb2RpZmllclBoYXNlcyB9IGZyb20gXCIuLi9lbnVtcy5qc1wiOyAvLyBzb3VyY2U6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ5ODc1MjU1XG5cbmZ1bmN0aW9uIG9yZGVyKG1vZGlmaWVycykge1xuICB2YXIgbWFwID0gbmV3IE1hcCgpO1xuICB2YXIgdmlzaXRlZCA9IG5ldyBTZXQoKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBtb2RpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgICBtYXAuc2V0KG1vZGlmaWVyLm5hbWUsIG1vZGlmaWVyKTtcbiAgfSk7IC8vIE9uIHZpc2l0aW5nIG9iamVjdCwgY2hlY2sgZm9yIGl0cyBkZXBlbmRlbmNpZXMgYW5kIHZpc2l0IHRoZW0gcmVjdXJzaXZlbHlcblxuICBmdW5jdGlvbiBzb3J0KG1vZGlmaWVyKSB7XG4gICAgdmlzaXRlZC5hZGQobW9kaWZpZXIubmFtZSk7XG4gICAgdmFyIHJlcXVpcmVzID0gW10uY29uY2F0KG1vZGlmaWVyLnJlcXVpcmVzIHx8IFtdLCBtb2RpZmllci5yZXF1aXJlc0lmRXhpc3RzIHx8IFtdKTtcbiAgICByZXF1aXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChkZXApIHtcbiAgICAgIGlmICghdmlzaXRlZC5oYXMoZGVwKSkge1xuICAgICAgICB2YXIgZGVwTW9kaWZpZXIgPSBtYXAuZ2V0KGRlcCk7XG5cbiAgICAgICAgaWYgKGRlcE1vZGlmaWVyKSB7XG4gICAgICAgICAgc29ydChkZXBNb2RpZmllcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXN1bHQucHVzaChtb2RpZmllcik7XG4gIH1cblxuICBtb2RpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgICBpZiAoIXZpc2l0ZWQuaGFzKG1vZGlmaWVyLm5hbWUpKSB7XG4gICAgICAvLyBjaGVjayBmb3IgdmlzaXRlZCBvYmplY3RcbiAgICAgIHNvcnQobW9kaWZpZXIpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9yZGVyTW9kaWZpZXJzKG1vZGlmaWVycykge1xuICAvLyBvcmRlciBiYXNlZCBvbiBkZXBlbmRlbmNpZXNcbiAgdmFyIG9yZGVyZWRNb2RpZmllcnMgPSBvcmRlcihtb2RpZmllcnMpOyAvLyBvcmRlciBiYXNlZCBvbiBwaGFzZVxuXG4gIHJldHVybiBtb2RpZmllclBoYXNlcy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGhhc2UpIHtcbiAgICByZXR1cm4gYWNjLmNvbmNhdChvcmRlcmVkTW9kaWZpZXJzLmZpbHRlcihmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgICAgIHJldHVybiBtb2RpZmllci5waGFzZSA9PT0gcGhhc2U7XG4gICAgfSkpO1xuICB9LCBbXSk7XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlYm91bmNlKGZuKSB7XG4gIHZhciBwZW5kaW5nO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmICghcGVuZGluZykge1xuICAgICAgcGVuZGluZyA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHBlbmRpbmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgcmVzb2x2ZShmbigpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGVuZGluZztcbiAgfTtcbn0iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWVyZ2VCeU5hbWUobW9kaWZpZXJzKSB7XG4gIHZhciBtZXJnZWQgPSBtb2RpZmllcnMucmVkdWNlKGZ1bmN0aW9uIChtZXJnZWQsIGN1cnJlbnQpIHtcbiAgICB2YXIgZXhpc3RpbmcgPSBtZXJnZWRbY3VycmVudC5uYW1lXTtcbiAgICBtZXJnZWRbY3VycmVudC5uYW1lXSA9IGV4aXN0aW5nID8gT2JqZWN0LmFzc2lnbih7fSwgZXhpc3RpbmcsIGN1cnJlbnQsIHtcbiAgICAgIG9wdGlvbnM6IE9iamVjdC5hc3NpZ24oe30sIGV4aXN0aW5nLm9wdGlvbnMsIGN1cnJlbnQub3B0aW9ucyksXG4gICAgICBkYXRhOiBPYmplY3QuYXNzaWduKHt9LCBleGlzdGluZy5kYXRhLCBjdXJyZW50LmRhdGEpXG4gICAgfSkgOiBjdXJyZW50O1xuICAgIHJldHVybiBtZXJnZWQ7XG4gIH0sIHt9KTsgLy8gSUUxMSBkb2VzIG5vdCBzdXBwb3J0IE9iamVjdC52YWx1ZXNcblxuICByZXR1cm4gT2JqZWN0LmtleXMobWVyZ2VkKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBtZXJnZWRba2V5XTtcbiAgfSk7XG59IiwgImltcG9ydCBnZXRDb21wb3NpdGVSZWN0IGZyb20gXCIuL2RvbS11dGlscy9nZXRDb21wb3NpdGVSZWN0LmpzXCI7XG5pbXBvcnQgZ2V0TGF5b3V0UmVjdCBmcm9tIFwiLi9kb20tdXRpbHMvZ2V0TGF5b3V0UmVjdC5qc1wiO1xuaW1wb3J0IGxpc3RTY3JvbGxQYXJlbnRzIGZyb20gXCIuL2RvbS11dGlscy9saXN0U2Nyb2xsUGFyZW50cy5qc1wiO1xuaW1wb3J0IGdldE9mZnNldFBhcmVudCBmcm9tIFwiLi9kb20tdXRpbHMvZ2V0T2Zmc2V0UGFyZW50LmpzXCI7XG5pbXBvcnQgb3JkZXJNb2RpZmllcnMgZnJvbSBcIi4vdXRpbHMvb3JkZXJNb2RpZmllcnMuanNcIjtcbmltcG9ydCBkZWJvdW5jZSBmcm9tIFwiLi91dGlscy9kZWJvdW5jZS5qc1wiO1xuaW1wb3J0IG1lcmdlQnlOYW1lIGZyb20gXCIuL3V0aWxzL21lcmdlQnlOYW1lLmpzXCI7XG5pbXBvcnQgZGV0ZWN0T3ZlcmZsb3cgZnJvbSBcIi4vdXRpbHMvZGV0ZWN0T3ZlcmZsb3cuanNcIjtcbmltcG9ydCB7IGlzRWxlbWVudCB9IGZyb20gXCIuL2RvbS11dGlscy9pbnN0YW5jZU9mLmpzXCI7XG52YXIgREVGQVVMVF9PUFRJT05TID0ge1xuICBwbGFjZW1lbnQ6ICdib3R0b20nLFxuICBtb2RpZmllcnM6IFtdLFxuICBzdHJhdGVneTogJ2Fic29sdXRlJ1xufTtcblxuZnVuY3Rpb24gYXJlVmFsaWRFbGVtZW50cygpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiAhYXJncy5zb21lKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuICEoZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvcHBlckdlbmVyYXRvcihnZW5lcmF0b3JPcHRpb25zKSB7XG4gIGlmIChnZW5lcmF0b3JPcHRpb25zID09PSB2b2lkIDApIHtcbiAgICBnZW5lcmF0b3JPcHRpb25zID0ge307XG4gIH1cblxuICB2YXIgX2dlbmVyYXRvck9wdGlvbnMgPSBnZW5lcmF0b3JPcHRpb25zLFxuICAgICAgX2dlbmVyYXRvck9wdGlvbnMkZGVmID0gX2dlbmVyYXRvck9wdGlvbnMuZGVmYXVsdE1vZGlmaWVycyxcbiAgICAgIGRlZmF1bHRNb2RpZmllcnMgPSBfZ2VuZXJhdG9yT3B0aW9ucyRkZWYgPT09IHZvaWQgMCA/IFtdIDogX2dlbmVyYXRvck9wdGlvbnMkZGVmLFxuICAgICAgX2dlbmVyYXRvck9wdGlvbnMkZGVmMiA9IF9nZW5lcmF0b3JPcHRpb25zLmRlZmF1bHRPcHRpb25zLFxuICAgICAgZGVmYXVsdE9wdGlvbnMgPSBfZ2VuZXJhdG9yT3B0aW9ucyRkZWYyID09PSB2b2lkIDAgPyBERUZBVUxUX09QVElPTlMgOiBfZ2VuZXJhdG9yT3B0aW9ucyRkZWYyO1xuICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlUG9wcGVyKHJlZmVyZW5jZSwgcG9wcGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkge1xuICAgICAgb3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuICAgIH1cblxuICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgIHBsYWNlbWVudDogJ2JvdHRvbScsXG4gICAgICBvcmRlcmVkTW9kaWZpZXJzOiBbXSxcbiAgICAgIG9wdGlvbnM6IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgZGVmYXVsdE9wdGlvbnMpLFxuICAgICAgbW9kaWZpZXJzRGF0YToge30sXG4gICAgICBlbGVtZW50czoge1xuICAgICAgICByZWZlcmVuY2U6IHJlZmVyZW5jZSxcbiAgICAgICAgcG9wcGVyOiBwb3BwZXJcbiAgICAgIH0sXG4gICAgICBhdHRyaWJ1dGVzOiB7fSxcbiAgICAgIHN0eWxlczoge31cbiAgICB9O1xuICAgIHZhciBlZmZlY3RDbGVhbnVwRm5zID0gW107XG4gICAgdmFyIGlzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdmFyIGluc3RhbmNlID0ge1xuICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgc2V0T3B0aW9uczogZnVuY3Rpb24gc2V0T3B0aW9ucyhzZXRPcHRpb25zQWN0aW9uKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIHNldE9wdGlvbnNBY3Rpb24gPT09ICdmdW5jdGlvbicgPyBzZXRPcHRpb25zQWN0aW9uKHN0YXRlLm9wdGlvbnMpIDogc2V0T3B0aW9uc0FjdGlvbjtcbiAgICAgICAgY2xlYW51cE1vZGlmaWVyRWZmZWN0cygpO1xuICAgICAgICBzdGF0ZS5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIHN0YXRlLm9wdGlvbnMsIG9wdGlvbnMpO1xuICAgICAgICBzdGF0ZS5zY3JvbGxQYXJlbnRzID0ge1xuICAgICAgICAgIHJlZmVyZW5jZTogaXNFbGVtZW50KHJlZmVyZW5jZSkgPyBsaXN0U2Nyb2xsUGFyZW50cyhyZWZlcmVuY2UpIDogcmVmZXJlbmNlLmNvbnRleHRFbGVtZW50ID8gbGlzdFNjcm9sbFBhcmVudHMocmVmZXJlbmNlLmNvbnRleHRFbGVtZW50KSA6IFtdLFxuICAgICAgICAgIHBvcHBlcjogbGlzdFNjcm9sbFBhcmVudHMocG9wcGVyKVxuICAgICAgICB9OyAvLyBPcmRlcnMgdGhlIG1vZGlmaWVycyBiYXNlZCBvbiB0aGVpciBkZXBlbmRlbmNpZXMgYW5kIGBwaGFzZWBcbiAgICAgICAgLy8gcHJvcGVydGllc1xuXG4gICAgICAgIHZhciBvcmRlcmVkTW9kaWZpZXJzID0gb3JkZXJNb2RpZmllcnMobWVyZ2VCeU5hbWUoW10uY29uY2F0KGRlZmF1bHRNb2RpZmllcnMsIHN0YXRlLm9wdGlvbnMubW9kaWZpZXJzKSkpOyAvLyBTdHJpcCBvdXQgZGlzYWJsZWQgbW9kaWZpZXJzXG5cbiAgICAgICAgc3RhdGUub3JkZXJlZE1vZGlmaWVycyA9IG9yZGVyZWRNb2RpZmllcnMuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgcmV0dXJuIG0uZW5hYmxlZDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJ1bk1vZGlmaWVyRWZmZWN0cygpO1xuICAgICAgICByZXR1cm4gaW5zdGFuY2UudXBkYXRlKCk7XG4gICAgICB9LFxuICAgICAgLy8gU3luYyB1cGRhdGUgXHUyMDEzIGl0IHdpbGwgYWx3YXlzIGJlIGV4ZWN1dGVkLCBldmVuIGlmIG5vdCBuZWNlc3NhcnkuIFRoaXNcbiAgICAgIC8vIGlzIHVzZWZ1bCBmb3IgbG93IGZyZXF1ZW5jeSB1cGRhdGVzIHdoZXJlIHN5bmMgYmVoYXZpb3Igc2ltcGxpZmllcyB0aGVcbiAgICAgIC8vIGxvZ2ljLlxuICAgICAgLy8gRm9yIGhpZ2ggZnJlcXVlbmN5IHVwZGF0ZXMgKGUuZy4gYHJlc2l6ZWAgYW5kIGBzY3JvbGxgIGV2ZW50cyksIGFsd2F5c1xuICAgICAgLy8gcHJlZmVyIHRoZSBhc3luYyBQb3BwZXIjdXBkYXRlIG1ldGhvZFxuICAgICAgZm9yY2VVcGRhdGU6IGZ1bmN0aW9uIGZvcmNlVXBkYXRlKCkge1xuICAgICAgICBpZiAoaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3N0YXRlJGVsZW1lbnRzID0gc3RhdGUuZWxlbWVudHMsXG4gICAgICAgICAgICByZWZlcmVuY2UgPSBfc3RhdGUkZWxlbWVudHMucmVmZXJlbmNlLFxuICAgICAgICAgICAgcG9wcGVyID0gX3N0YXRlJGVsZW1lbnRzLnBvcHBlcjsgLy8gRG9uJ3QgcHJvY2VlZCBpZiBgcmVmZXJlbmNlYCBvciBgcG9wcGVyYCBhcmUgbm90IHZhbGlkIGVsZW1lbnRzXG4gICAgICAgIC8vIGFueW1vcmVcblxuICAgICAgICBpZiAoIWFyZVZhbGlkRWxlbWVudHMocmVmZXJlbmNlLCBwb3BwZXIpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IC8vIFN0b3JlIHRoZSByZWZlcmVuY2UgYW5kIHBvcHBlciByZWN0cyB0byBiZSByZWFkIGJ5IG1vZGlmaWVyc1xuXG5cbiAgICAgICAgc3RhdGUucmVjdHMgPSB7XG4gICAgICAgICAgcmVmZXJlbmNlOiBnZXRDb21wb3NpdGVSZWN0KHJlZmVyZW5jZSwgZ2V0T2Zmc2V0UGFyZW50KHBvcHBlciksIHN0YXRlLm9wdGlvbnMuc3RyYXRlZ3kgPT09ICdmaXhlZCcpLFxuICAgICAgICAgIHBvcHBlcjogZ2V0TGF5b3V0UmVjdChwb3BwZXIpXG4gICAgICAgIH07IC8vIE1vZGlmaWVycyBoYXZlIHRoZSBhYmlsaXR5IHRvIHJlc2V0IHRoZSBjdXJyZW50IHVwZGF0ZSBjeWNsZS4gVGhlXG4gICAgICAgIC8vIG1vc3QgY29tbW9uIHVzZSBjYXNlIGZvciB0aGlzIGlzIHRoZSBgZmxpcGAgbW9kaWZpZXIgY2hhbmdpbmcgdGhlXG4gICAgICAgIC8vIHBsYWNlbWVudCwgd2hpY2ggdGhlbiBuZWVkcyB0byByZS1ydW4gYWxsIHRoZSBtb2RpZmllcnMsIGJlY2F1c2UgdGhlXG4gICAgICAgIC8vIGxvZ2ljIHdhcyBwcmV2aW91c2x5IHJhbiBmb3IgdGhlIHByZXZpb3VzIHBsYWNlbWVudCBhbmQgaXMgdGhlcmVmb3JlXG4gICAgICAgIC8vIHN0YWxlL2luY29ycmVjdFxuXG4gICAgICAgIHN0YXRlLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLnBsYWNlbWVudCA9IHN0YXRlLm9wdGlvbnMucGxhY2VtZW50OyAvLyBPbiBlYWNoIHVwZGF0ZSBjeWNsZSwgdGhlIGBtb2RpZmllcnNEYXRhYCBwcm9wZXJ0eSBmb3IgZWFjaCBtb2RpZmllclxuICAgICAgICAvLyBpcyBmaWxsZWQgd2l0aCB0aGUgaW5pdGlhbCBkYXRhIHNwZWNpZmllZCBieSB0aGUgbW9kaWZpZXIuIFRoaXMgbWVhbnNcbiAgICAgICAgLy8gaXQgZG9lc24ndCBwZXJzaXN0IGFuZCBpcyBmcmVzaCBvbiBlYWNoIHVwZGF0ZS5cbiAgICAgICAgLy8gVG8gZW5zdXJlIHBlcnNpc3RlbnQgZGF0YSwgdXNlIGAke25hbWV9I3BlcnNpc3RlbnRgXG5cbiAgICAgICAgc3RhdGUub3JkZXJlZE1vZGlmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgICAgICAgIHJldHVybiBzdGF0ZS5tb2RpZmllcnNEYXRhW21vZGlmaWVyLm5hbWVdID0gT2JqZWN0LmFzc2lnbih7fSwgbW9kaWZpZXIuZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBzdGF0ZS5vcmRlcmVkTW9kaWZpZXJzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgIGlmIChzdGF0ZS5yZXNldCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc3RhdGUucmVzZXQgPSBmYWxzZTtcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgX3N0YXRlJG9yZGVyZWRNb2RpZmllID0gc3RhdGUub3JkZXJlZE1vZGlmaWVyc1tpbmRleF0sXG4gICAgICAgICAgICAgIGZuID0gX3N0YXRlJG9yZGVyZWRNb2RpZmllLmZuLFxuICAgICAgICAgICAgICBfc3RhdGUkb3JkZXJlZE1vZGlmaWUyID0gX3N0YXRlJG9yZGVyZWRNb2RpZmllLm9wdGlvbnMsXG4gICAgICAgICAgICAgIF9vcHRpb25zID0gX3N0YXRlJG9yZGVyZWRNb2RpZmllMiA9PT0gdm9pZCAwID8ge30gOiBfc3RhdGUkb3JkZXJlZE1vZGlmaWUyLFxuICAgICAgICAgICAgICBuYW1lID0gX3N0YXRlJG9yZGVyZWRNb2RpZmllLm5hbWU7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBzdGF0ZSA9IGZuKHtcbiAgICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgICBvcHRpb25zOiBfb3B0aW9ucyxcbiAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgaW5zdGFuY2U6IGluc3RhbmNlXG4gICAgICAgICAgICB9KSB8fCBzdGF0ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBBc3luYyBhbmQgb3B0aW1pc3RpY2FsbHkgb3B0aW1pemVkIHVwZGF0ZSBcdTIwMTMgaXQgd2lsbCBub3QgYmUgZXhlY3V0ZWQgaWZcbiAgICAgIC8vIG5vdCBuZWNlc3NhcnkgKGRlYm91bmNlZCB0byBydW4gYXQgbW9zdCBvbmNlLXBlci10aWNrKVxuICAgICAgdXBkYXRlOiBkZWJvdW5jZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgIGluc3RhbmNlLmZvcmNlVXBkYXRlKCk7XG4gICAgICAgICAgcmVzb2x2ZShzdGF0ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSksXG4gICAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICBjbGVhbnVwTW9kaWZpZXJFZmZlY3RzKCk7XG4gICAgICAgIGlzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFhcmVWYWxpZEVsZW1lbnRzKHJlZmVyZW5jZSwgcG9wcGVyKSkge1xuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cblxuICAgIGluc3RhbmNlLnNldE9wdGlvbnMob3B0aW9ucykudGhlbihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgIGlmICghaXNEZXN0cm95ZWQgJiYgb3B0aW9ucy5vbkZpcnN0VXBkYXRlKSB7XG4gICAgICAgIG9wdGlvbnMub25GaXJzdFVwZGF0ZShzdGF0ZSk7XG4gICAgICB9XG4gICAgfSk7IC8vIE1vZGlmaWVycyBoYXZlIHRoZSBhYmlsaXR5IHRvIGV4ZWN1dGUgYXJiaXRyYXJ5IGNvZGUgYmVmb3JlIHRoZSBmaXJzdFxuICAgIC8vIHVwZGF0ZSBjeWNsZSBydW5zLiBUaGV5IHdpbGwgYmUgZXhlY3V0ZWQgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhlIHVwZGF0ZVxuICAgIC8vIGN5Y2xlLiBUaGlzIGlzIHVzZWZ1bCB3aGVuIGEgbW9kaWZpZXIgYWRkcyBzb21lIHBlcnNpc3RlbnQgZGF0YSB0aGF0XG4gICAgLy8gb3RoZXIgbW9kaWZpZXJzIG5lZWQgdG8gdXNlLCBidXQgdGhlIG1vZGlmaWVyIGlzIHJ1biBhZnRlciB0aGUgZGVwZW5kZW50XG4gICAgLy8gb25lLlxuXG4gICAgZnVuY3Rpb24gcnVuTW9kaWZpZXJFZmZlY3RzKCkge1xuICAgICAgc3RhdGUub3JkZXJlZE1vZGlmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgIHZhciBuYW1lID0gX3JlZi5uYW1lLFxuICAgICAgICAgICAgX3JlZiRvcHRpb25zID0gX3JlZi5vcHRpb25zLFxuICAgICAgICAgICAgb3B0aW9ucyA9IF9yZWYkb3B0aW9ucyA9PT0gdm9pZCAwID8ge30gOiBfcmVmJG9wdGlvbnMsXG4gICAgICAgICAgICBlZmZlY3QgPSBfcmVmLmVmZmVjdDtcblxuICAgICAgICBpZiAodHlwZW9mIGVmZmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHZhciBjbGVhbnVwRm4gPSBlZmZlY3Qoe1xuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZSxcbiAgICAgICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhciBub29wRm4gPSBmdW5jdGlvbiBub29wRm4oKSB7fTtcblxuICAgICAgICAgIGVmZmVjdENsZWFudXBGbnMucHVzaChjbGVhbnVwRm4gfHwgbm9vcEZuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xlYW51cE1vZGlmaWVyRWZmZWN0cygpIHtcbiAgICAgIGVmZmVjdENsZWFudXBGbnMuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZuKCk7XG4gICAgICB9KTtcbiAgICAgIGVmZmVjdENsZWFudXBGbnMgPSBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG59XG5leHBvcnQgdmFyIGNyZWF0ZVBvcHBlciA9IC8qI19fUFVSRV9fKi9wb3BwZXJHZW5lcmF0b3IoKTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5leHBvcnQgeyBkZXRlY3RPdmVyZmxvdyB9OyIsICJpbXBvcnQgeyBwb3BwZXJHZW5lcmF0b3IsIGRldGVjdE92ZXJmbG93IH0gZnJvbSBcIi4vY3JlYXRlUG9wcGVyLmpzXCI7XG5pbXBvcnQgZXZlbnRMaXN0ZW5lcnMgZnJvbSBcIi4vbW9kaWZpZXJzL2V2ZW50TGlzdGVuZXJzLmpzXCI7XG5pbXBvcnQgcG9wcGVyT2Zmc2V0cyBmcm9tIFwiLi9tb2RpZmllcnMvcG9wcGVyT2Zmc2V0cy5qc1wiO1xuaW1wb3J0IGNvbXB1dGVTdHlsZXMgZnJvbSBcIi4vbW9kaWZpZXJzL2NvbXB1dGVTdHlsZXMuanNcIjtcbmltcG9ydCBhcHBseVN0eWxlcyBmcm9tIFwiLi9tb2RpZmllcnMvYXBwbHlTdHlsZXMuanNcIjtcbnZhciBkZWZhdWx0TW9kaWZpZXJzID0gW2V2ZW50TGlzdGVuZXJzLCBwb3BwZXJPZmZzZXRzLCBjb21wdXRlU3R5bGVzLCBhcHBseVN0eWxlc107XG52YXIgY3JlYXRlUG9wcGVyID0gLyojX19QVVJFX18qL3BvcHBlckdlbmVyYXRvcih7XG4gIGRlZmF1bHRNb2RpZmllcnM6IGRlZmF1bHRNb2RpZmllcnNcbn0pOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cbmV4cG9ydCB7IGNyZWF0ZVBvcHBlciwgcG9wcGVyR2VuZXJhdG9yLCBkZWZhdWx0TW9kaWZpZXJzLCBkZXRlY3RPdmVyZmxvdyB9OyIsICJpbXBvcnQgeyBwb3BwZXJHZW5lcmF0b3IsIGRldGVjdE92ZXJmbG93IH0gZnJvbSBcIi4vY3JlYXRlUG9wcGVyLmpzXCI7XG5pbXBvcnQgZXZlbnRMaXN0ZW5lcnMgZnJvbSBcIi4vbW9kaWZpZXJzL2V2ZW50TGlzdGVuZXJzLmpzXCI7XG5pbXBvcnQgcG9wcGVyT2Zmc2V0cyBmcm9tIFwiLi9tb2RpZmllcnMvcG9wcGVyT2Zmc2V0cy5qc1wiO1xuaW1wb3J0IGNvbXB1dGVTdHlsZXMgZnJvbSBcIi4vbW9kaWZpZXJzL2NvbXB1dGVTdHlsZXMuanNcIjtcbmltcG9ydCBhcHBseVN0eWxlcyBmcm9tIFwiLi9tb2RpZmllcnMvYXBwbHlTdHlsZXMuanNcIjtcbmltcG9ydCBvZmZzZXQgZnJvbSBcIi4vbW9kaWZpZXJzL29mZnNldC5qc1wiO1xuaW1wb3J0IGZsaXAgZnJvbSBcIi4vbW9kaWZpZXJzL2ZsaXAuanNcIjtcbmltcG9ydCBwcmV2ZW50T3ZlcmZsb3cgZnJvbSBcIi4vbW9kaWZpZXJzL3ByZXZlbnRPdmVyZmxvdy5qc1wiO1xuaW1wb3J0IGFycm93IGZyb20gXCIuL21vZGlmaWVycy9hcnJvdy5qc1wiO1xuaW1wb3J0IGhpZGUgZnJvbSBcIi4vbW9kaWZpZXJzL2hpZGUuanNcIjtcbnZhciBkZWZhdWx0TW9kaWZpZXJzID0gW2V2ZW50TGlzdGVuZXJzLCBwb3BwZXJPZmZzZXRzLCBjb21wdXRlU3R5bGVzLCBhcHBseVN0eWxlcywgb2Zmc2V0LCBmbGlwLCBwcmV2ZW50T3ZlcmZsb3csIGFycm93LCBoaWRlXTtcbnZhciBjcmVhdGVQb3BwZXIgPSAvKiNfX1BVUkVfXyovcG9wcGVyR2VuZXJhdG9yKHtcbiAgZGVmYXVsdE1vZGlmaWVyczogZGVmYXVsdE1vZGlmaWVyc1xufSk7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuZXhwb3J0IHsgY3JlYXRlUG9wcGVyLCBwb3BwZXJHZW5lcmF0b3IsIGRlZmF1bHRNb2RpZmllcnMsIGRldGVjdE92ZXJmbG93IH07IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuZXhwb3J0IHsgY3JlYXRlUG9wcGVyIGFzIGNyZWF0ZVBvcHBlckxpdGUgfSBmcm9tIFwiLi9wb3BwZXItbGl0ZS5qc1wiOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cbmV4cG9ydCAqIGZyb20gXCIuL21vZGlmaWVycy9pbmRleC5qc1wiOyIsICIvKipcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBCb290c3RyYXAgZG9tL2RhdGEuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IGVsZW1lbnRNYXAgPSBuZXcgTWFwKClcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzZXQoZWxlbWVudCwga2V5LCBpbnN0YW5jZSkge1xuICAgIGlmICghZWxlbWVudE1hcC5oYXMoZWxlbWVudCkpIHtcbiAgICAgIGVsZW1lbnRNYXAuc2V0KGVsZW1lbnQsIG5ldyBNYXAoKSlcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YW5jZU1hcCA9IGVsZW1lbnRNYXAuZ2V0KGVsZW1lbnQpXG5cbiAgICAvLyBtYWtlIGl0IGNsZWFyIHdlIG9ubHkgd2FudCBvbmUgaW5zdGFuY2UgcGVyIGVsZW1lbnRcbiAgICAvLyBjYW4gYmUgcmVtb3ZlZCBsYXRlciB3aGVuIG11bHRpcGxlIGtleS9pbnN0YW5jZXMgYXJlIGZpbmUgdG8gYmUgdXNlZFxuICAgIGlmICghaW5zdGFuY2VNYXAuaGFzKGtleSkgJiYgaW5zdGFuY2VNYXAuc2l6ZSAhPT0gMCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEJvb3RzdHJhcCBkb2Vzbid0IGFsbG93IG1vcmUgdGhhbiBvbmUgaW5zdGFuY2UgcGVyIGVsZW1lbnQuIEJvdW5kIGluc3RhbmNlOiAke0FycmF5LmZyb20oaW5zdGFuY2VNYXAua2V5cygpKVswXX0uYClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGluc3RhbmNlTWFwLnNldChrZXksIGluc3RhbmNlKVxuICB9LFxuXG4gIGdldChlbGVtZW50LCBrZXkpIHtcbiAgICBpZiAoZWxlbWVudE1hcC5oYXMoZWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBlbGVtZW50TWFwLmdldChlbGVtZW50KS5nZXQoa2V5KSB8fCBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfSxcblxuICByZW1vdmUoZWxlbWVudCwga2V5KSB7XG4gICAgaWYgKCFlbGVtZW50TWFwLmhhcyhlbGVtZW50KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaW5zdGFuY2VNYXAgPSBlbGVtZW50TWFwLmdldChlbGVtZW50KVxuXG4gICAgaW5zdGFuY2VNYXAuZGVsZXRlKGtleSlcblxuICAgIC8vIGZyZWUgdXAgZWxlbWVudCByZWZlcmVuY2VzIGlmIHRoZXJlIGFyZSBubyBpbnN0YW5jZXMgbGVmdCBmb3IgYW4gZWxlbWVudFxuICAgIGlmIChpbnN0YW5jZU1hcC5zaXplID09PSAwKSB7XG4gICAgICBlbGVtZW50TWFwLmRlbGV0ZShlbGVtZW50KVxuICAgIH1cbiAgfVxufVxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCB1dGlsL2luZGV4LmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuY29uc3QgTUFYX1VJRCA9IDFfMDAwXzAwMFxuY29uc3QgTUlMTElTRUNPTkRTX01VTFRJUExJRVIgPSAxMDAwXG5jb25zdCBUUkFOU0lUSU9OX0VORCA9ICd0cmFuc2l0aW9uZW5kJ1xuXG4vKipcbiAqIFByb3Blcmx5IGVzY2FwZSBJRHMgc2VsZWN0b3JzIHRvIGhhbmRsZSB3ZWlyZCBJRHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvclxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgcGFyc2VTZWxlY3RvciA9IHNlbGVjdG9yID0+IHtcbiAgaWYgKHNlbGVjdG9yICYmIHdpbmRvdy5DU1MgJiYgd2luZG93LkNTUy5lc2NhcGUpIHtcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yIG5lZWRzIGVzY2FwaW5nIHRvIGhhbmRsZSBJRHMgKGh0bWw1KykgY29udGFpbmluZyBmb3IgaW5zdGFuY2UgL1xuICAgIHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvIyhbXlxcc1wiIyddKykvZywgKG1hdGNoLCBpZCkgPT4gYCMke0NTUy5lc2NhcGUoaWQpfWApXG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3Jcbn1cblxuLy8gU2hvdXQtb3V0IEFuZ3VzIENyb2xsIChodHRwczovL2dvby5nbC9weHdRR3ApXG5jb25zdCB0b1R5cGUgPSBvYmplY3QgPT4ge1xuICBpZiAob2JqZWN0ID09PSBudWxsIHx8IG9iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGAke29iamVjdH1gXG4gIH1cblxuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkubWF0Y2goL1xccyhbYS16XSspL2kpWzFdLnRvTG93ZXJDYXNlKClcbn1cblxuLyoqXG4gKiBQdWJsaWMgVXRpbCBBUElcbiAqL1xuXG5jb25zdCBnZXRVSUQgPSBwcmVmaXggPT4ge1xuICBkbyB7XG4gICAgcHJlZml4ICs9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1BWF9VSUQpXG4gIH0gd2hpbGUgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWZpeCkpXG5cbiAgcmV0dXJuIHByZWZpeFxufVxuXG5jb25zdCBnZXRUcmFuc2l0aW9uRHVyYXRpb25Gcm9tRWxlbWVudCA9IGVsZW1lbnQgPT4ge1xuICBpZiAoIWVsZW1lbnQpIHtcbiAgICByZXR1cm4gMFxuICB9XG5cbiAgLy8gR2V0IHRyYW5zaXRpb24tZHVyYXRpb24gb2YgdGhlIGVsZW1lbnRcbiAgbGV0IHsgdHJhbnNpdGlvbkR1cmF0aW9uLCB0cmFuc2l0aW9uRGVsYXkgfSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpXG5cbiAgY29uc3QgZmxvYXRUcmFuc2l0aW9uRHVyYXRpb24gPSBOdW1iZXIucGFyc2VGbG9hdCh0cmFuc2l0aW9uRHVyYXRpb24pXG4gIGNvbnN0IGZsb2F0VHJhbnNpdGlvbkRlbGF5ID0gTnVtYmVyLnBhcnNlRmxvYXQodHJhbnNpdGlvbkRlbGF5KVxuXG4gIC8vIFJldHVybiAwIGlmIGVsZW1lbnQgb3IgdHJhbnNpdGlvbiBkdXJhdGlvbiBpcyBub3QgZm91bmRcbiAgaWYgKCFmbG9hdFRyYW5zaXRpb25EdXJhdGlvbiAmJiAhZmxvYXRUcmFuc2l0aW9uRGVsYXkpIHtcbiAgICByZXR1cm4gMFxuICB9XG5cbiAgLy8gSWYgbXVsdGlwbGUgZHVyYXRpb25zIGFyZSBkZWZpbmVkLCB0YWtlIHRoZSBmaXJzdFxuICB0cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24uc3BsaXQoJywnKVswXVxuICB0cmFuc2l0aW9uRGVsYXkgPSB0cmFuc2l0aW9uRGVsYXkuc3BsaXQoJywnKVswXVxuXG4gIHJldHVybiAoTnVtYmVyLnBhcnNlRmxvYXQodHJhbnNpdGlvbkR1cmF0aW9uKSArIE51bWJlci5wYXJzZUZsb2F0KHRyYW5zaXRpb25EZWxheSkpICogTUlMTElTRUNPTkRTX01VTFRJUExJRVJcbn1cblxuY29uc3QgdHJpZ2dlclRyYW5zaXRpb25FbmQgPSBlbGVtZW50ID0+IHtcbiAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChUUkFOU0lUSU9OX0VORCkpXG59XG5cbmNvbnN0IGlzRWxlbWVudCA9IG9iamVjdCA9PiB7XG4gIGlmICghb2JqZWN0IHx8IHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAodHlwZW9mIG9iamVjdC5qcXVlcnkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgb2JqZWN0ID0gb2JqZWN0WzBdXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIG9iamVjdC5ub2RlVHlwZSAhPT0gJ3VuZGVmaW5lZCdcbn1cblxuY29uc3QgZ2V0RWxlbWVudCA9IG9iamVjdCA9PiB7XG4gIC8vIGl0J3MgYSBqUXVlcnkgb2JqZWN0IG9yIGEgbm9kZSBlbGVtZW50XG4gIGlmIChpc0VsZW1lbnQob2JqZWN0KSkge1xuICAgIHJldHVybiBvYmplY3QuanF1ZXJ5ID8gb2JqZWN0WzBdIDogb2JqZWN0XG4gIH1cblxuICBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ3N0cmluZycgJiYgb2JqZWN0Lmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihwYXJzZVNlbGVjdG9yKG9iamVjdCkpXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBpc1Zpc2libGUgPSBlbGVtZW50ID0+IHtcbiAgaWYgKCFpc0VsZW1lbnQoZWxlbWVudCkgfHwgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY29uc3QgZWxlbWVudElzVmlzaWJsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZSgndmlzaWJpbGl0eScpID09PSAndmlzaWJsZSdcbiAgLy8gSGFuZGxlIGBkZXRhaWxzYCBlbGVtZW50IGFzIGl0cyBjb250ZW50IG1heSBmYWxzaWUgYXBwZWFyIHZpc2libGUgd2hlbiBpdCBpcyBjbG9zZWRcbiAgY29uc3QgY2xvc2VkRGV0YWlscyA9IGVsZW1lbnQuY2xvc2VzdCgnZGV0YWlsczpub3QoW29wZW5dKScpXG5cbiAgaWYgKCFjbG9zZWREZXRhaWxzKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRJc1Zpc2libGVcbiAgfVxuXG4gIGlmIChjbG9zZWREZXRhaWxzICE9PSBlbGVtZW50KSB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IGVsZW1lbnQuY2xvc2VzdCgnc3VtbWFyeScpXG4gICAgaWYgKHN1bW1hcnkgJiYgc3VtbWFyeS5wYXJlbnROb2RlICE9PSBjbG9zZWREZXRhaWxzKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoc3VtbWFyeSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRJc1Zpc2libGVcbn1cblxuY29uc3QgaXNEaXNhYmxlZCA9IGVsZW1lbnQgPT4ge1xuICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC5ub2RlVHlwZSAhPT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNhYmxlZCcpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmICh0eXBlb2YgZWxlbWVudC5kaXNhYmxlZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZWxlbWVudC5kaXNhYmxlZFxuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpICYmIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpICE9PSAnZmFsc2UnXG59XG5cbmNvbnN0IGZpbmRTaGFkb3dSb290ID0gZWxlbWVudCA9PiB7XG4gIGlmICghZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmF0dGFjaFNoYWRvdykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBDYW4gZmluZCB0aGUgc2hhZG93IHJvb3Qgb3RoZXJ3aXNlIGl0J2xsIHJldHVybiB0aGUgZG9jdW1lbnRcbiAgaWYgKHR5cGVvZiBlbGVtZW50LmdldFJvb3ROb2RlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3Qgcm9vdCA9IGVsZW1lbnQuZ2V0Um9vdE5vZGUoKVxuICAgIHJldHVybiByb290IGluc3RhbmNlb2YgU2hhZG93Um9vdCA/IHJvb3QgOiBudWxsXG4gIH1cblxuICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIFNoYWRvd1Jvb3QpIHtcbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgLy8gd2hlbiB3ZSBkb24ndCBmaW5kIGEgc2hhZG93IHJvb3RcbiAgaWYgKCFlbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIGZpbmRTaGFkb3dSb290KGVsZW1lbnQucGFyZW50Tm9kZSlcbn1cblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9XG5cbi8qKlxuICogVHJpY2sgdG8gcmVzdGFydCBhbiBlbGVtZW50J3MgYW5pbWF0aW9uXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB2b2lkXG4gKlxuICogQHNlZSBodHRwczovL3d3dy5jaGFyaXN0aGVvLmlvL2Jsb2cvMjAyMS8wMi9yZXN0YXJ0LWEtY3NzLWFuaW1hdGlvbi13aXRoLWphdmFzY3JpcHQvI3Jlc3RhcnRpbmctYS1jc3MtYW5pbWF0aW9uXG4gKi9cbmNvbnN0IHJlZmxvdyA9IGVsZW1lbnQgPT4ge1xuICBlbGVtZW50Lm9mZnNldEhlaWdodCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC1leHByZXNzaW9uc1xufVxuXG5jb25zdCBnZXRqUXVlcnkgPSAoKSA9PiB7XG4gIGlmICh3aW5kb3cualF1ZXJ5ICYmICFkb2N1bWVudC5ib2R5Lmhhc0F0dHJpYnV0ZSgnZGF0YS1icy1uby1qcXVlcnknKSkge1xuICAgIHJldHVybiB3aW5kb3cualF1ZXJ5XG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBET01Db250ZW50TG9hZGVkQ2FsbGJhY2tzID0gW11cblxuY29uc3Qgb25ET01Db250ZW50TG9hZGVkID0gY2FsbGJhY2sgPT4ge1xuICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgLy8gYWRkIGxpc3RlbmVyIG9uIHRoZSBmaXJzdCBjYWxsIHdoZW4gdGhlIGRvY3VtZW50IGlzIGluIGxvYWRpbmcgc3RhdGVcbiAgICBpZiAoIURPTUNvbnRlbnRMb2FkZWRDYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIERPTUNvbnRlbnRMb2FkZWRDYWxsYmFja3MpIHtcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgRE9NQ29udGVudExvYWRlZENhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG5jb25zdCBpc1JUTCA9ICgpID0+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kaXIgPT09ICdydGwnXG5cbmNvbnN0IGRlZmluZUpRdWVyeVBsdWdpbiA9IHBsdWdpbiA9PiB7XG4gIG9uRE9NQ29udGVudExvYWRlZCgoKSA9PiB7XG4gICAgY29uc3QgJCA9IGdldGpRdWVyeSgpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCQpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBwbHVnaW4uTkFNRVxuICAgICAgY29uc3QgSlFVRVJZX05PX0NPTkZMSUNUID0gJC5mbltuYW1lXVxuICAgICAgJC5mbltuYW1lXSA9IHBsdWdpbi5qUXVlcnlJbnRlcmZhY2VcbiAgICAgICQuZm5bbmFtZV0uQ29uc3RydWN0b3IgPSBwbHVnaW5cbiAgICAgICQuZm5bbmFtZV0ubm9Db25mbGljdCA9ICgpID0+IHtcbiAgICAgICAgJC5mbltuYW1lXSA9IEpRVUVSWV9OT19DT05GTElDVFxuICAgICAgICByZXR1cm4gcGx1Z2luLmpRdWVyeUludGVyZmFjZVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuY29uc3QgZXhlY3V0ZSA9IChwb3NzaWJsZUNhbGxiYWNrLCBhcmdzID0gW10sIGRlZmF1bHRWYWx1ZSA9IHBvc3NpYmxlQ2FsbGJhY2spID0+IHtcbiAgcmV0dXJuIHR5cGVvZiBwb3NzaWJsZUNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gcG9zc2libGVDYWxsYmFjayguLi5hcmdzKSA6IGRlZmF1bHRWYWx1ZVxufVxuXG5jb25zdCBleGVjdXRlQWZ0ZXJUcmFuc2l0aW9uID0gKGNhbGxiYWNrLCB0cmFuc2l0aW9uRWxlbWVudCwgd2FpdEZvclRyYW5zaXRpb24gPSB0cnVlKSA9PiB7XG4gIGlmICghd2FpdEZvclRyYW5zaXRpb24pIHtcbiAgICBleGVjdXRlKGNhbGxiYWNrKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgZHVyYXRpb25QYWRkaW5nID0gNVxuICBjb25zdCBlbXVsYXRlZER1cmF0aW9uID0gZ2V0VHJhbnNpdGlvbkR1cmF0aW9uRnJvbUVsZW1lbnQodHJhbnNpdGlvbkVsZW1lbnQpICsgZHVyYXRpb25QYWRkaW5nXG5cbiAgbGV0IGNhbGxlZCA9IGZhbHNlXG5cbiAgY29uc3QgaGFuZGxlciA9ICh7IHRhcmdldCB9KSA9PiB7XG4gICAgaWYgKHRhcmdldCAhPT0gdHJhbnNpdGlvbkVsZW1lbnQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNhbGxlZCA9IHRydWVcbiAgICB0cmFuc2l0aW9uRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFRSQU5TSVRJT05fRU5ELCBoYW5kbGVyKVxuICAgIGV4ZWN1dGUoY2FsbGJhY2spXG4gIH1cblxuICB0cmFuc2l0aW9uRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFRSQU5TSVRJT05fRU5ELCBoYW5kbGVyKVxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgdHJpZ2dlclRyYW5zaXRpb25FbmQodHJhbnNpdGlvbkVsZW1lbnQpXG4gICAgfVxuICB9LCBlbXVsYXRlZER1cmF0aW9uKVxufVxuXG4vKipcbiAqIFJldHVybiB0aGUgcHJldmlvdXMvbmV4dCBlbGVtZW50IG9mIGEgbGlzdC5cbiAqXG4gKiBAcGFyYW0ge2FycmF5fSBsaXN0ICAgIFRoZSBsaXN0IG9mIGVsZW1lbnRzXG4gKiBAcGFyYW0gYWN0aXZlRWxlbWVudCAgIFRoZSBhY3RpdmUgZWxlbWVudFxuICogQHBhcmFtIHNob3VsZEdldE5leHQgICBDaG9vc2UgdG8gZ2V0IG5leHQgb3IgcHJldmlvdXMgZWxlbWVudFxuICogQHBhcmFtIGlzQ3ljbGVBbGxvd2VkXG4gKiBAcmV0dXJuIHtFbGVtZW50fGVsZW19IFRoZSBwcm9wZXIgZWxlbWVudFxuICovXG5jb25zdCBnZXROZXh0QWN0aXZlRWxlbWVudCA9IChsaXN0LCBhY3RpdmVFbGVtZW50LCBzaG91bGRHZXROZXh0LCBpc0N5Y2xlQWxsb3dlZCkgPT4ge1xuICBjb25zdCBsaXN0TGVuZ3RoID0gbGlzdC5sZW5ndGhcbiAgbGV0IGluZGV4ID0gbGlzdC5pbmRleE9mKGFjdGl2ZUVsZW1lbnQpXG5cbiAgLy8gaWYgdGhlIGVsZW1lbnQgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGxpc3QgcmV0dXJuIGFuIGVsZW1lbnRcbiAgLy8gZGVwZW5kaW5nIG9uIHRoZSBkaXJlY3Rpb24gYW5kIGlmIGN5Y2xlIGlzIGFsbG93ZWRcbiAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgIHJldHVybiAhc2hvdWxkR2V0TmV4dCAmJiBpc0N5Y2xlQWxsb3dlZCA/IGxpc3RbbGlzdExlbmd0aCAtIDFdIDogbGlzdFswXVxuICB9XG5cbiAgaW5kZXggKz0gc2hvdWxkR2V0TmV4dCA/IDEgOiAtMVxuXG4gIGlmIChpc0N5Y2xlQWxsb3dlZCkge1xuICAgIGluZGV4ID0gKGluZGV4ICsgbGlzdExlbmd0aCkgJSBsaXN0TGVuZ3RoXG4gIH1cblxuICByZXR1cm4gbGlzdFtNYXRoLm1heCgwLCBNYXRoLm1pbihpbmRleCwgbGlzdExlbmd0aCAtIDEpKV1cbn1cblxuZXhwb3J0IHtcbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luLFxuICBleGVjdXRlLFxuICBleGVjdXRlQWZ0ZXJUcmFuc2l0aW9uLFxuICBmaW5kU2hhZG93Um9vdCxcbiAgZ2V0RWxlbWVudCxcbiAgZ2V0alF1ZXJ5LFxuICBnZXROZXh0QWN0aXZlRWxlbWVudCxcbiAgZ2V0VHJhbnNpdGlvbkR1cmF0aW9uRnJvbUVsZW1lbnQsXG4gIGdldFVJRCxcbiAgaXNEaXNhYmxlZCxcbiAgaXNFbGVtZW50LFxuICBpc1JUTCxcbiAgaXNWaXNpYmxlLFxuICBub29wLFxuICBvbkRPTUNvbnRlbnRMb2FkZWQsXG4gIHBhcnNlU2VsZWN0b3IsXG4gIHJlZmxvdyxcbiAgdHJpZ2dlclRyYW5zaXRpb25FbmQsXG4gIHRvVHlwZVxufVxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCBkb20vZXZlbnQtaGFuZGxlci5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCB7IGdldGpRdWVyeSB9IGZyb20gJy4uL3V0aWwvaW5kZXguanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgbmFtZXNwYWNlUmVnZXggPSAvW14uXSooPz1cXC4uKilcXC58LiovXG5jb25zdCBzdHJpcE5hbWVSZWdleCA9IC9cXC4uKi9cbmNvbnN0IHN0cmlwVWlkUmVnZXggPSAvOjpcXGQrJC9cbmNvbnN0IGV2ZW50UmVnaXN0cnkgPSB7fSAvLyBFdmVudHMgc3RvcmFnZVxubGV0IHVpZEV2ZW50ID0gMVxuY29uc3QgY3VzdG9tRXZlbnRzID0ge1xuICBtb3VzZWVudGVyOiAnbW91c2VvdmVyJyxcbiAgbW91c2VsZWF2ZTogJ21vdXNlb3V0J1xufVxuXG5jb25zdCBuYXRpdmVFdmVudHMgPSBuZXcgU2V0KFtcbiAgJ2NsaWNrJyxcbiAgJ2RibGNsaWNrJyxcbiAgJ21vdXNldXAnLFxuICAnbW91c2Vkb3duJyxcbiAgJ2NvbnRleHRtZW51JyxcbiAgJ21vdXNld2hlZWwnLFxuICAnRE9NTW91c2VTY3JvbGwnLFxuICAnbW91c2VvdmVyJyxcbiAgJ21vdXNlb3V0JyxcbiAgJ21vdXNlbW92ZScsXG4gICdzZWxlY3RzdGFydCcsXG4gICdzZWxlY3RlbmQnLFxuICAna2V5ZG93bicsXG4gICdrZXlwcmVzcycsXG4gICdrZXl1cCcsXG4gICdvcmllbnRhdGlvbmNoYW5nZScsXG4gICd0b3VjaHN0YXJ0JyxcbiAgJ3RvdWNobW92ZScsXG4gICd0b3VjaGVuZCcsXG4gICd0b3VjaGNhbmNlbCcsXG4gICdwb2ludGVyZG93bicsXG4gICdwb2ludGVybW92ZScsXG4gICdwb2ludGVydXAnLFxuICAncG9pbnRlcmxlYXZlJyxcbiAgJ3BvaW50ZXJjYW5jZWwnLFxuICAnZ2VzdHVyZXN0YXJ0JyxcbiAgJ2dlc3R1cmVjaGFuZ2UnLFxuICAnZ2VzdHVyZWVuZCcsXG4gICdmb2N1cycsXG4gICdibHVyJyxcbiAgJ2NoYW5nZScsXG4gICdyZXNldCcsXG4gICdzZWxlY3QnLFxuICAnc3VibWl0JyxcbiAgJ2ZvY3VzaW4nLFxuICAnZm9jdXNvdXQnLFxuICAnbG9hZCcsXG4gICd1bmxvYWQnLFxuICAnYmVmb3JldW5sb2FkJyxcbiAgJ3Jlc2l6ZScsXG4gICdtb3ZlJyxcbiAgJ0RPTUNvbnRlbnRMb2FkZWQnLFxuICAncmVhZHlzdGF0ZWNoYW5nZScsXG4gICdlcnJvcicsXG4gICdhYm9ydCcsXG4gICdzY3JvbGwnXG5dKVxuXG4vKipcbiAqIFByaXZhdGUgbWV0aG9kc1xuICovXG5cbmZ1bmN0aW9uIG1ha2VFdmVudFVpZChlbGVtZW50LCB1aWQpIHtcbiAgcmV0dXJuICh1aWQgJiYgYCR7dWlkfTo6JHt1aWRFdmVudCsrfWApIHx8IGVsZW1lbnQudWlkRXZlbnQgfHwgdWlkRXZlbnQrK1xufVxuXG5mdW5jdGlvbiBnZXRFbGVtZW50RXZlbnRzKGVsZW1lbnQpIHtcbiAgY29uc3QgdWlkID0gbWFrZUV2ZW50VWlkKGVsZW1lbnQpXG5cbiAgZWxlbWVudC51aWRFdmVudCA9IHVpZFxuICBldmVudFJlZ2lzdHJ5W3VpZF0gPSBldmVudFJlZ2lzdHJ5W3VpZF0gfHwge31cblxuICByZXR1cm4gZXZlbnRSZWdpc3RyeVt1aWRdXG59XG5cbmZ1bmN0aW9uIGJvb3RzdHJhcEhhbmRsZXIoZWxlbWVudCwgZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICBoeWRyYXRlT2JqKGV2ZW50LCB7IGRlbGVnYXRlVGFyZ2V0OiBlbGVtZW50IH0pXG5cbiAgICBpZiAoaGFuZGxlci5vbmVPZmYpIHtcbiAgICAgIEV2ZW50SGFuZGxlci5vZmYoZWxlbWVudCwgZXZlbnQudHlwZSwgZm4pXG4gICAgfVxuXG4gICAgcmV0dXJuIGZuLmFwcGx5KGVsZW1lbnQsIFtldmVudF0pXG4gIH1cbn1cblxuZnVuY3Rpb24gYm9vdHN0cmFwRGVsZWdhdGlvbkhhbmRsZXIoZWxlbWVudCwgc2VsZWN0b3IsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50KSB7XG4gICAgY29uc3QgZG9tRWxlbWVudHMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cbiAgICBmb3IgKGxldCB7IHRhcmdldCB9ID0gZXZlbnQ7IHRhcmdldCAmJiB0YXJnZXQgIT09IHRoaXM7IHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlKSB7XG4gICAgICBmb3IgKGNvbnN0IGRvbUVsZW1lbnQgb2YgZG9tRWxlbWVudHMpIHtcbiAgICAgICAgaWYgKGRvbUVsZW1lbnQgIT09IHRhcmdldCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBoeWRyYXRlT2JqKGV2ZW50LCB7IGRlbGVnYXRlVGFyZ2V0OiB0YXJnZXQgfSlcblxuICAgICAgICBpZiAoaGFuZGxlci5vbmVPZmYpIHtcbiAgICAgICAgICBFdmVudEhhbmRsZXIub2ZmKGVsZW1lbnQsIGV2ZW50LnR5cGUsIHNlbGVjdG9yLCBmbilcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0YXJnZXQsIFtldmVudF0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRIYW5kbGVyKGV2ZW50cywgY2FsbGFibGUsIGRlbGVnYXRpb25TZWxlY3RvciA9IG51bGwpIHtcbiAgcmV0dXJuIE9iamVjdC52YWx1ZXMoZXZlbnRzKVxuICAgIC5maW5kKGV2ZW50ID0+IGV2ZW50LmNhbGxhYmxlID09PSBjYWxsYWJsZSAmJiBldmVudC5kZWxlZ2F0aW9uU2VsZWN0b3IgPT09IGRlbGVnYXRpb25TZWxlY3Rvcilcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1ldGVycyhvcmlnaW5hbFR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uKSB7XG4gIGNvbnN0IGlzRGVsZWdhdGVkID0gdHlwZW9mIGhhbmRsZXIgPT09ICdzdHJpbmcnXG4gIC8vIFRPRE86IHRvb2x0aXAgcGFzc2VzIGBmYWxzZWAgaW5zdGVhZCBvZiBzZWxlY3Rvciwgc28gd2UgbmVlZCB0byBjaGVja1xuICBjb25zdCBjYWxsYWJsZSA9IGlzRGVsZWdhdGVkID8gZGVsZWdhdGlvbkZ1bmN0aW9uIDogKGhhbmRsZXIgfHwgZGVsZWdhdGlvbkZ1bmN0aW9uKVxuICBsZXQgdHlwZUV2ZW50ID0gZ2V0VHlwZUV2ZW50KG9yaWdpbmFsVHlwZUV2ZW50KVxuXG4gIGlmICghbmF0aXZlRXZlbnRzLmhhcyh0eXBlRXZlbnQpKSB7XG4gICAgdHlwZUV2ZW50ID0gb3JpZ2luYWxUeXBlRXZlbnRcbiAgfVxuXG4gIHJldHVybiBbaXNEZWxlZ2F0ZWQsIGNhbGxhYmxlLCB0eXBlRXZlbnRdXG59XG5cbmZ1bmN0aW9uIGFkZEhhbmRsZXIoZWxlbWVudCwgb3JpZ2luYWxUeXBlRXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbiwgb25lT2ZmKSB7XG4gIGlmICh0eXBlb2Ygb3JpZ2luYWxUeXBlRXZlbnQgIT09ICdzdHJpbmcnIHx8ICFlbGVtZW50KSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBsZXQgW2lzRGVsZWdhdGVkLCBjYWxsYWJsZSwgdHlwZUV2ZW50XSA9IG5vcm1hbGl6ZVBhcmFtZXRlcnMob3JpZ2luYWxUeXBlRXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbilcblxuICAvLyBpbiBjYXNlIG9mIG1vdXNlZW50ZXIgb3IgbW91c2VsZWF2ZSB3cmFwIHRoZSBoYW5kbGVyIHdpdGhpbiBhIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGZvciBpdHMgRE9NIHBvc2l0aW9uXG4gIC8vIHRoaXMgcHJldmVudHMgdGhlIGhhbmRsZXIgZnJvbSBiZWluZyBkaXNwYXRjaGVkIHRoZSBzYW1lIHdheSBhcyBtb3VzZW92ZXIgb3IgbW91c2VvdXQgZG9lc1xuICBpZiAob3JpZ2luYWxUeXBlRXZlbnQgaW4gY3VzdG9tRXZlbnRzKSB7XG4gICAgY29uc3Qgd3JhcEZ1bmN0aW9uID0gZm4gPT4ge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoIWV2ZW50LnJlbGF0ZWRUYXJnZXQgfHwgKGV2ZW50LnJlbGF0ZWRUYXJnZXQgIT09IGV2ZW50LmRlbGVnYXRlVGFyZ2V0ICYmICFldmVudC5kZWxlZ2F0ZVRhcmdldC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KSkpIHtcbiAgICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNhbGxhYmxlID0gd3JhcEZ1bmN0aW9uKGNhbGxhYmxlKVxuICB9XG5cbiAgY29uc3QgZXZlbnRzID0gZ2V0RWxlbWVudEV2ZW50cyhlbGVtZW50KVxuICBjb25zdCBoYW5kbGVycyA9IGV2ZW50c1t0eXBlRXZlbnRdIHx8IChldmVudHNbdHlwZUV2ZW50XSA9IHt9KVxuICBjb25zdCBwcmV2aW91c0Z1bmN0aW9uID0gZmluZEhhbmRsZXIoaGFuZGxlcnMsIGNhbGxhYmxlLCBpc0RlbGVnYXRlZCA/IGhhbmRsZXIgOiBudWxsKVxuXG4gIGlmIChwcmV2aW91c0Z1bmN0aW9uKSB7XG4gICAgcHJldmlvdXNGdW5jdGlvbi5vbmVPZmYgPSBwcmV2aW91c0Z1bmN0aW9uLm9uZU9mZiAmJiBvbmVPZmZcblxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgdWlkID0gbWFrZUV2ZW50VWlkKGNhbGxhYmxlLCBvcmlnaW5hbFR5cGVFdmVudC5yZXBsYWNlKG5hbWVzcGFjZVJlZ2V4LCAnJykpXG4gIGNvbnN0IGZuID0gaXNEZWxlZ2F0ZWQgP1xuICAgIGJvb3RzdHJhcERlbGVnYXRpb25IYW5kbGVyKGVsZW1lbnQsIGhhbmRsZXIsIGNhbGxhYmxlKSA6XG4gICAgYm9vdHN0cmFwSGFuZGxlcihlbGVtZW50LCBjYWxsYWJsZSlcblxuICBmbi5kZWxlZ2F0aW9uU2VsZWN0b3IgPSBpc0RlbGVnYXRlZCA/IGhhbmRsZXIgOiBudWxsXG4gIGZuLmNhbGxhYmxlID0gY2FsbGFibGVcbiAgZm4ub25lT2ZmID0gb25lT2ZmXG4gIGZuLnVpZEV2ZW50ID0gdWlkXG4gIGhhbmRsZXJzW3VpZF0gPSBmblxuXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlRXZlbnQsIGZuLCBpc0RlbGVnYXRlZClcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvblNlbGVjdG9yKSB7XG4gIGNvbnN0IGZuID0gZmluZEhhbmRsZXIoZXZlbnRzW3R5cGVFdmVudF0sIGhhbmRsZXIsIGRlbGVnYXRpb25TZWxlY3RvcilcblxuICBpZiAoIWZuKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZUV2ZW50LCBmbiwgQm9vbGVhbihkZWxlZ2F0aW9uU2VsZWN0b3IpKVxuICBkZWxldGUgZXZlbnRzW3R5cGVFdmVudF1bZm4udWlkRXZlbnRdXG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5hbWVzcGFjZWRIYW5kbGVycyhlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgbmFtZXNwYWNlKSB7XG4gIGNvbnN0IHN0b3JlRWxlbWVudEV2ZW50ID0gZXZlbnRzW3R5cGVFdmVudF0gfHwge31cblxuICBmb3IgKGNvbnN0IFtoYW5kbGVyS2V5LCBldmVudF0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmVFbGVtZW50RXZlbnQpKSB7XG4gICAgaWYgKGhhbmRsZXJLZXkuaW5jbHVkZXMobmFtZXNwYWNlKSkge1xuICAgICAgcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgZXZlbnQuY2FsbGFibGUsIGV2ZW50LmRlbGVnYXRpb25TZWxlY3RvcilcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHlwZUV2ZW50KGV2ZW50KSB7XG4gIC8vIGFsbG93IHRvIGdldCB0aGUgbmF0aXZlIGV2ZW50cyBmcm9tIG5hbWVzcGFjZWQgZXZlbnRzICgnY2xpY2suYnMuYnV0dG9uJyAtLT4gJ2NsaWNrJylcbiAgZXZlbnQgPSBldmVudC5yZXBsYWNlKHN0cmlwTmFtZVJlZ2V4LCAnJylcbiAgcmV0dXJuIGN1c3RvbUV2ZW50c1tldmVudF0gfHwgZXZlbnRcbn1cblxuY29uc3QgRXZlbnRIYW5kbGVyID0ge1xuICBvbihlbGVtZW50LCBldmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uKSB7XG4gICAgYWRkSGFuZGxlcihlbGVtZW50LCBldmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uLCBmYWxzZSlcbiAgfSxcblxuICBvbmUoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbikge1xuICAgIGFkZEhhbmRsZXIoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbiwgdHJ1ZSlcbiAgfSxcblxuICBvZmYoZWxlbWVudCwgb3JpZ2luYWxUeXBlRXZlbnQsIGhhbmRsZXIsIGRlbGVnYXRpb25GdW5jdGlvbikge1xuICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxUeXBlRXZlbnQgIT09ICdzdHJpbmcnIHx8ICFlbGVtZW50KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBbaXNEZWxlZ2F0ZWQsIGNhbGxhYmxlLCB0eXBlRXZlbnRdID0gbm9ybWFsaXplUGFyYW1ldGVycyhvcmlnaW5hbFR5cGVFdmVudCwgaGFuZGxlciwgZGVsZWdhdGlvbkZ1bmN0aW9uKVxuICAgIGNvbnN0IGluTmFtZXNwYWNlID0gdHlwZUV2ZW50ICE9PSBvcmlnaW5hbFR5cGVFdmVudFxuICAgIGNvbnN0IGV2ZW50cyA9IGdldEVsZW1lbnRFdmVudHMoZWxlbWVudClcbiAgICBjb25zdCBzdG9yZUVsZW1lbnRFdmVudCA9IGV2ZW50c1t0eXBlRXZlbnRdIHx8IHt9XG4gICAgY29uc3QgaXNOYW1lc3BhY2UgPSBvcmlnaW5hbFR5cGVFdmVudC5zdGFydHNXaXRoKCcuJylcblxuICAgIGlmICh0eXBlb2YgY2FsbGFibGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBTaW1wbGVzdCBjYXNlOiBoYW5kbGVyIGlzIHBhc3NlZCwgcmVtb3ZlIHRoYXQgbGlzdGVuZXIgT05MWS5cbiAgICAgIGlmICghT2JqZWN0LmtleXMoc3RvcmVFbGVtZW50RXZlbnQpLmxlbmd0aCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgY2FsbGFibGUsIGlzRGVsZWdhdGVkID8gaGFuZGxlciA6IG51bGwpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoaXNOYW1lc3BhY2UpIHtcbiAgICAgIGZvciAoY29uc3QgZWxlbWVudEV2ZW50IG9mIE9iamVjdC5rZXlzKGV2ZW50cykpIHtcbiAgICAgICAgcmVtb3ZlTmFtZXNwYWNlZEhhbmRsZXJzKGVsZW1lbnQsIGV2ZW50cywgZWxlbWVudEV2ZW50LCBvcmlnaW5hbFR5cGVFdmVudC5zbGljZSgxKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtrZXlIYW5kbGVycywgZXZlbnRdIG9mIE9iamVjdC5lbnRyaWVzKHN0b3JlRWxlbWVudEV2ZW50KSkge1xuICAgICAgY29uc3QgaGFuZGxlcktleSA9IGtleUhhbmRsZXJzLnJlcGxhY2Uoc3RyaXBVaWRSZWdleCwgJycpXG5cbiAgICAgIGlmICghaW5OYW1lc3BhY2UgfHwgb3JpZ2luYWxUeXBlRXZlbnQuaW5jbHVkZXMoaGFuZGxlcktleSkpIHtcbiAgICAgICAgcmVtb3ZlSGFuZGxlcihlbGVtZW50LCBldmVudHMsIHR5cGVFdmVudCwgZXZlbnQuY2FsbGFibGUsIGV2ZW50LmRlbGVnYXRpb25TZWxlY3RvcilcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdHJpZ2dlcihlbGVtZW50LCBldmVudCwgYXJncykge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgIT09ICdzdHJpbmcnIHx8ICFlbGVtZW50KSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIGNvbnN0ICQgPSBnZXRqUXVlcnkoKVxuICAgIGNvbnN0IHR5cGVFdmVudCA9IGdldFR5cGVFdmVudChldmVudClcbiAgICBjb25zdCBpbk5hbWVzcGFjZSA9IGV2ZW50ICE9PSB0eXBlRXZlbnRcblxuICAgIGxldCBqUXVlcnlFdmVudCA9IG51bGxcbiAgICBsZXQgYnViYmxlcyA9IHRydWVcbiAgICBsZXQgbmF0aXZlRGlzcGF0Y2ggPSB0cnVlXG4gICAgbGV0IGRlZmF1bHRQcmV2ZW50ZWQgPSBmYWxzZVxuXG4gICAgaWYgKGluTmFtZXNwYWNlICYmICQpIHtcbiAgICAgIGpRdWVyeUV2ZW50ID0gJC5FdmVudChldmVudCwgYXJncylcblxuICAgICAgJChlbGVtZW50KS50cmlnZ2VyKGpRdWVyeUV2ZW50KVxuICAgICAgYnViYmxlcyA9ICFqUXVlcnlFdmVudC5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpXG4gICAgICBuYXRpdmVEaXNwYXRjaCA9ICFqUXVlcnlFdmVudC5pc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCgpXG4gICAgICBkZWZhdWx0UHJldmVudGVkID0galF1ZXJ5RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKClcbiAgICB9XG5cbiAgICBjb25zdCBldnQgPSBoeWRyYXRlT2JqKG5ldyBFdmVudChldmVudCwgeyBidWJibGVzLCBjYW5jZWxhYmxlOiB0cnVlIH0pLCBhcmdzKVxuXG4gICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfVxuXG4gICAgaWYgKG5hdGl2ZURpc3BhdGNoKSB7XG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KVxuICAgIH1cblxuICAgIGlmIChldnQuZGVmYXVsdFByZXZlbnRlZCAmJiBqUXVlcnlFdmVudCkge1xuICAgICAgalF1ZXJ5RXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIH1cblxuICAgIHJldHVybiBldnRcbiAgfVxufVxuXG5mdW5jdGlvbiBoeWRyYXRlT2JqKG9iaiwgbWV0YSA9IHt9KSB7XG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG1ldGEpKSB7XG4gICAgdHJ5IHtcbiAgICAgIG9ialtrZXldID0gdmFsdWVcbiAgICB9IGNhdGNoIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqXG59XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50SGFuZGxlclxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCBkb20vbWFuaXB1bGF0b3IuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5mdW5jdGlvbiBub3JtYWxpemVEYXRhKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gJ3RydWUnKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKHZhbHVlID09PSBOdW1iZXIodmFsdWUpLnRvU3RyaW5nKCkpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKVxuICB9XG5cbiAgaWYgKHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gJ251bGwnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZURhdGFLZXkoa2V5KSB7XG4gIHJldHVybiBrZXkucmVwbGFjZSgvW0EtWl0vZywgY2hyID0+IGAtJHtjaHIudG9Mb3dlckNhc2UoKX1gKVxufVxuXG5jb25zdCBNYW5pcHVsYXRvciA9IHtcbiAgc2V0RGF0YUF0dHJpYnV0ZShlbGVtZW50LCBrZXksIHZhbHVlKSB7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYGRhdGEtYnMtJHtub3JtYWxpemVEYXRhS2V5KGtleSl9YCwgdmFsdWUpXG4gIH0sXG5cbiAgcmVtb3ZlRGF0YUF0dHJpYnV0ZShlbGVtZW50LCBrZXkpIHtcbiAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShgZGF0YS1icy0ke25vcm1hbGl6ZURhdGFLZXkoa2V5KX1gKVxuICB9LFxuXG4gIGdldERhdGFBdHRyaWJ1dGVzKGVsZW1lbnQpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cblxuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB7fVxuICAgIGNvbnN0IGJzS2V5cyA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldCkuZmlsdGVyKGtleSA9PiBrZXkuc3RhcnRzV2l0aCgnYnMnKSAmJiAha2V5LnN0YXJ0c1dpdGgoJ2JzQ29uZmlnJykpXG5cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBic0tleXMpIHtcbiAgICAgIGxldCBwdXJlS2V5ID0ga2V5LnJlcGxhY2UoL15icy8sICcnKVxuICAgICAgcHVyZUtleSA9IHB1cmVLZXkuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBwdXJlS2V5LnNsaWNlKDEsIHB1cmVLZXkubGVuZ3RoKVxuICAgICAgYXR0cmlidXRlc1twdXJlS2V5XSA9IG5vcm1hbGl6ZURhdGEoZWxlbWVudC5kYXRhc2V0W2tleV0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJpYnV0ZXNcbiAgfSxcblxuICBnZXREYXRhQXR0cmlidXRlKGVsZW1lbnQsIGtleSkge1xuICAgIHJldHVybiBub3JtYWxpemVEYXRhKGVsZW1lbnQuZ2V0QXR0cmlidXRlKGBkYXRhLWJzLSR7bm9ybWFsaXplRGF0YUtleShrZXkpfWApKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hbmlwdWxhdG9yXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIHV0aWwvY29uZmlnLmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0IE1hbmlwdWxhdG9yIGZyb20gJy4uL2RvbS9tYW5pcHVsYXRvci5qcydcbmltcG9ydCB7IGlzRWxlbWVudCwgdG9UeXBlIH0gZnJvbSAnLi9pbmRleC5qcydcblxuLyoqXG4gKiBDbGFzcyBkZWZpbml0aW9uXG4gKi9cblxuY2xhc3MgQ29uZmlnIHtcbiAgLy8gR2V0dGVyc1xuICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiB7fVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignWW91IGhhdmUgdG8gaW1wbGVtZW50IHRoZSBzdGF0aWMgbWV0aG9kIFwiTkFNRVwiLCBmb3IgZWFjaCBjb21wb25lbnQhJylcbiAgfVxuXG4gIF9nZXRDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnID0gdGhpcy5fbWVyZ2VDb25maWdPYmooY29uZmlnKVxuICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKVxuICAgIHRoaXMuX3R5cGVDaGVja0NvbmZpZyhjb25maWcpXG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKSB7XG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgX21lcmdlQ29uZmlnT2JqKGNvbmZpZywgZWxlbWVudCkge1xuICAgIGNvbnN0IGpzb25Db25maWcgPSBpc0VsZW1lbnQoZWxlbWVudCkgPyBNYW5pcHVsYXRvci5nZXREYXRhQXR0cmlidXRlKGVsZW1lbnQsICdjb25maWcnKSA6IHt9IC8vIHRyeSB0byBwYXJzZVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnRoaXMuY29uc3RydWN0b3IuRGVmYXVsdCxcbiAgICAgIC4uLih0eXBlb2YganNvbkNvbmZpZyA9PT0gJ29iamVjdCcgPyBqc29uQ29uZmlnIDoge30pLFxuICAgICAgLi4uKGlzRWxlbWVudChlbGVtZW50KSA/IE1hbmlwdWxhdG9yLmdldERhdGFBdHRyaWJ1dGVzKGVsZW1lbnQpIDoge30pLFxuICAgICAgLi4uKHR5cGVvZiBjb25maWcgPT09ICdvYmplY3QnID8gY29uZmlnIDoge30pXG4gICAgfVxuICB9XG5cbiAgX3R5cGVDaGVja0NvbmZpZyhjb25maWcsIGNvbmZpZ1R5cGVzID0gdGhpcy5jb25zdHJ1Y3Rvci5EZWZhdWx0VHlwZSkge1xuICAgIGZvciAoY29uc3QgW3Byb3BlcnR5LCBleHBlY3RlZFR5cGVzXSBvZiBPYmplY3QuZW50cmllcyhjb25maWdUeXBlcykpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gY29uZmlnW3Byb3BlcnR5XVxuICAgICAgY29uc3QgdmFsdWVUeXBlID0gaXNFbGVtZW50KHZhbHVlKSA/ICdlbGVtZW50JyA6IHRvVHlwZSh2YWx1ZSlcblxuICAgICAgaWYgKCFuZXcgUmVnRXhwKGV4cGVjdGVkVHlwZXMpLnRlc3QodmFsdWVUeXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGAke3RoaXMuY29uc3RydWN0b3IuTkFNRS50b1VwcGVyQ2FzZSgpfTogT3B0aW9uIFwiJHtwcm9wZXJ0eX1cIiBwcm92aWRlZCB0eXBlIFwiJHt2YWx1ZVR5cGV9XCIgYnV0IGV4cGVjdGVkIHR5cGUgXCIke2V4cGVjdGVkVHlwZXN9XCIuYFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZ1xuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCBiYXNlLWNvbXBvbmVudC5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBEYXRhIGZyb20gJy4vZG9tL2RhdGEuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vdXRpbC9jb25maWcuanMnXG5pbXBvcnQgeyBleGVjdXRlQWZ0ZXJUcmFuc2l0aW9uLCBnZXRFbGVtZW50IH0gZnJvbSAnLi91dGlsL2luZGV4LmpzJ1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IFZFUlNJT04gPSAnNS4zLjMnXG5cbi8qKlxuICogQ2xhc3MgZGVmaW5pdGlvblxuICovXG5cbmNsYXNzIEJhc2VDb21wb25lbnQgZXh0ZW5kcyBDb25maWcge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICBzdXBlcigpXG5cbiAgICBlbGVtZW50ID0gZ2V0RWxlbWVudChlbGVtZW50KVxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnRcbiAgICB0aGlzLl9jb25maWcgPSB0aGlzLl9nZXRDb25maWcoY29uZmlnKVxuXG4gICAgRGF0YS5zZXQodGhpcy5fZWxlbWVudCwgdGhpcy5jb25zdHJ1Y3Rvci5EQVRBX0tFWSwgdGhpcylcbiAgfVxuXG4gIC8vIFB1YmxpY1xuICBkaXNwb3NlKCkge1xuICAgIERhdGEucmVtb3ZlKHRoaXMuX2VsZW1lbnQsIHRoaXMuY29uc3RydWN0b3IuREFUQV9LRVkpXG4gICAgRXZlbnRIYW5kbGVyLm9mZih0aGlzLl9lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLkVWRU5UX0tFWSlcblxuICAgIGZvciAoY29uc3QgcHJvcGVydHlOYW1lIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMpKSB7XG4gICAgICB0aGlzW3Byb3BlcnR5TmFtZV0gPSBudWxsXG4gICAgfVxuICB9XG5cbiAgX3F1ZXVlQ2FsbGJhY2soY2FsbGJhY2ssIGVsZW1lbnQsIGlzQW5pbWF0ZWQgPSB0cnVlKSB7XG4gICAgZXhlY3V0ZUFmdGVyVHJhbnNpdGlvbihjYWxsYmFjaywgZWxlbWVudCwgaXNBbmltYXRlZClcbiAgfVxuXG4gIF9nZXRDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnID0gdGhpcy5fbWVyZ2VDb25maWdPYmooY29uZmlnLCB0aGlzLl9lbGVtZW50KVxuICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKVxuICAgIHRoaXMuX3R5cGVDaGVja0NvbmZpZyhjb25maWcpXG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgLy8gU3RhdGljXG4gIHN0YXRpYyBnZXRJbnN0YW5jZShlbGVtZW50KSB7XG4gICAgcmV0dXJuIERhdGEuZ2V0KGdldEVsZW1lbnQoZWxlbWVudCksIHRoaXMuREFUQV9LRVkpXG4gIH1cblxuICBzdGF0aWMgZ2V0T3JDcmVhdGVJbnN0YW5jZShlbGVtZW50LCBjb25maWcgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmdldEluc3RhbmNlKGVsZW1lbnQpIHx8IG5ldyB0aGlzKGVsZW1lbnQsIHR5cGVvZiBjb25maWcgPT09ICdvYmplY3QnID8gY29uZmlnIDogbnVsbClcbiAgfVxuXG4gIHN0YXRpYyBnZXQgVkVSU0lPTigpIHtcbiAgICByZXR1cm4gVkVSU0lPTlxuICB9XG5cbiAgc3RhdGljIGdldCBEQVRBX0tFWSgpIHtcbiAgICByZXR1cm4gYGJzLiR7dGhpcy5OQU1FfWBcbiAgfVxuXG4gIHN0YXRpYyBnZXQgRVZFTlRfS0VZKCkge1xuICAgIHJldHVybiBgLiR7dGhpcy5EQVRBX0tFWX1gXG4gIH1cblxuICBzdGF0aWMgZXZlbnROYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gYCR7bmFtZX0ke3RoaXMuRVZFTlRfS0VZfWBcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlQ29tcG9uZW50XG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIGRvbS9zZWxlY3Rvci1lbmdpbmUuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5pbXBvcnQgeyBpc0Rpc2FibGVkLCBpc1Zpc2libGUsIHBhcnNlU2VsZWN0b3IgfSBmcm9tICcuLi91dGlsL2luZGV4LmpzJ1xuXG5jb25zdCBnZXRTZWxlY3RvciA9IGVsZW1lbnQgPT4ge1xuICBsZXQgc2VsZWN0b3IgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1icy10YXJnZXQnKVxuXG4gIGlmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09ICcjJykge1xuICAgIGxldCBocmVmQXR0cmlidXRlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuXG4gICAgLy8gVGhlIG9ubHkgdmFsaWQgY29udGVudCB0aGF0IGNvdWxkIGRvdWJsZSBhcyBhIHNlbGVjdG9yIGFyZSBJRHMgb3IgY2xhc3NlcyxcbiAgICAvLyBzbyBldmVyeXRoaW5nIHN0YXJ0aW5nIHdpdGggYCNgIG9yIGAuYC4gSWYgYSBcInJlYWxcIiBVUkwgaXMgdXNlZCBhcyB0aGUgc2VsZWN0b3IsXG4gICAgLy8gYGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JgIHdpbGwgcmlnaHRmdWxseSBjb21wbGFpbiBpdCBpcyBpbnZhbGlkLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzMyMjczXG4gICAgaWYgKCFocmVmQXR0cmlidXRlIHx8ICghaHJlZkF0dHJpYnV0ZS5pbmNsdWRlcygnIycpICYmICFocmVmQXR0cmlidXRlLnN0YXJ0c1dpdGgoJy4nKSkpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgLy8gSnVzdCBpbiBjYXNlIHNvbWUgQ01TIHB1dHMgb3V0IGEgZnVsbCBVUkwgd2l0aCB0aGUgYW5jaG9yIGFwcGVuZGVkXG4gICAgaWYgKGhyZWZBdHRyaWJ1dGUuaW5jbHVkZXMoJyMnKSAmJiAhaHJlZkF0dHJpYnV0ZS5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgIGhyZWZBdHRyaWJ1dGUgPSBgIyR7aHJlZkF0dHJpYnV0ZS5zcGxpdCgnIycpWzFdfWBcbiAgICB9XG5cbiAgICBzZWxlY3RvciA9IGhyZWZBdHRyaWJ1dGUgJiYgaHJlZkF0dHJpYnV0ZSAhPT0gJyMnID8gaHJlZkF0dHJpYnV0ZS50cmltKCkgOiBudWxsXG4gIH1cblxuICByZXR1cm4gc2VsZWN0b3IgPyBzZWxlY3Rvci5zcGxpdCgnLCcpLm1hcChzZWwgPT4gcGFyc2VTZWxlY3RvcihzZWwpKS5qb2luKCcsJykgOiBudWxsXG59XG5cbmNvbnN0IFNlbGVjdG9yRW5naW5lID0ge1xuICBmaW5kKHNlbGVjdG9yLCBlbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdCguLi5FbGVtZW50LnByb3RvdHlwZS5xdWVyeVNlbGVjdG9yQWxsLmNhbGwoZWxlbWVudCwgc2VsZWN0b3IpKVxuICB9LFxuXG4gIGZpbmRPbmUoc2VsZWN0b3IsIGVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcbiAgICByZXR1cm4gRWxlbWVudC5wcm90b3R5cGUucXVlcnlTZWxlY3Rvci5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKVxuICB9LFxuXG4gIGNoaWxkcmVuKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdCguLi5lbGVtZW50LmNoaWxkcmVuKS5maWx0ZXIoY2hpbGQgPT4gY2hpbGQubWF0Y2hlcyhzZWxlY3RvcikpXG4gIH0sXG5cbiAgcGFyZW50cyhlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIGNvbnN0IHBhcmVudHMgPSBbXVxuICAgIGxldCBhbmNlc3RvciA9IGVsZW1lbnQucGFyZW50Tm9kZS5jbG9zZXN0KHNlbGVjdG9yKVxuXG4gICAgd2hpbGUgKGFuY2VzdG9yKSB7XG4gICAgICBwYXJlbnRzLnB1c2goYW5jZXN0b3IpXG4gICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudE5vZGUuY2xvc2VzdChzZWxlY3RvcilcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyZW50c1xuICB9LFxuXG4gIHByZXYoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICBsZXQgcHJldmlvdXMgPSBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmdcblxuICAgIHdoaWxlIChwcmV2aW91cykge1xuICAgICAgaWYgKHByZXZpb3VzLm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbcHJldmlvdXNdXG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gcHJldmlvdXMucHJldmlvdXNFbGVtZW50U2libGluZ1xuICAgIH1cblxuICAgIHJldHVybiBbXVxuICB9LFxuICAvLyBUT0RPOiB0aGlzIGlzIG5vdyB1bnVzZWQ7IHJlbW92ZSBsYXRlciBhbG9uZyB3aXRoIHByZXYoKVxuICBuZXh0KGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgbGV0IG5leHQgPSBlbGVtZW50Lm5leHRFbGVtZW50U2libGluZ1xuXG4gICAgd2hpbGUgKG5leHQpIHtcbiAgICAgIGlmIChuZXh0Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBbbmV4dF1cbiAgICAgIH1cblxuICAgICAgbmV4dCA9IG5leHQubmV4dEVsZW1lbnRTaWJsaW5nXG4gICAgfVxuXG4gICAgcmV0dXJuIFtdXG4gIH0sXG5cbiAgZm9jdXNhYmxlQ2hpbGRyZW4oZWxlbWVudCkge1xuICAgIGNvbnN0IGZvY3VzYWJsZXMgPSBbXG4gICAgICAnYScsXG4gICAgICAnYnV0dG9uJyxcbiAgICAgICdpbnB1dCcsXG4gICAgICAndGV4dGFyZWEnLFxuICAgICAgJ3NlbGVjdCcsXG4gICAgICAnZGV0YWlscycsXG4gICAgICAnW3RhYmluZGV4XScsXG4gICAgICAnW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nXG4gICAgXS5tYXAoc2VsZWN0b3IgPT4gYCR7c2VsZWN0b3J9Om5vdChbdGFiaW5kZXhePVwiLVwiXSlgKS5qb2luKCcsJylcblxuICAgIHJldHVybiB0aGlzLmZpbmQoZm9jdXNhYmxlcywgZWxlbWVudCkuZmlsdGVyKGVsID0+ICFpc0Rpc2FibGVkKGVsKSAmJiBpc1Zpc2libGUoZWwpKVxuICB9LFxuXG4gIGdldFNlbGVjdG9yRnJvbUVsZW1lbnQoZWxlbWVudCkge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IoZWxlbWVudClcblxuICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoc2VsZWN0b3IpID8gc2VsZWN0b3IgOiBudWxsXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfSxcblxuICBnZXRFbGVtZW50RnJvbVNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGdldFNlbGVjdG9yKGVsZW1lbnQpXG5cbiAgICByZXR1cm4gc2VsZWN0b3IgPyBTZWxlY3RvckVuZ2luZS5maW5kT25lKHNlbGVjdG9yKSA6IG51bGxcbiAgfSxcblxuICBnZXRNdWx0aXBsZUVsZW1lbnRzRnJvbVNlbGVjdG9yKGVsZW1lbnQpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGdldFNlbGVjdG9yKGVsZW1lbnQpXG5cbiAgICByZXR1cm4gc2VsZWN0b3IgPyBTZWxlY3RvckVuZ2luZS5maW5kKHNlbGVjdG9yKSA6IFtdXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0b3JFbmdpbmVcbiIsICIvKipcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBCb290c3RyYXAgdXRpbC9jb21wb25lbnQtZnVuY3Rpb25zLmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuLi9kb20vZXZlbnQtaGFuZGxlci5qcydcbmltcG9ydCBTZWxlY3RvckVuZ2luZSBmcm9tICcuLi9kb20vc2VsZWN0b3ItZW5naW5lLmpzJ1xuaW1wb3J0IHsgaXNEaXNhYmxlZCB9IGZyb20gJy4vaW5kZXguanMnXG5cbmNvbnN0IGVuYWJsZURpc21pc3NUcmlnZ2VyID0gKGNvbXBvbmVudCwgbWV0aG9kID0gJ2hpZGUnKSA9PiB7XG4gIGNvbnN0IGNsaWNrRXZlbnQgPSBgY2xpY2suZGlzbWlzcyR7Y29tcG9uZW50LkVWRU5UX0tFWX1gXG4gIGNvbnN0IG5hbWUgPSBjb21wb25lbnQuTkFNRVxuXG4gIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgY2xpY2tFdmVudCwgYFtkYXRhLWJzLWRpc21pc3M9XCIke25hbWV9XCJdYCwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKFsnQScsICdBUkVBJ10uaW5jbHVkZXModGhpcy50YWdOYW1lKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIH1cblxuICAgIGlmIChpc0Rpc2FibGVkKHRoaXMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXQgPSBTZWxlY3RvckVuZ2luZS5nZXRFbGVtZW50RnJvbVNlbGVjdG9yKHRoaXMpIHx8IHRoaXMuY2xvc2VzdChgLiR7bmFtZX1gKVxuICAgIGNvbnN0IGluc3RhbmNlID0gY29tcG9uZW50LmdldE9yQ3JlYXRlSW5zdGFuY2UodGFyZ2V0KVxuXG4gICAgLy8gTWV0aG9kIGFyZ3VtZW50IGlzIGxlZnQsIGZvciBBbGVydCBhbmQgb25seSwgYXMgaXQgZG9lc24ndCBpbXBsZW1lbnQgdGhlICdoaWRlJyBtZXRob2RcbiAgICBpbnN0YW5jZVttZXRob2RdKClcbiAgfSlcbn1cblxuZXhwb3J0IHtcbiAgZW5hYmxlRGlzbWlzc1RyaWdnZXJcbn1cbiIsICIvKipcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBCb290c3RyYXAgYWxlcnQuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5pbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL2Jhc2UtY29tcG9uZW50LmpzJ1xuaW1wb3J0IEV2ZW50SGFuZGxlciBmcm9tICcuL2RvbS9ldmVudC1oYW5kbGVyLmpzJ1xuaW1wb3J0IHsgZW5hYmxlRGlzbWlzc1RyaWdnZXIgfSBmcm9tICcuL3V0aWwvY29tcG9uZW50LWZ1bmN0aW9ucy5qcydcbmltcG9ydCB7IGRlZmluZUpRdWVyeVBsdWdpbiB9IGZyb20gJy4vdXRpbC9pbmRleC5qcydcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG5jb25zdCBOQU1FID0gJ2FsZXJ0J1xuY29uc3QgREFUQV9LRVkgPSAnYnMuYWxlcnQnXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuXG5jb25zdCBFVkVOVF9DTE9TRSA9IGBjbG9zZSR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0NMT1NFRCA9IGBjbG9zZWQke0VWRU5UX0tFWX1gXG5jb25zdCBDTEFTU19OQU1FX0ZBREUgPSAnZmFkZSdcbmNvbnN0IENMQVNTX05BTUVfU0hPVyA9ICdzaG93J1xuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBBbGVydCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICAvLyBHZXR0ZXJzXG4gIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICByZXR1cm4gTkFNRVxuICB9XG5cbiAgLy8gUHVibGljXG4gIGNsb3NlKCkge1xuICAgIGNvbnN0IGNsb3NlRXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9DTE9TRSlcblxuICAgIGlmIChjbG9zZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1cpXG5cbiAgICBjb25zdCBpc0FuaW1hdGVkID0gdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9GQURFKVxuICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soKCkgPT4gdGhpcy5fZGVzdHJveUVsZW1lbnQoKSwgdGhpcy5fZWxlbWVudCwgaXNBbmltYXRlZClcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2Rlc3Ryb3lFbGVtZW50KCkge1xuICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlKClcbiAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9DTE9TRUQpXG4gICAgdGhpcy5kaXNwb3NlKClcbiAgfVxuXG4gIC8vIFN0YXRpY1xuICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZGF0YSA9IEFsZXJ0LmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcylcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YVtjb25maWddID09PSB1bmRlZmluZWQgfHwgY29uZmlnLnN0YXJ0c1dpdGgoJ18nKSB8fCBjb25maWcgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgTm8gbWV0aG9kIG5hbWVkIFwiJHtjb25maWd9XCJgKVxuICAgICAgfVxuXG4gICAgICBkYXRhW2NvbmZpZ10odGhpcylcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogRGF0YSBBUEkgaW1wbGVtZW50YXRpb25cbiAqL1xuXG5lbmFibGVEaXNtaXNzVHJpZ2dlcihBbGVydCwgJ2Nsb3NlJylcblxuLyoqXG4gKiBqUXVlcnlcbiAqL1xuXG5kZWZpbmVKUXVlcnlQbHVnaW4oQWxlcnQpXG5cbmV4cG9ydCBkZWZhdWx0IEFsZXJ0XG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIGJ1dHRvbi5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vYmFzZS1jb21wb25lbnQuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgeyBkZWZpbmVKUXVlcnlQbHVnaW4gfSBmcm9tICcuL3V0aWwvaW5kZXguanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdidXR0b24nXG5jb25zdCBEQVRBX0tFWSA9ICdicy5idXR0b24nXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuY29uc3QgREFUQV9BUElfS0VZID0gJy5kYXRhLWFwaSdcblxuY29uc3QgQ0xBU1NfTkFNRV9BQ1RJVkUgPSAnYWN0aXZlJ1xuY29uc3QgU0VMRUNUT1JfREFUQV9UT0dHTEUgPSAnW2RhdGEtYnMtdG9nZ2xlPVwiYnV0dG9uXCJdJ1xuY29uc3QgRVZFTlRfQ0xJQ0tfREFUQV9BUEkgPSBgY2xpY2ske0VWRU5UX0tFWX0ke0RBVEFfQVBJX0tFWX1gXG5cbi8qKlxuICogQ2xhc3MgZGVmaW5pdGlvblxuICovXG5cbmNsYXNzIEJ1dHRvbiBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICAvLyBHZXR0ZXJzXG4gIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICByZXR1cm4gTkFNRVxuICB9XG5cbiAgLy8gUHVibGljXG4gIHRvZ2dsZSgpIHtcbiAgICAvLyBUb2dnbGUgY2xhc3MgYW5kIHN5bmMgdGhlIGBhcmlhLXByZXNzZWRgIGF0dHJpYnV0ZSB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGAudG9nZ2xlKClgIG1ldGhvZFxuICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoQ0xBU1NfTkFNRV9BQ1RJVkUpKVxuICB9XG5cbiAgLy8gU3RhdGljXG4gIHN0YXRpYyBqUXVlcnlJbnRlcmZhY2UoY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkYXRhID0gQnV0dG9uLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcylcblxuICAgICAgaWYgKGNvbmZpZyA9PT0gJ3RvZ2dsZScpIHtcbiAgICAgICAgZGF0YVtjb25maWddKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogRGF0YSBBUEkgaW1wbGVtZW50YXRpb25cbiAqL1xuXG5FdmVudEhhbmRsZXIub24oZG9jdW1lbnQsIEVWRU5UX0NMSUNLX0RBVEFfQVBJLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSwgZXZlbnQgPT4ge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgY29uc3QgYnV0dG9uID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoU0VMRUNUT1JfREFUQV9UT0dHTEUpXG4gIGNvbnN0IGRhdGEgPSBCdXR0b24uZ2V0T3JDcmVhdGVJbnN0YW5jZShidXR0b24pXG5cbiAgZGF0YS50b2dnbGUoKVxufSlcblxuLyoqXG4gKiBqUXVlcnlcbiAqL1xuXG5kZWZpbmVKUXVlcnlQbHVnaW4oQnV0dG9uKVxuXG5leHBvcnQgZGVmYXVsdCBCdXR0b25cbiIsICIvKipcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBCb290c3RyYXAgdXRpbC9zd2lwZS5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnLmpzJ1xuaW1wb3J0IHsgZXhlY3V0ZSB9IGZyb20gJy4vaW5kZXguanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdzd2lwZSdcbmNvbnN0IEVWRU5UX0tFWSA9ICcuYnMuc3dpcGUnXG5jb25zdCBFVkVOVF9UT1VDSFNUQVJUID0gYHRvdWNoc3RhcnQke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9UT1VDSE1PVkUgPSBgdG91Y2htb3ZlJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfVE9VQ0hFTkQgPSBgdG91Y2hlbmQke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9QT0lOVEVSRE9XTiA9IGBwb2ludGVyZG93biR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX1BPSU5URVJVUCA9IGBwb2ludGVydXAke0VWRU5UX0tFWX1gXG5jb25zdCBQT0lOVEVSX1RZUEVfVE9VQ0ggPSAndG91Y2gnXG5jb25zdCBQT0lOVEVSX1RZUEVfUEVOID0gJ3BlbidcbmNvbnN0IENMQVNTX05BTUVfUE9JTlRFUl9FVkVOVCA9ICdwb2ludGVyLWV2ZW50J1xuY29uc3QgU1dJUEVfVEhSRVNIT0xEID0gNDBcblxuY29uc3QgRGVmYXVsdCA9IHtcbiAgZW5kQ2FsbGJhY2s6IG51bGwsXG4gIGxlZnRDYWxsYmFjazogbnVsbCxcbiAgcmlnaHRDYWxsYmFjazogbnVsbFxufVxuXG5jb25zdCBEZWZhdWx0VHlwZSA9IHtcbiAgZW5kQ2FsbGJhY2s6ICcoZnVuY3Rpb258bnVsbCknLFxuICBsZWZ0Q2FsbGJhY2s6ICcoZnVuY3Rpb258bnVsbCknLFxuICByaWdodENhbGxiYWNrOiAnKGZ1bmN0aW9ufG51bGwpJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBTd2lwZSBleHRlbmRzIENvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNvbmZpZykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudFxuXG4gICAgaWYgKCFlbGVtZW50IHx8ICFTd2lwZS5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9jb25maWcgPSB0aGlzLl9nZXRDb25maWcoY29uZmlnKVxuICAgIHRoaXMuX2RlbHRhWCA9IDBcbiAgICB0aGlzLl9zdXBwb3J0UG9pbnRlckV2ZW50cyA9IEJvb2xlYW4od2luZG93LlBvaW50ZXJFdmVudClcbiAgICB0aGlzLl9pbml0RXZlbnRzKClcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgZGlzcG9zZSgpIHtcbiAgICBFdmVudEhhbmRsZXIub2ZmKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0tFWSlcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX3N0YXJ0KGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLl9zdXBwb3J0UG9pbnRlckV2ZW50cykge1xuICAgICAgdGhpcy5fZGVsdGFYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudElzUG9pbnRlclBlblRvdWNoKGV2ZW50KSkge1xuICAgICAgdGhpcy5fZGVsdGFYID0gZXZlbnQuY2xpZW50WFxuICAgIH1cbiAgfVxuXG4gIF9lbmQoZXZlbnQpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRJc1BvaW50ZXJQZW5Ub3VjaChldmVudCkpIHtcbiAgICAgIHRoaXMuX2RlbHRhWCA9IGV2ZW50LmNsaWVudFggLSB0aGlzLl9kZWx0YVhcbiAgICB9XG5cbiAgICB0aGlzLl9oYW5kbGVTd2lwZSgpXG4gICAgZXhlY3V0ZSh0aGlzLl9jb25maWcuZW5kQ2FsbGJhY2spXG4gIH1cblxuICBfbW92ZShldmVudCkge1xuICAgIHRoaXMuX2RlbHRhWCA9IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxID9cbiAgICAgIDAgOlxuICAgICAgZXZlbnQudG91Y2hlc1swXS5jbGllbnRYIC0gdGhpcy5fZGVsdGFYXG4gIH1cblxuICBfaGFuZGxlU3dpcGUoKSB7XG4gICAgY29uc3QgYWJzRGVsdGFYID0gTWF0aC5hYnModGhpcy5fZGVsdGFYKVxuXG4gICAgaWYgKGFic0RlbHRhWCA8PSBTV0lQRV9USFJFU0hPTEQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IGFic0RlbHRhWCAvIHRoaXMuX2RlbHRhWFxuXG4gICAgdGhpcy5fZGVsdGFYID0gMFxuXG4gICAgaWYgKCFkaXJlY3Rpb24pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGV4ZWN1dGUoZGlyZWN0aW9uID4gMCA/IHRoaXMuX2NvbmZpZy5yaWdodENhbGxiYWNrIDogdGhpcy5fY29uZmlnLmxlZnRDYWxsYmFjaylcbiAgfVxuXG4gIF9pbml0RXZlbnRzKCkge1xuICAgIGlmICh0aGlzLl9zdXBwb3J0UG9pbnRlckV2ZW50cykge1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1BPSU5URVJET1dOLCBldmVudCA9PiB0aGlzLl9zdGFydChldmVudCkpXG4gICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfUE9JTlRFUlVQLCBldmVudCA9PiB0aGlzLl9lbmQoZXZlbnQpKVxuXG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9QT0lOVEVSX0VWRU5UKVxuICAgIH0gZWxzZSB7XG4gICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfVE9VQ0hTVEFSVCwgZXZlbnQgPT4gdGhpcy5fc3RhcnQoZXZlbnQpKVxuICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1RPVUNITU9WRSwgZXZlbnQgPT4gdGhpcy5fbW92ZShldmVudCkpXG4gICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfVE9VQ0hFTkQsIGV2ZW50ID0+IHRoaXMuX2VuZChldmVudCkpXG4gICAgfVxuICB9XG5cbiAgX2V2ZW50SXNQb2ludGVyUGVuVG91Y2goZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fc3VwcG9ydFBvaW50ZXJFdmVudHMgJiYgKGV2ZW50LnBvaW50ZXJUeXBlID09PSBQT0lOVEVSX1RZUEVfUEVOIHx8IGV2ZW50LnBvaW50ZXJUeXBlID09PSBQT0lOVEVSX1RZUEVfVE9VQ0gpXG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGlzU3VwcG9ydGVkKCkge1xuICAgIHJldHVybiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgfHwgbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN3aXBlXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIGNhcm91c2VsLmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9iYXNlLWNvbXBvbmVudC5qcydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi9kb20vZXZlbnQtaGFuZGxlci5qcydcbmltcG9ydCBNYW5pcHVsYXRvciBmcm9tICcuL2RvbS9tYW5pcHVsYXRvci5qcydcbmltcG9ydCBTZWxlY3RvckVuZ2luZSBmcm9tICcuL2RvbS9zZWxlY3Rvci1lbmdpbmUuanMnXG5pbXBvcnQge1xuICBkZWZpbmVKUXVlcnlQbHVnaW4sXG4gIGdldE5leHRBY3RpdmVFbGVtZW50LFxuICBpc1JUTCxcbiAgaXNWaXNpYmxlLFxuICByZWZsb3csXG4gIHRyaWdnZXJUcmFuc2l0aW9uRW5kXG59IGZyb20gJy4vdXRpbC9pbmRleC5qcydcbmltcG9ydCBTd2lwZSBmcm9tICcuL3V0aWwvc3dpcGUuanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdjYXJvdXNlbCdcbmNvbnN0IERBVEFfS0VZID0gJ2JzLmNhcm91c2VsJ1xuY29uc3QgRVZFTlRfS0VZID0gYC4ke0RBVEFfS0VZfWBcbmNvbnN0IERBVEFfQVBJX0tFWSA9ICcuZGF0YS1hcGknXG5cbmNvbnN0IEFSUk9XX0xFRlRfS0VZID0gJ0Fycm93TGVmdCdcbmNvbnN0IEFSUk9XX1JJR0hUX0tFWSA9ICdBcnJvd1JpZ2h0J1xuY29uc3QgVE9VQ0hFVkVOVF9DT01QQVRfV0FJVCA9IDUwMCAvLyBUaW1lIGZvciBtb3VzZSBjb21wYXQgZXZlbnRzIHRvIGZpcmUgYWZ0ZXIgdG91Y2hcblxuY29uc3QgT1JERVJfTkVYVCA9ICduZXh0J1xuY29uc3QgT1JERVJfUFJFViA9ICdwcmV2J1xuY29uc3QgRElSRUNUSU9OX0xFRlQgPSAnbGVmdCdcbmNvbnN0IERJUkVDVElPTl9SSUdIVCA9ICdyaWdodCdcblxuY29uc3QgRVZFTlRfU0xJREUgPSBgc2xpZGUke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9TTElEID0gYHNsaWQke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9LRVlET1dOID0gYGtleWRvd24ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9NT1VTRUVOVEVSID0gYG1vdXNlZW50ZXIke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9NT1VTRUxFQVZFID0gYG1vdXNlbGVhdmUke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9EUkFHX1NUQVJUID0gYGRyYWdzdGFydCR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0xPQURfREFUQV9BUEkgPSBgbG9hZCR7RVZFTlRfS0VZfSR7REFUQV9BUElfS0VZfWBcbmNvbnN0IEVWRU5UX0NMSUNLX0RBVEFfQVBJID0gYGNsaWNrJHtFVkVOVF9LRVl9JHtEQVRBX0FQSV9LRVl9YFxuXG5jb25zdCBDTEFTU19OQU1FX0NBUk9VU0VMID0gJ2Nhcm91c2VsJ1xuY29uc3QgQ0xBU1NfTkFNRV9BQ1RJVkUgPSAnYWN0aXZlJ1xuY29uc3QgQ0xBU1NfTkFNRV9TTElERSA9ICdzbGlkZSdcbmNvbnN0IENMQVNTX05BTUVfRU5EID0gJ2Nhcm91c2VsLWl0ZW0tZW5kJ1xuY29uc3QgQ0xBU1NfTkFNRV9TVEFSVCA9ICdjYXJvdXNlbC1pdGVtLXN0YXJ0J1xuY29uc3QgQ0xBU1NfTkFNRV9ORVhUID0gJ2Nhcm91c2VsLWl0ZW0tbmV4dCdcbmNvbnN0IENMQVNTX05BTUVfUFJFViA9ICdjYXJvdXNlbC1pdGVtLXByZXYnXG5cbmNvbnN0IFNFTEVDVE9SX0FDVElWRSA9ICcuYWN0aXZlJ1xuY29uc3QgU0VMRUNUT1JfSVRFTSA9ICcuY2Fyb3VzZWwtaXRlbSdcbmNvbnN0IFNFTEVDVE9SX0FDVElWRV9JVEVNID0gU0VMRUNUT1JfQUNUSVZFICsgU0VMRUNUT1JfSVRFTVxuY29uc3QgU0VMRUNUT1JfSVRFTV9JTUcgPSAnLmNhcm91c2VsLWl0ZW0gaW1nJ1xuY29uc3QgU0VMRUNUT1JfSU5ESUNBVE9SUyA9ICcuY2Fyb3VzZWwtaW5kaWNhdG9ycydcbmNvbnN0IFNFTEVDVE9SX0RBVEFfU0xJREUgPSAnW2RhdGEtYnMtc2xpZGVdLCBbZGF0YS1icy1zbGlkZS10b10nXG5jb25zdCBTRUxFQ1RPUl9EQVRBX1JJREUgPSAnW2RhdGEtYnMtcmlkZT1cImNhcm91c2VsXCJdJ1xuXG5jb25zdCBLRVlfVE9fRElSRUNUSU9OID0ge1xuICBbQVJST1dfTEVGVF9LRVldOiBESVJFQ1RJT05fUklHSFQsXG4gIFtBUlJPV19SSUdIVF9LRVldOiBESVJFQ1RJT05fTEVGVFxufVxuXG5jb25zdCBEZWZhdWx0ID0ge1xuICBpbnRlcnZhbDogNTAwMCxcbiAga2V5Ym9hcmQ6IHRydWUsXG4gIHBhdXNlOiAnaG92ZXInLFxuICByaWRlOiBmYWxzZSxcbiAgdG91Y2g6IHRydWUsXG4gIHdyYXA6IHRydWVcbn1cblxuY29uc3QgRGVmYXVsdFR5cGUgPSB7XG4gIGludGVydmFsOiAnKG51bWJlcnxib29sZWFuKScsIC8vIFRPRE86djYgcmVtb3ZlIGJvb2xlYW4gc3VwcG9ydFxuICBrZXlib2FyZDogJ2Jvb2xlYW4nLFxuICBwYXVzZTogJyhzdHJpbmd8Ym9vbGVhbiknLFxuICByaWRlOiAnKGJvb2xlYW58c3RyaW5nKScsXG4gIHRvdWNoOiAnYm9vbGVhbicsXG4gIHdyYXA6ICdib29sZWFuJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBDYXJvdXNlbCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICBzdXBlcihlbGVtZW50LCBjb25maWcpXG5cbiAgICB0aGlzLl9pbnRlcnZhbCA9IG51bGxcbiAgICB0aGlzLl9hY3RpdmVFbGVtZW50ID0gbnVsbFxuICAgIHRoaXMuX2lzU2xpZGluZyA9IGZhbHNlXG4gICAgdGhpcy50b3VjaFRpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5fc3dpcGVIZWxwZXIgPSBudWxsXG5cbiAgICB0aGlzLl9pbmRpY2F0b3JzRWxlbWVudCA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoU0VMRUNUT1JfSU5ESUNBVE9SUywgdGhpcy5fZWxlbWVudClcbiAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpXG5cbiAgICBpZiAodGhpcy5fY29uZmlnLnJpZGUgPT09IENMQVNTX05BTUVfQ0FST1VTRUwpIHtcbiAgICAgIHRoaXMuY3ljbGUoKVxuICAgIH1cbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgbmV4dCgpIHtcbiAgICB0aGlzLl9zbGlkZShPUkRFUl9ORVhUKVxuICB9XG5cbiAgbmV4dFdoZW5WaXNpYmxlKCkge1xuICAgIC8vIEZJWE1FIFRPRE8gdXNlIGBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGVgXG4gICAgLy8gRG9uJ3QgY2FsbCBuZXh0IHdoZW4gdGhlIHBhZ2UgaXNuJ3QgdmlzaWJsZVxuICAgIC8vIG9yIHRoZSBjYXJvdXNlbCBvciBpdHMgcGFyZW50IGlzbid0IHZpc2libGVcbiAgICBpZiAoIWRvY3VtZW50LmhpZGRlbiAmJiBpc1Zpc2libGUodGhpcy5fZWxlbWVudCkpIHtcbiAgICAgIHRoaXMubmV4dCgpXG4gICAgfVxuICB9XG5cbiAgcHJldigpIHtcbiAgICB0aGlzLl9zbGlkZShPUkRFUl9QUkVWKVxuICB9XG5cbiAgcGF1c2UoKSB7XG4gICAgaWYgKHRoaXMuX2lzU2xpZGluZykge1xuICAgICAgdHJpZ2dlclRyYW5zaXRpb25FbmQodGhpcy5fZWxlbWVudClcbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhckludGVydmFsKClcbiAgfVxuXG4gIGN5Y2xlKCkge1xuICAgIHRoaXMuX2NsZWFySW50ZXJ2YWwoKVxuICAgIHRoaXMuX3VwZGF0ZUludGVydmFsKClcblxuICAgIHRoaXMuX2ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5uZXh0V2hlblZpc2libGUoKSwgdGhpcy5fY29uZmlnLmludGVydmFsKVxuICB9XG5cbiAgX21heWJlRW5hYmxlQ3ljbGUoKSB7XG4gICAgaWYgKCF0aGlzLl9jb25maWcucmlkZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2lzU2xpZGluZykge1xuICAgICAgRXZlbnRIYW5kbGVyLm9uZSh0aGlzLl9lbGVtZW50LCBFVkVOVF9TTElELCAoKSA9PiB0aGlzLmN5Y2xlKCkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmN5Y2xlKClcbiAgfVxuXG4gIHRvKGluZGV4KSB7XG4gICAgY29uc3QgaXRlbXMgPSB0aGlzLl9nZXRJdGVtcygpXG4gICAgaWYgKGluZGV4ID4gaXRlbXMubGVuZ3RoIC0gMSB8fCBpbmRleCA8IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLl9pc1NsaWRpbmcpIHtcbiAgICAgIEV2ZW50SGFuZGxlci5vbmUodGhpcy5fZWxlbWVudCwgRVZFTlRfU0xJRCwgKCkgPT4gdGhpcy50byhpbmRleCkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVJbmRleCA9IHRoaXMuX2dldEl0ZW1JbmRleCh0aGlzLl9nZXRBY3RpdmUoKSlcbiAgICBpZiAoYWN0aXZlSW5kZXggPT09IGluZGV4KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBvcmRlciA9IGluZGV4ID4gYWN0aXZlSW5kZXggPyBPUkRFUl9ORVhUIDogT1JERVJfUFJFVlxuXG4gICAgdGhpcy5fc2xpZGUob3JkZXIsIGl0ZW1zW2luZGV4XSlcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3N3aXBlSGVscGVyKSB7XG4gICAgICB0aGlzLl9zd2lwZUhlbHBlci5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKClcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKSB7XG4gICAgY29uZmlnLmRlZmF1bHRJbnRlcnZhbCA9IGNvbmZpZy5pbnRlcnZhbFxuICAgIHJldHVybiBjb25maWdcbiAgfVxuXG4gIF9hZGRFdmVudExpc3RlbmVycygpIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmtleWJvYXJkKSB7XG4gICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfS0VZRE9XTiwgZXZlbnQgPT4gdGhpcy5fa2V5ZG93bihldmVudCkpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5wYXVzZSA9PT0gJ2hvdmVyJykge1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIEVWRU5UX01PVVNFRU5URVIsICgpID0+IHRoaXMucGF1c2UoKSlcbiAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9NT1VTRUxFQVZFLCAoKSA9PiB0aGlzLl9tYXliZUVuYWJsZUN5Y2xlKCkpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy50b3VjaCAmJiBTd2lwZS5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICB0aGlzLl9hZGRUb3VjaEV2ZW50TGlzdGVuZXJzKClcbiAgICB9XG4gIH1cblxuICBfYWRkVG91Y2hFdmVudExpc3RlbmVycygpIHtcbiAgICBmb3IgKGNvbnN0IGltZyBvZiBTZWxlY3RvckVuZ2luZS5maW5kKFNFTEVDVE9SX0lURU1fSU1HLCB0aGlzLl9lbGVtZW50KSkge1xuICAgICAgRXZlbnRIYW5kbGVyLm9uKGltZywgRVZFTlRfRFJBR19TVEFSVCwgZXZlbnQgPT4gZXZlbnQucHJldmVudERlZmF1bHQoKSlcbiAgICB9XG5cbiAgICBjb25zdCBlbmRDYWxsQmFjayA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9jb25maWcucGF1c2UgIT09ICdob3ZlcicpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIC8vIElmIGl0J3MgYSB0b3VjaC1lbmFibGVkIGRldmljZSwgbW91c2VlbnRlci9sZWF2ZSBhcmUgZmlyZWQgYXNcbiAgICAgIC8vIHBhcnQgb2YgdGhlIG1vdXNlIGNvbXBhdGliaWxpdHkgZXZlbnRzIG9uIGZpcnN0IHRhcCAtIHRoZSBjYXJvdXNlbFxuICAgICAgLy8gd291bGQgc3RvcCBjeWNsaW5nIHVudGlsIHVzZXIgdGFwcGVkIG91dCBvZiBpdDtcbiAgICAgIC8vIGhlcmUsIHdlIGxpc3RlbiBmb3IgdG91Y2hlbmQsIGV4cGxpY2l0bHkgcGF1c2UgdGhlIGNhcm91c2VsXG4gICAgICAvLyAoYXMgaWYgaXQncyB0aGUgc2Vjb25kIHRpbWUgd2UgdGFwIG9uIGl0LCBtb3VzZWVudGVyIGNvbXBhdCBldmVudFxuICAgICAgLy8gaXMgTk9UIGZpcmVkKSBhbmQgYWZ0ZXIgYSB0aW1lb3V0ICh0byBhbGxvdyBmb3IgbW91c2UgY29tcGF0aWJpbGl0eVxuICAgICAgLy8gZXZlbnRzIHRvIGZpcmUpIHdlIGV4cGxpY2l0bHkgcmVzdGFydCBjeWNsaW5nXG5cbiAgICAgIHRoaXMucGF1c2UoKVxuICAgICAgaWYgKHRoaXMudG91Y2hUaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRvdWNoVGltZW91dClcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3VjaFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX21heWJlRW5hYmxlQ3ljbGUoKSwgVE9VQ0hFVkVOVF9DT01QQVRfV0FJVCArIHRoaXMuX2NvbmZpZy5pbnRlcnZhbClcbiAgICB9XG5cbiAgICBjb25zdCBzd2lwZUNvbmZpZyA9IHtcbiAgICAgIGxlZnRDYWxsYmFjazogKCkgPT4gdGhpcy5fc2xpZGUodGhpcy5fZGlyZWN0aW9uVG9PcmRlcihESVJFQ1RJT05fTEVGVCkpLFxuICAgICAgcmlnaHRDYWxsYmFjazogKCkgPT4gdGhpcy5fc2xpZGUodGhpcy5fZGlyZWN0aW9uVG9PcmRlcihESVJFQ1RJT05fUklHSFQpKSxcbiAgICAgIGVuZENhbGxiYWNrOiBlbmRDYWxsQmFja1xuICAgIH1cblxuICAgIHRoaXMuX3N3aXBlSGVscGVyID0gbmV3IFN3aXBlKHRoaXMuX2VsZW1lbnQsIHN3aXBlQ29uZmlnKVxuICB9XG5cbiAgX2tleWRvd24oZXZlbnQpIHtcbiAgICBpZiAoL2lucHV0fHRleHRhcmVhL2kudGVzdChldmVudC50YXJnZXQudGFnTmFtZSkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IEtFWV9UT19ESVJFQ1RJT05bZXZlbnQua2V5XVxuICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRoaXMuX3NsaWRlKHRoaXMuX2RpcmVjdGlvblRvT3JkZXIoZGlyZWN0aW9uKSlcbiAgICB9XG4gIH1cblxuICBfZ2V0SXRlbUluZGV4KGVsZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0SXRlbXMoKS5pbmRleE9mKGVsZW1lbnQpXG4gIH1cblxuICBfc2V0QWN0aXZlSW5kaWNhdG9yRWxlbWVudChpbmRleCkge1xuICAgIGlmICghdGhpcy5faW5kaWNhdG9yc0VsZW1lbnQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZUluZGljYXRvciA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoU0VMRUNUT1JfQUNUSVZFLCB0aGlzLl9pbmRpY2F0b3JzRWxlbWVudClcblxuICAgIGFjdGl2ZUluZGljYXRvci5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQUNUSVZFKVxuICAgIGFjdGl2ZUluZGljYXRvci5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcpXG5cbiAgICBjb25zdCBuZXdBY3RpdmVJbmRpY2F0b3IgPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKGBbZGF0YS1icy1zbGlkZS10bz1cIiR7aW5kZXh9XCJdYCwgdGhpcy5faW5kaWNhdG9yc0VsZW1lbnQpXG5cbiAgICBpZiAobmV3QWN0aXZlSW5kaWNhdG9yKSB7XG4gICAgICBuZXdBY3RpdmVJbmRpY2F0b3IuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0FDVElWRSlcbiAgICAgIG5ld0FjdGl2ZUluZGljYXRvci5zZXRBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcsICd0cnVlJylcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlSW50ZXJ2YWwoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2FjdGl2ZUVsZW1lbnQgfHwgdGhpcy5fZ2V0QWN0aXZlKClcblxuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudEludGVydmFsID0gTnVtYmVyLnBhcnNlSW50KGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWJzLWludGVydmFsJyksIDEwKVxuXG4gICAgdGhpcy5fY29uZmlnLmludGVydmFsID0gZWxlbWVudEludGVydmFsIHx8IHRoaXMuX2NvbmZpZy5kZWZhdWx0SW50ZXJ2YWxcbiAgfVxuXG4gIF9zbGlkZShvcmRlciwgZWxlbWVudCA9IG51bGwpIHtcbiAgICBpZiAodGhpcy5faXNTbGlkaW5nKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gdGhpcy5fZ2V0QWN0aXZlKClcbiAgICBjb25zdCBpc05leHQgPSBvcmRlciA9PT0gT1JERVJfTkVYVFxuICAgIGNvbnN0IG5leHRFbGVtZW50ID0gZWxlbWVudCB8fCBnZXROZXh0QWN0aXZlRWxlbWVudCh0aGlzLl9nZXRJdGVtcygpLCBhY3RpdmVFbGVtZW50LCBpc05leHQsIHRoaXMuX2NvbmZpZy53cmFwKVxuXG4gICAgaWYgKG5leHRFbGVtZW50ID09PSBhY3RpdmVFbGVtZW50KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBuZXh0RWxlbWVudEluZGV4ID0gdGhpcy5fZ2V0SXRlbUluZGV4KG5leHRFbGVtZW50KVxuXG4gICAgY29uc3QgdHJpZ2dlckV2ZW50ID0gZXZlbnROYW1lID0+IHtcbiAgICAgIHJldHVybiBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBldmVudE5hbWUsIHtcbiAgICAgICAgcmVsYXRlZFRhcmdldDogbmV4dEVsZW1lbnQsXG4gICAgICAgIGRpcmVjdGlvbjogdGhpcy5fb3JkZXJUb0RpcmVjdGlvbihvcmRlciksXG4gICAgICAgIGZyb206IHRoaXMuX2dldEl0ZW1JbmRleChhY3RpdmVFbGVtZW50KSxcbiAgICAgICAgdG86IG5leHRFbGVtZW50SW5kZXhcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3Qgc2xpZGVFdmVudCA9IHRyaWdnZXJFdmVudChFVkVOVF9TTElERSlcblxuICAgIGlmIChzbGlkZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghYWN0aXZlRWxlbWVudCB8fCAhbmV4dEVsZW1lbnQpIHtcbiAgICAgIC8vIFNvbWUgd2VpcmRuZXNzIGlzIGhhcHBlbmluZywgc28gd2UgYmFpbFxuICAgICAgLy8gVE9ETzogY2hhbmdlIHRlc3RzIHRoYXQgdXNlIGVtcHR5IGRpdnMgdG8gYXZvaWQgdGhpcyBjaGVja1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaXNDeWNsaW5nID0gQm9vbGVhbih0aGlzLl9pbnRlcnZhbClcbiAgICB0aGlzLnBhdXNlKClcblxuICAgIHRoaXMuX2lzU2xpZGluZyA9IHRydWVcblxuICAgIHRoaXMuX3NldEFjdGl2ZUluZGljYXRvckVsZW1lbnQobmV4dEVsZW1lbnRJbmRleClcbiAgICB0aGlzLl9hY3RpdmVFbGVtZW50ID0gbmV4dEVsZW1lbnRcblxuICAgIGNvbnN0IGRpcmVjdGlvbmFsQ2xhc3NOYW1lID0gaXNOZXh0ID8gQ0xBU1NfTkFNRV9TVEFSVCA6IENMQVNTX05BTUVfRU5EXG4gICAgY29uc3Qgb3JkZXJDbGFzc05hbWUgPSBpc05leHQgPyBDTEFTU19OQU1FX05FWFQgOiBDTEFTU19OQU1FX1BSRVZcblxuICAgIG5leHRFbGVtZW50LmNsYXNzTGlzdC5hZGQob3JkZXJDbGFzc05hbWUpXG5cbiAgICByZWZsb3cobmV4dEVsZW1lbnQpXG5cbiAgICBhY3RpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoZGlyZWN0aW9uYWxDbGFzc05hbWUpXG4gICAgbmV4dEVsZW1lbnQuY2xhc3NMaXN0LmFkZChkaXJlY3Rpb25hbENsYXNzTmFtZSlcblxuICAgIGNvbnN0IGNvbXBsZXRlQ2FsbEJhY2sgPSAoKSA9PiB7XG4gICAgICBuZXh0RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGRpcmVjdGlvbmFsQ2xhc3NOYW1lLCBvcmRlckNsYXNzTmFtZSlcbiAgICAgIG5leHRFbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9BQ1RJVkUpXG5cbiAgICAgIGFjdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX0FDVElWRSwgb3JkZXJDbGFzc05hbWUsIGRpcmVjdGlvbmFsQ2xhc3NOYW1lKVxuXG4gICAgICB0aGlzLl9pc1NsaWRpbmcgPSBmYWxzZVxuXG4gICAgICB0cmlnZ2VyRXZlbnQoRVZFTlRfU0xJRClcbiAgICB9XG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlQ2FsbEJhY2ssIGFjdGl2ZUVsZW1lbnQsIHRoaXMuX2lzQW5pbWF0ZWQoKSlcblxuICAgIGlmIChpc0N5Y2xpbmcpIHtcbiAgICAgIHRoaXMuY3ljbGUoKVxuICAgIH1cbiAgfVxuXG4gIF9pc0FuaW1hdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX1NMSURFKVxuICB9XG5cbiAgX2dldEFjdGl2ZSgpIHtcbiAgICByZXR1cm4gU2VsZWN0b3JFbmdpbmUuZmluZE9uZShTRUxFQ1RPUl9BQ1RJVkVfSVRFTSwgdGhpcy5fZWxlbWVudClcbiAgfVxuXG4gIF9nZXRJdGVtcygpIHtcbiAgICByZXR1cm4gU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9JVEVNLCB0aGlzLl9lbGVtZW50KVxuICB9XG5cbiAgX2NsZWFySW50ZXJ2YWwoKSB7XG4gICAgaWYgKHRoaXMuX2ludGVydmFsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuX2ludGVydmFsKVxuICAgICAgdGhpcy5faW50ZXJ2YWwgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgX2RpcmVjdGlvblRvT3JkZXIoZGlyZWN0aW9uKSB7XG4gICAgaWYgKGlzUlRMKCkpIHtcbiAgICAgIHJldHVybiBkaXJlY3Rpb24gPT09IERJUkVDVElPTl9MRUZUID8gT1JERVJfUFJFViA6IE9SREVSX05FWFRcbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aW9uID09PSBESVJFQ1RJT05fTEVGVCA/IE9SREVSX05FWFQgOiBPUkRFUl9QUkVWXG4gIH1cblxuICBfb3JkZXJUb0RpcmVjdGlvbihvcmRlcikge1xuICAgIGlmIChpc1JUTCgpKSB7XG4gICAgICByZXR1cm4gb3JkZXIgPT09IE9SREVSX1BSRVYgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVFxuICAgIH1cblxuICAgIHJldHVybiBvcmRlciA9PT0gT1JERVJfUFJFViA/IERJUkVDVElPTl9SSUdIVCA6IERJUkVDVElPTl9MRUZUXG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBDYXJvdXNlbC5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZylcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGRhdGEudG8oY29uZmlnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChkYXRhW2NvbmZpZ10gPT09IHVuZGVmaW5lZCB8fCBjb25maWcuc3RhcnRzV2l0aCgnXycpIHx8IGNvbmZpZyA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYClcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGFbY29uZmlnXSgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gKi9cblxuRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9DTElDS19EQVRBX0FQSSwgU0VMRUNUT1JfREFUQV9TTElERSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnN0IHRhcmdldCA9IFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IodGhpcylcblxuICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0NBUk9VU0VMKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gIGNvbnN0IGNhcm91c2VsID0gQ2Fyb3VzZWwuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0YXJnZXQpXG4gIGNvbnN0IHNsaWRlSW5kZXggPSB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1icy1zbGlkZS10bycpXG5cbiAgaWYgKHNsaWRlSW5kZXgpIHtcbiAgICBjYXJvdXNlbC50byhzbGlkZUluZGV4KVxuICAgIGNhcm91c2VsLl9tYXliZUVuYWJsZUN5Y2xlKClcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChNYW5pcHVsYXRvci5nZXREYXRhQXR0cmlidXRlKHRoaXMsICdzbGlkZScpID09PSAnbmV4dCcpIHtcbiAgICBjYXJvdXNlbC5uZXh0KClcbiAgICBjYXJvdXNlbC5fbWF5YmVFbmFibGVDeWNsZSgpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjYXJvdXNlbC5wcmV2KClcbiAgY2Fyb3VzZWwuX21heWJlRW5hYmxlQ3ljbGUoKVxufSlcblxuRXZlbnRIYW5kbGVyLm9uKHdpbmRvdywgRVZFTlRfTE9BRF9EQVRBX0FQSSwgKCkgPT4ge1xuICBjb25zdCBjYXJvdXNlbHMgPSBTZWxlY3RvckVuZ2luZS5maW5kKFNFTEVDVE9SX0RBVEFfUklERSlcblxuICBmb3IgKGNvbnN0IGNhcm91c2VsIG9mIGNhcm91c2Vscykge1xuICAgIENhcm91c2VsLmdldE9yQ3JlYXRlSW5zdGFuY2UoY2Fyb3VzZWwpXG4gIH1cbn0pXG5cbi8qKlxuICogalF1ZXJ5XG4gKi9cblxuZGVmaW5lSlF1ZXJ5UGx1Z2luKENhcm91c2VsKVxuXG5leHBvcnQgZGVmYXVsdCBDYXJvdXNlbFxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCBjb2xsYXBzZS5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vYmFzZS1jb21wb25lbnQuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi9kb20vc2VsZWN0b3ItZW5naW5lLmpzJ1xuaW1wb3J0IHtcbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luLFxuICBnZXRFbGVtZW50LFxuICByZWZsb3dcbn0gZnJvbSAnLi91dGlsL2luZGV4LmpzJ1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IE5BTUUgPSAnY29sbGFwc2UnXG5jb25zdCBEQVRBX0tFWSA9ICdicy5jb2xsYXBzZSdcbmNvbnN0IEVWRU5UX0tFWSA9IGAuJHtEQVRBX0tFWX1gXG5jb25zdCBEQVRBX0FQSV9LRVkgPSAnLmRhdGEtYXBpJ1xuXG5jb25zdCBFVkVOVF9TSE9XID0gYHNob3cke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9TSE9XTiA9IGBzaG93biR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0hJREUgPSBgaGlkZSR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0hJRERFTiA9IGBoaWRkZW4ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9DTElDS19EQVRBX0FQSSA9IGBjbGljayR7RVZFTlRfS0VZfSR7REFUQV9BUElfS0VZfWBcblxuY29uc3QgQ0xBU1NfTkFNRV9TSE9XID0gJ3Nob3cnXG5jb25zdCBDTEFTU19OQU1FX0NPTExBUFNFID0gJ2NvbGxhcHNlJ1xuY29uc3QgQ0xBU1NfTkFNRV9DT0xMQVBTSU5HID0gJ2NvbGxhcHNpbmcnXG5jb25zdCBDTEFTU19OQU1FX0NPTExBUFNFRCA9ICdjb2xsYXBzZWQnXG5jb25zdCBDTEFTU19OQU1FX0RFRVBFUl9DSElMRFJFTiA9IGA6c2NvcGUgLiR7Q0xBU1NfTkFNRV9DT0xMQVBTRX0gLiR7Q0xBU1NfTkFNRV9DT0xMQVBTRX1gXG5jb25zdCBDTEFTU19OQU1FX0hPUklaT05UQUwgPSAnY29sbGFwc2UtaG9yaXpvbnRhbCdcblxuY29uc3QgV0lEVEggPSAnd2lkdGgnXG5jb25zdCBIRUlHSFQgPSAnaGVpZ2h0J1xuXG5jb25zdCBTRUxFQ1RPUl9BQ1RJVkVTID0gJy5jb2xsYXBzZS5zaG93LCAuY29sbGFwc2UuY29sbGFwc2luZydcbmNvbnN0IFNFTEVDVE9SX0RBVEFfVE9HR0xFID0gJ1tkYXRhLWJzLXRvZ2dsZT1cImNvbGxhcHNlXCJdJ1xuXG5jb25zdCBEZWZhdWx0ID0ge1xuICBwYXJlbnQ6IG51bGwsXG4gIHRvZ2dsZTogdHJ1ZVxufVxuXG5jb25zdCBEZWZhdWx0VHlwZSA9IHtcbiAgcGFyZW50OiAnKG51bGx8ZWxlbWVudCknLFxuICB0b2dnbGU6ICdib29sZWFuJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBDb2xsYXBzZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICBzdXBlcihlbGVtZW50LCBjb25maWcpXG5cbiAgICB0aGlzLl9pc1RyYW5zaXRpb25pbmcgPSBmYWxzZVxuICAgIHRoaXMuX3RyaWdnZXJBcnJheSA9IFtdXG5cbiAgICBjb25zdCB0b2dnbGVMaXN0ID0gU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9EQVRBX1RPR0dMRSlcblxuICAgIGZvciAoY29uc3QgZWxlbSBvZiB0b2dnbGVMaXN0KSB7XG4gICAgICBjb25zdCBzZWxlY3RvciA9IFNlbGVjdG9yRW5naW5lLmdldFNlbGVjdG9yRnJvbUVsZW1lbnQoZWxlbSlcbiAgICAgIGNvbnN0IGZpbHRlckVsZW1lbnQgPSBTZWxlY3RvckVuZ2luZS5maW5kKHNlbGVjdG9yKVxuICAgICAgICAuZmlsdGVyKGZvdW5kRWxlbWVudCA9PiBmb3VuZEVsZW1lbnQgPT09IHRoaXMuX2VsZW1lbnQpXG5cbiAgICAgIGlmIChzZWxlY3RvciAhPT0gbnVsbCAmJiBmaWx0ZXJFbGVtZW50Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLl90cmlnZ2VyQXJyYXkucHVzaChlbGVtKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2luaXRpYWxpemVDaGlsZHJlbigpXG5cbiAgICBpZiAoIXRoaXMuX2NvbmZpZy5wYXJlbnQpIHtcbiAgICAgIHRoaXMuX2FkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLl90cmlnZ2VyQXJyYXksIHRoaXMuX2lzU2hvd24oKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY29uZmlnLnRvZ2dsZSkge1xuICAgICAgdGhpcy50b2dnbGUoKVxuICAgIH1cbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLl9pc1Nob3duKCkpIHtcbiAgICAgIHRoaXMuaGlkZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2hvdygpXG4gICAgfVxuICB9XG5cbiAgc2hvdygpIHtcbiAgICBpZiAodGhpcy5faXNUcmFuc2l0aW9uaW5nIHx8IHRoaXMuX2lzU2hvd24oKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IGFjdGl2ZUNoaWxkcmVuID0gW11cblxuICAgIC8vIGZpbmQgYWN0aXZlIGNoaWxkcmVuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5wYXJlbnQpIHtcbiAgICAgIGFjdGl2ZUNoaWxkcmVuID0gdGhpcy5fZ2V0Rmlyc3RMZXZlbENoaWxkcmVuKFNFTEVDVE9SX0FDVElWRVMpXG4gICAgICAgIC5maWx0ZXIoZWxlbWVudCA9PiBlbGVtZW50ICE9PSB0aGlzLl9lbGVtZW50KVxuICAgICAgICAubWFwKGVsZW1lbnQgPT4gQ29sbGFwc2UuZ2V0T3JDcmVhdGVJbnN0YW5jZShlbGVtZW50LCB7IHRvZ2dsZTogZmFsc2UgfSkpXG4gICAgfVxuXG4gICAgaWYgKGFjdGl2ZUNoaWxkcmVuLmxlbmd0aCAmJiBhY3RpdmVDaGlsZHJlblswXS5faXNUcmFuc2l0aW9uaW5nKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzdGFydEV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPVylcbiAgICBpZiAoc3RhcnRFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGFjdGl2ZUluc3RhbmNlIG9mIGFjdGl2ZUNoaWxkcmVuKSB7XG4gICAgICBhY3RpdmVJbnN0YW5jZS5oaWRlKClcbiAgICB9XG5cbiAgICBjb25zdCBkaW1lbnNpb24gPSB0aGlzLl9nZXREaW1lbnNpb24oKVxuXG4gICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQ09MTEFQU0UpXG4gICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQ09MTEFQU0lORylcblxuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9IDBcblxuICAgIHRoaXMuX2FkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLl90cmlnZ2VyQXJyYXksIHRydWUpXG4gICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gdHJ1ZVxuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICB0aGlzLl9pc1RyYW5zaXRpb25pbmcgPSBmYWxzZVxuXG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9DT0xMQVBTSU5HKVxuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQ09MTEFQU0UsIENMQVNTX05BTUVfU0hPVylcblxuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZVtkaW1lbnNpb25dID0gJydcblxuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPV04pXG4gICAgfVxuXG4gICAgY29uc3QgY2FwaXRhbGl6ZWREaW1lbnNpb24gPSBkaW1lbnNpb25bMF0udG9VcHBlckNhc2UoKSArIGRpbWVuc2lvbi5zbGljZSgxKVxuICAgIGNvbnN0IHNjcm9sbFNpemUgPSBgc2Nyb2xsJHtjYXBpdGFsaXplZERpbWVuc2lvbn1gXG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCB0aGlzLl9lbGVtZW50LCB0cnVlKVxuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9IGAke3RoaXMuX2VsZW1lbnRbc2Nyb2xsU2l6ZV19cHhgXG4gIH1cblxuICBoaWRlKCkge1xuICAgIGlmICh0aGlzLl9pc1RyYW5zaXRpb25pbmcgfHwgIXRoaXMuX2lzU2hvd24oKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJREUpXG4gICAgaWYgKHN0YXJ0RXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZGltZW5zaW9uID0gdGhpcy5fZ2V0RGltZW5zaW9uKClcblxuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9IGAke3RoaXMuX2VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClbZGltZW5zaW9uXX1weGBcblxuICAgIHJlZmxvdyh0aGlzLl9lbGVtZW50KVxuXG4gICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQ09MTEFQU0lORylcbiAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9DT0xMQVBTRSwgQ0xBU1NfTkFNRV9TSE9XKVxuXG4gICAgZm9yIChjb25zdCB0cmlnZ2VyIG9mIHRoaXMuX3RyaWdnZXJBcnJheSkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IodHJpZ2dlcilcblxuICAgICAgaWYgKGVsZW1lbnQgJiYgIXRoaXMuX2lzU2hvd24oZWxlbWVudCkpIHtcbiAgICAgICAgdGhpcy5fYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKFt0cmlnZ2VyXSwgZmFsc2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gdHJ1ZVxuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICB0aGlzLl9pc1RyYW5zaXRpb25pbmcgPSBmYWxzZVxuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQ09MTEFQU0lORylcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0NPTExBUFNFKVxuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElEREVOKVxuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGVbZGltZW5zaW9uXSA9ICcnXG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCB0aGlzLl9lbGVtZW50LCB0cnVlKVxuICB9XG5cbiAgX2lzU2hvd24oZWxlbWVudCA9IHRoaXMuX2VsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9TSE9XKVxuICB9XG5cbiAgLy8gUHJpdmF0ZVxuICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICBjb25maWcudG9nZ2xlID0gQm9vbGVhbihjb25maWcudG9nZ2xlKSAvLyBDb2VyY2Ugc3RyaW5nIHZhbHVlc1xuICAgIGNvbmZpZy5wYXJlbnQgPSBnZXRFbGVtZW50KGNvbmZpZy5wYXJlbnQpXG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgX2dldERpbWVuc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9IT1JJWk9OVEFMKSA/IFdJRFRIIDogSEVJR0hUXG4gIH1cblxuICBfaW5pdGlhbGl6ZUNoaWxkcmVuKCkge1xuICAgIGlmICghdGhpcy5fY29uZmlnLnBhcmVudCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRGaXJzdExldmVsQ2hpbGRyZW4oU0VMRUNUT1JfREFUQV9UT0dHTEUpXG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgY2hpbGRyZW4pIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkID0gU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3RvcihlbGVtZW50KVxuXG4gICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5fYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKFtlbGVtZW50XSwgdGhpcy5faXNTaG93bihzZWxlY3RlZCkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2dldEZpcnN0TGV2ZWxDaGlsZHJlbihzZWxlY3Rvcikge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gU2VsZWN0b3JFbmdpbmUuZmluZChDTEFTU19OQU1FX0RFRVBFUl9DSElMRFJFTiwgdGhpcy5fY29uZmlnLnBhcmVudClcbiAgICAvLyByZW1vdmUgY2hpbGRyZW4gaWYgZ3JlYXRlciBkZXB0aFxuICAgIHJldHVybiBTZWxlY3RvckVuZ2luZS5maW5kKHNlbGVjdG9yLCB0aGlzLl9jb25maWcucGFyZW50KS5maWx0ZXIoZWxlbWVudCA9PiAhY2hpbGRyZW4uaW5jbHVkZXMoZWxlbWVudCkpXG4gIH1cblxuICBfYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRyaWdnZXJBcnJheSwgaXNPcGVuKSB7XG4gICAgaWYgKCF0cmlnZ2VyQXJyYXkubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdHJpZ2dlckFycmF5KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoQ0xBU1NfTkFNRV9DT0xMQVBTRUQsICFpc09wZW4pXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICBjb25zdCBfY29uZmlnID0ge31cbiAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycgJiYgL3Nob3d8aGlkZS8udGVzdChjb25maWcpKSB7XG4gICAgICBfY29uZmlnLnRvZ2dsZSA9IGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkYXRhID0gQ29sbGFwc2UuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0aGlzLCBfY29uZmlnKVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2NvbmZpZ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgTm8gbWV0aG9kIG5hbWVkIFwiJHtjb25maWd9XCJgKVxuICAgICAgICB9XG5cbiAgICAgICAgZGF0YVtjb25maWddKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogRGF0YSBBUEkgaW1wbGVtZW50YXRpb25cbiAqL1xuXG5FdmVudEhhbmRsZXIub24oZG9jdW1lbnQsIEVWRU5UX0NMSUNLX0RBVEFfQVBJLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gIC8vIHByZXZlbnREZWZhdWx0IG9ubHkgZm9yIDxhPiBlbGVtZW50cyAod2hpY2ggY2hhbmdlIHRoZSBVUkwpIG5vdCBpbnNpZGUgdGhlIGNvbGxhcHNpYmxlIGVsZW1lbnRcbiAgaWYgKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSAnQScgfHwgKGV2ZW50LmRlbGVnYXRlVGFyZ2V0ICYmIGV2ZW50LmRlbGVnYXRlVGFyZ2V0LnRhZ05hbWUgPT09ICdBJykpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgU2VsZWN0b3JFbmdpbmUuZ2V0TXVsdGlwbGVFbGVtZW50c0Zyb21TZWxlY3Rvcih0aGlzKSkge1xuICAgIENvbGxhcHNlLmdldE9yQ3JlYXRlSW5zdGFuY2UoZWxlbWVudCwgeyB0b2dnbGU6IGZhbHNlIH0pLnRvZ2dsZSgpXG4gIH1cbn0pXG5cbi8qKlxuICogalF1ZXJ5XG4gKi9cblxuZGVmaW5lSlF1ZXJ5UGx1Z2luKENvbGxhcHNlKVxuXG5leHBvcnQgZGVmYXVsdCBDb2xsYXBzZVxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCBkcm9wZG93bi5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCAqIGFzIFBvcHBlciBmcm9tICdAcG9wcGVyanMvY29yZSdcbmltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vYmFzZS1jb21wb25lbnQuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgTWFuaXB1bGF0b3IgZnJvbSAnLi9kb20vbWFuaXB1bGF0b3IuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi9kb20vc2VsZWN0b3ItZW5naW5lLmpzJ1xuaW1wb3J0IHtcbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luLFxuICBleGVjdXRlLFxuICBnZXRFbGVtZW50LFxuICBnZXROZXh0QWN0aXZlRWxlbWVudCxcbiAgaXNEaXNhYmxlZCxcbiAgaXNFbGVtZW50LFxuICBpc1JUTCxcbiAgaXNWaXNpYmxlLFxuICBub29wXG59IGZyb20gJy4vdXRpbC9pbmRleC5qcydcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG5jb25zdCBOQU1FID0gJ2Ryb3Bkb3duJ1xuY29uc3QgREFUQV9LRVkgPSAnYnMuZHJvcGRvd24nXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuY29uc3QgREFUQV9BUElfS0VZID0gJy5kYXRhLWFwaSdcblxuY29uc3QgRVNDQVBFX0tFWSA9ICdFc2NhcGUnXG5jb25zdCBUQUJfS0VZID0gJ1RhYidcbmNvbnN0IEFSUk9XX1VQX0tFWSA9ICdBcnJvd1VwJ1xuY29uc3QgQVJST1dfRE9XTl9LRVkgPSAnQXJyb3dEb3duJ1xuY29uc3QgUklHSFRfTU9VU0VfQlVUVE9OID0gMiAvLyBNb3VzZUV2ZW50LmJ1dHRvbiB2YWx1ZSBmb3IgdGhlIHNlY29uZGFyeSBidXR0b24sIHVzdWFsbHkgdGhlIHJpZ2h0IGJ1dHRvblxuXG5jb25zdCBFVkVOVF9ISURFID0gYGhpZGUke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9ISURERU4gPSBgaGlkZGVuJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfU0hPVyA9IGBzaG93JHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfU0hPV04gPSBgc2hvd24ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9DTElDS19EQVRBX0FQSSA9IGBjbGljayR7RVZFTlRfS0VZfSR7REFUQV9BUElfS0VZfWBcbmNvbnN0IEVWRU5UX0tFWURPV05fREFUQV9BUEkgPSBga2V5ZG93biR7RVZFTlRfS0VZfSR7REFUQV9BUElfS0VZfWBcbmNvbnN0IEVWRU5UX0tFWVVQX0RBVEFfQVBJID0gYGtleXVwJHtFVkVOVF9LRVl9JHtEQVRBX0FQSV9LRVl9YFxuXG5jb25zdCBDTEFTU19OQU1FX1NIT1cgPSAnc2hvdydcbmNvbnN0IENMQVNTX05BTUVfRFJPUFVQID0gJ2Ryb3B1cCdcbmNvbnN0IENMQVNTX05BTUVfRFJPUEVORCA9ICdkcm9wZW5kJ1xuY29uc3QgQ0xBU1NfTkFNRV9EUk9QU1RBUlQgPSAnZHJvcHN0YXJ0J1xuY29uc3QgQ0xBU1NfTkFNRV9EUk9QVVBfQ0VOVEVSID0gJ2Ryb3B1cC1jZW50ZXInXG5jb25zdCBDTEFTU19OQU1FX0RST1BET1dOX0NFTlRFUiA9ICdkcm9wZG93bi1jZW50ZXInXG5cbmNvbnN0IFNFTEVDVE9SX0RBVEFfVE9HR0xFID0gJ1tkYXRhLWJzLXRvZ2dsZT1cImRyb3Bkb3duXCJdOm5vdCguZGlzYWJsZWQpOm5vdCg6ZGlzYWJsZWQpJ1xuY29uc3QgU0VMRUNUT1JfREFUQV9UT0dHTEVfU0hPV04gPSBgJHtTRUxFQ1RPUl9EQVRBX1RPR0dMRX0uJHtDTEFTU19OQU1FX1NIT1d9YFxuY29uc3QgU0VMRUNUT1JfTUVOVSA9ICcuZHJvcGRvd24tbWVudSdcbmNvbnN0IFNFTEVDVE9SX05BVkJBUiA9ICcubmF2YmFyJ1xuY29uc3QgU0VMRUNUT1JfTkFWQkFSX05BViA9ICcubmF2YmFyLW5hdidcbmNvbnN0IFNFTEVDVE9SX1ZJU0lCTEVfSVRFTVMgPSAnLmRyb3Bkb3duLW1lbnUgLmRyb3Bkb3duLWl0ZW06bm90KC5kaXNhYmxlZCk6bm90KDpkaXNhYmxlZCknXG5cbmNvbnN0IFBMQUNFTUVOVF9UT1AgPSBpc1JUTCgpID8gJ3RvcC1lbmQnIDogJ3RvcC1zdGFydCdcbmNvbnN0IFBMQUNFTUVOVF9UT1BFTkQgPSBpc1JUTCgpID8gJ3RvcC1zdGFydCcgOiAndG9wLWVuZCdcbmNvbnN0IFBMQUNFTUVOVF9CT1RUT00gPSBpc1JUTCgpID8gJ2JvdHRvbS1lbmQnIDogJ2JvdHRvbS1zdGFydCdcbmNvbnN0IFBMQUNFTUVOVF9CT1RUT01FTkQgPSBpc1JUTCgpID8gJ2JvdHRvbS1zdGFydCcgOiAnYm90dG9tLWVuZCdcbmNvbnN0IFBMQUNFTUVOVF9SSUdIVCA9IGlzUlRMKCkgPyAnbGVmdC1zdGFydCcgOiAncmlnaHQtc3RhcnQnXG5jb25zdCBQTEFDRU1FTlRfTEVGVCA9IGlzUlRMKCkgPyAncmlnaHQtc3RhcnQnIDogJ2xlZnQtc3RhcnQnXG5jb25zdCBQTEFDRU1FTlRfVE9QQ0VOVEVSID0gJ3RvcCdcbmNvbnN0IFBMQUNFTUVOVF9CT1RUT01DRU5URVIgPSAnYm90dG9tJ1xuXG5jb25zdCBEZWZhdWx0ID0ge1xuICBhdXRvQ2xvc2U6IHRydWUsXG4gIGJvdW5kYXJ5OiAnY2xpcHBpbmdQYXJlbnRzJyxcbiAgZGlzcGxheTogJ2R5bmFtaWMnLFxuICBvZmZzZXQ6IFswLCAyXSxcbiAgcG9wcGVyQ29uZmlnOiBudWxsLFxuICByZWZlcmVuY2U6ICd0b2dnbGUnXG59XG5cbmNvbnN0IERlZmF1bHRUeXBlID0ge1xuICBhdXRvQ2xvc2U6ICcoYm9vbGVhbnxzdHJpbmcpJyxcbiAgYm91bmRhcnk6ICcoc3RyaW5nfGVsZW1lbnQpJyxcbiAgZGlzcGxheTogJ3N0cmluZycsXG4gIG9mZnNldDogJyhhcnJheXxzdHJpbmd8ZnVuY3Rpb24pJyxcbiAgcG9wcGVyQ29uZmlnOiAnKG51bGx8b2JqZWN0fGZ1bmN0aW9uKScsXG4gIHJlZmVyZW5jZTogJyhzdHJpbmd8ZWxlbWVudHxvYmplY3QpJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBEcm9wZG93biBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICBzdXBlcihlbGVtZW50LCBjb25maWcpXG5cbiAgICB0aGlzLl9wb3BwZXIgPSBudWxsXG4gICAgdGhpcy5fcGFyZW50ID0gdGhpcy5fZWxlbWVudC5wYXJlbnROb2RlIC8vIGRyb3Bkb3duIHdyYXBwZXJcbiAgICAvLyBUT0RPOiB2NiByZXZlcnQgIzM3MDExICYgY2hhbmdlIG1hcmt1cCBodHRwczovL2dldGJvb3RzdHJhcC5jb20vZG9jcy81LjMvZm9ybXMvaW5wdXQtZ3JvdXAvXG4gICAgdGhpcy5fbWVudSA9IFNlbGVjdG9yRW5naW5lLm5leHQodGhpcy5fZWxlbWVudCwgU0VMRUNUT1JfTUVOVSlbMF0gfHxcbiAgICAgIFNlbGVjdG9yRW5naW5lLnByZXYodGhpcy5fZWxlbWVudCwgU0VMRUNUT1JfTUVOVSlbMF0gfHxcbiAgICAgIFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoU0VMRUNUT1JfTUVOVSwgdGhpcy5fcGFyZW50KVxuICAgIHRoaXMuX2luTmF2YmFyID0gdGhpcy5fZGV0ZWN0TmF2YmFyKClcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgdG9nZ2xlKCkge1xuICAgIHJldHVybiB0aGlzLl9pc1Nob3duKCkgPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdygpXG4gIH1cblxuICBzaG93KCkge1xuICAgIGlmIChpc0Rpc2FibGVkKHRoaXMuX2VsZW1lbnQpIHx8IHRoaXMuX2lzU2hvd24oKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXRlZFRhcmdldCA9IHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6IHRoaXMuX2VsZW1lbnRcbiAgICB9XG5cbiAgICBjb25zdCBzaG93RXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XLCByZWxhdGVkVGFyZ2V0KVxuXG4gICAgaWYgKHNob3dFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9jcmVhdGVQb3BwZXIoKVxuXG4gICAgLy8gSWYgdGhpcyBpcyBhIHRvdWNoLWVuYWJsZWQgZGV2aWNlIHdlIGFkZCBleHRyYVxuICAgIC8vIGVtcHR5IG1vdXNlb3ZlciBsaXN0ZW5lcnMgdG8gdGhlIGJvZHkncyBpbW1lZGlhdGUgY2hpbGRyZW47XG4gICAgLy8gb25seSBuZWVkZWQgYmVjYXVzZSBvZiBicm9rZW4gZXZlbnQgZGVsZWdhdGlvbiBvbiBpT1NcbiAgICAvLyBodHRwczovL3d3dy5xdWlya3Ntb2RlLm9yZy9ibG9nL2FyY2hpdmVzLzIwMTQvMDIvbW91c2VfZXZlbnRfYnViLmh0bWxcbiAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICF0aGlzLl9wYXJlbnQuY2xvc2VzdChTRUxFQ1RPUl9OQVZCQVJfTkFWKSkge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIFtdLmNvbmNhdCguLi5kb2N1bWVudC5ib2R5LmNoaWxkcmVuKSkge1xuICAgICAgICBFdmVudEhhbmRsZXIub24oZWxlbWVudCwgJ21vdXNlb3ZlcicsIG5vb3ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudC5mb2N1cygpXG4gICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuXG4gICAgdGhpcy5fbWVudS5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVylcbiAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XKVxuICAgIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1NIT1dOLCByZWxhdGVkVGFyZ2V0KVxuICB9XG5cbiAgaGlkZSgpIHtcbiAgICBpZiAoaXNEaXNhYmxlZCh0aGlzLl9lbGVtZW50KSB8fCAhdGhpcy5faXNTaG93bigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCByZWxhdGVkVGFyZ2V0ID0ge1xuICAgICAgcmVsYXRlZFRhcmdldDogdGhpcy5fZWxlbWVudFxuICAgIH1cblxuICAgIHRoaXMuX2NvbXBsZXRlSGlkZShyZWxhdGVkVGFyZ2V0KVxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fcG9wcGVyKSB7XG4gICAgICB0aGlzLl9wb3BwZXIuZGVzdHJveSgpXG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpXG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy5faW5OYXZiYXIgPSB0aGlzLl9kZXRlY3ROYXZiYXIoKVxuICAgIGlmICh0aGlzLl9wb3BwZXIpIHtcbiAgICAgIHRoaXMuX3BvcHBlci51cGRhdGUoKVxuICAgIH1cbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2NvbXBsZXRlSGlkZShyZWxhdGVkVGFyZ2V0KSB7XG4gICAgY29uc3QgaGlkZUV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElERSwgcmVsYXRlZFRhcmdldClcbiAgICBpZiAoaGlkZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIHRoaXMgaXMgYSB0b3VjaC1lbmFibGVkIGRldmljZSB3ZSByZW1vdmUgdGhlIGV4dHJhXG4gICAgLy8gZW1wdHkgbW91c2VvdmVyIGxpc3RlbmVycyB3ZSBhZGRlZCBmb3IgaU9TIHN1cHBvcnRcbiAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSB7XG4gICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgW10uY29uY2F0KC4uLmRvY3VtZW50LmJvZHkuY2hpbGRyZW4pKSB7XG4gICAgICAgIEV2ZW50SGFuZGxlci5vZmYoZWxlbWVudCwgJ21vdXNlb3ZlcicsIG5vb3ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3BvcHBlcikge1xuICAgICAgdGhpcy5fcG9wcGVyLmRlc3Ryb3koKVxuICAgIH1cblxuICAgIHRoaXMuX21lbnUuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1cpXG4gICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVylcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXG4gICAgTWFuaXB1bGF0b3IucmVtb3ZlRGF0YUF0dHJpYnV0ZSh0aGlzLl9tZW51LCAncG9wcGVyJylcbiAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURERU4sIHJlbGF0ZWRUYXJnZXQpXG4gIH1cblxuICBfZ2V0Q29uZmlnKGNvbmZpZykge1xuICAgIGNvbmZpZyA9IHN1cGVyLl9nZXRDb25maWcoY29uZmlnKVxuXG4gICAgaWYgKHR5cGVvZiBjb25maWcucmVmZXJlbmNlID09PSAnb2JqZWN0JyAmJiAhaXNFbGVtZW50KGNvbmZpZy5yZWZlcmVuY2UpICYmXG4gICAgICB0eXBlb2YgY29uZmlnLnJlZmVyZW5jZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QgIT09ICdmdW5jdGlvbidcbiAgICApIHtcbiAgICAgIC8vIFBvcHBlciB2aXJ0dWFsIGVsZW1lbnRzIHJlcXVpcmUgYSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgbWV0aG9kXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke05BTUUudG9VcHBlckNhc2UoKX06IE9wdGlvbiBcInJlZmVyZW5jZVwiIHByb3ZpZGVkIHR5cGUgXCJvYmplY3RcIiB3aXRob3V0IGEgcmVxdWlyZWQgXCJnZXRCb3VuZGluZ0NsaWVudFJlY3RcIiBtZXRob2QuYClcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnXG4gIH1cblxuICBfY3JlYXRlUG9wcGVyKCkge1xuICAgIGlmICh0eXBlb2YgUG9wcGVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9vdHN0cmFwXFwncyBkcm9wZG93bnMgcmVxdWlyZSBQb3BwZXIgKGh0dHBzOi8vcG9wcGVyLmpzLm9yZyknKVxuICAgIH1cblxuICAgIGxldCByZWZlcmVuY2VFbGVtZW50ID0gdGhpcy5fZWxlbWVudFxuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5yZWZlcmVuY2UgPT09ICdwYXJlbnQnKSB7XG4gICAgICByZWZlcmVuY2VFbGVtZW50ID0gdGhpcy5fcGFyZW50XG4gICAgfSBlbHNlIGlmIChpc0VsZW1lbnQodGhpcy5fY29uZmlnLnJlZmVyZW5jZSkpIHtcbiAgICAgIHJlZmVyZW5jZUVsZW1lbnQgPSBnZXRFbGVtZW50KHRoaXMuX2NvbmZpZy5yZWZlcmVuY2UpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5fY29uZmlnLnJlZmVyZW5jZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJlZmVyZW5jZUVsZW1lbnQgPSB0aGlzLl9jb25maWcucmVmZXJlbmNlXG4gICAgfVxuXG4gICAgY29uc3QgcG9wcGVyQ29uZmlnID0gdGhpcy5fZ2V0UG9wcGVyQ29uZmlnKClcbiAgICB0aGlzLl9wb3BwZXIgPSBQb3BwZXIuY3JlYXRlUG9wcGVyKHJlZmVyZW5jZUVsZW1lbnQsIHRoaXMuX21lbnUsIHBvcHBlckNvbmZpZylcbiAgfVxuXG4gIF9pc1Nob3duKCkge1xuICAgIHJldHVybiB0aGlzLl9tZW51LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX1NIT1cpXG4gIH1cblxuICBfZ2V0UGxhY2VtZW50KCkge1xuICAgIGNvbnN0IHBhcmVudERyb3Bkb3duID0gdGhpcy5fcGFyZW50XG5cbiAgICBpZiAocGFyZW50RHJvcGRvd24uY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTX05BTUVfRFJPUEVORCkpIHtcbiAgICAgIHJldHVybiBQTEFDRU1FTlRfUklHSFRcbiAgICB9XG5cbiAgICBpZiAocGFyZW50RHJvcGRvd24uY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTX05BTUVfRFJPUFNUQVJUKSkge1xuICAgICAgcmV0dXJuIFBMQUNFTUVOVF9MRUZUXG4gICAgfVxuXG4gICAgaWYgKHBhcmVudERyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0RST1BVUF9DRU5URVIpKSB7XG4gICAgICByZXR1cm4gUExBQ0VNRU5UX1RPUENFTlRFUlxuICAgIH1cblxuICAgIGlmIChwYXJlbnREcm9wZG93bi5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9EUk9QRE9XTl9DRU5URVIpKSB7XG4gICAgICByZXR1cm4gUExBQ0VNRU5UX0JPVFRPTUNFTlRFUlxuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gdHJpbSB0aGUgdmFsdWUgYmVjYXVzZSBjdXN0b20gcHJvcGVydGllcyBjYW4gYWxzbyBpbmNsdWRlIHNwYWNlc1xuICAgIGNvbnN0IGlzRW5kID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLl9tZW51KS5nZXRQcm9wZXJ0eVZhbHVlKCctLWJzLXBvc2l0aW9uJykudHJpbSgpID09PSAnZW5kJ1xuXG4gICAgaWYgKHBhcmVudERyb3Bkb3duLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0RST1BVUCkpIHtcbiAgICAgIHJldHVybiBpc0VuZCA/IFBMQUNFTUVOVF9UT1BFTkQgOiBQTEFDRU1FTlRfVE9QXG4gICAgfVxuXG4gICAgcmV0dXJuIGlzRW5kID8gUExBQ0VNRU5UX0JPVFRPTUVORCA6IFBMQUNFTUVOVF9CT1RUT01cbiAgfVxuXG4gIF9kZXRlY3ROYXZiYXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQuY2xvc2VzdChTRUxFQ1RPUl9OQVZCQVIpICE9PSBudWxsXG4gIH1cblxuICBfZ2V0T2Zmc2V0KCkge1xuICAgIGNvbnN0IHsgb2Zmc2V0IH0gPSB0aGlzLl9jb25maWdcblxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIG9mZnNldC5zcGxpdCgnLCcpLm1hcCh2YWx1ZSA9PiBOdW1iZXIucGFyc2VJbnQodmFsdWUsIDEwKSlcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9mZnNldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHBvcHBlckRhdGEgPT4gb2Zmc2V0KHBvcHBlckRhdGEsIHRoaXMuX2VsZW1lbnQpXG4gICAgfVxuXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgX2dldFBvcHBlckNvbmZpZygpIHtcbiAgICBjb25zdCBkZWZhdWx0QnNQb3BwZXJDb25maWcgPSB7XG4gICAgICBwbGFjZW1lbnQ6IHRoaXMuX2dldFBsYWNlbWVudCgpLFxuICAgICAgbW9kaWZpZXJzOiBbe1xuICAgICAgICBuYW1lOiAncHJldmVudE92ZXJmbG93JyxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgIGJvdW5kYXJ5OiB0aGlzLl9jb25maWcuYm91bmRhcnlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ29mZnNldCcsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBvZmZzZXQ6IHRoaXMuX2dldE9mZnNldCgpXG4gICAgICAgIH1cbiAgICAgIH1dXG4gICAgfVxuXG4gICAgLy8gRGlzYWJsZSBQb3BwZXIgaWYgd2UgaGF2ZSBhIHN0YXRpYyBkaXNwbGF5IG9yIERyb3Bkb3duIGlzIGluIE5hdmJhclxuICAgIGlmICh0aGlzLl9pbk5hdmJhciB8fCB0aGlzLl9jb25maWcuZGlzcGxheSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgIE1hbmlwdWxhdG9yLnNldERhdGFBdHRyaWJ1dGUodGhpcy5fbWVudSwgJ3BvcHBlcicsICdzdGF0aWMnKSAvLyBUT0RPOiB2NiByZW1vdmVcbiAgICAgIGRlZmF1bHRCc1BvcHBlckNvbmZpZy5tb2RpZmllcnMgPSBbe1xuICAgICAgICBuYW1lOiAnYXBwbHlTdHlsZXMnLFxuICAgICAgICBlbmFibGVkOiBmYWxzZVxuICAgICAgfV1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4uZGVmYXVsdEJzUG9wcGVyQ29uZmlnLFxuICAgICAgLi4uZXhlY3V0ZSh0aGlzLl9jb25maWcucG9wcGVyQ29uZmlnLCBbZGVmYXVsdEJzUG9wcGVyQ29uZmlnXSlcbiAgICB9XG4gIH1cblxuICBfc2VsZWN0TWVudUl0ZW0oeyBrZXksIHRhcmdldCB9KSB7XG4gICAgY29uc3QgaXRlbXMgPSBTZWxlY3RvckVuZ2luZS5maW5kKFNFTEVDVE9SX1ZJU0lCTEVfSVRFTVMsIHRoaXMuX21lbnUpLmZpbHRlcihlbGVtZW50ID0+IGlzVmlzaWJsZShlbGVtZW50KSlcblxuICAgIGlmICghaXRlbXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBpZiB0YXJnZXQgaXNuJ3QgaW5jbHVkZWQgaW4gaXRlbXMgKGUuZy4gd2hlbiBleHBhbmRpbmcgdGhlIGRyb3Bkb3duKVxuICAgIC8vIGFsbG93IGN5Y2xpbmcgdG8gZ2V0IHRoZSBsYXN0IGl0ZW0gaW4gY2FzZSBrZXkgZXF1YWxzIEFSUk9XX1VQX0tFWVxuICAgIGdldE5leHRBY3RpdmVFbGVtZW50KGl0ZW1zLCB0YXJnZXQsIGtleSA9PT0gQVJST1dfRE9XTl9LRVksICFpdGVtcy5pbmNsdWRlcyh0YXJnZXQpKS5mb2N1cygpXG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBEcm9wZG93bi5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZylcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGFbY29uZmlnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgTm8gbWV0aG9kIG5hbWVkIFwiJHtjb25maWd9XCJgKVxuICAgICAgfVxuXG4gICAgICBkYXRhW2NvbmZpZ10oKVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgY2xlYXJNZW51cyhldmVudCkge1xuICAgIGlmIChldmVudC5idXR0b24gPT09IFJJR0hUX01PVVNFX0JVVFRPTiB8fCAoZXZlbnQudHlwZSA9PT0gJ2tleXVwJyAmJiBldmVudC5rZXkgIT09IFRBQl9LRVkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBvcGVuVG9nZ2xlcyA9IFNlbGVjdG9yRW5naW5lLmZpbmQoU0VMRUNUT1JfREFUQV9UT0dHTEVfU0hPV04pXG5cbiAgICBmb3IgKGNvbnN0IHRvZ2dsZSBvZiBvcGVuVG9nZ2xlcykge1xuICAgICAgY29uc3QgY29udGV4dCA9IERyb3Bkb3duLmdldEluc3RhbmNlKHRvZ2dsZSlcbiAgICAgIGlmICghY29udGV4dCB8fCBjb250ZXh0Ll9jb25maWcuYXV0b0Nsb3NlID09PSBmYWxzZSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21wb3NlZFBhdGggPSBldmVudC5jb21wb3NlZFBhdGgoKVxuICAgICAgY29uc3QgaXNNZW51VGFyZ2V0ID0gY29tcG9zZWRQYXRoLmluY2x1ZGVzKGNvbnRleHQuX21lbnUpXG4gICAgICBpZiAoXG4gICAgICAgIGNvbXBvc2VkUGF0aC5pbmNsdWRlcyhjb250ZXh0Ll9lbGVtZW50KSB8fFxuICAgICAgICAoY29udGV4dC5fY29uZmlnLmF1dG9DbG9zZSA9PT0gJ2luc2lkZScgJiYgIWlzTWVudVRhcmdldCkgfHxcbiAgICAgICAgKGNvbnRleHQuX2NvbmZpZy5hdXRvQ2xvc2UgPT09ICdvdXRzaWRlJyAmJiBpc01lbnVUYXJnZXQpXG4gICAgICApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gVGFiIG5hdmlnYXRpb24gdGhyb3VnaCB0aGUgZHJvcGRvd24gbWVudSBvciBldmVudHMgZnJvbSBjb250YWluZWQgaW5wdXRzIHNob3VsZG4ndCBjbG9zZSB0aGUgbWVudVxuICAgICAgaWYgKGNvbnRleHQuX21lbnUuY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJiAoKGV2ZW50LnR5cGUgPT09ICdrZXl1cCcgJiYgZXZlbnQua2V5ID09PSBUQUJfS0VZKSB8fCAvaW5wdXR8c2VsZWN0fG9wdGlvbnx0ZXh0YXJlYXxmb3JtL2kudGVzdChldmVudC50YXJnZXQudGFnTmFtZSkpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlbGF0ZWRUYXJnZXQgPSB7IHJlbGF0ZWRUYXJnZXQ6IGNvbnRleHQuX2VsZW1lbnQgfVxuXG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICByZWxhdGVkVGFyZ2V0LmNsaWNrRXZlbnQgPSBldmVudFxuICAgICAgfVxuXG4gICAgICBjb250ZXh0Ll9jb21wbGV0ZUhpZGUocmVsYXRlZFRhcmdldClcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgZGF0YUFwaUtleWRvd25IYW5kbGVyKGV2ZW50KSB7XG4gICAgLy8gSWYgbm90IGFuIFVQIHwgRE9XTiB8IEVTQ0FQRSBrZXkgPT4gbm90IGEgZHJvcGRvd24gY29tbWFuZFxuICAgIC8vIElmIGlucHV0L3RleHRhcmVhICYmIGlmIGtleSBpcyBvdGhlciB0aGFuIEVTQ0FQRSA9PiBub3QgYSBkcm9wZG93biBjb21tYW5kXG5cbiAgICBjb25zdCBpc0lucHV0ID0gL2lucHV0fHRleHRhcmVhL2kudGVzdChldmVudC50YXJnZXQudGFnTmFtZSlcbiAgICBjb25zdCBpc0VzY2FwZUV2ZW50ID0gZXZlbnQua2V5ID09PSBFU0NBUEVfS0VZXG4gICAgY29uc3QgaXNVcE9yRG93bkV2ZW50ID0gW0FSUk9XX1VQX0tFWSwgQVJST1dfRE9XTl9LRVldLmluY2x1ZGVzKGV2ZW50LmtleSlcblxuICAgIGlmICghaXNVcE9yRG93bkV2ZW50ICYmICFpc0VzY2FwZUV2ZW50KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoaXNJbnB1dCAmJiAhaXNFc2NhcGVFdmVudCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgLy8gVE9ETzogdjYgcmV2ZXJ0ICMzNzAxMSAmIGNoYW5nZSBtYXJrdXAgaHR0cHM6Ly9nZXRib290c3RyYXAuY29tL2RvY3MvNS4zL2Zvcm1zL2lucHV0LWdyb3VwL1xuICAgIGNvbnN0IGdldFRvZ2dsZUJ1dHRvbiA9IHRoaXMubWF0Y2hlcyhTRUxFQ1RPUl9EQVRBX1RPR0dMRSkgP1xuICAgICAgdGhpcyA6XG4gICAgICAoU2VsZWN0b3JFbmdpbmUucHJldih0aGlzLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSlbMF0gfHxcbiAgICAgICAgU2VsZWN0b3JFbmdpbmUubmV4dCh0aGlzLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSlbMF0gfHxcbiAgICAgICAgU2VsZWN0b3JFbmdpbmUuZmluZE9uZShTRUxFQ1RPUl9EQVRBX1RPR0dMRSwgZXZlbnQuZGVsZWdhdGVUYXJnZXQucGFyZW50Tm9kZSkpXG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IERyb3Bkb3duLmdldE9yQ3JlYXRlSW5zdGFuY2UoZ2V0VG9nZ2xlQnV0dG9uKVxuXG4gICAgaWYgKGlzVXBPckRvd25FdmVudCkge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIGluc3RhbmNlLnNob3coKVxuICAgICAgaW5zdGFuY2UuX3NlbGVjdE1lbnVJdGVtKGV2ZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKGluc3RhbmNlLl9pc1Nob3duKCkpIHsgLy8gZWxzZSBpcyBlc2NhcGUgYW5kIHdlIGNoZWNrIGlmIGl0IGlzIHNob3duXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgaW5zdGFuY2UuaGlkZSgpXG4gICAgICBnZXRUb2dnbGVCdXR0b24uZm9jdXMoKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERhdGEgQVBJIGltcGxlbWVudGF0aW9uXG4gKi9cblxuRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9LRVlET1dOX0RBVEFfQVBJLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSwgRHJvcGRvd24uZGF0YUFwaUtleWRvd25IYW5kbGVyKVxuRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9LRVlET1dOX0RBVEFfQVBJLCBTRUxFQ1RPUl9NRU5VLCBEcm9wZG93bi5kYXRhQXBpS2V5ZG93bkhhbmRsZXIpXG5FdmVudEhhbmRsZXIub24oZG9jdW1lbnQsIEVWRU5UX0NMSUNLX0RBVEFfQVBJLCBEcm9wZG93bi5jbGVhck1lbnVzKVxuRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9LRVlVUF9EQVRBX0FQSSwgRHJvcGRvd24uY2xlYXJNZW51cylcbkV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEksIFNFTEVDVE9SX0RBVEFfVE9HR0xFLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBEcm9wZG93bi5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMpLnRvZ2dsZSgpXG59KVxuXG4vKipcbiAqIGpRdWVyeVxuICovXG5cbmRlZmluZUpRdWVyeVBsdWdpbihEcm9wZG93bilcblxuZXhwb3J0IGRlZmF1bHQgRHJvcGRvd25cbiIsICIvKipcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBCb290c3RyYXAgdXRpbC9iYWNrZHJvcC5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnLmpzJ1xuaW1wb3J0IHtcbiAgZXhlY3V0ZSwgZXhlY3V0ZUFmdGVyVHJhbnNpdGlvbiwgZ2V0RWxlbWVudCwgcmVmbG93XG59IGZyb20gJy4vaW5kZXguanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdiYWNrZHJvcCdcbmNvbnN0IENMQVNTX05BTUVfRkFERSA9ICdmYWRlJ1xuY29uc3QgQ0xBU1NfTkFNRV9TSE9XID0gJ3Nob3cnXG5jb25zdCBFVkVOVF9NT1VTRURPV04gPSBgbW91c2Vkb3duLmJzLiR7TkFNRX1gXG5cbmNvbnN0IERlZmF1bHQgPSB7XG4gIGNsYXNzTmFtZTogJ21vZGFsLWJhY2tkcm9wJyxcbiAgY2xpY2tDYWxsYmFjazogbnVsbCxcbiAgaXNBbmltYXRlZDogZmFsc2UsXG4gIGlzVmlzaWJsZTogdHJ1ZSwgLy8gaWYgZmFsc2UsIHdlIHVzZSB0aGUgYmFja2Ryb3AgaGVscGVyIHdpdGhvdXQgYWRkaW5nIGFueSBlbGVtZW50IHRvIHRoZSBkb21cbiAgcm9vdEVsZW1lbnQ6ICdib2R5JyAvLyBnaXZlIHRoZSBjaG9pY2UgdG8gcGxhY2UgYmFja2Ryb3AgdW5kZXIgZGlmZmVyZW50IGVsZW1lbnRzXG59XG5cbmNvbnN0IERlZmF1bHRUeXBlID0ge1xuICBjbGFzc05hbWU6ICdzdHJpbmcnLFxuICBjbGlja0NhbGxiYWNrOiAnKGZ1bmN0aW9ufG51bGwpJyxcbiAgaXNBbmltYXRlZDogJ2Jvb2xlYW4nLFxuICBpc1Zpc2libGU6ICdib29sZWFuJyxcbiAgcm9vdEVsZW1lbnQ6ICcoZWxlbWVudHxzdHJpbmcpJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBCYWNrZHJvcCBleHRlbmRzIENvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLl9jb25maWcgPSB0aGlzLl9nZXRDb25maWcoY29uZmlnKVxuICAgIHRoaXMuX2lzQXBwZW5kZWQgPSBmYWxzZVxuICAgIHRoaXMuX2VsZW1lbnQgPSBudWxsXG4gIH1cblxuICAvLyBHZXR0ZXJzXG4gIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICByZXR1cm4gRGVmYXVsdFxuICB9XG5cbiAgc3RhdGljIGdldCBEZWZhdWx0VHlwZSgpIHtcbiAgICByZXR1cm4gRGVmYXVsdFR5cGVcbiAgfVxuXG4gIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICByZXR1cm4gTkFNRVxuICB9XG5cbiAgLy8gUHVibGljXG4gIHNob3coY2FsbGJhY2spIHtcbiAgICBpZiAoIXRoaXMuX2NvbmZpZy5pc1Zpc2libGUpIHtcbiAgICAgIGV4ZWN1dGUoY2FsbGJhY2spXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9hcHBlbmQoKVxuXG4gICAgY29uc3QgZWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQoKVxuICAgIGlmICh0aGlzLl9jb25maWcuaXNBbmltYXRlZCkge1xuICAgICAgcmVmbG93KGVsZW1lbnQpXG4gICAgfVxuXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVylcblxuICAgIHRoaXMuX2VtdWxhdGVBbmltYXRpb24oKCkgPT4ge1xuICAgICAgZXhlY3V0ZShjYWxsYmFjaylcbiAgICB9KVxuICB9XG5cbiAgaGlkZShjYWxsYmFjaykge1xuICAgIGlmICghdGhpcy5fY29uZmlnLmlzVmlzaWJsZSkge1xuICAgICAgZXhlY3V0ZShjYWxsYmFjaylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2dldEVsZW1lbnQoKS5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVylcblxuICAgIHRoaXMuX2VtdWxhdGVBbmltYXRpb24oKCkgPT4ge1xuICAgICAgdGhpcy5kaXNwb3NlKClcbiAgICAgIGV4ZWN1dGUoY2FsbGJhY2spXG4gICAgfSlcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0FwcGVuZGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBFdmVudEhhbmRsZXIub2ZmKHRoaXMuX2VsZW1lbnQsIEVWRU5UX01PVVNFRE9XTilcblxuICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlKClcbiAgICB0aGlzLl9pc0FwcGVuZGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2dldEVsZW1lbnQoKSB7XG4gICAgaWYgKCF0aGlzLl9lbGVtZW50KSB7XG4gICAgICBjb25zdCBiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBiYWNrZHJvcC5jbGFzc05hbWUgPSB0aGlzLl9jb25maWcuY2xhc3NOYW1lXG4gICAgICBpZiAodGhpcy5fY29uZmlnLmlzQW5pbWF0ZWQpIHtcbiAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0ZBREUpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VsZW1lbnQgPSBiYWNrZHJvcFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9lbGVtZW50XG4gIH1cblxuICBfY29uZmlnQWZ0ZXJNZXJnZShjb25maWcpIHtcbiAgICAvLyB1c2UgZ2V0RWxlbWVudCgpIHdpdGggdGhlIGRlZmF1bHQgXCJib2R5XCIgdG8gZ2V0IGEgZnJlc2ggRWxlbWVudCBvbiBlYWNoIGluc3RhbnRpYXRpb25cbiAgICBjb25maWcucm9vdEVsZW1lbnQgPSBnZXRFbGVtZW50KGNvbmZpZy5yb290RWxlbWVudClcbiAgICByZXR1cm4gY29uZmlnXG4gIH1cblxuICBfYXBwZW5kKCkge1xuICAgIGlmICh0aGlzLl9pc0FwcGVuZGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZ2V0RWxlbWVudCgpXG4gICAgdGhpcy5fY29uZmlnLnJvb3RFbGVtZW50LmFwcGVuZChlbGVtZW50KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKGVsZW1lbnQsIEVWRU5UX01PVVNFRE9XTiwgKCkgPT4ge1xuICAgICAgZXhlY3V0ZSh0aGlzLl9jb25maWcuY2xpY2tDYWxsYmFjaylcbiAgICB9KVxuXG4gICAgdGhpcy5faXNBcHBlbmRlZCA9IHRydWVcbiAgfVxuXG4gIF9lbXVsYXRlQW5pbWF0aW9uKGNhbGxiYWNrKSB7XG4gICAgZXhlY3V0ZUFmdGVyVHJhbnNpdGlvbihjYWxsYmFjaywgdGhpcy5fZ2V0RWxlbWVudCgpLCB0aGlzLl9jb25maWcuaXNBbmltYXRlZClcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBCYWNrZHJvcFxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCB1dGlsL2ZvY3VzdHJhcC5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi4vZG9tL3NlbGVjdG9yLWVuZ2luZS5qcydcbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcuanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdmb2N1c3RyYXAnXG5jb25zdCBEQVRBX0tFWSA9ICdicy5mb2N1c3RyYXAnXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuY29uc3QgRVZFTlRfRk9DVVNJTiA9IGBmb2N1c2luJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfS0VZRE9XTl9UQUIgPSBga2V5ZG93bi50YWIke0VWRU5UX0tFWX1gXG5cbmNvbnN0IFRBQl9LRVkgPSAnVGFiJ1xuY29uc3QgVEFCX05BVl9GT1JXQVJEID0gJ2ZvcndhcmQnXG5jb25zdCBUQUJfTkFWX0JBQ0tXQVJEID0gJ2JhY2t3YXJkJ1xuXG5jb25zdCBEZWZhdWx0ID0ge1xuICBhdXRvZm9jdXM6IHRydWUsXG4gIHRyYXBFbGVtZW50OiBudWxsIC8vIFRoZSBlbGVtZW50IHRvIHRyYXAgZm9jdXMgaW5zaWRlIG9mXG59XG5cbmNvbnN0IERlZmF1bHRUeXBlID0ge1xuICBhdXRvZm9jdXM6ICdib29sZWFuJyxcbiAgdHJhcEVsZW1lbnQ6ICdlbGVtZW50J1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBGb2N1c1RyYXAgZXh0ZW5kcyBDb25maWcge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5fY29uZmlnID0gdGhpcy5fZ2V0Q29uZmlnKGNvbmZpZylcbiAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy5fbGFzdFRhYk5hdkRpcmVjdGlvbiA9IG51bGxcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgYWN0aXZhdGUoKSB7XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY29uZmlnLmF1dG9mb2N1cykge1xuICAgICAgdGhpcy5fY29uZmlnLnRyYXBFbGVtZW50LmZvY3VzKClcbiAgICB9XG5cbiAgICBFdmVudEhhbmRsZXIub2ZmKGRvY3VtZW50LCBFVkVOVF9LRVkpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxuICAgIEV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfRk9DVVNJTiwgZXZlbnQgPT4gdGhpcy5faGFuZGxlRm9jdXNpbihldmVudCkpXG4gICAgRXZlbnRIYW5kbGVyLm9uKGRvY3VtZW50LCBFVkVOVF9LRVlET1dOX1RBQiwgZXZlbnQgPT4gdGhpcy5faGFuZGxlS2V5ZG93bihldmVudCkpXG5cbiAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWVcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZVxuICAgIEV2ZW50SGFuZGxlci5vZmYoZG9jdW1lbnQsIEVWRU5UX0tFWSlcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2hhbmRsZUZvY3VzaW4oZXZlbnQpIHtcbiAgICBjb25zdCB7IHRyYXBFbGVtZW50IH0gPSB0aGlzLl9jb25maWdcblxuICAgIGlmIChldmVudC50YXJnZXQgPT09IGRvY3VtZW50IHx8IGV2ZW50LnRhcmdldCA9PT0gdHJhcEVsZW1lbnQgfHwgdHJhcEVsZW1lbnQuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudHMgPSBTZWxlY3RvckVuZ2luZS5mb2N1c2FibGVDaGlsZHJlbih0cmFwRWxlbWVudClcblxuICAgIGlmIChlbGVtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRyYXBFbGVtZW50LmZvY3VzKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2xhc3RUYWJOYXZEaXJlY3Rpb24gPT09IFRBQl9OQVZfQkFDS1dBUkQpIHtcbiAgICAgIGVsZW1lbnRzW2VsZW1lbnRzLmxlbmd0aCAtIDFdLmZvY3VzKClcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudHNbMF0uZm9jdXMoKVxuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmtleSAhPT0gVEFCX0tFWSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fbGFzdFRhYk5hdkRpcmVjdGlvbiA9IGV2ZW50LnNoaWZ0S2V5ID8gVEFCX05BVl9CQUNLV0FSRCA6IFRBQl9OQVZfRk9SV0FSRFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvY3VzVHJhcFxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCB1dGlsL3Njcm9sbEJhci5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBNYW5pcHVsYXRvciBmcm9tICcuLi9kb20vbWFuaXB1bGF0b3IuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi4vZG9tL3NlbGVjdG9yLWVuZ2luZS5qcydcbmltcG9ydCB7IGlzRWxlbWVudCB9IGZyb20gJy4vaW5kZXguanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgU0VMRUNUT1JfRklYRURfQ09OVEVOVCA9ICcuZml4ZWQtdG9wLCAuZml4ZWQtYm90dG9tLCAuaXMtZml4ZWQsIC5zdGlja3ktdG9wJ1xuY29uc3QgU0VMRUNUT1JfU1RJQ0tZX0NPTlRFTlQgPSAnLnN0aWNreS10b3AnXG5jb25zdCBQUk9QRVJUWV9QQURESU5HID0gJ3BhZGRpbmctcmlnaHQnXG5jb25zdCBQUk9QRVJUWV9NQVJHSU4gPSAnbWFyZ2luLXJpZ2h0J1xuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBTY3JvbGxCYXJIZWxwZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9lbGVtZW50ID0gZG9jdW1lbnQuYm9keVxuICB9XG5cbiAgLy8gUHVibGljXG4gIGdldFdpZHRoKCkge1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XaW5kb3cvaW5uZXJXaWR0aCN1c2FnZV9ub3Rlc1xuICAgIGNvbnN0IGRvY3VtZW50V2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGhcbiAgICByZXR1cm4gTWF0aC5hYnMod2luZG93LmlubmVyV2lkdGggLSBkb2N1bWVudFdpZHRoKVxuICB9XG5cbiAgaGlkZSgpIHtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2V0V2lkdGgoKVxuICAgIHRoaXMuX2Rpc2FibGVPdmVyRmxvdygpXG4gICAgLy8gZ2l2ZSBwYWRkaW5nIHRvIGVsZW1lbnQgdG8gYmFsYW5jZSB0aGUgaGlkZGVuIHNjcm9sbGJhciB3aWR0aFxuICAgIHRoaXMuX3NldEVsZW1lbnRBdHRyaWJ1dGVzKHRoaXMuX2VsZW1lbnQsIFBST1BFUlRZX1BBRERJTkcsIGNhbGN1bGF0ZWRWYWx1ZSA9PiBjYWxjdWxhdGVkVmFsdWUgKyB3aWR0aClcbiAgICAvLyB0cmljazogV2UgYWRqdXN0IHBvc2l0aXZlIHBhZGRpbmdSaWdodCBhbmQgbmVnYXRpdmUgbWFyZ2luUmlnaHQgdG8gc3RpY2t5LXRvcCBlbGVtZW50cyB0byBrZWVwIHNob3dpbmcgZnVsbHdpZHRoXG4gICAgdGhpcy5fc2V0RWxlbWVudEF0dHJpYnV0ZXMoU0VMRUNUT1JfRklYRURfQ09OVEVOVCwgUFJPUEVSVFlfUEFERElORywgY2FsY3VsYXRlZFZhbHVlID0+IGNhbGN1bGF0ZWRWYWx1ZSArIHdpZHRoKVxuICAgIHRoaXMuX3NldEVsZW1lbnRBdHRyaWJ1dGVzKFNFTEVDVE9SX1NUSUNLWV9DT05URU5ULCBQUk9QRVJUWV9NQVJHSU4sIGNhbGN1bGF0ZWRWYWx1ZSA9PiBjYWxjdWxhdGVkVmFsdWUgLSB3aWR0aClcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX3Jlc2V0RWxlbWVudEF0dHJpYnV0ZXModGhpcy5fZWxlbWVudCwgJ292ZXJmbG93JylcbiAgICB0aGlzLl9yZXNldEVsZW1lbnRBdHRyaWJ1dGVzKHRoaXMuX2VsZW1lbnQsIFBST1BFUlRZX1BBRERJTkcpXG4gICAgdGhpcy5fcmVzZXRFbGVtZW50QXR0cmlidXRlcyhTRUxFQ1RPUl9GSVhFRF9DT05URU5ULCBQUk9QRVJUWV9QQURESU5HKVxuICAgIHRoaXMuX3Jlc2V0RWxlbWVudEF0dHJpYnV0ZXMoU0VMRUNUT1JfU1RJQ0tZX0NPTlRFTlQsIFBST1BFUlRZX01BUkdJTilcbiAgfVxuXG4gIGlzT3ZlcmZsb3dpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKSA+IDBcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2Rpc2FibGVPdmVyRmxvdygpIHtcbiAgICB0aGlzLl9zYXZlSW5pdGlhbEF0dHJpYnV0ZSh0aGlzLl9lbGVtZW50LCAnb3ZlcmZsb3cnKVxuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJ1xuICB9XG5cbiAgX3NldEVsZW1lbnRBdHRyaWJ1dGVzKHNlbGVjdG9yLCBzdHlsZVByb3BlcnR5LCBjYWxsYmFjaykge1xuICAgIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5nZXRXaWR0aCgpXG4gICAgY29uc3QgbWFuaXB1bGF0aW9uQ2FsbEJhY2sgPSBlbGVtZW50ID0+IHtcbiAgICAgIGlmIChlbGVtZW50ICE9PSB0aGlzLl9lbGVtZW50ICYmIHdpbmRvdy5pbm5lcldpZHRoID4gZWxlbWVudC5jbGllbnRXaWR0aCArIHNjcm9sbGJhcldpZHRoKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLl9zYXZlSW5pdGlhbEF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZVByb3BlcnR5KVxuICAgICAgY29uc3QgY2FsY3VsYXRlZFZhbHVlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZVByb3BlcnR5KVxuICAgICAgZWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eShzdHlsZVByb3BlcnR5LCBgJHtjYWxsYmFjayhOdW1iZXIucGFyc2VGbG9hdChjYWxjdWxhdGVkVmFsdWUpKX1weGApXG4gICAgfVxuXG4gICAgdGhpcy5fYXBwbHlNYW5pcHVsYXRpb25DYWxsYmFjayhzZWxlY3RvciwgbWFuaXB1bGF0aW9uQ2FsbEJhY2spXG4gIH1cblxuICBfc2F2ZUluaXRpYWxBdHRyaWJ1dGUoZWxlbWVudCwgc3R5bGVQcm9wZXJ0eSkge1xuICAgIGNvbnN0IGFjdHVhbFZhbHVlID0gZWxlbWVudC5zdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlUHJvcGVydHkpXG4gICAgaWYgKGFjdHVhbFZhbHVlKSB7XG4gICAgICBNYW5pcHVsYXRvci5zZXREYXRhQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlUHJvcGVydHksIGFjdHVhbFZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIF9yZXNldEVsZW1lbnRBdHRyaWJ1dGVzKHNlbGVjdG9yLCBzdHlsZVByb3BlcnR5KSB7XG4gICAgY29uc3QgbWFuaXB1bGF0aW9uQ2FsbEJhY2sgPSBlbGVtZW50ID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gTWFuaXB1bGF0b3IuZ2V0RGF0YUF0dHJpYnV0ZShlbGVtZW50LCBzdHlsZVByb3BlcnR5KVxuICAgICAgLy8gV2Ugb25seSB3YW50IHRvIHJlbW92ZSB0aGUgcHJvcGVydHkgaWYgdGhlIHZhbHVlIGlzIGBudWxsYDsgdGhlIHZhbHVlIGNhbiBhbHNvIGJlIHplcm9cbiAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KHN0eWxlUHJvcGVydHkpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBNYW5pcHVsYXRvci5yZW1vdmVEYXRhQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlUHJvcGVydHkpXG4gICAgICBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KHN0eWxlUHJvcGVydHksIHZhbHVlKVxuICAgIH1cblxuICAgIHRoaXMuX2FwcGx5TWFuaXB1bGF0aW9uQ2FsbGJhY2soc2VsZWN0b3IsIG1hbmlwdWxhdGlvbkNhbGxCYWNrKVxuICB9XG5cbiAgX2FwcGx5TWFuaXB1bGF0aW9uQ2FsbGJhY2soc2VsZWN0b3IsIGNhbGxCYWNrKSB7XG4gICAgaWYgKGlzRWxlbWVudChzZWxlY3RvcikpIHtcbiAgICAgIGNhbGxCYWNrKHNlbGVjdG9yKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzZWwgb2YgU2VsZWN0b3JFbmdpbmUuZmluZChzZWxlY3RvciwgdGhpcy5fZWxlbWVudCkpIHtcbiAgICAgIGNhbGxCYWNrKHNlbClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2Nyb2xsQmFySGVscGVyXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIG1vZGFsLmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9iYXNlLWNvbXBvbmVudC5qcydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi9kb20vZXZlbnQtaGFuZGxlci5qcydcbmltcG9ydCBTZWxlY3RvckVuZ2luZSBmcm9tICcuL2RvbS9zZWxlY3Rvci1lbmdpbmUuanMnXG5pbXBvcnQgQmFja2Ryb3AgZnJvbSAnLi91dGlsL2JhY2tkcm9wLmpzJ1xuaW1wb3J0IHsgZW5hYmxlRGlzbWlzc1RyaWdnZXIgfSBmcm9tICcuL3V0aWwvY29tcG9uZW50LWZ1bmN0aW9ucy5qcydcbmltcG9ydCBGb2N1c1RyYXAgZnJvbSAnLi91dGlsL2ZvY3VzdHJhcC5qcydcbmltcG9ydCB7XG4gIGRlZmluZUpRdWVyeVBsdWdpbiwgaXNSVEwsIGlzVmlzaWJsZSwgcmVmbG93XG59IGZyb20gJy4vdXRpbC9pbmRleC5qcydcbmltcG9ydCBTY3JvbGxCYXJIZWxwZXIgZnJvbSAnLi91dGlsL3Njcm9sbGJhci5qcydcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG5jb25zdCBOQU1FID0gJ21vZGFsJ1xuY29uc3QgREFUQV9LRVkgPSAnYnMubW9kYWwnXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuY29uc3QgREFUQV9BUElfS0VZID0gJy5kYXRhLWFwaSdcbmNvbnN0IEVTQ0FQRV9LRVkgPSAnRXNjYXBlJ1xuXG5jb25zdCBFVkVOVF9ISURFID0gYGhpZGUke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9ISURFX1BSRVZFTlRFRCA9IGBoaWRlUHJldmVudGVkJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfSElEREVOID0gYGhpZGRlbiR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX1NIT1cgPSBgc2hvdyR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX1NIT1dOID0gYHNob3duJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfUkVTSVpFID0gYHJlc2l6ZSR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0NMSUNLX0RJU01JU1MgPSBgY2xpY2suZGlzbWlzcyR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX01PVVNFRE9XTl9ESVNNSVNTID0gYG1vdXNlZG93bi5kaXNtaXNzJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfS0VZRE9XTl9ESVNNSVNTID0gYGtleWRvd24uZGlzbWlzcyR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0NMSUNLX0RBVEFfQVBJID0gYGNsaWNrJHtFVkVOVF9LRVl9JHtEQVRBX0FQSV9LRVl9YFxuXG5jb25zdCBDTEFTU19OQU1FX09QRU4gPSAnbW9kYWwtb3BlbidcbmNvbnN0IENMQVNTX05BTUVfRkFERSA9ICdmYWRlJ1xuY29uc3QgQ0xBU1NfTkFNRV9TSE9XID0gJ3Nob3cnXG5jb25zdCBDTEFTU19OQU1FX1NUQVRJQyA9ICdtb2RhbC1zdGF0aWMnXG5cbmNvbnN0IE9QRU5fU0VMRUNUT1IgPSAnLm1vZGFsLnNob3cnXG5jb25zdCBTRUxFQ1RPUl9ESUFMT0cgPSAnLm1vZGFsLWRpYWxvZydcbmNvbnN0IFNFTEVDVE9SX01PREFMX0JPRFkgPSAnLm1vZGFsLWJvZHknXG5jb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSA9ICdbZGF0YS1icy10b2dnbGU9XCJtb2RhbFwiXSdcblxuY29uc3QgRGVmYXVsdCA9IHtcbiAgYmFja2Ryb3A6IHRydWUsXG4gIGZvY3VzOiB0cnVlLFxuICBrZXlib2FyZDogdHJ1ZVxufVxuXG5jb25zdCBEZWZhdWx0VHlwZSA9IHtcbiAgYmFja2Ryb3A6ICcoYm9vbGVhbnxzdHJpbmcpJyxcbiAgZm9jdXM6ICdib29sZWFuJyxcbiAga2V5Ym9hcmQ6ICdib29sZWFuJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBNb2RhbCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjb25maWcpIHtcbiAgICBzdXBlcihlbGVtZW50LCBjb25maWcpXG5cbiAgICB0aGlzLl9kaWFsb2cgPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX0RJQUxPRywgdGhpcy5fZWxlbWVudClcbiAgICB0aGlzLl9iYWNrZHJvcCA9IHRoaXMuX2luaXRpYWxpemVCYWNrRHJvcCgpXG4gICAgdGhpcy5fZm9jdXN0cmFwID0gdGhpcy5faW5pdGlhbGl6ZUZvY3VzVHJhcCgpXG4gICAgdGhpcy5faXNTaG93biA9IGZhbHNlXG4gICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gZmFsc2VcbiAgICB0aGlzLl9zY3JvbGxCYXIgPSBuZXcgU2Nyb2xsQmFySGVscGVyKClcblxuICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKClcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgdG9nZ2xlKHJlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5faXNTaG93biA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KHJlbGF0ZWRUYXJnZXQpXG4gIH1cblxuICBzaG93KHJlbGF0ZWRUYXJnZXQpIHtcbiAgICBpZiAodGhpcy5faXNTaG93biB8fCB0aGlzLl9pc1RyYW5zaXRpb25pbmcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHNob3dFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX1NIT1csIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXRcbiAgICB9KVxuXG4gICAgaWYgKHNob3dFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9pc1Nob3duID0gdHJ1ZVxuICAgIHRoaXMuX2lzVHJhbnNpdGlvbmluZyA9IHRydWVcblxuICAgIHRoaXMuX3Njcm9sbEJhci5oaWRlKClcblxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX09QRU4pXG5cbiAgICB0aGlzLl9hZGp1c3REaWFsb2coKVxuXG4gICAgdGhpcy5fYmFja2Ryb3Auc2hvdygoKSA9PiB0aGlzLl9zaG93RWxlbWVudChyZWxhdGVkVGFyZ2V0KSlcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc1Nob3duIHx8IHRoaXMuX2lzVHJhbnNpdGlvbmluZykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaGlkZUV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElERSlcblxuICAgIGlmIChoaWRlRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5faXNTaG93biA9IGZhbHNlXG4gICAgdGhpcy5faXNUcmFuc2l0aW9uaW5nID0gdHJ1ZVxuICAgIHRoaXMuX2ZvY3VzdHJhcC5kZWFjdGl2YXRlKClcblxuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1cpXG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKCgpID0+IHRoaXMuX2hpZGVNb2RhbCgpLCB0aGlzLl9lbGVtZW50LCB0aGlzLl9pc0FuaW1hdGVkKCkpXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIEV2ZW50SGFuZGxlci5vZmYod2luZG93LCBFVkVOVF9LRVkpXG4gICAgRXZlbnRIYW5kbGVyLm9mZih0aGlzLl9kaWFsb2csIEVWRU5UX0tFWSlcblxuICAgIHRoaXMuX2JhY2tkcm9wLmRpc3Bvc2UoKVxuICAgIHRoaXMuX2ZvY3VzdHJhcC5kZWFjdGl2YXRlKClcblxuICAgIHN1cGVyLmRpc3Bvc2UoKVxuICB9XG5cbiAgaGFuZGxlVXBkYXRlKCkge1xuICAgIHRoaXMuX2FkanVzdERpYWxvZygpXG4gIH1cblxuICAvLyBQcml2YXRlXG4gIF9pbml0aWFsaXplQmFja0Ryb3AoKSB7XG4gICAgcmV0dXJuIG5ldyBCYWNrZHJvcCh7XG4gICAgICBpc1Zpc2libGU6IEJvb2xlYW4odGhpcy5fY29uZmlnLmJhY2tkcm9wKSwgLy8gJ3N0YXRpYycgb3B0aW9uIHdpbGwgYmUgdHJhbnNsYXRlZCB0byB0cnVlLCBhbmQgYm9vbGVhbnMgd2lsbCBrZWVwIHRoZWlyIHZhbHVlLFxuICAgICAgaXNBbmltYXRlZDogdGhpcy5faXNBbmltYXRlZCgpXG4gICAgfSlcbiAgfVxuXG4gIF9pbml0aWFsaXplRm9jdXNUcmFwKCkge1xuICAgIHJldHVybiBuZXcgRm9jdXNUcmFwKHtcbiAgICAgIHRyYXBFbGVtZW50OiB0aGlzLl9lbGVtZW50XG4gICAgfSlcbiAgfVxuXG4gIF9zaG93RWxlbWVudChyZWxhdGVkVGFyZ2V0KSB7XG4gICAgLy8gdHJ5IHRvIGFwcGVuZCBkeW5hbWljIG1vZGFsXG4gICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKHRoaXMuX2VsZW1lbnQpKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh0aGlzLl9lbGVtZW50KVxuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKVxuICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLW1vZGFsJywgdHJ1ZSlcbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICdkaWFsb2cnKVxuICAgIHRoaXMuX2VsZW1lbnQuc2Nyb2xsVG9wID0gMFxuXG4gICAgY29uc3QgbW9kYWxCb2R5ID0gU2VsZWN0b3JFbmdpbmUuZmluZE9uZShTRUxFQ1RPUl9NT0RBTF9CT0RZLCB0aGlzLl9kaWFsb2cpXG4gICAgaWYgKG1vZGFsQm9keSkge1xuICAgICAgbW9kYWxCb2R5LnNjcm9sbFRvcCA9IDBcbiAgICB9XG5cbiAgICByZWZsb3codGhpcy5fZWxlbWVudClcblxuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX1NIT1cpXG5cbiAgICBjb25zdCB0cmFuc2l0aW9uQ29tcGxldGUgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fY29uZmlnLmZvY3VzKSB7XG4gICAgICAgIHRoaXMuX2ZvY3VzdHJhcC5hY3RpdmF0ZSgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2lzVHJhbnNpdGlvbmluZyA9IGZhbHNlXG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XTiwge1xuICAgICAgICByZWxhdGVkVGFyZ2V0XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2sodHJhbnNpdGlvbkNvbXBsZXRlLCB0aGlzLl9kaWFsb2csIHRoaXMuX2lzQW5pbWF0ZWQoKSlcbiAgfVxuXG4gIF9hZGRFdmVudExpc3RlbmVycygpIHtcbiAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfS0VZRE9XTl9ESVNNSVNTLCBldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSBFU0NBUEVfS0VZKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY29uZmlnLmtleWJvYXJkKSB7XG4gICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLl90cmlnZ2VyQmFja2Ryb3BUcmFuc2l0aW9uKClcbiAgICB9KVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKHdpbmRvdywgRVZFTlRfUkVTSVpFLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5faXNTaG93biAmJiAhdGhpcy5faXNUcmFuc2l0aW9uaW5nKSB7XG4gICAgICAgIHRoaXMuX2FkanVzdERpYWxvZygpXG4gICAgICB9XG4gICAgfSlcblxuICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBFVkVOVF9NT1VTRURPV05fRElTTUlTUywgZXZlbnQgPT4ge1xuICAgICAgLy8gYSBiYWQgdHJpY2sgdG8gc2VncmVnYXRlIGNsaWNrcyB0aGF0IG1heSBzdGFydCBpbnNpZGUgZGlhbG9nIGJ1dCBlbmQgb3V0c2lkZSwgYW5kIGF2b2lkIGxpc3RlbiB0byBzY3JvbGxiYXIgY2xpY2tzXG4gICAgICBFdmVudEhhbmRsZXIub25lKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0NMSUNLX0RJU01JU1MsIGV2ZW50MiA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50ICE9PSBldmVudC50YXJnZXQgfHwgdGhpcy5fZWxlbWVudCAhPT0gZXZlbnQyLnRhcmdldCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZy5iYWNrZHJvcCA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICB0aGlzLl90cmlnZ2VyQmFja2Ryb3BUcmFuc2l0aW9uKClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9jb25maWcuYmFja2Ryb3ApIHtcbiAgICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBfaGlkZU1vZGFsKCkge1xuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpXG4gICAgdGhpcy5fZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnKVxuICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdyb2xlJylcbiAgICB0aGlzLl9pc1RyYW5zaXRpb25pbmcgPSBmYWxzZVxuXG4gICAgdGhpcy5fYmFja2Ryb3AuaGlkZSgoKSA9PiB7XG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9PUEVOKVxuICAgICAgdGhpcy5fcmVzZXRBZGp1c3RtZW50cygpXG4gICAgICB0aGlzLl9zY3JvbGxCYXIucmVzZXQoKVxuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElEREVOKVxuICAgIH0pXG4gIH1cblxuICBfaXNBbmltYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9GQURFKVxuICB9XG5cbiAgX3RyaWdnZXJCYWNrZHJvcFRyYW5zaXRpb24oKSB7XG4gICAgY29uc3QgaGlkZUV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElERV9QUkVWRU5URUQpXG4gICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBpc01vZGFsT3ZlcmZsb3dpbmcgPSB0aGlzLl9lbGVtZW50LnNjcm9sbEhlaWdodCA+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICBjb25zdCBpbml0aWFsT3ZlcmZsb3dZID0gdGhpcy5fZWxlbWVudC5zdHlsZS5vdmVyZmxvd1lcbiAgICAvLyByZXR1cm4gaWYgdGhlIGZvbGxvd2luZyBiYWNrZ3JvdW5kIHRyYW5zaXRpb24gaGFzbid0IHlldCBjb21wbGV0ZWRcbiAgICBpZiAoaW5pdGlhbE92ZXJmbG93WSA9PT0gJ2hpZGRlbicgfHwgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9TVEFUSUMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIWlzTW9kYWxPdmVyZmxvd2luZykge1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZS5vdmVyZmxvd1kgPSAnaGlkZGVuJ1xuICAgIH1cblxuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX1NUQVRJQylcbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NUQVRJQylcbiAgICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICB0aGlzLl9lbGVtZW50LnN0eWxlLm92ZXJmbG93WSA9IGluaXRpYWxPdmVyZmxvd1lcbiAgICAgIH0sIHRoaXMuX2RpYWxvZylcbiAgICB9LCB0aGlzLl9kaWFsb2cpXG5cbiAgICB0aGlzLl9lbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZm9sbG93aW5nIG1ldGhvZHMgYXJlIHVzZWQgdG8gaGFuZGxlIG92ZXJmbG93aW5nIG1vZGFsc1xuICAgKi9cblxuICBfYWRqdXN0RGlhbG9nKCkge1xuICAgIGNvbnN0IGlzTW9kYWxPdmVyZmxvd2luZyA9IHRoaXMuX2VsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuICAgIGNvbnN0IHNjcm9sbGJhcldpZHRoID0gdGhpcy5fc2Nyb2xsQmFyLmdldFdpZHRoKClcbiAgICBjb25zdCBpc0JvZHlPdmVyZmxvd2luZyA9IHNjcm9sbGJhcldpZHRoID4gMFxuXG4gICAgaWYgKGlzQm9keU92ZXJmbG93aW5nICYmICFpc01vZGFsT3ZlcmZsb3dpbmcpIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gaXNSVEwoKSA/ICdwYWRkaW5nTGVmdCcgOiAncGFkZGluZ1JpZ2h0J1xuICAgICAgdGhpcy5fZWxlbWVudC5zdHlsZVtwcm9wZXJ0eV0gPSBgJHtzY3JvbGxiYXJXaWR0aH1weGBcbiAgICB9XG5cbiAgICBpZiAoIWlzQm9keU92ZXJmbG93aW5nICYmIGlzTW9kYWxPdmVyZmxvd2luZykge1xuICAgICAgY29uc3QgcHJvcGVydHkgPSBpc1JUTCgpID8gJ3BhZGRpbmdSaWdodCcgOiAncGFkZGluZ0xlZnQnXG4gICAgICB0aGlzLl9lbGVtZW50LnN0eWxlW3Byb3BlcnR5XSA9IGAke3Njcm9sbGJhcldpZHRofXB4YFxuICAgIH1cbiAgfVxuXG4gIF9yZXNldEFkanVzdG1lbnRzKCkge1xuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUucGFkZGluZ0xlZnQgPSAnJ1xuICAgIHRoaXMuX2VsZW1lbnQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJydcbiAgfVxuXG4gIC8vIFN0YXRpY1xuICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZywgcmVsYXRlZFRhcmdldCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZGF0YSA9IE1vZGFsLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApXG4gICAgICB9XG5cbiAgICAgIGRhdGFbY29uZmlnXShyZWxhdGVkVGFyZ2V0KVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBEYXRhIEFQSSBpbXBsZW1lbnRhdGlvblxuICovXG5cbkV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEksIFNFTEVDVE9SX0RBVEFfVE9HR0xFLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgdGFyZ2V0ID0gU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3Rvcih0aGlzKVxuXG4gIGlmIChbJ0EnLCAnQVJFQSddLmluY2x1ZGVzKHRoaXMudGFnTmFtZSkpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBFdmVudEhhbmRsZXIub25lKHRhcmdldCwgRVZFTlRfU0hPVywgc2hvd0V2ZW50ID0+IHtcbiAgICBpZiAoc2hvd0V2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIC8vIG9ubHkgcmVnaXN0ZXIgZm9jdXMgcmVzdG9yZXIgaWYgbW9kYWwgd2lsbCBhY3R1YWxseSBnZXQgc2hvd25cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIEV2ZW50SGFuZGxlci5vbmUodGFyZ2V0LCBFVkVOVF9ISURERU4sICgpID0+IHtcbiAgICAgIGlmIChpc1Zpc2libGUodGhpcykpIHtcbiAgICAgICAgdGhpcy5mb2N1cygpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcblxuICAvLyBhdm9pZCBjb25mbGljdCB3aGVuIGNsaWNraW5nIG1vZGFsIHRvZ2dsZXIgd2hpbGUgYW5vdGhlciBvbmUgaXMgb3BlblxuICBjb25zdCBhbHJlYWR5T3BlbiA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoT1BFTl9TRUxFQ1RPUilcbiAgaWYgKGFscmVhZHlPcGVuKSB7XG4gICAgTW9kYWwuZ2V0SW5zdGFuY2UoYWxyZWFkeU9wZW4pLmhpZGUoKVxuICB9XG5cbiAgY29uc3QgZGF0YSA9IE1vZGFsLmdldE9yQ3JlYXRlSW5zdGFuY2UodGFyZ2V0KVxuXG4gIGRhdGEudG9nZ2xlKHRoaXMpXG59KVxuXG5lbmFibGVEaXNtaXNzVHJpZ2dlcihNb2RhbClcblxuLyoqXG4gKiBqUXVlcnlcbiAqL1xuXG5kZWZpbmVKUXVlcnlQbHVnaW4oTW9kYWwpXG5cbmV4cG9ydCBkZWZhdWx0IE1vZGFsXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIG9mZmNhbnZhcy5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vYmFzZS1jb21wb25lbnQuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi9kb20vc2VsZWN0b3ItZW5naW5lLmpzJ1xuaW1wb3J0IEJhY2tkcm9wIGZyb20gJy4vdXRpbC9iYWNrZHJvcC5qcydcbmltcG9ydCB7IGVuYWJsZURpc21pc3NUcmlnZ2VyIH0gZnJvbSAnLi91dGlsL2NvbXBvbmVudC1mdW5jdGlvbnMuanMnXG5pbXBvcnQgRm9jdXNUcmFwIGZyb20gJy4vdXRpbC9mb2N1c3RyYXAuanMnXG5pbXBvcnQge1xuICBkZWZpbmVKUXVlcnlQbHVnaW4sXG4gIGlzRGlzYWJsZWQsXG4gIGlzVmlzaWJsZVxufSBmcm9tICcuL3V0aWwvaW5kZXguanMnXG5pbXBvcnQgU2Nyb2xsQmFySGVscGVyIGZyb20gJy4vdXRpbC9zY3JvbGxiYXIuanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdvZmZjYW52YXMnXG5jb25zdCBEQVRBX0tFWSA9ICdicy5vZmZjYW52YXMnXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuY29uc3QgREFUQV9BUElfS0VZID0gJy5kYXRhLWFwaSdcbmNvbnN0IEVWRU5UX0xPQURfREFUQV9BUEkgPSBgbG9hZCR7RVZFTlRfS0VZfSR7REFUQV9BUElfS0VZfWBcbmNvbnN0IEVTQ0FQRV9LRVkgPSAnRXNjYXBlJ1xuXG5jb25zdCBDTEFTU19OQU1FX1NIT1cgPSAnc2hvdydcbmNvbnN0IENMQVNTX05BTUVfU0hPV0lORyA9ICdzaG93aW5nJ1xuY29uc3QgQ0xBU1NfTkFNRV9ISURJTkcgPSAnaGlkaW5nJ1xuY29uc3QgQ0xBU1NfTkFNRV9CQUNLRFJPUCA9ICdvZmZjYW52YXMtYmFja2Ryb3AnXG5jb25zdCBPUEVOX1NFTEVDVE9SID0gJy5vZmZjYW52YXMuc2hvdydcblxuY29uc3QgRVZFTlRfU0hPVyA9IGBzaG93JHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfU0hPV04gPSBgc2hvd24ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9ISURFID0gYGhpZGUke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9ISURFX1BSRVZFTlRFRCA9IGBoaWRlUHJldmVudGVkJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfSElEREVOID0gYGhpZGRlbiR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX1JFU0laRSA9IGByZXNpemUke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9DTElDS19EQVRBX0FQSSA9IGBjbGljayR7RVZFTlRfS0VZfSR7REFUQV9BUElfS0VZfWBcbmNvbnN0IEVWRU5UX0tFWURPV05fRElTTUlTUyA9IGBrZXlkb3duLmRpc21pc3Mke0VWRU5UX0tFWX1gXG5cbmNvbnN0IFNFTEVDVE9SX0RBVEFfVE9HR0xFID0gJ1tkYXRhLWJzLXRvZ2dsZT1cIm9mZmNhbnZhc1wiXSdcblxuY29uc3QgRGVmYXVsdCA9IHtcbiAgYmFja2Ryb3A6IHRydWUsXG4gIGtleWJvYXJkOiB0cnVlLFxuICBzY3JvbGw6IGZhbHNlXG59XG5cbmNvbnN0IERlZmF1bHRUeXBlID0ge1xuICBiYWNrZHJvcDogJyhib29sZWFufHN0cmluZyknLFxuICBrZXlib2FyZDogJ2Jvb2xlYW4nLFxuICBzY3JvbGw6ICdib29sZWFuJ1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBPZmZjYW52YXMgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgY29uZmlnKVxuXG4gICAgdGhpcy5faXNTaG93biA9IGZhbHNlXG4gICAgdGhpcy5fYmFja2Ryb3AgPSB0aGlzLl9pbml0aWFsaXplQmFja0Ryb3AoKVxuICAgIHRoaXMuX2ZvY3VzdHJhcCA9IHRoaXMuX2luaXRpYWxpemVGb2N1c1RyYXAoKVxuICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKClcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgdG9nZ2xlKHJlbGF0ZWRUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy5faXNTaG93biA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KHJlbGF0ZWRUYXJnZXQpXG4gIH1cblxuICBzaG93KHJlbGF0ZWRUYXJnZXQpIHtcbiAgICBpZiAodGhpcy5faXNTaG93bikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc2hvd0V2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPVywgeyByZWxhdGVkVGFyZ2V0IH0pXG5cbiAgICBpZiAoc2hvd0V2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2lzU2hvd24gPSB0cnVlXG4gICAgdGhpcy5fYmFja2Ryb3Auc2hvdygpXG5cbiAgICBpZiAoIXRoaXMuX2NvbmZpZy5zY3JvbGwpIHtcbiAgICAgIG5ldyBTY3JvbGxCYXJIZWxwZXIoKS5oaWRlKClcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsIHRydWUpXG4gICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAnZGlhbG9nJylcbiAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XSU5HKVxuXG4gICAgY29uc3QgY29tcGxldGVDYWxsQmFjayA9ICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fY29uZmlnLnNjcm9sbCB8fCB0aGlzLl9jb25maWcuYmFja2Ryb3ApIHtcbiAgICAgICAgdGhpcy5fZm9jdXN0cmFwLmFjdGl2YXRlKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVylcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1dJTkcpXG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XTiwgeyByZWxhdGVkVGFyZ2V0IH0pXG4gICAgfVxuXG4gICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZUNhbGxCYWNrLCB0aGlzLl9lbGVtZW50LCB0cnVlKVxuICB9XG5cbiAgaGlkZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU2hvd24pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGhpZGVFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJREUpXG5cbiAgICBpZiAoaGlkZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2ZvY3VzdHJhcC5kZWFjdGl2YXRlKClcbiAgICB0aGlzLl9lbGVtZW50LmJsdXIoKVxuICAgIHRoaXMuX2lzU2hvd24gPSBmYWxzZVxuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0hJRElORylcbiAgICB0aGlzLl9iYWNrZHJvcC5oaWRlKClcblxuICAgIGNvbnN0IGNvbXBsZXRlQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TSE9XLCBDTEFTU19OQU1FX0hJRElORylcbiAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLW1vZGFsJylcbiAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdyb2xlJylcblxuICAgICAgaWYgKCF0aGlzLl9jb25maWcuc2Nyb2xsKSB7XG4gICAgICAgIG5ldyBTY3JvbGxCYXJIZWxwZXIoKS5yZXNldCgpXG4gICAgICB9XG5cbiAgICAgIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJRERFTilcbiAgICB9XG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlQ2FsbGJhY2ssIHRoaXMuX2VsZW1lbnQsIHRydWUpXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2JhY2tkcm9wLmRpc3Bvc2UoKVxuICAgIHRoaXMuX2ZvY3VzdHJhcC5kZWFjdGl2YXRlKClcbiAgICBzdXBlci5kaXNwb3NlKClcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2luaXRpYWxpemVCYWNrRHJvcCgpIHtcbiAgICBjb25zdCBjbGlja0NhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2NvbmZpZy5iYWNrZHJvcCA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfSElERV9QUkVWRU5URUQpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLmhpZGUoKVxuICAgIH1cblxuICAgIC8vICdzdGF0aWMnIG9wdGlvbiB3aWxsIGJlIHRyYW5zbGF0ZWQgdG8gdHJ1ZSwgYW5kIGJvb2xlYW5zIHdpbGwga2VlcCB0aGVpciB2YWx1ZVxuICAgIGNvbnN0IGlzVmlzaWJsZSA9IEJvb2xlYW4odGhpcy5fY29uZmlnLmJhY2tkcm9wKVxuXG4gICAgcmV0dXJuIG5ldyBCYWNrZHJvcCh7XG4gICAgICBjbGFzc05hbWU6IENMQVNTX05BTUVfQkFDS0RST1AsXG4gICAgICBpc1Zpc2libGUsXG4gICAgICBpc0FuaW1hdGVkOiB0cnVlLFxuICAgICAgcm9vdEVsZW1lbnQ6IHRoaXMuX2VsZW1lbnQucGFyZW50Tm9kZSxcbiAgICAgIGNsaWNrQ2FsbGJhY2s6IGlzVmlzaWJsZSA/IGNsaWNrQ2FsbGJhY2sgOiBudWxsXG4gICAgfSlcbiAgfVxuXG4gIF9pbml0aWFsaXplRm9jdXNUcmFwKCkge1xuICAgIHJldHVybiBuZXcgRm9jdXNUcmFwKHtcbiAgICAgIHRyYXBFbGVtZW50OiB0aGlzLl9lbGVtZW50XG4gICAgfSlcbiAgfVxuXG4gIF9hZGRFdmVudExpc3RlbmVycygpIHtcbiAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfS0VZRE9XTl9ESVNNSVNTLCBldmVudCA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSBFU0NBUEVfS0VZKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fY29uZmlnLmtleWJvYXJkKSB7XG4gICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9ISURFX1BSRVZFTlRFRClcbiAgICB9KVxuICB9XG5cbiAgLy8gU3RhdGljXG4gIHN0YXRpYyBqUXVlcnlJbnRlcmZhY2UoY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkYXRhID0gT2ZmY2FudmFzLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhW2NvbmZpZ10gPT09IHVuZGVmaW5lZCB8fCBjb25maWcuc3RhcnRzV2l0aCgnXycpIHx8IGNvbmZpZyA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApXG4gICAgICB9XG5cbiAgICAgIGRhdGFbY29uZmlnXSh0aGlzKVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBEYXRhIEFQSSBpbXBsZW1lbnRhdGlvblxuICovXG5cbkV2ZW50SGFuZGxlci5vbihkb2N1bWVudCwgRVZFTlRfQ0xJQ0tfREFUQV9BUEksIFNFTEVDVE9SX0RBVEFfVE9HR0xFLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc3QgdGFyZ2V0ID0gU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3Rvcih0aGlzKVxuXG4gIGlmIChbJ0EnLCAnQVJFQSddLmluY2x1ZGVzKHRoaXMudGFnTmFtZSkpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBpZiAoaXNEaXNhYmxlZCh0aGlzKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgRXZlbnRIYW5kbGVyLm9uZSh0YXJnZXQsIEVWRU5UX0hJRERFTiwgKCkgPT4ge1xuICAgIC8vIGZvY3VzIG9uIHRyaWdnZXIgd2hlbiBpdCBpcyBjbG9zZWRcbiAgICBpZiAoaXNWaXNpYmxlKHRoaXMpKSB7XG4gICAgICB0aGlzLmZvY3VzKClcbiAgICB9XG4gIH0pXG5cbiAgLy8gYXZvaWQgY29uZmxpY3Qgd2hlbiBjbGlja2luZyBhIHRvZ2dsZXIgb2YgYW4gb2ZmY2FudmFzLCB3aGlsZSBhbm90aGVyIGlzIG9wZW5cbiAgY29uc3QgYWxyZWFkeU9wZW4gPSBTZWxlY3RvckVuZ2luZS5maW5kT25lKE9QRU5fU0VMRUNUT1IpXG4gIGlmIChhbHJlYWR5T3BlbiAmJiBhbHJlYWR5T3BlbiAhPT0gdGFyZ2V0KSB7XG4gICAgT2ZmY2FudmFzLmdldEluc3RhbmNlKGFscmVhZHlPcGVuKS5oaWRlKClcbiAgfVxuXG4gIGNvbnN0IGRhdGEgPSBPZmZjYW52YXMuZ2V0T3JDcmVhdGVJbnN0YW5jZSh0YXJnZXQpXG4gIGRhdGEudG9nZ2xlKHRoaXMpXG59KVxuXG5FdmVudEhhbmRsZXIub24od2luZG93LCBFVkVOVF9MT0FEX0RBVEFfQVBJLCAoKSA9PiB7XG4gIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgU2VsZWN0b3JFbmdpbmUuZmluZChPUEVOX1NFTEVDVE9SKSkge1xuICAgIE9mZmNhbnZhcy5nZXRPckNyZWF0ZUluc3RhbmNlKHNlbGVjdG9yKS5zaG93KClcbiAgfVxufSlcblxuRXZlbnRIYW5kbGVyLm9uKHdpbmRvdywgRVZFTlRfUkVTSVpFLCAoKSA9PiB7XG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiBTZWxlY3RvckVuZ2luZS5maW5kKCdbYXJpYS1tb2RhbF1bY2xhc3MqPXNob3ddW2NsYXNzKj1vZmZjYW52YXMtXScpKSB7XG4gICAgaWYgKGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgIE9mZmNhbnZhcy5nZXRPckNyZWF0ZUluc3RhbmNlKGVsZW1lbnQpLmhpZGUoKVxuICAgIH1cbiAgfVxufSlcblxuZW5hYmxlRGlzbWlzc1RyaWdnZXIoT2ZmY2FudmFzKVxuXG4vKipcbiAqIGpRdWVyeVxuICovXG5cbmRlZmluZUpRdWVyeVBsdWdpbihPZmZjYW52YXMpXG5cbmV4cG9ydCBkZWZhdWx0IE9mZmNhbnZhc1xuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCB1dGlsL3Nhbml0aXplci5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbi8vIGpzLWRvY3Mtc3RhcnQgYWxsb3ctbGlzdFxuY29uc3QgQVJJQV9BVFRSSUJVVEVfUEFUVEVSTiA9IC9eYXJpYS1bXFx3LV0qJC9pXG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0QWxsb3dsaXN0ID0ge1xuICAvLyBHbG9iYWwgYXR0cmlidXRlcyBhbGxvd2VkIG9uIGFueSBzdXBwbGllZCBlbGVtZW50IGJlbG93LlxuICAnKic6IFsnY2xhc3MnLCAnZGlyJywgJ2lkJywgJ2xhbmcnLCAncm9sZScsIEFSSUFfQVRUUklCVVRFX1BBVFRFUk5dLFxuICBhOiBbJ3RhcmdldCcsICdocmVmJywgJ3RpdGxlJywgJ3JlbCddLFxuICBhcmVhOiBbXSxcbiAgYjogW10sXG4gIGJyOiBbXSxcbiAgY29sOiBbXSxcbiAgY29kZTogW10sXG4gIGRkOiBbXSxcbiAgZGl2OiBbXSxcbiAgZGw6IFtdLFxuICBkdDogW10sXG4gIGVtOiBbXSxcbiAgaHI6IFtdLFxuICBoMTogW10sXG4gIGgyOiBbXSxcbiAgaDM6IFtdLFxuICBoNDogW10sXG4gIGg1OiBbXSxcbiAgaDY6IFtdLFxuICBpOiBbXSxcbiAgaW1nOiBbJ3NyYycsICdzcmNzZXQnLCAnYWx0JywgJ3RpdGxlJywgJ3dpZHRoJywgJ2hlaWdodCddLFxuICBsaTogW10sXG4gIG9sOiBbXSxcbiAgcDogW10sXG4gIHByZTogW10sXG4gIHM6IFtdLFxuICBzbWFsbDogW10sXG4gIHNwYW46IFtdLFxuICBzdWI6IFtdLFxuICBzdXA6IFtdLFxuICBzdHJvbmc6IFtdLFxuICB1OiBbXSxcbiAgdWw6IFtdXG59XG4vLyBqcy1kb2NzLWVuZCBhbGxvdy1saXN0XG5cbmNvbnN0IHVyaUF0dHJpYnV0ZXMgPSBuZXcgU2V0KFtcbiAgJ2JhY2tncm91bmQnLFxuICAnY2l0ZScsXG4gICdocmVmJyxcbiAgJ2l0ZW10eXBlJyxcbiAgJ2xvbmdkZXNjJyxcbiAgJ3Bvc3RlcicsXG4gICdzcmMnLFxuICAneGxpbms6aHJlZidcbl0pXG5cbi8qKlxuICogQSBwYXR0ZXJuIHRoYXQgcmVjb2duaXplcyBVUkxzIHRoYXQgYXJlIHNhZmUgd3J0LiBYU1MgaW4gVVJMIG5hdmlnYXRpb25cbiAqIGNvbnRleHRzLlxuICpcbiAqIFNob3V0LW91dCB0byBBbmd1bGFyIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi8xNS4yLjgvcGFja2FnZXMvY29yZS9zcmMvc2FuaXRpemF0aW9uL3VybF9zYW5pdGl6ZXIudHMjTDM4XG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSB1bmljb3JuL2JldHRlci1yZWdleFxuY29uc3QgU0FGRV9VUkxfUEFUVEVSTiA9IC9eKD8hamF2YXNjcmlwdDopKD86W2EtejAtOSsuLV0rOnxbXiY6Lz8jXSooPzpbLz8jXXwkKSkvaVxuXG5jb25zdCBhbGxvd2VkQXR0cmlidXRlID0gKGF0dHJpYnV0ZSwgYWxsb3dlZEF0dHJpYnV0ZUxpc3QpID0+IHtcbiAgY29uc3QgYXR0cmlidXRlTmFtZSA9IGF0dHJpYnV0ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXG5cbiAgaWYgKGFsbG93ZWRBdHRyaWJ1dGVMaXN0LmluY2x1ZGVzKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgaWYgKHVyaUF0dHJpYnV0ZXMuaGFzKGF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbihTQUZFX1VSTF9QQVRURVJOLnRlc3QoYXR0cmlidXRlLm5vZGVWYWx1ZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIENoZWNrIGlmIGEgcmVndWxhciBleHByZXNzaW9uIHZhbGlkYXRlcyB0aGUgYXR0cmlidXRlLlxuICByZXR1cm4gYWxsb3dlZEF0dHJpYnV0ZUxpc3QuZmlsdGVyKGF0dHJpYnV0ZVJlZ2V4ID0+IGF0dHJpYnV0ZVJlZ2V4IGluc3RhbmNlb2YgUmVnRXhwKVxuICAgIC5zb21lKHJlZ2V4ID0+IHJlZ2V4LnRlc3QoYXR0cmlidXRlTmFtZSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZUh0bWwodW5zYWZlSHRtbCwgYWxsb3dMaXN0LCBzYW5pdGl6ZUZ1bmN0aW9uKSB7XG4gIGlmICghdW5zYWZlSHRtbC5sZW5ndGgpIHtcbiAgICByZXR1cm4gdW5zYWZlSHRtbFxuICB9XG5cbiAgaWYgKHNhbml0aXplRnVuY3Rpb24gJiYgdHlwZW9mIHNhbml0aXplRnVuY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gc2FuaXRpemVGdW5jdGlvbih1bnNhZmVIdG1sKVxuICB9XG5cbiAgY29uc3QgZG9tUGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKVxuICBjb25zdCBjcmVhdGVkRG9jdW1lbnQgPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHVuc2FmZUh0bWwsICd0ZXh0L2h0bWwnKVxuICBjb25zdCBlbGVtZW50cyA9IFtdLmNvbmNhdCguLi5jcmVhdGVkRG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yQWxsKCcqJykpXG5cbiAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgY29uc3QgZWxlbWVudE5hbWUgPSBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcblxuICAgIGlmICghT2JqZWN0LmtleXMoYWxsb3dMaXN0KS5pbmNsdWRlcyhlbGVtZW50TmFtZSkpIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlKClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgY29uc3QgYXR0cmlidXRlTGlzdCA9IFtdLmNvbmNhdCguLi5lbGVtZW50LmF0dHJpYnV0ZXMpXG4gICAgY29uc3QgYWxsb3dlZEF0dHJpYnV0ZXMgPSBbXS5jb25jYXQoYWxsb3dMaXN0WycqJ10gfHwgW10sIGFsbG93TGlzdFtlbGVtZW50TmFtZV0gfHwgW10pXG5cbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRyaWJ1dGVMaXN0KSB7XG4gICAgICBpZiAoIWFsbG93ZWRBdHRyaWJ1dGUoYXR0cmlidXRlLCBhbGxvd2VkQXR0cmlidXRlcykpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlLm5vZGVOYW1lKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVkRG9jdW1lbnQuYm9keS5pbm5lckhUTUxcbn1cbiIsICIvKipcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBCb290c3RyYXAgdXRpbC90ZW1wbGF0ZS1mYWN0b3J5LmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0IFNlbGVjdG9yRW5naW5lIGZyb20gJy4uL2RvbS9zZWxlY3Rvci1lbmdpbmUuanMnXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnLmpzJ1xuaW1wb3J0IHsgRGVmYXVsdEFsbG93bGlzdCwgc2FuaXRpemVIdG1sIH0gZnJvbSAnLi9zYW5pdGl6ZXIuanMnXG5pbXBvcnQgeyBleGVjdXRlLCBnZXRFbGVtZW50LCBpc0VsZW1lbnQgfSBmcm9tICcuL2luZGV4LmpzJ1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IE5BTUUgPSAnVGVtcGxhdGVGYWN0b3J5J1xuXG5jb25zdCBEZWZhdWx0ID0ge1xuICBhbGxvd0xpc3Q6IERlZmF1bHRBbGxvd2xpc3QsXG4gIGNvbnRlbnQ6IHt9LCAvLyB7IHNlbGVjdG9yIDogdGV4dCAsICBzZWxlY3RvcjIgOiB0ZXh0MiAsIH1cbiAgZXh0cmFDbGFzczogJycsXG4gIGh0bWw6IGZhbHNlLFxuICBzYW5pdGl6ZTogdHJ1ZSxcbiAgc2FuaXRpemVGbjogbnVsbCxcbiAgdGVtcGxhdGU6ICc8ZGl2PjwvZGl2Pidcbn1cblxuY29uc3QgRGVmYXVsdFR5cGUgPSB7XG4gIGFsbG93TGlzdDogJ29iamVjdCcsXG4gIGNvbnRlbnQ6ICdvYmplY3QnLFxuICBleHRyYUNsYXNzOiAnKHN0cmluZ3xmdW5jdGlvbiknLFxuICBodG1sOiAnYm9vbGVhbicsXG4gIHNhbml0aXplOiAnYm9vbGVhbicsXG4gIHNhbml0aXplRm46ICcobnVsbHxmdW5jdGlvbiknLFxuICB0ZW1wbGF0ZTogJ3N0cmluZydcbn1cblxuY29uc3QgRGVmYXVsdENvbnRlbnRUeXBlID0ge1xuICBlbnRyeTogJyhzdHJpbmd8ZWxlbWVudHxmdW5jdGlvbnxudWxsKScsXG4gIHNlbGVjdG9yOiAnKHN0cmluZ3xlbGVtZW50KSdcbn1cblxuLyoqXG4gKiBDbGFzcyBkZWZpbml0aW9uXG4gKi9cblxuY2xhc3MgVGVtcGxhdGVGYWN0b3J5IGV4dGVuZHMgQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX2NvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhjb25maWcpXG4gIH1cblxuICAvLyBHZXR0ZXJzXG4gIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICByZXR1cm4gRGVmYXVsdFxuICB9XG5cbiAgc3RhdGljIGdldCBEZWZhdWx0VHlwZSgpIHtcbiAgICByZXR1cm4gRGVmYXVsdFR5cGVcbiAgfVxuXG4gIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICByZXR1cm4gTkFNRVxuICB9XG5cbiAgLy8gUHVibGljXG4gIGdldENvbnRlbnQoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5fY29uZmlnLmNvbnRlbnQpXG4gICAgICAubWFwKGNvbmZpZyA9PiB0aGlzLl9yZXNvbHZlUG9zc2libGVGdW5jdGlvbihjb25maWcpKVxuICAgICAgLmZpbHRlcihCb29sZWFuKVxuICB9XG5cbiAgaGFzQ29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb250ZW50KCkubGVuZ3RoID4gMFxuICB9XG5cbiAgY2hhbmdlQ29udGVudChjb250ZW50KSB7XG4gICAgdGhpcy5fY2hlY2tDb250ZW50KGNvbnRlbnQpXG4gICAgdGhpcy5fY29uZmlnLmNvbnRlbnQgPSB7IC4uLnRoaXMuX2NvbmZpZy5jb250ZW50LCAuLi5jb250ZW50IH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdG9IdG1sKCkge1xuICAgIGNvbnN0IHRlbXBsYXRlV3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGVtcGxhdGVXcmFwcGVyLmlubmVySFRNTCA9IHRoaXMuX21heWJlU2FuaXRpemUodGhpcy5fY29uZmlnLnRlbXBsYXRlKVxuXG4gICAgZm9yIChjb25zdCBbc2VsZWN0b3IsIHRleHRdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX2NvbmZpZy5jb250ZW50KSkge1xuICAgICAgdGhpcy5fc2V0Q29udGVudCh0ZW1wbGF0ZVdyYXBwZXIsIHRleHQsIHNlbGVjdG9yKVxuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlID0gdGVtcGxhdGVXcmFwcGVyLmNoaWxkcmVuWzBdXG4gICAgY29uc3QgZXh0cmFDbGFzcyA9IHRoaXMuX3Jlc29sdmVQb3NzaWJsZUZ1bmN0aW9uKHRoaXMuX2NvbmZpZy5leHRyYUNsYXNzKVxuXG4gICAgaWYgKGV4dHJhQ2xhc3MpIHtcbiAgICAgIHRlbXBsYXRlLmNsYXNzTGlzdC5hZGQoLi4uZXh0cmFDbGFzcy5zcGxpdCgnICcpKVxuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZVxuICB9XG5cbiAgLy8gUHJpdmF0ZVxuICBfdHlwZUNoZWNrQ29uZmlnKGNvbmZpZykge1xuICAgIHN1cGVyLl90eXBlQ2hlY2tDb25maWcoY29uZmlnKVxuICAgIHRoaXMuX2NoZWNrQ29udGVudChjb25maWcuY29udGVudClcbiAgfVxuXG4gIF9jaGVja0NvbnRlbnQoYXJnKSB7XG4gICAgZm9yIChjb25zdCBbc2VsZWN0b3IsIGNvbnRlbnRdIG9mIE9iamVjdC5lbnRyaWVzKGFyZykpIHtcbiAgICAgIHN1cGVyLl90eXBlQ2hlY2tDb25maWcoeyBzZWxlY3RvciwgZW50cnk6IGNvbnRlbnQgfSwgRGVmYXVsdENvbnRlbnRUeXBlKVxuICAgIH1cbiAgfVxuXG4gIF9zZXRDb250ZW50KHRlbXBsYXRlLCBjb250ZW50LCBzZWxlY3Rvcikge1xuICAgIGNvbnN0IHRlbXBsYXRlRWxlbWVudCA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoc2VsZWN0b3IsIHRlbXBsYXRlKVxuXG4gICAgaWYgKCF0ZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnRlbnQgPSB0aGlzLl9yZXNvbHZlUG9zc2libGVGdW5jdGlvbihjb250ZW50KVxuXG4gICAgaWYgKCFjb250ZW50KSB7XG4gICAgICB0ZW1wbGF0ZUVsZW1lbnQucmVtb3ZlKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChpc0VsZW1lbnQoY29udGVudCkpIHtcbiAgICAgIHRoaXMuX3B1dEVsZW1lbnRJblRlbXBsYXRlKGdldEVsZW1lbnQoY29udGVudCksIHRlbXBsYXRlRWxlbWVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLl9jb25maWcuaHRtbCkge1xuICAgICAgdGVtcGxhdGVFbGVtZW50LmlubmVySFRNTCA9IHRoaXMuX21heWJlU2FuaXRpemUoY29udGVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRlbXBsYXRlRWxlbWVudC50ZXh0Q29udGVudCA9IGNvbnRlbnRcbiAgfVxuXG4gIF9tYXliZVNhbml0aXplKGFyZykge1xuICAgIHJldHVybiB0aGlzLl9jb25maWcuc2FuaXRpemUgPyBzYW5pdGl6ZUh0bWwoYXJnLCB0aGlzLl9jb25maWcuYWxsb3dMaXN0LCB0aGlzLl9jb25maWcuc2FuaXRpemVGbikgOiBhcmdcbiAgfVxuXG4gIF9yZXNvbHZlUG9zc2libGVGdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZXhlY3V0ZShhcmcsIFt0aGlzXSlcbiAgfVxuXG4gIF9wdXRFbGVtZW50SW5UZW1wbGF0ZShlbGVtZW50LCB0ZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmh0bWwpIHtcbiAgICAgIHRlbXBsYXRlRWxlbWVudC5pbm5lckhUTUwgPSAnJ1xuICAgICAgdGVtcGxhdGVFbGVtZW50LmFwcGVuZChlbGVtZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGVtcGxhdGVFbGVtZW50LnRleHRDb250ZW50ID0gZWxlbWVudC50ZXh0Q29udGVudFxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRlbXBsYXRlRmFjdG9yeVxuIiwgIi8qKlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIEJvb3RzdHJhcCB0b29sdGlwLmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0ICogYXMgUG9wcGVyIGZyb20gJ0Bwb3BwZXJqcy9jb3JlJ1xuaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9iYXNlLWNvbXBvbmVudC5qcydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi9kb20vZXZlbnQtaGFuZGxlci5qcydcbmltcG9ydCBNYW5pcHVsYXRvciBmcm9tICcuL2RvbS9tYW5pcHVsYXRvci5qcydcbmltcG9ydCB7XG4gIGRlZmluZUpRdWVyeVBsdWdpbiwgZXhlY3V0ZSwgZmluZFNoYWRvd1Jvb3QsIGdldEVsZW1lbnQsIGdldFVJRCwgaXNSVEwsIG5vb3Bcbn0gZnJvbSAnLi91dGlsL2luZGV4LmpzJ1xuaW1wb3J0IHsgRGVmYXVsdEFsbG93bGlzdCB9IGZyb20gJy4vdXRpbC9zYW5pdGl6ZXIuanMnXG5pbXBvcnQgVGVtcGxhdGVGYWN0b3J5IGZyb20gJy4vdXRpbC90ZW1wbGF0ZS1mYWN0b3J5LmpzJ1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IE5BTUUgPSAndG9vbHRpcCdcbmNvbnN0IERJU0FMTE9XRURfQVRUUklCVVRFUyA9IG5ldyBTZXQoWydzYW5pdGl6ZScsICdhbGxvd0xpc3QnLCAnc2FuaXRpemVGbiddKVxuXG5jb25zdCBDTEFTU19OQU1FX0ZBREUgPSAnZmFkZSdcbmNvbnN0IENMQVNTX05BTUVfTU9EQUwgPSAnbW9kYWwnXG5jb25zdCBDTEFTU19OQU1FX1NIT1cgPSAnc2hvdydcblxuY29uc3QgU0VMRUNUT1JfVE9PTFRJUF9JTk5FUiA9ICcudG9vbHRpcC1pbm5lcidcbmNvbnN0IFNFTEVDVE9SX01PREFMID0gYC4ke0NMQVNTX05BTUVfTU9EQUx9YFxuXG5jb25zdCBFVkVOVF9NT0RBTF9ISURFID0gJ2hpZGUuYnMubW9kYWwnXG5cbmNvbnN0IFRSSUdHRVJfSE9WRVIgPSAnaG92ZXInXG5jb25zdCBUUklHR0VSX0ZPQ1VTID0gJ2ZvY3VzJ1xuY29uc3QgVFJJR0dFUl9DTElDSyA9ICdjbGljaydcbmNvbnN0IFRSSUdHRVJfTUFOVUFMID0gJ21hbnVhbCdcblxuY29uc3QgRVZFTlRfSElERSA9ICdoaWRlJ1xuY29uc3QgRVZFTlRfSElEREVOID0gJ2hpZGRlbidcbmNvbnN0IEVWRU5UX1NIT1cgPSAnc2hvdydcbmNvbnN0IEVWRU5UX1NIT1dOID0gJ3Nob3duJ1xuY29uc3QgRVZFTlRfSU5TRVJURUQgPSAnaW5zZXJ0ZWQnXG5jb25zdCBFVkVOVF9DTElDSyA9ICdjbGljaydcbmNvbnN0IEVWRU5UX0ZPQ1VTSU4gPSAnZm9jdXNpbidcbmNvbnN0IEVWRU5UX0ZPQ1VTT1VUID0gJ2ZvY3Vzb3V0J1xuY29uc3QgRVZFTlRfTU9VU0VFTlRFUiA9ICdtb3VzZWVudGVyJ1xuY29uc3QgRVZFTlRfTU9VU0VMRUFWRSA9ICdtb3VzZWxlYXZlJ1xuXG5jb25zdCBBdHRhY2htZW50TWFwID0ge1xuICBBVVRPOiAnYXV0bycsXG4gIFRPUDogJ3RvcCcsXG4gIFJJR0hUOiBpc1JUTCgpID8gJ2xlZnQnIDogJ3JpZ2h0JyxcbiAgQk9UVE9NOiAnYm90dG9tJyxcbiAgTEVGVDogaXNSVEwoKSA/ICdyaWdodCcgOiAnbGVmdCdcbn1cblxuY29uc3QgRGVmYXVsdCA9IHtcbiAgYWxsb3dMaXN0OiBEZWZhdWx0QWxsb3dsaXN0LFxuICBhbmltYXRpb246IHRydWUsXG4gIGJvdW5kYXJ5OiAnY2xpcHBpbmdQYXJlbnRzJyxcbiAgY29udGFpbmVyOiBmYWxzZSxcbiAgY3VzdG9tQ2xhc3M6ICcnLFxuICBkZWxheTogMCxcbiAgZmFsbGJhY2tQbGFjZW1lbnRzOiBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCddLFxuICBodG1sOiBmYWxzZSxcbiAgb2Zmc2V0OiBbMCwgNl0sXG4gIHBsYWNlbWVudDogJ3RvcCcsXG4gIHBvcHBlckNvbmZpZzogbnVsbCxcbiAgc2FuaXRpemU6IHRydWUsXG4gIHNhbml0aXplRm46IG51bGwsXG4gIHNlbGVjdG9yOiBmYWxzZSxcbiAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidG9vbHRpcFwiIHJvbGU9XCJ0b29sdGlwXCI+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicsXG4gIHRpdGxlOiAnJyxcbiAgdHJpZ2dlcjogJ2hvdmVyIGZvY3VzJ1xufVxuXG5jb25zdCBEZWZhdWx0VHlwZSA9IHtcbiAgYWxsb3dMaXN0OiAnb2JqZWN0JyxcbiAgYW5pbWF0aW9uOiAnYm9vbGVhbicsXG4gIGJvdW5kYXJ5OiAnKHN0cmluZ3xlbGVtZW50KScsXG4gIGNvbnRhaW5lcjogJyhzdHJpbmd8ZWxlbWVudHxib29sZWFuKScsXG4gIGN1c3RvbUNsYXNzOiAnKHN0cmluZ3xmdW5jdGlvbiknLFxuICBkZWxheTogJyhudW1iZXJ8b2JqZWN0KScsXG4gIGZhbGxiYWNrUGxhY2VtZW50czogJ2FycmF5JyxcbiAgaHRtbDogJ2Jvb2xlYW4nLFxuICBvZmZzZXQ6ICcoYXJyYXl8c3RyaW5nfGZ1bmN0aW9uKScsXG4gIHBsYWNlbWVudDogJyhzdHJpbmd8ZnVuY3Rpb24pJyxcbiAgcG9wcGVyQ29uZmlnOiAnKG51bGx8b2JqZWN0fGZ1bmN0aW9uKScsXG4gIHNhbml0aXplOiAnYm9vbGVhbicsXG4gIHNhbml0aXplRm46ICcobnVsbHxmdW5jdGlvbiknLFxuICBzZWxlY3RvcjogJyhzdHJpbmd8Ym9vbGVhbiknLFxuICB0ZW1wbGF0ZTogJ3N0cmluZycsXG4gIHRpdGxlOiAnKHN0cmluZ3xlbGVtZW50fGZ1bmN0aW9uKScsXG4gIHRyaWdnZXI6ICdzdHJpbmcnXG59XG5cbi8qKlxuICogQ2xhc3MgZGVmaW5pdGlvblxuICovXG5cbmNsYXNzIFRvb2x0aXAgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgaWYgKHR5cGVvZiBQb3BwZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb290c3RyYXBcXCdzIHRvb2x0aXBzIHJlcXVpcmUgUG9wcGVyIChodHRwczovL3BvcHBlci5qcy5vcmcpJylcbiAgICB9XG5cbiAgICBzdXBlcihlbGVtZW50LCBjb25maWcpXG5cbiAgICAvLyBQcml2YXRlXG4gICAgdGhpcy5faXNFbmFibGVkID0gdHJ1ZVxuICAgIHRoaXMuX3RpbWVvdXQgPSAwXG4gICAgdGhpcy5faXNIb3ZlcmVkID0gbnVsbFxuICAgIHRoaXMuX2FjdGl2ZVRyaWdnZXIgPSB7fVxuICAgIHRoaXMuX3BvcHBlciA9IG51bGxcbiAgICB0aGlzLl90ZW1wbGF0ZUZhY3RvcnkgPSBudWxsXG4gICAgdGhpcy5fbmV3Q29udGVudCA9IG51bGxcblxuICAgIC8vIFByb3RlY3RlZFxuICAgIHRoaXMudGlwID0gbnVsbFxuXG4gICAgdGhpcy5fc2V0TGlzdGVuZXJzKClcblxuICAgIGlmICghdGhpcy5fY29uZmlnLnNlbGVjdG9yKSB7XG4gICAgICB0aGlzLl9maXhUaXRsZSgpXG4gICAgfVxuICB9XG5cbiAgLy8gR2V0dGVyc1xuICBzdGF0aWMgZ2V0IERlZmF1bHQoKSB7XG4gICAgcmV0dXJuIERlZmF1bHRcbiAgfVxuXG4gIHN0YXRpYyBnZXQgRGVmYXVsdFR5cGUoKSB7XG4gICAgcmV0dXJuIERlZmF1bHRUeXBlXG4gIH1cblxuICBzdGF0aWMgZ2V0IE5BTUUoKSB7XG4gICAgcmV0dXJuIE5BTUVcbiAgfVxuXG4gIC8vIFB1YmxpY1xuICBlbmFibGUoKSB7XG4gICAgdGhpcy5faXNFbmFibGVkID0gdHJ1ZVxuICB9XG5cbiAgZGlzYWJsZSgpIHtcbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgdG9nZ2xlRW5hYmxlZCgpIHtcbiAgICB0aGlzLl9pc0VuYWJsZWQgPSAhdGhpcy5faXNFbmFibGVkXG4gIH1cblxuICB0b2dnbGUoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0VuYWJsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2FjdGl2ZVRyaWdnZXIuY2xpY2sgPSAhdGhpcy5fYWN0aXZlVHJpZ2dlci5jbGlja1xuICAgIGlmICh0aGlzLl9pc1Nob3duKCkpIHtcbiAgICAgIHRoaXMuX2xlYXZlKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2VudGVyKClcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXQpXG5cbiAgICBFdmVudEhhbmRsZXIub2ZmKHRoaXMuX2VsZW1lbnQuY2xvc2VzdChTRUxFQ1RPUl9NT0RBTCksIEVWRU5UX01PREFMX0hJREUsIHRoaXMuX2hpZGVNb2RhbEhhbmRsZXIpXG5cbiAgICBpZiAodGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtb3JpZ2luYWwtdGl0bGUnKSkge1xuICAgICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtb3JpZ2luYWwtdGl0bGUnKSlcbiAgICB9XG5cbiAgICB0aGlzLl9kaXNwb3NlUG9wcGVyKClcbiAgICBzdXBlci5kaXNwb3NlKClcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgaWYgKHRoaXMuX2VsZW1lbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSB1c2Ugc2hvdyBvbiB2aXNpYmxlIGVsZW1lbnRzJylcbiAgICB9XG5cbiAgICBpZiAoISh0aGlzLl9pc1dpdGhDb250ZW50KCkgJiYgdGhpcy5faXNFbmFibGVkKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3Qgc2hvd0V2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgdGhpcy5jb25zdHJ1Y3Rvci5ldmVudE5hbWUoRVZFTlRfU0hPVykpXG4gICAgY29uc3Qgc2hhZG93Um9vdCA9IGZpbmRTaGFkb3dSb290KHRoaXMuX2VsZW1lbnQpXG4gICAgY29uc3QgaXNJblRoZURvbSA9IChzaGFkb3dSb290IHx8IHRoaXMuX2VsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmNvbnRhaW5zKHRoaXMuX2VsZW1lbnQpXG5cbiAgICBpZiAoc2hvd0V2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgfHwgIWlzSW5UaGVEb20pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFRPRE86IHY2IHJlbW92ZSB0aGlzIG9yIG1ha2UgaXQgb3B0aW9uYWxcbiAgICB0aGlzLl9kaXNwb3NlUG9wcGVyKClcblxuICAgIGNvbnN0IHRpcCA9IHRoaXMuX2dldFRpcEVsZW1lbnQoKVxuXG4gICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aXAuZ2V0QXR0cmlidXRlKCdpZCcpKVxuXG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMuX2NvbmZpZ1xuXG4gICAgaWYgKCF0aGlzLl9lbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKHRoaXMudGlwKSkge1xuICAgICAgY29udGFpbmVyLmFwcGVuZCh0aXApXG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9JTlNFUlRFRCkpXG4gICAgfVxuXG4gICAgdGhpcy5fcG9wcGVyID0gdGhpcy5fY3JlYXRlUG9wcGVyKHRpcClcblxuICAgIHRpcC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVylcblxuICAgIC8vIElmIHRoaXMgaXMgYSB0b3VjaC1lbmFibGVkIGRldmljZSB3ZSBhZGQgZXh0cmFcbiAgICAvLyBlbXB0eSBtb3VzZW92ZXIgbGlzdGVuZXJzIHRvIHRoZSBib2R5J3MgaW1tZWRpYXRlIGNoaWxkcmVuO1xuICAgIC8vIG9ubHkgbmVlZGVkIGJlY2F1c2Ugb2YgYnJva2VuIGV2ZW50IGRlbGVnYXRpb24gb24gaU9TXG4gICAgLy8gaHR0cHM6Ly93d3cucXVpcmtzbW9kZS5vcmcvYmxvZy9hcmNoaXZlcy8yMDE0LzAyL21vdXNlX2V2ZW50X2J1Yi5odG1sXG4gICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIFtdLmNvbmNhdCguLi5kb2N1bWVudC5ib2R5LmNoaWxkcmVuKSkge1xuICAgICAgICBFdmVudEhhbmRsZXIub24oZWxlbWVudCwgJ21vdXNlb3ZlcicsIG5vb3ApXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9TSE9XTikpXG5cbiAgICAgIGlmICh0aGlzLl9pc0hvdmVyZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuX2xlYXZlKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5faXNIb3ZlcmVkID0gZmFsc2VcbiAgICB9XG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCB0aGlzLnRpcCwgdGhpcy5faXNBbmltYXRlZCgpKVxuICB9XG5cbiAgaGlkZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzU2hvd24oKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaGlkZUV2ZW50ID0gRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgdGhpcy5jb25zdHJ1Y3Rvci5ldmVudE5hbWUoRVZFTlRfSElERSkpXG4gICAgaWYgKGhpZGVFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0aXAgPSB0aGlzLl9nZXRUaXBFbGVtZW50KClcbiAgICB0aXAuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1cpXG5cbiAgICAvLyBJZiB0aGlzIGlzIGEgdG91Y2gtZW5hYmxlZCBkZXZpY2Ugd2UgcmVtb3ZlIHRoZSBleHRyYVxuICAgIC8vIGVtcHR5IG1vdXNlb3ZlciBsaXN0ZW5lcnMgd2UgYWRkZWQgZm9yIGlPUyBzdXBwb3J0XG4gICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIFtdLmNvbmNhdCguLi5kb2N1bWVudC5ib2R5LmNoaWxkcmVuKSkge1xuICAgICAgICBFdmVudEhhbmRsZXIub2ZmKGVsZW1lbnQsICdtb3VzZW92ZXInLCBub29wKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2FjdGl2ZVRyaWdnZXJbVFJJR0dFUl9DTElDS10gPSBmYWxzZVxuICAgIHRoaXMuX2FjdGl2ZVRyaWdnZXJbVFJJR0dFUl9GT0NVU10gPSBmYWxzZVxuICAgIHRoaXMuX2FjdGl2ZVRyaWdnZXJbVFJJR0dFUl9IT1ZFUl0gPSBmYWxzZVxuICAgIHRoaXMuX2lzSG92ZXJlZCA9IG51bGwgLy8gaXQgaXMgYSB0cmljayB0byBzdXBwb3J0IG1hbnVhbCB0cmlnZ2VyaW5nXG5cbiAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9pc1dpdGhBY3RpdmVUcmlnZ2VyKCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5faXNIb3ZlcmVkKSB7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VQb3BwZXIoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScpXG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9ISURERU4pKVxuICAgIH1cblxuICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soY29tcGxldGUsIHRoaXMudGlwLCB0aGlzLl9pc0FuaW1hdGVkKCkpXG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3BvcHBlcikge1xuICAgICAgdGhpcy5fcG9wcGVyLnVwZGF0ZSgpXG4gICAgfVxuICB9XG5cbiAgLy8gUHJvdGVjdGVkXG4gIF9pc1dpdGhDb250ZW50KCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2dldFRpdGxlKCkpXG4gIH1cblxuICBfZ2V0VGlwRWxlbWVudCgpIHtcbiAgICBpZiAoIXRoaXMudGlwKSB7XG4gICAgICB0aGlzLnRpcCA9IHRoaXMuX2NyZWF0ZVRpcEVsZW1lbnQodGhpcy5fbmV3Q29udGVudCB8fCB0aGlzLl9nZXRDb250ZW50Rm9yVGVtcGxhdGUoKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50aXBcbiAgfVxuXG4gIF9jcmVhdGVUaXBFbGVtZW50KGNvbnRlbnQpIHtcbiAgICBjb25zdCB0aXAgPSB0aGlzLl9nZXRUZW1wbGF0ZUZhY3RvcnkoY29udGVudCkudG9IdG1sKClcblxuICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzIGNoZWNrIGluIHY2XG4gICAgaWYgKCF0aXApIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgdGlwLmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9GQURFLCBDTEFTU19OQU1FX1NIT1cpXG4gICAgLy8gVE9ETzogdjYgdGhlIGZvbGxvd2luZyBjYW4gYmUgYWNoaWV2ZWQgd2l0aCBDU1Mgb25seVxuICAgIHRpcC5jbGFzc0xpc3QuYWRkKGBicy0ke3RoaXMuY29uc3RydWN0b3IuTkFNRX0tYXV0b2ApXG5cbiAgICBjb25zdCB0aXBJZCA9IGdldFVJRCh0aGlzLmNvbnN0cnVjdG9yLk5BTUUpLnRvU3RyaW5nKClcblxuICAgIHRpcC5zZXRBdHRyaWJ1dGUoJ2lkJywgdGlwSWQpXG5cbiAgICBpZiAodGhpcy5faXNBbmltYXRlZCgpKSB7XG4gICAgICB0aXAuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0ZBREUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRpcFxuICB9XG5cbiAgc2V0Q29udGVudChjb250ZW50KSB7XG4gICAgdGhpcy5fbmV3Q29udGVudCA9IGNvbnRlbnRcbiAgICBpZiAodGhpcy5faXNTaG93bigpKSB7XG4gICAgICB0aGlzLl9kaXNwb3NlUG9wcGVyKClcbiAgICAgIHRoaXMuc2hvdygpXG4gICAgfVxuICB9XG5cbiAgX2dldFRlbXBsYXRlRmFjdG9yeShjb250ZW50KSB7XG4gICAgaWYgKHRoaXMuX3RlbXBsYXRlRmFjdG9yeSkge1xuICAgICAgdGhpcy5fdGVtcGxhdGVGYWN0b3J5LmNoYW5nZUNvbnRlbnQoY29udGVudClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdGVtcGxhdGVGYWN0b3J5ID0gbmV3IFRlbXBsYXRlRmFjdG9yeSh7XG4gICAgICAgIC4uLnRoaXMuX2NvbmZpZyxcbiAgICAgICAgLy8gdGhlIGBjb250ZW50YCB2YXIgaGFzIHRvIGJlIGFmdGVyIGB0aGlzLl9jb25maWdgXG4gICAgICAgIC8vIHRvIG92ZXJyaWRlIGNvbmZpZy5jb250ZW50IGluIGNhc2Ugb2YgcG9wb3ZlclxuICAgICAgICBjb250ZW50LFxuICAgICAgICBleHRyYUNsYXNzOiB0aGlzLl9yZXNvbHZlUG9zc2libGVGdW5jdGlvbih0aGlzLl9jb25maWcuY3VzdG9tQ2xhc3MpXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZUZhY3RvcnlcbiAgfVxuXG4gIF9nZXRDb250ZW50Rm9yVGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFtTRUxFQ1RPUl9UT09MVElQX0lOTkVSXTogdGhpcy5fZ2V0VGl0bGUoKVxuICAgIH1cbiAgfVxuXG4gIF9nZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZVBvc3NpYmxlRnVuY3Rpb24odGhpcy5fY29uZmlnLnRpdGxlKSB8fCB0aGlzLl9lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1icy1vcmlnaW5hbC10aXRsZScpXG4gIH1cblxuICAvLyBQcml2YXRlXG4gIF9pbml0aWFsaXplT25EZWxlZ2F0ZWRUYXJnZXQoZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRPckNyZWF0ZUluc3RhbmNlKGV2ZW50LmRlbGVnYXRlVGFyZ2V0LCB0aGlzLl9nZXREZWxlZ2F0ZUNvbmZpZygpKVxuICB9XG5cbiAgX2lzQW5pbWF0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5hbmltYXRpb24gfHwgKHRoaXMudGlwICYmIHRoaXMudGlwLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0ZBREUpKVxuICB9XG5cbiAgX2lzU2hvd24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGlwICYmIHRoaXMudGlwLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX1NIT1cpXG4gIH1cblxuICBfY3JlYXRlUG9wcGVyKHRpcCkge1xuICAgIGNvbnN0IHBsYWNlbWVudCA9IGV4ZWN1dGUodGhpcy5fY29uZmlnLnBsYWNlbWVudCwgW3RoaXMsIHRpcCwgdGhpcy5fZWxlbWVudF0pXG4gICAgY29uc3QgYXR0YWNobWVudCA9IEF0dGFjaG1lbnRNYXBbcGxhY2VtZW50LnRvVXBwZXJDYXNlKCldXG4gICAgcmV0dXJuIFBvcHBlci5jcmVhdGVQb3BwZXIodGhpcy5fZWxlbWVudCwgdGlwLCB0aGlzLl9nZXRQb3BwZXJDb25maWcoYXR0YWNobWVudCkpXG4gIH1cblxuICBfZ2V0T2Zmc2V0KCkge1xuICAgIGNvbnN0IHsgb2Zmc2V0IH0gPSB0aGlzLl9jb25maWdcblxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIG9mZnNldC5zcGxpdCgnLCcpLm1hcCh2YWx1ZSA9PiBOdW1iZXIucGFyc2VJbnQodmFsdWUsIDEwKSlcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9mZnNldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHBvcHBlckRhdGEgPT4gb2Zmc2V0KHBvcHBlckRhdGEsIHRoaXMuX2VsZW1lbnQpXG4gICAgfVxuXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgX3Jlc29sdmVQb3NzaWJsZUZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBleGVjdXRlKGFyZywgW3RoaXMuX2VsZW1lbnRdKVxuICB9XG5cbiAgX2dldFBvcHBlckNvbmZpZyhhdHRhY2htZW50KSB7XG4gICAgY29uc3QgZGVmYXVsdEJzUG9wcGVyQ29uZmlnID0ge1xuICAgICAgcGxhY2VtZW50OiBhdHRhY2htZW50LFxuICAgICAgbW9kaWZpZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnZmxpcCcsXG4gICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgZmFsbGJhY2tQbGFjZW1lbnRzOiB0aGlzLl9jb25maWcuZmFsbGJhY2tQbGFjZW1lbnRzXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ29mZnNldCcsXG4gICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLl9nZXRPZmZzZXQoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdwcmV2ZW50T3ZlcmZsb3cnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGJvdW5kYXJ5OiB0aGlzLl9jb25maWcuYm91bmRhcnlcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnYXJyb3cnLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGAuJHt0aGlzLmNvbnN0cnVjdG9yLk5BTUV9LWFycm93YFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdwcmVTZXRQbGFjZW1lbnQnLFxuICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgcGhhc2U6ICdiZWZvcmVNYWluJyxcbiAgICAgICAgICBmbjogZGF0YSA9PiB7XG4gICAgICAgICAgICAvLyBQcmUtc2V0IFBvcHBlcidzIHBsYWNlbWVudCBhdHRyaWJ1dGUgaW4gb3JkZXIgdG8gcmVhZCB0aGUgYXJyb3cgc2l6ZXMgcHJvcGVybHkuXG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIFBvcHBlciBtaXhlcyB1cCB0aGUgd2lkdGggYW5kIGhlaWdodCBkaW1lbnNpb25zIHNpbmNlIHRoZSBpbml0aWFsIGFycm93IHN0eWxlIGlzIGZvciB0b3AgcGxhY2VtZW50XG4gICAgICAgICAgICB0aGlzLl9nZXRUaXBFbGVtZW50KCkuc2V0QXR0cmlidXRlKCdkYXRhLXBvcHBlci1wbGFjZW1lbnQnLCBkYXRhLnN0YXRlLnBsYWNlbWVudClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4uZGVmYXVsdEJzUG9wcGVyQ29uZmlnLFxuICAgICAgLi4uZXhlY3V0ZSh0aGlzLl9jb25maWcucG9wcGVyQ29uZmlnLCBbZGVmYXVsdEJzUG9wcGVyQ29uZmlnXSlcbiAgICB9XG4gIH1cblxuICBfc2V0TGlzdGVuZXJzKCkge1xuICAgIGNvbnN0IHRyaWdnZXJzID0gdGhpcy5fY29uZmlnLnRyaWdnZXIuc3BsaXQoJyAnKVxuXG4gICAgZm9yIChjb25zdCB0cmlnZ2VyIG9mIHRyaWdnZXJzKSB7XG4gICAgICBpZiAodHJpZ2dlciA9PT0gJ2NsaWNrJykge1xuICAgICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgdGhpcy5jb25zdHJ1Y3Rvci5ldmVudE5hbWUoRVZFTlRfQ0xJQ0spLCB0aGlzLl9jb25maWcuc2VsZWN0b3IsIGV2ZW50ID0+IHtcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5faW5pdGlhbGl6ZU9uRGVsZWdhdGVkVGFyZ2V0KGV2ZW50KVxuICAgICAgICAgIGNvbnRleHQudG9nZ2xlKClcbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAodHJpZ2dlciAhPT0gVFJJR0dFUl9NQU5VQUwpIHtcbiAgICAgICAgY29uc3QgZXZlbnRJbiA9IHRyaWdnZXIgPT09IFRSSUdHRVJfSE9WRVIgP1xuICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX01PVVNFRU5URVIpIDpcbiAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9GT0NVU0lOKVxuICAgICAgICBjb25zdCBldmVudE91dCA9IHRyaWdnZXIgPT09IFRSSUdHRVJfSE9WRVIgP1xuICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuZXZlbnROYW1lKEVWRU5UX01PVVNFTEVBVkUpIDpcbiAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmV2ZW50TmFtZShFVkVOVF9GT0NVU09VVClcblxuICAgICAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgZXZlbnRJbiwgdGhpcy5fY29uZmlnLnNlbGVjdG9yLCBldmVudCA9PiB7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2luaXRpYWxpemVPbkRlbGVnYXRlZFRhcmdldChldmVudClcbiAgICAgICAgICBjb250ZXh0Ll9hY3RpdmVUcmlnZ2VyW2V2ZW50LnR5cGUgPT09ICdmb2N1c2luJyA/IFRSSUdHRVJfRk9DVVMgOiBUUklHR0VSX0hPVkVSXSA9IHRydWVcbiAgICAgICAgICBjb250ZXh0Ll9lbnRlcigpXG4gICAgICAgIH0pXG4gICAgICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LCBldmVudE91dCwgdGhpcy5fY29uZmlnLnNlbGVjdG9yLCBldmVudCA9PiB7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMuX2luaXRpYWxpemVPbkRlbGVnYXRlZFRhcmdldChldmVudClcbiAgICAgICAgICBjb250ZXh0Ll9hY3RpdmVUcmlnZ2VyW2V2ZW50LnR5cGUgPT09ICdmb2N1c291dCcgPyBUUklHR0VSX0ZPQ1VTIDogVFJJR0dFUl9IT1ZFUl0gPVxuICAgICAgICAgICAgY29udGV4dC5fZWxlbWVudC5jb250YWlucyhldmVudC5yZWxhdGVkVGFyZ2V0KVxuXG4gICAgICAgICAgY29udGV4dC5fbGVhdmUoKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2hpZGVNb2RhbEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fZWxlbWVudCkge1xuICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgfVxuICAgIH1cblxuICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9lbGVtZW50LmNsb3Nlc3QoU0VMRUNUT1JfTU9EQUwpLCBFVkVOVF9NT0RBTF9ISURFLCB0aGlzLl9oaWRlTW9kYWxIYW5kbGVyKVxuICB9XG5cbiAgX2ZpeFRpdGxlKCkge1xuICAgIGNvbnN0IHRpdGxlID0gdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJylcblxuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghdGhpcy5fZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKSAmJiAhdGhpcy5fZWxlbWVudC50ZXh0Q29udGVudC50cmltKCkpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgdGl0bGUpXG4gICAgfVxuXG4gICAgdGhpcy5fZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYnMtb3JpZ2luYWwtdGl0bGUnLCB0aXRsZSkgLy8gRE8gTk9UIFVTRSBJVC4gSXMgb25seSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgX2VudGVyKCkge1xuICAgIGlmICh0aGlzLl9pc1Nob3duKCkgfHwgdGhpcy5faXNIb3ZlcmVkKSB7XG4gICAgICB0aGlzLl9pc0hvdmVyZWQgPSB0cnVlXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9pc0hvdmVyZWQgPSB0cnVlXG5cbiAgICB0aGlzLl9zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9pc0hvdmVyZWQpIHtcbiAgICAgICAgdGhpcy5zaG93KClcbiAgICAgIH1cbiAgICB9LCB0aGlzLl9jb25maWcuZGVsYXkuc2hvdylcbiAgfVxuXG4gIF9sZWF2ZSgpIHtcbiAgICBpZiAodGhpcy5faXNXaXRoQWN0aXZlVHJpZ2dlcigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9pc0hvdmVyZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5fc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2lzSG92ZXJlZCkge1xuICAgICAgICB0aGlzLmhpZGUoKVxuICAgICAgfVxuICAgIH0sIHRoaXMuX2NvbmZpZy5kZWxheS5oaWRlKVxuICB9XG5cbiAgX3NldFRpbWVvdXQoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICAgIHRoaXMuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpXG4gIH1cblxuICBfaXNXaXRoQWN0aXZlVHJpZ2dlcigpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLl9hY3RpdmVUcmlnZ2VyKS5pbmNsdWRlcyh0cnVlKVxuICB9XG5cbiAgX2dldENvbmZpZyhjb25maWcpIHtcbiAgICBjb25zdCBkYXRhQXR0cmlidXRlcyA9IE1hbmlwdWxhdG9yLmdldERhdGFBdHRyaWJ1dGVzKHRoaXMuX2VsZW1lbnQpXG5cbiAgICBmb3IgKGNvbnN0IGRhdGFBdHRyaWJ1dGUgb2YgT2JqZWN0LmtleXMoZGF0YUF0dHJpYnV0ZXMpKSB7XG4gICAgICBpZiAoRElTQUxMT1dFRF9BVFRSSUJVVEVTLmhhcyhkYXRhQXR0cmlidXRlKSkge1xuICAgICAgICBkZWxldGUgZGF0YUF0dHJpYnV0ZXNbZGF0YUF0dHJpYnV0ZV1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25maWcgPSB7XG4gICAgICAuLi5kYXRhQXR0cmlidXRlcyxcbiAgICAgIC4uLih0eXBlb2YgY29uZmlnID09PSAnb2JqZWN0JyAmJiBjb25maWcgPyBjb25maWcgOiB7fSlcbiAgICB9XG4gICAgY29uZmlnID0gdGhpcy5fbWVyZ2VDb25maWdPYmooY29uZmlnKVxuICAgIGNvbmZpZyA9IHRoaXMuX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKVxuICAgIHRoaXMuX3R5cGVDaGVja0NvbmZpZyhjb25maWcpXG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKSB7XG4gICAgY29uZmlnLmNvbnRhaW5lciA9IGNvbmZpZy5jb250YWluZXIgPT09IGZhbHNlID8gZG9jdW1lbnQuYm9keSA6IGdldEVsZW1lbnQoY29uZmlnLmNvbnRhaW5lcilcblxuICAgIGlmICh0eXBlb2YgY29uZmlnLmRlbGF5ID09PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLmRlbGF5ID0ge1xuICAgICAgICBzaG93OiBjb25maWcuZGVsYXksXG4gICAgICAgIGhpZGU6IGNvbmZpZy5kZWxheVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29uZmlnLnRpdGxlID09PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLnRpdGxlID0gY29uZmlnLnRpdGxlLnRvU3RyaW5nKClcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNvbmZpZy5jb250ZW50ID09PSAnbnVtYmVyJykge1xuICAgICAgY29uZmlnLmNvbnRlbnQgPSBjb25maWcuY29udGVudC50b1N0cmluZygpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgX2dldERlbGVnYXRlQ29uZmlnKCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9jb25maWcpKSB7XG4gICAgICBpZiAodGhpcy5jb25zdHJ1Y3Rvci5EZWZhdWx0W2tleV0gIT09IHZhbHVlKSB7XG4gICAgICAgIGNvbmZpZ1trZXldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25maWcuc2VsZWN0b3IgPSBmYWxzZVxuICAgIGNvbmZpZy50cmlnZ2VyID0gJ21hbnVhbCdcblxuICAgIC8vIEluIHRoZSBmdXR1cmUgY2FuIGJlIHJlcGxhY2VkIHdpdGg6XG4gICAgLy8gY29uc3Qga2V5c1dpdGhEaWZmZXJlbnRWYWx1ZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLl9jb25maWcpLmZpbHRlcihlbnRyeSA9PiB0aGlzLmNvbnN0cnVjdG9yLkRlZmF1bHRbZW50cnlbMF1dICE9PSB0aGlzLl9jb25maWdbZW50cnlbMF1dKVxuICAgIC8vIGBPYmplY3QuZnJvbUVudHJpZXMoa2V5c1dpdGhEaWZmZXJlbnRWYWx1ZXMpYFxuICAgIHJldHVybiBjb25maWdcbiAgfVxuXG4gIF9kaXNwb3NlUG9wcGVyKCkge1xuICAgIGlmICh0aGlzLl9wb3BwZXIpIHtcbiAgICAgIHRoaXMuX3BvcHBlci5kZXN0cm95KClcbiAgICAgIHRoaXMuX3BvcHBlciA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAodGhpcy50aXApIHtcbiAgICAgIHRoaXMudGlwLnJlbW92ZSgpXG4gICAgICB0aGlzLnRpcCA9IG51bGxcbiAgICB9XG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBUb29sdGlwLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApXG4gICAgICB9XG5cbiAgICAgIGRhdGFbY29uZmlnXSgpXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIGpRdWVyeVxuICovXG5cbmRlZmluZUpRdWVyeVBsdWdpbihUb29sdGlwKVxuXG5leHBvcnQgZGVmYXVsdCBUb29sdGlwXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIHBvcG92ZXIuanNcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFpbi9MSUNFTlNFKVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuL3Rvb2x0aXAuanMnXG5pbXBvcnQgeyBkZWZpbmVKUXVlcnlQbHVnaW4gfSBmcm9tICcuL3V0aWwvaW5kZXguanMnXG5cbi8qKlxuICogQ29uc3RhbnRzXG4gKi9cblxuY29uc3QgTkFNRSA9ICdwb3BvdmVyJ1xuXG5jb25zdCBTRUxFQ1RPUl9USVRMRSA9ICcucG9wb3Zlci1oZWFkZXInXG5jb25zdCBTRUxFQ1RPUl9DT05URU5UID0gJy5wb3BvdmVyLWJvZHknXG5cbmNvbnN0IERlZmF1bHQgPSB7XG4gIC4uLlRvb2x0aXAuRGVmYXVsdCxcbiAgY29udGVudDogJycsXG4gIG9mZnNldDogWzAsIDhdLFxuICBwbGFjZW1lbnQ6ICdyaWdodCcsXG4gIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPicgK1xuICAgICc8ZGl2IGNsYXNzPVwicG9wb3Zlci1hcnJvd1wiPjwvZGl2PicgK1xuICAgICc8aDMgY2xhc3M9XCJwb3BvdmVyLWhlYWRlclwiPjwvaDM+JyArXG4gICAgJzxkaXYgY2xhc3M9XCJwb3BvdmVyLWJvZHlcIj48L2Rpdj4nICtcbiAgICAnPC9kaXY+JyxcbiAgdHJpZ2dlcjogJ2NsaWNrJ1xufVxuXG5jb25zdCBEZWZhdWx0VHlwZSA9IHtcbiAgLi4uVG9vbHRpcC5EZWZhdWx0VHlwZSxcbiAgY29udGVudDogJyhudWxsfHN0cmluZ3xlbGVtZW50fGZ1bmN0aW9uKSdcbn1cblxuLyoqXG4gKiBDbGFzcyBkZWZpbml0aW9uXG4gKi9cblxuY2xhc3MgUG9wb3ZlciBleHRlbmRzIFRvb2x0aXAge1xuICAvLyBHZXR0ZXJzXG4gIHN0YXRpYyBnZXQgRGVmYXVsdCgpIHtcbiAgICByZXR1cm4gRGVmYXVsdFxuICB9XG5cbiAgc3RhdGljIGdldCBEZWZhdWx0VHlwZSgpIHtcbiAgICByZXR1cm4gRGVmYXVsdFR5cGVcbiAgfVxuXG4gIHN0YXRpYyBnZXQgTkFNRSgpIHtcbiAgICByZXR1cm4gTkFNRVxuICB9XG5cbiAgLy8gT3ZlcnJpZGVzXG4gIF9pc1dpdGhDb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRUaXRsZSgpIHx8IHRoaXMuX2dldENvbnRlbnQoKVxuICB9XG5cbiAgLy8gUHJpdmF0ZVxuICBfZ2V0Q29udGVudEZvclRlbXBsYXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBbU0VMRUNUT1JfVElUTEVdOiB0aGlzLl9nZXRUaXRsZSgpLFxuICAgICAgW1NFTEVDVE9SX0NPTlRFTlRdOiB0aGlzLl9nZXRDb250ZW50KClcbiAgICB9XG4gIH1cblxuICBfZ2V0Q29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZVBvc3NpYmxlRnVuY3Rpb24odGhpcy5fY29uZmlnLmNvbnRlbnQpXG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBQb3BvdmVyLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcywgY29uZmlnKVxuXG4gICAgICBpZiAodHlwZW9mIGNvbmZpZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBObyBtZXRob2QgbmFtZWQgXCIke2NvbmZpZ31cImApXG4gICAgICB9XG5cbiAgICAgIGRhdGFbY29uZmlnXSgpXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIGpRdWVyeVxuICovXG5cbmRlZmluZUpRdWVyeVBsdWdpbihQb3BvdmVyKVxuXG5leHBvcnQgZGVmYXVsdCBQb3BvdmVyXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIHNjcm9sbHNweS5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vYmFzZS1jb21wb25lbnQuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi9kb20vc2VsZWN0b3ItZW5naW5lLmpzJ1xuaW1wb3J0IHtcbiAgZGVmaW5lSlF1ZXJ5UGx1Z2luLCBnZXRFbGVtZW50LCBpc0Rpc2FibGVkLCBpc1Zpc2libGVcbn0gZnJvbSAnLi91dGlsL2luZGV4LmpzJ1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IE5BTUUgPSAnc2Nyb2xsc3B5J1xuY29uc3QgREFUQV9LRVkgPSAnYnMuc2Nyb2xsc3B5J1xuY29uc3QgRVZFTlRfS0VZID0gYC4ke0RBVEFfS0VZfWBcbmNvbnN0IERBVEFfQVBJX0tFWSA9ICcuZGF0YS1hcGknXG5cbmNvbnN0IEVWRU5UX0FDVElWQVRFID0gYGFjdGl2YXRlJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfQ0xJQ0sgPSBgY2xpY2ske0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9MT0FEX0RBVEFfQVBJID0gYGxvYWQke0VWRU5UX0tFWX0ke0RBVEFfQVBJX0tFWX1gXG5cbmNvbnN0IENMQVNTX05BTUVfRFJPUERPV05fSVRFTSA9ICdkcm9wZG93bi1pdGVtJ1xuY29uc3QgQ0xBU1NfTkFNRV9BQ1RJVkUgPSAnYWN0aXZlJ1xuXG5jb25zdCBTRUxFQ1RPUl9EQVRBX1NQWSA9ICdbZGF0YS1icy1zcHk9XCJzY3JvbGxcIl0nXG5jb25zdCBTRUxFQ1RPUl9UQVJHRVRfTElOS1MgPSAnW2hyZWZdJ1xuY29uc3QgU0VMRUNUT1JfTkFWX0xJU1RfR1JPVVAgPSAnLm5hdiwgLmxpc3QtZ3JvdXAnXG5jb25zdCBTRUxFQ1RPUl9OQVZfTElOS1MgPSAnLm5hdi1saW5rJ1xuY29uc3QgU0VMRUNUT1JfTkFWX0lURU1TID0gJy5uYXYtaXRlbSdcbmNvbnN0IFNFTEVDVE9SX0xJU1RfSVRFTVMgPSAnLmxpc3QtZ3JvdXAtaXRlbSdcbmNvbnN0IFNFTEVDVE9SX0xJTktfSVRFTVMgPSBgJHtTRUxFQ1RPUl9OQVZfTElOS1N9LCAke1NFTEVDVE9SX05BVl9JVEVNU30gPiAke1NFTEVDVE9SX05BVl9MSU5LU30sICR7U0VMRUNUT1JfTElTVF9JVEVNU31gXG5jb25zdCBTRUxFQ1RPUl9EUk9QRE9XTiA9ICcuZHJvcGRvd24nXG5jb25zdCBTRUxFQ1RPUl9EUk9QRE9XTl9UT0dHTEUgPSAnLmRyb3Bkb3duLXRvZ2dsZSdcblxuY29uc3QgRGVmYXVsdCA9IHtcbiAgb2Zmc2V0OiBudWxsLCAvLyBUT0RPOiB2NiBAZGVwcmVjYXRlZCwga2VlcCBpdCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgcmVhc29uc1xuICByb290TWFyZ2luOiAnMHB4IDBweCAtMjUlJyxcbiAgc21vb3RoU2Nyb2xsOiBmYWxzZSxcbiAgdGFyZ2V0OiBudWxsLFxuICB0aHJlc2hvbGQ6IFswLjEsIDAuNSwgMV1cbn1cblxuY29uc3QgRGVmYXVsdFR5cGUgPSB7XG4gIG9mZnNldDogJyhudW1iZXJ8bnVsbCknLCAvLyBUT0RPIHY2IEBkZXByZWNhdGVkLCBrZWVwIGl0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSByZWFzb25zXG4gIHJvb3RNYXJnaW46ICdzdHJpbmcnLFxuICBzbW9vdGhTY3JvbGw6ICdib29sZWFuJyxcbiAgdGFyZ2V0OiAnZWxlbWVudCcsXG4gIHRocmVzaG9sZDogJ2FycmF5J1xufVxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBTY3JvbGxTcHkgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY29uZmlnKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgY29uZmlnKVxuXG4gICAgLy8gdGhpcy5fZWxlbWVudCBpcyB0aGUgb2JzZXJ2YWJsZXNDb250YWluZXIgYW5kIGNvbmZpZy50YXJnZXQgdGhlIG1lbnUgbGlua3Mgd3JhcHBlclxuICAgIHRoaXMuX3RhcmdldExpbmtzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fb2JzZXJ2YWJsZVNlY3Rpb25zID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fcm9vdEVsZW1lbnQgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMuX2VsZW1lbnQpLm92ZXJmbG93WSA9PT0gJ3Zpc2libGUnID8gbnVsbCA6IHRoaXMuX2VsZW1lbnRcbiAgICB0aGlzLl9hY3RpdmVUYXJnZXQgPSBudWxsXG4gICAgdGhpcy5fb2JzZXJ2ZXIgPSBudWxsXG4gICAgdGhpcy5fcHJldmlvdXNTY3JvbGxEYXRhID0ge1xuICAgICAgdmlzaWJsZUVudHJ5VG9wOiAwLFxuICAgICAgcGFyZW50U2Nyb2xsVG9wOiAwXG4gICAgfVxuICAgIHRoaXMucmVmcmVzaCgpIC8vIGluaXRpYWxpemVcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgcmVmcmVzaCgpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplVGFyZ2V0c0FuZE9ic2VydmFibGVzKClcbiAgICB0aGlzLl9tYXliZUVuYWJsZVNtb290aFNjcm9sbCgpXG5cbiAgICBpZiAodGhpcy5fb2JzZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX29ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9vYnNlcnZlciA9IHRoaXMuX2dldE5ld09ic2VydmVyKClcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHNlY3Rpb24gb2YgdGhpcy5fb2JzZXJ2YWJsZVNlY3Rpb25zLnZhbHVlcygpKSB7XG4gICAgICB0aGlzLl9vYnNlcnZlci5vYnNlcnZlKHNlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9vYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICBzdXBlci5kaXNwb3NlKClcbiAgfVxuXG4gIC8vIFByaXZhdGVcbiAgX2NvbmZpZ0FmdGVyTWVyZ2UoY29uZmlnKSB7XG4gICAgLy8gVE9ETzogb24gdjYgdGFyZ2V0IHNob3VsZCBiZSBnaXZlbiBleHBsaWNpdGx5ICYgcmVtb3ZlIHRoZSB7dGFyZ2V0OiAnc3MtdGFyZ2V0J30gY2FzZVxuICAgIGNvbmZpZy50YXJnZXQgPSBnZXRFbGVtZW50KGNvbmZpZy50YXJnZXQpIHx8IGRvY3VtZW50LmJvZHlcblxuICAgIC8vIFRPRE86IHY2IE9ubHkgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHJlYXNvbnMuIFVzZSByb290TWFyZ2luIG9ubHlcbiAgICBjb25maWcucm9vdE1hcmdpbiA9IGNvbmZpZy5vZmZzZXQgPyBgJHtjb25maWcub2Zmc2V0fXB4IDBweCAtMzAlYCA6IGNvbmZpZy5yb290TWFyZ2luXG5cbiAgICBpZiAodHlwZW9mIGNvbmZpZy50aHJlc2hvbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25maWcudGhyZXNob2xkID0gY29uZmlnLnRocmVzaG9sZC5zcGxpdCgnLCcpLm1hcCh2YWx1ZSA9PiBOdW1iZXIucGFyc2VGbG9hdCh2YWx1ZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9XG5cbiAgX21heWJlRW5hYmxlU21vb3RoU2Nyb2xsKCkge1xuICAgIGlmICghdGhpcy5fY29uZmlnLnNtb290aFNjcm9sbCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gdW5yZWdpc3RlciBhbnkgcHJldmlvdXMgbGlzdGVuZXJzXG4gICAgRXZlbnRIYW5kbGVyLm9mZih0aGlzLl9jb25maWcudGFyZ2V0LCBFVkVOVF9DTElDSylcblxuICAgIEV2ZW50SGFuZGxlci5vbih0aGlzLl9jb25maWcudGFyZ2V0LCBFVkVOVF9DTElDSywgU0VMRUNUT1JfVEFSR0VUX0xJTktTLCBldmVudCA9PiB7XG4gICAgICBjb25zdCBvYnNlcnZhYmxlU2VjdGlvbiA9IHRoaXMuX29ic2VydmFibGVTZWN0aW9ucy5nZXQoZXZlbnQudGFyZ2V0Lmhhc2gpXG4gICAgICBpZiAob2JzZXJ2YWJsZVNlY3Rpb24pIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBjb25zdCByb290ID0gdGhpcy5fcm9vdEVsZW1lbnQgfHwgd2luZG93XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IG9ic2VydmFibGVTZWN0aW9uLm9mZnNldFRvcCAtIHRoaXMuX2VsZW1lbnQub2Zmc2V0VG9wXG4gICAgICAgIGlmIChyb290LnNjcm9sbFRvKSB7XG4gICAgICAgICAgcm9vdC5zY3JvbGxUbyh7IHRvcDogaGVpZ2h0LCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENocm9tZSA2MCBkb2Vzbid0IHN1cHBvcnQgYHNjcm9sbFRvYFxuICAgICAgICByb290LnNjcm9sbFRvcCA9IGhlaWdodFxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBfZ2V0TmV3T2JzZXJ2ZXIoKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHJvb3Q6IHRoaXMuX3Jvb3RFbGVtZW50LFxuICAgICAgdGhyZXNob2xkOiB0aGlzLl9jb25maWcudGhyZXNob2xkLFxuICAgICAgcm9vdE1hcmdpbjogdGhpcy5fY29uZmlnLnJvb3RNYXJnaW5cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKGVudHJpZXMgPT4gdGhpcy5fb2JzZXJ2ZXJDYWxsYmFjayhlbnRyaWVzKSwgb3B0aW9ucylcbiAgfVxuXG4gIC8vIFRoZSBsb2dpYyBvZiBzZWxlY3Rpb25cbiAgX29ic2VydmVyQ2FsbGJhY2soZW50cmllcykge1xuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBlbnRyeSA9PiB0aGlzLl90YXJnZXRMaW5rcy5nZXQoYCMke2VudHJ5LnRhcmdldC5pZH1gKVxuICAgIGNvbnN0IGFjdGl2YXRlID0gZW50cnkgPT4ge1xuICAgICAgdGhpcy5fcHJldmlvdXNTY3JvbGxEYXRhLnZpc2libGVFbnRyeVRvcCA9IGVudHJ5LnRhcmdldC5vZmZzZXRUb3BcbiAgICAgIHRoaXMuX3Byb2Nlc3ModGFyZ2V0RWxlbWVudChlbnRyeSkpXG4gICAgfVxuXG4gICAgY29uc3QgcGFyZW50U2Nyb2xsVG9wID0gKHRoaXMuX3Jvb3RFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuc2Nyb2xsVG9wXG4gICAgY29uc3QgdXNlclNjcm9sbHNEb3duID0gcGFyZW50U2Nyb2xsVG9wID49IHRoaXMuX3ByZXZpb3VzU2Nyb2xsRGF0YS5wYXJlbnRTY3JvbGxUb3BcbiAgICB0aGlzLl9wcmV2aW91c1Njcm9sbERhdGEucGFyZW50U2Nyb2xsVG9wID0gcGFyZW50U2Nyb2xsVG9wXG5cbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgIGlmICghZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgdGhpcy5fYWN0aXZlVGFyZ2V0ID0gbnVsbFxuICAgICAgICB0aGlzLl9jbGVhckFjdGl2ZUNsYXNzKHRhcmdldEVsZW1lbnQoZW50cnkpKVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVudHJ5SXNMb3dlclRoYW5QcmV2aW91cyA9IGVudHJ5LnRhcmdldC5vZmZzZXRUb3AgPj0gdGhpcy5fcHJldmlvdXNTY3JvbGxEYXRhLnZpc2libGVFbnRyeVRvcFxuICAgICAgLy8gaWYgd2UgYXJlIHNjcm9sbGluZyBkb3duLCBwaWNrIHRoZSBiaWdnZXIgb2Zmc2V0VG9wXG4gICAgICBpZiAodXNlclNjcm9sbHNEb3duICYmIGVudHJ5SXNMb3dlclRoYW5QcmV2aW91cykge1xuICAgICAgICBhY3RpdmF0ZShlbnRyeSlcbiAgICAgICAgLy8gaWYgcGFyZW50IGlzbid0IHNjcm9sbGVkLCBsZXQncyBrZWVwIHRoZSBmaXJzdCB2aXNpYmxlIGl0ZW0sIGJyZWFraW5nIHRoZSBpdGVyYXRpb25cbiAgICAgICAgaWYgKCFwYXJlbnRTY3JvbGxUb3ApIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHdlIGFyZSBzY3JvbGxpbmcgdXAsIHBpY2sgdGhlIHNtYWxsZXN0IG9mZnNldFRvcFxuICAgICAgaWYgKCF1c2VyU2Nyb2xsc0Rvd24gJiYgIWVudHJ5SXNMb3dlclRoYW5QcmV2aW91cykge1xuICAgICAgICBhY3RpdmF0ZShlbnRyeSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfaW5pdGlhbGl6ZVRhcmdldHNBbmRPYnNlcnZhYmxlcygpIHtcbiAgICB0aGlzLl90YXJnZXRMaW5rcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX29ic2VydmFibGVTZWN0aW9ucyA9IG5ldyBNYXAoKVxuXG4gICAgY29uc3QgdGFyZ2V0TGlua3MgPSBTZWxlY3RvckVuZ2luZS5maW5kKFNFTEVDVE9SX1RBUkdFVF9MSU5LUywgdGhpcy5fY29uZmlnLnRhcmdldClcblxuICAgIGZvciAoY29uc3QgYW5jaG9yIG9mIHRhcmdldExpbmtzKSB7XG4gICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgYW5jaG9yIGhhcyBhbiBpZCBhbmQgaXMgbm90IGRpc2FibGVkXG4gICAgICBpZiAoIWFuY2hvci5oYXNoIHx8IGlzRGlzYWJsZWQoYW5jaG9yKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvYnNlcnZhYmxlU2VjdGlvbiA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoZGVjb2RlVVJJKGFuY2hvci5oYXNoKSwgdGhpcy5fZWxlbWVudClcblxuICAgICAgLy8gZW5zdXJlIHRoYXQgdGhlIG9ic2VydmFibGVTZWN0aW9uIGV4aXN0cyAmIGlzIHZpc2libGVcbiAgICAgIGlmIChpc1Zpc2libGUob2JzZXJ2YWJsZVNlY3Rpb24pKSB7XG4gICAgICAgIHRoaXMuX3RhcmdldExpbmtzLnNldChkZWNvZGVVUkkoYW5jaG9yLmhhc2gpLCBhbmNob3IpXG4gICAgICAgIHRoaXMuX29ic2VydmFibGVTZWN0aW9ucy5zZXQoYW5jaG9yLmhhc2gsIG9ic2VydmFibGVTZWN0aW9uKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9wcm9jZXNzKHRhcmdldCkge1xuICAgIGlmICh0aGlzLl9hY3RpdmVUYXJnZXQgPT09IHRhcmdldCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fY2xlYXJBY3RpdmVDbGFzcyh0aGlzLl9jb25maWcudGFyZ2V0KVxuICAgIHRoaXMuX2FjdGl2ZVRhcmdldCA9IHRhcmdldFxuICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQUNUSVZFKVxuICAgIHRoaXMuX2FjdGl2YXRlUGFyZW50cyh0YXJnZXQpXG5cbiAgICBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9BQ1RJVkFURSwgeyByZWxhdGVkVGFyZ2V0OiB0YXJnZXQgfSlcbiAgfVxuXG4gIF9hY3RpdmF0ZVBhcmVudHModGFyZ2V0KSB7XG4gICAgLy8gQWN0aXZhdGUgZHJvcGRvd24gcGFyZW50c1xuICAgIGlmICh0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKENMQVNTX05BTUVfRFJPUERPV05fSVRFTSkpIHtcbiAgICAgIFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoU0VMRUNUT1JfRFJPUERPV05fVE9HR0xFLCB0YXJnZXQuY2xvc2VzdChTRUxFQ1RPUl9EUk9QRE9XTikpXG4gICAgICAgIC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQUNUSVZFKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBsaXN0R3JvdXAgb2YgU2VsZWN0b3JFbmdpbmUucGFyZW50cyh0YXJnZXQsIFNFTEVDVE9SX05BVl9MSVNUX0dST1VQKSkge1xuICAgICAgLy8gU2V0IHRyaWdnZXJlZCBsaW5rcyBwYXJlbnRzIGFzIGFjdGl2ZVxuICAgICAgLy8gV2l0aCBib3RoIDx1bD4gYW5kIDxuYXY+IG1hcmt1cCBhIHBhcmVudCBpcyB0aGUgcHJldmlvdXMgc2libGluZyBvZiBhbnkgbmF2IGFuY2VzdG9yXG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgU2VsZWN0b3JFbmdpbmUucHJldihsaXN0R3JvdXAsIFNFTEVDVE9SX0xJTktfSVRFTVMpKSB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0FDVElWRSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfY2xlYXJBY3RpdmVDbGFzcyhwYXJlbnQpIHtcbiAgICBwYXJlbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX0FDVElWRSlcblxuICAgIGNvbnN0IGFjdGl2ZU5vZGVzID0gU2VsZWN0b3JFbmdpbmUuZmluZChgJHtTRUxFQ1RPUl9UQVJHRVRfTElOS1N9LiR7Q0xBU1NfTkFNRV9BQ1RJVkV9YCwgcGFyZW50KVxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBhY3RpdmVOb2Rlcykge1xuICAgICAgbm9kZS5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfQUNUSVZFKVxuICAgIH1cbiAgfVxuXG4gIC8vIFN0YXRpY1xuICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZGF0YSA9IFNjcm9sbFNweS5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZylcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YVtjb25maWddID09PSB1bmRlZmluZWQgfHwgY29uZmlnLnN0YXJ0c1dpdGgoJ18nKSB8fCBjb25maWcgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgTm8gbWV0aG9kIG5hbWVkIFwiJHtjb25maWd9XCJgKVxuICAgICAgfVxuXG4gICAgICBkYXRhW2NvbmZpZ10oKVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBEYXRhIEFQSSBpbXBsZW1lbnRhdGlvblxuICovXG5cbkV2ZW50SGFuZGxlci5vbih3aW5kb3csIEVWRU5UX0xPQURfREFUQV9BUEksICgpID0+IHtcbiAgZm9yIChjb25zdCBzcHkgb2YgU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9EQVRBX1NQWSkpIHtcbiAgICBTY3JvbGxTcHkuZ2V0T3JDcmVhdGVJbnN0YW5jZShzcHkpXG4gIH1cbn0pXG5cbi8qKlxuICogalF1ZXJ5XG4gKi9cblxuZGVmaW5lSlF1ZXJ5UGx1Z2luKFNjcm9sbFNweSlcblxuZXhwb3J0IGRlZmF1bHQgU2Nyb2xsU3B5XG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIHRhYi5qc1xuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYWluL0xJQ0VOU0UpXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vYmFzZS1jb21wb25lbnQuanMnXG5pbXBvcnQgRXZlbnRIYW5kbGVyIGZyb20gJy4vZG9tL2V2ZW50LWhhbmRsZXIuanMnXG5pbXBvcnQgU2VsZWN0b3JFbmdpbmUgZnJvbSAnLi9kb20vc2VsZWN0b3ItZW5naW5lLmpzJ1xuaW1wb3J0IHsgZGVmaW5lSlF1ZXJ5UGx1Z2luLCBnZXROZXh0QWN0aXZlRWxlbWVudCwgaXNEaXNhYmxlZCB9IGZyb20gJy4vdXRpbC9pbmRleC5qcydcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG5jb25zdCBOQU1FID0gJ3RhYidcbmNvbnN0IERBVEFfS0VZID0gJ2JzLnRhYidcbmNvbnN0IEVWRU5UX0tFWSA9IGAuJHtEQVRBX0tFWX1gXG5cbmNvbnN0IEVWRU5UX0hJREUgPSBgaGlkZSR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0hJRERFTiA9IGBoaWRkZW4ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9TSE9XID0gYHNob3cke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9TSE9XTiA9IGBzaG93biR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0NMSUNLX0RBVEFfQVBJID0gYGNsaWNrJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfS0VZRE9XTiA9IGBrZXlkb3duJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfTE9BRF9EQVRBX0FQSSA9IGBsb2FkJHtFVkVOVF9LRVl9YFxuXG5jb25zdCBBUlJPV19MRUZUX0tFWSA9ICdBcnJvd0xlZnQnXG5jb25zdCBBUlJPV19SSUdIVF9LRVkgPSAnQXJyb3dSaWdodCdcbmNvbnN0IEFSUk9XX1VQX0tFWSA9ICdBcnJvd1VwJ1xuY29uc3QgQVJST1dfRE9XTl9LRVkgPSAnQXJyb3dEb3duJ1xuY29uc3QgSE9NRV9LRVkgPSAnSG9tZSdcbmNvbnN0IEVORF9LRVkgPSAnRW5kJ1xuXG5jb25zdCBDTEFTU19OQU1FX0FDVElWRSA9ICdhY3RpdmUnXG5jb25zdCBDTEFTU19OQU1FX0ZBREUgPSAnZmFkZSdcbmNvbnN0IENMQVNTX05BTUVfU0hPVyA9ICdzaG93J1xuY29uc3QgQ0xBU1NfRFJPUERPV04gPSAnZHJvcGRvd24nXG5cbmNvbnN0IFNFTEVDVE9SX0RST1BET1dOX1RPR0dMRSA9ICcuZHJvcGRvd24tdG9nZ2xlJ1xuY29uc3QgU0VMRUNUT1JfRFJPUERPV05fTUVOVSA9ICcuZHJvcGRvd24tbWVudSdcbmNvbnN0IE5PVF9TRUxFQ1RPUl9EUk9QRE9XTl9UT0dHTEUgPSBgOm5vdCgke1NFTEVDVE9SX0RST1BET1dOX1RPR0dMRX0pYFxuXG5jb25zdCBTRUxFQ1RPUl9UQUJfUEFORUwgPSAnLmxpc3QtZ3JvdXAsIC5uYXYsIFtyb2xlPVwidGFibGlzdFwiXSdcbmNvbnN0IFNFTEVDVE9SX09VVEVSID0gJy5uYXYtaXRlbSwgLmxpc3QtZ3JvdXAtaXRlbSdcbmNvbnN0IFNFTEVDVE9SX0lOTkVSID0gYC5uYXYtbGluayR7Tk9UX1NFTEVDVE9SX0RST1BET1dOX1RPR0dMRX0sIC5saXN0LWdyb3VwLWl0ZW0ke05PVF9TRUxFQ1RPUl9EUk9QRE9XTl9UT0dHTEV9LCBbcm9sZT1cInRhYlwiXSR7Tk9UX1NFTEVDVE9SX0RST1BET1dOX1RPR0dMRX1gXG5jb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSA9ICdbZGF0YS1icy10b2dnbGU9XCJ0YWJcIl0sIFtkYXRhLWJzLXRvZ2dsZT1cInBpbGxcIl0sIFtkYXRhLWJzLXRvZ2dsZT1cImxpc3RcIl0nIC8vIFRPRE86IGNvdWxkIG9ubHkgYmUgYHRhYmAgaW4gdjZcbmNvbnN0IFNFTEVDVE9SX0lOTkVSX0VMRU0gPSBgJHtTRUxFQ1RPUl9JTk5FUn0sICR7U0VMRUNUT1JfREFUQV9UT0dHTEV9YFxuXG5jb25zdCBTRUxFQ1RPUl9EQVRBX1RPR0dMRV9BQ1RJVkUgPSBgLiR7Q0xBU1NfTkFNRV9BQ1RJVkV9W2RhdGEtYnMtdG9nZ2xlPVwidGFiXCJdLCAuJHtDTEFTU19OQU1FX0FDVElWRX1bZGF0YS1icy10b2dnbGU9XCJwaWxsXCJdLCAuJHtDTEFTU19OQU1FX0FDVElWRX1bZGF0YS1icy10b2dnbGU9XCJsaXN0XCJdYFxuXG4vKipcbiAqIENsYXNzIGRlZmluaXRpb25cbiAqL1xuXG5jbGFzcyBUYWIgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHN1cGVyKGVsZW1lbnQpXG4gICAgdGhpcy5fcGFyZW50ID0gdGhpcy5fZWxlbWVudC5jbG9zZXN0KFNFTEVDVE9SX1RBQl9QQU5FTClcblxuICAgIGlmICghdGhpcy5fcGFyZW50KSB7XG4gICAgICByZXR1cm5cbiAgICAgIC8vIFRPRE86IHNob3VsZCB0aHJvdyBleGNlcHRpb24gaW4gdjZcbiAgICAgIC8vIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7ZWxlbWVudC5vdXRlckhUTUx9IGhhcyBub3QgYSB2YWxpZCBwYXJlbnQgJHtTRUxFQ1RPUl9JTk5FUl9FTEVNfWApXG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIGluaXRpYWwgYXJpYSBhdHRyaWJ1dGVzXG4gICAgdGhpcy5fc2V0SW5pdGlhbEF0dHJpYnV0ZXModGhpcy5fcGFyZW50LCB0aGlzLl9nZXRDaGlsZHJlbigpKVxuXG4gICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0tFWURPV04sIGV2ZW50ID0+IHRoaXMuX2tleWRvd24oZXZlbnQpKVxuICB9XG5cbiAgLy8gR2V0dGVyc1xuICBzdGF0aWMgZ2V0IE5BTUUoKSB7XG4gICAgcmV0dXJuIE5BTUVcbiAgfVxuXG4gIC8vIFB1YmxpY1xuICBzaG93KCkgeyAvLyBTaG93cyB0aGlzIGVsZW0gYW5kIGRlYWN0aXZhdGUgdGhlIGFjdGl2ZSBzaWJsaW5nIGlmIGV4aXN0c1xuICAgIGNvbnN0IGlubmVyRWxlbSA9IHRoaXMuX2VsZW1lbnRcbiAgICBpZiAodGhpcy5fZWxlbUlzQWN0aXZlKGlubmVyRWxlbSkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIFNlYXJjaCBmb3IgYWN0aXZlIHRhYiBvbiBzYW1lIHBhcmVudCB0byBkZWFjdGl2YXRlIGl0XG4gICAgY29uc3QgYWN0aXZlID0gdGhpcy5fZ2V0QWN0aXZlRWxlbSgpXG5cbiAgICBjb25zdCBoaWRlRXZlbnQgPSBhY3RpdmUgP1xuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIoYWN0aXZlLCBFVkVOVF9ISURFLCB7IHJlbGF0ZWRUYXJnZXQ6IGlubmVyRWxlbSB9KSA6XG4gICAgICBudWxsXG5cbiAgICBjb25zdCBzaG93RXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcihpbm5lckVsZW0sIEVWRU5UX1NIT1csIHsgcmVsYXRlZFRhcmdldDogYWN0aXZlIH0pXG5cbiAgICBpZiAoc2hvd0V2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgfHwgKGhpZGVFdmVudCAmJiBoaWRlRXZlbnQuZGVmYXVsdFByZXZlbnRlZCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuX2RlYWN0aXZhdGUoYWN0aXZlLCBpbm5lckVsZW0pXG4gICAgdGhpcy5fYWN0aXZhdGUoaW5uZXJFbGVtLCBhY3RpdmUpXG4gIH1cblxuICAvLyBQcml2YXRlXG4gIF9hY3RpdmF0ZShlbGVtZW50LCByZWxhdGVkRWxlbSkge1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfQUNUSVZFKVxuXG4gICAgdGhpcy5fYWN0aXZhdGUoU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3RvcihlbGVtZW50KSkgLy8gU2VhcmNoIGFuZCBhY3RpdmF0ZS9zaG93IHRoZSBwcm9wZXIgc2VjdGlvblxuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ3RhYicpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfU0hPVylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcsIHRydWUpXG4gICAgICB0aGlzLl90b2dnbGVEcm9wRG93bihlbGVtZW50LCB0cnVlKVxuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIoZWxlbWVudCwgRVZFTlRfU0hPV04sIHtcbiAgICAgICAgcmVsYXRlZFRhcmdldDogcmVsYXRlZEVsZW1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5fcXVldWVDYWxsYmFjayhjb21wbGV0ZSwgZWxlbWVudCwgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfTkFNRV9GQURFKSlcbiAgfVxuXG4gIF9kZWFjdGl2YXRlKGVsZW1lbnQsIHJlbGF0ZWRFbGVtKSB7XG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9BQ1RJVkUpXG4gICAgZWxlbWVudC5ibHVyKClcblxuICAgIHRoaXMuX2RlYWN0aXZhdGUoU2VsZWN0b3JFbmdpbmUuZ2V0RWxlbWVudEZyb21TZWxlY3RvcihlbGVtZW50KSkgLy8gU2VhcmNoIGFuZCBkZWFjdGl2YXRlIHRoZSBzaG93biBzZWN0aW9uIHRvb1xuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JvbGUnKSAhPT0gJ3RhYicpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKENMQVNTX05BTUVfU0hPVylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgZmFsc2UpXG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKVxuICAgICAgdGhpcy5fdG9nZ2xlRHJvcERvd24oZWxlbWVudCwgZmFsc2UpXG4gICAgICBFdmVudEhhbmRsZXIudHJpZ2dlcihlbGVtZW50LCBFVkVOVF9ISURERU4sIHsgcmVsYXRlZFRhcmdldDogcmVsYXRlZEVsZW0gfSlcbiAgICB9XG5cbiAgICB0aGlzLl9xdWV1ZUNhbGxiYWNrKGNvbXBsZXRlLCBlbGVtZW50LCBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0ZBREUpKVxuICB9XG5cbiAgX2tleWRvd24oZXZlbnQpIHtcbiAgICBpZiAoIShbQVJST1dfTEVGVF9LRVksIEFSUk9XX1JJR0hUX0tFWSwgQVJST1dfVVBfS0VZLCBBUlJPV19ET1dOX0tFWSwgSE9NRV9LRVksIEVORF9LRVldLmluY2x1ZGVzKGV2ZW50LmtleSkpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKS8vIHN0b3BQcm9wYWdhdGlvbi9wcmV2ZW50RGVmYXVsdCBib3RoIGFkZGVkIHRvIHN1cHBvcnQgdXAvZG93biBrZXlzIHdpdGhvdXQgc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbigpLmZpbHRlcihlbGVtZW50ID0+ICFpc0Rpc2FibGVkKGVsZW1lbnQpKVxuICAgIGxldCBuZXh0QWN0aXZlRWxlbWVudFxuXG4gICAgaWYgKFtIT01FX0tFWSwgRU5EX0tFWV0uaW5jbHVkZXMoZXZlbnQua2V5KSkge1xuICAgICAgbmV4dEFjdGl2ZUVsZW1lbnQgPSBjaGlsZHJlbltldmVudC5rZXkgPT09IEhPTUVfS0VZID8gMCA6IGNoaWxkcmVuLmxlbmd0aCAtIDFdXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzTmV4dCA9IFtBUlJPV19SSUdIVF9LRVksIEFSUk9XX0RPV05fS0VZXS5pbmNsdWRlcyhldmVudC5rZXkpXG4gICAgICBuZXh0QWN0aXZlRWxlbWVudCA9IGdldE5leHRBY3RpdmVFbGVtZW50KGNoaWxkcmVuLCBldmVudC50YXJnZXQsIGlzTmV4dCwgdHJ1ZSlcbiAgICB9XG5cbiAgICBpZiAobmV4dEFjdGl2ZUVsZW1lbnQpIHtcbiAgICAgIG5leHRBY3RpdmVFbGVtZW50LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KVxuICAgICAgVGFiLmdldE9yQ3JlYXRlSW5zdGFuY2UobmV4dEFjdGl2ZUVsZW1lbnQpLnNob3coKVxuICAgIH1cbiAgfVxuXG4gIF9nZXRDaGlsZHJlbigpIHsgLy8gY29sbGVjdGlvbiBvZiBpbm5lciBlbGVtZW50c1xuICAgIHJldHVybiBTZWxlY3RvckVuZ2luZS5maW5kKFNFTEVDVE9SX0lOTkVSX0VMRU0sIHRoaXMuX3BhcmVudClcbiAgfVxuXG4gIF9nZXRBY3RpdmVFbGVtKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRDaGlsZHJlbigpLmZpbmQoY2hpbGQgPT4gdGhpcy5fZWxlbUlzQWN0aXZlKGNoaWxkKSkgfHwgbnVsbFxuICB9XG5cbiAgX3NldEluaXRpYWxBdHRyaWJ1dGVzKHBhcmVudCwgY2hpbGRyZW4pIHtcbiAgICB0aGlzLl9zZXRBdHRyaWJ1dGVJZk5vdEV4aXN0cyhwYXJlbnQsICdyb2xlJywgJ3RhYmxpc3QnKVxuXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgICAgdGhpcy5fc2V0SW5pdGlhbEF0dHJpYnV0ZXNPbkNoaWxkKGNoaWxkKVxuICAgIH1cbiAgfVxuXG4gIF9zZXRJbml0aWFsQXR0cmlidXRlc09uQ2hpbGQoY2hpbGQpIHtcbiAgICBjaGlsZCA9IHRoaXMuX2dldElubmVyRWxlbWVudChjaGlsZClcbiAgICBjb25zdCBpc0FjdGl2ZSA9IHRoaXMuX2VsZW1Jc0FjdGl2ZShjaGlsZClcbiAgICBjb25zdCBvdXRlckVsZW0gPSB0aGlzLl9nZXRPdXRlckVsZW1lbnQoY2hpbGQpXG4gICAgY2hpbGQuc2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJywgaXNBY3RpdmUpXG5cbiAgICBpZiAob3V0ZXJFbGVtICE9PSBjaGlsZCkge1xuICAgICAgdGhpcy5fc2V0QXR0cmlidXRlSWZOb3RFeGlzdHMob3V0ZXJFbGVtLCAncm9sZScsICdwcmVzZW50YXRpb24nKVxuICAgIH1cblxuICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgIGNoaWxkLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKVxuICAgIH1cblxuICAgIHRoaXMuX3NldEF0dHJpYnV0ZUlmTm90RXhpc3RzKGNoaWxkLCAncm9sZScsICd0YWInKVxuXG4gICAgLy8gc2V0IGF0dHJpYnV0ZXMgdG8gdGhlIHJlbGF0ZWQgcGFuZWwgdG9vXG4gICAgdGhpcy5fc2V0SW5pdGlhbEF0dHJpYnV0ZXNPblRhcmdldFBhbmVsKGNoaWxkKVxuICB9XG5cbiAgX3NldEluaXRpYWxBdHRyaWJ1dGVzT25UYXJnZXRQYW5lbChjaGlsZCkge1xuICAgIGNvbnN0IHRhcmdldCA9IFNlbGVjdG9yRW5naW5lLmdldEVsZW1lbnRGcm9tU2VsZWN0b3IoY2hpbGQpXG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fc2V0QXR0cmlidXRlSWZOb3RFeGlzdHModGFyZ2V0LCAncm9sZScsICd0YWJwYW5lbCcpXG5cbiAgICBpZiAoY2hpbGQuaWQpIHtcbiAgICAgIHRoaXMuX3NldEF0dHJpYnV0ZUlmTm90RXhpc3RzKHRhcmdldCwgJ2FyaWEtbGFiZWxsZWRieScsIGAke2NoaWxkLmlkfWApXG4gICAgfVxuICB9XG5cbiAgX3RvZ2dsZURyb3BEb3duKGVsZW1lbnQsIG9wZW4pIHtcbiAgICBjb25zdCBvdXRlckVsZW0gPSB0aGlzLl9nZXRPdXRlckVsZW1lbnQoZWxlbWVudClcbiAgICBpZiAoIW91dGVyRWxlbS5jbGFzc0xpc3QuY29udGFpbnMoQ0xBU1NfRFJPUERPV04pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0b2dnbGUgPSAoc2VsZWN0b3IsIGNsYXNzTmFtZSkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IFNlbGVjdG9yRW5naW5lLmZpbmRPbmUoc2VsZWN0b3IsIG91dGVyRWxlbSlcbiAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUsIG9wZW4pXG4gICAgICB9XG4gICAgfVxuXG4gICAgdG9nZ2xlKFNFTEVDVE9SX0RST1BET1dOX1RPR0dMRSwgQ0xBU1NfTkFNRV9BQ1RJVkUpXG4gICAgdG9nZ2xlKFNFTEVDVE9SX0RST1BET1dOX01FTlUsIENMQVNTX05BTUVfU0hPVylcbiAgICBvdXRlckVsZW0uc2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJywgb3BlbilcbiAgfVxuXG4gIF9zZXRBdHRyaWJ1dGVJZk5vdEV4aXN0cyhlbGVtZW50LCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUpKSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIF9lbGVtSXNBY3RpdmUoZWxlbSkge1xuICAgIHJldHVybiBlbGVtLmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX0FDVElWRSlcbiAgfVxuXG4gIC8vIFRyeSB0byBnZXQgdGhlIGlubmVyIGVsZW1lbnQgKHVzdWFsbHkgdGhlIC5uYXYtbGluaylcbiAgX2dldElubmVyRWxlbWVudChlbGVtKSB7XG4gICAgcmV0dXJuIGVsZW0ubWF0Y2hlcyhTRUxFQ1RPUl9JTk5FUl9FTEVNKSA/IGVsZW0gOiBTZWxlY3RvckVuZ2luZS5maW5kT25lKFNFTEVDVE9SX0lOTkVSX0VMRU0sIGVsZW0pXG4gIH1cblxuICAvLyBUcnkgdG8gZ2V0IHRoZSBvdXRlciBlbGVtZW50ICh1c3VhbGx5IHRoZSAubmF2LWl0ZW0pXG4gIF9nZXRPdXRlckVsZW1lbnQoZWxlbSkge1xuICAgIHJldHVybiBlbGVtLmNsb3Nlc3QoU0VMRUNUT1JfT1VURVIpIHx8IGVsZW1cbiAgfVxuXG4gIC8vIFN0YXRpY1xuICBzdGF0aWMgalF1ZXJ5SW50ZXJmYWNlKGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZGF0YSA9IFRhYi5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMpXG5cbiAgICAgIGlmICh0eXBlb2YgY29uZmlnICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGFbY29uZmlnXSA9PT0gdW5kZWZpbmVkIHx8IGNvbmZpZy5zdGFydHNXaXRoKCdfJykgfHwgY29uZmlnID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYClcbiAgICAgIH1cblxuICAgICAgZGF0YVtjb25maWddKClcbiAgICB9KVxuICB9XG59XG5cbi8qKlxuICogRGF0YSBBUEkgaW1wbGVtZW50YXRpb25cbiAqL1xuXG5FdmVudEhhbmRsZXIub24oZG9jdW1lbnQsIEVWRU5UX0NMSUNLX0RBVEFfQVBJLCBTRUxFQ1RPUl9EQVRBX1RPR0dMRSwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmIChbJ0EnLCAnQVJFQSddLmluY2x1ZGVzKHRoaXMudGFnTmFtZSkpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBpZiAoaXNEaXNhYmxlZCh0aGlzKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgVGFiLmdldE9yQ3JlYXRlSW5zdGFuY2UodGhpcykuc2hvdygpXG59KVxuXG4vKipcbiAqIEluaXRpYWxpemUgb24gZm9jdXNcbiAqL1xuRXZlbnRIYW5kbGVyLm9uKHdpbmRvdywgRVZFTlRfTE9BRF9EQVRBX0FQSSwgKCkgPT4ge1xuICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgU2VsZWN0b3JFbmdpbmUuZmluZChTRUxFQ1RPUl9EQVRBX1RPR0dMRV9BQ1RJVkUpKSB7XG4gICAgVGFiLmdldE9yQ3JlYXRlSW5zdGFuY2UoZWxlbWVudClcbiAgfVxufSlcbi8qKlxuICogalF1ZXJ5XG4gKi9cblxuZGVmaW5lSlF1ZXJ5UGx1Z2luKFRhYilcblxuZXhwb3J0IGRlZmF1bHQgVGFiXG4iLCAiLyoqXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQm9vdHN0cmFwIHRvYXN0LmpzXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21haW4vTElDRU5TRSlcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9iYXNlLWNvbXBvbmVudC5qcydcbmltcG9ydCBFdmVudEhhbmRsZXIgZnJvbSAnLi9kb20vZXZlbnQtaGFuZGxlci5qcydcbmltcG9ydCB7IGVuYWJsZURpc21pc3NUcmlnZ2VyIH0gZnJvbSAnLi91dGlsL2NvbXBvbmVudC1mdW5jdGlvbnMuanMnXG5pbXBvcnQgeyBkZWZpbmVKUXVlcnlQbHVnaW4sIHJlZmxvdyB9IGZyb20gJy4vdXRpbC9pbmRleC5qcydcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG5jb25zdCBOQU1FID0gJ3RvYXN0J1xuY29uc3QgREFUQV9LRVkgPSAnYnMudG9hc3QnXG5jb25zdCBFVkVOVF9LRVkgPSBgLiR7REFUQV9LRVl9YFxuXG5jb25zdCBFVkVOVF9NT1VTRU9WRVIgPSBgbW91c2VvdmVyJHtFVkVOVF9LRVl9YFxuY29uc3QgRVZFTlRfTU9VU0VPVVQgPSBgbW91c2VvdXQke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9GT0NVU0lOID0gYGZvY3VzaW4ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9GT0NVU09VVCA9IGBmb2N1c291dCR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0hJREUgPSBgaGlkZSR7RVZFTlRfS0VZfWBcbmNvbnN0IEVWRU5UX0hJRERFTiA9IGBoaWRkZW4ke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9TSE9XID0gYHNob3cke0VWRU5UX0tFWX1gXG5jb25zdCBFVkVOVF9TSE9XTiA9IGBzaG93biR7RVZFTlRfS0VZfWBcblxuY29uc3QgQ0xBU1NfTkFNRV9GQURFID0gJ2ZhZGUnXG5jb25zdCBDTEFTU19OQU1FX0hJREUgPSAnaGlkZScgLy8gQGRlcHJlY2F0ZWQgLSBrZXB0IGhlcmUgb25seSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbmNvbnN0IENMQVNTX05BTUVfU0hPVyA9ICdzaG93J1xuY29uc3QgQ0xBU1NfTkFNRV9TSE9XSU5HID0gJ3Nob3dpbmcnXG5cbmNvbnN0IERlZmF1bHRUeXBlID0ge1xuICBhbmltYXRpb246ICdib29sZWFuJyxcbiAgYXV0b2hpZGU6ICdib29sZWFuJyxcbiAgZGVsYXk6ICdudW1iZXInXG59XG5cbmNvbnN0IERlZmF1bHQgPSB7XG4gIGFuaW1hdGlvbjogdHJ1ZSxcbiAgYXV0b2hpZGU6IHRydWUsXG4gIGRlbGF5OiA1MDAwXG59XG5cbi8qKlxuICogQ2xhc3MgZGVmaW5pdGlvblxuICovXG5cbmNsYXNzIFRvYXN0IGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNvbmZpZykge1xuICAgIHN1cGVyKGVsZW1lbnQsIGNvbmZpZylcblxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5faGFzTW91c2VJbnRlcmFjdGlvbiA9IGZhbHNlXG4gICAgdGhpcy5faGFzS2V5Ym9hcmRJbnRlcmFjdGlvbiA9IGZhbHNlXG4gICAgdGhpcy5fc2V0TGlzdGVuZXJzKClcbiAgfVxuXG4gIC8vIEdldHRlcnNcbiAgc3RhdGljIGdldCBEZWZhdWx0KCkge1xuICAgIHJldHVybiBEZWZhdWx0XG4gIH1cblxuICBzdGF0aWMgZ2V0IERlZmF1bHRUeXBlKCkge1xuICAgIHJldHVybiBEZWZhdWx0VHlwZVxuICB9XG5cbiAgc3RhdGljIGdldCBOQU1FKCkge1xuICAgIHJldHVybiBOQU1FXG4gIH1cblxuICAvLyBQdWJsaWNcbiAgc2hvdygpIHtcbiAgICBjb25zdCBzaG93RXZlbnQgPSBFdmVudEhhbmRsZXIudHJpZ2dlcih0aGlzLl9lbGVtZW50LCBFVkVOVF9TSE9XKVxuXG4gICAgaWYgKHNob3dFdmVudC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhclRpbWVvdXQoKVxuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5hbmltYXRpb24pIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX0ZBREUpXG4gICAgfVxuXG4gICAgY29uc3QgY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9TSE9XSU5HKVxuICAgICAgRXZlbnRIYW5kbGVyLnRyaWdnZXIodGhpcy5fZWxlbWVudCwgRVZFTlRfU0hPV04pXG5cbiAgICAgIHRoaXMuX21heWJlU2NoZWR1bGVIaWRlKClcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQ0xBU1NfTkFNRV9ISURFKSAvLyBAZGVwcmVjYXRlZFxuICAgIHJlZmxvdyh0aGlzLl9lbGVtZW50KVxuICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LmFkZChDTEFTU19OQU1FX1NIT1csIENMQVNTX05BTUVfU0hPV0lORylcblxuICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soY29tcGxldGUsIHRoaXMuX2VsZW1lbnQsIHRoaXMuX2NvbmZpZy5hbmltYXRpb24pXG4gIH1cblxuICBoaWRlKCkge1xuICAgIGlmICghdGhpcy5pc1Nob3duKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGhpZGVFdmVudCA9IEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJREUpXG5cbiAgICBpZiAoaGlkZUV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgdGhpcy5fZWxlbWVudC5jbGFzc0xpc3QuYWRkKENMQVNTX05BTUVfSElERSkgLy8gQGRlcHJlY2F0ZWRcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1dJTkcsIENMQVNTX05BTUVfU0hPVylcbiAgICAgIEV2ZW50SGFuZGxlci50cmlnZ2VyKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0hJRERFTilcbiAgICB9XG5cbiAgICB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5hZGQoQ0xBU1NfTkFNRV9TSE9XSU5HKVxuICAgIHRoaXMuX3F1ZXVlQ2FsbGJhY2soY29tcGxldGUsIHRoaXMuX2VsZW1lbnQsIHRoaXMuX2NvbmZpZy5hbmltYXRpb24pXG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2NsZWFyVGltZW91dCgpXG5cbiAgICBpZiAodGhpcy5pc1Nob3duKCkpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShDTEFTU19OQU1FX1NIT1cpXG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpXG4gIH1cblxuICBpc1Nob3duKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhDTEFTU19OQU1FX1NIT1cpXG4gIH1cblxuICAvLyBQcml2YXRlXG5cbiAgX21heWJlU2NoZWR1bGVIaWRlKCkge1xuICAgIGlmICghdGhpcy5fY29uZmlnLmF1dG9oaWRlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5faGFzTW91c2VJbnRlcmFjdGlvbiB8fCB0aGlzLl9oYXNLZXlib2FyZEludGVyYWN0aW9uKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLl90aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmhpZGUoKVxuICAgIH0sIHRoaXMuX2NvbmZpZy5kZWxheSlcbiAgfVxuXG4gIF9vbkludGVyYWN0aW9uKGV2ZW50LCBpc0ludGVyYWN0aW5nKSB7XG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgICBjYXNlICdtb3VzZW92ZXInOlxuICAgICAgY2FzZSAnbW91c2VvdXQnOiB7XG4gICAgICAgIHRoaXMuX2hhc01vdXNlSW50ZXJhY3Rpb24gPSBpc0ludGVyYWN0aW5nXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ2ZvY3VzaW4nOlxuICAgICAgY2FzZSAnZm9jdXNvdXQnOiB7XG4gICAgICAgIHRoaXMuX2hhc0tleWJvYXJkSW50ZXJhY3Rpb24gPSBpc0ludGVyYWN0aW5nXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG5cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNJbnRlcmFjdGluZykge1xuICAgICAgdGhpcy5fY2xlYXJUaW1lb3V0KClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG5leHRFbGVtZW50ID0gZXZlbnQucmVsYXRlZFRhcmdldFxuICAgIGlmICh0aGlzLl9lbGVtZW50ID09PSBuZXh0RWxlbWVudCB8fCB0aGlzLl9lbGVtZW50LmNvbnRhaW5zKG5leHRFbGVtZW50KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5fbWF5YmVTY2hlZHVsZUhpZGUoKVxuICB9XG5cbiAgX3NldExpc3RlbmVycygpIHtcbiAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfTU9VU0VPVkVSLCBldmVudCA9PiB0aGlzLl9vbkludGVyYWN0aW9uKGV2ZW50LCB0cnVlKSlcbiAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfTU9VU0VPVVQsIGV2ZW50ID0+IHRoaXMuX29uSW50ZXJhY3Rpb24oZXZlbnQsIGZhbHNlKSlcbiAgICBFdmVudEhhbmRsZXIub24odGhpcy5fZWxlbWVudCwgRVZFTlRfRk9DVVNJTiwgZXZlbnQgPT4gdGhpcy5fb25JbnRlcmFjdGlvbihldmVudCwgdHJ1ZSkpXG4gICAgRXZlbnRIYW5kbGVyLm9uKHRoaXMuX2VsZW1lbnQsIEVWRU5UX0ZPQ1VTT1VULCBldmVudCA9PiB0aGlzLl9vbkludGVyYWN0aW9uKGV2ZW50LCBmYWxzZSkpXG4gIH1cblxuICBfY2xlYXJUaW1lb3V0KCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0KVxuICAgIHRoaXMuX3RpbWVvdXQgPSBudWxsXG4gIH1cblxuICAvLyBTdGF0aWNcbiAgc3RhdGljIGpRdWVyeUludGVyZmFjZShjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBUb2FzdC5nZXRPckNyZWF0ZUluc3RhbmNlKHRoaXMsIGNvbmZpZylcblxuICAgICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YVtjb25maWddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE5vIG1ldGhvZCBuYW1lZCBcIiR7Y29uZmlnfVwiYClcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGFbY29uZmlnXSh0aGlzKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBEYXRhIEFQSSBpbXBsZW1lbnRhdGlvblxuICovXG5cbmVuYWJsZURpc21pc3NUcmlnZ2VyKFRvYXN0KVxuXG4vKipcbiAqIGpRdWVyeVxuICovXG5cbmRlZmluZUpRdWVyeVBsdWdpbihUb2FzdClcblxuZXhwb3J0IGRlZmF1bHQgVG9hc3RcbiIsICIvKiFcclxuICogU2VhcmNoIG1vZGFsIGZvciBCb290c3RyYXAgYmFzZWQgVGh1bGl0ZSBzaXRlc1xyXG4gKiBDb3B5cmlnaHQgMjAyMS0yMDI0IFRodWxpdGVcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTW9kYWwgfSBmcm9tICdib290c3RyYXAnO1xyXG5cclxuKCgpID0+IHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBEZWNsYXJlIHNlYXJjaCBlbGVtZW50c1xyXG4gICAgY29uc3Qgc2VhcmNoVG9nZ2xlTW9iaWxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaFRvZ2dsZU1vYmlsZScpO1xyXG4gICAgY29uc3Qgc2VhcmNoVG9nZ2xlRGVza3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hUb2dnbGVEZXNrdG9wJyk7XHJcbiAgICBjb25zdCBzZWFyY2hNb2RhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hNb2RhbCcpO1xyXG4gICAgY29uc3Qgc2VhcmNoRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gtZm9ybScpO1xyXG4gICAgY29uc3Qgc2VhcmNoSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVlcnknKTtcclxuICAgIGNvbnN0IHNlYXJjaFJlc3VsdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VhcmNoUmVzdWx0cycpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBzZWFyY2ggbW9kYWxcclxuICAgIGNvbnN0IGZsZXhTZWFyY2hNb2RhbCA9IG5ldyBNb2RhbChzZWFyY2hNb2RhbCwge1xyXG4gICAgICAgIGZvY3VzOiB0cnVlXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTaG93IHNlYXJjaCBtb2RhbCB3aGVuIHNlYXJjaCBidXR0b24gaXMgY2xpY2tlZFxyXG4gICAgc2VhcmNoVG9nZ2xlTW9iaWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd01vZGFsT25DbGljayk7XHJcbiAgICBzZWFyY2hUb2dnbGVEZXNrdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd01vZGFsT25DbGljayk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd01vZGFsT25DbGljaygpIHtcclxuICAgICAgICBmbGV4U2VhcmNoTW9kYWwudG9nZ2xlKCk7XHJcbiAgICAgICAgLy8gU2hvdyBtZXNzYWdlIFwiTm8gcmVjZW50IHNlYXJjaGVzXCJcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLW5vLXJlY2VudCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2Qtbm9uZScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBrZXlib2FyZCBzaG9ydGN1dHNcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd25IYW5kbGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBvbktleURvd25IYW5kbGVyKGV2ZW50KSB7XHJcbiAgICAgICAgLy8gU2hvdyBzZWFyY2ggbW9kYWwgd2hlbiBcIkN0cmwgKyBrXCIgaXMgcHJlc3NlZFxyXG4gICAgICAgIGlmIChldmVudC5jdHJsS2V5ICYmIGV2ZW50LmtleSA9PT0gJ2snKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGZsZXhTZWFyY2hNb2RhbC5zaG93KCk7XHJcbiAgICAgICAgICAgIC8vIENsZWFyIGlucHV0IGZpZWxkIGFuZCBzZWFyY2ggcmVzdWx0c1xyXG4gICAgICAgICAgICBzZWFyY2hGb3JtLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIHNlYXJjaFJlc3VsdHMudGV4dENvbnRlbnQgPSAnJztcclxuICAgICAgICAgICAgLy8gU2hvdyBtZXNzYWdlIFwiTm8gcmVjZW50IHNlYXJjaGVzXCJcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1uby1yZWNlbnQnKS5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2xlYXIgaW5wdXQgZmllbGQgYW5kIHNlYXJjaCByZXN1bHRzIHdoZW4gXCJFc2NcIiBpcyBwcmVzc2VkXHJcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcclxuICAgICAgICAgICAgc2VhcmNoRm9ybS5yZXNldCgpO1xyXG4gICAgICAgICAgICBzZWFyY2hSZXN1bHRzLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBjbGFzcyBcInNlbGVjdGVkXCIgb24gc2VhcmNoIHJlc3VsdCBhbmQgcmVzZXQgaW5kZXggc2VhcmNoIHJlc3VsdHNcclxuICAgICAgICAgICAgaWYgKHNlYXJjaFJlc3VsdFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyhzZWFyY2hSZXN1bHRTZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEhpZGUgbWVzc2FnZSBcIk5vIHNlYXJjaCByZXN1bHRzXCJcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1uby1yZXN1bHRzJykuY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsZSBjbGlja2luZyBvbiBtb2RhbCBiYWNrZHJvcFxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAvLyBDbGVhciBpbnB1dCBmaWVsZCBhbmQgc2VhcmNoIHJlc3VsdHMgd2hlbiBjbGlja2luZyBvbiBtb2RhbCBiYWNrZHJvcFxyXG4gICAgICAgIHZhciBtb2RhbEVsZW1lbnQgPSBzZWFyY2hNb2RhbC5jb250YWlucyhldmVudC50YXJnZXQpO1xyXG4gICAgICAgIGlmICghbW9kYWxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHNlYXJjaEZvcm0ucmVzZXQoKTtcclxuICAgICAgICAgICAgc2VhcmNoUmVzdWx0cy50ZXh0Q29udGVudCA9ICcnO1xyXG4gICAgICAgICAgICAvLyBIaWRlIG1lc3NhZ2UgXCJObyBzZWFyY2ggcmVzdWx0c1wiXHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtbm8tcmVzdWx0cycpLmNsYXNzTGlzdC5hZGQoJ2Qtbm9uZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBSZW1vdmUgY2xhc3MgXCJzZWxlY3RlZFwiIG9uIHNlYXJjaCByZXN1bHQgYW5kIHJlc2V0IGluZGV4IHNlYXJjaCByZXN1bHRzXHJcbiAgICAgICAgaWYgKHNlYXJjaFJlc3VsdFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHNlYXJjaFJlc3VsdFNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgaW5kZXggPSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBGb2N1cyB0aGUgc2VhcmNoIGlucHV0IGVsZW1lbnQgd2hlbiB0aGUgc2VhcmNoIG1vZGFsIGlzIHNob3duXHJcbiAgICBzZWFyY2hNb2RhbC5hZGRFdmVudExpc3RlbmVyKCdzaG93bi5icy5tb2RhbCcsICgpID0+IHtcclxuICAgICAgICBzZWFyY2hJbnB1dC5mb2N1cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSGFuZGxlIGtleWJvYXJkIG5hdmlnYXRpb24gc2VhcmNoIHJlc3VsdHNcclxuICAgIC8vIEJhc2VkIG9uIGh0dHBzOi8vY29kZXBlbi5pby9tZWh1bGRlc2lnbi9wZW4vZVlwYlhNZ1xyXG4gICAgdmFyIHNlYXJjaFJlc3VsdFNlbGVjdGVkO1xyXG4gICAgdmFyIGluZGV4ID0gLTE7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcclxuICAgICAgICAna2V5ZG93bicsXHJcbiAgICAgICAgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBsZW4gPSBzZWFyY2hSZXN1bHRzLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhcnRpY2xlJykubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0Fycm93RG93bicpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoUmVzdWx0U2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyhzZWFyY2hSZXN1bHRTZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV4dCA9IHNlYXJjaFJlc3VsdHMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2FydGljbGUnKVtpbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBuZXh0ICE9PSAndW5kZWZpbmVkJyAmJiBpbmRleCA8PSBsZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0U2VsZWN0ZWQgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0U2VsZWN0ZWQgPSBzZWFyY2hSZXN1bHRzLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhcnRpY2xlJylbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzKHNlYXJjaFJlc3VsdFNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRTZWxlY3RlZCA9IHNlYXJjaFJlc3VsdHMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2FydGljbGUnKVswXTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRDbGFzcyhzZWFyY2hSZXN1bHRTZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSAnQXJyb3dVcCcpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2hSZXN1bHRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKHNlYXJjaFJlc3VsdFNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleC0tO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGluZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gc2VhcmNoUmVzdWx0cy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYXJ0aWNsZScpW2luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5leHQgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUmVzdWx0U2VsZWN0ZWQgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gbGVuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRTZWxlY3RlZCA9IHNlYXJjaFJlc3VsdHMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2FydGljbGUnKVtsZW5dO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhZGRDbGFzcyhzZWFyY2hSZXN1bHRTZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hSZXN1bHRTZWxlY3RlZCA9IHNlYXJjaFJlc3VsdHMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2FydGljbGUnKVtsZW5dO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZENsYXNzKHNlYXJjaFJlc3VsdFNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmFsc2VcclxuICAgICk7XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZSkge1xyXG4gICAgICAgIGlmIChlbC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCd8JykgKyAnKFxcXFxifCQpJywgJ2dpJyksICcgJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFJlbW92ZSBmb2N1cyBvbiBzZWxlY3RlZCBzZWFyY2ggcmVzdWx0XHJcbiAgICAgICAgc2VhcmNoUmVzdWx0U2VsZWN0ZWQucXVlcnlTZWxlY3RvcignYScpLmJsdXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgaWYgKGVsLmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZWwuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU2V0IGZvY3VzIG9uIHNlbGVjdGVkIHNlYXJjaCByZXN1bHRcclxuICAgICAgICBzZWFyY2hSZXN1bHRTZWxlY3RlZC5xdWVyeVNlbGVjdG9yKCdhJykuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgbW91c2UgbmF2aWdhdGlvbiBzZWFyY2ggcmVzdWx0c1xyXG4gICAgc2VhcmNoUmVzdWx0cy5hZGRFdmVudExpc3RlbmVyKFxyXG4gICAgICAgICdtb3VzZW92ZXInLFxyXG4gICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaFJlc3VsdFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyhzZWFyY2hSZXN1bHRTZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGZhbHNlXHJcbiAgICApO1xyXG59KSgpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFBQTtBQUFBLElBQUE7QUFBQSw0QkFBQUE7QUFBQSxJQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7OztBQ0FPLE1BQUksTUFBTTtBQUNWLE1BQUksU0FBUztBQUNiLE1BQUksUUFBUTtBQUNaLE1BQUksT0FBTztBQUNYLE1BQUksT0FBTztBQUNYLE1BQUksaUJBQWlCLENBQUMsS0FBSyxRQUFRLE9BQU8sSUFBSTtBQUM5QyxNQUFJLFFBQVE7QUFDWixNQUFJLE1BQU07QUFDVixNQUFJLGtCQUFrQjtBQUN0QixNQUFJLFdBQVc7QUFDZixNQUFJLFNBQVM7QUFDYixNQUFJLFlBQVk7QUFDaEIsTUFBSSxzQkFBbUMsK0JBQWUsT0FBTyxTQUFVLEtBQUssV0FBVztBQUM1RixXQUFPLElBQUksT0FBTyxDQUFDLFlBQVksTUFBTSxPQUFPLFlBQVksTUFBTSxHQUFHLENBQUM7QUFBQSxFQUNwRSxHQUFHLENBQUMsQ0FBQztBQUNFLE1BQUksYUFBMEIsaUJBQUMsRUFBRSxPQUFPLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sU0FBVSxLQUFLLFdBQVc7QUFDdEcsV0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXLFlBQVksTUFBTSxPQUFPLFlBQVksTUFBTSxHQUFHLENBQUM7QUFBQSxFQUMvRSxHQUFHLENBQUMsQ0FBQztBQUVFLE1BQUksYUFBYTtBQUNqQixN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QUFNO0FBQUEsTUFDMUI7QUFFQSwyQkFBcUIsY0FBYyxHQUFHLEVBQUUsTUFBTTtBQUFBLElBQ2xEO0FBR0Esa0JBQWM7QUFBQSxNQUNWO0FBQUEsTUFDQSxNQUFNO0FBQ0YsWUFBSSxzQkFBc0I7QUFDdEIsc0JBQVksc0JBQXNCLFVBQVU7QUFBQSxRQUNoRDtBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsSUFDSjtBQUFBLEVBQ0osR0FBRzsiLAogICJuYW1lcyI6IFsiY3JlYXRlUG9wcGVyIiwgIm5hbWUiLCAic3R5bGUiLCAiZ2V0Q29tcHV0ZWRTdHlsZSIsICJnZXRDb21wdXRlZFN0eWxlIiwgIndpbmRvdyIsICJtaW4iLCAibWF4IiwgInRvUGFkZGluZ09iamVjdCIsICJwb3BwZXJPZmZzZXRzIiwgIm1pbiIsICJtYXgiLCAib2Zmc2V0IiwgImVmZmVjdCIsICJwb3BwZXIiLCAiZ2V0Q29tcHV0ZWRTdHlsZSIsICJlZmZlY3QiLCAid2luZG93IiwgImhhc2giLCAiZ2V0Q29tcHV0ZWRTdHlsZSIsICJnZXRDb21wdXRlZFN0eWxlIiwgImNsaXBwaW5nUGFyZW50cyIsICJnZXRDb21wdXRlZFN0eWxlIiwgInJlZmVyZW5jZSIsICJwb3BwZXJPZmZzZXRzIiwgIm9mZnNldCIsICJwbGFjZW1lbnRzIiwgInBsYWNlbWVudCIsICJwbGFjZW1lbnRzIiwgInBsYWNlbWVudCIsICJfbG9vcCIsICJfaSIsICJjaGVja3MiLCAib2Zmc2V0IiwgInBvcHBlck9mZnNldHMiLCAib2Zmc2V0IiwgIm1pbiIsICJtYXgiLCAiZm4iLCAibWVyZ2VkIiwgImRlZmF1bHRNb2RpZmllcnMiLCAiY3JlYXRlUG9wcGVyIiwgInJlZmVyZW5jZSIsICJwb3BwZXIiLCAib3B0aW9ucyIsICJmbiIsICJzdGF0ZSIsICJlZmZlY3QiLCAibm9vcEZuIiwgImNyZWF0ZVBvcHBlciIsICJkZWZhdWx0TW9kaWZpZXJzIiwgImNyZWF0ZVBvcHBlciIsICJlbGVtZW50TWFwIiwgIk1hcCIsICJzZXQiLCAiZWxlbWVudCIsICJrZXkiLCAiaW5zdGFuY2UiLCAiaGFzIiwgImluc3RhbmNlTWFwIiwgImdldCIsICJzaXplIiwgImNvbnNvbGUiLCAiZXJyb3IiLCAiQXJyYXkiLCAiZnJvbSIsICJrZXlzIiwgInJlbW92ZSIsICJkZWxldGUiLCAiTUFYX1VJRCIsICJNSUxMSVNFQ09ORFNfTVVMVElQTElFUiIsICJUUkFOU0lUSU9OX0VORCIsICJwYXJzZVNlbGVjdG9yIiwgInNlbGVjdG9yIiwgIndpbmRvdyIsICJDU1MiLCAiZXNjYXBlIiwgInJlcGxhY2UiLCAibWF0Y2giLCAiaWQiLCAidG9UeXBlIiwgIm9iamVjdCIsICJ1bmRlZmluZWQiLCAiT2JqZWN0IiwgInByb3RvdHlwZSIsICJ0b1N0cmluZyIsICJjYWxsIiwgInRvTG93ZXJDYXNlIiwgImdldFVJRCIsICJwcmVmaXgiLCAiTWF0aCIsICJmbG9vciIsICJyYW5kb20iLCAiZG9jdW1lbnQiLCAiZ2V0RWxlbWVudEJ5SWQiLCAiZ2V0VHJhbnNpdGlvbkR1cmF0aW9uRnJvbUVsZW1lbnQiLCAidHJhbnNpdGlvbkR1cmF0aW9uIiwgInRyYW5zaXRpb25EZWxheSIsICJnZXRDb21wdXRlZFN0eWxlIiwgImZsb2F0VHJhbnNpdGlvbkR1cmF0aW9uIiwgIk51bWJlciIsICJwYXJzZUZsb2F0IiwgImZsb2F0VHJhbnNpdGlvbkRlbGF5IiwgInNwbGl0IiwgInRyaWdnZXJUcmFuc2l0aW9uRW5kIiwgImRpc3BhdGNoRXZlbnQiLCAiRXZlbnQiLCAiaXNFbGVtZW50IiwgImpxdWVyeSIsICJub2RlVHlwZSIsICJnZXRFbGVtZW50IiwgImxlbmd0aCIsICJxdWVyeVNlbGVjdG9yIiwgImlzVmlzaWJsZSIsICJnZXRDbGllbnRSZWN0cyIsICJlbGVtZW50SXNWaXNpYmxlIiwgImdldFByb3BlcnR5VmFsdWUiLCAiY2xvc2VkRGV0YWlscyIsICJjbG9zZXN0IiwgInN1bW1hcnkiLCAicGFyZW50Tm9kZSIsICJpc0Rpc2FibGVkIiwgIk5vZGUiLCAiRUxFTUVOVF9OT0RFIiwgImNsYXNzTGlzdCIsICJjb250YWlucyIsICJkaXNhYmxlZCIsICJoYXNBdHRyaWJ1dGUiLCAiZ2V0QXR0cmlidXRlIiwgImZpbmRTaGFkb3dSb290IiwgImRvY3VtZW50RWxlbWVudCIsICJhdHRhY2hTaGFkb3ciLCAiZ2V0Um9vdE5vZGUiLCAicm9vdCIsICJTaGFkb3dSb290IiwgIm5vb3AiLCAicmVmbG93IiwgIm9mZnNldEhlaWdodCIsICJnZXRqUXVlcnkiLCAialF1ZXJ5IiwgImJvZHkiLCAiRE9NQ29udGVudExvYWRlZENhbGxiYWNrcyIsICJvbkRPTUNvbnRlbnRMb2FkZWQiLCAiY2FsbGJhY2siLCAicmVhZHlTdGF0ZSIsICJhZGRFdmVudExpc3RlbmVyIiwgInB1c2giLCAiaXNSVEwiLCAiZGlyIiwgImRlZmluZUpRdWVyeVBsdWdpbiIsICJwbHVnaW4iLCAiJCIsICJuYW1lIiwgIk5BTUUiLCAiSlFVRVJZX05PX0NPTkZMSUNUIiwgImZuIiwgImpRdWVyeUludGVyZmFjZSIsICJDb25zdHJ1Y3RvciIsICJub0NvbmZsaWN0IiwgImV4ZWN1dGUiLCAicG9zc2libGVDYWxsYmFjayIsICJhcmdzIiwgImRlZmF1bHRWYWx1ZSIsICJleGVjdXRlQWZ0ZXJUcmFuc2l0aW9uIiwgInRyYW5zaXRpb25FbGVtZW50IiwgIndhaXRGb3JUcmFuc2l0aW9uIiwgImR1cmF0aW9uUGFkZGluZyIsICJlbXVsYXRlZER1cmF0aW9uIiwgImNhbGxlZCIsICJoYW5kbGVyIiwgInRhcmdldCIsICJyZW1vdmVFdmVudExpc3RlbmVyIiwgInNldFRpbWVvdXQiLCAiZ2V0TmV4dEFjdGl2ZUVsZW1lbnQiLCAibGlzdCIsICJhY3RpdmVFbGVtZW50IiwgInNob3VsZEdldE5leHQiLCAiaXNDeWNsZUFsbG93ZWQiLCAibGlzdExlbmd0aCIsICJpbmRleCIsICJpbmRleE9mIiwgIm1heCIsICJtaW4iLCAibmFtZXNwYWNlUmVnZXgiLCAic3RyaXBOYW1lUmVnZXgiLCAic3RyaXBVaWRSZWdleCIsICJldmVudFJlZ2lzdHJ5IiwgInVpZEV2ZW50IiwgImN1c3RvbUV2ZW50cyIsICJtb3VzZWVudGVyIiwgIm1vdXNlbGVhdmUiLCAibmF0aXZlRXZlbnRzIiwgIlNldCIsICJtYWtlRXZlbnRVaWQiLCAidWlkIiwgImdldEVsZW1lbnRFdmVudHMiLCAiYm9vdHN0cmFwSGFuZGxlciIsICJldmVudCIsICJoeWRyYXRlT2JqIiwgImRlbGVnYXRlVGFyZ2V0IiwgIm9uZU9mZiIsICJFdmVudEhhbmRsZXIiLCAib2ZmIiwgInR5cGUiLCAiYXBwbHkiLCAiYm9vdHN0cmFwRGVsZWdhdGlvbkhhbmRsZXIiLCAiZG9tRWxlbWVudHMiLCAicXVlcnlTZWxlY3RvckFsbCIsICJkb21FbGVtZW50IiwgImZpbmRIYW5kbGVyIiwgImV2ZW50cyIsICJjYWxsYWJsZSIsICJkZWxlZ2F0aW9uU2VsZWN0b3IiLCAidmFsdWVzIiwgImZpbmQiLCAibm9ybWFsaXplUGFyYW1ldGVycyIsICJvcmlnaW5hbFR5cGVFdmVudCIsICJkZWxlZ2F0aW9uRnVuY3Rpb24iLCAiaXNEZWxlZ2F0ZWQiLCAidHlwZUV2ZW50IiwgImdldFR5cGVFdmVudCIsICJhZGRIYW5kbGVyIiwgIndyYXBGdW5jdGlvbiIsICJyZWxhdGVkVGFyZ2V0IiwgImhhbmRsZXJzIiwgInByZXZpb3VzRnVuY3Rpb24iLCAicmVtb3ZlSGFuZGxlciIsICJCb29sZWFuIiwgInJlbW92ZU5hbWVzcGFjZWRIYW5kbGVycyIsICJuYW1lc3BhY2UiLCAic3RvcmVFbGVtZW50RXZlbnQiLCAiaGFuZGxlcktleSIsICJlbnRyaWVzIiwgImluY2x1ZGVzIiwgIm9uIiwgIm9uZSIsICJpbk5hbWVzcGFjZSIsICJpc05hbWVzcGFjZSIsICJzdGFydHNXaXRoIiwgImVsZW1lbnRFdmVudCIsICJzbGljZSIsICJrZXlIYW5kbGVycyIsICJ0cmlnZ2VyIiwgImpRdWVyeUV2ZW50IiwgImJ1YmJsZXMiLCAibmF0aXZlRGlzcGF0Y2giLCAiZGVmYXVsdFByZXZlbnRlZCIsICJpc1Byb3BhZ2F0aW9uU3RvcHBlZCIsICJpc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCIsICJpc0RlZmF1bHRQcmV2ZW50ZWQiLCAiZXZ0IiwgImNhbmNlbGFibGUiLCAicHJldmVudERlZmF1bHQiLCAib2JqIiwgIm1ldGEiLCAidmFsdWUiLCAiX3VudXNlZCIsICJkZWZpbmVQcm9wZXJ0eSIsICJjb25maWd1cmFibGUiLCAibm9ybWFsaXplRGF0YSIsICJKU09OIiwgInBhcnNlIiwgImRlY29kZVVSSUNvbXBvbmVudCIsICJub3JtYWxpemVEYXRhS2V5IiwgImNociIsICJNYW5pcHVsYXRvciIsICJzZXREYXRhQXR0cmlidXRlIiwgInNldEF0dHJpYnV0ZSIsICJyZW1vdmVEYXRhQXR0cmlidXRlIiwgInJlbW92ZUF0dHJpYnV0ZSIsICJnZXREYXRhQXR0cmlidXRlcyIsICJhdHRyaWJ1dGVzIiwgImJzS2V5cyIsICJkYXRhc2V0IiwgImZpbHRlciIsICJwdXJlS2V5IiwgImNoYXJBdCIsICJnZXREYXRhQXR0cmlidXRlIiwgIkNvbmZpZyIsICJEZWZhdWx0IiwgIkRlZmF1bHRUeXBlIiwgIkVycm9yIiwgIl9nZXRDb25maWciLCAiY29uZmlnIiwgIl9tZXJnZUNvbmZpZ09iaiIsICJfY29uZmlnQWZ0ZXJNZXJnZSIsICJfdHlwZUNoZWNrQ29uZmlnIiwgImpzb25Db25maWciLCAiY29uc3RydWN0b3IiLCAiY29uZmlnVHlwZXMiLCAicHJvcGVydHkiLCAiZXhwZWN0ZWRUeXBlcyIsICJ2YWx1ZVR5cGUiLCAiUmVnRXhwIiwgInRlc3QiLCAiVHlwZUVycm9yIiwgInRvVXBwZXJDYXNlIiwgIlZFUlNJT04iLCAiQmFzZUNvbXBvbmVudCIsICJfZWxlbWVudCIsICJfY29uZmlnIiwgIkRhdGEiLCAiREFUQV9LRVkiLCAiZGlzcG9zZSIsICJFVkVOVF9LRVkiLCAicHJvcGVydHlOYW1lIiwgImdldE93blByb3BlcnR5TmFtZXMiLCAiX3F1ZXVlQ2FsbGJhY2siLCAiaXNBbmltYXRlZCIsICJnZXRJbnN0YW5jZSIsICJnZXRPckNyZWF0ZUluc3RhbmNlIiwgImV2ZW50TmFtZSIsICJnZXRTZWxlY3RvciIsICJocmVmQXR0cmlidXRlIiwgInRyaW0iLCAibWFwIiwgInNlbCIsICJqb2luIiwgIlNlbGVjdG9yRW5naW5lIiwgImNvbmNhdCIsICJFbGVtZW50IiwgImZpbmRPbmUiLCAiY2hpbGRyZW4iLCAiY2hpbGQiLCAibWF0Y2hlcyIsICJwYXJlbnRzIiwgImFuY2VzdG9yIiwgInByZXYiLCAicHJldmlvdXMiLCAicHJldmlvdXNFbGVtZW50U2libGluZyIsICJuZXh0IiwgIm5leHRFbGVtZW50U2libGluZyIsICJmb2N1c2FibGVDaGlsZHJlbiIsICJmb2N1c2FibGVzIiwgImVsIiwgImdldFNlbGVjdG9yRnJvbUVsZW1lbnQiLCAiZ2V0RWxlbWVudEZyb21TZWxlY3RvciIsICJnZXRNdWx0aXBsZUVsZW1lbnRzRnJvbVNlbGVjdG9yIiwgImVuYWJsZURpc21pc3NUcmlnZ2VyIiwgImNvbXBvbmVudCIsICJtZXRob2QiLCAiY2xpY2tFdmVudCIsICJ0YWdOYW1lIiwgIkVWRU5UX0NMT1NFIiwgIkVWRU5UX0NMT1NFRCIsICJDTEFTU19OQU1FX0ZBREUiLCAiQ0xBU1NfTkFNRV9TSE9XIiwgIkFsZXJ0IiwgImNsb3NlIiwgImNsb3NlRXZlbnQiLCAiX2Rlc3Ryb3lFbGVtZW50IiwgImVhY2giLCAiZGF0YSIsICJEQVRBX0FQSV9LRVkiLCAiQ0xBU1NfTkFNRV9BQ1RJVkUiLCAiU0VMRUNUT1JfREFUQV9UT0dHTEUiLCAiRVZFTlRfQ0xJQ0tfREFUQV9BUEkiLCAiQnV0dG9uIiwgInRvZ2dsZSIsICJidXR0b24iLCAiRVZFTlRfVE9VQ0hTVEFSVCIsICJFVkVOVF9UT1VDSE1PVkUiLCAiRVZFTlRfVE9VQ0hFTkQiLCAiRVZFTlRfUE9JTlRFUkRPV04iLCAiRVZFTlRfUE9JTlRFUlVQIiwgIlBPSU5URVJfVFlQRV9UT1VDSCIsICJQT0lOVEVSX1RZUEVfUEVOIiwgIkNMQVNTX05BTUVfUE9JTlRFUl9FVkVOVCIsICJTV0lQRV9USFJFU0hPTEQiLCAiZW5kQ2FsbGJhY2siLCAibGVmdENhbGxiYWNrIiwgInJpZ2h0Q2FsbGJhY2siLCAiU3dpcGUiLCAiaXNTdXBwb3J0ZWQiLCAiX2RlbHRhWCIsICJfc3VwcG9ydFBvaW50ZXJFdmVudHMiLCAiUG9pbnRlckV2ZW50IiwgIl9pbml0RXZlbnRzIiwgIl9zdGFydCIsICJ0b3VjaGVzIiwgImNsaWVudFgiLCAiX2V2ZW50SXNQb2ludGVyUGVuVG91Y2giLCAiX2VuZCIsICJfaGFuZGxlU3dpcGUiLCAiX21vdmUiLCAiYWJzRGVsdGFYIiwgImFicyIsICJkaXJlY3Rpb24iLCAiYWRkIiwgInBvaW50ZXJUeXBlIiwgIm5hdmlnYXRvciIsICJtYXhUb3VjaFBvaW50cyIsICJBUlJPV19MRUZUX0tFWSIsICJBUlJPV19SSUdIVF9LRVkiLCAiVE9VQ0hFVkVOVF9DT01QQVRfV0FJVCIsICJPUkRFUl9ORVhUIiwgIk9SREVSX1BSRVYiLCAiRElSRUNUSU9OX0xFRlQiLCAiRElSRUNUSU9OX1JJR0hUIiwgIkVWRU5UX1NMSURFIiwgIkVWRU5UX1NMSUQiLCAiRVZFTlRfS0VZRE9XTiIsICJFVkVOVF9NT1VTRUVOVEVSIiwgIkVWRU5UX01PVVNFTEVBVkUiLCAiRVZFTlRfRFJBR19TVEFSVCIsICJFVkVOVF9MT0FEX0RBVEFfQVBJIiwgIkNMQVNTX05BTUVfQ0FST1VTRUwiLCAiQ0xBU1NfTkFNRV9TTElERSIsICJDTEFTU19OQU1FX0VORCIsICJDTEFTU19OQU1FX1NUQVJUIiwgIkNMQVNTX05BTUVfTkVYVCIsICJDTEFTU19OQU1FX1BSRVYiLCAiU0VMRUNUT1JfQUNUSVZFIiwgIlNFTEVDVE9SX0lURU0iLCAiU0VMRUNUT1JfQUNUSVZFX0lURU0iLCAiU0VMRUNUT1JfSVRFTV9JTUciLCAiU0VMRUNUT1JfSU5ESUNBVE9SUyIsICJTRUxFQ1RPUl9EQVRBX1NMSURFIiwgIlNFTEVDVE9SX0RBVEFfUklERSIsICJLRVlfVE9fRElSRUNUSU9OIiwgImludGVydmFsIiwgImtleWJvYXJkIiwgInBhdXNlIiwgInJpZGUiLCAidG91Y2giLCAid3JhcCIsICJDYXJvdXNlbCIsICJfaW50ZXJ2YWwiLCAiX2FjdGl2ZUVsZW1lbnQiLCAiX2lzU2xpZGluZyIsICJ0b3VjaFRpbWVvdXQiLCAiX3N3aXBlSGVscGVyIiwgIl9pbmRpY2F0b3JzRWxlbWVudCIsICJfYWRkRXZlbnRMaXN0ZW5lcnMiLCAiY3ljbGUiLCAiX3NsaWRlIiwgIm5leHRXaGVuVmlzaWJsZSIsICJoaWRkZW4iLCAiX2NsZWFySW50ZXJ2YWwiLCAiX3VwZGF0ZUludGVydmFsIiwgInNldEludGVydmFsIiwgIl9tYXliZUVuYWJsZUN5Y2xlIiwgInRvIiwgIml0ZW1zIiwgIl9nZXRJdGVtcyIsICJhY3RpdmVJbmRleCIsICJfZ2V0SXRlbUluZGV4IiwgIl9nZXRBY3RpdmUiLCAib3JkZXIiLCAiZGVmYXVsdEludGVydmFsIiwgIl9rZXlkb3duIiwgIl9hZGRUb3VjaEV2ZW50TGlzdGVuZXJzIiwgImltZyIsICJlbmRDYWxsQmFjayIsICJjbGVhclRpbWVvdXQiLCAic3dpcGVDb25maWciLCAiX2RpcmVjdGlvblRvT3JkZXIiLCAiX3NldEFjdGl2ZUluZGljYXRvckVsZW1lbnQiLCAiYWN0aXZlSW5kaWNhdG9yIiwgIm5ld0FjdGl2ZUluZGljYXRvciIsICJlbGVtZW50SW50ZXJ2YWwiLCAicGFyc2VJbnQiLCAiaXNOZXh0IiwgIm5leHRFbGVtZW50IiwgIm5leHRFbGVtZW50SW5kZXgiLCAidHJpZ2dlckV2ZW50IiwgIl9vcmRlclRvRGlyZWN0aW9uIiwgInNsaWRlRXZlbnQiLCAiaXNDeWNsaW5nIiwgImRpcmVjdGlvbmFsQ2xhc3NOYW1lIiwgIm9yZGVyQ2xhc3NOYW1lIiwgImNvbXBsZXRlQ2FsbEJhY2siLCAiX2lzQW5pbWF0ZWQiLCAiY2xlYXJJbnRlcnZhbCIsICJjYXJvdXNlbCIsICJzbGlkZUluZGV4IiwgImNhcm91c2VscyIsICJFVkVOVF9TSE9XIiwgIkVWRU5UX1NIT1dOIiwgIkVWRU5UX0hJREUiLCAiRVZFTlRfSElEREVOIiwgIkNMQVNTX05BTUVfQ09MTEFQU0UiLCAiQ0xBU1NfTkFNRV9DT0xMQVBTSU5HIiwgIkNMQVNTX05BTUVfQ09MTEFQU0VEIiwgIkNMQVNTX05BTUVfREVFUEVSX0NISUxEUkVOIiwgIkNMQVNTX05BTUVfSE9SSVpPTlRBTCIsICJXSURUSCIsICJIRUlHSFQiLCAiU0VMRUNUT1JfQUNUSVZFUyIsICJwYXJlbnQiLCAiQ29sbGFwc2UiLCAiX2lzVHJhbnNpdGlvbmluZyIsICJfdHJpZ2dlckFycmF5IiwgInRvZ2dsZUxpc3QiLCAiZWxlbSIsICJmaWx0ZXJFbGVtZW50IiwgImZvdW5kRWxlbWVudCIsICJfaW5pdGlhbGl6ZUNoaWxkcmVuIiwgIl9hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MiLCAiX2lzU2hvd24iLCAiaGlkZSIsICJzaG93IiwgImFjdGl2ZUNoaWxkcmVuIiwgIl9nZXRGaXJzdExldmVsQ2hpbGRyZW4iLCAic3RhcnRFdmVudCIsICJhY3RpdmVJbnN0YW5jZSIsICJkaW1lbnNpb24iLCAiX2dldERpbWVuc2lvbiIsICJzdHlsZSIsICJjb21wbGV0ZSIsICJjYXBpdGFsaXplZERpbWVuc2lvbiIsICJzY3JvbGxTaXplIiwgImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsICJzZWxlY3RlZCIsICJ0cmlnZ2VyQXJyYXkiLCAiaXNPcGVuIiwgIkVTQ0FQRV9LRVkiLCAiVEFCX0tFWSIsICJBUlJPV19VUF9LRVkiLCAiQVJST1dfRE9XTl9LRVkiLCAiUklHSFRfTU9VU0VfQlVUVE9OIiwgIkVWRU5UX0tFWURPV05fREFUQV9BUEkiLCAiRVZFTlRfS0VZVVBfREFUQV9BUEkiLCAiQ0xBU1NfTkFNRV9EUk9QVVAiLCAiQ0xBU1NfTkFNRV9EUk9QRU5EIiwgIkNMQVNTX05BTUVfRFJPUFNUQVJUIiwgIkNMQVNTX05BTUVfRFJPUFVQX0NFTlRFUiIsICJDTEFTU19OQU1FX0RST1BET1dOX0NFTlRFUiIsICJTRUxFQ1RPUl9EQVRBX1RPR0dMRV9TSE9XTiIsICJTRUxFQ1RPUl9NRU5VIiwgIlNFTEVDVE9SX05BVkJBUiIsICJTRUxFQ1RPUl9OQVZCQVJfTkFWIiwgIlNFTEVDVE9SX1ZJU0lCTEVfSVRFTVMiLCAiUExBQ0VNRU5UX1RPUCIsICJQTEFDRU1FTlRfVE9QRU5EIiwgIlBMQUNFTUVOVF9CT1RUT00iLCAiUExBQ0VNRU5UX0JPVFRPTUVORCIsICJQTEFDRU1FTlRfUklHSFQiLCAiUExBQ0VNRU5UX0xFRlQiLCAiUExBQ0VNRU5UX1RPUENFTlRFUiIsICJQTEFDRU1FTlRfQk9UVE9NQ0VOVEVSIiwgImF1dG9DbG9zZSIsICJib3VuZGFyeSIsICJkaXNwbGF5IiwgIm9mZnNldCIsICJwb3BwZXJDb25maWciLCAicmVmZXJlbmNlIiwgIkRyb3Bkb3duIiwgIl9wb3BwZXIiLCAiX3BhcmVudCIsICJfbWVudSIsICJfaW5OYXZiYXIiLCAiX2RldGVjdE5hdmJhciIsICJzaG93RXZlbnQiLCAiX2NyZWF0ZVBvcHBlciIsICJmb2N1cyIsICJfY29tcGxldGVIaWRlIiwgImRlc3Ryb3kiLCAidXBkYXRlIiwgImhpZGVFdmVudCIsICJQb3BwZXIiLCAicmVmZXJlbmNlRWxlbWVudCIsICJfZ2V0UG9wcGVyQ29uZmlnIiwgImNyZWF0ZVBvcHBlciIsICJfZ2V0UGxhY2VtZW50IiwgInBhcmVudERyb3Bkb3duIiwgImlzRW5kIiwgIl9nZXRPZmZzZXQiLCAicG9wcGVyRGF0YSIsICJkZWZhdWx0QnNQb3BwZXJDb25maWciLCAicGxhY2VtZW50IiwgIm1vZGlmaWVycyIsICJvcHRpb25zIiwgImVuYWJsZWQiLCAiX3NlbGVjdE1lbnVJdGVtIiwgImNsZWFyTWVudXMiLCAib3BlblRvZ2dsZXMiLCAiY29udGV4dCIsICJjb21wb3NlZFBhdGgiLCAiaXNNZW51VGFyZ2V0IiwgImRhdGFBcGlLZXlkb3duSGFuZGxlciIsICJpc0lucHV0IiwgImlzRXNjYXBlRXZlbnQiLCAiaXNVcE9yRG93bkV2ZW50IiwgImdldFRvZ2dsZUJ1dHRvbiIsICJzdG9wUHJvcGFnYXRpb24iLCAiRVZFTlRfTU9VU0VET1dOIiwgImNsYXNzTmFtZSIsICJjbGlja0NhbGxiYWNrIiwgInJvb3RFbGVtZW50IiwgIkJhY2tkcm9wIiwgIl9pc0FwcGVuZGVkIiwgIl9hcHBlbmQiLCAiX2dldEVsZW1lbnQiLCAiX2VtdWxhdGVBbmltYXRpb24iLCAiYmFja2Ryb3AiLCAiY3JlYXRlRWxlbWVudCIsICJhcHBlbmQiLCAiRVZFTlRfRk9DVVNJTiIsICJFVkVOVF9LRVlET1dOX1RBQiIsICJUQUJfTkFWX0ZPUldBUkQiLCAiVEFCX05BVl9CQUNLV0FSRCIsICJhdXRvZm9jdXMiLCAidHJhcEVsZW1lbnQiLCAiRm9jdXNUcmFwIiwgIl9pc0FjdGl2ZSIsICJfbGFzdFRhYk5hdkRpcmVjdGlvbiIsICJhY3RpdmF0ZSIsICJfaGFuZGxlRm9jdXNpbiIsICJfaGFuZGxlS2V5ZG93biIsICJkZWFjdGl2YXRlIiwgImVsZW1lbnRzIiwgInNoaWZ0S2V5IiwgIlNFTEVDVE9SX0ZJWEVEX0NPTlRFTlQiLCAiU0VMRUNUT1JfU1RJQ0tZX0NPTlRFTlQiLCAiUFJPUEVSVFlfUEFERElORyIsICJQUk9QRVJUWV9NQVJHSU4iLCAiU2Nyb2xsQmFySGVscGVyIiwgImdldFdpZHRoIiwgImRvY3VtZW50V2lkdGgiLCAiY2xpZW50V2lkdGgiLCAiaW5uZXJXaWR0aCIsICJ3aWR0aCIsICJfZGlzYWJsZU92ZXJGbG93IiwgIl9zZXRFbGVtZW50QXR0cmlidXRlcyIsICJjYWxjdWxhdGVkVmFsdWUiLCAicmVzZXQiLCAiX3Jlc2V0RWxlbWVudEF0dHJpYnV0ZXMiLCAiaXNPdmVyZmxvd2luZyIsICJfc2F2ZUluaXRpYWxBdHRyaWJ1dGUiLCAib3ZlcmZsb3ciLCAic3R5bGVQcm9wZXJ0eSIsICJzY3JvbGxiYXJXaWR0aCIsICJtYW5pcHVsYXRpb25DYWxsQmFjayIsICJzZXRQcm9wZXJ0eSIsICJfYXBwbHlNYW5pcHVsYXRpb25DYWxsYmFjayIsICJhY3R1YWxWYWx1ZSIsICJyZW1vdmVQcm9wZXJ0eSIsICJjYWxsQmFjayIsICJFVkVOVF9ISURFX1BSRVZFTlRFRCIsICJFVkVOVF9SRVNJWkUiLCAiRVZFTlRfQ0xJQ0tfRElTTUlTUyIsICJFVkVOVF9NT1VTRURPV05fRElTTUlTUyIsICJFVkVOVF9LRVlET1dOX0RJU01JU1MiLCAiQ0xBU1NfTkFNRV9PUEVOIiwgIkNMQVNTX05BTUVfU1RBVElDIiwgIk9QRU5fU0VMRUNUT1IiLCAiU0VMRUNUT1JfRElBTE9HIiwgIlNFTEVDVE9SX01PREFMX0JPRFkiLCAiTW9kYWwiLCAiX2RpYWxvZyIsICJfYmFja2Ryb3AiLCAiX2luaXRpYWxpemVCYWNrRHJvcCIsICJfZm9jdXN0cmFwIiwgIl9pbml0aWFsaXplRm9jdXNUcmFwIiwgIl9zY3JvbGxCYXIiLCAiX2FkanVzdERpYWxvZyIsICJfc2hvd0VsZW1lbnQiLCAiX2hpZGVNb2RhbCIsICJoYW5kbGVVcGRhdGUiLCAic2Nyb2xsVG9wIiwgIm1vZGFsQm9keSIsICJ0cmFuc2l0aW9uQ29tcGxldGUiLCAiX3RyaWdnZXJCYWNrZHJvcFRyYW5zaXRpb24iLCAiZXZlbnQyIiwgIl9yZXNldEFkanVzdG1lbnRzIiwgImlzTW9kYWxPdmVyZmxvd2luZyIsICJzY3JvbGxIZWlnaHQiLCAiY2xpZW50SGVpZ2h0IiwgImluaXRpYWxPdmVyZmxvd1kiLCAib3ZlcmZsb3dZIiwgImlzQm9keU92ZXJmbG93aW5nIiwgInBhZGRpbmdMZWZ0IiwgInBhZGRpbmdSaWdodCIsICJhbHJlYWR5T3BlbiIsICJDTEFTU19OQU1FX1NIT1dJTkciLCAiQ0xBU1NfTkFNRV9ISURJTkciLCAiQ0xBU1NfTkFNRV9CQUNLRFJPUCIsICJzY3JvbGwiLCAiT2ZmY2FudmFzIiwgImJsdXIiLCAiY29tcGxldGVDYWxsYmFjayIsICJwb3NpdGlvbiIsICJBUklBX0FUVFJJQlVURV9QQVRURVJOIiwgIkRlZmF1bHRBbGxvd2xpc3QiLCAiYSIsICJhcmVhIiwgImIiLCAiYnIiLCAiY29sIiwgImNvZGUiLCAiZGQiLCAiZGl2IiwgImRsIiwgImR0IiwgImVtIiwgImhyIiwgImgxIiwgImgyIiwgImgzIiwgImg0IiwgImg1IiwgImg2IiwgImkiLCAibGkiLCAib2wiLCAicCIsICJwcmUiLCAicyIsICJzbWFsbCIsICJzcGFuIiwgInN1YiIsICJzdXAiLCAic3Ryb25nIiwgInUiLCAidWwiLCAidXJpQXR0cmlidXRlcyIsICJTQUZFX1VSTF9QQVRURVJOIiwgImFsbG93ZWRBdHRyaWJ1dGUiLCAiYXR0cmlidXRlIiwgImFsbG93ZWRBdHRyaWJ1dGVMaXN0IiwgImF0dHJpYnV0ZU5hbWUiLCAibm9kZU5hbWUiLCAibm9kZVZhbHVlIiwgImF0dHJpYnV0ZVJlZ2V4IiwgInNvbWUiLCAicmVnZXgiLCAic2FuaXRpemVIdG1sIiwgInVuc2FmZUh0bWwiLCAiYWxsb3dMaXN0IiwgInNhbml0aXplRnVuY3Rpb24iLCAiZG9tUGFyc2VyIiwgIkRPTVBhcnNlciIsICJjcmVhdGVkRG9jdW1lbnQiLCAicGFyc2VGcm9tU3RyaW5nIiwgImVsZW1lbnROYW1lIiwgImF0dHJpYnV0ZUxpc3QiLCAiYWxsb3dlZEF0dHJpYnV0ZXMiLCAiaW5uZXJIVE1MIiwgImNvbnRlbnQiLCAiZXh0cmFDbGFzcyIsICJodG1sIiwgInNhbml0aXplIiwgInNhbml0aXplRm4iLCAidGVtcGxhdGUiLCAiRGVmYXVsdENvbnRlbnRUeXBlIiwgImVudHJ5IiwgIlRlbXBsYXRlRmFjdG9yeSIsICJnZXRDb250ZW50IiwgIl9yZXNvbHZlUG9zc2libGVGdW5jdGlvbiIsICJoYXNDb250ZW50IiwgImNoYW5nZUNvbnRlbnQiLCAiX2NoZWNrQ29udGVudCIsICJ0b0h0bWwiLCAidGVtcGxhdGVXcmFwcGVyIiwgIl9tYXliZVNhbml0aXplIiwgInRleHQiLCAiX3NldENvbnRlbnQiLCAiYXJnIiwgInRlbXBsYXRlRWxlbWVudCIsICJfcHV0RWxlbWVudEluVGVtcGxhdGUiLCAidGV4dENvbnRlbnQiLCAiRElTQUxMT1dFRF9BVFRSSUJVVEVTIiwgIkNMQVNTX05BTUVfTU9EQUwiLCAiU0VMRUNUT1JfVE9PTFRJUF9JTk5FUiIsICJTRUxFQ1RPUl9NT0RBTCIsICJFVkVOVF9NT0RBTF9ISURFIiwgIlRSSUdHRVJfSE9WRVIiLCAiVFJJR0dFUl9GT0NVUyIsICJUUklHR0VSX0NMSUNLIiwgIlRSSUdHRVJfTUFOVUFMIiwgIkVWRU5UX0lOU0VSVEVEIiwgIkVWRU5UX0NMSUNLIiwgIkVWRU5UX0ZPQ1VTT1VUIiwgIkF0dGFjaG1lbnRNYXAiLCAiQVVUTyIsICJUT1AiLCAiUklHSFQiLCAiQk9UVE9NIiwgIkxFRlQiLCAiYW5pbWF0aW9uIiwgImNvbnRhaW5lciIsICJjdXN0b21DbGFzcyIsICJkZWxheSIsICJmYWxsYmFja1BsYWNlbWVudHMiLCAidGl0bGUiLCAiVG9vbHRpcCIsICJfaXNFbmFibGVkIiwgIl90aW1lb3V0IiwgIl9pc0hvdmVyZWQiLCAiX2FjdGl2ZVRyaWdnZXIiLCAiX3RlbXBsYXRlRmFjdG9yeSIsICJfbmV3Q29udGVudCIsICJ0aXAiLCAiX3NldExpc3RlbmVycyIsICJfZml4VGl0bGUiLCAiZW5hYmxlIiwgImRpc2FibGUiLCAidG9nZ2xlRW5hYmxlZCIsICJjbGljayIsICJfbGVhdmUiLCAiX2VudGVyIiwgIl9oaWRlTW9kYWxIYW5kbGVyIiwgIl9kaXNwb3NlUG9wcGVyIiwgIl9pc1dpdGhDb250ZW50IiwgInNoYWRvd1Jvb3QiLCAiaXNJblRoZURvbSIsICJvd25lckRvY3VtZW50IiwgIl9nZXRUaXBFbGVtZW50IiwgIl9pc1dpdGhBY3RpdmVUcmlnZ2VyIiwgIl9nZXRUaXRsZSIsICJfY3JlYXRlVGlwRWxlbWVudCIsICJfZ2V0Q29udGVudEZvclRlbXBsYXRlIiwgIl9nZXRUZW1wbGF0ZUZhY3RvcnkiLCAidGlwSWQiLCAic2V0Q29udGVudCIsICJfaW5pdGlhbGl6ZU9uRGVsZWdhdGVkVGFyZ2V0IiwgIl9nZXREZWxlZ2F0ZUNvbmZpZyIsICJhdHRhY2htZW50IiwgInBoYXNlIiwgInN0YXRlIiwgInRyaWdnZXJzIiwgImV2ZW50SW4iLCAiZXZlbnRPdXQiLCAiX3NldFRpbWVvdXQiLCAidGltZW91dCIsICJkYXRhQXR0cmlidXRlcyIsICJkYXRhQXR0cmlidXRlIiwgIlNFTEVDVE9SX1RJVExFIiwgIlNFTEVDVE9SX0NPTlRFTlQiLCAiUG9wb3ZlciIsICJfZ2V0Q29udGVudCIsICJFVkVOVF9BQ1RJVkFURSIsICJDTEFTU19OQU1FX0RST1BET1dOX0lURU0iLCAiU0VMRUNUT1JfREFUQV9TUFkiLCAiU0VMRUNUT1JfVEFSR0VUX0xJTktTIiwgIlNFTEVDVE9SX05BVl9MSVNUX0dST1VQIiwgIlNFTEVDVE9SX05BVl9MSU5LUyIsICJTRUxFQ1RPUl9OQVZfSVRFTVMiLCAiU0VMRUNUT1JfTElTVF9JVEVNUyIsICJTRUxFQ1RPUl9MSU5LX0lURU1TIiwgIlNFTEVDVE9SX0RST1BET1dOIiwgIlNFTEVDVE9SX0RST1BET1dOX1RPR0dMRSIsICJyb290TWFyZ2luIiwgInNtb290aFNjcm9sbCIsICJ0aHJlc2hvbGQiLCAiU2Nyb2xsU3B5IiwgIl90YXJnZXRMaW5rcyIsICJfb2JzZXJ2YWJsZVNlY3Rpb25zIiwgIl9yb290RWxlbWVudCIsICJfYWN0aXZlVGFyZ2V0IiwgIl9vYnNlcnZlciIsICJfcHJldmlvdXNTY3JvbGxEYXRhIiwgInZpc2libGVFbnRyeVRvcCIsICJwYXJlbnRTY3JvbGxUb3AiLCAicmVmcmVzaCIsICJfaW5pdGlhbGl6ZVRhcmdldHNBbmRPYnNlcnZhYmxlcyIsICJfbWF5YmVFbmFibGVTbW9vdGhTY3JvbGwiLCAiZGlzY29ubmVjdCIsICJfZ2V0TmV3T2JzZXJ2ZXIiLCAic2VjdGlvbiIsICJvYnNlcnZlIiwgIm9ic2VydmFibGVTZWN0aW9uIiwgImhhc2giLCAiaGVpZ2h0IiwgIm9mZnNldFRvcCIsICJzY3JvbGxUbyIsICJ0b3AiLCAiYmVoYXZpb3IiLCAiSW50ZXJzZWN0aW9uT2JzZXJ2ZXIiLCAiX29ic2VydmVyQ2FsbGJhY2siLCAidGFyZ2V0RWxlbWVudCIsICJfcHJvY2VzcyIsICJ1c2VyU2Nyb2xsc0Rvd24iLCAiaXNJbnRlcnNlY3RpbmciLCAiX2NsZWFyQWN0aXZlQ2xhc3MiLCAiZW50cnlJc0xvd2VyVGhhblByZXZpb3VzIiwgInRhcmdldExpbmtzIiwgImFuY2hvciIsICJkZWNvZGVVUkkiLCAiX2FjdGl2YXRlUGFyZW50cyIsICJsaXN0R3JvdXAiLCAiaXRlbSIsICJhY3RpdmVOb2RlcyIsICJub2RlIiwgInNweSIsICJIT01FX0tFWSIsICJFTkRfS0VZIiwgIkNMQVNTX0RST1BET1dOIiwgIlNFTEVDVE9SX0RST1BET1dOX01FTlUiLCAiTk9UX1NFTEVDVE9SX0RST1BET1dOX1RPR0dMRSIsICJTRUxFQ1RPUl9UQUJfUEFORUwiLCAiU0VMRUNUT1JfT1VURVIiLCAiU0VMRUNUT1JfSU5ORVIiLCAiU0VMRUNUT1JfSU5ORVJfRUxFTSIsICJTRUxFQ1RPUl9EQVRBX1RPR0dMRV9BQ1RJVkUiLCAiVGFiIiwgIl9zZXRJbml0aWFsQXR0cmlidXRlcyIsICJfZ2V0Q2hpbGRyZW4iLCAiaW5uZXJFbGVtIiwgIl9lbGVtSXNBY3RpdmUiLCAiYWN0aXZlIiwgIl9nZXRBY3RpdmVFbGVtIiwgIl9kZWFjdGl2YXRlIiwgIl9hY3RpdmF0ZSIsICJyZWxhdGVkRWxlbSIsICJfdG9nZ2xlRHJvcERvd24iLCAibmV4dEFjdGl2ZUVsZW1lbnQiLCAicHJldmVudFNjcm9sbCIsICJfc2V0QXR0cmlidXRlSWZOb3RFeGlzdHMiLCAiX3NldEluaXRpYWxBdHRyaWJ1dGVzT25DaGlsZCIsICJfZ2V0SW5uZXJFbGVtZW50IiwgImlzQWN0aXZlIiwgIm91dGVyRWxlbSIsICJfZ2V0T3V0ZXJFbGVtZW50IiwgIl9zZXRJbml0aWFsQXR0cmlidXRlc09uVGFyZ2V0UGFuZWwiLCAib3BlbiIsICJFVkVOVF9NT1VTRU9WRVIiLCAiRVZFTlRfTU9VU0VPVVQiLCAiQ0xBU1NfTkFNRV9ISURFIiwgImF1dG9oaWRlIiwgIlRvYXN0IiwgIl9oYXNNb3VzZUludGVyYWN0aW9uIiwgIl9oYXNLZXlib2FyZEludGVyYWN0aW9uIiwgIl9jbGVhclRpbWVvdXQiLCAiX21heWJlU2NoZWR1bGVIaWRlIiwgImlzU2hvd24iLCAiX29uSW50ZXJhY3Rpb24iLCAiaXNJbnRlcmFjdGluZyJdCn0K
