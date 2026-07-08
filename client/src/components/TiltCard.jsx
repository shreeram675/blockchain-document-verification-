import { motion as Motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

export default function TiltCard({ children, className = '', onClick, delay = 0 }) {
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    const springConfig = { stiffness: 150, damping: 18, mass: 0.6 };
    const rotateX = useSpring(useTransform(y, [0, 1], [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(x, [0, 1], [-7, 7]), springConfig);
    const mx = useTransform(x, (v) => `${v * 100}%`);
    const my = useTransform(y, (v) => `${v * 100}%`);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width);
        y.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    return (
        <div className="tilt-wrap h-full">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
                style={{ rotateX, rotateY, transformPerspective: 1000, '--mx': mx, '--my': my }}
                className={`tilt-card relative h-full ${className}`}
            >
                {children}
                <div className="tilt-shine" />
            </Motion.div>
        </div>
    );
}
