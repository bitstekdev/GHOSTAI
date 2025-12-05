import React, { useEffect, useRef, useState } from 'react';

/**
 * BookFlip
 * props:
 *  - pagesData: [{ image, content, type }, ...]
 *  - visibleIndex: number
 *  - onChange(index) optional callback when page changes
 */
export default function BookFlip({ pagesData = [], visibleIndex = 0, onChange }) {
  const [currentIndex, setCurrentIndex] = useState(visibleIndex);
  const containerRef = useRef(null);
  const pagesRef = useRef([]);

  useEffect(() => {
    if (document.getElementById('bookflip-styles')) return;
    const style = document.createElement('style');
    style.id = 'bookflip-styles';
    style.innerHTML = `
      .book-viewport { perspective: 2500px; width: 100%; display:flex; justify-content:center; }
      .book { position: relative; transform-style: preserve-3d; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-radius: 8px; margin: 0 auto; }
      .book.landscape { width: 980px; height: 480px; }
      .book.portrait { width: 700px; height: 540px; }
      .book.square { width: 700px; height: 350px; }

      .book__page { width: 50%; height: 100%; position: relative; display:inline-block; vertical-align:top; box-sizing: border-box; }
      .book__page--left { float:left; box-shadow: inset -1px 0 2px rgba(0,0,0,0.05); background: #fafafa; cursor: pointer; }
      .book__page--right { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; transform-origin: left center; transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1); transform-style: preserve-3d; cursor: pointer; box-sizing: border-box; }
      .book__page--right .book__page-front, .book__page--right .book__page-back, .book__page--left .book__page-front, .book__page--left .book__page-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; overflow: hidden; display:flex; align-items:center; justify-content:center; }
      .book__page--right .book__page-back { transform: rotateY(180deg); }
      .book__page--right.flipped { transform: rotateY(-180deg); }

      .page-content { padding: 20px; box-sizing: border-box; width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
      .page-inner { width: 95%; height: 95%; display:flex; align-items:center; justify-content:center; }
      .page-image { max-width:100%; max-height:100%; object-fit:contain; display:block; }
      .book-title { font-size: 28px; font-weight:700; text-align:center; padding:0 12px; }
      .story-text { font-size: 18px; line-height:1.6; padding: 20px; max-height: 100%; overflow:auto; }
      .page-face { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; box-sizing:border-box; padding: 10px; }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    setCurrentIndex(visibleIndex);
    pagesRef.current.forEach((el, idx) => {
      if (!el) return;
      if (idx < visibleIndex) el.classList.add('flipped');
      else el.classList.remove('flipped');
    });
  }, [visibleIndex, pagesData]);

  const flipTo = (index) => {
    if (index < 0) index = 0;
    if (index > pagesData.length - 1) index = pagesData.length - 1;
    pagesRef.current.forEach((el, idx) => {
      if (!el) return;
      if (idx < index) el.classList.add('flipped');
      else el.classList.remove('flipped');
    });
    setCurrentIndex(index);
    if (typeof onChange === 'function') {
      setTimeout(() => onChange(index), 920);
    }
  };

  const onRightPageClick = (pageIndex) => {
    flipTo(pageIndex + 1);
  };

  return (
    <div className="book-viewport" ref={containerRef}>
      <div className={`book landscape`} role="region" aria-label="Book preview">
        {/* Show left page only if not first page */}
        {currentIndex > 0 && (
          <div
            className="book__page book__page--left"
            onClick={() => flipTo(currentIndex - 1)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') flipTo(currentIndex - 1); }}
          >
            <div className="book__page-front page-face page-content">
              <div className="page-inner">
                {pagesData[currentIndex - 1] && pagesData[currentIndex - 1].image ? (
                  <img className="page-image" src={pagesData[currentIndex - 1].image} alt="left page" />
                ) : (
                  <div className="story-text">{pagesData[currentIndex - 1]?.content || ''}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {pagesData.map((p, idx) => {
          // Only render the right page for the first page
          if (currentIndex === 0 && idx !== 0) return null;
          // Only render the right page for the last page if currentIndex is not the last
          if (currentIndex === pagesData.length - 1 && idx !== currentIndex) return null;
          const key = `right-${idx}`;
          // Hide right page for last page
          if (currentIndex === pagesData.length - 1 && idx === currentIndex) return null;
          return (
            <div
              key={key}
              ref={(el) => (pagesRef.current[idx] = el)}
              data-page-index={idx}
              className={`book__page--right${idx < currentIndex ? ' flipped' : ''}`}
              style={{ zIndex: pagesData.length - idx }}
              onClick={() => onRightPageClick(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRightPageClick(idx); }}
            >
              <div className="book__page-front page-face">
                <div className="page-content page-inner">
                  {p.image ? <img src={p.image} alt={`page ${idx + 1}`} className="page-image" /> : <div className="book-title">{p.content}</div>}
                </div>
              </div>

              <div className="book__page-back page-face">
                <div className="page-content page-inner">
                  {pagesData[idx + 1] && pagesData[idx + 1].image ? (
                    <img src={pagesData[idx + 1].image} alt={`page ${idx + 2}`} className="page-image" />
                  ) : pagesData[idx + 1] ? (
                    <div className="story-text">{pagesData[idx + 1]?.content || ''}</div>
                  ) : (
                    <div style={{ opacity: 0.06 }}> </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
