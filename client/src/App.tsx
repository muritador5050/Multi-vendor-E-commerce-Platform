import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { List, Link } from '@chakra-ui/react';
import './App.css';

function App() {
  return (
    <div className='App'>
      <Router>
        <List.Root display={'flex'}>
          <List.Item>
            <Link href='/'>Home</Link>
          </List.Item>
          <List.Item>
            <Link href='/blog'>Blog</Link>
          </List.Item>
          <List.Item>
            <Link href='/shop'>Shop</Link>
          </List.Item>
          <List.Item>
            <Link href='/store-manager'>Store Manager</Link>
          </List.Item>
          <List.Item>
            <Link href='/vendor-membership'>Vendor Membership</Link>
          </List.Item>
          <List.Item>
            <Link href='/store-list'>Store List</Link>
          </List.Item>
          <List.Item>
            <Link href='/contact-us'>Contact Us</Link>
          </List.Item>
        </List.Root>
        <Routes>
          <Route path='/' element={<h1>Welcome to the React App</h1>} />
          <Route path='/blog' element={<h1>Blog Page</h1>} />
          <Route path='/shop' element={<h1>Shop Page</h1>} />
          <Route path='*' element={<h1>404 Not Found</h1>} />
        </Routes>
      </Router>
      <footer className='footer'>
        <p>
          Powered by <a href='https://reactjs.org'>React</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
