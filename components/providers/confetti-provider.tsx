"use client"    

import ReactConfetti from "react-confetti";

import { useConfettiStore } from "@/hooks/use-confetti-store";

export const ConfetyProvider = () => {
    const confetti = useConfettiStore();

    if (!confetti.isOpen) {
        return null;
    }
    
    return (
        <>
        <ReactConfetti
            className="z-100 pointer-events-none"
            numberOfPieces={500}
            recycle={false}
            onConfettiComplete={
                () => confetti.onClose()
            }
        />
        </>
    );
    }