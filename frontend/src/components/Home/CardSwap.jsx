import React, { useEffect, useRef, useState } from 'react';


export const Card = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`w-full h-full rounded-md overflow-hidden bg-gray-700 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

const CardSwap = ({
  children,
  cardDistance = 60,
  verticalDistance = 40,
  delay = 4000,
  pauseOnHover = true,
}) => {
  const items = React.Children.toArray(children);
  const len = items.length;
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // start interval on mount (or when delay changes)
  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  const start = () => {
    stop();
    if (delay > 0 && len > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((prev) => (prev + 1) % len);
      }, delay);
    }
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) stop();
  };
  const handleMouseLeave = () => {
    if (pauseOnHover) start();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {items.map((child, i) => {
        // compute position relative to active index
        const pos = (i - index + len) % len;

        // default style (hidden)
        let style = {
          transition: 'transform 600ms cubic-bezier(.2,.9,.2,1), opacity 600ms',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.85) translateY(100px)',
          opacity: 0,
          zIndex: 10,
          width: '80%',
          height: '90%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          cursor: 'default',
          pointerEvents: 'auto',
        };

        if (pos === 0) {
          // active center card
          style = {
            ...style,
            transform: 'translate(-50%, -50%) scale(1) translateY(0)',
            opacity: 1,
            zIndex: 30,
            cursor: 'default',
          };
        } else if (pos === 1) {
          // next card (right)
          style = {
            ...style,
            transform: `translate(calc(-50% + ${cardDistance}px), calc(-50% + ${verticalDistance}px)) scale(0.94)`,
            opacity: 0.95,
            zIndex: 20,
            width: '78%',
            height: '86%',
            cursor: 'pointer',
          };
        } else if (pos === len - 1) {
          // previous card (left)
          style = {
            ...style,
            transform: `translate(calc(-50% - ${cardDistance}px), calc(-50% + ${verticalDistance}px)) scale(0.94)`,
            opacity: 0.95,
            zIndex: 20,
            width: '78%',
            height: '86%',
            cursor: 'pointer',
          };
        }

        return (
          <div
            key={i}
            style={style}
            aria-hidden={pos !== 0}
            className="rounded-md overflow-hidden"
            onClick={() => {
              // Clicking a side card brings it to center
              if (pos !== 0) {
                // set index to this card
                setIndex(i);
              }
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

export default CardSwap;
