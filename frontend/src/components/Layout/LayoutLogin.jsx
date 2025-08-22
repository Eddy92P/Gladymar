import { useEffect, useState } from 'react';

import classes from './LayoutLogin.module.css';

import Image from 'react-bootstrap/Image';

const getWindowSize = () => {
   const { innerWidth, innerHeight } = window;
   return { innerWidth, innerHeight };
};

const Layout = props => {
   const [windowSize, setWindowSize] = useState(getWindowSize());

   useEffect(() => {
      function handleWindowResize() {
         setWindowSize(getWindowSize());
      }

      window.addEventListener('resize', handleWindowResize);

      return () => {
         window.removeEventListener('resize', handleWindowResize);
      };
   }, []);
   return (
      <div>
         <main
            className={`${classes.main} ${
               windowSize.innerWidth <= 980 && classes.small
            }`}
         >
            {props.children}
         </main>
      </div>
   );
};

export default Layout;
