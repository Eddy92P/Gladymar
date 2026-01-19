import { useEffect, useRef } from 'react';
const TIMEOUT = 1000 * 60 * 5;

const useIdleLogout = ({ timeout = TIMEOUT, onLogout }) => {

    const timerRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onLogout();
            }, timeout);
        };

        resetTimer();

        const events = ['mousemove', 'keypress', 'scroll', 'click', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            clearTimeout(timerRef.current);
            events.forEach(event =>
              window.removeEventListener(event, resetTimer)
            );
        };
    }, [timeout, onLogout]);
};

export default useIdleLogout;
