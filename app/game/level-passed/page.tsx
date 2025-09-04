"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function LevelPassedPage() {
  const router = useRouter();
  const params = useSearchParams();
  const chapter = params.get('chapter') || 'chapter1';
  const level = params.get('level') || 'level1';
  const hintedNext = params.get('nextLevel');
  const [show, setShow] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(()=>{
    // trigger mount animation
    const t = setTimeout(()=> setShow(true), 50);
    return ()=> clearTimeout(t);
  },[]);

  useEffect(()=>{
    const s = io('http://localhost:3000');
    setSocket(s);
    return ()=> { s.disconnect(); };
  },[]);

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(circle at 50% 40%, #1d1d1d 0%, #090909 70%)',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      justifyContent:'center',
      overflow:'hidden',
      fontFamily:'Inter, Arial, sans-serif',
      position:'relative'
    }}>
      {/* Floating particles */}
      {Array.from({length:28}).map((_,i)=>(
        <span key={i} style={{
          position:'absolute',
          top: Math.random()*100+'%',
            left: Math.random()*100+'%',
          width:6, height:6,
          borderRadius:'50%',
          background: i%3===0? '#ffcc66':'#b80f2c',
          filter:'blur(0.5px)',
          animation:`float ${6+Math.random()*6}s linear ${Math.random()*-20}s infinite`
        }}/>
      ))}
      <style>{`
        @keyframes float { from { transform:translateY(0) scale(1);} to { transform:translateY(-120vh) scale(0.4);} }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08);} }
        @keyframes glow {0%,100%{filter:drop-shadow(0 0 4px #ffcc66);}50%{filter:drop-shadow(0 0 14px #ffcc66);} }
        @keyframes slideIn {from {opacity:0; transform:translateY(40px) scale(.9);} to {opacity:1; transform:translateY(0) scale(1);} }
        @keyframes banner {0%{background-position:0 0;}100%{background-position:400% 0;}}
      `}</style>
      <div style={{
        textAlign:'center',
        animation: show? 'slideIn .9s cubic-bezier(.16,.8,.24,1) forwards':'none',
        maxWidth: '800px',
        padding:'0 24px'
      }}>
        <div style={{
          fontSize: 'clamp(2.5rem, 8vw, 5.3rem)',
          fontWeight:900,
          letterSpacing:'4px',
          lineHeight:1.05,
          background:'linear-gradient(90deg,#ffcc66,#ffe9b3,#ffcc66,#ffd98e)',
          WebkitBackgroundClip:'text',
          color:'transparent',
          animation:'banner 14s linear infinite, glow 2.8s ease-in-out infinite',
          position:'relative'
        }}>
          LEVEL PASSED
        </div>
        <p style={{
          marginTop:24,
          fontSize:'1.15rem',
          color:'#ddd',
          letterSpacing:'.5px'
        }}>
          Great work conquering {chapter.toUpperCase()} / {level.toUpperCase()}! Prepare for the next challenge.
        </p>
        <div style={{display:'flex', gap:16, justifyContent:'center', marginTop:40, flexWrap:'wrap'}}>
          <button
            onClick={()=> {
              let nextLevel = hintedNext || '';
              if (!nextLevel) {
                // Fallback: naive increment only if it matches levelN
                const m = level.match(/level(\d+)/);
                if (m) nextLevel = `level${parseInt(m[1],10)+1}`; else nextLevel = '';
              }
              if (!nextLevel) {
                alert('No further level defined.');
                return;
              }
              const nextPath = `/game/${chapter}/${nextLevel}`;
              if (socket) socket.emit('initLevel', { chapter, level: nextLevel });
              router.push(nextPath);
            }}
            style={btnStyle('#b80f2c','#ffcc66')}
          >
            { hintedNext ? 'Next Level' : 'Continue' }
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg:string, accent:string): React.CSSProperties {
  return {
    background: bg,
    border:'none',
    padding:'14px 30px',
    borderRadius:14,
    cursor:'pointer',
    color: accent,
    fontWeight:700,
    fontSize:'0.95rem',
    letterSpacing:'1px',
    position:'relative',
    boxShadow:'0 6px 18px rgba(0,0,0,0.4)',
    transition:'transform .25s, box-shadow .25s',
  };
}
