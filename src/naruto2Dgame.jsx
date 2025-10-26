// import React, { useState, useEffect, useRef } from 'react';

// const NarutoFightingGame = () => {
//   const canvasRef = useRef(null);
//   const gameLoopRef = useRef(null);
//   const keysPressed = useRef({});
//   const animationFrame = useRef(0);

//   const [gameState, setGameState] = useState('menu');
//   const [round, setRound] = useState(1);
//   const [winner, setWinner] = useState(null);

//   const [player1, setPlayer1] = useState({
//     x: 100, y: 300, width: 60, height: 90, velocityX: 0, velocityY: 0,
//     health: 100, maxHealth: 100, chakra: 100, maxChakra: 100,
//     facing: 1, state: 'idle', stateTimer: 0, animFrame: 0,
//     attacking: false, blocking: false, inAir: false, hitStun: 0,
//     comboCount: 0, shadowClones: [], projectiles: []
//   });

//   const [player2, setPlayer2] = useState({
//     x: 640, y: 300, width: 60, height: 90, velocityX: 0, velocityY: 0,
//     health: 100, maxHealth: 100, chakra: 100, maxChakra: 100,
//     facing: -1, state: 'idle', stateTimer: 0, animFrame: 0,
//     attacking: false, blocking: false, inAir: false, hitStun: 0,
//     comboCount: 0, shadowClones: [], projectiles: [],
//     aiDecision: 0, aiTimer: 0, aiState: 'aggressive'
//   });

//   const GROUND_Y = 300;
//   const GRAVITY = 0.6;
//   const JUMP_FORCE = -13;
//   const MOVE_SPEED = 5;
//   const DASH_SPEED = 10;

//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       keysPressed.current[e.key.toLowerCase()] = true;
//       if (e.key === ' ') e.preventDefault();
//     };
//     const handleKeyUp = (e) => {
//       keysPressed.current[e.key.toLowerCase()] = false;
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//     };
//   }, []);

//   const drawNaruto = (ctx, player) => {
//     const { x, y, width, height, facing, state, animFrame, hitStun, blocking, stateTimer } = player;
    
//     ctx.save();
//     ctx.translate(x + width/2, y + height/2);
//     if (facing < 0) ctx.scale(-1, 1);

//     if (hitStun > 0 && Math.floor(hitStun / 3) % 2) ctx.globalAlpha = 0.5;

//     if (state === 'rasengan') {
//       const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width);
//       gradient.addColorStop(0, 'rgba(100, 150, 255, 0.4)');
//       gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
//       ctx.fillStyle = gradient;
//       ctx.fillRect(-width, -height, width * 2, height * 2);
//     }

//     ctx.fillStyle = '#FF8C00';
//     ctx.fillRect(-12, 20, 10, 25);
//     ctx.fillRect(2, 20, 10, 25);
//     ctx.fillStyle = '#1a1a1a';
//     ctx.fillRect(-14, 43, 12, 5);
//     ctx.fillRect(2, 43, 12, 5);
//     ctx.fillStyle = '#FF8C00';
//     ctx.fillRect(-15, -10, 30, 32);
//     ctx.fillStyle = '#1a1a1a';
//     ctx.fillRect(-13, -8, 26, 8);
//     ctx.fillStyle = '#666';
//     ctx.fillRect(-1, 0, 2, 20);

//     const armOffset = state === 'attack' ? 15 : (state === 'rasengan' ? 10 : 0);
//     ctx.fillStyle = '#FF8C00';
//     ctx.fillRect(-20, -5, 8, 22);
//     ctx.fillRect(12 + armOffset, -5, 8, 22);
//     ctx.fillStyle = '#ffdbac';
//     ctx.beginPath();
//     ctx.arc(-16, 18, 4, 0, Math.PI * 2);
//     ctx.fill();
//     ctx.beginPath();
//     ctx.arc(16 + armOffset, 18, 4, 0, Math.PI * 2);
//     ctx.fill();

//     if (state === 'rasengan' && stateTimer > 10) {
//       const rasenganX = 20 + armOffset;
//       const rasenganY = 15;
      
//       for (let i = 0; i < 3; i++) {
//         ctx.save();
//         ctx.translate(rasenganX, rasenganY);
//         ctx.rotate((animFrame * 0.3 + i * Math.PI * 2 / 3));
//         const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
//         grad.addColorStop(0, 'rgba(150, 200, 255, 0.8)');
//         grad.addColorStop(1, 'rgba(100, 150, 255, 0)');
//         ctx.fillStyle = grad;
//         ctx.fillRect(-20, -3, 25, 6);
//         ctx.restore();
//       }
      
//       ctx.fillStyle = '#ffffff';
//       ctx.beginPath();
//       ctx.arc(rasenganX, rasenganY, 8, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.fillStyle = 'rgba(100, 150, 255, 0.6)';
//       ctx.beginPath();
//       ctx.arc(rasenganX, rasenganY, 12, 0, Math.PI * 2);
//       ctx.fill();
//     }

//     ctx.fillStyle = '#ffdbac';
//     ctx.beginPath();
//     ctx.arc(0, -25, 18, 0, Math.PI * 2);
//     ctx.fill();
//     ctx.fillStyle = '#1a1a2e';
//     ctx.fillRect(-20, -35, 40, 8);
//     ctx.fillStyle = '#c0c0c0';
//     ctx.fillRect(-8, -34, 16, 6);

//     const eyeY = -26;
//     if (blocking) {
//       ctx.strokeStyle = '#000';
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.moveTo(-8, eyeY);
//       ctx.lineTo(-4, eyeY);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.moveTo(4, eyeY);
//       ctx.lineTo(8, eyeY);
//       ctx.stroke();
//     } else {
//       ctx.fillStyle = '#fff';
//       ctx.fillRect(-9, eyeY - 3, 6, 6);
//       ctx.fillRect(3, eyeY - 3, 6, 6);
//       ctx.fillStyle = '#0066cc';
//       ctx.fillRect(-7, eyeY - 2, 3, 4);
//       ctx.fillRect(5, eyeY - 2, 3, 4);
//       ctx.fillStyle = '#000';
//       ctx.fillRect(-6, eyeY - 1, 1, 2);
//       ctx.fillRect(6, eyeY - 1, 1, 2);
//     }

//     ctx.strokeStyle = '#000';
//     ctx.lineWidth = 1.5;
//     ctx.beginPath();
//     if (state === 'hurt') {
//       ctx.arc(0, -18, 5, 0, Math.PI);
//     } else {
//       ctx.arc(0, -18, 5, Math.PI, Math.PI * 2);
//     }
//     ctx.stroke();

//     ctx.lineWidth = 1;
//     for (let i = 0; i < 3; i++) {
//       const offset = i * 3;
//       ctx.beginPath();
//       ctx.moveTo(-12, -26 + offset);
//       ctx.lineTo(-18, -26 + offset);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.moveTo(12, -26 + offset);
//       ctx.lineTo(18, -26 + offset);
//       ctx.stroke();
//     }

//     ctx.fillStyle = '#FFD700';
//     const hairPoints = [[-15, -35], [-8, -42], [0, -43], [8, -42], [15, -35]];
//     ctx.beginPath();
//     ctx.moveTo(hairPoints[0][0], hairPoints[0][1]);
//     hairPoints.forEach(point => ctx.lineTo(point[0], point[1]));
//     ctx.lineTo(15, -25);
//     ctx.lineTo(-15, -25);
//     ctx.closePath();
//     ctx.fill();

//     if (blocking) {
//       ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
//       ctx.lineWidth = 3;
//       ctx.beginPath();
//       ctx.arc(0, 0, 40, 0, Math.PI * 2);
//       ctx.stroke();
//     }

//     ctx.restore();
//   };

//   const updateAI = (ai, opponent) => {
//     if (ai.hitStun > 0) return ai;
//     const newAI = { ...ai };
//     const distance = Math.abs(ai.x - opponent.x);
//     newAI.aiTimer--;

//     if (newAI.aiTimer <= 0) {
//       newAI.aiTimer = 20 + Math.random() * 40;
//       newAI.aiDecision = Math.random();
//     }

//     if (distance > 200) {
//       if (newAI.aiDecision > 0.7 && newAI.chakra > 10 && newAI.projectiles.length < 2) {
//         newAI.projectiles.push({
//           x: newAI.x + (newAI.facing > 0 ? 30 : -30),
//           y: newAI.y + 20, velocityX: newAI.facing * 8, velocityY: -2, rotation: 0
//         });
//         newAI.chakra -= 10;
//       } else {
//         newAI.velocityX = opponent.x > ai.x ? MOVE_SPEED : -MOVE_SPEED;
//         newAI.state = 'walk';
//       }
//     } else if (distance > 60) {
//       if (newAI.aiDecision > 0.7 && !newAI.attacking && newAI.chakra >= 30) {
//         newAI.state = 'rasengan';
//         newAI.attacking = true;
//         newAI.stateTimer = 40;
//       } else if (newAI.aiDecision > 0.5 && !newAI.attacking) {
//         newAI.state = 'attack';
//         newAI.attacking = true;
//         newAI.stateTimer = 15;
//       }
//     }

//     newAI.facing = opponent.x > ai.x ? 1 : -1;
//     return newAI;
//   };

//   const updatePlayer = (player, isP1) => {
//     const newPlayer = { ...player };
//     newPlayer.animFrame++;

//     if (isP1 && gameState === 'playing' && newPlayer.hitStun <= 0) {
//       const keys = keysPressed.current;
//       if (keys['a'] && !newPlayer.attacking) {
//         newPlayer.velocityX = -MOVE_SPEED;
//         newPlayer.state = 'walk';
//       } else if (keys['d'] && !newPlayer.attacking) {
//         newPlayer.velocityX = MOVE_SPEED;
//         newPlayer.state = 'walk';
//       } else if (!newPlayer.attacking) {
//         newPlayer.velocityX = 0;
//         if (!newPlayer.inAir) newPlayer.state = 'idle';
//       }

//       if (keys['w'] && !newPlayer.inAir && !newPlayer.attacking) {
//         newPlayer.velocityY = JUMP_FORCE;
//         newPlayer.inAir = true;
//         newPlayer.state = 'jump';
//       }

//       if (keys['j'] && !newPlayer.attacking && newPlayer.stateTimer <= 0) {
//         newPlayer.state = 'attack';
//         newPlayer.attacking = true;
//         newPlayer.stateTimer = 15;
//       }

//       if (keys['k'] && newPlayer.chakra >= 30 && !newPlayer.attacking && newPlayer.stateTimer <= 0) {
//         newPlayer.state = 'rasengan';
//         newPlayer.attacking = true;
//         newPlayer.stateTimer = 40;
//         newPlayer.chakra -= 30;
//       }

//       if (keys[' '] && newPlayer.chakra >= 10 && newPlayer.projectiles.length < 3) {
//         newPlayer.projectiles.push({
//           x: newPlayer.x + (newPlayer.facing > 0 ? 30 : -30), y: newPlayer.y + 20,
//           velocityX: newPlayer.facing * 10, velocityY: -3, rotation: 0
//         });
//         newPlayer.chakra -= 10;
//         keys[' '] = false;
//       }

//       newPlayer.blocking = keys['s'] && !newPlayer.attacking;
//       if (newPlayer.blocking) newPlayer.state = 'block';

//       const opponent = isP1 ? player2 : player1;
//       newPlayer.facing = opponent.x > newPlayer.x ? 1 : -1;
//     }

//     if (newPlayer.inAir) newPlayer.velocityY += GRAVITY;
//     newPlayer.x += newPlayer.velocityX;
//     newPlayer.y += newPlayer.velocityY;

//     if (newPlayer.y >= GROUND_Y) {
//       newPlayer.y = GROUND_Y;
//       newPlayer.velocityY = 0;
//       newPlayer.inAir = false;
//       if (newPlayer.state === 'jump' && !newPlayer.attacking) newPlayer.state = 'idle';
//     }

//     newPlayer.x = Math.max(10, Math.min(790 - newPlayer.width, newPlayer.x));

//     if (newPlayer.stateTimer > 0) {
//       newPlayer.stateTimer--;
//       if (newPlayer.stateTimer === 0) {
//         newPlayer.attacking = false;
//         if (!newPlayer.inAir) newPlayer.state = 'idle';
//       }
//     }

//     if (newPlayer.hitStun > 0) {
//       newPlayer.hitStun--;
//       if (newPlayer.hitStun === 0) newPlayer.state = 'idle';
//     }

//     if (newPlayer.chakra < 100) {
//       newPlayer.chakra = Math.min(100, newPlayer.chakra + 0.2);
//     }

//     newPlayer.projectiles = newPlayer.projectiles.filter(proj => {
//       proj.x += proj.velocityX;
//       proj.y += proj.velocityY;
//       proj.velocityY += 0.2;
//       proj.rotation += 0.3;
//       return proj.x > -50 && proj.x < 850 && proj.y < 450;
//     });

//     return newPlayer;
//   };

//   useEffect(() => {
//     if (gameState !== 'playing') return;

//     gameLoopRef.current = setInterval(() => {
//       setPlayer1(p1 => updatePlayer(p1, true));
//       setPlayer2(p2 => updateAI(updatePlayer(p2, false), player1));

//       setPlayer1(p1 => {
//         const newP1 = { ...p1 };
//         const distance = Math.abs(p1.x - player2.x);

//         if (player2.attacking && player2.stateTimer > 5 && player2.stateTimer < 35) {
//           const range = player2.state === 'rasengan' ? 70 : 50;
//           if (distance < range && !p1.blocking) {
//             const damage = player2.state === 'rasengan' ? 20 : 8;
//             newP1.health = Math.max(0, newP1.health - damage);
//             newP1.hitStun = 15;
//             newP1.state = 'hurt';
//           }
//         }
//         return newP1;
//       });

//       setPlayer2(p2 => {
//         const newP2 = { ...p2 };
//         const distance = Math.abs(p2.x - player1.x);

//         if (player1.attacking && player1.stateTimer > 5 && player1.stateTimer < 35) {
//           const range = player1.state === 'rasengan' ? 70 : 50;
//           if (distance < range && !p2.blocking) {
//             const damage = player1.state === 'rasengan' ? 20 : 8;
//             newP2.health = Math.max(0, newP2.health - damage);
//             newP2.hitStun = 15;
//             newP2.state = 'hurt';
//           }
//         }
//         return newP2;
//       });

//       if (player1.health <= 0) {
//         setGameState('victory');
//         setWinner('Player 2 AI');
//       } else if (player2.health <= 0) {
//         setGameState('victory');
//         setWinner('Player 1');
//       }
//     }, 1000 / 60);

//     return () => clearInterval(gameLoopRef.current);
//   }, [gameState, player1, player2]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
    
//     const draw = () => {
//       const gradient = ctx.createLinearGradient(0, 0, 0, 450);
//       gradient.addColorStop(0, '#87CEEB');
//       gradient.addColorStop(1, '#FFE4B5');
//       ctx.fillStyle = gradient;
//       ctx.fillRect(0, 0, 800, 450);

//       ctx.fillStyle = '#8B7355';
//       ctx.fillRect(0, 380, 800, 70);

//       player1.projectiles.forEach(proj => {
//         ctx.save();
//         ctx.translate(proj.x, proj.y);
//         ctx.rotate(proj.rotation);
//         ctx.fillStyle = '#666';
//         ctx.fillRect(-3, -10, 6, 20);
//         ctx.restore();
//       });

//       player2.projectiles.forEach(proj => {
//         ctx.save();
//         ctx.translate(proj.x, proj.y);
//         ctx.rotate(proj.rotation);
//         ctx.fillStyle = '#666';
//         ctx.fillRect(-3, -10, 6, 20);
//         ctx.restore();
//       });

//       drawNaruto(ctx, player1);
//       drawNaruto(ctx, player2);

//       ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
//       ctx.fillRect(15, 15, 210, 50);
//       ctx.fillRect(575, 15, 210, 50);
      
//       ctx.fillStyle = '#333';
//       ctx.fillRect(20, 20, 200, 15);
//       ctx.fillStyle = '#ff4444';
//       ctx.fillRect(20, 20, (player1.health / 100) * 200, 15);
      
//       ctx.fillStyle = '#333';
//       ctx.fillRect(20, 40, 200, 10);
//       ctx.fillStyle = '#44aaff';
//       ctx.fillRect(20, 40, (player1.chakra / 100) * 200, 10);

//       ctx.fillStyle = '#333';
//       ctx.fillRect(580, 20, 200, 15);
//       ctx.fillStyle = '#ff4444';
//       ctx.fillRect(580, 20, (player2.health / 100) * 200, 15);
      
//       ctx.fillStyle = '#333';
//       ctx.fillRect(580, 40, 200, 10);
//       ctx.fillStyle = '#44aaff';
//       ctx.fillRect(580, 40, (player2.chakra / 100) * 200, 10);

//       ctx.fillStyle = '#fff';
//       ctx.font = 'bold 24px Arial';
//       ctx.textAlign = 'center';
//       ctx.fillText(`ROUND ${round}`, 400, 35);

//       if (gameState === 'victory') {
//         ctx.fillStyle = 'rgba(0,0,0,0.7)';
//         ctx.fillRect(0, 0, 800, 450);
//         ctx.fillStyle = '#FFD700';
//         ctx.font = 'bold 48px Arial';
//         ctx.fillText(`${winner} WINS!`, 400, 225);
//       }

//       animationFrame.current++;
//       requestAnimationFrame(draw);
//     };

//     draw();
//   }, [player1, player2, gameState, round, winner]);

//   const startGame = () => {
//     setGameState('playing');
//     setPlayer1(p => ({ ...p, health: 100, chakra: 100, x: 100, y: 300, projectiles: [] }));
//     setPlayer2(p => ({ ...p, health: 100, chakra: 100, x: 640, y: 300, projectiles: [] }));
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
//       <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
//         <h1 className="text-4xl font-bold text-center mb-4 text-orange-400">
//           NARUTO FIGHTING GAME
//         </h1>

//         <canvas 
//           ref={canvasRef} 
//           width={800} 
//           height={450}
//           className="border-4 border-orange-500 rounded bg-gray-900"
//         />

//         <div className="mt-4 grid grid-cols-2 gap-4 text-white text-sm">
//           <div className="bg-blue-900 p-3 rounded">
//             <p className="font-bold text-cyan-300 mb-2">PLAYER 1 Controls</p>
//             <p>A/D - Move | W - Jump | S - Block</p>
//             <p>J - Punch | K - Rasengan (30 chakra)</p>
//             <p>Space - Kunai (10 chakra)</p>
//           </div>
//           <div className="bg-red-900 p-3 rounded">
//             <p className="font-bold text-red-300 mb-2">PLAYER 2 - AI</p>
//             <p>Strategic AI opponent</p>
//             <p>Uses all jutsu abilities</p>
//             <p>Adapts to combat situation</p>
//           </div>
//         </div>

//         {gameState === 'menu' && (
//           <button
//             onClick={startGame}
//             className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
//           >
//             START FIGHT
//           </button>
//         )}

//         {gameState === 'victory' && (
//           <button
//             onClick={() => { setRound(r => r + 1); startGame(); }}
//             className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
//           >
//             NEXT ROUND
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NarutoFightingGame;