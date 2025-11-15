import React, { useState, useRef, useEffect } from 'react';
import { seeds, plantStages, Pot, WateringCan, IntroPlant } from './SVGAssets';

const InfoGardener = () => {
  const [page, setPage] = useState('intro');
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [potHasSeed, setPotHasSeed] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [growthStage, setGrowthStage] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const potRef = useRef(null);
  const wateringCanRef = useRef(null);

  const plants = [
    { id: 'monstera', name: 'Monstera', color: '#ff69b4' },
    { id: 'snapdragon', name: 'Snapdragon', color: '#ffd700' },
    { id: 'tulip', name: 'Tulip', color: '#ff6347' },
    { id: 'lily', name: 'Lily', color: '#ffffff' }
  ];

  const handleMouseDown = (e, item, type) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedItem({ item, type, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
  };

  const startGrowth = () => {
    const stages = [1, 2, 3, 4];
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setGrowthStage(stage);
        if (stage === 4) {
          setTimeout(() => setShowFact(true), 3000);
        }
      }, (index + 1) * 1500);
    });
  };

  const reset = () => {
    setSelectedSeed(null);
    setPotHasSeed(false);
    setIsWatering(false);
    setGrowthStage(0);
    setShowFact(false);
  };

  useEffect(() => {
    const handleMouseMoveEvent = (e) => {
      if (draggedItem) {
        setDragPosition({ x: e.clientX - draggedItem.offsetX, y: e.clientY - draggedItem.offsetY });
      }
    };

    const handleMouseUpEvent = (e) => {
      if (!draggedItem) return;

      if (draggedItem.type === 'seed' && potRef.current && !potHasSeed) {
        const potRect = potRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (mouseX >= potRect.left && mouseX <= potRect.right &&
            mouseY >= potRect.top && mouseY <= potRect.bottom) {
          setSelectedSeed(draggedItem.item);
          setPotHasSeed(true);
        }
      }

      if (draggedItem.type === 'wateringCan' && potRef.current && potHasSeed && !isWatering) {
        const potRect = potRef.current.getBoundingClientRect();
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        if (mouseX >= potRect.left - 100 && mouseX <= potRect.right + 100 &&
            mouseY >= potRect.top - 100 && mouseY <= potRect.bottom + 100) {
          setIsWatering(true);
          setTimeout(() => {
            setIsWatering(false);
            startGrowth();
          }, 2000);
        }
      }

      setDraggedItem(null);
    };

    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMoveEvent);
      document.addEventListener('mouseup', handleMouseUpEvent);
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveEvent);
        document.removeEventListener('mouseup', handleMouseUpEvent);
      };
    }
  }, [draggedItem, potHasSeed, isWatering]);

  if (page === 'intro') {
    return (
      <div className="w-full h-screen bg-blue-500 flex flex-col items-center justify-center">
        <h1 className="text-8xl mb-12 text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          InfoGardener
        </h1>
        <div className="bg-white rounded-full w-64 h-64 flex items-center justify-center mb-12 shadow-2xl">
          <img src={IntroPlant} alt="Plant" width="150" height="150" />
        </div>
        <button
          onClick={() => setPage('garden')}
          className="bg-white text-blue-600 px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:bg-blue-50 transition-all hover:scale-105"
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8C8 50%, #90EE90 100%)'
    }}>
      {growthStage === 4 && (
        <button
          onClick={reset}
          className="absolute top-4 left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 z-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      )}

      {growthStage < 4 && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-6 shadow-xl flex gap-6 z-10">
          {plants.map((plant) => (
            <div
              key={plant.id}
              onMouseDown={(e) => !potHasSeed && handleMouseDown(e, plant, 'seed')}
              className={`cursor-pointer transition-transform hover:scale-110 ${potHasSeed ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ 
                pointerEvents: potHasSeed ? 'none' : 'auto',
                opacity: draggedItem?.item?.id === plant.id ? 0.5 : 1
              }}
            >
              <img 
                src={seeds[plant.id]} 
                alt={`${plant.name} seed`} 
                width="60" 
                height="60"
                className="select-none"
                draggable="false"
              />
            </div>
          ))}
        </div>
      )}

      {draggedItem?.type === 'seed' && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img 
            src={seeds[draggedItem.item.id]} 
            alt="dragging seed" 
            width="60" 
            height="60"
            className="select-none drop-shadow-lg"
            draggable="false"
          />
        </div>
      )}

      {growthStage === 4 && selectedSeed && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-8 py-4 shadow-xl z-10">
          <h2 className="text-3xl font-bold" style={{ color: selectedSeed.color }}>
            {selectedSeed.name}
          </h2>
        </div>
      )}

      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div ref={potRef} className="relative">
          <img 
            src={Pot} 
            alt="Plant pot" 
            className="w-[200px] h-[150px] select-none" 
            draggable="false"
          />
        </div>
      </div>

      {potHasSeed && selectedSeed && (
        <div className="absolute bottom-64 left-1/2 transform -translate-x-1/2 pointer-events-none flex flex-col items-center">
          {growthStage >= 1 && growthStage < 2 && (
            <img 
              src={plantStages[selectedSeed.id][0]} 
              alt={`${selectedSeed.name} stage 1`}
              className="transition-all duration-500"
              style={{ maxHeight: '40px', width: 'auto' }}
            />
          )}
          {growthStage >= 2 && growthStage < 3 && (
            <img 
              src={plantStages[selectedSeed.id][1]} 
              alt={`${selectedSeed.name} stage 2`}
              className="transition-all duration-500"
              style={{ maxHeight: '80px', width: 'auto' }}
            />
          )}
          {growthStage >= 3 && growthStage < 4 && (
            <img 
              src={plantStages[selectedSeed.id][2]} 
              alt={`${selectedSeed.name} stage 3`}
              className="transition-all duration-500"
              style={{ maxHeight: '120px', width: 'auto' }}
            />
          )}
          {growthStage >= 4 && (
            <img 
              src={plantStages[selectedSeed.id][3]} 
              alt={`${selectedSeed.name} stage 4`}
              className="transition-all duration-500"
              style={{ maxHeight: '180px', width: 'auto' }}
            />
          )}
        </div>
      )}

      <div
        ref={wateringCanRef}
        onMouseDown={(e) => !isWatering && handleMouseDown(e, null, 'wateringCan')}
        className="absolute bottom-32 right-32 cursor-pointer select-none"
        style={{
          transform: draggedItem?.type === 'wateringCan' 
            ? `translate(${dragPosition.x}px, ${dragPosition.y}px)` 
            : 'none',
          pointerEvents: isWatering ? 'none' : 'auto',
          opacity: draggedItem?.type === 'wateringCan' ? 0.7 : (isWatering ? 0.5 : 1)
        }}
      >
        <div style={{
          animation: isWatering ? 'tilt 0.6s ease-in-out infinite' : 'none',
          transformOrigin: 'center bottom',
          width: '120px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={WateringCan} 
            alt="Watering can" 
            className="w-[120px] h-[100px]" 
            draggable="false"
          />
        </div>
      </div>

      {isWatering && (
        <div 
          ref={wateringCanRef}
          className="absolute pointer-events-none z-30"
          style={{
            bottom: '225px',
            right: '56px',
            animation: 'hover 0.6s ease-in-out infinite'
          }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(i - 4) * 15}px`,
                animation: `fall 0.8s ease-in infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              <svg width="10" height="20" viewBox="0 0 10 20">
                <ellipse cx="5" cy="15" rx="4" ry="6" fill="#4FC3F7"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {showFact && selectedSeed && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl p-8 max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowFact(false)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-3xl font-bold leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-4" style={{ color: selectedSeed.color }}>
              Fun Fact!
            </h3>
            <p className="text-lg text-gray-700">
              {selectedSeed.name} {selectedSeed.name} {selectedSeed.name} {selectedSeed.name} {selectedSeed.name}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100px); opacity: 0; }
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes hover {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default InfoGardener;