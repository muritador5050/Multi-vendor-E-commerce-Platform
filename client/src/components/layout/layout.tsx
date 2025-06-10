// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import Navbar from './navbar';
// import Footer from './footer';

// function Layout({ children }: { children: React.ReactNode }) {
//   const location = useLocation();
//   const pagesWithoutLayout = ['/account', '/login', '/signup']; // Add your three pages here
//   const shouldHideLayout = pagesWithoutLayout.includes(location.pathname);

//   return (
//     <>
//       {!shouldHideLayout && <Navbar />}
//       {children}
//       {!shouldHideLayout && <Footer />}
//     </>
//   );
// }

// export default Layout;

import { Outlet } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default Layout;
