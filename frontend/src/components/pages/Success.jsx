import React, { useEffect } from 'react';
import { 
  CheckCircle2, ArrowRight, Share2
} from 'lucide-react';

export const Success = ({ onNavigate }) => {
  useEffect(() => {
    const colors = ['#A855F7', '#EC4899', '#3B82F6'];
    const end = Date.now() + 1000;

    const frame = () => {
      if (Date.now() > end) return;

      const x = Math.random();
      const y = Math.random() * 0.6;
      
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 3 + 3;
        
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.left = `${x * 100}%`;
        div.style.top = `${y * 100}%`;
        div.style.width = '8px';
        div.style.height = '8px';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.borderRadius = '50%';
        div.style.pointerEvents = 'none';
        div.style.zIndex = '9999';
        document.body.appendChild(div);

        let vx = Math.cos(angle) * velocity;
        let vy = Math.sin(angle) * velocity;
        let posX = x * window.innerWidth;
        let posY = y * window.innerHeight;
        let opacity = 1;

        const animate = () => {
          vy += 0.2;
          posX += vx;
          posY += vy;
          opacity -= 0.02;

          div.style.left = `${posX}px`;
          div.style.top = `${posY}px`;
          div.style.opacity = opacity;

          if (opacity > 0) {
            requestAnimationFrame(animate);
          } else {
            div.remove();
          }
        };
        animate();
      }

      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-green-500/20 to-purple-500/20 p-12 text-center border-b border-gray-800">
          <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <CheckCircle2 className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-gray-400 text-lg">Order #GV-{Math.floor(Math.random() * 90000) + 10000}</p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-white text-xl font-medium mb-2">Thank you for your purchase!</p>
              <p className="text-gray-400">Your AI-generated storybook is being prepared and will be shipped to your address shortly.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => onNavigate('home')} 
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-600/20"
              >
                Back to Home
                <ArrowRight size={18} />
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all border border-gray-700">
                <Share2 size={18} />
                Share with Friends
              </button>
            </div>

            <div className="h-px bg-gray-800 my-4" />
            
            <div className="text-center">
              <p className="text-gray-500 text-xs italic">A confirmation email with tracking details has been sent to your inbox.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
