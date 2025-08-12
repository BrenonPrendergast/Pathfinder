import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface FloatingNodesProps {
  nodeCount?: number;
  connectionOpacity?: number;
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function FloatingNodes({ 
  nodeCount = 25, 
  connectionOpacity = 0.1,
  className 
}: FloatingNodesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes
    const initNodes = () => {
      nodesRef.current = [];
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 2,
          color: Math.random() > 0.7 ? 'hsl(var(--primary))' : 
                 Math.random() > 0.5 ? 'hsl(var(--accent))' : 'hsl(var(--secondary))'
        });
      }
    };
    initNodes();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update nodes
      nodesRef.current.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Keep within bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });

      // Draw connections
      ctx.strokeStyle = `hsla(var(--primary), ${connectionOpacity})`;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < nodesRef.current.length; i++) {
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeA = nodesRef.current[i];
          const nodeB = nodesRef.current[j];
          
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only draw connections between nearby nodes
          if (distance < 120) {
            const opacity = connectionOpacity * (1 - distance / 120);
            ctx.strokeStyle = `hsla(var(--primary), ${opacity})`;
            
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodesRef.current.forEach(node => {
        // Node glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.size * 3
        );
        gradient.addColorStop(0, node.color.replace(')', ', 0.3)').replace('hsl', 'hsla'));
        gradient.addColorStop(1, node.color.replace(')', ', 0)').replace('hsl', 'hsla'));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = node.color.replace(')', ', 0.6)').replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [nodeCount, connectionOpacity]);

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-40"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}