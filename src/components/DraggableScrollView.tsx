import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DraggableScrollViewProps extends ScrollViewProps {
  showArrows?: boolean;
  arrowSize?: number;
  containerStyle?: StyleProp<ViewStyle>;
  scrollAmount?: number;
}

export const DraggableScrollView = React.forwardRef<ScrollView, DraggableScrollViewProps>(
  (
    {
      children,
      showArrows = true,
      arrowSize = 28,
      containerStyle,
      scrollAmount = 260,
      contentContainerStyle,
      style,
      ...restProps
    },
    ref
  ) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollRef = (ref as React.RefObject<ScrollView>) || internalRef;

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const hasMovedRef = useRef(false);

    const getDomNode = useCallback((): HTMLElement | null => {
      if (Platform.OS !== 'web' || !scrollRef.current) return null;
      const cur = scrollRef.current as any;
      if (typeof cur.getScrollableNode === 'function') {
        return cur.getScrollableNode();
      }
      if (cur instanceof HTMLElement) {
        return cur;
      }
      return null;
    }, [scrollRef]);

    const updateScrollBounds = useCallback(() => {
      const node = getDomNode();
      if (!node) return;
      const { scrollLeft, scrollWidth, clientWidth } = node;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }, [getDomNode]);

    const scrollByAmount = (amount: number) => {
      const node = getDomNode();
      if (node && typeof node.scrollBy === 'function') {
        node.scrollBy({ left: amount, behavior: 'smooth' });
        setTimeout(updateScrollBounds, 300);
      } else if (scrollRef.current) {
        // Fallback for native or when scrollBy is unavailable
        try {
          (scrollRef.current as any).scrollTo?.({
            x: (node?.scrollLeft || 0) + amount,
            animated: true,
          });
        } catch {}
      }
    };

    useEffect(() => {
      if (Platform.OS !== 'web') return;

      const node = getDomNode();
      if (!node) return;

      // Initial check & update on resize
      updateScrollBounds();
      const resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => updateScrollBounds())
          : null;
      if (resizeObserver) {
        resizeObserver.observe(node);
      }

      node.style.cursor = 'grab';

      // Drag to scroll logic
      const handleMouseDown = (e: MouseEvent) => {
        // Only trigger on left mouse button and not on interactive buttons like arrow buttons
        if (e.button !== 0) return;
        isDownRef.current = true;
        hasMovedRef.current = false;
        startXRef.current = e.pageX - node.offsetLeft;
        scrollLeftRef.current = node.scrollLeft;
        node.style.cursor = 'grabbing';
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDownRef.current) return;
        const x = e.pageX - node.offsetLeft;
        const walk = x - startXRef.current;
        if (Math.abs(walk) > 4) {
          hasMovedRef.current = true;
          document.body.style.userSelect = 'none';
        }
        node.scrollLeft = scrollLeftRef.current - walk;
        updateScrollBounds();
      };

      const handleMouseUp = () => {
        if (!isDownRef.current) return;
        isDownRef.current = false;
        node.style.cursor = 'grab';
        document.body.style.userSelect = '';
        // Keep hasMovedRef true briefly so clickCapture intercepts accidental selection
        setTimeout(() => {
          hasMovedRef.current = false;
        }, 120);
      };

      const handleClickCapture = (e: MouseEvent) => {
        if (hasMovedRef.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      };

      // Mouse Wheel horizontal translation
      const handleWheel = (e: WheelEvent) => {
        if (node.scrollWidth <= node.clientWidth) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const canLeft = node.scrollLeft > 0;
          const canRight = node.scrollLeft < node.scrollWidth - node.clientWidth - 1;
          if ((e.deltaY < 0 && canLeft) || (e.deltaY > 0 && canRight)) {
            e.preventDefault();
            node.scrollLeft += e.deltaY;
            updateScrollBounds();
          }
        }
      };

      const handleScroll = () => {
        updateScrollBounds();
      };

      const handleDragStart = (e: DragEvent) => {
        // Prevent native HTML5 image dragging interfering with mouse scrolling
        e.preventDefault();
      };

      node.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      node.addEventListener('click', handleClickCapture, true);
      node.addEventListener('wheel', handleWheel, { passive: false });
      node.addEventListener('scroll', handleScroll, { passive: true });
      node.addEventListener('dragstart', handleDragStart);

      return () => {
        if (resizeObserver) resizeObserver.disconnect();
        node.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        node.removeEventListener('click', handleClickCapture, true);
        node.removeEventListener('wheel', handleWheel);
        node.removeEventListener('scroll', handleScroll);
        node.removeEventListener('dragstart', handleDragStart);
        document.body.style.userSelect = '';
      };
    }, [getDomNode, updateScrollBounds]);

    const isWeb = Platform.OS === 'web';

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={style}
          contentContainerStyle={contentContainerStyle}
          scrollEventThrottle={16}
          onScroll={updateScrollBounds}
          {...restProps}
        >
          {children}
        </ScrollView>

        {/* Desktop Left Scroll Button */}
        {isWeb && showArrows && canScrollLeft && (
          <TouchableOpacity
            style={[styles.arrowButton, styles.leftArrow, { width: arrowSize, height: arrowSize }]}
            onPress={() => scrollByAmount(-scrollAmount)}
            activeOpacity={0.85}
            // @ts-ignore
            tabIndex={-1}
          >
            <Ionicons name="chevron-back" size={16} color="#8A6D3B" />
          </TouchableOpacity>
        )}

        {/* Desktop Right Scroll Button */}
        {isWeb && showArrows && canScrollRight && (
          <TouchableOpacity
            style={[styles.arrowButton, styles.rightArrow, { width: arrowSize, height: arrowSize }]}
            onPress={() => scrollByAmount(scrollAmount)}
            activeOpacity={0.85}
            // @ts-ignore
            tabIndex={-1}
          >
            <Ionicons name="chevron-forward" size={16} color="#8A6D3B" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

DraggableScrollView.displayName = 'DraggableScrollView';

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C5A059',
    shadowColor: '#1A1817',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 20,
  },
  leftArrow: {
    left: 2,
  },
  rightArrow: {
    right: 2,
  },
});
