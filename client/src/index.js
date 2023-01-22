import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Game from './Game';
import Menu from './Menu';

function App() {
  const [page, setPage] = useState("Menu");
  const [username, setUsername] = useState("UnnamedBlob");

  return (
    <React.StrictMode>
      {page === "Menu" ? <Menu setPage={setPage} setUsername={setUsername} /> : <Game setPage={setPage} username={username} />}
    </React.StrictMode>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);