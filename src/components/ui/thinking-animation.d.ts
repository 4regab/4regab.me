import React from 'react';
interface ThinkingAnimationProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'dots' | 'pulse' | 'brain';
    text?: string;
}
declare const ThinkingAnimation: React.FC<ThinkingAnimationProps>;
export default ThinkingAnimation;
