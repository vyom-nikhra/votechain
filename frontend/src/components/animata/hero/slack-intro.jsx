"use client";

import { useEffect, useState, useRef } from "react";
import WaveReveal from "../text/wave-reveal";
import { cn } from "../../../lib/utils";

export function Circle({
  height = "h-8 md:h-16",
  width = "w-8 md:w-16",
  bgColor = "bg-blue-500",
  borderRadius = "rounded-full",
}) {
  return <div className={cn(height, width, borderRadius, bgColor)} />;
}

export function Cylinder({
  text,
  height = "h-8 md:h-16",
  width = "w-24 md:w-48",
  bgColor = "bg-gray-800",
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        height,
        width,
        bgColor,
      )}
    >
      <WaveReveal
        className={cn("min-w-fit px-4 text-xl font-bold text-white md:px-6 md:text-6xl")}
        text={text ?? ""}
        blur={false}
        direction="up"
        delay={200}
        duration="1000ms"
      />
    </div>
  );
}

function LineOne({ className, animationEnd }) {
  return (
    <div
      className={cn(
        className,
        "duration-500",
        animationEnd
          ? "animate-out fade-out slide-out-to-left-full"
          : "animate-in fade-in slide-in-from-right-full",
      )}
    >
      <Circle bgColor="bg-blue-500" borderRadius="rounded-t-full rounded-bl-full" />
      <Circle bgColor="bg-blue-400" />
      <Cylinder bgColor="bg-purple-600" />
      <Cylinder bgColor="bg-blue-500" width="w-56 md:w-[300px]" />
      <Cylinder bgColor="bg-blue-500" />
    </div>
  );
}

function LineTwo({ className, animationEnd }) {
  return (
    <div
      className={cn(
        className,
        "duration-700",
        animationEnd
          ? "animate-out fade-out slide-out-to-right-full"
          : "animate-in fade-in slide-in-from-left-full",
      )}
    >
      <Circle bgColor="bg-blue-500" />
      <Cylinder text="Ready to" width="w-64 md:w-[400px]" bgColor="bg-gray-800" />
      <Circle bgColor="bg-blue-500" borderRadius="rounded-t-full rounded-bl-full" />
      <Circle bgColor="bg-blue-500" />
      <Cylinder bgColor="bg-purple-600" />
    </div>
  );
}

function LineThree({ className, animationEnd }) {
  return (
    <div
      className={cn(
        className,
        "duration-700",
        animationEnd
          ? "animate-out fade-out slide-out-to-left-full"
          : "animate-in fade-in slide-in-from-right-full",
      )}
    >
      <Cylinder bgColor="bg-pink-600" />
      <Circle bgColor="bg-purple-600" borderRadius="rounded-t-full rounded-br-full" />
      <Circle bgColor="bg-pink-600" />
      <Cylinder text="Transform" width="w-64 md:w-[600px]" bgColor="bg-gray-800" />
      <Circle bgColor="bg-purple-600" />
      <Cylinder bgColor="bg-pink-600" />
    </div>
  );
}

function LineFour({ className, animationEnd }) {
  return (
    <div
      className={cn(
        className,
        "duration-700",
        animationEnd
          ? "animate-out fade-out slide-out-to-right-full"
          : "animate-in fade-in slide-in-from-left-full",
      )}
    >
      <Circle bgColor="bg-blue-400" />
      <Cylinder text="Democracy?" width="w-96 md:w-[700px]" bgColor="bg-gray-800" />
      <Circle bgColor="bg-blue-400" borderRadius="rounded-t-full rounded-br-full" />
    </div>
  );
}

function LineFive({ className, animationEnd }) {
  return (
    <div
      className={cn(
        className,
        animationEnd
          ? "animate-out fade-out slide-out-to-left-full"
          : "animate-in fade-in slide-in-from-right-full",
      )}
    >
      <Cylinder bgColor="bg-purple-600" />
      <Cylinder bgColor="bg-blue-500" width="w-32 md:w-[400px]" />
      <Circle bgColor="bg-blue-500" />
      <Cylinder bgColor="bg-purple-600" />
    </div>
  );
}

export default function SlackIntro({ animateOut }) {
  const [animationEnd, setAnimationEnd] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!animateOut || !isVisible) {
      return;
    }

    const timer = setTimeout(() => {
      setAnimationEnd(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [animateOut, isVisible]);

  const common = "flex duration-1000 ease-in-out fill-mode-forwards";

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center justify-center gap-1 overflow-hidden bg-gray-950 py-4 md:gap-3",
      )}
    >
      {isVisible && (
        <>
          <LineOne className={common} animationEnd={animationEnd} />
          <LineTwo className={common} animationEnd={animationEnd} />
          <LineThree className={common} animationEnd={animationEnd} />
          <LineFour className={common} animationEnd={animationEnd} />
          <LineFive className={common} animationEnd={animationEnd} />
        </>
      )}
    </div>
  );
}
